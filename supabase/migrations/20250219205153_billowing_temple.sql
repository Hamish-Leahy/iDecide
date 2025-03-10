-- Drop all existing auth-related triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate profiles table with proper constraints
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id)
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user profiles with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Set proper ownership and permissions for the function
ALTER FUNCTION handle_new_user() OWNER TO postgres;
GRANT EXECUTE ON FUNCTION handle_new_user() TO supabase_auth_admin;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure proper table ownership
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
ALTER TABLE profiles OWNER TO postgres;

-- Ensure RLS is enabled on auth.users with proper policies
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policies for auth.users
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own auth data" ON auth.users;
  DROP POLICY IF EXISTS "Anon can create users" ON auth.users;
  
  -- Create policies
  CREATE POLICY "Users can view their own auth data"
    ON auth.users
    FOR SELECT
    USING (auth.uid() = id);
    
  -- Allow anonymous users to create accounts
  CREATE POLICY "Anon can create users"
    ON auth.users
    FOR INSERT
    WITH CHECK (true);
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Grant proper permissions
DO $$ 
BEGIN
  -- Grant schema permissions
  GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
  
  -- Grant table permissions
  GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
  GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;
  
  -- Grant specific permissions to authenticated and anonymous users
  GRANT SELECT ON auth.users TO authenticated, anon;
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
  GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
  
  -- Grant function permissions
  GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION auth.role() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;
EXCEPTION
  WHEN undefined_function THEN null;
END $$;

-- Grant proper permissions for profiles table
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;

-- Create index for better performance
DROP INDEX IF EXISTS idx_profiles_user_id;
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Initialize profiles for existing users
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.users.id
);