/**
 * Endurance Mode Runner
 *
 * Seasonal mode: sequence of 3-5 different games
 * Combined scoring across all games
 * Produces brainprint signals for skill assessment
 */

import type {
  GameDefinition,
  GameContext,
  PlayerAction,
  ModeResult,
  GameResultSummary,
} from '../types';
import { runJourney } from './journey';

export interface EnduranceConfig {
  /** List of game definitions to run in sequence */
  games: GameDefinition[];
  /** Actions for each game (indexed by game) */
  gameActions: Array<PlayerAction[]>;
}

export interface BrainprintSignals {
  /** Precision: accuracy in semantic judgments */
  precision?: number;
  /** Speed: average response time */
  speed?: number;
  /** Divergence: ability to find rare/creative solutions */
  divergence?: number;
  /** Inference: ability to deduce relationships */
  inference?: number;
  /** Executive: filtering and attention control */
  executive?: number;
  /** Affective: emotional/color resonance */
  affective?: number;
  /** Coherence: maintaining semantic chains */
  coherence?: number;
}

/**
 * Run multiple games in Endurance mode
 *
 * Process flow:
 * 1. For each game in sequence:
 *    - Run game in journey mode
 *    - Collect score and skill signals
 * 2. Aggregate all scores
 * 3. Merge skill signals into brainprint
 * 4. Return combined results
 *
 * @param ctx - Game context
 * @param config - Endurance configuration with games and actions
 * @returns Mode result with combined scores and brainprint
 */
export async function runEndurance(
  ctx: GameContext,
  config: EnduranceConfig
): Promise<ModeResult> {
  const { games, gameActions } = config;
  const startTime = Date.now();

  // Validate configuration
  if (games.length !== gameActions.length) {
    throw new Error('Number of games must match number of action sets');
  }

  if (games.length < 3 || games.length > 5) {
    throw new Error('Endurance mode requires 3-5 games');
  }

  const gameResults: GameResultSummary[] = [];
  const combinedSignals: BrainprintSignals = {};
  let totalScore = 0;

  // Run each game in sequence
  for (let i = 0; i < games.length; i++) {
    const game = games[i];
    const actions = gameActions[i];

    // Create game-specific context
    const gameCtx: GameContext = {
      ...ctx,
      mode: 'endurance',
      seed: `${ctx.seed}-${i}`, // Unique seed per game
    };

    // Run game in journey mode
    const result = await runJourney(gameCtx, game, actions, { maxSteps: 5 });

    // Collect results
    gameResults.push(result.summary);
    totalScore += result.summary.score;

    // Merge skill signals
    if (result.summary.skillSignals) {
      mergeSkillSignals(combinedSignals, result.summary.skillSignals);
    }
  }

  // Calculate average score
  const averageScore = totalScore / games.length;

  // Compute brainprint from signals
  const brainprint = computeBrainprint(combinedSignals);

  // Create final summary
  const summary: GameResultSummary = {
    score: averageScore,
    durationMs: Date.now() - startTime,
    skillSignals: brainprint as Record<string, number>,
    metadata: {
      totalScore,
      gameCount: games.length,
      individualScores: gameResults.map((r) => r.score),
      gameIds: games.map((g) => g.id),
    },
  };

  return {
    summary,
    metadata: {
      mode: 'endurance',
      gameResults,
      brainprint,
    },
  };
}

/**
 * Merge skill signals from one game into cumulative signals
 */
function mergeSkillSignals(
  cumulative: BrainprintSignals,
  newSignals: Record<string, number>
): void {
  for (const [key, value] of Object.entries(newSignals)) {
    if (key in cumulative) {
      // Average with existing value
      cumulative[key as keyof BrainprintSignals] =
        ((cumulative[key as keyof BrainprintSignals] || 0) + value) / 2;
    } else {
      // Add new signal
      cumulative[key as keyof BrainprintSignals] = value;
    }
  }
}

/**
 * Compute final brainprint from accumulated signals
 * Normalizes and balances signals across different dimensions
 */
function computeBrainprint(signals: BrainprintSignals): BrainprintSignals {
  // Normalize all signals to 0-100 range
  const normalized: BrainprintSignals = {};

  for (const [key, value] of Object.entries(signals)) {
    // Ensure values are in valid range
    normalized[key as keyof BrainprintSignals] = Math.min(
      100,
      Math.max(0, value)
    );
  }

  return normalized;
}

/**
 * Validate that all games support Endurance mode
 */
export function supportsEndurance(games: GameDefinition[]): boolean {
  return games.every((game) => game.supportedModes.includes('endurance'));
}

export type { BrainprintSignals as Brainprint };
