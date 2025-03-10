/*
  # Legal Documents Schema Update

  1. Changes
    - Add document type-specific fields
    - Create specialized metadata tables
    - Update validation rules

  2. Security
    - Maintain RLS policies
    - Add type-specific access controls
*/

-- Add document type-specific fields to legal_documents
ALTER TABLE legal_documents 
ADD COLUMN IF NOT EXISTS document_subtype text,
ADD COLUMN IF NOT EXISTS effective_date timestamptz,
ADD COLUMN IF NOT EXISTS witness_details jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS notary_details jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS special_instructions text;

-- Create power of attorney details table
CREATE TABLE IF NOT EXISTS power_of_attorney_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  agent_type text NOT NULL,
  agent_id uuid REFERENCES auth.users(id),
  powers jsonb DEFAULT '[]',
  limitations text,
  effective_type text DEFAULT 'immediate',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create healthcare directive details table
CREATE TABLE IF NOT EXISTS healthcare_directive_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES auth.users(id),
  life_support_preferences jsonb DEFAULT '{}',
  pain_management_preferences jsonb DEFAULT '{}',
  organ_donation_preferences jsonb DEFAULT '{}',
  religious_preferences text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trust details table
CREATE TABLE IF NOT EXISTS trust_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  trust_type text NOT NULL,
  trustee_id uuid REFERENCES auth.users(id),
  successor_trustee_id uuid REFERENCES auth.users(id),
  trust_purpose text,
  distribution_terms text,
  tax_provisions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE power_of_attorney_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_directive_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_details ENABLE ROW LEVEL SECURITY;

-- Create policies for power of attorney details
CREATE POLICY "Users can manage their own power of attorney details"
  ON power_of_attorney_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for healthcare directive details
CREATE POLICY "Users can manage their own healthcare directive details"
  ON healthcare_directive_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for trust details
CREATE POLICY "Users can manage their own trust details"
  ON trust_details
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_poa_details_document_id ON power_of_attorney_details(document_id);
CREATE INDEX IF NOT EXISTS idx_poa_details_agent_id ON power_of_attorney_details(agent_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_details_document_id ON healthcare_directive_details(document_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_details_agent_id ON healthcare_directive_details(agent_id);
CREATE INDEX IF NOT EXISTS idx_trust_details_document_id ON trust_details(document_id);
CREATE INDEX IF NOT EXISTS idx_trust_details_trustee_id ON trust_details(trustee_id);

-- Create function to update details timestamps
CREATE OR REPLACE FUNCTION update_details_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_poa_details_timestamp
  BEFORE UPDATE ON power_of_attorney_details
  FOR EACH ROW
  EXECUTE FUNCTION update_details_timestamp();

CREATE TRIGGER update_healthcare_details_timestamp
  BEFORE UPDATE ON healthcare_directive_details
  FOR EACH ROW
  EXECUTE FUNCTION update_details_timestamp();

CREATE TRIGGER update_trust_details_timestamp
  BEFORE UPDATE ON trust_details
  FOR EACH ROW
  EXECUTE FUNCTION update_details_timestamp();