/*
  # Add bank accounts and devices tables

  1. New Tables
    - bank_accounts: Store encrypted banking information
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - bank_name (text)
      - account_type (text)
      - account_number_encrypted (text)
      - routing_number_encrypted (text)
      - notes (text)
      - timestamps

    - devices: Track physical devices and their details
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - name (text)
      - type (text)
      - serial_number (text)
      - purchase_date (date)
      - storage_location (text)
      - notes (text)
      - timestamps

  2. Security
    - Enable RLS on both tables
    - Add policies with existence checks
    - Add updated_at triggers
*/

-- Create bank_accounts table
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  bank_name text NOT NULL,
  account_type text NOT NULL,
  account_number_encrypted text,
  routing_number_encrypted text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create devices table
CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  serial_number text,
  purchase_date date,
  storage_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Bank accounts policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' 
    AND policyname = 'Users can create their own bank accounts'
  ) THEN
    CREATE POLICY "Users can create their own bank accounts"
      ON bank_accounts
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' 
    AND policyname = 'Users can view their own bank accounts'
  ) THEN
    CREATE POLICY "Users can view their own bank accounts"
      ON bank_accounts
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' 
    AND policyname = 'Users can update their own bank accounts'
  ) THEN
    CREATE POLICY "Users can update their own bank accounts"
      ON bank_accounts
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' 
    AND policyname = 'Users can delete their own bank accounts'
  ) THEN
    CREATE POLICY "Users can delete their own bank accounts"
      ON bank_accounts
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Devices policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND policyname = 'Users can create their own devices'
  ) THEN
    CREATE POLICY "Users can create their own devices"
      ON devices
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND policyname = 'Users can view their own devices'
  ) THEN
    CREATE POLICY "Users can view their own devices"
      ON devices
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND policyname = 'Users can update their own devices'
  ) THEN
    CREATE POLICY "Users can update their own devices"
      ON devices
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'devices' 
    AND policyname = 'Users can delete their own devices'
  ) THEN
    CREATE POLICY "Users can delete their own devices"
      ON devices
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_bank_accounts_updated_at ON bank_accounts;
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;

-- Create updated_at triggers
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devices_updated_at
  BEFORE UPDATE ON devices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();