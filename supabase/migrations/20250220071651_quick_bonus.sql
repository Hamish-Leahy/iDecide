-- Reset everything first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles;

-- Ensure proper schema setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create profile creation function with improved error handling
CREATE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.id IS NULL THEN
    RAISE EXCEPTION 'Cannot create user with null id';
  END IF;

  BEGIN
    INSERT INTO public.profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't prevent user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Set ownership
ALTER TABLE profiles OWNER TO postgres;
ALTER FUNCTION handle_new_user() OWNER TO postgres;

-- Grant schema permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON TABLE auth.users TO postgres, service_role;
GRANT ALL ON TABLE auth.users TO anon; -- Critical for signup
GRANT SELECT, UPDATE ON TABLE auth.users TO authenticated;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO anon, authenticated;

-- Create index
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Initialize profiles for existing users
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.users.id
);