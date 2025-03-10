-- Create function to delete user data
CREATE OR REPLACE FUNCTION delete_user_data(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete healthcare data
  DELETE FROM healthcare_contacts WHERE user_id = $1;
  DELETE FROM medical_history WHERE user_id = $1;
  DELETE FROM medications WHERE user_id = $1;
  DELETE FROM allergies WHERE user_id = $1;
  
  -- Delete legal documents
  DELETE FROM legal_documents WHERE user_id = $1;
  
  -- Delete emergency data
  DELETE FROM emergency_ids WHERE user_id = $1;
  
  -- Delete profile
  DELETE FROM profiles WHERE user_id = $1;
  
  -- Delete MFA settings
  DELETE FROM user_mfa_settings WHERE user_id = $1;
  DELETE FROM user_otp_codes WHERE user_id = $1;
END;
$$;