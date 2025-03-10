/*
  # Emergency Information System Tables

  1. New Tables
    - `emergency_ids`
      - Stores emergency identification information
      - Links to contacts and medical info
    - `emergency_contacts`
      - Emergency contact information
    - `medical_info`
      - Medical information and history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access to information owners
*/

-- Emergency IDs Table
CREATE TABLE IF NOT EXISTS emergency_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'active',
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Emergency Contacts Table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Medical Information Table
CREATE TABLE IF NOT EXISTS medical_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  blood_type text,
  allergies text,
  conditions text,
  medications text,
  medical_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE emergency_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_info ENABLE ROW LEVEL SECURITY;

-- Policies for emergency_ids
CREATE POLICY "Users can manage their emergency IDs"
  ON emergency_ids
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for emergency_contacts
CREATE POLICY "Users can manage their emergency contacts"
  ON emergency_contacts
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM emergency_ids
    WHERE emergency_ids.id = emergency_contacts.emergency_id_id
    AND emergency_ids.user_id = auth.uid()
  ));

-- Policies for medical_info
CREATE POLICY "Users can manage their medical info"
  ON medical_info
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM emergency_ids
    WHERE emergency_ids.id = medical_info.emergency_id_id
    AND emergency_ids.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_emergency_ids_user_id ON emergency_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_emergency_id ON emergency_contacts(emergency_id_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_emergency_id ON medical_info(emergency_id_id);