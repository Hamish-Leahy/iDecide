/*
  # Add sidebar configuration to user preferences

  1. Changes
    - Add sidebar_items column to user_preferences table to store custom sidebar configuration
    - This will be a JSON string containing the user's sidebar items
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_preferences' AND column_name = 'sidebar_items'
  ) THEN
    ALTER TABLE user_preferences 
      ADD COLUMN sidebar_items text;
  END IF;
END $$;