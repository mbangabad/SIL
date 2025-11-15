/**
 * Database type definitions
 * Corresponds to PostgreSQL/Supabase schema
 */

export interface User {
  id: string;
  email: string;
  username: string | null;
  display_name: string | null;
  language: string;
  tier: 'free' | 'pro' | 'elite';
  brainprint: Brainprint;
  total_games_played: number;
  created_at: Date;
  updated_at: Date;
}

export interface Brainprint {
  // Cognitive dimensions (0-100 scale)
  precision?: number;
  inference?: number;
  divergence?: number;
  vocabulary?: number;
  executive?: number;
  attention?: number;
  bridging?: number;
  balance?: number;
  creativity?: number;
  affective?: number;
  synesthesia?: number;
  intuition?: number;
  association?: number;
  coherence?: number;
  fluency?: number;
  selectivity?: number;
  focus?: number;
  synthesis?: number;
  innovation?: number;
  decisiveness?: number;
  closure?: number;
  circularity?: number;

  // Meta information
  lastUpdated?: Date;
  totalGames?: number;
  confidenceScore?: number;
}

export interface GameSession {
  id: string;
  user_id: string;
  game_id: string;
  mode: 'oneShot' | 'journey' | 'arena' | 'endurance';
  seed: string;

  initial_state: any;
  final_state: any;
  score: number;
  accuracy: number | null;
  percentile: number | null;

  duration_ms: number;
  actions_count: number;

  skill_signals: Record<string, number>;
  metadata: any;

  started_at: Date;
  completed_at: Date;
  created_at: Date;
}

export interface LeaderboardDailyEntry {
  id: string;
  user_id: string;
  game_id: string;
  mode: string;
  date: Date;
  score: number;
  percentile: number | null;
  rank: number | null;
  session_id: string;
  created_at: Date;
}

export interface LeaderboardGlobalEntry {
  id: string;
  user_id: string;
  game_id: string;
  mode: string;
  best_score: number;
  average_score: number | null;
  games_played: number;
  best_session_id: string | null;
  rank: number | null;
  updated_at: Date;
  created_at: Date;
}

export interface Season {
  id: string;
  season_number: number;
  name: string;
  description: string | null;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
  config: SeasonConfig;
  created_at: Date;
}

export interface SeasonConfig {
  games?: string[]; // List of game IDs included in this season
  milestones?: Milestone[];
  tierThresholds?: {
    bronze: number;
    silver: number;
    gold: number;
    platinum: number;
    diamond: number;
  };
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requirement: number;
  reward?: string;
}

export interface UserSeasonProgress {
  id: string;
  user_id: string;
  season_id: string;
  total_score: number;
  games_played: number;
  rank: number | null;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  milestones_completed: string[];
  badges_earned: string[];
  updated_at: Date;
  created_at: Date;
}

export interface Badge {
  id: string;
  badge_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: BadgeCriteria;
  created_at: Date;
}

export interface BadgeCriteria {
  type: 'score' | 'games_played' | 'streak' | 'perfect' | 'milestone';
  condition: any;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: Date;
  season_id: string | null;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: Date;
  updated_at: Date;
}

// View types
export interface UserStats {
  id: string;
  username: string | null;
  display_name: string | null;
  tier: string;
  total_games_played: number;
  brainprint: Brainprint;
  unique_games_played: number;
  average_score: number;
  best_score: number;
  badges_count: number;
}
