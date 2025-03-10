-- Drop problematic policies
DROP POLICY IF EXISTS "Emergency access to IDs via token" ON emergency_ids;
DROP POLICY IF EXISTS "Emergency access to contacts via token" ON emergency_contacts;
DROP POLICY IF EXISTS "Emergency access to medical info via token" ON medical_info;

-- Create new policies with simplified token validation
CREATE POLICY "Emergency access to IDs via token"
  ON emergency_ids
  FOR SELECT
  USING (
    COALESCE(current_setting('app.emergency_token', true), '') IN (
      SELECT token 
      FROM emergency_access_tokens 
      WHERE emergency_id = emergency_ids.id
      AND expires_at > now()
      AND NOT revoked
    )
    OR auth.uid() = user_id
  );

CREATE POLICY "Emergency access to contacts via token"
  ON emergency_contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM emergency_ids ei
      WHERE ei.id = emergency_contacts.emergency_id_id
      AND (
        ei.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 
          FROM emergency_access_tokens eat 
          WHERE eat.emergency_id = ei.id
          AND eat.token = COALESCE(current_setting('app.emergency_token', true), '')
          AND eat.expires_at > now()
          AND NOT eat.revoked
        )
      )
    )
  );

CREATE POLICY "Emergency access to medical info via token"
  ON medical_info
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM emergency_ids ei
      WHERE ei.id = medical_info.emergency_id_id
      AND (
        ei.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 
          FROM emergency_access_tokens eat 
          WHERE eat.emergency_id = ei.id
          AND eat.token = COALESCE(current_setting('app.emergency_token', true), '')
          AND eat.expires_at > now()
          AND NOT eat.revoked
        )
      )
    )
  );