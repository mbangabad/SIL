/**
 * @sil/games - Game plugin collection for SIL
 *
 * Each game implements the GameDefinition interface and can be played
 * in any of the supported modes (oneShot, journey, arena, endurance)
 */

// Import all games
export { gripGame } from './grip';
export { zeroGame } from './zero';
export { pingGame } from './ping';
export { spanGame } from './span';
export { clusterGame } from './cluster';

import { gripGame } from './grip';
import { zeroGame } from './zero';
import { pingGame } from './ping';
import { spanGame } from './span';
import { clusterGame } from './cluster';
import type { GameDefinition } from '@sil/core';

/**
 * Registry of all available games
 */
export const ALL_GAMES: GameDefinition[] = [
  gripGame,
  zeroGame,
  pingGame,
  spanGame,
  clusterGame,
];

/**
 * Get a game by ID
 */
export function getGameById(id: string): GameDefinition | undefined {
  return ALL_GAMES.find((game) => game.id === id);
}

/**
 * Get all game IDs
 */
export function getAllGameIds(): string[] {
  return ALL_GAMES.map((game) => game.id);
}
