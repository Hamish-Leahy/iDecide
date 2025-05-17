/*
  # Add Legacy Management Tables

  1. New Tables
    - `legacy_journal_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `date` (date)
      - `mood` (text, optional)
      - `tags` (text[], optional)
      - `images` (text[], optional)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `legacy_letters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `recipient` (text)
      - `subject` (text)
      - `content` (text)
      - `date` (date)
      - `delivery_date` (date, optional)
      - `status` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `legacy_videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text, optional)
      - `date` (date)
      - `url` (text)
      - `thumbnail` (text, optional)
      - `recipients` (text[], optional)
      - `duration` (text)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `legacy_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `date` (date)
      - `category` (text)
      - `tags` (text[], optional)
      - `is_private` (boolean)
      - `is_important` (boolean)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `memory_book_chapters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text, optional)
      - `order` (integer)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

    - `memory_book_pages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `content` (text)
      - `date` (date)
      - `images` (text[], optional)
      - `page_number` (integer)
      - `chapter_id` (uuid, references memory_book_chapters)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create legacy_journal_entries table
CREATE TABLE IF NOT EXISTS legacy_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  mood text,
  tags text[],
  images text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legacy_letters table
CREATE TABLE IF NOT EXISTS legacy_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  delivery_date date,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT valid_letter_status CHECK (status IN ('draft', 'scheduled', 'delivered'))
);

-- Create legacy_videos table
CREATE TABLE IF NOT EXISTS legacy_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  date date NOT NULL,
  url text NOT NULL,
  thumbnail text,
  recipients text[],
  duration text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create legacy_notes table
CREATE TABLE IF NOT EXISTS legacy_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  tags text[],
  is_private boolean DEFAULT false,
  is_important boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memory_book_chapters table
CREATE TABLE IF NOT EXISTS memory_book_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "order" integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create memory_book_pages table
CREATE TABLE IF NOT EXISTS memory_book_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  date date NOT NULL,
  images text[],
  page_number integer NOT NULL,
  chapter_id uuid REFERENCES memory_book_chapters(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS legacy_journal_entries_user_id_idx ON legacy_journal_entries(user_id);
CREATE INDEX IF NOT EXISTS legacy_letters_user_id_idx ON legacy_letters(user_id);
CREATE INDEX IF NOT EXISTS legacy_videos_user_id_idx ON legacy_videos(user_id);
CREATE INDEX IF NOT EXISTS legacy_notes_user_id_idx ON legacy_notes(user_id);
CREATE INDEX IF NOT EXISTS memory_book_chapters_user_id_idx ON memory_book_chapters(user_id);
CREATE INDEX IF NOT EXISTS memory_book_pages_user_id_idx ON memory_book_pages(user_id);
CREATE INDEX IF NOT EXISTS memory_book_pages_chapter_id_idx ON memory_book_pages(chapter_id);

-- Enable RLS
ALTER TABLE legacy_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE legacy_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_book_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_book_pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for legacy_journal_entries
CREATE POLICY "Users can create their own journal entries"
  ON legacy_journal_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own journal entries"
  ON legacy_journal_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
  ON legacy_journal_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
  ON legacy_journal_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for legacy_letters
CREATE POLICY "Users can create their own letters"
  ON legacy_letters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own letters"
  ON legacy_letters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
  ON legacy_letters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
  ON legacy_letters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for legacy_videos
CREATE POLICY "Users can create their own videos"
  ON legacy_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own videos"
  ON legacy_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own videos"
  ON legacy_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own videos"
  ON legacy_videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for legacy_notes
CREATE POLICY "Users can create their own notes"
  ON legacy_notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own notes"
  ON legacy_notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes"
  ON legacy_notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes"
  ON legacy_notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for memory_book_chapters
CREATE POLICY "Users can create their own memory book chapters"
  ON memory_book_chapters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory book chapters"
  ON memory_book_chapters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory book chapters"
  ON memory_book_chapters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory book chapters"
  ON memory_book_chapters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for memory_book_pages
CREATE POLICY "Users can create their own memory book pages"
  ON memory_book_pages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own memory book pages"
  ON memory_book_pages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory book pages"
  ON memory_book_pages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory book pages"
  ON memory_book_pages
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at triggers
CREATE TRIGGER update_legacy_journal_entries_updated_at
  BEFORE UPDATE ON legacy_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_letters_updated_at
  BEFORE UPDATE ON legacy_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_videos_updated_at
  BEFORE UPDATE ON legacy_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legacy_notes_updated_at
  BEFORE UPDATE ON legacy_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_book_chapters_updated_at
  BEFORE UPDATE ON memory_book_chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memory_book_pages_updated_at
  BEFORE UPDATE ON memory_book_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();