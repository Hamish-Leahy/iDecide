-- Create document_status type if it doesn't exist
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

-- Drop existing tables if they exist to recreate with proper relationships
DROP TABLE IF EXISTS document_audit_log CASCADE;
DROP TABLE IF EXISTS document_access CASCADE;
DROP TABLE IF EXISTS document_metadata CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS legal_documents CASCADE;

-- Recreate legal_documents table
CREATE TABLE legal_documents (
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

-- Recreate document_versions table with proper foreign key
CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  changes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- Recreate document_metadata table with proper foreign key
CREATE TABLE document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  key_points jsonb DEFAULT '[]',
  extracted_data jsonb DEFAULT '{}',
  validation_status jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(document_id)
);

-- Recreate document_access table
CREATE TABLE document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Recreate document_audit_log table
CREATE TABLE document_audit_log (
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
CREATE POLICY "View documents with access"
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

CREATE POLICY "Manage own documents"
  ON legal_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for document_versions
CREATE POLICY "View versions with access"
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

CREATE POLICY "Create versions for own documents"
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
CREATE POLICY "View metadata with access"
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

CREATE POLICY "Manage metadata for own documents"
  ON document_metadata
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_metadata.document_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX idx_document_access_document_id ON document_access(document_id);
CREATE INDEX idx_document_access_user_id ON document_access(user_id);
CREATE INDEX idx_document_audit_document_id ON document_audit_log(document_id);

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

-- Create trigger for audit logging
CREATE TRIGGER log_document_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_change();