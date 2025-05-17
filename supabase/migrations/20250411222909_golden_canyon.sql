/*
  # Create NDIS Budget Transactions Table

  1. New Table
    - `ndis_transactions`
      - `id` (uuid, primary key)
      - `budget_category_id` (uuid, references ndis_budget_categories)
      - `service_agreement_id` (uuid, references ndis_service_agreements, optional)
      - `date` (timestamptz)
      - `description` (text)
      - `amount` (decimal)
      - `provider_name` (text)
      - `service` (text)
      - `status` (text)
      - `invoice_number` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
    - Add triggers for automatic budget updating
*/

-- Create ndis_transactions table
CREATE TABLE IF NOT EXISTS ndis_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_category_id uuid REFERENCES ndis_budget_categories(id) ON DELETE CASCADE,
  service_agreement_id uuid REFERENCES ndis_service_agreements(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  description text NOT NULL,
  amount decimal NOT NULL,
  provider_name text NOT NULL,
  service text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invoice_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT positive_transaction_amount CHECK (amount >= 0),
  CONSTRAINT valid_transaction_status CHECK (status IN ('pending', 'processed', 'cancelled'))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_transactions_budget_category_id_idx ON ndis_transactions(budget_category_id);
CREATE INDEX IF NOT EXISTS ndis_transactions_service_agreement_id_idx ON ndis_transactions(service_agreement_id);
CREATE INDEX IF NOT EXISTS ndis_transactions_date_idx ON ndis_transactions(date);
CREATE INDEX IF NOT EXISTS ndis_transactions_status_idx ON ndis_transactions(status);

-- Enable RLS
ALTER TABLE ndis_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create transactions for their budget categories"
  ON ndis_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_budget_categories
      JOIN ndis_plans ON ndis_budget_categories.plan_id = ndis_plans.id
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_budget_categories.id = budget_category_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view transactions for their budget categories"
  ON ndis_transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_budget_categories
      JOIN ndis_plans ON ndis_budget_categories.plan_id = ndis_plans.id
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_budget_categories.id = budget_category_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions for their budget categories"
  ON ndis_transactions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_budget_categories
      JOIN ndis_plans ON ndis_budget_categories.plan_id = ndis_plans.id
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_budget_categories.id = budget_category_id
      AND ndis_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_budget_categories
      JOIN ndis_plans ON ndis_budget_categories.plan_id = ndis_plans.id
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_budget_categories.id = budget_category_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions for their budget categories"
  ON ndis_transactions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_budget_categories
      JOIN ndis_plans ON ndis_budget_categories.plan_id = ndis_plans.id
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_budget_categories.id = budget_category_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_ndis_transactions_updated_at
  BEFORE UPDATE ON ndis_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update budget category used amount
CREATE OR REPLACE FUNCTION update_budget_category_used_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- If a new transaction is being inserted
  IF TG_OP = 'INSERT' AND NEW.status = 'processed' THEN
    UPDATE ndis_budget_categories
    SET used_amount = used_amount + NEW.amount
    WHERE id = NEW.budget_category_id;
  
  -- If a transaction is being updated
  ELSIF TG_OP = 'UPDATE' THEN
    -- If status changed from non-processed to processed
    IF OLD.status != 'processed' AND NEW.status = 'processed' THEN
      UPDATE ndis_budget_categories
      SET used_amount = used_amount + NEW.amount
      WHERE id = NEW.budget_category_id;
      
    -- If status changed from processed to non-processed
    ELSIF OLD.status = 'processed' AND NEW.status != 'processed' THEN
      UPDATE ndis_budget_categories
      SET used_amount = used_amount - OLD.amount
      WHERE id = NEW.budget_category_id;
      
    -- If amount changed while status remains processed
    ELSIF OLD.amount != NEW.amount AND NEW.status = 'processed' AND OLD.status = 'processed' THEN
      UPDATE ndis_budget_categories
      SET used_amount = used_amount - OLD.amount + NEW.amount
      WHERE id = NEW.budget_category_id;
    END IF;
  
  -- If a transaction is being deleted
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'processed' THEN
    UPDATE ndis_budget_categories
    SET used_amount = used_amount - OLD.amount
    WHERE id = OLD.budget_category_id;
  END IF;
  
  -- Return appropriate value based on operation
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update budget category used amount
CREATE TRIGGER update_budget_on_transaction_insert
  AFTER INSERT ON ndis_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_category_used_amount();

CREATE TRIGGER update_budget_on_transaction_update
  AFTER UPDATE ON ndis_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_category_used_amount();

CREATE TRIGGER update_budget_on_transaction_delete
  AFTER DELETE ON ndis_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_category_used_amount();