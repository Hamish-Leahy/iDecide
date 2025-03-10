/*
  # Legal Documents Management System Update

  1. Changes
    - Safely drop existing policies if they exist
    - Recreate policies with proper checks
    - Add new indexes for performance
    - Update audit logging functionality

  2. Security
    - Maintain RLS policies
    - Ensure proper access controls
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Drop policies for legal_documents
  DROP POLICY IF EXISTS "Users can view their own documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can insert their own documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can update their own documents" ON legal_documents;

  -- Drop policies for document_versions
  DROP POLICY IF EXISTS "Users can view document versions they have access to" ON document_versions;
  DROP POLICY IF EXISTS "Users can insert document versions for their documents" ON document_versions;

  -- Drop policies for document_metadata
  DROP POLICY IF EXISTS "Users can view document metadata they have access to" ON document_metadata;
  DROP POLICY IF EXISTS "Users can manage metadata for their documents" ON document_metadata;

  -- Drop policies for document_access
  DROP POLICY IF EXISTS "Users can view document access they granted" ON document_access;
  DROP POLICY IF EXISTS "Users can manage document access for their documents" ON document_access;

  -- Drop policies for audit log
  DROP POLICY IF EXISTS "Users can view audit log for their documents" ON document_audit_log;
END $$;

-- Create new policies for legal_documents
CREATE POLICY "Users can view documents with access"
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

CREATE POLICY "Users can create own documents"
  ON legal_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own documents"
  ON legal_documents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create new policies for document_versions
CREATE POLICY "View document versions with access"
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

-- Create new policies for document_metadata
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

-- Create new policies for document_access
CREATE POLICY "View granted access"
  ON document_access
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_access.document_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Manage document access"
  ON document_access
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_access.document_id
      AND user_id = auth.uid()
    )
  );

-- Create new policy for audit log
CREATE POLICY "View document audit log"
  ON document_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_audit_log.document_id
      AND user_id = auth.uid()
    )
  );

-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_legal_docs_user_id ON legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_versions_doc_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_metadata_doc_id ON document_metadata(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_doc_id ON document_access(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_access_user_id ON document_access(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_audit_doc_id ON document_audit_log(document_id);