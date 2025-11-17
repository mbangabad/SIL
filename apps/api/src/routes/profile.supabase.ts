/**
 * User Profile API Routes - Supabase Implementation
 *
 * Handles user profile retrieval, updates, and brainprint queries
 */

import { Router } from 'express';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Brainprint, GameSession } from '../types/database';
import { getTopSkills, generateBrainprintInsights } from '../services/brainprint';

// Type for user update data
type UserUpdateData = {
  username?: string;
  display_name?: string;
  language?: string;
  updated_at: string;
};

const router = Router();

/**
 * GET /api/profile/:userId
 * Get user profile with stats
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user profile',
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

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Update user in Supabase
    const updateData: UserUpdateData = {
      username,
      display_name: displayName,
      language,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: data,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
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

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch brainprint from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('brainprint, total_games_played')
      .eq('id', userId)
      .single();

    const userData = user as unknown as User;
    if (error || !userData || !userData.brainprint) {
      return res.status(404).json({
        success: false,
        error: 'Brainprint not found',
      });
    }

    const brainprint = userData.brainprint as Brainprint;
    const topSkills = getTopSkills(brainprint, 5);
    const insights = generateBrainprintInsights(brainprint);

    res.json({
      success: true,
      brainprint,
      topSkills,
      insights,
    });
  } catch (error) {
    console.error('Brainprint fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brainprint',
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

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch game sessions for stats aggregation
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('game_id, mode, score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (sessionsError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch stats',
      });
    }

    // Aggregate statistics
    const sessionData = sessions as GameSession[];
    const totalGames = sessionData?.length || 0;
    const averageScore =
      totalGames > 0
        ? sessionData!.reduce((sum, s) => sum + s.score, 0) / totalGames
        : 0;

    const gamesPerMode = sessionData?.reduce((acc, s) => {
      acc[s.mode] = (acc[s.mode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const favoriteGames = sessionData
      ?.reduce((acc, s) => {
        acc[s.game_id] = (acc[s.game_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topGame = favoriteGames
      ? Object.entries(favoriteGames).sort(([, a], [, b]) => b - a)[0]
      : null;

    // Calculate streaks
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const playedToday = sessionData?.some(
      s => s.created_at.toString().split('T')[0] === today
    );
    const playedYesterday = sessionData?.some(
      s => s.created_at.toString().split('T')[0] === yesterday
    );

    const currentStreak = playedToday ?
      (playedYesterday ? 2 : 1) : 0; // Simplified streak calculation

    const stats = {
      totalGames,
      averageScore: Math.round(averageScore),
      gamesPerMode,
      favoriteGame: topGame ? topGame[0] : null,
      currentStreak,
      bestScore: sessionData && sessionData.length > 0
        ? Math.max(...sessionData.map(s => s.score))
        : 0,
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
 * GET /api/profile/:userId/history
 * Get user's game session history
 */
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    if (!isSupabaseConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'Database not configured',
      });
    }

    // Fetch game sessions with pagination
    const { data: sessions, error, count } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch history',
      });
    }

    res.json({
      success: true,
      sessions: sessions || [],
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: (count || 0) > Number(offset) + Number(limit),
      },
    });
  } catch (error) {
    console.error('History fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history',
    });
  }
});

export default router;
