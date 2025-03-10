-- Create document tables
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  version integer DEFAULT 1,
  status text DEFAULT 'draft',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  changes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  key_points jsonb DEFAULT '[]',
  extracted_data jsonb DEFAULT '{}',
  validation_status jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create emergency tables
CREATE TABLE IF NOT EXISTS emergency_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'active',
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  name text NOT NULL,
  relationship text,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_id_id uuid REFERENCES emergency_ids(id) ON DELETE CASCADE,
  blood_type text,
  allergies text,
  conditions text,
  medications text,
  medical_info jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own documents"
  ON legal_documents FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage document versions"
  ON document_versions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE id = document_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage document metadata"
  ON document_metadata FOR ALL
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE id = document_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage emergency IDs"
  ON emergency_ids FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage emergency contacts"
  ON emergency_contacts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM emergency_ids
    WHERE id = emergency_id_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can manage medical info"
  ON medical_info FOR ALL
  USING (EXISTS (
    SELECT 1 FROM emergency_ids
    WHERE id = emergency_id_id AND user_id = auth.uid()
  ));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_emergency_ids_user_id ON emergency_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_emergency_id ON emergency_contacts(emergency_id_id);
CREATE INDEX IF NOT EXISTS idx_medical_info_emergency_id ON medical_info(emergency_id_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;