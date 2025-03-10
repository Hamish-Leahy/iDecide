-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Emergency access to IDs via token" ON emergency_ids;
DROP POLICY IF EXISTS "Emergency access to contacts via token" ON emergency_contacts;
DROP POLICY IF EXISTS "Emergency access to medical info via token" ON medical_info;
DROP POLICY IF EXISTS "Users can read their own emergency IDs" ON emergency_ids;
DROP POLICY IF EXISTS "Users can read emergency contacts for their own IDs" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can read medical info for their own IDs" ON medical_info;

-- Create simplified base access policies
CREATE POLICY "Access emergency IDs"
  ON emergency_ids
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    id IN (
      SELECT emergency_id 
      FROM emergency_access_tokens 
      WHERE token = COALESCE(current_setting('app.emergency_token', true), '')
      AND expires_at > now()
      AND NOT revoked
    )
  );

CREATE POLICY "Access emergency contacts"
  ON emergency_contacts
  FOR SELECT
  USING (
    emergency_id_id IN (
      SELECT id FROM emergency_ids WHERE user_id = auth.uid()
      UNION
      SELECT emergency_id 
      FROM emergency_access_tokens 
      WHERE token = COALESCE(current_setting('app.emergency_token', true), '')
      AND expires_at > now()
      AND NOT revoked
    )
  );

CREATE POLICY "Access medical info"
  ON medical_info
  FOR SELECT
  USING (
    emergency_id_id IN (
      SELECT id FROM emergency_ids WHERE user_id = auth.uid()
      UNION
      SELECT emergency_id 
      FROM emergency_access_tokens 
      WHERE token = COALESCE(current_setting('app.emergency_token', true), '')
      AND expires_at > now()
      AND NOT revoked
    )
  );

-- Create write policies for owners
CREATE POLICY "Owners can manage emergency IDs"
  ON emergency_ids
  FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Owners can manage emergency contacts"
  ON emergency_contacts
  FOR ALL
  USING (
    emergency_id_id IN (
      SELECT id FROM emergency_ids WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage medical info"
  ON medical_info
  FOR ALL
  USING (
    emergency_id_id IN (
      SELECT id FROM emergency_ids WHERE user_id = auth.uid()
    )
  );

-- Create regular indexes without predicates
CREATE INDEX IF NOT EXISTS idx_emergency_ids_user_id ON emergency_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_emergency_id ON emergency_contacts(emergency_id_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_emergency_id ON medical_info(emergency_id_id);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_token ON emergency_access_tokens(token);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_expires_at ON emergency_access_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_emergency_tokens_revoked ON emergency_access_tokens(revoked);