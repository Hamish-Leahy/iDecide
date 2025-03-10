-- Drop all existing policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own auth data" ON auth.users;
  DROP POLICY IF EXISTS "Anon can create users" ON auth.users;
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Ensure RLS is enabled but with completely open policies for auth
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create a completely open policy for auth.users
CREATE POLICY "Open policy for auth.users"
  ON auth.users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant ALL permissions on auth schema and its objects
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Ensure auth.users has proper ownership
ALTER TABLE auth.users OWNER TO supabase_auth_admin;

-- Grant specific permissions to the auth user table
GRANT ALL ON auth.users TO anon;
GRANT ALL ON auth.users TO authenticated;
GRANT ALL ON auth.users TO service_role;

-- Ensure proper function permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO anon, authenticated;

-- Reset cache for auth schema
NOTIFY pgrst, 'reload schema';