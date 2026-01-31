-- Document Collections Feature - Supabase Migration
-- Creates tables for organizing documents into themed learning paths

-- ============================================
-- 1. Collections Table
-- ============================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📚',
  difficulty TEXT CHECK (difficulty IN ('Kolay', 'Orta', 'Zor')),
  order_index INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published collections" ON collections;
CREATE POLICY "Public can view published collections"
  ON collections FOR SELECT
  TO public
  USING (is_public = true);

DROP POLICY IF EXISTS "Admins can manage collections" ON collections;
CREATE POLICY "Admins can manage collections"
  ON collections FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- ============================================
-- 2. Collection Documents Junction Table
-- ============================================
CREATE TABLE IF NOT EXISTS collection_documents (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  document_id TEXT NOT NULL, -- Using TEXT to match existing documents table
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (collection_id, document_id)
);

-- RLS policies for collection_documents
ALTER TABLE collection_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view collection documents" ON collection_documents;
CREATE POLICY "Public can view collection documents"
  ON collection_documents FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can manage collection documents" ON collection_documents;
CREATE POLICY "Admins can manage collection documents"
  ON collection_documents FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = true
  ));

-- ============================================
-- 3. User Collection Progress Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_collection_progress (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  completed_document_ids JSONB DEFAULT '[]'::jsonb,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, collection_id)
);

-- RLS policies for user_collection_progress
ALTER TABLE user_collection_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own progress" ON user_collection_progress;
CREATE POLICY "Users can view own progress"
  ON user_collection_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own progress" ON user_collection_progress;
CREATE POLICY "Users can insert own progress"
  ON user_collection_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own progress" ON user_collection_progress;
CREATE POLICY "Users can update own progress"
  ON user_collection_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- 4. Helper Functions
-- ============================================

-- Function to calculate collection progress percentage
CREATE OR REPLACE FUNCTION calculate_collection_progress(
  p_user_id UUID,
  p_collection_id UUID
) RETURNS INTEGER AS $$
DECLARE
  total_docs INTEGER;
  completed_docs INTEGER;
BEGIN
  -- Get total documents in collection
  SELECT COUNT(*) INTO total_docs
  FROM collection_documents
  WHERE collection_id = p_collection_id;
  
  IF total_docs = 0 THEN
    RETURN 0;
  END IF;
  
  -- Get completed documents count
  SELECT COALESCE(jsonb_array_length(completed_document_ids), 0) INTO completed_docs
  FROM user_collection_progress
  WHERE user_id = p_user_id AND collection_id = p_collection_id;
  
  RETURN (completed_docs * 100 / total_docs);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. Sample Data
-- ============================================

-- Insert default collections
INSERT INTO collections (title, description, icon, difficulty, order_index, is_public) VALUES
  ('Başlangıç Paketi', 'Osmanlıca öğrenmeye yeni başlayanlar için özenle seçilmiş kolay belgeler. Temel kelimeler ve basit cümle yapıları.', '📚', 'Kolay', 1, true),
  ('Orta Seviye', 'Temel bilgiye sahip olanlar için orta zorlukta belgeler. Daha karmaşık kelimeler ve yapılar.', '📖', 'Orta', 2, true),
  ('Uzman Seviyesi', 'İleri düzey okuyucular için zorlu belgeler. Karmaşık dil yapıları ve nadir kelimeler.', '🏆', 'Zor', 3, true),
  ('Fermanlar', 'Osmanlı padişahlarının fermanları. Resmi dilin en güzel örnekleri.', '📜', 'Orta', 4, true),
  ('Ticaret Belgeleri', 'Ticaret, ekonomi ve esnaf hayatına dair belgeler.', '💰', 'Orta', 5, true)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_order ON collections(order_index);
CREATE INDEX IF NOT EXISTS idx_collection_docs_collection ON collection_documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_docs_order ON collection_documents(collection_id, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_collection_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_collection ON user_collection_progress(collection_id);

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Collections feature tables created successfully!';
  RAISE NOTICE 'Run this SQL in Supabase SQL Editor to set up the feature.';
END $$;
