/**
 * useLazyGame Hook
 * Loads games dynamically on demand with proper loading/error states
 */

'use client';

import { useState, useEffect } from 'react';
import type { GameDefinition } from '@sil/core';
import { loadGame } from '@sil/games/lazy-loader';

export interface UseLazyGameReturn {
  game: GameDefinition | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to lazy-load a game by ID
 *
 * @example
 * ```tsx
 * const { game, isLoading, error } = useLazyGame('grip');
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!game) return null;
 *
 * return <GameRenderer game={game} ... />;
 * ```
 */
export function useLazyGame(gameId: string | null): UseLazyGameReturn {
  const [game, setGame] = useState<GameDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const loadedGame = await loadGame(gameId);

        if (!cancelled) {
          setGame(loadedGame);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load game');
          setIsLoading(false);
        }
      }
    };

    load();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  return { game, isLoading, error };
}

/**
 * Preload a game in the background
 * Useful for preloading games the user is likely to play next
 */
export function preloadGame(gameId: string): Promise<GameDefinition> {
  return loadGame(gameId);
}

/**
 * Preload multiple games in parallel
 */
export async function preloadGames(gameIds: string[]): Promise<void> {
  await Promise.all(gameIds.map(preloadGame));
}
