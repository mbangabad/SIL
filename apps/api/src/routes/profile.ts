/**
 * User Profile API Routes
 *
 * Handles user profile retrieval, updates, and brainprint queries
 */

import { Router } from 'express';
import type { User, Brainprint } from '../types/database';
import { getTopSkills, generateBrainprintInsights } from '../services/brainprint';

const router = Router();

/**
 * GET /api/profile/:userId
 * Get user profile with stats
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch from database
    // const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

    const mockUser: User = {
      id: userId,
      email: 'user@example.com',
      username: 'player123',
      display_name: 'Player 123',
      language: 'en',
      tier: 'free',
      brainprint: {
        precision: 75,
        inference: 82,
        divergence: 68,
        vocabulary: 70,
        executive: 65,
        attention: 72,
        totalGames: 45,
        confidenceScore: 85,
      },
      total_games_played: 45,
      created_at: new Date('2025-01-01'),
      updated_at: new Date(),
    };

    res.json({
      success: true,
      user: mockUser,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile'
    });
  }
});

/**
 * PUT /api/profile/:userId
 * Update user profile (username, display_name, language)
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, displayName, language } = req.body;

    // TODO: Update database
    // await db.query(
    //   'UPDATE users SET username = $1, display_name = $2, language = $3, updated_at = NOW() WHERE id = $4',
    //   [username, displayName, language, userId]
    // );

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/profile/:userId/brainprint
 * Get detailed brainprint with insights
 */
router.get('/:userId/brainprint', async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch from database
    const mockBrainprint: Brainprint = {
      precision: 75,
      inference: 82,
      divergence: 68,
      vocabulary: 70,
      executive: 65,
      attention: 72,
      bridging: 78,
      balance: 71,
      creativity: 64,
      affective: 69,
      synesthesia: 73,
      intuition: 77,
      association: 80,
      coherence: 76,
      fluency: 74,
      selectivity: 68,
      focus: 70,
      synthesis: 66,
      innovation: 62,
      decisiveness: 79,
      closure: 67,
      circularity: 65,
      totalGames: 45,
      confidenceScore: 85,
      lastUpdated: new Date(),
    };

    const topSkills = getTopSkills(mockBrainprint, 5);
    const insights = generateBrainprintInsights(mockBrainprint);

    res.json({
      success: true,
      brainprint: mockBrainprint,
      topSkills,
      insights,
    });
  } catch (error) {
    console.error('Brainprint fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brainprint'
    });
  }
});

/**
 * GET /api/profile/:userId/stats
 * Get detailed user statistics
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    // TODO: Fetch from database with aggregations
    // const stats = await db.query(`
    //   SELECT
    //     COUNT(DISTINCT game_id) as unique_games,
    //     AVG(score) as avg_score,
    //     MAX(score) as best_score,
    //     SUM(duration_ms) as total_time_ms
    //   FROM game_sessions
    //   WHERE user_id = $1
    // `, [userId]);

    const mockStats = {
      totalGamesPlayed: 45,
      uniqueGamesPlayed: 8,
      averageScore: 78.5,
      bestScore: 98,
      totalTimeMs: 3600000, // 1 hour
      gamesPerDay: 3.2,
      streakDays: 7,
      badgesEarned: 12,
      currentTier: 'free',
    };

    res.json({
      success: true,
      stats: mockStats,
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user stats'
    });
  }
});

/**
 * GET /api/profile/:userId/history
 * Get user's game session history
 */
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '20', offset = '0', gameId, mode } = req.query;

    // Convert query parameters to numbers
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    // TODO: Fetch from database
    // let query = 'SELECT * FROM game_sessions WHERE user_id = $1';
    // const params = [userId];
    // if (gameId) {
    //   query += ' AND game_id = $2';
    //   params.push(gameId);
    // }
    // query += ' ORDER BY completed_at DESC LIMIT $X OFFSET $Y';

    const mockHistory = [
      {
        id: 'session1',
        gameId: 'GRIP',
        mode: 'oneShot',
        score: 85,
        percentile: 78,
        completedAt: new Date(),
      },
      {
        id: 'session2',
        gameId: 'ZERO',
        mode: 'journey',
        score: 92,
        percentile: 89,
        completedAt: new Date(Date.now() - 3600000),
      },
    ];

    res.json({
      success: true,
      sessions: mockHistory,
      total: 45,
      hasMore: offsetNum + mockHistory.length < 45,
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch session history'
    });
  }
});

export default router;
