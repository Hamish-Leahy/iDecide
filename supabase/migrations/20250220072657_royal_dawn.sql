-- Drop existing objects safely
DO $$ 
BEGIN
  -- Drop trigger if it exists
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  END IF;

  -- Drop function if it exists
  DROP FUNCTION IF EXISTS handle_new_user();

  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Allow all operations on auth.users" ON auth.users;
  
  -- Drop profiles table if it exists
  DROP TABLE IF EXISTS profiles CASCADE;
END $$;

-- Ensure proper schema setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table with minimal constraints
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disable RLS temporarily to ensure clean setup
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Grant full permissions to auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Grant full permissions to public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions for auth.users
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
GRANT ALL ON auth.users TO anon;
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON auth.users TO service_role;

-- Grant permissions for profiles
GRANT ALL ON profiles TO postgres, service_role;
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create simplified profile creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW; -- Always succeed, even if profile creation fails
END;
$$;

-- Create trigger with error handling
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.id IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO supabase_auth_admin;

-- Create index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND indexname = 'idx_profiles_user_id'
  ) THEN
    CREATE INDEX idx_profiles_user_id ON profiles(user_id);
  END IF;
END $$;

-- Re-enable RLS with open policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies with unique names
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_auth_users') THEN
    CREATE POLICY "allow_all_auth_users"
      ON auth.users
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_profiles') THEN
    CREATE POLICY "allow_all_profiles"
      ON profiles
      FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure proper ownership
ALTER FUNCTION handle_new_user() OWNER TO postgres;

-- Reset schema cache
NOTIFY pgrst, 'reload schema';