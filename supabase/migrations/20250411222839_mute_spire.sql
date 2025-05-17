/*
  # Create NDIS Support Coordination Tables

  1. New Tables
    - `ndis_support_coordinators`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `organization` (text)
      - `email` (text)
      - `phone` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `ndis_appointments`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, references ndis_participants)
      - `coordinator_id` (uuid, references ndis_support_coordinators)
      - `date` (timestamptz)
      - `title` (text)
      - `location` (text)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
*/

-- Create ndis_support_coordinators table
CREATE TABLE IF NOT EXISTS ndis_support_coordinators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  organization text NOT NULL,
  email text,
  phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ndis_appointments table
CREATE TABLE IF NOT EXISTS ndis_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES ndis_participants(id) ON DELETE CASCADE,
  coordinator_id uuid REFERENCES ndis_support_coordinators(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  title text NOT NULL,
  location text,
  notes text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_appointment_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_support_coordinators_user_id_idx ON ndis_support_coordinators(user_id);
CREATE INDEX IF NOT EXISTS ndis_appointments_participant_id_idx ON ndis_appointments(participant_id);
CREATE INDEX IF NOT EXISTS ndis_appointments_coordinator_id_idx ON ndis_appointments(coordinator_id);
CREATE INDEX IF NOT EXISTS ndis_appointments_date_idx ON ndis_appointments(date);
CREATE INDEX IF NOT EXISTS ndis_appointments_status_idx ON ndis_appointments(status);

-- Enable RLS
ALTER TABLE ndis_support_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndis_appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for ndis_support_coordinators
CREATE POLICY "Users can create their own support coordinators"
  ON ndis_support_coordinators
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own support coordinators"
  ON ndis_support_coordinators
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own support coordinators"
  ON ndis_support_coordinators
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own support coordinators"
  ON ndis_support_coordinators
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for ndis_appointments
CREATE POLICY "Users can create appointments for their participants"
  ON ndis_appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view appointments for their participants"
  ON ndis_appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments for their participants"
  ON ndis_appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments for their participants"
  ON ndis_appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_ndis_support_coordinators_updated_at
  BEFORE UPDATE ON ndis_support_coordinators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ndis_appointments_updated_at
  BEFORE UPDATE ON ndis_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();