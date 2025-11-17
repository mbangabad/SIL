/**
 * Seasons API Routes
 *
 * Handles season data, progress tracking, and seasonal leaderboards
 */

import { Router } from 'express';
import type { Season, UserSeasonProgress } from '../types/database';

const router = Router();

/**
 * GET /api/seasons/active
 * Get currently active season
 */
router.get('/active', async (req, res) => {
  try {
    // TODO: Fetch from database
    // const season = await db.query(`
    //   SELECT * FROM seasons WHERE is_active = true LIMIT 1
    // `);

    const mockSeason: Season = {
      id: 'season-1',
      season_number: 1,
      name: 'Semantic Origins',
      description: 'The inaugural season of the Semantic Intelligence League',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-03-31'),
      is_active: true,
      config: {
        games: ['GRIP', 'ZERO', 'PING', 'SPAN', 'CLUSTER'],
        milestones: [
          {
            id: 'milestone-1',
            name: 'First Steps',
            description: 'Play 10 games',
            requirement: 10,
            reward: 'Bronze Badge',
          },
          {
            id: 'milestone-2',
            name: 'Rising Star',
            description: 'Play 50 games',
            requirement: 50,
            reward: 'Silver Badge',
          },
          {
            id: 'milestone-3',
            name: 'Semantic Master',
            description: 'Play 100 games',
            requirement: 100,
            reward: 'Gold Badge',
          },
        ],
        tierThresholds: {
          novice: 0,
          bronze: 20,
          silver: 50,
          gold: 70,
          platinum: 85,
          diamond: 95,
        },
      },
      created_at: new Date('2024-12-01'),
    };

    res.json({
      success: true,
      season: mockSeason,
    });
  } catch (error) {
    console.error('Active season fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active season'
    });
  }
});

/**
 * GET /api/seasons/:seasonId
 * Get specific season details
 */
router.get('/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;

    // TODO: Fetch from database
    // const season = await db.query('SELECT * FROM seasons WHERE id = $1', [seasonId]);

    const mockSeason: Season = {
      id: seasonId,
      season_number: 1,
      name: 'Semantic Origins',
      description: 'The inaugural season of the Semantic Intelligence League',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-03-31'),
      is_active: true,
      config: {
        games: ['GRIP', 'ZERO', 'PING', 'SPAN', 'CLUSTER'],
        milestones: [],
      },
      created_at: new Date('2024-12-01'),
    };

    res.json({
      success: true,
      season: mockSeason,
    });
  } catch (error) {
    console.error('Season fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch season'
    });
  }
});

/**
 * GET /api/seasons/:seasonId/progress/:userId
 * Get user's progress in a season
 */
router.get('/:seasonId/progress/:userId', async (req, res) => {
  try {
    const { seasonId, userId } = req.params;

    // TODO: Fetch from database
    // const progress = await db.query(`
    //   SELECT * FROM user_season_progress
    //   WHERE season_id = $1 AND user_id = $2
    // `, [seasonId, userId]);

    const mockProgress: UserSeasonProgress = {
      id: 'progress-1',
      user_id: userId,
      season_id: seasonId,
      total_score: 3450,
      games_played: 45,
      rank: 156,
      tier: 'gold',
      milestones_completed: ['milestone-1', 'milestone-2'],
      badges_earned: ['bronze-badge', 'silver-badge', 'first-win'],
      updated_at: new Date(),
      created_at: new Date('2025-01-05'),
    };

    res.json({
      success: true,
      progress: mockProgress,
    });
  } catch (error) {
    console.error('Season progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch season progress'
    });
  }
});

/**
 * GET /api/seasons/:seasonId/leaderboard
 * Get season leaderboard
 */
router.get('/:seasonId/leaderboard', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { limit = '50', offset = '0', userId } = req.query;

    // Convert query parameters to numbers
    const limitNum = Number(limit);
    const offsetNum = Number(offset);

    // TODO: Fetch from database
    // const entries = await db.query(`
    //   SELECT usp.*, u.username, u.display_name
    //   FROM user_season_progress usp
    //   JOIN users u ON usp.user_id = u.id
    //   WHERE usp.season_id = $1
    //   ORDER BY usp.total_score DESC
    //   LIMIT $2 OFFSET $3
    // `, [seasonId, limitNum, offsetNum]);

    const mockLeaderboard = [
      {
        userId: 'user1',
        username: 'season_champion',
        displayName: 'Season Champion',
        totalScore: 8750,
        gamesPlayed: 120,
        rank: 1,
        tier: 'diamond',
        badgesEarned: 15,
      },
      {
        userId: 'user2',
        username: 'rising_star',
        displayName: 'Rising Star',
        totalScore: 7820,
        gamesPlayed: 105,
        rank: 2,
        tier: 'platinum',
        badgesEarned: 12,
      },
      {
        userId: 'user3',
        username: 'contender',
        displayName: 'Contender',
        totalScore: 6950,
        gamesPlayed: 95,
        rank: 3,
        tier: 'platinum',
        badgesEarned: 10,
      },
    ];

    // Find user position if userId provided
    let userPosition = null;
    if (userId) {
      userPosition = mockLeaderboard.find(entry => entry.userId === userId) || {
        userId: userId as string,
        username: 'you',
        displayName: 'You',
        totalScore: 3450,
        gamesPlayed: 45,
        rank: 156,
        tier: 'gold',
        badgesEarned: 3,
      };
    }

    res.json({
      success: true,
      seasonId,
      leaderboard: mockLeaderboard,
      total: 1250,
      hasMore: offsetNum + mockLeaderboard.length < 1250,
      userPosition,
    });
  } catch (error) {
    console.error('Season leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch season leaderboard'
    });
  }
});

/**
 * GET /api/seasons/list
 * Get all seasons (past and present)
 */
router.get('/list/all', async (req, res) => {
  try {
    // TODO: Fetch from database
    // const seasons = await db.query('SELECT * FROM seasons ORDER BY season_number DESC');

    const mockSeasons: Season[] = [
      {
        id: 'season-1',
        season_number: 1,
        name: 'Semantic Origins',
        description: 'The inaugural season',
        start_date: new Date('2025-01-01'),
        end_date: new Date('2025-03-31'),
        is_active: true,
        config: {},
        created_at: new Date('2024-12-01'),
      },
    ];

    res.json({
      success: true,
      seasons: mockSeasons,
    });
  } catch (error) {
    console.error('Seasons list fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasons list'
    });
  }
});

/**
 * POST /api/seasons/:seasonId/milestones/:milestoneId/claim
 * Claim a completed milestone
 */
router.post('/:seasonId/milestones/:milestoneId/claim', async (req, res) => {
  try {
    const { seasonId, milestoneId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'Missing userId'
      });
    }

    // TODO: Verify milestone completion and claim
    // 1. Check if user has met requirements
    // 2. Add milestone to milestones_completed array
    // 3. Award any badges
    // 4. Return updated progress

    res.json({
      success: true,
      message: 'Milestone claimed successfully',
      reward: {
        badge: 'Silver Badge',
        points: 100,
      },
    });
  } catch (error) {
    console.error('Milestone claim error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim milestone'
    });
  }
});

export default router;
