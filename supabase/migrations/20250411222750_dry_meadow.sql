/*
  # Create NDIS Participants Table

  1. New Table
    - `ndis_participants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `ndis_number` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `date_of_birth` (date)
      - `status` (text)
      - `support_coordinator` (text)
      - `notes` (text)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
    - Add validation constraints
*/

-- Create ndis_participants table
CREATE TABLE IF NOT EXISTS ndis_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  ndis_number text NOT NULL,
  email text,
  phone text,
  address text,
  date_of_birth date,
  status text NOT NULL,
  support_coordinator text,
  notes text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_participant_status CHECK (status IN ('active', 'inactive', 'pending'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_participants_user_id_idx ON ndis_participants(user_id);
CREATE INDEX IF NOT EXISTS ndis_participants_ndis_number_idx ON ndis_participants(ndis_number);
CREATE INDEX IF NOT EXISTS ndis_participants_status_idx ON ndis_participants(status);

-- Enable RLS
ALTER TABLE ndis_participants ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own participants"
  ON ndis_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own participants"
  ON ndis_participants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own participants"
  ON ndis_participants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own participants"
  ON ndis_participants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_ndis_participants_updated_at
  BEFORE UPDATE ON ndis_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();