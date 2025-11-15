/**
 * Leaderboard Service
 *
 * Handles leaderboard operations, rankings, and percentile calculations
 */

import type { LeaderboardDailyEntry, LeaderboardGlobalEntry } from '../types/database';

export interface LeaderboardEntry {
  userId: string;
  username: string | null;
  displayName: string | null;
  score: number;
  rank: number;
  percentile: number;
  gamesPlayed?: number;
}

export interface LeaderboardQuery {
  gameId: string;
  mode: string;
  date?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Calculate percentile rank for a score
 *
 * @param score - The score to rank
 * @param allScores - Array of all scores (sorted descending)
 * @returns Percentile (0-100, where 100 is best)
 */
export function calculatePercentile(score: number, allScores: number[]): number {
  if (allScores.length === 0) return 100;

  const sortedScores = [...allScores].sort((a, b) => b - a);
  const betterCount = sortedScores.filter(s => s > score).length;

  const percentile = ((allScores.length - betterCount) / allScores.length) * 100;
  return Math.round(percentile);
}

/**
 * Calculate rank from score
 *
 * @param score - The score to rank
 * @param allScores - Array of all scores (sorted descending)
 * @returns Rank (1-based)
 */
export function calculateRank(score: number, allScores: number[]): number {
  const sortedScores = [...allScores].sort((a, b) => b - a);
  const betterCount = sortedScores.filter(s => s > score).length;
  return betterCount + 1;
}

/**
 * Update ranks for all entries in a leaderboard
 *
 * @param entries - Leaderboard entries to rank
 * @returns Entries with updated ranks
 */
export function updateRanks<T extends { score: number }>(
  entries: T[]
): Array<T & { rank: number; percentile: number }> {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const scores = sorted.map(e => e.score);

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    percentile: calculatePercentile(entry.score, scores),
  }));
}

/**
 * Get leaderboard page with pagination
 *
 * @param entries - All leaderboard entries
 * @param limit - Number of entries per page
 * @param offset - Starting position
 * @returns Paginated entries
 */
export function paginateLeaderboard<T>(
  entries: T[],
  limit: number = 50,
  offset: number = 0
): {
  entries: T[];
  total: number;
  hasMore: boolean;
} {
  const paginated = entries.slice(offset, offset + limit);

  return {
    entries: paginated,
    total: entries.length,
    hasMore: offset + limit < entries.length,
  };
}

/**
 * Get user's position in leaderboard
 *
 * @param userId - User ID to find
 * @param entries - Leaderboard entries (ranked)
 * @returns User's entry with surrounding context
 */
export function getUserPosition<T extends { userId: string; rank: number }>(
  userId: string,
  entries: T[],
  contextSize: number = 5
): {
  userEntry: T | null;
  above: T[];
  below: T[];
} {
  const userIndex = entries.findIndex(e => e.userId === userId);

  if (userIndex === -1) {
    return {
      userEntry: null,
      above: [],
      below: [],
    };
  }

  const userEntry = entries[userIndex];
  const above = entries.slice(Math.max(0, userIndex - contextSize), userIndex);
  const below = entries.slice(userIndex + 1, userIndex + 1 + contextSize);

  return {
    userEntry,
    above,
    below,
  };
}

/**
 * Get friends leaderboard for a user
 *
 * @param userId - User ID
 * @param friendIds - Array of friend user IDs
 * @param allEntries - All leaderboard entries
 * @returns Leaderboard with only user and friends
 */
export function getFriendsLeaderboard<T extends { userId: string; score: number }>(
  userId: string,
  friendIds: string[],
  allEntries: T[]
): Array<T & { rank: number; percentile: number }> {
  const relevantUsers = new Set([userId, ...friendIds]);
  const friendsEntries = allEntries.filter(e => relevantUsers.has(e.userId));

  return updateRanks(friendsEntries);
}

/**
 * Calculate tier based on percentile
 *
 * @param percentile - User's percentile (0-100)
 * @returns Tier name
 */
export function calculateTier(percentile: number): 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' {
  if (percentile >= 95) return 'diamond';
  if (percentile >= 85) return 'platinum';
  if (percentile >= 70) return 'gold';
  if (percentile >= 50) return 'silver';
  return 'bronze';
}

/**
 * Get tier thresholds (percentiles needed for each tier)
 */
export const TIER_THRESHOLDS = {
  bronze: 0,
  silver: 50,
  gold: 70,
  platinum: 85,
  diamond: 95,
};

/**
 * Calculate daily leaderboard stats
 *
 * @param entries - Daily leaderboard entries
 * @returns Statistics summary
 */
export function calculateDailyStats(entries: LeaderboardDailyEntry[]): {
  totalPlayers: number;
  averageScore: number;
  medianScore: number;
  topScore: number;
  bottomScore: number;
} {
  if (entries.length === 0) {
    return {
      totalPlayers: 0,
      averageScore: 0,
      medianScore: 0,
      topScore: 0,
      bottomScore: 0,
    };
  }

  const scores = entries.map(e => Number(e.score)).sort((a, b) => b - a);
  const totalPlayers = entries.length;
  const averageScore = scores.reduce((sum, s) => sum + s, 0) / totalPlayers;
  const medianScore = scores[Math.floor(totalPlayers / 2)];
  const topScore = scores[0];
  const bottomScore = scores[scores.length - 1];

  return {
    totalPlayers,
    averageScore: Math.round(averageScore * 100) / 100,
    medianScore,
    topScore,
    bottomScore,
  };
}

/**
 * Merge global leaderboard entry with new score
 *
 * @param existing - Existing global entry (if any)
 * @param newScore - New score from session
 * @param sessionId - Session ID
 * @returns Updated global entry data
 */
export function mergeGlobalEntry(
  existing: LeaderboardGlobalEntry | null,
  newScore: number,
  sessionId: string
): Partial<LeaderboardGlobalEntry> {
  if (!existing) {
    return {
      best_score: newScore,
      average_score: newScore,
      games_played: 1,
      best_session_id: sessionId,
    };
  }

  const gamesPlayed = existing.games_played + 1;
  const bestScore = Math.max(Number(existing.best_score), newScore);
  const averageScore =
    (Number(existing.average_score || existing.best_score) * existing.games_played + newScore) /
    gamesPlayed;

  return {
    best_score: bestScore,
    average_score: Math.round(averageScore * 100) / 100,
    games_played: gamesPlayed,
    best_session_id: bestScore === newScore ? sessionId : existing.best_session_id,
  };
}

/**
 * Format leaderboard entry for API response
 *
 * @param entry - Raw database entry
 * @param userData - Additional user data
 * @returns Formatted entry
 */
export function formatLeaderboardEntry(
  entry: any,
  userData?: { username: string | null; displayName: string | null }
): LeaderboardEntry {
  return {
    userId: entry.user_id,
    username: userData?.username || null,
    displayName: userData?.displayName || null,
    score: Number(entry.score || entry.best_score),
    rank: entry.rank || 0,
    percentile: entry.percentile || 0,
    gamesPlayed: entry.games_played,
  };
}
