/**
 * Arena Mode Runner
 *
 * Timed mode: player performs as many actions as possible within time limit
 * Score aggregates across all rounds/actions
 * Includes percentile calculation
 */

import type {
  GameDefinition,
  GameContext,
  PlayerAction,
  ModeResult,
} from '../types';

export interface ArenaConfig {
  /** Duration in milliseconds (default: 60000 = 60 seconds) */
  durationMs?: number;
}

/**
 * Run a game in Arena mode
 *
 * Process flow:
 * 1. Initialize game state
 * 2. Record start time
 * 3. Loop while time remaining AND not done:
 *    - Get player action (or timer event)
 *    - Update state
 *    - Check time limit
 * 4. Summarize and return results with percentile
 *
 * @param ctx - Game context
 * @param gameDef - Game definition to run
 * @param actions - Array of player actions (with timestamps)
 * @param config - Arena configuration
 * @returns Mode result with final summary including percentile
 */
export async function runArena(
  ctx: GameContext,
  gameDef: GameDefinition,
  actions: Array<{ action: PlayerAction; timestamp: number }>,
  config: ArenaConfig = {}
): Promise<ModeResult> {
  const { durationMs = 60000 } = config;
  const startTime = Date.now();
  const endTime = startTime + durationMs;
  const history: any[] = [];

  // Initialize game
  let state = await gameDef.init(ctx);
  history.push({ ...state, timestamp: startTime });

  let actionCount = 0;

  // Process actions within time limit
  for (const { action, timestamp } of actions) {
    // Check if action occurred within time limit
    if (timestamp > endTime) {
      break;
    }

    // Update state with action
    state = await gameDef.update(ctx, state, action);
    state.step = ++actionCount;

    // Record history
    history.push({ ...state, timestamp });

    // Check if game ended early
    if (state.done) {
      break;
    }
  }

  // Mark as done
  if (!state.done) {
    state.done = true;
  }

  // Generate summary
  const summary = await gameDef.summarize(ctx, state);

  // Set actual duration
  const actualEndTime = history[history.length - 1]?.timestamp || Date.now();
  summary.durationMs = actualEndTime - startTime;

  // TODO: Calculate percentile from leaderboard data
  // For now, we'll add a placeholder
  if (!summary.percentile) {
    summary.percentile = calculatePercentilePlaceholder(summary.score);
  }

  return {
    summary,
    history,
    metadata: {
      mode: 'arena',
      durationMs,
      actualDuration: summary.durationMs,
      actionCount,
      actionsPerSecond: (actionCount / summary.durationMs) * 1000,
    },
  };
}

/**
 * Placeholder percentile calculation
 * In production, this would query the leaderboard database
 */
function calculatePercentilePlaceholder(score: number): number {
  // Simple placeholder: normalize to 0-100 range
  // This should be replaced with actual leaderboard lookup
  return Math.min(100, Math.max(0, score));
}

/**
 * Validate that a game supports Arena mode
 */
export function supportsArena(gameDef: GameDefinition): boolean {
  return gameDef.supportedModes.includes('arena');
}
