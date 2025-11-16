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

// Math/Logic Games - Batch 1: Spatial & Numeric Foundation
export { alignGame } from './align';
export { numgripGame } from './numgrip';
export { span2dGame } from './span2d';
export { gridlogicGame } from './gridlogic';
export { shiftGame } from './shift';

// Math/Logic Games - Batch 2: Optimization & Pattern
export { optimaGame } from './optima';
export { nextGame } from './next';
export { rotorGame } from './rotor';
export { midpointGame } from './midpoint';
export { inverseGame } from './inverse';

// Math/Logic Games - Batch 3: Risk & Transformation
export { riskGame } from './risk';
export { angleGame } from './angle';
export { tiltGame } from './tilt';
export { flipGame } from './flip';
export { matchrateGame } from './matchrate';

// Math/Logic Games - Batch 4: Decision & Proportion
export { jumpGame } from './jump';
export { balanceGame } from './balance';
export { choiceGame } from './choice';
export { spreadGame } from './spread';
export { harmonyGame } from './harmony';

// Math/Logic Games - Batch 5: Sequence & Combination
export { orderGame } from './order';
export { growthGame } from './growth';
export { pairGame } from './pair';
export { packGame } from './pack';
export { fuseGame } from './fuse';

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

// Math/Logic Games - Batch 1 imports
import { alignGame } from './align';
import { numgripGame } from './numgrip';
import { span2dGame } from './span2d';
import { gridlogicGame } from './gridlogic';
import { shiftGame } from './shift';

// Math/Logic Games - Batch 2 imports
import { optimaGame } from './optima';
import { nextGame } from './next';
import { rotorGame } from './rotor';
import { midpointGame } from './midpoint';
import { inverseGame } from './inverse';

// Math/Logic Games - Batch 3 imports
import { riskGame } from './risk';
import { angleGame } from './angle';
import { tiltGame } from './tilt';
import { flipGame } from './flip';
import { matchrateGame } from './matchrate';

// Math/Logic Games - Batch 4 imports
import { jumpGame } from './jump';
import { balanceGame } from './balance';
import { choiceGame } from './choice';
import { spreadGame } from './spread';
import { harmonyGame } from './harmony';

// Math/Logic Games - Batch 5 imports
import { orderGame } from './order';
import { growthGame } from './growth';
import { pairGame } from './pair';
import { packGame } from './pack';
import { fuseGame } from './fuse';

import type { GameDefinition } from '@sil/core';

/**
 * Registry of all available games (50 total)
 * 12 original games + 13 semantic word games + 25 math/logic games
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

  // Math/Logic Games - Batch 1: Spatial & Numeric Foundation (5 games)
  alignGame,
  numgripGame,
  span2dGame,
  gridlogicGame,
  shiftGame,

  // Math/Logic Games - Batch 2: Optimization & Pattern (5 games)
  optimaGame,
  nextGame,
  rotorGame,
  midpointGame,
  inverseGame,

  // Math/Logic Games - Batch 3: Risk & Transformation (5 games)
  riskGame,
  angleGame,
  tiltGame,
  flipGame,
  matchrateGame,

  // Math/Logic Games - Batch 4: Decision & Proportion (5 games)
  jumpGame,
  balanceGame,
  choiceGame,
  spreadGame,
  harmonyGame,

  // Math/Logic Games - Batch 5: Sequence & Combination (5 games)
  orderGame,
  growthGame,
  pairGame,
  packGame,
  fuseGame,
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
