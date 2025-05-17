/*
  # Create NDIS Budget Categories Table

  1. New Table
    - `ndis_budget_categories`
      - `id` (uuid, primary key)
      - `plan_id` (uuid, references ndis_plans)
      - `name` (text)
      - `allocated_amount` (decimal)
      - `used_amount` (decimal)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Create indexes for frequent queries
*/

-- Create ndis_budget_categories table
CREATE TABLE IF NOT EXISTS ndis_budget_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid REFERENCES ndis_plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  allocated_amount decimal NOT NULL,
  used_amount decimal NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraints
  CONSTRAINT valid_budget_status CHECK (status IN ('active', 'inactive')),
  CONSTRAINT positive_amount CHECK (allocated_amount >= 0),
  CONSTRAINT valid_usage CHECK (used_amount >= 0 AND used_amount <= allocated_amount)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS ndis_budget_categories_plan_id_idx ON ndis_budget_categories(plan_id);
CREATE INDEX IF NOT EXISTS ndis_budget_categories_name_idx ON ndis_budget_categories(name);

-- Enable RLS
ALTER TABLE ndis_budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create budget categories for their plans"
  ON ndis_budget_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_plans
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_plans.id = plan_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view budget categories for their plans"
  ON ndis_budget_categories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_plans
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_plans.id = plan_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update budget categories for their plans"
  ON ndis_budget_categories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_plans
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_plans.id = plan_id
      AND ndis_participants.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM ndis_plans
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_plans.id = plan_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete budget categories for their plans"
  ON ndis_budget_categories
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM ndis_plans
      JOIN ndis_participants ON ndis_plans.participant_id = ndis_participants.id
      WHERE ndis_plans.id = plan_id
      AND ndis_participants.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_ndis_budget_categories_updated_at
  BEFORE UPDATE ON ndis_budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();