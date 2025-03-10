/*
  # Add Emergency IDs Schema

  1. New Tables
    - `emergency_ids`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `name` (text)
      - `type` (emergency_id_type)
      - `status` (emergency_id_status)
      - `last_used` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `emergency_contacts`
      - `id` (uuid, primary key)
      - `emergency_id_id` (uuid, references emergency_ids)
      - `name` (text)
      - `relationship` (text)
      - `phone` (text)
      - `email` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `medical_info`
      - `id` (uuid, primary key)
      - `emergency_id_id` (uuid, references emergency_ids)
      - `blood_type` (text)
      - `allergies` (text)
      - `conditions` (text)
      - `medications` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create custom types
CREATE TYPE emergency_id_type AS ENUM ('emergency', 'medical', 'contact');
CREATE TYPE emergency_id_status AS ENUM ('active', 'inactive');

-- Create emergency_ids table
CREATE TABLE emergency_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type emergency_id_type NOT NULL DEFAULT 'emergency',
  status emergency_id_status NOT NULL DEFAULT 'active',
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medical_info table
CREATE TABLE medical_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  blood_type text,
  allergies text,
  conditions text,
  medications text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE emergency_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own emergency IDs"
  ON emergency_ids
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read active emergency IDs"
  ON emergency_ids
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can manage emergency contacts for their IDs"
  ON emergency_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read emergency contacts for active IDs"
  ON emergency_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND status = 'active'
    )
  );

CREATE POLICY "Users can manage medical info for their IDs"
  ON medical_info
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read medical info for active IDs"
  ON medical_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND status = 'active'
    )
  );

-- Create indexes
CREATE INDEX idx_emergency_ids_user_id ON emergency_ids(user_id);
CREATE INDEX idx_emergency_contacts_emergency_id ON emergency_contacts(emergency_id_id);
CREATE INDEX idx_medical_info_emergency_id ON medical_info(emergency_id_id);