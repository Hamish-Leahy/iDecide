/*
  # Add legal estate planning tables

  1. New Tables
    - legal_documents
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - title (text)
      - type (text)
      - status (text)
      - content (text)
      - last_reviewed (timestamptz)
      - next_review (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS legal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  content text,
  last_reviewed timestamptz DEFAULT now(),
  next_review timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own legal documents"
  ON legal_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own legal documents"
  ON legal_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own legal documents"
  ON legal_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own legal documents"
  ON legal_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();