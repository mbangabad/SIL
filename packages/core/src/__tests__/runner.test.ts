/**
 * Integration tests for mode runners
 * Tests orchestration of game sessions across different modes
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { runGame } from '../runner';
import type { GameDefinition, GameContext, GameState, PlayerAction } from '../types';

// Mock game for testing
const createMockGame = (): GameDefinition => ({
  id: 'test-game',
  name: 'Test Game',
  shortDescription: 'A test game',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  init: async (ctx: GameContext): Promise<GameState> => {
    return {
      step: 0,
      done: false,
      data: {
        score: 0,
        attempts: 0,
      },
    };
  },

  update: async (
    ctx: GameContext,
    state: GameState,
    action: PlayerAction
  ): Promise<GameState> => {
    const data = state.data;
    const newAttempts = data.attempts + 1;

    // Simple scoring: each action adds 10 points
    const newScore = data.score + 10;

    // In oneShot mode, end after 1 attempt
    // In journey mode, end after 5 attempts
    const shouldEnd =
      ctx.mode === 'oneShot' ||
      (ctx.mode === 'journey' && newAttempts >= 5);

    return {
      step: state.step + 1,
      done: shouldEnd,
      data: {
        score: newScore,
        attempts: newAttempts,
      },
    };
  },

  summarize: async (ctx: GameContext, state: GameState) => {
    return {
      score: state.data.score,
      durationMs: 0,
      accuracy: 100,
      skillSignals: {
        testSkill: state.data.score,
      },
      metadata: {
        attempts: state.data.attempts,
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'score-bar',
  },
});

describe('runGame - One-Shot Mode', () => {
  it('should complete game after single action', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    const result = await runGame(game, ctx, actions);

    expect(result.summary.score).toBe(10); // One action = 10 points
    expect(result.summary.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.metadata).toHaveProperty('attempts', 1);
  });

  it('should track time correctly', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    const start = Date.now();
    const result = await runGame(game, ctx, actions);
    const end = Date.now();

    expect(result.summary.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.summary.durationMs).toBeLessThanOrEqual(end - start + 100);
  });
});

describe('runGame - Journey Mode', () => {
  it('should complete game after 5 steps', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
      { type: 'tap', payload: { wordId: '2' } },
      { type: 'tap', payload: { wordId: '3' } },
      { type: 'tap', payload: { wordId: '4' } },
    ];

    const result = await runGame(game, ctx, actions);

    expect(result.summary.score).toBe(50); // 5 actions × 10 points
    expect(result.metadata.attempts).toBe(5);
  });

  it('should track state history', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
    ];

    const result = await runGame(game, ctx, actions, { recordHistory: true });

    expect(result.history).toBeDefined();
    expect(result.history!.length).toBeGreaterThan(0);

    // Initial state + 2 updates
    expect(result.history!.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle maxSteps configuration', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
      { type: 'tap', payload: { wordId: '2' } },
    ];

    const result = await runGame(game, ctx, actions, {
      modeConfig: { maxSteps: 3 },
    });

    // Should end at 3 steps even though game wants 5
    expect(result.metadata.attempts).toBe(3);
  });
});

describe('runGame - Arena Mode', () => {
  it('should run until timer expires', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'arena',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    // Simulate rapid actions within time limit
    const actions: PlayerAction[] = Array(10)
      .fill(null)
      .map((_, i) => ({ type: 'tap', payload: { wordId: `${i}` } }) as PlayerAction);

    const result = await runGame(game, ctx, actions, {
      modeConfig: { durationMs: 5000 },
    });

    expect(result.summary.score).toBeGreaterThan(0);
    expect(result.summary.durationMs).toBeLessThanOrEqual(5100); // Some tolerance
  });

  it('should accept timer actions', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'arena',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'timer' }, // Timer expiration
    ];

    const result = await runGame(game, ctx, actions);

    expect(result).toBeDefined();
    expect(result.summary.score).toBeGreaterThan(0);
  });
});

describe('runGame - Endurance Mode', () => {
  it('should run through game sequence', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'endurance',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
      { type: 'tap', payload: { wordId: '2' } },
    ];

    const result = await runGame(game, ctx, actions, {
      modeConfig: {
        gameSequence: ['test-game', 'test-game', 'test-game'],
      },
    });

    expect(result).toBeDefined();
    expect(result.summary.score).toBeGreaterThan(0);
  });

  it('should aggregate scores from multiple games', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'endurance',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = Array(6)
      .fill(null)
      .map((_, i) => ({ type: 'tap', payload: { wordId: `${i}` } }) as PlayerAction);

    const result = await runGame(game, ctx, actions, {
      modeConfig: {
        gameSequence: ['test-game', 'test-game'], // Two instances
      },
    });

    // Should aggregate scores from both game instances
    expect(result.summary.score).toBeGreaterThan(10);
  });
});

describe('runGame - Error Handling', () => {
  it('should handle game initialization errors', async () => {
    const brokenGame: GameDefinition = {
      ...createMockGame(),
      init: async () => {
        throw new Error('Init failed');
      },
    };

    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    await expect(runGame(brokenGame, ctx, [])).rejects.toThrow('Init failed');
  });

  it('should handle game update errors', async () => {
    const brokenGame: GameDefinition = {
      ...createMockGame(),
      update: async () => {
        throw new Error('Update failed');
      },
    };

    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    await expect(runGame(brokenGame, ctx, actions)).rejects.toThrow('Update failed');
  });

  it('should handle empty actions gracefully', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const result = await runGame(game, ctx, []);

    // Should return initial state summary
    expect(result).toBeDefined();
    expect(result.summary.score).toBe(0);
  });
});

describe('runGame - Configuration', () => {
  it('should respect recordHistory flag', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    const resultWithHistory = await runGame(game, ctx, actions, {
      recordHistory: true,
    });

    const resultWithoutHistory = await runGame(game, ctx, actions, {
      recordHistory: false,
    });

    expect(resultWithHistory.history).toBeDefined();
    expect(resultWithoutHistory.history).toBeUndefined();
  });

  it('should use deterministic seed for reproducibility', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'reproducible-seed',
      language: 'en',
      now: Date.now(),
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    const result1 = await runGame(game, ctx, actions);
    const result2 = await runGame(game, ctx, actions);

    // Same seed should produce same results
    expect(result1.summary.score).toBe(result2.summary.score);
  });
});
