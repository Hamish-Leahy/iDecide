-- Create custom types
CREATE TYPE contact_type AS ENUM ('primary_care', 'healthcare_agent', 'emergency');
CREATE TYPE condition_status AS ENUM ('active', 'resolved', 'managed');
CREATE TYPE allergy_severity AS ENUM ('mild', 'moderate', 'severe');

-- Create healthcare contacts table
CREATE TABLE healthcare_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type contact_type NOT NULL,
  name text NOT NULL,
  relationship text,
  specialty text,
  organization text,
  phone text NOT NULL,
  email text,
  address text,
  notes text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add encryption for sensitive data
  encrypted_data jsonb DEFAULT '{}'
);

-- Create medical history table
CREATE TABLE medical_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  condition text NOT NULL,
  diagnosis_date date,
  treating_physician_id uuid REFERENCES healthcare_contacts(id),
  status condition_status NOT NULL DEFAULT 'active',
  treatment_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add encryption for sensitive data
  encrypted_data jsonb DEFAULT '{}'
);

-- Create medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  prescribing_physician_id uuid REFERENCES healthcare_contacts(id),
  start_date date NOT NULL,
  end_date date,
  purpose text,
  side_effects text,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add encryption for sensitive data
  encrypted_data jsonb DEFAULT '{}'
);

-- Create allergies table
CREATE TABLE allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  allergen text NOT NULL,
  reaction text NOT NULL,
  severity allergy_severity NOT NULL,
  diagnosis_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Add encryption for sensitive data
  encrypted_data jsonb DEFAULT '{}'
);

-- Enable Row Level Security
ALTER TABLE healthcare_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;

-- Create policies for healthcare_contacts
CREATE POLICY "Users can view their own healthcare contacts"
  ON healthcare_contacts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own healthcare contacts"
  ON healthcare_contacts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthcare contacts"
  ON healthcare_contacts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own healthcare contacts"
  ON healthcare_contacts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for medical_history
CREATE POLICY "Users can view their own medical history"
  ON medical_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medical history"
  ON medical_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical history"
  ON medical_history
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical history"
  ON medical_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for medications
CREATE POLICY "Users can view their own medications"
  ON medications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications"
  ON medications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications"
  ON medications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications"
  ON medications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for allergies
CREATE POLICY "Users can view their own allergies"
  ON allergies
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own allergies"
  ON allergies
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own allergies"
  ON allergies
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allergies"
  ON allergies
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_healthcare_contacts_user_id ON healthcare_contacts(user_id);
CREATE INDEX idx_medical_history_user_id ON medical_history(user_id);
CREATE INDEX idx_medications_user_id ON medications(user_id);
CREATE INDEX idx_allergies_user_id ON allergies(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_healthcare_contacts_updated_at
  BEFORE UPDATE ON healthcare_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_history_updated_at
  BEFORE UPDATE ON medical_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allergies_updated_at
  BEFORE UPDATE ON allergies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant appropriate permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Create audit log table for healthcare data
CREATE TABLE healthcare_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE healthcare_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for audit log
CREATE POLICY "Users can view their own audit logs"
  ON healthcare_audit_log
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create function to log healthcare data changes
CREATE OR REPLACE FUNCTION log_healthcare_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO healthcare_audit_log (
    user_id,
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    ip_address,
    user_agent
  )
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    current_setting('request.headers')::jsonb->>'x-forwarded-for',
    current_setting('request.headers')::jsonb->>'user-agent'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers
CREATE TRIGGER log_healthcare_contacts_changes
  AFTER INSERT OR UPDATE OR DELETE ON healthcare_contacts
  FOR EACH ROW EXECUTE FUNCTION log_healthcare_change();

CREATE TRIGGER log_medical_history_changes
  AFTER INSERT OR UPDATE OR DELETE ON medical_history
  FOR EACH ROW EXECUTE FUNCTION log_healthcare_change();

CREATE TRIGGER log_medications_changes
  AFTER INSERT OR UPDATE OR DELETE ON medications
  FOR EACH ROW EXECUTE FUNCTION log_healthcare_change();

CREATE TRIGGER log_allergies_changes
  AFTER INSERT OR UPDATE OR DELETE ON allergies
  FOR EACH ROW EXECUTE FUNCTION log_healthcare_change();