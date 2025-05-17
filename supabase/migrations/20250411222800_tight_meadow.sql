/*
  # Create NDIS Plans Table

  1. New Table
    - `ndis_plans`
      - `id` (uuid, primary key)
      - `participant_id` (uuid, references ndis_participants)
      - `plan_number` (text)
      - `plan_start_date` (date)
      - `plan_end_date` (date)
      - `plan_manager` (text)
      - `total_funding` (decimal)
      - `status` (text)
      - `review_date` (date)
      - `goals` (text[])
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
    - Add validation constraints
*/

-- Create ndis_plans table
CREATE TABLE IF NOT EXISTS ndis_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid REFERENCES ndis_participants(id) ON DELETE CASCADE,
  plan_number text NOT NULL,
  plan_start_date date NOT NULL,
  plan_end_date date NOT NULL,
  plan_manager text NOT NULL,
  total_funding decimal NOT NULL,
  status text NOT NULL,
  review_date date,
  goals text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_plan_manager CHECK (plan_manager IN ('agency', 'plan_managed', 'self_managed')),
  CONSTRAINT valid_plan_status CHECK (status IN ('active', 'pending', 'review', 'expired'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_plans_participant_id_idx ON ndis_plans(participant_id);
CREATE INDEX IF NOT EXISTS ndis_plans_status_idx ON ndis_plans(status);
CREATE INDEX IF NOT EXISTS ndis_plans_plan_end_date_idx ON ndis_plans(plan_end_date);

-- Enable RLS
ALTER TABLE ndis_plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create plans for their participants"
  ON ndis_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view plans for their participants"
  ON ndis_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update plans for their participants"
  ON ndis_plans
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

CREATE POLICY "Users can delete plans for their participants"
  ON ndis_plans
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
CREATE TRIGGER update_ndis_plans_updated_at
  BEFORE UPDATE ON ndis_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();