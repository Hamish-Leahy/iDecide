/*
  # Add pet management tables

  1. New Tables
    - `pets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `species` (text)
      - `breed` (text)
      - `age` (numeric)
      - `weight` (numeric)
      - `color` (text)
      - `microchip_number` (text)
      - `registration_number` (text)
      - `image_url` (text)
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `pet_vaccinations`
      - `id` (uuid, primary key)
      - `pet_id` (uuid, references pets)
      - `vaccine_name` (text)
      - `date_administered` (date)
      - `expiration_date` (date)
      - `administered_by` (text)
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `pet_appointments`
      - `id` (uuid, primary key)
      - `pet_id` (uuid, references pets)
      - `appointment_date` (timestamp with time zone)
      - `appointment_type` (text)
      - `veterinarian` (text)
      - `location` (text)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `pet_medical_records`
      - `id` (uuid, primary key)
      - `pet_id` (uuid, references pets)
      - `date` (date)
      - `record_type` (text)
      - `diagnosis` (text)
      - `treatment` (text)
      - `medications` (text[])
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `pet_care_schedules`
      - `id` (uuid, primary key)
      - `pet_id` (uuid, references pets)
      - `activity_type` (text)
      - `frequency` (text)
      - `time_of_day` (text)
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `pet_diet_nutrition`
      - `id` (uuid, primary key)
      - `pet_id` (uuid, references pets)
      - `food_name` (text)
      - `food_type` (text)
      - `amount` (text)
      - `frequency` (text)
      - `dietary_restrictions` (text[])
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for CRUD operations
    - Ensure users can only access their own pets' data
*/

-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  species text NOT NULL,
  breed text,
  age numeric,
  weight numeric,
  color text,
  microchip_number text,
  registration_number text,
  image_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_species CHECK (species IN (
    'dog',
    'cat',
    'bird',
    'fish',
    'small_mammal',
    'reptile',
    'other'
  ))
);

-- Create pet_vaccinations table
CREATE TABLE IF NOT EXISTS pet_vaccinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name text NOT NULL,
  date_administered date NOT NULL,
  expiration_date date,
  administered_by text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create pet_appointments table
CREATE TABLE IF NOT EXISTS pet_appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  appointment_type text NOT NULL,
  veterinarian text,
  location text,
  notes text,
  status text DEFAULT 'scheduled',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_appointment_status CHECK (status IN (
    'scheduled',
    'completed',
    'cancelled',
    'rescheduled'
  )),
  
  CONSTRAINT valid_appointment_type CHECK (appointment_type IN (
    'checkup',
    'vaccination',
    'illness',
    'injury',
    'surgery',
    'dental',
    'grooming',
    'other'
  ))
);

-- Create pet_medical_records table
CREATE TABLE IF NOT EXISTS pet_medical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  date date NOT NULL,
  record_type text NOT NULL,
  diagnosis text,
  treatment text,
  medications text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_record_type CHECK (record_type IN (
    'exam',
    'diagnosis',
    'treatment',
    'surgery',
    'lab_result',
    'other'
  ))
);

-- Create pet_care_schedules table
CREATE TABLE IF NOT EXISTS pet_care_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  frequency text NOT NULL,
  time_of_day text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_activity_type CHECK (activity_type IN (
    'feeding',
    'medication',
    'exercise',
    'grooming',
    'training',
    'other'
  )),
  
  CONSTRAINT valid_frequency CHECK (frequency IN (
    'daily',
    'twice_daily',
    'weekly',
    'monthly',
    'as_needed',
    'custom'
  ))
);

-- Create pet_diet_nutrition table
CREATE TABLE IF NOT EXISTS pet_diet_nutrition (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid REFERENCES pets(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  food_type text NOT NULL,
  amount text NOT NULL,
  frequency text NOT NULL,
  dietary_restrictions text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_food_type CHECK (food_type IN (
    'dry',
    'wet',
    'raw',
    'prescription',
    'homemade',
    'other'
  )),
  
  CONSTRAINT valid_diet_frequency CHECK (frequency IN (
    'once_daily',
    'twice_daily',
    'three_times_daily',
    'free_feeding',
    'custom'
  ))
);

-- Create indexes
CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);
CREATE INDEX IF NOT EXISTS pet_vaccinations_pet_id_idx ON pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS pet_appointments_pet_id_idx ON pet_appointments(pet_id);
CREATE INDEX IF NOT EXISTS pet_medical_records_pet_id_idx ON pet_medical_records(pet_id);
CREATE INDEX IF NOT EXISTS pet_care_schedules_pet_id_idx ON pet_care_schedules(pet_id);
CREATE INDEX IF NOT EXISTS pet_diet_nutrition_pet_id_idx ON pet_diet_nutrition(pet_id);

-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_care_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_diet_nutrition ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for pets
CREATE POLICY "Users can create their own pets"
  ON pets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pets"
  ON pets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON pets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON pets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for pet_vaccinations
CREATE POLICY "Users can create vaccinations for their pets"
  ON pet_vaccinations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view vaccinations for their pets"
  ON pet_vaccinations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update vaccinations for their pets"
  ON pet_vaccinations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete vaccinations for their pets"
  ON pet_vaccinations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Create RLS policies for pet_appointments
CREATE POLICY "Users can create appointments for their pets"
  ON pet_appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view appointments for their pets"
  ON pet_appointments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update appointments for their pets"
  ON pet_appointments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete appointments for their pets"
  ON pet_appointments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Create RLS policies for pet_medical_records
CREATE POLICY "Users can create medical records for their pets"
  ON pet_medical_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view medical records for their pets"
  ON pet_medical_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update medical records for their pets"
  ON pet_medical_records
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete medical records for their pets"
  ON pet_medical_records
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Create RLS policies for pet_care_schedules
CREATE POLICY "Users can create care schedules for their pets"
  ON pet_care_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view care schedules for their pets"
  ON pet_care_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update care schedules for their pets"
  ON pet_care_schedules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete care schedules for their pets"
  ON pet_care_schedules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Create RLS policies for pet_diet_nutrition
CREATE POLICY "Users can create diet info for their pets"
  ON pet_diet_nutrition
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view diet info for their pets"
  ON pet_diet_nutrition
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update diet info for their pets"
  ON pet_diet_nutrition
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete diet info for their pets"
  ON pet_diet_nutrition
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pets
      WHERE pets.id = pet_id
      AND pets.user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_vaccinations_updated_at
  BEFORE UPDATE ON pet_vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_appointments_updated_at
  BEFORE UPDATE ON pet_appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_medical_records_updated_at
  BEFORE UPDATE ON pet_medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_care_schedules_updated_at
  BEFORE UPDATE ON pet_care_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_diet_nutrition_updated_at
  BEFORE UPDATE ON pet_diet_nutrition
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();