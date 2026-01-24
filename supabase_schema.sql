-- ========================================
-- OTTOMAN ARCHIVES DATABASE SCHEMA
-- ========================================
-- Execute this in your Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLES
-- ========================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE
);

-- User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  total_words_learned INTEGER DEFAULT 0,
  documents_completed INTEGER DEFAULT 0,
  practice_sessions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_date DATE,
  UNIQUE(user_id)
);

-- Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement_type TEXT, -- 'words', 'documents', 'streak'
  requirement_count INTEGER
);

-- User Badges Junction Table
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('kolay', 'orta', 'zor')),
  category TEXT,
  year INTEGER,
  transcription JSONB, -- {lines: [{ottoman: '', latin: '', translation: ''}]}
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Word Progress Table
CREATE TABLE IF NOT EXISTS user_word_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  word_ottoman TEXT NOT NULL,
  word_latin TEXT NOT NULL,
  word_translation TEXT,
  mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
  times_practiced INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  marked_difficult BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, word_ottoman)
);

-- User Document Progress Table
CREATE TABLE IF NOT EXISTS user_document_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  practice_count INTEGER DEFAULT 0,
  UNIQUE(user_id, document_id)
);

-- Error Reports Table
CREATE TABLE IF NOT EXISTS error_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  word_ottoman TEXT NOT NULL,
  word_latin_current TEXT NOT NULL,
  word_latin_suggested TEXT NOT NULL,
  description TEXT,
  reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'fixed', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_documents_difficulty ON documents(difficulty);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
CREATE INDEX IF NOT EXISTS idx_error_reports_status ON error_reports(status);
CREATE INDEX IF NOT EXISTS idx_error_reports_document ON error_reports(document_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_document_progress_user ON user_document_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_word_progress_user ON user_word_progress(user_id);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_document_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_reports ENABLE ROW LEVEL SECURITY;

-- Users: Users can read their own data
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

-- Users: Users can update their own profile
CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- User Progress: Users can view and modify their own progress
CREATE POLICY "Users can view own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Badges: Publicly readable
CREATE POLICY "Badges are publicly readable" 
  ON badges FOR SELECT 
  TO authenticated 
  USING (true);

-- User Badges: Users can view their own badges
CREATE POLICY "Users can view own badges" 
  ON user_badges FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges" 
  ON user_badges FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Documents: Publicly readable for authenticated users
CREATE POLICY "Documents are publicly readable" 
  ON documents FOR SELECT 
  TO authenticated 
  USING (true);

-- Documents: Only admins can insert/update/delete
CREATE POLICY "Only admins can modify documents" 
  ON documents FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- User Word Progress: Users can manage their own word progress
CREATE POLICY "Users can view own word progress" 
  ON user_word_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own word progress" 
  ON user_word_progress FOR ALL 
  USING (auth.uid() = user_id);

-- User Document Progress: Users can manage their own document progress
CREATE POLICY "Users can view own document progress" 
  ON user_document_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own document progress" 
  ON user_document_progress FOR ALL 
  USING (auth.uid() = user_id);

-- Error Reports: Users can create reports, admins can manage them
CREATE POLICY "Users can create error reports" 
  ON error_reports FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can view their own reports" 
  ON error_reports FOR SELECT 
  USING (auth.uid() = reported_by);

CREATE POLICY "Admins can view all reports" 
  ON error_reports FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update reports" 
  ON error_reports FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete reports" 
  ON error_reports FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- ========================================
-- INITIAL BADGE DATA
-- ========================================

INSERT INTO badges (name, description, icon, requirement_type, requirement_count) 
VALUES 
  ('İlk Adım', 'İlk belgeyi tamamla', '🎯', 'documents', 1),
  ('On Belge', '10 belge tamamla', '📚', 'documents', 10),
  ('Elli Belge', '50 belge tamamla', '🏆', 'documents', 50),
  ('Yüz Kelime', '100 kelime öğren', '💬', 'words', 100),
  ('Beş Yüz Kelime', '500 kelime öğren', '🌟', 'words', 500),
  ('Bin Kelime', '1000 kelime öğren', '👑', 'words', 1000),
  ('Bir Hafta', '7 gün üst üste pratik yap', '🔥', 'streak', 7),
  ('Bir Ay', '30 gün üst üste pratik yap', '💪', 'streak', 30)
ON CONFLICT DO NOTHING;

-- ========================================
-- HELPER FUNCTIONS
-- ========================================

-- Function to update document updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update documents updated_at
CREATE TRIGGER update_documents_updated_at 
  BEFORE UPDATE ON documents 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE BUCKET FOR DOCUMENT IMAGES
-- ========================================

-- Create storage bucket (run this in Supabase Dashboard > Storage manually)
-- Bucket name: 'document-images'
-- Public: true (for easy access)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- RLS policy for storage will be:
-- - Anyone authenticated can upload
-- - Anyone can view (public bucket)
