/*
  # Add digital assets table if not exists

  1. Changes
    - Create digital_assets table if it doesn't exist
    - Add policies if they don't exist
    - Add trigger for updated_at
*/

-- Create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS digital_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  url text,
  username text,
  encrypted_password text,
  notes text,
  instructions text,
  deputies text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS if not already enabled
ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_assets' 
    AND policyname = 'Users can read own digital assets'
  ) THEN
    CREATE POLICY "Users can read own digital assets"
      ON digital_assets
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_assets' 
    AND policyname = 'Users can create digital assets'
  ) THEN
    CREATE POLICY "Users can create digital assets"
      ON digital_assets
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_assets' 
    AND policyname = 'Users can update own digital assets'
  ) THEN
    CREATE POLICY "Users can update own digital assets"
      ON digital_assets
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_assets' 
    AND policyname = 'Users can delete own digital assets'
  ) THEN
    CREATE POLICY "Users can delete own digital assets"
      ON digital_assets
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace the updated_at function and trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_digital_assets_updated_at ON digital_assets;
CREATE TRIGGER update_digital_assets_updated_at
    BEFORE UPDATE ON digital_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();