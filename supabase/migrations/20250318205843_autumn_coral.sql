/*
  # Add property and insurance fields to profiles table

  1. Changes
    - Add property-related fields:
      - `housing_status` (text): Own, Rent, or Other
      - `property_deed_access` (text): Very fast, Takes some searching, No idea where it is
      - `assets` (text[]): Car, Other vehicle, Small business, Other real estate
    - Add insurance-related fields:
      - `insurance_types` (text[]): Health, Car, Property, Life (employer), Life (standalone), Disability, Long term care

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'housing_status'
  ) THEN
    ALTER TABLE profiles 
      ADD COLUMN housing_status text,
      ADD COLUMN property_deed_access text,
      ADD COLUMN assets text[],
      ADD COLUMN insurance_types text[];
  END IF;
END $$;