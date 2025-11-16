/**
 * Lazy Game Loader
 * Dynamically imports games on demand to reduce initial bundle size
 */

import type { GameDefinition } from '@sil/core';

/**
 * Game loader function type
 */
export type GameLoader = () => Promise<{ default: GameDefinition } | GameDefinition>;

/**
 * Registry of lazy-loadable games
 * Each game is imported only when needed
 */
export const LAZY_GAMES: Record<string, GameLoader> = {
  // Original Classics (12 games)
  grip: () => import('./grip').then(m => m.gripGame),
  zero: () => import('./zero').then(m => m.zeroGame),
  ping: () => import('./ping').then(m => m.pingGame),
  span: () => import('./span').then(m => m.spanGame),
  cluster: () => import('./cluster').then(m => m.clusterGame),
  colorglyph: () => import('./colorglyph').then(m => m.colorglyphGame),
  trace: () => import('./trace').then(m => m.traceGame),
  flow: () => import('./flow').then(m => m.flowGame),
  tensor: () => import('./tensor').then(m => m.tensorGame),
  splice: () => import('./splice').then(m => m.spliceGame),
  one: () => import('./one').then(m => m.oneGame),
  loop: () => import('./loop').then(m => m.loopGame),

  // Semantic Word Games (13 games)
  tribes: () => import('./tribes').then(m => m.tribesGame),
  echochain: () => import('./echochain').then(m => m.echochainGame),
  ghost: () => import('./ghost').then(m => m.ghostGame),
  motif: () => import('./motif').then(m => m.motifGame),
  flock: () => import('./flock').then(m => m.flockGame),
  merge: () => import('./merge').then(m => m.mergeGame),
  pivotword: () => import('./pivotword').then(m => m.pivotwordGame),
  radial: () => import('./radial').then(m => m.radialGame),
  traceword: () => import('./traceword').then(m => m.tracewordGame),
  shard: () => import('./shard').then(m => m.shardGame),
  spoke: () => import('./spoke').then(m => m.spokeGame),
  warpword: () => import('./warpword').then(m => m.warpwordGame),
  vector: () => import('./vector').then(m => m.vectorGame),

  // Math & Logic Games (25 games)
  align: () => import('./align').then(m => m.alignGame),
  numgrip: () => import('./numgrip').then(m => m.numgripGame),
  span2d: () => import('./span2d').then(m => m.span2dGame),
  gridlogic: () => import('./gridlogic').then(m => m.gridlogicGame),
  shift: () => import('./shift').then(m => m.shiftGame),
  optima: () => import('./optima').then(m => m.optimaGame),
  next: () => import('./next').then(m => m.nextGame),
  rotor: () => import('./rotor').then(m => m.rotorGame),
  midpoint: () => import('./midpoint').then(m => m.midpointGame),
  inverse: () => import('./inverse').then(m => m.inverseGame),
  risk: () => import('./risk').then(m => m.riskGame),
  angle: () => import('./angle').then(m => m.angleGame),
  tilt: () => import('./tilt').then(m => m.tiltGame),
  flip: () => import('./flip').then(m => m.flipGame),
  matchrate: () => import('./matchrate').then(m => m.matchrateGame),
  jump: () => import('./jump').then(m => m.jumpGame),
  balance: () => import('./balance').then(m => m.balanceGame),
  choice: () => import('./choice').then(m => m.choiceGame),
  spread: () => import('./spread').then(m => m.spreadGame),
  harmony: () => import('./harmony').then(m => m.harmonyGame),
  order: () => import('./order').then(m => m.orderGame),
  growth: () => import('./growth').then(m => m.growthGame),
  pair: () => import('./pair').then(m => m.pairGame),
  pack: () => import('./pack').then(m => m.packGame),
  fuse: () => import('./fuse').then(m => m.fuseGame),
};

/**
 * Game metadata for listing without loading full game
 */
export interface GameMetadata {
  id: string;
  name: string;
  shortDescription: string;
  category: 'original' | 'semantic' | 'math-logic';
}

/**
 * Static metadata for all games (lightweight, no code)
 */
export const GAME_METADATA: GameMetadata[] = [
  // Original Classics
  { id: 'grip', name: 'GRIP', shortDescription: 'Find the odd one out', category: 'original' },
  { id: 'zero', name: 'ZERO', shortDescription: 'Find words that don\'t fit', category: 'original' },
  { id: 'ping', name: 'PING', shortDescription: 'Closest semantic match', category: 'original' },
  { id: 'span', name: 'SPAN', shortDescription: 'Widest semantic gap', category: 'original' },
  { id: 'cluster', name: 'CLUSTER', shortDescription: 'Group related words', category: 'original' },
  { id: 'colorglyph', name: 'COLORGLYPH', shortDescription: 'Match symbol patterns', category: 'original' },
  { id: 'trace', name: 'TRACE', shortDescription: 'Follow semantic path', category: 'original' },
  { id: 'flow', name: 'FLOW', shortDescription: 'Navigate word space', category: 'original' },
  { id: 'tensor', name: 'TENSOR', shortDescription: 'Multi-dimensional matching', category: 'original' },
  { id: 'splice', name: 'SPLICE', shortDescription: 'Merge concept chains', category: 'original' },
  { id: 'one', name: 'ONE', shortDescription: 'Single best answer', category: 'original' },
  { id: 'loop', name: 'LOOP', shortDescription: 'Complete the cycle', category: 'original' },

  // Semantic Word Games
  { id: 'tribes', name: 'TRIBES', shortDescription: 'Group by shared theme', category: 'semantic' },
  { id: 'echochain', name: 'ECHOCHAIN', shortDescription: 'Build semantic sequences', category: 'semantic' },
  { id: 'ghost', name: 'GHOST', shortDescription: 'Find the invisible link', category: 'semantic' },
  { id: 'motif', name: 'MOTIF', shortDescription: 'Detect recurring patterns', category: 'semantic' },
  { id: 'flock', name: 'FLOCK', shortDescription: 'Cluster by similarity', category: 'semantic' },
  { id: 'merge', name: 'MERGE', shortDescription: 'Combine related concepts', category: 'semantic' },
  { id: 'pivotword', name: 'PIVOTWORD', shortDescription: 'Bridge two concepts', category: 'semantic' },
  { id: 'radial', name: 'RADIAL', shortDescription: 'Center of semantic space', category: 'semantic' },
  { id: 'traceword', name: 'TRACEWORD', shortDescription: 'Navigate semantic gradients', category: 'semantic' },
  { id: 'shard', name: 'SHARD', shortDescription: 'Find the outlier piece', category: 'semantic' },
  { id: 'spoke', name: 'SPOKE', shortDescription: 'Radiate from center', category: 'semantic' },
  { id: 'warpword', name: 'WARPWORD', shortDescription: 'Stretch semantic boundaries', category: 'semantic' },
  { id: 'vector', name: 'VECTOR', shortDescription: 'Position between anchors', category: 'semantic' },

  // Math & Logic Games
  { id: 'align', name: 'ALIGN', shortDescription: 'Sequence ordering', category: 'math-logic' },
  { id: 'numgrip', name: 'NUMGRIP', shortDescription: 'Find the odd number', category: 'math-logic' },
  { id: 'span2d', name: 'SPAN2D', shortDescription: 'Maximize 2D distance', category: 'math-logic' },
  { id: 'gridlogic', name: 'GRIDLOGIC', shortDescription: 'Complete grid patterns', category: 'math-logic' },
  { id: 'shift', name: 'SHIFT', shortDescription: 'Numerical transformations', category: 'math-logic' },
  { id: 'optima', name: 'OPTIMA', shortDescription: 'Find optimal solution', category: 'math-logic' },
  { id: 'next', name: 'NEXT', shortDescription: 'Predict next in series', category: 'math-logic' },
  { id: 'rotor', name: 'ROTOR', shortDescription: 'Rotation mechanics', category: 'math-logic' },
  { id: 'midpoint', name: 'MIDPOINT', shortDescription: 'Find numeric center', category: 'math-logic' },
  { id: 'inverse', name: 'INVERSE', shortDescription: 'Reverse operations', category: 'math-logic' },
  { id: 'risk', name: 'RISK', shortDescription: 'Probability judgments', category: 'math-logic' },
  { id: 'angle', name: 'ANGLE', shortDescription: 'Geometric relationships', category: 'math-logic' },
  { id: 'tilt', name: 'TILT', shortDescription: 'Balance and equilibrium', category: 'math-logic' },
  { id: 'flip', name: 'FLIP', shortDescription: 'Mirror transformations', category: 'math-logic' },
  { id: 'matchrate', name: 'MATCHRATE', shortDescription: 'Pattern matching speed', category: 'math-logic' },
  { id: 'jump', name: 'JUMP', shortDescription: 'Interval leaps', category: 'math-logic' },
  { id: 'balance', name: 'BALANCE', shortDescription: 'Equilibrium points', category: 'math-logic' },
  { id: 'choice', name: 'CHOICE', shortDescription: 'Decision optimization', category: 'math-logic' },
  { id: 'spread', name: 'SPREAD', shortDescription: 'Distribution analysis', category: 'math-logic' },
  { id: 'harmony', name: 'HARMONY', shortDescription: 'Pattern symmetry', category: 'math-logic' },
  { id: 'order', name: 'ORDER', shortDescription: 'Ranking logic', category: 'math-logic' },
  { id: 'growth', name: 'GROWTH', shortDescription: 'Progression rates', category: 'math-logic' },
  { id: 'pair', name: 'PAIR', shortDescription: 'Relationship matching', category: 'math-logic' },
  { id: 'pack', name: 'PACK', shortDescription: 'Grouping optimization', category: 'math-logic' },
  { id: 'fuse', name: 'FUSE', shortDescription: 'Combining elements', category: 'math-logic' },
];

// Cache for loaded games (prevents re-downloading)
const gameCache = new Map<string, GameDefinition>();

/**
 * Load a game dynamically
 * Returns the full GameDefinition after code is loaded
 * Games are cached after first load
 */
export async function loadGame(gameId: string): Promise<GameDefinition> {
  // Check cache first
  if (gameCache.has(gameId)) {
    return gameCache.get(gameId)!;
  }

  const loader = LAZY_GAMES[gameId];
  if (!loader) {
    throw new Error(`Game "${gameId}" not found in lazy loader registry`);
  }

  const module = await loader();

  // Handle both default exports and named exports
  const game = 'default' in module ? module.default : module;

  // Cache the loaded game
  gameCache.set(gameId, game as GameDefinition);

  return game as GameDefinition;
}

/**
 * Get metadata for all games without loading their code
 */
export function getAllGameMetadata(): GameMetadata[] {
  return GAME_METADATA;
}

/**
 * Get metadata for a single game
 */
export function getGameMetadata(gameId: string): GameMetadata | undefined {
  return GAME_METADATA.find((g) => g.id === gameId);
}
