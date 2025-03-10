/*
  # Document Management System Tables

  1. New Tables
    - `financial_documents`
      - Document storage for financial records
      - Includes metadata and version tracking
    - `document_versions`
      - Version history for all documents
      - Tracks changes and file paths
    - `document_metadata`
      - Additional document information
      - Stores extracted data and validation status
    - `document_access`
      - Access control for documents
      - Manages user permissions

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access to document owners
*/

-- Financial Documents Table
CREATE TABLE IF NOT EXISTS financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Document Versions Table
CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  changes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Document Metadata Table
CREATE TABLE IF NOT EXISTS document_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  key_points jsonb DEFAULT '[]',
  extracted_data jsonb DEFAULT '{}',
  validation_status jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Access Table
CREATE TABLE IF NOT EXISTS document_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES financial_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Enable RLS
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;

-- Policies for financial_documents
CREATE POLICY "Users can view their own documents"
  ON financial_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON financial_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON financial_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON financial_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for document_versions
CREATE POLICY "Users can view versions of their documents"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_versions.document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can create versions of their documents"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_versions.document_id
    AND financial_documents.user_id = auth.uid()
  ));

-- Policies for document_metadata
CREATE POLICY "Users can view metadata of their documents"
  ON document_metadata
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_metadata.document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage metadata of their documents"
  ON document_metadata
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_metadata.document_id
    AND financial_documents.user_id = auth.uid()
  ));

-- Policies for document_access
CREATE POLICY "Users can view access records for their documents"
  ON document_access
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_access.document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage access to their documents"
  ON document_access
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_access.document_id
    AND financial_documents.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_financial_documents_user_id ON financial_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_metadata_document_id ON document_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_document_id ON document_access(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_user_id ON document_access(user_id);