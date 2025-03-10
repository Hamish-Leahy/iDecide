-- Create MFA settings table
CREATE TABLE IF NOT EXISTS user_mfa_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  totp_enabled boolean DEFAULT false,
  totp_secret text,
  totp_verified boolean DEFAULT false,
  backup_codes text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create OTP codes table with 5-minute expiry
CREATE TABLE IF NOT EXISTS user_otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  purpose text NOT NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes'),
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, code)
);

-- Enable RLS
ALTER TABLE user_mfa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_otp_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own MFA settings"
  ON user_mfa_settings
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own OTP codes"
  ON user_otp_codes
  FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_mfa_settings_user_id ON user_mfa_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_otp_codes_user_id ON user_otp_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_otp_codes_expires_at ON user_otp_codes(expires_at);

-- Create cleanup function for expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_otp_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM user_otp_codes WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically cleanup expired codes
CREATE OR REPLACE FUNCTION trigger_cleanup_expired_otp_codes()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_expired_otp_codes();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_expired_otp_codes_trigger
  AFTER INSERT ON user_otp_codes
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_cleanup_expired_otp_codes();

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
CREATE TRIGGER initialize_user_mfa_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_mfa_settings();

-- Initialize MFA settings for existing users
INSERT INTO user_mfa_settings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Grant permissions
GRANT ALL ON TABLE user_mfa_settings TO authenticated;
GRANT ALL ON TABLE user_otp_codes TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;