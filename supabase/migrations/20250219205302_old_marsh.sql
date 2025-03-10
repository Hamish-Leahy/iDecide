-- Drop and recreate auth policies with proper permissions
DO $$ 
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own auth data" ON auth.users;
  DROP POLICY IF EXISTS "Anon can create users" ON auth.users;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Ensure RLS is enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create less restrictive policies for auth.users
CREATE POLICY "Users can view their own auth data"
  ON auth.users
  FOR SELECT
  USING (true);

CREATE POLICY "Anon can create users"
  ON auth.users
  FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT ALL ON auth.users TO anon, authenticated;
GRANT ALL ON auth.users TO service_role;

-- Ensure proper function permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure profiles table permissions
GRANT ALL ON TABLE profiles TO authenticated;
GRANT ALL ON TABLE profiles TO service_role;