-- Reset everything and start fresh
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Grant proper permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE public.profiles (
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

-- Create policies
CREATE POLICY "Enable read access for all users" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for users based on user_id" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create profile handler function
CREATE OR REPLACE FUNCTION public.handle_new_user()
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

-- Create profile creation trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Set proper permissions
ALTER TABLE profiles OWNER TO postgres;
GRANT ALL ON TABLE profiles TO postgres;
GRANT ALL ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.email() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO postgres;

-- Create indexes
CREATE INDEX ON profiles(user_id);

-- Initialize any existing users
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.users.id
);