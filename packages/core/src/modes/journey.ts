/**
 * Journey Mode Runner
 *
 * Multi-step mode: player performs 3-7 sequential actions
 * Game ends when either maxSteps reached or game sets done=true
 */

import type {
  GameDefinition,
  GameContext,
  PlayerAction,
  ModeResult,
} from '../types';

export interface JourneyConfig {
  /** Maximum number of steps allowed (default: 5) */
  maxSteps?: number;
}

/**
 * Run a game in Journey mode
 *
 * Process flow:
 * 1. Initialize game state
 * 2. Loop up to maxSteps:
 *    - Get player action
 *    - Update state
 *    - Check if done
 * 3. Summarize and return results
 *
 * @param ctx - Game context
 * @param gameDef - Game definition to run
 * @param actions - Array of player actions (up to maxSteps)
 * @param config - Journey configuration
 * @returns Mode result with final summary
 */
export async function runJourney(
  ctx: GameContext,
  gameDef: GameDefinition,
  actions: PlayerAction[],
  config: JourneyConfig = {}
): Promise<ModeResult> {
  const { maxSteps = 5 } = config;
  const startTime = Date.now();
  const history: any[] = [];

  // Initialize game
  let state = await gameDef.init(ctx);
  history.push({ ...state });

  // Process actions up to maxSteps
  for (let i = 0; i < Math.min(actions.length, maxSteps); i++) {
    const action = actions[i];

    // Update state with action
    state = await gameDef.update(ctx, state, action);
    state.step = i + 1;

    // Record history
    history.push({ ...state });

    // Check if game ended early
    if (state.done) {
      break;
    }
  }

  // Ensure game is marked as done
  if (!state.done) {
    state.done = true;
  }

  // Generate summary
  const summary = await gameDef.summarize(ctx, state);

  // Add duration
  summary.durationMs = Date.now() - startTime;

  return {
    summary,
    history,
    metadata: {
      mode: 'journey',
      maxSteps,
      actualSteps: state.step,
      completedEarly: state.step < maxSteps,
    },
  };
}

/**
 * Validate that a game supports Journey mode
 */
export function supportsJourney(gameDef: GameDefinition): boolean {
  return gameDef.supportedModes.includes('journey');
}
