/*
  # Add goals field to profiles table

  1. Changes
    - Add `goals` column to store user's selected goals from Everplans
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'goals'
  ) THEN
    ALTER TABLE profiles ADD COLUMN goals text[];
  END IF;
END $$;