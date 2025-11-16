/**
 * Leaderboard API Routes
 *
 * Handles global, daily, and friends leaderboards
 */

import { Router } from 'express';
import type { LeaderboardEntry } from '../services/leaderboards';
import {
  updateRanks,
  paginateLeaderboard,
  getUserPosition,
  calculateTier,
  calculateDailyStats,
} from '../services/leaderboards';

const router = Router();

/**
 * GET /api/leaderboards/:gameId/:mode/global
 * Get global leaderboard for a game/mode
 */
router.get('/:gameId/:mode/global', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { limit = 50, offset = 0, userId } = req.query;

    // TODO: Fetch from database
    // const entries = await db.query(`
    //   SELECT lg.*, u.username, u.display_name
    //   FROM leaderboards_global lg
    //   JOIN users u ON lg.user_id = u.id
    //   WHERE lg.game_id = $1 AND lg.mode = $2
    //   ORDER BY lg.best_score DESC
    // `, [gameId, mode]);

    const mockEntries: LeaderboardEntry[] = [
      {
        userId: 'user1',
        username: 'champion',
        displayName: 'The Champion',
        score: 98,
        rank: 1,
        percentile: 100,
        gamesPlayed: 120,
      },
      {
        userId: 'user2',
        username: 'runner_up',
        displayName: 'Runner Up',
        score: 95,
        rank: 2,
        percentile: 99,
        gamesPlayed: 85,
      },
      {
        userId: 'user3',
        username: 'bronze_star',
        displayName: 'Bronze Star',
        score: 92,
        rank: 3,
        percentile: 97,
        gamesPlayed: 60,
      },
    ];

    // Add tiers
    const entriesWithTiers = mockEntries.map(entry => ({
      ...entry,
      tier: calculateTier(entry.percentile),
    }));

    const paginated = paginateLeaderboard(
      entriesWithTiers,
      Number(limit),
      Number(offset)
    );

    // Get user position if userId provided
    let userPosition = null;
    if (userId) {
      userPosition = getUserPosition(
        userId as string,
        entriesWithTiers,
        5
      );
    }

    res.json({
      success: true,
      gameId,
      mode,
      leaderboard: paginated.entries,
      total: paginated.total,
      hasMore: paginated.hasMore,
      userPosition,
    });
  } catch (error) {
    console.error('Global leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch global leaderboard'
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/daily/:date
 * Get daily leaderboard for a specific date
 */
router.get('/:gameId/:mode/daily/:date', async (req, res) => {
  try {
    const { gameId, mode, date } = req.params;
    const { limit = 50, offset = 0, userId } = req.query;

    // Parse date (YYYY-MM-DD format)
    const targetDate = new Date(date);

    // TODO: Fetch from database
    // const entries = await db.query(`
    //   SELECT ld.*, u.username, u.display_name
    //   FROM leaderboards_daily ld
    //   JOIN users u ON ld.user_id = u.id
    //   WHERE ld.game_id = $1 AND ld.mode = $2 AND ld.date = $3
    //   ORDER BY ld.score DESC
    // `, [gameId, mode, targetDate]);

    const mockEntries: LeaderboardEntry[] = [
      {
        userId: 'user4',
        username: 'daily_king',
        displayName: 'Daily King',
        score: 96,
        rank: 1,
        percentile: 100,
      },
      {
        userId: 'user5',
        username: 'speedster',
        displayName: 'Speedster',
        score: 93,
        rank: 2,
        percentile: 98,
      },
    ];

    const entriesWithTiers = mockEntries.map(entry => ({
      ...entry,
      tier: calculateTier(entry.percentile),
    }));

    const paginated = paginateLeaderboard(
      entriesWithTiers,
      Number(limit),
      Number(offset)
    );

    // Get user position if userId provided
    let userPosition = null;
    if (userId) {
      userPosition = getUserPosition(
        userId as string,
        entriesWithTiers,
        5
      );
    }

    res.json({
      success: true,
      gameId,
      mode,
      date: targetDate,
      leaderboard: paginated.entries,
      total: paginated.total,
      hasMore: paginated.hasMore,
      userPosition,
    });
  } catch (error) {
    console.error('Daily leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily leaderboard'
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/friends/:userId
 * Get friends-only leaderboard
 */
router.get('/:gameId/:mode/friends/:userId', async (req, res) => {
  try {
    const { gameId, mode, userId } = req.params;

    // TODO: Fetch friends from database
    // const friends = await db.query(`
    //   SELECT friend_id FROM friendships
    //   WHERE user_id = $1 AND status = 'accepted'
    // `, [userId]);

    const mockFriendIds = ['friend1', 'friend2', 'friend3'];

    // TODO: Fetch friend scores
    // const entries = await db.query(`
    //   SELECT lg.*, u.username, u.display_name
    //   FROM leaderboards_global lg
    //   JOIN users u ON lg.user_id = u.id
    //   WHERE lg.game_id = $1 AND lg.mode = $2
    //     AND (lg.user_id = $3 OR lg.user_id = ANY($4))
    //   ORDER BY lg.best_score DESC
    // `, [gameId, mode, userId, mockFriendIds]);

    const mockEntries: LeaderboardEntry[] = [
      {
        userId: userId,
        username: 'you',
        displayName: 'You',
        score: 85,
        rank: 2,
        percentile: 75,
        gamesPlayed: 45,
      },
      {
        userId: 'friend1',
        username: 'bestie',
        displayName: 'Best Friend',
        score: 88,
        rank: 1,
        percentile: 85,
        gamesPlayed: 62,
      },
      {
        userId: 'friend2',
        username: 'buddy',
        displayName: 'Buddy',
        score: 80,
        rank: 3,
        percentile: 60,
        gamesPlayed: 38,
      },
    ];

    const rankedEntries = updateRanks(mockEntries);

    res.json({
      success: true,
      gameId,
      mode,
      userId,
      leaderboard: rankedEntries,
      friendCount: mockFriendIds.length,
    });
  } catch (error) {
    console.error('Friends leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch friends leaderboard'
    });
  }
});

/**
 * GET /api/leaderboards/:gameId/:mode/stats
 * Get statistical summary for a game/mode
 */
router.get('/:gameId/:mode/stats', async (req, res) => {
  try {
    const { gameId, mode } = req.params;
    const { date } = req.query;

    // TODO: Fetch from database
    // If date is provided, get daily stats, otherwise global stats

    const mockStats = {
      totalPlayers: 1250,
      averageScore: 72.5,
      medianScore: 75,
      topScore: 98,
      bottomScore: 12,
      tierDistribution: {
        diamond: 62,    // 5%
        platinum: 125,  // 10%
        gold: 187,      // 15%
        silver: 375,    // 30%
        bronze: 501,    // 40%
      },
    };

    res.json({
      success: true,
      gameId,
      mode,
      stats: mockStats,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard stats'
    });
  }
});

/**
 * POST /api/leaderboards/submit
 * Submit a score to leaderboard (called after game completion)
 */
router.post('/submit', async (req, res) => {
  try {
    const { userId, gameId, mode, sessionId, score } = req.body;

    if (!userId || !gameId || !mode || !sessionId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // TODO: Insert or update leaderboard entries
    // 1. Insert into leaderboards_daily
    // 2. Update leaderboards_global (best_score, average_score, games_played)
    // 3. Calculate ranks and percentiles
    // 4. Return user's new rank and percentile

    // Mock response
    const mockResult = {
      dailyRank: 42,
      dailyPercentile: 68,
      globalRank: 156,
      globalPercentile: 72,
      tier: calculateTier(72),
      improved: true,
      previousBest: 82,
    };

    res.json({
      success: true,
      result: mockResult,
    });
  } catch (error) {
    console.error('Leaderboard submit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit score'
    });
  }
});

export default router;
