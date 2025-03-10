-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Access emergency IDs" ON emergency_ids;
DROP POLICY IF EXISTS "Access emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Access medical info" ON medical_info;
DROP POLICY IF EXISTS "Owners can manage emergency IDs" ON emergency_ids;
DROP POLICY IF EXISTS "Owners can manage emergency contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Owners can manage medical info" ON medical_info;

-- Create base read policies
CREATE POLICY "Read emergency IDs"
  ON emergency_ids
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Read emergency contacts"
  ON emergency_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_contacts.emergency_id_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Read medical info"
  ON medical_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = medical_info.emergency_id_id
      AND user_id = auth.uid()
    )
  );

-- Create write policies
CREATE POLICY "Manage emergency IDs"
  ON emergency_ids
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Manage emergency contacts"
  ON emergency_contacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_contacts.emergency_id_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = emergency_contacts.emergency_id_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage medical info"
  ON medical_info
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = medical_info.emergency_id_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM emergency_ids
      WHERE id = medical_info.emergency_id_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_emergency_ids_user_id ON emergency_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_emergency_id ON emergency_contacts(emergency_id_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_emergency_id ON medical_info(emergency_id_id);