/*
  # Create health management tables

  1. New Tables
    - health_providers
    - health_appointments
    - medications
    - medical_records
    - immunizations
    - emergency_contacts

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add appropriate indexes

  3. Changes
    - Add triggers for updated_at columns
*/

-- Create health_providers table
CREATE TABLE IF NOT EXISTS health_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text NOT NULL,
  practice_name text,
  address text,
  phone text,
  email text,
  notes text,
  is_primary boolean DEFAULT false,
  last_visit timestamptz,
  next_visit timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_specialty CHECK (specialty IN (
    'primary_care',
    'specialist',
    'dentist',
    'optometrist',
    'mental_health',
    'physical_therapy',
    'other'
  ))
);

-- Create health_appointments table
CREATE TABLE IF NOT EXISTS health_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES health_providers(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  type text NOT NULL,
  location text,
  notes text,
  status text DEFAULT 'scheduled',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_appointment_type CHECK (type IN (
    'checkup',
    'follow_up',
    'specialist',
    'dental',
    'vision',
    'therapy',
    'other'
  )),
  CONSTRAINT valid_appointment_status CHECK (status IN (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
  ))
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  start_date date,
  end_date date,
  prescribing_provider uuid REFERENCES health_providers(id) ON DELETE SET NULL,
  pharmacy text,
  refills_remaining integer,
  next_refill_date date,
  side_effects text,
  notes text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_medication_status CHECK (status IN (
    'active',
    'discontinued',
    'completed'
  ))
);

-- Create medical_records table
CREATE TABLE IF NOT EXISTS medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  type text NOT NULL,
  provider_id uuid REFERENCES health_providers(id) ON DELETE SET NULL,
  diagnosis text,
  treatment text,
  medications text[],
  test_results jsonb,
  notes text,
  attachments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_record_type CHECK (type IN (
    'visit',
    'test',
    'procedure',
    'vaccination',
    'diagnosis',
    'other'
  ))
);

-- Create immunizations table
CREATE TABLE IF NOT EXISTS immunizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_administered date NOT NULL,
  provider_id uuid REFERENCES health_providers(id) ON DELETE SET NULL,
  lot_number text,
  manufacturer text,
  next_dose_due date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  alternate_phone text,
  email text,
  address text,
  notes text,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS health_providers_user_id_idx ON health_providers(user_id);
CREATE INDEX IF NOT EXISTS health_appointments_user_id_idx ON health_appointments(user_id);
CREATE INDEX IF NOT EXISTS health_appointments_date_idx ON health_appointments(date);
CREATE INDEX IF NOT EXISTS medications_user_id_idx ON medications(user_id);
CREATE INDEX IF NOT EXISTS medical_records_user_id_idx ON medical_records(user_id);
CREATE INDEX IF NOT EXISTS immunizations_user_id_idx ON immunizations(user_id);
CREATE INDEX IF NOT EXISTS emergency_contacts_user_id_idx ON emergency_contacts(user_id);

-- Enable RLS
ALTER TABLE health_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE immunizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_providers
CREATE POLICY "Users can create their own health providers"
  ON health_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health providers"
  ON health_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health providers"
  ON health_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own health providers"
  ON health_providers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for health_appointments
CREATE POLICY "Users can create their own appointments"
  ON health_appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own appointments"
  ON health_appointments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own appointments"
  ON health_appointments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appointments"
  ON health_appointments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for medications
CREATE POLICY "Users can create their own medications"
  ON medications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own medications"
  ON medications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for medical_records
CREATE POLICY "Users can create their own medical records"
  ON medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own medical records"
  ON medical_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records"
  ON medical_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records"
  ON medical_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for immunizations
CREATE POLICY "Users can create their own immunizations"
  ON immunizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own immunizations"
  ON immunizations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own immunizations"
  ON immunizations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own immunizations"
  ON immunizations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for emergency_contacts
CREATE POLICY "Users can create their own emergency contacts"
  ON emergency_contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own emergency contacts"
  ON emergency_contacts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
  ON emergency_contacts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own emergency contacts"
  ON emergency_contacts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_health_providers_updated_at
  BEFORE UPDATE ON health_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_appointments_updated_at
  BEFORE UPDATE ON health_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_immunizations_updated_at
  BEFORE UPDATE ON immunizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE health_providers IS 'Stores healthcare providers and their information';
COMMENT ON TABLE health_appointments IS 'Stores medical appointments and visits';
COMMENT ON TABLE medications IS 'Stores medication information and schedules';
COMMENT ON TABLE medical_records IS 'Stores medical history and records';
COMMENT ON TABLE immunizations IS 'Stores vaccination records';
COMMENT ON TABLE emergency_contacts IS 'Stores emergency contact information';