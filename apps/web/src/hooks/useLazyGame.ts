/**
 * useLazyGame Hook
 * Temporarily disabled during package fixes
 */

'use client';

import { useState, useEffect } from 'react';

export interface UseLazyGameReturn {
  game: any | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to lazy-load a game by ID
 * Temporarily disabled during deployment fixes
 */
export function useLazyGame(gameId: string | null): UseLazyGameReturn {
  const [game, setGame] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>('Game functionality temporarily disabled during deployment fixes');

  return { game, isLoading, error };
}

/**
 * Preload a game in the background
 * Temporarily disabled during deployment fixes
 */
export function preloadGame(gameId: string): Promise<any> {
  return Promise.reject(new Error('Game functionality temporarily disabled'));
}

/**
 * Preload multiple games in parallel
 * Temporarily disabled during deployment fixes
 */
export async function preloadGames(gameIds: string[]): Promise<void> {
  return Promise.reject(new Error('Game functionality temporarily disabled'));
}