-- Drop existing tables and triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for user_id
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Create function to handle new user profiles
CREATE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Ensure auth.users has proper permissions
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for auth.users
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own auth data" ON auth.users;
  CREATE POLICY "Users can view their own auth data"
    ON auth.users
    FOR SELECT
    USING (auth.uid() = id);
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- Create indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Initialize profiles for existing users
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.user_id = auth.users.id
);