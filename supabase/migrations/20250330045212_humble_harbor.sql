/*
  # Legal Contacts Schema

  1. New Tables
    - `legal_contacts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `role` (text)
      - `email` (text)
      - `phone` (text, optional)
      - `firm` (text, optional)
      - `notes` (text, optional)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
      - `last_contacted` (timestamp with time zone, optional)
      - `next_review` (timestamp with time zone, optional)
      - `status` (text, default: 'active')
      - `specialties` (text[], optional)
      - `jurisdiction` (text, optional)
      - `license_number` (text, optional)
      - `is_primary` (boolean, default: false)

  2. Security
    - Enable RLS on `legal_contacts` table
    - Add policies for CRUD operations
    - Ensure users can only access their own contacts

  3. Indexes
    - Index on user_id for faster lookups
    - Index on role for filtering
    - Index on email for searching
*/

-- Create legal_contacts table
CREATE TABLE IF NOT EXISTS legal_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL,
  email text NOT NULL,
  phone text,
  firm text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_contacted timestamptz,
  next_review timestamptz,
  status text DEFAULT 'active',
  specialties text[],
  jurisdiction text,
  license_number text,
  is_primary boolean DEFAULT false,

  -- Add constraints
  CONSTRAINT valid_role CHECK (role IN (
    'attorney',
    'accountant',
    'financial_advisor',
    'tax_professional',
    'notary',
    'other'
  )),
  CONSTRAINT valid_status CHECK (status IN (
    'active',
    'inactive',
    'archived'
  )),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create indexes
CREATE INDEX IF NOT EXISTS legal_contacts_user_id_idx ON legal_contacts(user_id);
CREATE INDEX IF NOT EXISTS legal_contacts_role_idx ON legal_contacts(role);
CREATE INDEX IF NOT EXISTS legal_contacts_email_idx ON legal_contacts(email);

-- Enable RLS
ALTER TABLE legal_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can create their own legal contacts"
  ON legal_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own legal contacts"
  ON legal_contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal contacts"
  ON legal_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal contacts"
  ON legal_contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_legal_contacts_updated_at
  BEFORE UPDATE ON legal_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to ensure only one primary contact per role per user
CREATE OR REPLACE FUNCTION check_primary_contact()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE legal_contacts
    SET is_primary = false
    WHERE user_id = NEW.user_id
      AND role = NEW.role
      AND id != NEW.id
      AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for primary contact check
CREATE TRIGGER ensure_single_primary_contact
  BEFORE INSERT OR UPDATE ON legal_contacts
  FOR EACH ROW
  EXECUTE FUNCTION check_primary_contact();

-- Add helpful comments
COMMENT ON TABLE legal_contacts IS 'Stores legal contacts and representatives for users';
COMMENT ON COLUMN legal_contacts.role IS 'Type of legal professional (attorney, accountant, etc.)';
COMMENT ON COLUMN legal_contacts.is_primary IS 'Indicates if this is the primary contact for this role';
COMMENT ON COLUMN legal_contacts.specialties IS 'Areas of expertise or specialization';
COMMENT ON COLUMN legal_contacts.jurisdiction IS 'Jurisdiction where the professional is licensed to practice';