-- Ensure proper permissions on auth schema
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA auth TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO postgres, service_role;

-- Grant specific permissions to authenticated and anonymous users
GRANT SELECT ON auth.users TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Ensure proper permissions for auth functions
DO $$ 
BEGIN
  -- Ensure authenticated users can access necessary functions
  GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION auth.role() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;
EXCEPTION
  WHEN undefined_function THEN null;
END $$;

-- Ensure RLS is enabled on auth.users
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Recreate auth.users policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own auth data" ON auth.users;
  
  CREATE POLICY "Users can view their own auth data"
    ON auth.users
    FOR SELECT
    USING (auth.uid() = id);
    
  -- Add policy for registration
  DROP POLICY IF EXISTS "Anon can create users" ON auth.users;
  CREATE POLICY "Anon can create users"
    ON auth.users
    FOR INSERT
    WITH CHECK (role = 'authenticated');
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Ensure proper table ownership
ALTER TABLE auth.users OWNER TO supabase_auth_admin;
ALTER TABLE profiles OWNER TO postgres;

-- Ensure proper schema permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Recreate handle_new_user function with proper permissions
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

-- Ensure the function has proper ownership
ALTER FUNCTION handle_new_user() OWNER TO postgres;

-- Recreate the trigger with proper permissions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Grant execute permission on the trigger function
GRANT EXECUTE ON FUNCTION handle_new_user() TO supabase_auth_admin;

-- Ensure proper permissions for profiles table
GRANT ALL ON TABLE profiles TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON TABLE profiles TO authenticated;