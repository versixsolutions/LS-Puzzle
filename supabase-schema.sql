-- ================================================
-- QUEBRA-CABEÇA MÁGICO - SUPABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TABLES
-- ================================================

-- Profiles (linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  consent_ip TEXT,
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Children profiles
CREATE TABLE children (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  birth_date DATE,
  mode_preference TEXT DEFAULT 'neurotypical',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensory configurations (TEA mode)
CREATE TABLE sensory_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE UNIQUE,
  music_enabled BOOLEAN DEFAULT false,
  sfx_enabled BOOLEAN DEFAULT true,
  volume DECIMAL(3,2) DEFAULT 0.30,
  haptic_enabled BOOLEAN DEFAULT true,
  high_contrast BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  auto_hints BOOLEAN DEFAULT true,
  auto_hints_delay INTEGER DEFAULT 15000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  level INTEGER NOT NULL,
  pieces_count INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  abandoned BOOLEAN DEFAULT false,
  total_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  piece_index INTEGER,
  time_ms INTEGER,
  accuracy_first_try BOOLEAN,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encrypted images
CREATE TABLE encrypted_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  encrypted_data TEXT NOT NULL,
  thumbnail_data TEXT,
  iv TEXT NOT NULL,
  moderation_status TEXT DEFAULT 'pending',
  moderation_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level progress
CREATE TABLE level_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  mode TEXT NOT NULL,
  level INTEGER NOT NULL,
  stars INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  best_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(child_id, mode, level)
);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;

-- ================================================
-- RLS POLICIES
-- ================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Children
CREATE POLICY "Parents can view own children" ON children 
  FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own children" ON children 
  FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own children" ON children 
  FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete own children" ON children 
  FOR DELETE USING (auth.uid() = parent_id);

-- Sensory configs
CREATE POLICY "View own sensory configs" ON sensory_configs 
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
CREATE POLICY "Manage own sensory configs" ON sensory_configs 
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Sessions
CREATE POLICY "View own sessions" ON sessions 
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
CREATE POLICY "Insert own sessions" ON sessions 
  FOR INSERT WITH CHECK (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
CREATE POLICY "Update own sessions" ON sessions 
  FOR UPDATE USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Analytics events
CREATE POLICY "View own analytics" ON analytics_events 
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );
CREATE POLICY "Insert own analytics" ON analytics_events 
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM sessions WHERE child_id IN (
        SELECT id FROM children WHERE parent_id = auth.uid()
      )
    )
  );

-- Encrypted images
CREATE POLICY "View own images" ON encrypted_images 
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
CREATE POLICY "Manage own images" ON encrypted_images 
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- Level progress
CREATE POLICY "View own progress" ON level_progress 
  FOR SELECT USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );
CREATE POLICY "Manage own progress" ON level_progress 
  FOR ALL USING (
    child_id IN (SELECT id FROM children WHERE parent_id = auth.uid())
  );

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_sessions_child ON sessions(child_id);
CREATE INDEX idx_sessions_completed ON sessions(completed_at);
CREATE INDEX idx_sessions_mode ON sessions(mode);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_images_child ON encrypted_images(child_id);
CREATE INDEX idx_images_moderation ON encrypted_images(moderation_status);
CREATE INDEX idx_progress_child ON level_progress(child_id);
CREATE INDEX idx_progress_mode_level ON level_progress(mode, level);

-- ================================================
-- FUNCTIONS (OPTIONAL - for analytics)
-- ================================================

-- Function to get child analytics summary
CREATE OR REPLACE FUNCTION get_child_analytics(p_child_id UUID, p_mode TEXT, p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  total_sessions BIGINT,
  total_time_minutes INTEGER,
  avg_time_per_piece INTEGER,
  accuracy_rate DECIMAL,
  levels_completed INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT s.id)::BIGINT as total_sessions,
    (SUM(s.total_time_ms) / 60000)::INTEGER as total_time_minutes,
    (AVG(ae.time_ms))::INTEGER as avg_time_per_piece,
    (AVG(CASE WHEN ae.accuracy_first_try THEN 1.0 ELSE 0.0 END))::DECIMAL as accuracy_rate,
    COUNT(DISTINCT s.level)::INTEGER as levels_completed
  FROM sessions s
  LEFT JOIN analytics_events ae ON ae.session_id = s.id
  WHERE 
    s.child_id = p_child_id
    AND s.mode = p_mode
    AND s.started_at >= NOW() - (p_days || ' days')::INTERVAL
    AND s.completed_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- SEED DATA (OPTIONAL - for testing)
-- ================================================

-- Insert test profile (only for development)
-- INSERT INTO profiles (id, email, pin_hash) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'hash123');

-- Insert test child
-- INSERT INTO children (id, parent_id, name, mode_preference) VALUES
--   ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Test Child', 'tea');

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' ORDER BY table_name;

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public';

-- Check policies
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public';

-- ================================================
-- CLEANUP (if needed)
-- ================================================

-- DROP TABLE IF EXISTS analytics_events CASCADE;
-- DROP TABLE IF EXISTS sessions CASCADE;
-- DROP TABLE IF EXISTS encrypted_images CASCADE;
-- DROP TABLE IF EXISTS level_progress CASCADE;
-- DROP TABLE IF EXISTS sensory_configs CASCADE;
-- DROP TABLE IF EXISTS children CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;
-- DROP FUNCTION IF EXISTS get_child_analytics;
