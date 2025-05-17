/*
  # Add NDIS support fields to insurance_policies table

  1. Changes
    - Ensure insurance_policies table has NDIS-specific fields:
      - ndis_number (text)
      - plan_start_date (date)
      - plan_end_date (date)
      - plan_manager (text)
      - support_coordinator (text)
      - funding_categories (jsonb)
*/

DO $$ 
BEGIN
  -- Check if the insurance_policies table exists
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'insurance_policies'
  ) THEN
    -- Check if the ndis_number column exists
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'insurance_policies' AND column_name = 'ndis_number'
    ) THEN
      -- Add NDIS-specific columns if they don't exist
      ALTER TABLE insurance_policies 
        ADD COLUMN IF NOT EXISTS ndis_number text,
        ADD COLUMN IF NOT EXISTS plan_start_date date,
        ADD COLUMN IF NOT EXISTS plan_end_date date,
        ADD COLUMN IF NOT EXISTS plan_manager text,
        ADD COLUMN IF NOT EXISTS support_coordinator text,
        ADD COLUMN IF NOT EXISTS funding_categories jsonb;
    END IF;
  END IF;
END $$;