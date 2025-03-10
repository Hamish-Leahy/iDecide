/*
  # Legal Documents System Enhancement

  1. New Tables
    - document_templates
    - document_signatures
    - document_reminders
    - document_categories
  
  2. Security
    - Enable RLS on all new tables
    - Add policies for document access control
    
  3. Changes
    - Add new columns to legal_documents
    - Create additional indexes
*/

-- Create document templates table
CREATE TABLE IF NOT EXISTS document_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  content text NOT NULL,
  document_type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document signatures table
CREATE TABLE IF NOT EXISTS document_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  signature_type text NOT NULL,
  signature_data text NOT NULL,
  ip_address text,
  signed_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- Create document reminders table
CREATE TABLE IF NOT EXISTS document_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  reminder_dates timestamptz[],
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create document categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES document_categories(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to legal_documents
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES document_categories(id);
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES document_templates(id);
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS expiry_date timestamptz;
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS review_date timestamptz;
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS last_reviewed_at timestamptz;
ALTER TABLE legal_documents ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for document templates
CREATE POLICY "Users can view shared templates"
  ON document_templates
  FOR SELECT
  USING (
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage their own templates"
  ON document_templates
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for document signatures
CREATE POLICY "Users can view signatures for accessible documents"
  ON document_signatures
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM legal_documents
      WHERE id = document_signatures.document_id
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

CREATE POLICY "Users can add signatures"
  ON document_signatures
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for document reminders
CREATE POLICY "Users can manage their reminders"
  ON document_reminders
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for document categories
CREATE POLICY "Anyone can view categories"
  ON document_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON document_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_document_templates_user_id ON document_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_document_id ON document_signatures(document_id);
CREATE INDEX IF NOT EXISTS idx_document_signatures_user_id ON document_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_document_id ON document_reminders(document_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_user_id ON document_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_document_reminders_due_date ON document_reminders(due_date);
CREATE INDEX IF NOT EXISTS idx_legal_documents_category_id ON legal_documents(category_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_template_id ON legal_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_expiry_date ON legal_documents(expiry_date);
CREATE INDEX IF NOT EXISTS idx_legal_documents_review_date ON legal_documents(review_date);

-- Create function to handle document review tracking
CREATE OR REPLACE FUNCTION update_document_review()
RETURNS trigger AS $$
BEGIN
  NEW.last_reviewed_at = now();
  NEW.reviewed_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review tracking
DROP TRIGGER IF EXISTS track_document_review ON legal_documents;
CREATE TRIGGER track_document_review
  BEFORE UPDATE OF status
  ON legal_documents
  FOR EACH ROW
  WHEN (OLD.status = 'needs_review' AND NEW.status = 'active')
  EXECUTE FUNCTION update_document_review();