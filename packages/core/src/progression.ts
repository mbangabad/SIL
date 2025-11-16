/**
 * Player Progression System
 * Streaks, XP, Levels, Daily Goals
 */

export interface PlayerProgress {
  userId: string;
  xp: number;
  level: number;
  streak: number;
  lastPlayedDate: string; // YYYY-MM-DD format
  dailyGoal: DailyGoal;
  badges: Badge[];
  stats: PlayerStats;
}

export interface DailyGoal {
  type: 'games-played' | 'score-threshold' | 'streak-days';
  target: number;
  current: number;
  completed: boolean;
  lastCompletedDate?: string;
  xpReward: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  totalGamesPlayed: number;
  totalPlayTime: number; // milliseconds
  avgScore: number;
  bestScore: number;
  favoriteGame?: string;
  gamesPlayedToday: number;
  lastSessionDate: number;
}

/**
 * XP Awards based on score percentile
 */
export function calculateXP(score: number): number {
  if (score >= 95) return 10; // Top 5%
  if (score >= 90) return 9;  // Top 10%
  if (score >= 80) return 8;  // Top 20%
  if (score >= 70) return 7;
  if (score >= 60) return 6;
  if (score >= 50) return 5;
  if (score >= 40) return 4;
  if (score >= 30) return 3;
  if (score >= 20) return 2;
  return 1; // Participation
}

/**
 * XP required for each level
 * Level n requires n × 50 XP
 */
export function xpForLevel(level: number): number {
  return level * 50;
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): number {
  let level = 1;
  let xpRequired = 0;

  while (xpRequired <= totalXP) {
    level++;
    xpRequired += xpForLevel(level);
  }

  return level - 1;
}

/**
 * XP progress to next level
 */
export function xpProgressToNextLevel(totalXP: number): {
  currentLevel: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  percentage: number;
} {
  const currentLevel = calculateLevel(totalXP);
  const xpForCurrentLevel = Array.from({ length: currentLevel }, (_, i) => xpForLevel(i + 1))
    .reduce((sum, xp) => sum + xp, 0);
  const xpForNextLevel = xpForLevel(currentLevel + 1);
  const xpProgress = totalXP - xpForCurrentLevel;
  const percentage = (xpProgress / xpForNextLevel) * 100;

  return {
    currentLevel,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress,
    percentage,
  };
}

/**
 * Check if streak should continue
 */
export function shouldContinueStreak(lastPlayedDate: string, todayDate: string): boolean {
  const last = new Date(lastPlayedDate);
  const today = new Date(todayDate);

  // Get date strings without time
  const lastDateStr = last.toISOString().split('T')[0];
  const todayDateStr = today.toISOString().split('T')[0];

  // Same day - continue
  if (lastDateStr === todayDateStr) return true;

  // Check if yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return lastDateStr === yesterdayStr;
}

/**
 * Update player progress after game session
 */
export function updateProgress(
  progress: PlayerProgress,
  score: number,
  gameId: string,
  durationMs: number
): PlayerProgress {
  const today = new Date().toISOString().split('T')[0];
  const wasPlayedToday = progress.lastPlayedDate === today;

  // Update streak
  let newStreak = progress.streak;
  if (!wasPlayedToday) {
    if (shouldContinueStreak(progress.lastPlayedDate, today)) {
      newStreak = progress.streak + 1;
    } else {
      newStreak = 1; // Reset streak
    }
  }

  // Award XP
  const xpEarned = calculateXP(score);
  const newXP = progress.xp + xpEarned;
  const newLevel = calculateLevel(newXP);

  // Update daily goal
  const dailyGoal = { ...progress.dailyGoal };
  if (!wasPlayedToday) {
    dailyGoal.current = 1;
    dailyGoal.completed = dailyGoal.current >= dailyGoal.target;
  } else {
    dailyGoal.current = Math.min(dailyGoal.current + 1, dailyGoal.target);
    dailyGoal.completed = dailyGoal.current >= dailyGoal.target;
  }

  if (dailyGoal.completed && dailyGoal.lastCompletedDate !== today) {
    dailyGoal.lastCompletedDate = today;
    // Award bonus XP for completing daily goal
    // (This would be added in a separate flow)
  }

  // Update stats
  const stats: PlayerStats = {
    ...progress.stats,
    totalGamesPlayed: progress.stats.totalGamesPlayed + 1,
    totalPlayTime: progress.stats.totalPlayTime + durationMs,
    avgScore: (progress.stats.avgScore * progress.stats.totalGamesPlayed + score) / (progress.stats.totalGamesPlayed + 1),
    bestScore: Math.max(progress.stats.bestScore, score),
    gamesPlayedToday: wasPlayedToday ? progress.stats.gamesPlayedToday + 1 : 1,
    lastSessionDate: Date.now(),
  };

  // Update favorite game (most played)
  // This would require tracking games played per game
  // For now, keep existing favorite or set to current game
  if (!stats.favoriteGame) {
    stats.favoriteGame = gameId;
  }

  // Check for new badges
  const badges = [...progress.badges];
  badges.push(...checkBadges(progress, newStreak, newLevel, stats));

  return {
    ...progress,
    xp: newXP,
    level: newLevel,
    streak: newStreak,
    lastPlayedDate: today,
    dailyGoal,
    badges,
    stats,
  };
}

/**
 * Check for newly earned badges
 */
export function checkBadges(
  progress: PlayerProgress,
  newStreak: number,
  newLevel: number,
  stats: PlayerStats
): Badge[] {
  const newBadges: Badge[] = [];
  const earnedBadgeIds = new Set(progress.badges.map(b => b.id));

  // Streak badges
  if (newStreak >= 7 && !earnedBadgeIds.has('streak-7')) {
    newBadges.push({
      id: 'streak-7',
      name: '7-Day Streak',
      description: 'Played for 7 days in a row',
      icon: '🔥',
      earnedDate: Date.now(),
      rarity: 'common',
    });
  }

  if (newStreak >= 30 && !earnedBadgeIds.has('streak-30')) {
    newBadges.push({
      id: 'streak-30',
      name: '30-Day Streak',
      description: 'Played for 30 days in a row',
      icon: '🔥🔥',
      earnedDate: Date.now(),
      rarity: 'rare',
    });
  }

  if (newStreak >= 100 && !earnedBadgeIds.has('streak-100')) {
    newBadges.push({
      id: 'streak-100',
      name: 'Century Streak',
      description: 'Played for 100 days in a row',
      icon: '🔥🔥🔥',
      earnedDate: Date.now(),
      rarity: 'legendary',
    });
  }

  // Level badges
  if (newLevel >= 10 && !earnedBadgeIds.has('level-10')) {
    newBadges.push({
      id: 'level-10',
      name: 'Level 10',
      description: 'Reached level 10',
      icon: '⭐',
      earnedDate: Date.now(),
      rarity: 'common',
    });
  }

  if (newLevel >= 50 && !earnedBadgeIds.has('level-50')) {
    newBadges.push({
      id: 'level-50',
      name: 'Level 50',
      description: 'Reached level 50',
      icon: '⭐⭐',
      earnedDate: Date.now(),
      rarity: 'epic',
    });
  }

  // Games played badges
  if (stats.totalGamesPlayed >= 100 && !earnedBadgeIds.has('games-100')) {
    newBadges.push({
      id: 'games-100',
      name: 'Century Player',
      description: 'Played 100 games',
      icon: '🎮',
      earnedDate: Date.now(),
      rarity: 'common',
    });
  }

  if (stats.totalGamesPlayed >= 1000 && !earnedBadgeIds.has('games-1000')) {
    newBadges.push({
      id: 'games-1000',
      name: 'Millennium Player',
      description: 'Played 1000 games',
      icon: '🎮🎮',
      earnedDate: Date.now(),
      rarity: 'legendary',
    });
  }

  // Score badges
  if (stats.bestScore >= 95 && !earnedBadgeIds.has('score-95')) {
    newBadges.push({
      id: 'score-95',
      name: 'Excellence',
      description: 'Scored 95+ on a game',
      icon: '🏆',
      earnedDate: Date.now(),
      rarity: 'rare',
    });
  }

  if (stats.bestScore >= 99 && !earnedBadgeIds.has('score-99')) {
    newBadges.push({
      id: 'score-99',
      name: 'Perfection',
      description: 'Scored 99+ on a game',
      icon: '🏆🏆',
      earnedDate: Date.now(),
      rarity: 'legendary',
    });
  }

  return newBadges;
}

/**
 * Initialize progress for new player
 */
export function initializeProgress(userId: string): PlayerProgress {
  const today = new Date().toISOString().split('T')[0];

  return {
    userId,
    xp: 0,
    level: 1,
    streak: 0,
    lastPlayedDate: today,
    dailyGoal: {
      type: 'games-played',
      target: 3,
      current: 0,
      completed: false,
      xpReward: 20,
    },
    badges: [],
    stats: {
      totalGamesPlayed: 0,
      totalPlayTime: 0,
      avgScore: 0,
      bestScore: 0,
      gamesPlayedToday: 0,
      lastSessionDate: Date.now(),
    },
  };
}

/**
 * Get recommended games for "Today" screen
 * Returns 3 games: one semantic, one math/logic, one spatial
 */
export function getRecommendedGames(allGames: any[], userHistory?: string[]): string[] {
  // Category mappings
  const semanticGames = ['tribes', 'echochain', 'ghost', 'motif', 'flock', 'merge', 'pivotword', 'radial', 'traceword', 'shard', 'spoke', 'warpword', 'vector'];
  const mathGames = ['align', 'numgrip', 'span2d', 'gridlogic', 'shift', 'optima', 'next', 'rotor', 'midpoint', 'inverse', 'risk', 'angle', 'tilt', 'flip', 'matchrate', 'jump', 'balance', 'choice', 'spread', 'harmony', 'order', 'growth', 'pair', 'pack', 'fuse'];
  const spatialGames = ['grip', 'zero', 'ping', 'span', 'cluster', 'colorglyph', 'trace', 'flow', 'tensor', 'splice', 'one', 'loop'];

  // Filter out already played games (if history provided)
  const played = new Set(userHistory || []);

  const getRandomFrom = (category: string[]) => {
    const available = category.filter(id => !played.has(id));
    if (available.length === 0) return category[Math.floor(Math.random() * category.length)];
    return available[Math.floor(Math.random() * available.length)];
  };

  return [
    getRandomFrom(semanticGames),
    getRandomFrom(mathGames),
    getRandomFrom(spatialGames),
  ];
}
