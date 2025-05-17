/*
  # Create NDIS Reports Table

  1. New Table
    - `ndis_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `participant_id` (uuid, references ndis_participants)
      - `title` (text)
      - `type` (text)
      - `date` (date)
      - `content` (text)
      - `status` (text)
      - `document_url` (text)
      - `created_by` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
*/

-- Create ndis_reports table
CREATE TABLE IF NOT EXISTS ndis_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES ndis_participants(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  date date NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'draft',
  document_url text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_report_type CHECK (type IN ('progress', 'review', 'financial', 'provider', 'other')),
  CONSTRAINT valid_report_status CHECK (status IN ('draft', 'submitted', 'approved', 'rejected'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_reports_user_id_idx ON ndis_reports(user_id);
CREATE INDEX IF NOT EXISTS ndis_reports_participant_id_idx ON ndis_reports(participant_id);
CREATE INDEX IF NOT EXISTS ndis_reports_type_idx ON ndis_reports(type);
CREATE INDEX IF NOT EXISTS ndis_reports_status_idx ON ndis_reports(status);
CREATE INDEX IF NOT EXISTS ndis_reports_date_idx ON ndis_reports(date);

-- Enable RLS
ALTER TABLE ndis_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create reports for their participants"
  ON ndis_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM ndis_participants
      WHERE ndis_participants.id = participant_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their reports"
  ON ndis_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their reports"
  ON ndis_reports
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their reports"
  ON ndis_reports
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_ndis_reports_updated_at
  BEFORE UPDATE ON ndis_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();