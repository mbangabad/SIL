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
export { colorglyphGame } from './colorglyph';
export { traceGame } from './trace';
export { flowGame } from './flow';
export { tensorGame } from './tensor';
export { spliceGame } from './splice';
export { oneGame } from './one';
export { loopGame } from './loop';

import { gripGame } from './grip';
import { zeroGame } from './zero';
import { pingGame } from './ping';
import { spanGame } from './span';
import { clusterGame } from './cluster';
import { colorglyphGame } from './colorglyph';
import { traceGame } from './trace';
import { flowGame } from './flow';
import { tensorGame } from './tensor';
import { spliceGame } from './splice';
import { oneGame } from './one';
import { loopGame } from './loop';
import type { GameDefinition } from '@sil/core';

/**
 * Registry of all available games (12 total)
 */
export const ALL_GAMES: GameDefinition[] = [
  gripGame,
  zeroGame,
  pingGame,
  spanGame,
  clusterGame,
  colorglyphGame,
  traceGame,
  flowGame,
  tensorGame,
  spliceGame,
  oneGame,
  loopGame,
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
