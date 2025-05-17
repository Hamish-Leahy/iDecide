/*
  # Add tips and enhanced checklist functionality

  1. New Tables
    - digital_tips
      - id (uuid, primary key)
      - category (text)
      - title (text)
      - content (text)
      - priority (integer)
      - action_url (text)
      
    - checklist_categories
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - icon (text)
      - priority (integer)

  2. Changes to digital_checklist
    - Add priority field
    - Add category_id reference
    - Add suggested_action field

  3. Security
    - Enable RLS
    - Add appropriate policies
*/

-- Create digital_tips table
CREATE TABLE IF NOT EXISTS digital_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  priority integer DEFAULT 0,
  action_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create checklist_categories table
CREATE TABLE IF NOT EXISTS checklist_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to digital_checklist
ALTER TABLE digital_checklist 
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES checklist_categories(id),
  ADD COLUMN IF NOT EXISTS suggested_action text;

-- Enable RLS
ALTER TABLE digital_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can read tips"
  ON digital_tips
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Everyone can read categories"
  ON checklist_categories
  FOR SELECT
  TO authenticated
  USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_digital_tips_updated_at
  BEFORE UPDATE ON digital_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_categories_updated_at
  BEFORE UPDATE ON checklist_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO checklist_categories (name, description, icon, priority) VALUES
  ('Digital Accounts', 'Essential online accounts and credentials', 'laptop', 1),
  ('Financial', 'Banking and financial information', 'dollar-sign', 2),
  ('Documents', 'Important digital documents', 'file-text', 3),
  ('Devices', 'Physical devices and hardware', 'smartphone', 4),
  ('Legacy', 'Digital legacy and inheritance planning', 'heart', 5),
  ('Security', 'Digital security and access control', 'shield', 6);

-- Insert default tips
INSERT INTO digital_tips (category, title, content, priority, action_url) VALUES
  ('security', 'Use a Password Manager', 'A password manager helps you maintain strong, unique passwords for all your accounts. This is crucial for your digital security.', 1, '/dashboard/digital/passwords'),
  ('accounts', 'Document Social Media Legacy Contacts', 'Many social media platforms offer legacy contact options. Set these up to ensure proper account handling.', 2, '/dashboard/digital/accounts'),
  ('financial', 'Secure Your Cryptocurrency', 'If you own cryptocurrency, document your wallet information and access methods securely.', 3, '/dashboard/digital/assets'),
  ('devices', 'Create a Device Inventory', 'Keep track of all your devices, including serial numbers and access information.', 4, '/dashboard/digital/devices'),
  ('legacy', 'Share Access with Deputies', 'Designate trusted contacts as deputies and share necessary access information securely.', 5, '/dashboard/digital/deputies'),
  ('documents', 'Organize Cloud Storage', 'Create a clear structure for your cloud storage and document the access details.', 6, '/dashboard/digital/storage');