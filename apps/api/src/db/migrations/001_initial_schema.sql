-- ============================================================================
-- SIL Database Schema - Initial Migration
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  display_name TEXT,
  language TEXT DEFAULT 'en',
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'elite')),
  brainprint JSONB DEFAULT '{}',
  total_games_played INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- GAME SESSIONS TABLE
-- ============================================================================

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('oneShot', 'journey', 'arena', 'endurance')),
  seed TEXT NOT NULL,

  -- Game state and results
  initial_state JSONB,
  final_state JSONB,
  score NUMERIC(10, 2) NOT NULL,
  accuracy NUMERIC(10, 2),
  percentile NUMERIC(5, 2),

  -- Performance metrics
  duration_ms INTEGER NOT NULL,
  actions_count INTEGER DEFAULT 0,

  -- Skill signals for brainprint
  skill_signals JSONB DEFAULT '{}',

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_mode ON game_sessions(mode);
CREATE INDEX idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX idx_game_sessions_completed_at ON game_sessions(completed_at DESC);
CREATE INDEX idx_game_sessions_seed ON game_sessions(seed);

-- ============================================================================
-- LEADERBOARDS - DAILY
-- ============================================================================

CREATE TABLE leaderboards_daily (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  date DATE NOT NULL,

  score NUMERIC(10, 2) NOT NULL,
  percentile NUMERIC(5, 2),
  rank INTEGER,

  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, game_id, mode, date)
);

CREATE INDEX idx_leaderboards_daily_game_date ON leaderboards_daily(game_id, date);
CREATE INDEX idx_leaderboards_daily_score ON leaderboards_daily(score DESC);
CREATE INDEX idx_leaderboards_daily_rank ON leaderboards_daily(rank);

-- ============================================================================
-- LEADERBOARDS - GLOBAL (ALL-TIME)
-- ============================================================================

CREATE TABLE leaderboards_global (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,

  best_score NUMERIC(10, 2) NOT NULL,
  average_score NUMERIC(10, 2),
  games_played INTEGER DEFAULT 1,

  best_session_id UUID REFERENCES game_sessions(id),

  rank INTEGER,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, game_id, mode)
);

CREATE INDEX idx_leaderboards_global_game ON leaderboards_global(game_id, mode);
CREATE INDEX idx_leaderboards_global_score ON leaderboards_global(best_score DESC);
CREATE INDEX idx_leaderboards_global_rank ON leaderboards_global(rank);

-- ============================================================================
-- SEASONS TABLE
-- ============================================================================

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season_number INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,

  is_active BOOLEAN DEFAULT FALSE,

  -- Season configuration
  config JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_seasons_active ON seasons(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_seasons_dates ON seasons(start_date, end_date);

-- ============================================================================
-- USER SEASON PROGRESS
-- ============================================================================

CREATE TABLE user_season_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,

  total_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  rank INTEGER,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),

  -- Progress tracking
  milestones_completed JSONB DEFAULT '[]',
  badges_earned JSONB DEFAULT '[]',

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, season_id)
);

CREATE INDEX idx_user_season_progress_season ON user_season_progress(season_id);
CREATE INDEX idx_user_season_progress_rank ON user_season_progress(rank);
CREATE INDEX idx_user_season_progress_score ON user_season_progress(total_score DESC);

-- ============================================================================
-- BADGES TABLE
-- ============================================================================

CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),

  -- Unlock criteria
  criteria JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_badges_rarity ON badges(rarity);

-- ============================================================================
-- USER BADGES (JUNCTION TABLE)
-- ============================================================================

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,

  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  season_id UUID REFERENCES seasons(id),

  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_earned_at ON user_badges(earned_at DESC);

-- ============================================================================
-- FRIENDS TABLE
-- ============================================================================

CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_global_updated_at BEFORE UPDATE ON leaderboards_global
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_season_progress_updated_at BEFORE UPDATE ON user_season_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: User stats summary
CREATE VIEW user_stats AS
SELECT
  u.id,
  u.username,
  u.display_name,
  u.tier,
  u.total_games_played,
  u.brainprint,
  COUNT(DISTINCT gs.game_id) as unique_games_played,
  AVG(gs.score) as average_score,
  MAX(gs.score) as best_score,
  COUNT(ub.id) as badges_count
FROM users u
LEFT JOIN game_sessions gs ON u.id = gs.user_id
LEFT JOIN user_badges ub ON u.id = ub.user_id
GROUP BY u.id;

-- View: Active season
CREATE VIEW active_season AS
SELECT * FROM seasons
WHERE is_active = TRUE
LIMIT 1;

COMMENT ON TABLE users IS 'User accounts and profiles';
COMMENT ON TABLE game_sessions IS 'Individual game play sessions and results';
COMMENT ON TABLE leaderboards_daily IS 'Daily leaderboards for each game/mode combination';
COMMENT ON TABLE leaderboards_global IS 'All-time best scores and rankings';
COMMENT ON TABLE seasons IS 'Competitive seasons with start/end dates';
COMMENT ON TABLE user_season_progress IS 'User progress and rankings within seasons';
COMMENT ON TABLE badges IS 'Available badges and their unlock criteria';
COMMENT ON TABLE user_badges IS 'Badges earned by users';
COMMENT ON TABLE friendships IS 'Friend connections between users';
