/**
 * Core type definitions for Semantic Intelligence League (SIL)
 * Defines interfaces for game plugins, states, actions, and modes
 */

// ============================================================================
// GAME MODES
// ============================================================================

export type GameMode = "oneShot" | "journey" | "arena" | "endurance";

// ============================================================================
// GAME CONTEXT
// ============================================================================

/**
 * Context provided to every game operation
 * Contains runtime environment information
 */
export interface GameContext {
  /** Optional user identifier */
  userId?: string;
  /** Language code (e.g., 'en', 'es') */
  language: string;
  /** Seed for deterministic random generation */
  seed: string;
  /** Current game mode */
  mode: GameMode;
  /** Current timestamp in epoch milliseconds */
  now: number;
}

// ============================================================================
// GAME STATE
// ============================================================================

/**
 * Generic game state structure
 * All games must conform to this shape
 */
export interface GameState {
  /** Current step number (0-indexed) */
  step: number;
  /** Whether the game has ended */
  done: boolean;
  /** Game-specific state data (JSON-serializable) */
  data: any;
}

// ============================================================================
// PLAYER ACTIONS
// ============================================================================

/**
 * All possible player action types
 * Games can process a subset of these or define custom actions
 */
export type PlayerAction =
  | { type: "tap"; payload: { wordId: string } }
  | { type: "tap-many"; payload: { wordIds: string[] } }
  | { type: "submitWord"; payload: { text: string } }
  | { type: "timer" }
  | { type: "noop" }
  | { type: "custom"; payload: any };

// ============================================================================
// GAME RESULTS
// ============================================================================

/**
 * Summary of a completed game session
 * Returned by GameDefinition.summarize()
 */
export interface GameResultSummary {
  /** Primary score (higher is better) */
  score: number;
  /** Time taken in milliseconds */
  durationMs: number;
  /** Optional accuracy metric (0-100) */
  accuracy?: number;
  /** Optional percentile rank (0-100) */
  percentile?: number;
  /** Skill signals for brainprint generation */
  skillSignals?: Record<string, number>;
  /** Additional game-specific metadata */
  metadata?: any;
}

// ============================================================================
// UI SCHEMA
// ============================================================================

/**
 * Defines how the UI should render this game
 * Used by the platform to create appropriate UI components
 */
export interface GameUISchema {
  /** Primary layout pattern */
  layout: "grid" | "list" | "single" | "dual-anchor" | "wheel" | "timeline";
  /** Input method expected from player */
  input: "tap-one" | "tap-many" | "type-one-word" | "none";
  /** Feedback display style */
  feedback: "score-bar" | "hot-cold" | "percentile" | "rank" | "none";
  /** Animation style for interactions */
  animation?: "pulse" | "scale" | "fade" | "none";
  /** Visual style of word cards */
  cardStyle?: "word" | "emoji" | "mixed";
}

// ============================================================================
// GAME DEFINITION (PLUGIN INTERFACE)
// ============================================================================

/**
 * Core game plugin interface
 * All games must implement this interface to be playable
 */
export interface GameDefinition {
  /** Unique identifier for this game (e.g., 'grip', 'zero') */
  id: string;
  /** Display name */
  name: string;
  /** Brief description for UI display */
  shortDescription: string;
  /** Which modes this game supports */
  supportedModes: GameMode[];

  /**
   * Initialize a new game session
   * @param ctx - Game context with environment info
   * @returns Initial game state
   */
  init(ctx: GameContext): Promise<GameState> | GameState;

  /**
   * Process a player action and return new state
   * @param ctx - Game context
   * @param state - Current game state
   * @param action - Player action to process
   * @returns Updated game state
   */
  update(
    ctx: GameContext,
    state: GameState,
    action: PlayerAction
  ): Promise<GameState> | GameState;

  /**
   * Generate final score and summary when game ends
   * @param ctx - Game context
   * @param state - Final game state
   * @returns Game result summary with score and metrics
   */
  summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> | GameResultSummary;

  /** UI rendering schema */
  uiSchema: GameUISchema;
}

// ============================================================================
// MODE RUNNER TYPES
// ============================================================================

/**
 * Configuration for mode-specific behavior
 */
export interface ModeConfig {
  /** Maximum steps for journey mode */
  maxSteps?: number;
  /** Duration in ms for arena mode */
  durationMs?: number;
  /** Game sequence for endurance mode */
  gameSequence?: string[];
}

/**
 * Result from a mode runner
 */
export interface ModeResult {
  /** Final game result summary */
  summary: GameResultSummary;
  /** Complete game state history (optional) */
  history?: GameState[];
  /** Mode-specific metadata */
  metadata?: any;
}
