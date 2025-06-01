-- Create travel destinations table
CREATE TABLE travel_destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  rating NUMERIC(3,1) CHECK (rating >= 0 AND rating <= 5),
  category TEXT[] NOT NULL DEFAULT '{}',
  price_min NUMERIC(10,2) NOT NULL,
  price_max NUMERIC(10,2) NOT NULL,
  price_currency TEXT NOT NULL DEFAULT 'AUD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create travel bookings table
CREATE TABLE travel_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES travel_destinations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0),
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create travel reviews table
CREATE TABLE travel_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES travel_destinations(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create travel preferences table
CREATE TABLE travel_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_categories TEXT[] NOT NULL DEFAULT '{}',
  price_min NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_max NUMERIC(10,2) NOT NULL DEFAULT 10000,
  price_currency TEXT NOT NULL DEFAULT 'AUD',
  preferred_destinations UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE travel_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_preferences ENABLE ROW LEVEL SECURITY;

-- Destinations policies
CREATE POLICY "Destinations are viewable by everyone"
  ON travel_destinations
  FOR SELECT
  TO authenticated
  USING (true);

-- Bookings policies
CREATE POLICY "Users can view their own bookings"
  ON travel_bookings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own bookings"
  ON travel_bookings
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
  ON travel_bookings
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON travel_reviews
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON travel_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews"
  ON travel_reviews
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Preferences policies
CREATE POLICY "Users can view their own preferences"
  ON travel_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own preferences"
  ON travel_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON travel_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_travel_destinations_updated_at
  BEFORE UPDATE ON travel_destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_bookings_updated_at
  BEFORE UPDATE ON travel_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_reviews_updated_at
  BEFORE UPDATE ON travel_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_travel_preferences_updated_at
  BEFORE UPDATE ON travel_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
