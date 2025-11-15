/**
 * Supabase Setup Migration
 *
 * Sets up pgvector extension and additional Supabase-specific features
 * Run this after 001_initial_schema.sql if using Supabase
 */

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================

-- Enable pgvector for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- WORD EMBEDDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS word_embeddings (
  id BIGSERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  vector vector(100), -- Adjust dimension based on your embeddings
  language TEXT DEFAULT 'en' NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT word_embeddings_unique UNIQUE(word, language)
);

-- Indexes for word embeddings
CREATE INDEX IF NOT EXISTS word_embeddings_word_idx ON word_embeddings(word);
CREATE INDEX IF NOT EXISTS word_embeddings_language_idx ON word_embeddings(language);

-- Vector similarity index (IVFFlat for cosine similarity)
CREATE INDEX IF NOT EXISTS word_embeddings_vector_idx
  ON word_embeddings USING ivfflat (vector vector_cosine_ops)
  WITH (lists = 100);

-- ============================================================================
-- VECTOR SIMILARITY FUNCTIONS
-- ============================================================================

-- Find similar words using cosine similarity
CREATE OR REPLACE FUNCTION find_similar_words(
  query_vector vector(100),
  match_language TEXT DEFAULT 'en',
  match_limit INT DEFAULT 10
)
RETURNS TABLE (
  word TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    we.word,
    1 - (we.vector <=> query_vector) AS similarity
  FROM word_embeddings we
  WHERE we.language = match_language
  ORDER BY we.vector <=> query_vector
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;

-- Find words within semantic radius
CREATE OR REPLACE FUNCTION find_words_in_radius(
  query_vector vector(100),
  radius FLOAT,
  match_language TEXT DEFAULT 'en'
)
RETURNS TABLE (
  word TEXT,
  distance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    we.word,
    we.vector <=> query_vector AS distance
  FROM word_embeddings we
  WHERE we.language = match_language
    AND we.vector <=> query_vector < radius
  ORDER BY we.vector <=> query_vector;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FRIENDSHIPS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT friendships_unique UNIQUE(user_id, friend_id),
  CONSTRAINT friendships_no_self CHECK (user_id != friend_id)
);

-- Indexes for friendships
CREATE INDEX IF NOT EXISTS friendships_user_id_idx ON friendships(user_id);
CREATE INDEX IF NOT EXISTS friendships_friend_id_idx ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS friendships_status_idx ON friendships(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can read their own game sessions
CREATE POLICY sessions_select_own ON game_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own game sessions
CREATE POLICY sessions_insert_own ON game_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can read leaderboards
CREATE POLICY leaderboard_select_all ON leaderboard_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own leaderboard entries
CREATE POLICY leaderboard_insert_own ON leaderboard_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own season progress
CREATE POLICY season_progress_select_own ON user_season_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can read their friendships
CREATE POLICY friendships_select_own ON friendships
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY friendships_insert_own ON friendships
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update friendship status (accept/block)
CREATE POLICY friendships_update_own ON friendships
  FOR UPDATE
  USING (auth.uid() = friend_id);

-- ============================================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================================

-- Enable realtime for leaderboards
ALTER PUBLICATION supabase_realtime ADD TABLE leaderboard_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE user_season_progress;

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload their own avatar
CREATE POLICY avatar_upload_own ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to avatars
CREATE POLICY avatar_read_all ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON friendships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_season_progress_updated_at
  BEFORE UPDATE ON user_season_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER VIEWS
-- ============================================================================

-- Leaderboard with user info
CREATE OR REPLACE VIEW leaderboard_with_users AS
SELECT
  le.*,
  u.username,
  u.display_name,
  ROW_NUMBER() OVER (PARTITION BY le.game_id, le.mode ORDER BY le.score DESC) as rank
FROM leaderboard_entries le
JOIN users u ON le.user_id = u.id;

-- Season leaderboard with user info
CREATE OR REPLACE VIEW season_leaderboard_with_users AS
SELECT
  usp.*,
  u.username,
  u.display_name,
  ROW_NUMBER() OVER (PARTITION BY usp.season_id ORDER BY usp.total_score DESC) as rank
FROM user_season_progress usp
JOIN users u ON usp.user_id = u.id;

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Supabase setup migration complete!';
  RAISE NOTICE 'pgvector extension enabled';
  RAISE NOTICE 'RLS policies created';
  RAISE NOTICE 'Realtime subscriptions enabled';
END $$;
