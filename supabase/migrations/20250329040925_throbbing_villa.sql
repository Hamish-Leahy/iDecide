/*
  # Add Contacts and Checklist Tables

  1. New Tables
    - `contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `relationship` (text)
      - `notes` (text, optional)
      - `is_deputy` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `digital_checklist`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text)
      - `description` (text)
      - `completed` (boolean)
      - `category` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  relationship text NOT NULL,
  notes text,
  is_deputy boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create digital_checklist table
CREATE TABLE IF NOT EXISTS digital_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  completed boolean DEFAULT false,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_checklist ENABLE ROW LEVEL SECURITY;

-- Create policies for contacts
CREATE POLICY "Users can create their own contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for digital_checklist
CREATE POLICY "Users can create their own checklist items"
  ON digital_checklist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own checklist items"
  ON digital_checklist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own checklist items"
  ON digital_checklist
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checklist items"
  ON digital_checklist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_checklist_updated_at
  BEFORE UPDATE ON digital_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();