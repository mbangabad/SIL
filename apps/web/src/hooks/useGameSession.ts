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
import { telemetry } from '@sil/core';

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
  const [startTime, setStartTime] = useState<number>(0);

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

      // Track game session start
      const now = Date.now();
      setStartTime(now);
      telemetry.trackGameStart(
        game.id,
        mode,
        String(context.seed),
        userId !== 'anonymous' ? userId : undefined
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize game';
      setError(errorMessage);
      console.error('Game initialization error:', err);

      // Track error
      telemetry.trackError(
        errorMessage,
        err instanceof Error ? err.stack : undefined,
        undefined,
        game.id,
        userId !== 'anonymous' ? userId : undefined
      );
    } finally {
      setIsLoading(false);
    }
  }, [game, context, mode, userId]);

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

      // If game is done, generate summary and track completion
      if (newState.done) {
        const gameSummary = game.summarize(context, newState);
        setSummary(gameSummary);

        // Track game session end
        const durationMs = Date.now() - startTime;
        telemetry.trackGameEnd(
          game.id,
          mode,
          gameSummary.score,
          durationMs,
          true, // completed
          gameSummary.skillSignals,
          userId !== 'anonymous' ? userId : undefined
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process action';
      setError(errorMessage);
      console.error('Game update error:', err);

      // Track error
      telemetry.trackError(
        errorMessage,
        err instanceof Error ? err.stack : undefined,
        undefined,
        game.id,
        userId !== 'anonymous' ? userId : undefined
      );
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
