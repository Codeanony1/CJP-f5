-- CJP Database Schema
-- Run this SQL in your Supabase SQL Editor to create the required tables

-- Users table (stores member profiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  state TEXT,
  district TEXT,
  occupation TEXT,
  age INTEGER,
  is_admin BOOLEAN DEFAULT FALSE,
  membership_status TEXT DEFAULT 'PENDING' CHECK (membership_status IN ('PENDING', 'APPROVED', 'REJECTED')),
  membership_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Youth Voices table (stores user submissions)
CREATE TABLE IF NOT EXISTS youth_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  occupation TEXT,
  state TEXT,
  district TEXT,
  age INTEGER,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_voices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for youth_voices table
-- Allow users to read their own voices
CREATE POLICY "Users can read own voices" ON youth_voices
  FOR SELECT USING (auth.uid() = user_id);

-- Allow anyone to read approved voices
CREATE POLICY "Anyone can read approved voices" ON youth_voices
  FOR SELECT USING (status = 'APPROVED');

-- Allow users to insert their own voices
CREATE POLICY "Users can insert own voices" ON youth_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own voices
CREATE POLICY "Users can update own voices" ON youth_voices
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_youth_voices_user_id ON youth_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_youth_voices_status ON youth_voices(status);
CREATE INDEX IF NOT EXISTS idx_youth_voices_created_at ON youth_voices(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_youth_voices_updated_at
  BEFORE UPDATE ON youth_voices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
