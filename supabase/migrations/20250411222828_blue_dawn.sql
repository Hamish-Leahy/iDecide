/*
  # Create NDIS Service Agreements Table

  1. New Table
    - `ndis_service_agreements`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, references ndis_participants)
      - `provider_id` (uuid, references ndis_service_providers)
      - `plan_id` (uuid, references ndis_plans)
      - `start_date` (date)
      - `end_date` (date)
      - `total_amount` (decimal)
      - `services` (text[])
      - `status` (text)
      - `signed_date` (date)
      - `signed_by` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
*/

-- Create ndis_service_agreements table
CREATE TABLE IF NOT EXISTS ndis_service_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES ndis_participants(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES ndis_service_providers(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES ndis_plans(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  total_amount decimal NOT NULL,
  services text[] NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  signed_date date,
  signed_by text,
  notes text,
  document_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_agreement_status CHECK (status IN ('draft', 'active', 'expired', 'cancelled')),
  CONSTRAINT positive_agreement_amount CHECK (total_amount >= 0),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_service_agreements_participant_id_idx ON ndis_service_agreements(participant_id);
CREATE INDEX IF NOT EXISTS ndis_service_agreements_provider_id_idx ON ndis_service_agreements(provider_id);
CREATE INDEX IF NOT EXISTS ndis_service_agreements_plan_id_idx ON ndis_service_agreements(plan_id);
CREATE INDEX IF NOT EXISTS ndis_service_agreements_status_idx ON ndis_service_agreements(status);

-- Enable RLS
ALTER TABLE ndis_service_agreements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create service agreements for their participants"
  ON ndis_service_agreements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view service agreements for their participants"
  ON ndis_service_agreements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update service agreements for their participants"
  ON ndis_service_agreements
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

CREATE POLICY "Users can delete service agreements for their participants"
  ON ndis_service_agreements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_ndis_service_agreements_updated_at
  BEFORE UPDATE ON ndis_service_agreements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();