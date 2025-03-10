/*
  # Add Table Permissions with Policy Cleanup

  1. Changes
    - Drop existing policies to avoid conflicts
    - Add RLS policies for financial_documents table
    - Add RLS policies for legal_documents table
    - Add RLS policies for related tables
    - Enable RLS on all tables

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own documents
    - Add policies for document version access
    - Add policies for document metadata access
*/

-- Drop existing policies
DO $$ 
BEGIN
  -- Financial Documents
  DROP POLICY IF EXISTS "Users can view their own documents" ON financial_documents;
  DROP POLICY IF EXISTS "Users can create their own documents" ON financial_documents;
  DROP POLICY IF EXISTS "Users can update their own documents" ON financial_documents;
  DROP POLICY IF EXISTS "Users can delete their own documents" ON financial_documents;

  -- Legal Documents
  DROP POLICY IF EXISTS "Users can view their own legal documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can create their own legal documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can update their own legal documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can delete their own legal documents" ON legal_documents;

  -- Document Metadata
  DROP POLICY IF EXISTS "Users can view document metadata" ON document_metadata;
  DROP POLICY IF EXISTS "Users can manage document metadata" ON document_metadata;

  -- Document Versions
  DROP POLICY IF EXISTS "Users can view document versions" ON document_versions;
  DROP POLICY IF EXISTS "Users can manage document versions" ON document_versions;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE IF EXISTS financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS document_versions ENABLE ROW LEVEL SECURITY;

-- Financial Documents Policies
CREATE POLICY "financial_documents_select"
  ON financial_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "financial_documents_insert"
  ON financial_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_documents_update"
  ON financial_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "financial_documents_delete"
  ON financial_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Legal Documents Policies
CREATE POLICY "legal_documents_select"
  ON legal_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "legal_documents_insert"
  ON legal_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "legal_documents_update"
  ON legal_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "legal_documents_delete"
  ON legal_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Document Metadata Policies
CREATE POLICY "document_metadata_select"
  ON document_metadata
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "document_metadata_all"
  ON document_metadata
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));

-- Document Versions Policies
CREATE POLICY "document_versions_select"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "document_versions_all"
  ON document_versions
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));