/**
 * One-Shot Mode Runner
 *
 * Simplest mode: player performs exactly one action, game ends
 * Used for quick, single-decision games
 */

import type {
  GameDefinition,
  GameContext,
  PlayerAction,
  ModeResult,
} from '../types';

/**
 * Run a game in One-Shot mode
 *
 * Process flow:
 * 1. Initialize game state
 * 2. Wait for single player action
 * 3. Update state with action
 * 4. Summarize and return results
 *
 * @param ctx - Game context
 * @param gameDef - Game definition to run
 * @param action - The single action from the player
 * @returns Mode result with final summary
 */
export async function runOneShot(
  ctx: GameContext,
  gameDef: GameDefinition,
  action: PlayerAction
): Promise<ModeResult> {
  const startTime = Date.now();

  // Initialize game
  const initialState = await gameDef.init(ctx);

  // Process the single action
  const finalState = await gameDef.update(ctx, initialState, action);

  // Mark as done
  finalState.done = true;

  // Generate summary
  const summary = await gameDef.summarize(ctx, finalState);

  // Add duration
  summary.durationMs = Date.now() - startTime;

  return {
    summary,
    history: [initialState, finalState],
    metadata: {
      mode: 'oneShot',
      actionCount: 1,
    },
  };
}

/**
 * Validate that a game supports One-Shot mode
 */
export function supportsOneShot(gameDef: GameDefinition): boolean {
  return gameDef.supportedModes.includes('oneShot');
}
