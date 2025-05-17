/*
  # Add legal document and family awareness fields

  1. Changes
    - Add legal document fields:
      - `legal_documents` (text[]): Will, Power of Attorney, Advance Directive, Trust, Other
      - `wants_legal_documents` (text): Yes, No, Not sure
    - Add family awareness fields:
      - `family_policy_awareness` (text): All, Some, None
      - `document_location_shared` (text): All, Some, None
      - `wants_insurance` (text): Yes, No, Not sure

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'legal_documents'
  ) THEN
    ALTER TABLE profiles 
      ADD COLUMN legal_documents text[],
      ADD COLUMN wants_legal_documents text,
      ADD COLUMN family_policy_awareness text,
      ADD COLUMN document_location_shared text,
      ADD COLUMN wants_insurance text;
  END IF;
END $$;