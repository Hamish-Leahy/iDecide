-- Create function to initialize MFA settings for new users
CREATE OR REPLACE FUNCTION initialize_user_mfa_settings()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_mfa_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically initialize MFA settings for new users
DROP TRIGGER IF EXISTS initialize_user_mfa_settings_trigger ON auth.users;
CREATE TRIGGER initialize_user_mfa_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_mfa_settings();

-- Initialize MFA settings for existing users
INSERT INTO user_mfa_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;