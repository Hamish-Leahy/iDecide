-- Create emergency access tokens table first
CREATE TABLE emergency_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  revoked boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS on emergency access tokens
ALTER TABLE emergency_access_tokens ENABLE ROW LEVEL SECURITY;

-- Create policy for emergency access tokens
CREATE POLICY "Users can manage their own emergency access tokens"
  ON emergency_access_tokens
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id
      AND user_id = auth.uid()
    )
  );

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read active emergency IDs" ON emergency_ids;
DROP POLICY IF EXISTS "Anyone can read emergency contacts for active IDs" ON emergency_contacts;
DROP POLICY IF EXISTS "Anyone can read medical info for active IDs" ON medical_info;

-- Create new, more restrictive policies
CREATE POLICY "Users can read their own emergency IDs"
  ON emergency_ids
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read emergency contacts for their own IDs"
  ON emergency_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read medical info for their own IDs"
  ON medical_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_id_id
      AND user_id = auth.uid()
    )
  );

-- Create specific policies for emergency access
CREATE POLICY "Emergency access to IDs via token"
  ON emergency_ids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_access_tokens
      WHERE emergency_id = emergency_ids.id
      AND token = current_setting('app.emergency_token', true)
      AND expires_at > now()
      AND NOT revoked
    )
  );

CREATE POLICY "Emergency access to contacts via token"
  ON emergency_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_access_tokens eat
      JOIN emergency_ids ei ON eat.emergency_id = ei.id
      WHERE ei.id = emergency_contacts.emergency_id_id
      AND eat.token = current_setting('app.emergency_token', true)
      AND eat.expires_at > now()
      AND NOT eat.revoked
    )
  );

CREATE POLICY "Emergency access to medical info via token"
  ON medical_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_access_tokens eat
      JOIN emergency_ids ei ON eat.emergency_id = ei.id
      WHERE ei.id = medical_info.emergency_id_id
      AND eat.token = current_setting('app.emergency_token', true)
      AND eat.expires_at > now()
      AND NOT eat.revoked
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_emergency_access_tokens_emergency_id ON emergency_access_tokens(emergency_id);
CREATE INDEX idx_emergency_access_tokens_token ON emergency_access_tokens(token);
CREATE INDEX idx_emergency_access_tokens_expires_at ON emergency_access_tokens(expires_at);