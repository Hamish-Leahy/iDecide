/*
  # Add password-specific fields to digital_assets table

  1. Changes
    - Add strength field for password strength indicator
    - Add favorite field for marking important passwords
    - Add last_used field to track password usage
    - Add shared_with array to track password sharing
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'digital_assets' AND column_name = 'strength'
  ) THEN
    ALTER TABLE digital_assets 
      ADD COLUMN strength text,
      ADD COLUMN favorite boolean DEFAULT false,
      ADD COLUMN last_used timestamptz,
      ADD COLUMN shared_with text[] DEFAULT '{}';
  END IF;
END $$;