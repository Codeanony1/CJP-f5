-- Create agendas table (for party demands)
CREATE TABLE IF NOT EXISTS agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create youth_voices table (for user submissions)
CREATE TABLE IF NOT EXISTS youth_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voice_comments table
CREATE TABLE IF NOT EXISTS voice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id UUID NOT NULL REFERENCES youth_voices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voice_upvotes table
CREATE TABLE IF NOT EXISTS voice_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id UUID NOT NULL REFERENCES youth_voices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(voice_id, user_id)
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agendas_category ON agendas(category);
CREATE INDEX IF NOT EXISTS idx_agendas_status ON agendas(status);
CREATE INDEX IF NOT EXISTS idx_youth_voices_user_id ON youth_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_youth_voices_status ON youth_voices(status);
CREATE INDEX IF NOT EXISTS idx_voice_comments_voice_id ON voice_comments(voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_upvotes_voice_id ON voice_upvotes(voice_id);

-- Insert sample agendas
INSERT INTO agendas (title, description, category, priority, status) VALUES
  ('Affordable Education', 'Making quality education accessible to all youth across the nation', 'Education', 95, 'active'),
  ('Climate Action', 'Implementing sustainable policies to combat climate change', 'Environment', 90, 'active'),
  ('Healthcare for All', 'Ensuring universal healthcare coverage for youth and families', 'Healthcare', 85, 'active'),
  ('Job Creation', 'Creating 5 million new job opportunities in the next 3 years', 'Economy', 88, 'active'),
  ('Digital Infrastructure', 'Expanding broadband and digital access to rural areas', 'Technology', 80, 'active'),
  ('Agricultural Support', 'Direct support and subsidies for young farmers', 'Agriculture', 75, 'active'),
  ('Infrastructure Development', 'Building modern roads, railways and public transport', 'Infrastructure', 82, 'active'),
  ('Justice Reform', 'Fast-track justice system reform for youth-related cases', 'Justice', 78, 'active')
ON CONFLICT DO NOTHING;
