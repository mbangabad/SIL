/**
 * Brainprint Calculation Service
 *
 * Aggregates skill signals from game sessions to build user's cognitive profile
 */

import type { Brainprint, GameSession } from '../types/database';

/**
 * Calculate or update a user's brainprint from their game sessions
 *
 * @param sessions - Array of game sessions for the user
 * @param existingBrainprint - Current brainprint (if any)
 * @returns Updated brainprint
 */
export function calculateBrainprint(
  sessions: GameSession[],
  existingBrainprint?: Brainprint
): Brainprint {
  if (sessions.length === 0) {
    return existingBrainprint || {};
  }

  // Aggregate all skill signals
  const signalAggregates: Map<string, number[]> = new Map();

  for (const session of sessions) {
    if (!session.skill_signals) continue;

    for (const [skill, value] of Object.entries(session.skill_signals)) {
      if (typeof value === 'number') {
        if (!signalAggregates.has(skill)) {
          signalAggregates.set(skill, []);
        }
        signalAggregates.get(skill)!.push(value);
      }
    }
  }

  // Calculate averages for each skill
  const brainprint: Brainprint = {
    ...existingBrainprint,
  };

  for (const [skill, values] of signalAggregates.entries()) {
    const average = values.reduce((sum, v) => sum + v, 0) / values.length;
    (brainprint as any)[skill] = Math.round(average);
  }

  // Add meta information
  brainprint.lastUpdated = new Date();
  brainprint.totalGames = sessions.length;
  brainprint.confidenceScore = calculateConfidenceScore(sessions.length);

  return brainprint;
}

/**
 * Calculate incremental brainprint update (more efficient for single session)
 *
 * @param currentBrainprint - Current brainprint
 * @param newSession - New game session
 * @param totalGamesPlayed - Total number of games played by user
 * @returns Updated brainprint
 */
export function updateBrainprintIncremental(
  currentBrainprint: Brainprint,
  newSession: GameSession,
  totalGamesPlayed: number
): Brainprint {
  const brainprint = { ...currentBrainprint };

  if (!newSession.skill_signals) {
    return brainprint;
  }

  // Use exponential moving average to weight recent games more
  const alpha = Math.min(0.3, 1 / Math.sqrt(totalGamesPlayed)); // Decay factor

  for (const [skill, newValue] of Object.entries(newSession.skill_signals)) {
    if (typeof newValue === 'number') {
      const currentValue = (brainprint as any)[skill] || 50; // Default to 50 if not present
      const updatedValue = currentValue * (1 - alpha) + newValue * alpha;
      (brainprint as any)[skill] = Math.round(updatedValue);
    }
  }

  // Update meta information
  brainprint.lastUpdated = new Date();
  brainprint.totalGames = totalGamesPlayed;
  brainprint.confidenceScore = calculateConfidenceScore(totalGamesPlayed);

  return brainprint;
}

/**
 * Calculate confidence score based on number of games played
 *
 * More games = higher confidence in the brainprint accuracy
 *
 * @param gamesPlayed - Number of games played
 * @returns Confidence score (0-100)
 */
function calculateConfidenceScore(gamesPlayed: number): number {
  // Logarithmic scale: confidence increases quickly at first, then plateaus
  // 10 games = ~60% confidence
  // 50 games = ~85% confidence
  // 100+ games = ~95% confidence

  if (gamesPlayed === 0) return 0;
  if (gamesPlayed >= 100) return 95;

  const score = 30 + 20 * Math.log10(gamesPlayed);
  return Math.round(Math.min(95, Math.max(0, score)));
}

/**
 * Get top skills from brainprint
 *
 * @param brainprint - User's brainprint
 * @param count - Number of top skills to return
 * @returns Array of {skill, value} sorted by value descending
 */
export function getTopSkills(
  brainprint: Brainprint,
  count: number = 5
): Array<{ skill: string; value: number }> {
  const skills: Array<{ skill: string; value: number }> = [];

  for (const [skill, value] of Object.entries(brainprint)) {
    if (
      typeof value === 'number' &&
      skill !== 'totalGames' &&
      skill !== 'confidenceScore'
    ) {
      skills.push({ skill, value });
    }
  }

  return skills
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

/**
 * Compare two brainprints and get differences
 *
 * @param brainprintA - First brainprint
 * @param brainprintB - Second brainprint
 * @returns Map of skill to difference (B - A)
 */
export function compareBrainprints(
  brainprintA: Brainprint,
  brainprintB: Brainprint
): Map<string, number> {
  const differences = new Map<string, number>();

  const allSkills = new Set([
    ...Object.keys(brainprintA),
    ...Object.keys(brainprintB),
  ]);

  for (const skill of allSkills) {
    if (
      skill === 'lastUpdated' ||
      skill === 'totalGames' ||
      skill === 'confidenceScore'
    ) {
      continue;
    }

    const valueA = (brainprintA as any)[skill] || 0;
    const valueB = (brainprintB as any)[skill] || 0;

    if (typeof valueA === 'number' && typeof valueB === 'number') {
      differences.set(skill, valueB - valueA);
    }
  }

  return differences;
}

/**
 * Get skill category distribution
 *
 * @param brainprint - User's brainprint
 * @returns Distribution by category
 */
export function getSkillCategoryDistribution(brainprint: Brainprint): {
  semantic: number;
  creative: number;
  executive: number;
  affective: number;
} {
  const semanticSkills = ['precision', 'inference', 'association', 'coherence', 'bridging', 'balance'];
  const creativeSkills = ['divergence', 'creativity', 'synthesis', 'innovation'];
  const executiveSkills = ['executive', 'attention', 'selectivity', 'focus', 'decisiveness'];
  const affectiveSkills = ['affective', 'synesthesia', 'intuition'];

  const getAverage = (skills: string[]) => {
    const values = skills
      .map(s => (brainprint as any)[s])
      .filter(v => typeof v === 'number');
    return values.length > 0
      ? values.reduce((sum, v) => sum + v, 0) / values.length
      : 0;
  };

  return {
    semantic: Math.round(getAverage(semanticSkills)),
    creative: Math.round(getAverage(creativeSkills)),
    executive: Math.round(getAverage(executiveSkills)),
    affective: Math.round(getAverage(affectiveSkills)),
  };
}

/**
 * Generate brainprint insights and recommendations
 *
 * @param brainprint - User's brainprint
 * @returns Insights and game recommendations
 */
export function generateBrainprintInsights(brainprint: Brainprint): {
  strengths: string[];
  growthAreas: string[];
  recommendedGames: string[];
} {
  const topSkills = getTopSkills(brainprint, 3);
  const allSkills = getTopSkills(brainprint, 100);
  const bottomSkills = allSkills.slice(-3).reverse();

  const strengths = topSkills.map(s => s.skill);
  const growthAreas = bottomSkills.map(s => s.skill);

  // Game recommendations based on growth areas
  const gameMap: Record<string, string[]> = {
    precision: ['GRIP', 'ONE'],
    divergence: ['ZERO', 'SPLICE'],
    executive: ['PING', 'TENSOR'],
    association: ['TRACE', 'FLOW'],
    affective: ['COLORGLYPH'],
    bridging: ['SPAN', 'SPLICE'],
    coherence: ['FLOW', 'LOOP'],
  };

  const recommendedGames = new Set<string>();
  for (const skill of growthAreas) {
    const games = gameMap[skill] || [];
    games.forEach(g => recommendedGames.add(g));
  }

  return {
    strengths,
    growthAreas,
    recommendedGames: Array.from(recommendedGames).slice(0, 3),
  };
}
