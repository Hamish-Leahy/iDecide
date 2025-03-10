/*
  # Initial Database Schema for iDecide

  1. Core Tables
    - users: Core user information
    - profiles: Extended user profiles
    - access_logs: Track system access
    - settings: User preferences and settings

  2. Legal Documents
    - legal_documents: All legal document metadata
    - wills: Will & testament details
    - power_of_attorney: POA documents
    - trusts: Trust documents
    - advance_directives: Healthcare directives

  3. Healthcare
    - healthcare_contacts: Medical professionals and emergency contacts
    - medical_history: Medical records and history
    - medications: Current and past medications
    - mental_health_records: Mental health directives and history
    - allergies: Allergy information

  4. Financial & Assets
    - assets: All types of assets
    - financial_accounts: Bank and investment accounts
    - insurance_policies: Insurance information
    - real_estate: Property details
    - beneficiary_designations: Asset beneficiaries

  5. Document Management
    - documents: Document vault storage
    - document_access: Document sharing and permissions
    - document_versions: Version control
    - document_categories: Organization structure

  6. Tasks & Notifications
    - tasks: To-do items
    - important_dates: Key dates and reminders
    - notifications: System notifications
    - notification_preferences: User notification settings

  Security:
    - RLS enabled on all tables
    - Granular access control
    - Audit logging
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Tables --

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth date,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'USA',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE access_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  category text NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

-- 2. Legal Documents --

CREATE TYPE document_status AS ENUM ('draft', 'active', 'needs_review', 'expired', 'revoked');

CREATE TABLE legal_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  document_type text NOT NULL,
  status document_status DEFAULT 'draft',
  content text,
  metadata jsonb DEFAULT '{}',
  effective_date date,
  expiry_date date,
  last_reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE wills (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  executor_id uuid REFERENCES users(id),
  alternate_executor_id uuid REFERENCES users(id),
  witness_details jsonb DEFAULT '[]',
  special_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE power_of_attorney (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  agent_id uuid REFERENCES users(id),
  alternate_agent_id uuid REFERENCES users(id),
  poa_type text NOT NULL,
  powers jsonb DEFAULT '[]',
  limitations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE trusts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  trustee_id uuid REFERENCES users(id),
  successor_trustee_id uuid REFERENCES users(id),
  trust_type text NOT NULL,
  trust_purpose text,
  distribution_terms text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Healthcare --

CREATE TABLE healthcare_contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  contact_type text NOT NULL,
  full_name text NOT NULL,
  relationship text,
  specialty text,
  organization text,
  phone text,
  email text,
  address text,
  notes text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE advance_directives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_document_id uuid REFERENCES legal_documents(id) ON DELETE CASCADE,
  healthcare_agent_id uuid REFERENCES healthcare_contacts(id),
  alternate_agent_id uuid REFERENCES healthcare_contacts(id),
  life_support_preferences jsonb DEFAULT '{}',
  pain_management_preferences jsonb DEFAULT '{}',
  organ_donation_preferences jsonb DEFAULT '{}',
  other_instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE medical_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  condition text NOT NULL,
  diagnosis_date date,
  treating_physician_id uuid REFERENCES healthcare_contacts(id),
  status text,
  treatment_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  frequency text,
  prescribing_physician_id uuid REFERENCES healthcare_contacts(id),
  start_date date,
  end_date date,
  purpose text,
  side_effects text,
  is_current boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE allergies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  allergen text NOT NULL,
  reaction text,
  severity text,
  diagnosis_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Financial & Assets --

CREATE TABLE assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  asset_type text NOT NULL,
  name text NOT NULL,
  description text,
  value decimal(15,2),
  location text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE financial_accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  account_type text NOT NULL,
  institution text NOT NULL,
  account_number text,
  routing_number text,
  balance decimal(15,2),
  is_joint boolean DEFAULT false,
  joint_owner_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE insurance_policies (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  policy_type text NOT NULL,
  provider text NOT NULL,
  policy_number text,
  coverage_amount decimal(15,2),
  premium_amount decimal(15,2),
  premium_frequency text,
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE real_estate (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  property_type text NOT NULL,
  address text NOT NULL,
  purchase_date date,
  purchase_price decimal(15,2),
  current_value decimal(15,2),
  mortgage_details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE beneficiary_designations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  beneficiary_type text NOT NULL,
  full_name text NOT NULL,
  relationship text,
  date_of_birth date,
  ssn text,
  email text,
  phone text,
  address text,
  percentage decimal(5,2),
  conditions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Document Management --

CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size integer,
  metadata jsonb DEFAULT '{}',
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE document_access (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  access_level text NOT NULL,
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE document_versions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  file_path text NOT NULL,
  changes_summary text,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- 6. Tasks & Notifications --

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz,
  priority text,
  status text DEFAULT 'pending',
  category text,
  related_document_id uuid REFERENCES documents(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE important_dates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  description text,
  recurrence text,
  reminder_days integer[],
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL,
  priority text DEFAULT 'normal',
  read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE notification_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  email boolean DEFAULT true,
  push boolean DEFAULT false,
  sms boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, notification_type)
);

-- Enable Row Level Security --

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE wills ENABLE ROW LEVEL SECURITY;
ALTER TABLE power_of_attorney ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusts ENABLE ROW LEVEL SECURITY;
ALTER TABLE healthcare_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE advance_directives ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiary_designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies --

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR ALL USING (auth.uid() = user_id);

-- Users can read their own access logs
CREATE POLICY "Users can read own access logs" ON access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own settings
CREATE POLICY "Users can manage own settings" ON settings
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own legal documents
CREATE POLICY "Users can manage own legal documents" ON legal_documents
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own healthcare contacts
CREATE POLICY "Users can manage own healthcare contacts" ON healthcare_contacts
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own assets
CREATE POLICY "Users can manage own assets" ON assets
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own documents
CREATE POLICY "Users can manage own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);

-- Users can read documents they have access to
CREATE POLICY "Users can read accessible documents" ON documents
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = documents.id
      AND user_id = auth.uid()
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

-- Users can manage their own tasks
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own important dates
CREATE POLICY "Users can manage own important dates" ON important_dates
  FOR ALL USING (auth.uid() = user_id);

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Create indexes for better performance

CREATE INDEX idx_legal_documents_user_id ON legal_documents(user_id);
CREATE INDEX idx_healthcare_contacts_user_id ON healthcare_contacts(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_important_dates_user_id ON important_dates(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);