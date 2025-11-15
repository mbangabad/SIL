/**
 * useGameSession Hook
 *
 * Manages game state and integrates with the SIL game engine
 * Provides interface for playing games through React components
 */

'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type {
  GameDefinition,
  GameState,
  GameContext,
  PlayerAction,
  GameResultSummary,
  GameMode,
} from '@sil/core';

export interface UseGameSessionConfig {
  game: GameDefinition;
  mode: GameMode;
  userId?: string;
  seed?: number;
  language?: string;
}

export interface UseGameSessionReturn {
  // State
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  summary: GameResultSummary | null;

  // Computed
  isGameOver: boolean;
  currentStep: number;

  // Actions
  submitAction: (action: PlayerAction) => void;
  resetGame: () => void;

  // Context
  context: GameContext;
}

/**
 * Hook for managing a game session
 *
 * @example
 * ```tsx
 * const { gameState, submitAction, isGameOver } = useGameSession({
 *   game: gripGame,
 *   mode: 'oneShot',
 *   userId: 'user-123'
 * });
 * ```
 */
export function useGameSession(config: UseGameSessionConfig): UseGameSessionReturn {
  const { game, mode, userId = 'anonymous', seed, language = 'en' } = config;

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<GameResultSummary | null>(null);

  // Create game context
  const context = useMemo<GameContext>(() => ({
    userId,
    seed: seed ?? Math.floor(Math.random() * 1000000),
    language,
    mode,
  }), [userId, seed, language, mode]);

  // Initialize game
  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSummary(null);

      const initialState = await game.init(context);
      setGameState(initialState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize game');
      console.error('Game initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [game, context]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Submit player action
  const submitAction = useCallback((action: PlayerAction) => {
    if (!gameState) {
      setError('Cannot submit action: game not initialized');
      return;
    }

    if (gameState.done) {
      setError('Cannot submit action: game is already over');
      return;
    }

    try {
      setError(null);

      // Update game state
      const newState = game.update(context, gameState, action);
      setGameState(newState);

      // If game is done, generate summary
      if (newState.done) {
        const gameSummary = game.summarize(context, newState);
        setSummary(gameSummary);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process action');
      console.error('Game update error:', err);
    }
  }, [game, context, gameState]);

  // Reset game
  const resetGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Computed values
  const isGameOver = gameState?.done ?? false;
  const currentStep = gameState?.step ?? 0;

  return {
    gameState,
    isLoading,
    error,
    summary,
    isGameOver,
    currentStep,
    submitAction,
    resetGame,
    context,
  };
}

/**
 * Helper hook for managing mode-specific game sessions
 */
export function useModeRunner(
  game: GameDefinition,
  mode: GameMode,
  options?: {
    userId?: string;
    onComplete?: (summary: GameResultSummary) => void;
  }
) {
  const session = useGameSession({
    game,
    mode,
    userId: options?.userId,
  });

  // Call onComplete when game finishes
  useEffect(() => {
    if (session.isGameOver && session.summary && options?.onComplete) {
      options.onComplete(session.summary);
    }
  }, [session.isGameOver, session.summary, options]);

  return session;
}
