/*
  # Legal Documents System Migration

  1. Changes
    - Create legal_documents table if not exists
    - Enable RLS
    - Add policy if it doesn't exist
    - Create index for user_id
*/

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
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and create new one
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own documents" ON legal_documents;
    
    CREATE POLICY "Users can manage their own documents"
      ON legal_documents
      FOR ALL
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN undefined_object THEN
        -- Policy doesn't exist, so just create it
        CREATE POLICY "Users can manage their own documents"
          ON legal_documents
          FOR ALL
          TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_legal_documents_user_id ON legal_documents(user_id);