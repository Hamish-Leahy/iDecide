/*
  # Legal Documents Schema

  1. New Tables
    - `legal_documents`
      - Core table for all legal documents
      - Stores document metadata and status
    - `legal_document_versions`
      - Version history for documents
      - Tracks changes and updates
    - `legal_document_tasks`
      - Action items and tasks related to documents
      - Tracks completion status and deadlines
    - `legal_document_reviews`
      - Scheduled and completed document reviews
      - Tracks review history and outcomes

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure document owner access control

  3. Changes
    - Add task tracking system
    - Add review scheduling
    - Add version control
*/

-- Drop existing indexes if they exist
DO $$ BEGIN
  DROP INDEX IF EXISTS idx_legal_documents_user_id;
  DROP INDEX IF EXISTS idx_legal_documents_status;
  DROP INDEX IF EXISTS idx_document_versions_document_id;
  DROP INDEX IF EXISTS idx_document_tasks_document_id;
  DROP INDEX IF EXISTS idx_document_tasks_status;
  DROP INDEX IF EXISTS idx_document_reviews_document_id;
  DROP INDEX IF EXISTS idx_document_reviews_status;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Legal Documents Table
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
  review_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Versions Table
CREATE TABLE IF NOT EXISTS legal_document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  file_hash text NOT NULL,
  changes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Document Tasks Table
CREATE TABLE IF NOT EXISTS legal_document_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date date,
  priority text DEFAULT 'medium',
  status text DEFAULT 'pending',
  assigned_to uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Document Reviews Table
CREATE TABLE IF NOT EXISTS legal_document_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  review_date date NOT NULL,
  reviewed_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
DO $$ BEGIN
  ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
  ALTER TABLE legal_document_versions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE legal_document_tasks ENABLE ROW LEVEL SECURITY;
  ALTER TABLE legal_document_reviews ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can create documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can update their own documents" ON legal_documents;
  DROP POLICY IF EXISTS "Users can view document versions" ON legal_document_versions;
  DROP POLICY IF EXISTS "Users can create document versions" ON legal_document_versions;
  DROP POLICY IF EXISTS "Users can view document tasks" ON legal_document_tasks;
  DROP POLICY IF EXISTS "Users can manage document tasks" ON legal_document_tasks;
  DROP POLICY IF EXISTS "Users can view document reviews" ON legal_document_reviews;
  DROP POLICY IF EXISTS "Users can manage document reviews" ON legal_document_reviews;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for legal_documents
CREATE POLICY "Users can view their own documents"
  ON legal_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create documents"
  ON legal_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
  ON legal_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for versions
CREATE POLICY "Users can view document versions"
  ON legal_document_versions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can create document versions"
  ON legal_document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

-- Policies for tasks
CREATE POLICY "Users can view document tasks"
  ON legal_document_tasks
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage document tasks"
  ON legal_document_tasks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

-- Policies for reviews
CREATE POLICY "Users can view document reviews"
  ON legal_document_reviews
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage document reviews"
  ON legal_document_reviews
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM legal_documents
    WHERE legal_documents.id = document_id
    AND legal_documents.user_id = auth.uid()
  ));

-- Create new indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON legal_documents(status);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON legal_document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tasks_document_id ON legal_document_tasks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_tasks_status ON legal_document_tasks(status);
CREATE INDEX IF NOT EXISTS idx_document_reviews_document_id ON legal_document_reviews(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reviews_status ON legal_document_reviews(status);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_document_updated_at CASCADE;

-- Create function
CREATE OR REPLACE FUNCTION update_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_legal_documents_updated_at ON legal_documents;
DROP TRIGGER IF EXISTS update_legal_document_tasks_updated_at ON legal_document_tasks;

-- Create triggers
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_document_updated_at();

CREATE TRIGGER update_legal_document_tasks_updated_at
  BEFORE UPDATE ON legal_document_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_document_updated_at();