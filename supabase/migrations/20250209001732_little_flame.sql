/*
  # Financial Document Management System

  1. New Tables
    - `financial_documents`
      - Core table for all financial documents
      - Supports versioning, metadata, and access control
    - `financial_document_categories`
      - Hierarchical categories for document organization
    - `financial_document_metadata`
      - Extended metadata and extracted information
    - `financial_document_access`
      - Access control and permissions
    - `financial_document_audit`
      - Comprehensive audit trail

  2. Security
    - Enable RLS on all tables
    - Create policies for secure access
    - Add audit logging

  3. Changes
    - Add support for document classification
    - Enable version control
    - Add metadata extraction
*/

-- Create financial document categories
CREATE TABLE financial_document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES financial_document_categories(id),
  name text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create financial documents table
CREATE TABLE financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES financial_document_categories(id),
  title text NOT NULL,
  description text,
  document_type text NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  version integer DEFAULT 1,
  status text DEFAULT 'draft',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document versions table
CREATE TABLE financial_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  changes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create document metadata table
CREATE TABLE financial_document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  extracted_data jsonb DEFAULT '{}',
  classification jsonb DEFAULT '{}',
  validation_status jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document access table
CREATE TABLE financial_document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Create audit log table
CREATE TABLE financial_document_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE financial_document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_document_audit ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_documents
CREATE POLICY "Users can view their own documents"
  ON financial_documents
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM financial_document_access
      WHERE document_id = financial_documents.id
      AND user_id = auth.uid()
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Users can manage their own documents"
  ON financial_documents
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for document versions
CREATE POLICY "Users can view document versions they have access to"
  ON financial_document_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM financial_documents
      WHERE id = financial_document_versions.document_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM financial_document_access
          WHERE document_id = financial_documents.id
          AND user_id = auth.uid()
          AND (expires_at IS NULL OR expires_at > now())
        )
      )
    )
  );

-- Create function to log document changes
CREATE OR REPLACE FUNCTION log_financial_document_change()
RETURNS trigger AS $$
BEGIN
  INSERT INTO financial_document_audit (
    document_id,
    user_id,
    action,
    details,
    ip_address,
    user_agent
  )
  VALUES (
    NEW.id,
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW)
    ),
    current_setting('request.headers')::jsonb->>'x-forwarded-for',
    current_setting('request.headers')::jsonb->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
CREATE TRIGGER log_financial_document_changes
  AFTER INSERT OR UPDATE OR DELETE
  ON financial_documents
  FOR EACH ROW
  EXECUTE FUNCTION log_financial_document_change();

-- Create indexes for better performance
CREATE INDEX idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX idx_financial_documents_category_id ON financial_documents(category_id);
CREATE INDEX idx_financial_document_versions_document_id ON financial_document_versions(document_id);
CREATE INDEX idx_financial_document_metadata_document_id ON financial_document_metadata(document_id);
CREATE INDEX idx_financial_document_access_document_id ON financial_document_access(document_id);
CREATE INDEX idx_financial_document_access_user_id ON financial_document_access(user_id);
CREATE INDEX idx_financial_document_audit_document_id ON financial_document_audit(document_id);