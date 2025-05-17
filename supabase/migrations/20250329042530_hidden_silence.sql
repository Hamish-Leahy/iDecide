/*
  # Add contacts and digital checklist tables

  1. New Tables
    - contacts: Store trusted contacts and deputies
    - digital_checklist: Track digital estate planning progress

  2. Security
    - Enable RLS on both tables
    - Add policies with existence checks
    - Add updated_at triggers
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

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Contacts policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Users can create their own contacts'
  ) THEN
    CREATE POLICY "Users can create their own contacts"
      ON contacts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Users can view their own contacts'
  ) THEN
    CREATE POLICY "Users can view their own contacts"
      ON contacts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Users can update their own contacts'
  ) THEN
    CREATE POLICY "Users can update their own contacts"
      ON contacts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'contacts' 
    AND policyname = 'Users can delete their own contacts'
  ) THEN
    CREATE POLICY "Users can delete their own contacts"
      ON contacts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Digital checklist policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_checklist' 
    AND policyname = 'Users can create their own checklist items'
  ) THEN
    CREATE POLICY "Users can create their own checklist items"
      ON digital_checklist
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_checklist' 
    AND policyname = 'Users can view their own checklist items'
  ) THEN
    CREATE POLICY "Users can view their own checklist items"
      ON digital_checklist
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_checklist' 
    AND policyname = 'Users can update their own checklist items'
  ) THEN
    CREATE POLICY "Users can update their own checklist items"
      ON digital_checklist
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'digital_checklist' 
    AND policyname = 'Users can delete their own checklist items'
  ) THEN
    CREATE POLICY "Users can delete their own checklist items"
      ON digital_checklist
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_digital_checklist_updated_at ON digital_checklist;

-- Create updated_at triggers
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_digital_checklist_updated_at
  BEFORE UPDATE ON digital_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();