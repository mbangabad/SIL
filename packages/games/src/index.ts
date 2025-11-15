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

// Tier A: Semantic word games
export { tribesGame } from './tribes';
export { echochainGame } from './echochain';
export { ghostGame } from './ghost';
export { motifGame } from './motif';
export { flockGame } from './flock';

// Tier B: Advanced semantic games
export { mergeGame } from './merge';
export { pivotwordGame } from './pivotword';
export { radialGame } from './radial';
export { tracewordGame } from './traceword';
export { shardGame } from './shard';

// Tier C: Expert semantic games
export { spokeGame } from './spoke';
export { warpwordGame } from './warpword';
export { vectorGame } from './vector';

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

// Tier A imports
import { tribesGame } from './tribes';
import { echochainGame } from './echochain';
import { ghostGame } from './ghost';
import { motifGame } from './motif';
import { flockGame } from './flock';

// Tier B imports
import { mergeGame } from './merge';
import { pivotwordGame } from './pivotword';
import { radialGame } from './radial';
import { tracewordGame } from './traceword';
import { shardGame } from './shard';

// Tier C imports
import { spokeGame } from './spoke';
import { warpwordGame } from './warpword';
import { vectorGame } from './vector';

import type { GameDefinition } from '@sil/core';

/**
 * Registry of all available games (25 total)
 * 12 original games + 13 semantic word games
 */
export const ALL_GAMES: GameDefinition[] = [
  // Original 12 games
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

  // Tier A: Semantic word games (5 games)
  tribesGame,
  echochainGame,
  ghostGame,
  motifGame,
  flockGame,

  // Tier B: Advanced semantic games (5 games)
  mergeGame,
  pivotwordGame,
  radialGame,
  tracewordGame,
  shardGame,

  // Tier C: Expert semantic games (3 games)
  spokeGame,
  warpwordGame,
  vectorGame,
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
