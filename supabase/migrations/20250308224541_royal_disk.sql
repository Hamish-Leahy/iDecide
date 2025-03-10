/*
  # Fix Table Permissions

  1. Changes
    - Drop existing policies safely
    - Enable RLS on all document tables
    - Add new policies with unique names for all tables
    
  2. Security
    - Ensure authenticated users can only access their own documents
    - Maintain data isolation between users
    - Protect document metadata and versions
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "financial_documents_select" ON financial_documents;
DROP POLICY IF EXISTS "financial_documents_insert" ON financial_documents;
DROP POLICY IF EXISTS "financial_documents_update" ON financial_documents;
DROP POLICY IF EXISTS "financial_documents_delete" ON financial_documents;
DROP POLICY IF EXISTS "legal_documents_select" ON legal_documents;
DROP POLICY IF EXISTS "legal_documents_insert" ON legal_documents;
DROP POLICY IF EXISTS "legal_documents_update" ON legal_documents;
DROP POLICY IF EXISTS "legal_documents_delete" ON legal_documents;
DROP POLICY IF EXISTS "document_metadata_select" ON document_metadata;
DROP POLICY IF EXISTS "document_metadata_all" ON document_metadata;
DROP POLICY IF EXISTS "document_versions_select" ON document_versions;
DROP POLICY IF EXISTS "document_versions_all" ON document_versions;

-- Enable RLS
ALTER TABLE financial_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

-- Financial Documents Policies
CREATE POLICY "fin_docs_select_policy"
  ON financial_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "fin_docs_insert_policy"
  ON financial_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fin_docs_update_policy"
  ON financial_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "fin_docs_delete_policy"
  ON financial_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Legal Documents Policies
CREATE POLICY "legal_docs_select_policy"
  ON legal_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "legal_docs_insert_policy"
  ON legal_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "legal_docs_update_policy"
  ON legal_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "legal_docs_delete_policy"
  ON legal_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Document Metadata Policies
CREATE POLICY "doc_meta_select_policy"
  ON document_metadata
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "doc_meta_all_policy"
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
CREATE POLICY "doc_ver_select_policy"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM financial_documents
    WHERE financial_documents.id = document_id
    AND financial_documents.user_id = auth.uid()
  ));

CREATE POLICY "doc_ver_all_policy"
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