/**
 * Seasons API Routes - Supabase Implementation
 *
 * Handles seasons, progress tracking, and season leaderboards
 */

import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Season, UserSeasonProgress } from '../types/database';

const router = Router();

/**
 * GET /api/seasons/active
 * Get currently active season
 */
router.get('/active', async (req, res) => {
  try {
    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    const now = new Date().toISOString();

    // Fetch active season
    const { data: season, error } = await supabase
      .from('seasons')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('status', 'active')
      .single();

    if (error || !season) {
      return res.status(404).json({
        success: false,
        error: 'No active season',
      });
    }

    res.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Active season fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active season',
    });
  }
});

/**
 * GET /api/seasons/:seasonId
 * Get season details
 */
router.get('/:seasonId', async (req, res) => {
  try {
    const { seasonId } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch season
    const { data: season, error } = await supabase
      .from('seasons')
      .select('*')
      .eq('id', seasonId)
      .single();

    if (error || !season) {
      return res.status(404).json({
        success: false,
        error: 'Season not found',
      });
    }

    res.json({
      success: true,
      season,
    });
  } catch (error) {
    console.error('Season fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch season',
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

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch user's season progress
    const { data: progress, error } = await supabase
      .from('user_season_progress')
      .select('*')
      .eq('season_id', seasonId)
      .eq('user_id', userId)
      .single();

    if (error) {
      // Create default progress if not found
      const defaultProgress: UserSeasonProgress = {
        user_id: userId,
        season_id: seasonId,
        total_score: 0,
        games_played: 0,
        milestones_completed: [],
        rank: null,
        tier: 'novice',
        created_at: new Date(),
        updated_at: new Date(),
      };

      return res.json({
        success: true,
        progress: defaultProgress,
      });
    }

    res.json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
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
    const { limit = 100, offset = 0, userId } = req.query;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch season leaderboard
    const { data: entries, error, count } = await supabase
      .from('user_season_progress')
      .select(`
        *,
        users (username, display_name)
      `, { count: 'exact' })
      .eq('season_id', seasonId)
      .order('total_score', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch leaderboard',
      });
    }

    const leaderboard = entries?.map((entry, index) => ({
      ...entry,
      rank: Number(offset) + index + 1,
      username: entry.users?.username || 'Anonymous',
      displayName: entry.users?.display_name || entry.users?.username || 'Anonymous',
    })) || [];

    // Get user's position if userId provided
    let userPosition = null;
    if (userId) {
      const { data: userEntry } = await supabase
        .from('user_season_progress')
        .select('*')
        .eq('season_id', seasonId)
        .eq('user_id', userId)
        .single();

      if (userEntry) {
        const { count: betterCount } = await supabase
          .from('user_season_progress')
          .select('*', { count: 'exact', head: true })
          .eq('season_id', seasonId)
          .gt('total_score', userEntry.total_score);

        userPosition = {
          rank: (betterCount || 0) + 1,
          score: userEntry.total_score,
          tier: userEntry.tier,
        };
      }
    }

    res.json({
      success: true,
      leaderboard,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (count || 0) > Number(offset) + Number(limit),
      },
      userPosition,
    });
  } catch (error) {
    console.error('Season leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch season leaderboard',
    });
  }
});

/**
 * GET /api/seasons/list
 * Get all seasons
 */
router.get('/list', async (req, res) => {
  try {
    const { status } = req.query;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    let query = supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: seasons, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch seasons',
      });
    }

    res.json({
      success: true,
      seasons: seasons || [],
    });
  } catch (error) {
    console.error('Seasons list fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seasons',
    });
  }
});

/**
 * POST /api/seasons/:seasonId/milestones/claim
 * Claim a milestone reward
 */
router.post('/:seasonId/milestones/claim', async (req, res) => {
  try {
    const { seasonId } = req.params;
    const { userId, milestoneId } = req.body;

    if (!userId || !milestoneId) {
      return res.status(400).json({
        success: false,
        error: 'userId and milestoneId required',
      });
    }

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch user progress
    const { data: progress, error: progressError } = await supabase
      .from('user_season_progress')
      .select('*')
      .eq('season_id', seasonId)
      .eq('user_id', userId)
      .single();

    if (progressError || !progress) {
      return res.status(404).json({
        success: false,
        error: 'Progress not found',
      });
    }

    // Check if milestone already claimed
    if (progress.milestones_completed?.includes(milestoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Milestone already claimed',
      });
    }

    // Fetch season to verify milestone
    const { data: season, error: seasonError } = await supabase
      .from('seasons')
      .select('milestones')
      .eq('id', seasonId)
      .single();

    if (seasonError || !season) {
      return res.status(404).json({
        success: false,
        error: 'Season not found',
      });
    }

    const milestone = season.milestones?.find((m: any) => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({
        success: false,
        error: 'Milestone not found',
      });
    }

    // Verify milestone is achievable
    const isAchieved = progress.total_score >= milestone.requirement;
    if (!isAchieved) {
      return res.status(400).json({
        success: false,
        error: 'Milestone not yet achieved',
      });
    }

    // Update progress with claimed milestone
    const { error: updateError } = await supabase
      .from('user_season_progress')
      .update({
        milestones_completed: [...(progress.milestones_completed || []), milestoneId],
        updated_at: new Date().toISOString(),
      })
      .eq('season_id', seasonId)
      .eq('user_id', userId);

    if (updateError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to claim milestone',
      });
    }

    res.json({
      success: true,
      message: 'Milestone claimed successfully',
      reward: milestone.reward,
    });
  } catch (error) {
    console.error('Milestone claim error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim milestone',
    });
  }
});

export default router;
