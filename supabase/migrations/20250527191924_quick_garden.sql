/*
  # Create tables for student progress app

  1. New Tables
    - `users` - Stores user information and study progress
    - `subjects` - Stores subject information for each user
    - `subject_progress` - Tracks completion of exam topics by subject, specialization and year
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id text UNIQUE NOT NULL,
  username text NOT NULL,
  wilaya text NOT NULL,
  score integer DEFAULT 0,
  weekly_study_time integer DEFAULT 0,
  total_study_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create subject_progress table
CREATE TABLE IF NOT EXISTS subject_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  specialization text NOT NULL,
  year integer NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for the users table
CREATE POLICY "Users can view and update their own data"
  ON users
  FOR ALL
  USING (auth.uid() = id);

-- Create policies for the subjects table
CREATE POLICY "Users can view and update their own subjects"
  ON subjects
  FOR ALL
  USING (auth.uid() = user_id);

-- Create policies for the subject_progress table
CREATE POLICY "Users can view and update their own subject progress"
  ON subject_progress
  FOR ALL
  USING (auth.uid() = user_id);