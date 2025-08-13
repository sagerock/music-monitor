-- Supabase Migration for Music Monitor
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  genres TEXT[] DEFAULT '{}',
  popularity INTEGER,
  followers BIGINT,
  country TEXT,
  is_major_label BOOLEAN,
  image_url TEXT,
  spotify_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracks table
CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  album_id TEXT,
  album_name TEXT,
  release_date TIMESTAMP WITH TIME ZONE,
  tempo REAL,
  energy REAL,
  danceability REAL,
  valence REAL,
  loudness REAL,
  acousticness REAL,
  instrumentalness REAL,
  speechiness REAL,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Snapshots table
CREATE TABLE IF NOT EXISTS snapshots (
  id BIGSERIAL PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
  popularity INTEGER,
  followers BIGINT,
  tiktok_mentions INTEGER,
  playlist_count INTEGER,
  UNIQUE(artist_id, snapshot_date)
);

-- Create index for snapshots
CREATE INDEX IF NOT EXISTS idx_snapshots_artist_date ON snapshots(artist_id, snapshot_date);

-- Users table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  clerk_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Watchlists table
CREATE TABLE IF NOT EXISTS watchlists (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (user_id, artist_id)
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  artist_id TEXT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  threshold REAL NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for alerts
CREATE INDEX IF NOT EXISTS idx_alerts_user_active ON alerts(user_id, is_active);

-- TikTok data table
CREATE TABLE IF NOT EXISTS tiktok_data (
  id BIGSERIAL PRIMARY KEY,
  artist_name TEXT NOT NULL,
  track_name TEXT,
  mentions INTEGER NOT NULL,
  views BIGINT,
  data_date TIMESTAMP WITH TIME ZONE NOT NULL,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for TikTok data
CREATE INDEX IF NOT EXISTS idx_tiktok_artist_date ON tiktok_data(artist_name, data_date);

-- Job logs table
CREATE TABLE IF NOT EXISTS job_logs (
  id BIGSERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_details JSONB
);

-- Create index for job logs
CREATE INDEX IF NOT EXISTS idx_joblogs_name_started ON job_logs(job_name, started_at);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can only see their own watchlist
CREATE POLICY "Users can view own watchlist" ON watchlists
  FOR ALL USING (auth.uid() = user_id);

-- Users can only see their own alerts
CREATE POLICY "Users can view own alerts" ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- Public read access for artists, tracks, snapshots
CREATE POLICY "Anyone can view artists" ON artists
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view tracks" ON tracks
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view snapshots" ON snapshots
  FOR SELECT USING (true);