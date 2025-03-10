/*
  # Add missing columns to medical_info table

  1. Changes
    - Add blood_type column to medical_info table
    - Add medical_info column to medical_info table

  2. Security
    - No changes to RLS policies needed
*/

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medical_info' AND column_name = 'blood_type'
  ) THEN
    ALTER TABLE medical_info ADD COLUMN blood_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'medical_info' AND column_name = 'medical_info'
  ) THEN
    ALTER TABLE medical_info ADD COLUMN medical_info jsonb DEFAULT '{}';
  END IF;
END $$;