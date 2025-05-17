/*
  # Add iDecide score fields

  1. Changes
    - Add `idecide_score` to store the user's current score
    - Add `last_score_update` to track when the score was last calculated
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'idecide_score'
  ) THEN
    ALTER TABLE profiles 
      ADD COLUMN idecide_score integer DEFAULT 0,
      ADD COLUMN last_score_update timestamptz DEFAULT now();
  END IF;
END $$;