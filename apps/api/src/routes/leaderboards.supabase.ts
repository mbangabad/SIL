/**
 * Leaderboards API Routes - Supabase Implementation
 *
 * Handles global, daily, and friend leaderboards
 */

import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { LeaderboardDailyEntry, Friendship } from '../types/database';

// Type for leaderboard entry with joined user data
type LeaderboardEntryWithUser = LeaderboardDailyEntry & {
  users?: {
    username: string | null;
    display_name: string | null;
  } | null;
};

// Type for friendship with user data
type FriendshipWithUser = Friendship & {
  friend_id: string;
};

const router = Router();

/**
 * Calculate tier based on rank
 */
function calculateTier(rank: number): 'legendary' | 'master' | 'expert' | 'advanced' | 'intermediate' | 'novice' {
  if (rank === 1) return 'legendary';
  if (rank <= 10) return 'master';
  if (rank <= 50) return 'expert';
  if (rank <= 200) return 'advanced';
  if (rank <= 1000) return 'intermediate';
  return 'novice';
}

/**
 * GET /api/leaderboards/:gameId/:mode
 * Get global leaderboard for a specific game and mode
 */
router.get('/:gameId/:mode', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch leaderboard entries
    const { data: entries, error, count } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        users (username, display_name)
      `, { count: 'exact' })
      .eq('game_id', gameId)
      .eq('mode', mode)
      .order('score', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
      });
    }

    // Add tiers and format
    const entriesWithTiers = (entries as LeaderboardEntryWithUser[])?.map((entry, index) => ({
      ...entry,
      rank: Number(offset) + index + 1,
      tier: calculateTier(Number(offset) + index + 1),
      username: entry.users?.username || 'Anonymous',
      displayName: entry.users?.display_name || entry.users?.username || 'Anonymous',
    })) || [];

    res.json({
      success: true,
      leaderboard: entriesWithTiers,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (count || 0) > Number(offset) + Number(limit),
      },
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/daily
 * Get daily leaderboard (last 24 hours)
 */
router.get('/:gameId/:mode/daily', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { limit = 100 } = req.query;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString();

    // Fetch daily leaderboard
    const { data: entries, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        users (username, display_name)
      `)
      .eq('game_id', gameId)
      .eq('mode', mode)
      .gte('created_at', yesterday)
      .order('score', { ascending: false })
      .limit(Number(limit));

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch daily leaderboard',
      });
    }

    const entriesWithTiers = (entries as LeaderboardEntryWithUser[])?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      tier: calculateTier(index + 1),
      username: entry.users?.username || 'Anonymous',
      displayName: entry.users?.display_name || entry.users?.username || 'Anonymous',
    })) || [];

    res.json({
      success: true,
      leaderboard: entriesWithTiers,
      period: 'daily',
      since: yesterday,
    });
  } catch (error) {
    console.error('Daily leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily leaderboard',
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/friends
 * Get friends leaderboard
 */
router.get('/:gameId/:mode/friends', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId required',
      });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch user's friends
    const { data: friendships, error: friendError } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (friendError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch friends',
      });
    }

    const friendIds = (friendships as FriendshipWithUser[])?.map(f => f.friend_id) || [];
    const allUserIds = [...friendIds, userId];

    if (allUserIds.length === 0) {
      return res.json({
        success: true,
        leaderboard: [],
        friendCount: 0,
      });
    }

    // Fetch leaderboard for friends
    const { data: entries, error } = await supabase
      .from('leaderboard_entries')
      .select(`
        *,
        users (username, display_name)
      `)
      .eq('game_id', gameId)
      .eq('mode', mode)
      .in('user_id', allUserIds)
      .order('score', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch friends leaderboard',
      });
    }

    const rankedEntries = (entries as LeaderboardEntryWithUser[])?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      username: entry.users?.username || 'Anonymous',
      displayName: entry.users?.display_name || entry.users?.username || 'Anonymous',
      isFriend: entry.user_id !== userId,
    })) || [];

    res.json({
      success: true,
      leaderboard: rankedEntries,
      friendCount: friendIds.length,
    });
  } catch (error) {
    console.error('Friends leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch friends leaderboard',
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/stats
 * Get leaderboard statistics
 */
router.get('/:gameId/:mode/stats', async (req, res) => {
  try {
    const { gameId, mode } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Aggregate stats
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('score')
      .eq('game_id', gameId)
      .eq('mode', mode);

    if (error || !data) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }

    const scores = data.map(entry => entry.score);
    const totalPlayers = scores.length;
    const averageScore = totalPlayers > 0
      ? scores.reduce((sum, s) => sum + s, 0) / totalPlayers
      : 0;
    const topScore = totalPlayers > 0 ? Math.max(...scores) : 0;

    // Calculate median
    const sortedScores = [...scores].sort((a, b) => a - b);
    const median = totalPlayers > 0
      ? sortedScores[Math.floor(totalPlayers / 2)]
      : 0;

    const stats = {
      totalPlayers,
      averageScore: Math.round(averageScore),
      topScore,
      medianScore: median,
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats',
    });
  }
});

/**
 * POST /api/leaderboards/:gameId/:mode/submit
 * Submit a score to the leaderboard
 */
router.post('/:gameId/:mode/submit', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { userId, score, sessionId, metadata } = req.body;

    if (!userId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'userId and score required',
      });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Insert or update leaderboard entry
    const { data: entry, error } = await supabase
      .from('leaderboard_entries')
      .upsert({
        user_id: userId,
        game_id: gameId,
        mode,
        score,
        session_id: sessionId,
        metadata,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to submit score',
      });
    }

    // Get user's rank
    const { count: rank } = await supabase
      .from('leaderboard_entries')
      .select('*', { count: 'exact', head: true })
      .eq('game_id', gameId)
      .eq('mode', mode)
      .gt('score', score);

    const userRank = (rank || 0) + 1;

    res.json({
      success: true,
      result: {
        rank: userRank,
        tier: calculateTier(userRank),
        score,
        improved: true, // TODO: Check if this is better than previous
      },
    });
  } catch (error) {
    console.error('Score submit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit score',
    });
  }
});

export default router;
