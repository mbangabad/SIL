/**
 * Game Runner - Main orchestration layer
 *
 * Provides unified API for running any game in any mode
 * Handles mode selection, validation, and result formatting
 */

import type {
  GameDefinition,
  GameContext,
  GameMode,
  PlayerAction,
  ModeResult,
} from './types';
import { runOneShot } from './modes/oneShot';
import { runJourney, type JourneyConfig } from './modes/journey';
import { runArena, type ArenaConfig } from './modes/arena';
import { runEndurance, type EnduranceConfig } from './modes/endurance';

/**
 * Configuration for running a game
 */
export interface GameRunnerConfig {
  /** Game definition to run */
  game: GameDefinition;
  /** Mode to run in */
  mode: GameMode;
  /** Game context */
  context: GameContext;
  /** Player actions (format depends on mode) */
  actions?: any;
  /** Mode-specific configuration */
  modeConfig?: JourneyConfig | ArenaConfig | EnduranceConfig;
}

/**
 * Main game runner - orchestrates game execution
 *
 * @param config - Runner configuration
 * @returns Mode result with summary and metadata
 */
export async function runGame(
  config: GameRunnerConfig
): Promise<ModeResult> {
  const { game, mode, context, actions, modeConfig } = config;

  // Validate that game supports this mode
  if (!game.supportedModes.includes(mode)) {
    throw new Error(
      `Game "${game.id}" does not support mode "${mode}". ` +
        `Supported modes: ${game.supportedModes.join(', ')}`
    );
  }

  // Ensure context mode matches requested mode
  const ctx: GameContext = { ...context, mode };

  // Route to appropriate mode runner
  switch (mode) {
    case 'oneShot':
      if (!actions) {
        throw new Error('One-shot mode requires a single action');
      }
      return runOneShot(ctx, game, actions);

    case 'journey':
      if (!Array.isArray(actions)) {
        throw new Error('Journey mode requires an array of actions');
      }
      return runJourney(
        ctx,
        game,
        actions,
        modeConfig as JourneyConfig
      );

    case 'arena':
      if (!Array.isArray(actions)) {
        throw new Error('Arena mode requires an array of timestamped actions');
      }
      return runArena(
        ctx,
        game,
        actions,
        modeConfig as ArenaConfig
      );

    case 'endurance':
      if (!modeConfig || !('games' in modeConfig)) {
        throw new Error('Endurance mode requires EnduranceConfig');
      }
      return runEndurance(ctx, modeConfig as EnduranceConfig);

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }
}

/**
 * Create a daily seed based on date
 * Ensures all players get the same puzzle for a given day
 *
 * @param date - Date object (defaults to today)
 * @returns Seed string
 */
export function createDailySeed(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `daily-${year}${month}${day}`;
}

/**
 * Create a random seed
 *
 * @returns Random seed string
 */
export function createRandomSeed(): string {
  return `random-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Validate a game definition
 * Ensures all required properties are present and valid
 *
 * @param game - Game definition to validate
 * @returns True if valid, throws error otherwise
 */
export function validateGameDefinition(game: GameDefinition): boolean {
  // Check required properties
  if (!game.id || typeof game.id !== 'string') {
    throw new Error('Game must have a valid string id');
  }

  if (!game.name || typeof game.name !== 'string') {
    throw new Error('Game must have a valid string name');
  }

  if (!Array.isArray(game.supportedModes) || game.supportedModes.length === 0) {
    throw new Error('Game must support at least one mode');
  }

  // Check methods
  if (typeof game.init !== 'function') {
    throw new Error('Game must implement init() method');
  }

  if (typeof game.update !== 'function') {
    throw new Error('Game must implement update() method');
  }

  if (typeof game.summarize !== 'function') {
    throw new Error('Game must implement summarize() method');
  }

  // Check UI schema
  if (!game.uiSchema || typeof game.uiSchema !== 'object') {
    throw new Error('Game must have a valid uiSchema');
  }

  return true;
}

/**
 * Game registry for managing available games
 */
export class GameRegistry {
  private games: Map<string, GameDefinition> = new Map();

  /**
   * Register a game definition
   */
  register(game: GameDefinition): void {
    validateGameDefinition(game);
    this.games.set(game.id, game);
  }

  /**
   * Get a game by ID
   */
  get(id: string): GameDefinition | undefined {
    return this.games.get(id);
  }

  /**
   * Get all registered games
   */
  getAll(): GameDefinition[] {
    return Array.from(this.games.values());
  }

  /**
   * Get games that support a specific mode
   */
  getByMode(mode: GameMode): GameDefinition[] {
    return this.getAll().filter((game) =>
      game.supportedModes.includes(mode)
    );
  }

  /**
   * Check if a game is registered
   */
  has(id: string): boolean {
    return this.games.has(id);
  }
}

// Export singleton registry
export const gameRegistry = new GameRegistry();
