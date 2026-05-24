-- Create users profile table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  occupation TEXT,
  state TEXT,
  district TEXT,
  phone_number TEXT,
  age INTEGER,
  avatar_url TEXT,
  membership_status TEXT DEFAULT 'PENDING',
  membership_date TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create agendas table for party demands
CREATE TABLE IF NOT EXISTS agendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority INTEGER DEFAULT 100,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create youth_voices table for user submissions
CREATE TABLE IF NOT EXISTS youth_voices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voice_comments table
CREATE TABLE IF NOT EXISTS voice_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id UUID NOT NULL REFERENCES youth_voices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create voice_upvotes table
CREATE TABLE IF NOT EXISTS voice_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voice_id UUID NOT NULL REFERENCES youth_voices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(voice_id, user_id)
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'moderator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_membership_status ON users(membership_status);
CREATE INDEX IF NOT EXISTS idx_agendas_category ON agendas(category);
CREATE INDEX IF NOT EXISTS idx_agendas_status ON agendas(status);
CREATE INDEX IF NOT EXISTS idx_youth_voices_user_id ON youth_voices(user_id);
CREATE INDEX IF NOT EXISTS idx_youth_voices_status ON youth_voices(status);
CREATE INDEX IF NOT EXISTS idx_voice_comments_voice_id ON voice_comments(voice_id);
CREATE INDEX IF NOT EXISTS idx_voice_upvotes_voice_id ON voice_upvotes(voice_id);

-- Enable RLS (Row Level Security) on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE youth_voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for agendas table
CREATE POLICY "Anyone can view agendas" ON agendas
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage agendas" ON agendas
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for youth_voices table
CREATE POLICY "Anyone can view approved voices" ON youth_voices
  FOR SELECT USING (status = 'APPROVED' OR auth.uid() = user_id);

CREATE POLICY "Users can create voices" ON youth_voices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voices" ON youth_voices
  FOR SELECT USING (auth.uid() = user_id OR status = 'APPROVED');

CREATE POLICY "Service role can manage voices" ON youth_voices
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for voice_comments table
CREATE POLICY "Anyone can view comments" ON voice_comments
  FOR SELECT USING (true);

CREATE POLICY "Users can create comments" ON voice_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage comments" ON voice_comments
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for voice_upvotes table
CREATE POLICY "Anyone can view upvotes" ON voice_upvotes
  FOR SELECT USING (true);

CREATE POLICY "Users can create upvotes" ON voice_upvotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage upvotes" ON voice_upvotes
  FOR ALL USING (auth.role() = 'service_role');

-- Create RLS policies for admin_users table
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- Create a trigger to auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, created_at, updated_at)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', now(), now());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO agendas (title, description, category, priority) VALUES
  ('Affordable Education', 'Making quality education accessible to all youth across the nation', 'Education', 95),
  ('Climate Action', 'Implementing sustainable policies to combat climate change', 'Environment', 90),
  ('Healthcare for All', 'Ensuring universal healthcare coverage for youth and families', 'Healthcare', 85),
  ('Job Creation', 'Creating 5 million new job opportunities in the next 3 years', 'Economy', 88),
  ('Digital Infrastructure', 'Expanding broadband and digital access to rural areas', 'Technology', 80),
  ('Agricultural Support', 'Direct support and subsidies for young farmers', 'Agriculture', 75),
  ('Infrastructure Development', 'Building modern roads, railways and public transport', 'Infrastructure', 82),
  ('Justice Reform', 'Fast-track justice system reform for youth-related cases', 'Justice', 78)
ON CONFLICT DO NOTHING;
