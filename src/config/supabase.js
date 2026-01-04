import { createClient } from '@supabase/supabase-js'

// Supabase Free Tier Configuration
// Sign up at https://supabase.com and get your credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'quebra-cabeca-magico'
    }
  }
})

// Database Schema (Run this in Supabase SQL Editor)
/*
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (handled by Supabase Auth)
-- Profiles table
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
  mode_preference TEXT DEFAULT 'neurotypical', -- 'neurotypical' or 'tea'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensory configurations for TEA mode
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
  mode TEXT NOT NULL, -- 'neurotypical' or 'tea'
  level INTEGER NOT NULL,
  pieces_count INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  abandoned BOOLEAN DEFAULT false,
  total_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events for TEA mode
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'piece_placed', 'hint_used', 'frustration_detected', etc.
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
  encrypted_data TEXT NOT NULL, -- Base64 encrypted image
  thumbnail_data TEXT, -- Small unencrypted preview
  iv TEXT NOT NULL, -- Initialization vector for AES
  moderation_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
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

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensory_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Parents can view own children" ON children FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert own children" ON children FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update own children" ON children FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "View own sensory configs" ON sensory_configs FOR SELECT 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Manage own sensory configs" ON sensory_configs FOR ALL 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "View own sessions" ON sessions FOR SELECT 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Insert own sessions" ON sessions FOR INSERT 
  WITH CHECK (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "View own analytics" ON analytics_events FOR SELECT 
  USING (session_id IN (SELECT id FROM sessions WHERE child_id IN 
    (SELECT id FROM children WHERE parent_id = auth.uid())));
CREATE POLICY "Insert own analytics" ON analytics_events FOR INSERT 
  WITH CHECK (session_id IN (SELECT id FROM sessions WHERE child_id IN 
    (SELECT id FROM children WHERE parent_id = auth.uid())));

CREATE POLICY "View own images" ON encrypted_images FOR SELECT 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Manage own images" ON encrypted_images FOR ALL 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

CREATE POLICY "View own progress" ON level_progress FOR SELECT 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));
CREATE POLICY "Manage own progress" ON level_progress FOR ALL 
  USING (child_id IN (SELECT id FROM children WHERE parent_id = auth.uid()));

-- Indexes for performance
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_sessions_child ON sessions(child_id);
CREATE INDEX idx_sessions_completed ON sessions(completed_at);
CREATE INDEX idx_analytics_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_created ON analytics_events(created_at);
CREATE INDEX idx_images_child ON encrypted_images(child_id);
CREATE INDEX idx_progress_child ON level_progress(child_id);
*/

export default supabase
