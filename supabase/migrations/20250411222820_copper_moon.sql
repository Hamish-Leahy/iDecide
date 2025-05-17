/*
  # Create NDIS Service Providers Table

  1. New Table
    - `ndis_service_providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `registration_number` (text)
      - `contact_name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `services` (text[])
      - `status` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
*/

-- Create ndis_service_providers table
CREATE TABLE IF NOT EXISTS ndis_service_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  registration_number text,
  contact_name text,
  email text,
  phone text,
  address text,
  services text[] NOT NULL,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_provider_status CHECK (status IN ('active', 'inactive'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_service_providers_user_id_idx ON ndis_service_providers(user_id);
CREATE INDEX IF NOT EXISTS ndis_service_providers_status_idx ON ndis_service_providers(status);

-- Enable RLS
ALTER TABLE ndis_service_providers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own service providers"
  ON ndis_service_providers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own service providers"
  ON ndis_service_providers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own service providers"
  ON ndis_service_providers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service providers"
  ON ndis_service_providers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_ndis_service_providers_updated_at
  BEFORE UPDATE ON ndis_service_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();