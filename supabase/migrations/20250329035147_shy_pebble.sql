/*
  # Add digital assets table

  1. New Tables
    - `digital_assets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `type` (text)
      - `url` (text)
      - `username` (text)
      - `encrypted_password` (text)
      - `notes` (text)
      - `instructions` (text)
      - `deputies` (text[])
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `digital_assets` table
    - Add policies for authenticated users to:
      - Read their own assets
      - Create new assets
      - Update their own assets
      - Delete their own assets
*/

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

ALTER TABLE digital_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own digital assets"
  ON digital_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create digital assets"
  ON digital_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own digital assets"
  ON digital_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own digital assets"
  ON digital_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_digital_assets_updated_at
    BEFORE UPDATE ON digital_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();