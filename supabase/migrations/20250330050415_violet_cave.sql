/*
  # Financial System Schema

  1. New Tables
    - `insurance_policies`
      - Core fields for all policies:
        - id, user_id, type, provider, policy_number, status
        - coverage_amount, premium, payment_frequency
        - start_date, renewal_date, notes
      - Life insurance specific:
        - beneficiaries (text[])
      - Disability specific:
        - waiting_period, benefit_period, coverage_type
      - Long-term care specific:
        - elimination_period, benefit_period, daily_benefit
      - NDIS specific:
        - ndis_number, plan_manager, support_coordinator
        - funding_categories (jsonb)

    - `financial_accounts`
      - id, user_id, type (savings, checking, investment, etc.)
      - institution, account_number (encrypted)
      - balance, currency, notes
      - last_updated, statements_location

    - `financial_assets`
      - id, user_id, type (property, vehicle, crypto, etc.)
      - name, description, value
      - purchase_date, location, documentation
      - status, notes

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Encryption for sensitive data

  3. Indexes & Constraints
    - Appropriate indexes for frequent queries
    - Foreign key constraints
    - Data validation constraints
*/

-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  policy_number text NOT NULL,
  status text DEFAULT 'active',
  coverage_amount text NOT NULL,
  premium text NOT NULL,
  payment_frequency text NOT NULL,
  start_date date,
  renewal_date date,
  notes text,
  
  -- Life insurance specific
  beneficiaries text[],
  
  -- Disability specific
  waiting_period text,
  benefit_period text,
  coverage_type text,
  
  -- Long-term care specific
  elimination_period text,
  daily_benefit text,
  
  -- NDIS specific
  ndis_number text,
  plan_manager text,
  support_coordinator text,
  funding_categories jsonb,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_policy_type CHECK (type IN (
    'life',
    'disability',
    'longterm',
    'ndis'
  )),
  CONSTRAINT valid_payment_frequency CHECK (payment_frequency IN (
    'monthly',
    'quarterly',
    'annually'
  )),
  CONSTRAINT valid_policy_status CHECK (status IN (
    'active',
    'inactive',
    'pending',
    'expired',
    'cancelled'
  ))
);

-- Create financial_accounts table
CREATE TABLE IF NOT EXISTS financial_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  institution text NOT NULL,
  account_number_encrypted text,
  routing_number_encrypted text,
  balance text,
  currency text DEFAULT 'AUD',
  statements_location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),

  CONSTRAINT valid_account_type CHECK (type IN (
    'checking',
    'savings',
    'credit',
    'investment',
    'retirement',
    'loan',
    'other'
  ))
);

-- Create financial_assets table
CREATE TABLE IF NOT EXISTS financial_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  name text NOT NULL,
  description text,
  value text NOT NULL,
  purchase_date date,
  location text,
  documentation text,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_asset_type CHECK (type IN (
    'property',
    'vehicle',
    'cryptocurrency',
    'collectible',
    'business',
    'other'
  )),
  CONSTRAINT valid_asset_status CHECK (status IN (
    'active',
    'sold',
    'transferred',
    'lost'
  ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS insurance_policies_user_id_idx ON insurance_policies(user_id);
CREATE INDEX IF NOT EXISTS insurance_policies_type_idx ON insurance_policies(type);
CREATE INDEX IF NOT EXISTS financial_accounts_user_id_idx ON financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS financial_accounts_type_idx ON financial_accounts(type);
CREATE INDEX IF NOT EXISTS financial_assets_user_id_idx ON financial_assets(user_id);
CREATE INDEX IF NOT EXISTS financial_assets_type_idx ON financial_assets(type);

-- Enable RLS
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_assets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for insurance_policies
CREATE POLICY "Users can create their own insurance policies"
  ON insurance_policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insurance policies"
  ON insurance_policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies"
  ON insurance_policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies"
  ON insurance_policies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for financial_accounts
CREATE POLICY "Users can create their own financial accounts"
  ON financial_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial accounts"
  ON financial_accounts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial accounts"
  ON financial_accounts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial accounts"
  ON financial_accounts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for financial_assets
CREATE POLICY "Users can create their own financial assets"
  ON financial_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own financial assets"
  ON financial_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial assets"
  ON financial_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial assets"
  ON financial_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_insurance_policies_updated_at
  BEFORE UPDATE ON insurance_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON financial_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_assets_updated_at
  BEFORE UPDATE ON financial_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE insurance_policies IS 'Stores insurance policies for users';
COMMENT ON TABLE financial_accounts IS 'Stores financial accounts information';
COMMENT ON TABLE financial_assets IS 'Stores user financial assets';