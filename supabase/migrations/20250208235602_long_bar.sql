-- Check if document_status type exists and create if not
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_status') THEN
    CREATE TYPE document_status AS ENUM (
      'draft',
      'active',
      'needs_review',
      'expired',
      'revoked'
    );
  END IF;
END $$;

-- Create legal documents table
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  version integer DEFAULT 1,
  status document_status DEFAULT 'draft',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document versions table
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

-- Create document metadata table
CREATE TABLE IF NOT EXISTS document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  key_points jsonb DEFAULT '[]',
  extracted_data jsonb DEFAULT '{}',
  validation_status jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document access table
CREATE TABLE IF NOT EXISTS document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS document_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies for legal_documents
CREATE POLICY "Users can view their own documents"
  ON legal_documents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = legal_documents.id
      AND user_id = auth.uid()
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Users can insert their own documents"
  ON legal_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON legal_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for document_versions
CREATE POLICY "Users can view document versions they have access to"
  ON document_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_versions.document_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM document_access
          WHERE document_id = legal_documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > now())
        )
      )
    )
  );

CREATE POLICY "Users can insert document versions for their documents"
  ON document_versions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_versions.document_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for document_metadata
CREATE POLICY "Users can view document metadata they have access to"
  ON document_metadata
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_metadata.document_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM document_access
          WHERE document_id = legal_documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > now())
        )
      )
    )
  );

CREATE POLICY "Users can manage metadata for their documents"
  ON document_metadata
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_metadata.document_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for document_access
CREATE POLICY "Users can view document access they granted"
  ON document_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_access.document_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage document access for their documents"
  ON document_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_access.document_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for audit log
CREATE POLICY "Users can view audit log for their documents"
  ON document_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_audit_log.document_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_document_id ON document_access(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_user_id ON document_access(user_id);
CREATE INDEX IF NOT EXISTS idx_document_audit_log_document_id ON document_audit_log(document_id);

-- Create function to log document changes
CREATE OR REPLACE FUNCTION log_document_change()
RETURNS trigger AS $$
BEGIN
  INSERT INTO document_audit_log (document_id, user_id, action, details)
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for audit logging
DROP TRIGGER IF EXISTS log_document_changes ON legal_documents;
CREATE TRIGGER log_document_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_change();

-- Create function to update document timestamps
CREATE OR REPLACE FUNCTION update_document_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_document_timestamp ON legal_documents;
CREATE TRIGGER update_document_timestamp
  BEFORE UPDATE
  ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_timestamp();