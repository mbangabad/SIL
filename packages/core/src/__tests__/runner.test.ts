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

  update: (
    ctx: GameContext,
    state: GameState,
    action: PlayerAction
  ): GameState => {
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

  summarize: (ctx: GameContext, state: GameState) => {
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
    };

    const result = await runGame({
      game,
      mode: 'oneShot',
      context: ctx,
      actions: { type: 'tap', payload: { wordId: '0' } },
    });

    expect(result.summary.score).toBe(10); // One action = 10 points
    expect(result.summary.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.metadata).toHaveProperty('actionCount', 1);
  });

  it('should track time correctly', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
    };

    const start = Date.now();
    const result = await runGame({
      game,
      mode: 'oneShot',
      context: ctx,
      actions: { type: 'tap', payload: { wordId: '0' } },
    });
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
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
      { type: 'tap', payload: { wordId: '2' } },
      { type: 'tap', payload: { wordId: '3' } },
      { type: 'tap', payload: { wordId: '4' } },
    ];

    const result = await runGame({
      game,
      mode: 'journey',
      context: ctx,
      actions,
    });

    expect(result.summary.score).toBe(50); // 5 actions × 10 points
    expect(result.metadata.actualSteps).toBe(5);
  });

  it('should track state history', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
    ];

    const result = await runGame({
      game,
      mode: 'journey',
      context: ctx,
      actions,
    });

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
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'tap', payload: { wordId: '1' } },
      { type: 'tap', payload: { wordId: '2' } },
    ];

    const result = await runGame({
      game,
      mode: 'journey',
      context: ctx,
      actions,
      modeConfig: { maxSteps: 3 },
    });

    // Should end at 3 steps even though game wants 5
    expect(result.metadata.actualSteps).toBe(3);
  });
});

describe('runGame - Arena Mode', () => {
  it('should run until timer expires', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'arena',
      seed: 'test-seed',
      language: 'en',
    };

    // Simulate rapid actions within time limit
    const actions: PlayerAction[] = Array(10)
      .fill(null)
      .map((_, i) => ({ type: 'tap', payload: { wordId: `${i}` } }) as PlayerAction);

    const result = await runGame({
      game,
      mode: 'arena',
      context: ctx,
      actions,
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
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
      { type: 'timer' }, // Timer expiration
    ];

    const result = await runGame({
      game,
      mode: 'arena',
      context: ctx,
      actions,
    });

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
    };

    const result = await runGame({
      game,
      mode: 'endurance',
      context: ctx,
      modeConfig: {
        games: [game, game, game],
        gameActions: [
          [{ type: 'tap', payload: { wordId: '0' } }],
          [{ type: 'tap', payload: { wordId: '1' } }],
          [{ type: 'tap', payload: { wordId: '2' } }],
        ],
      },
    });

    expect(result).toBeDefined();
    expect(result.summary.score).toBeGreaterThan(0);
    expect(result.summary.metadata.gameCount).toBe(3);
    expect(result.summary.metadata.gameIds).toHaveLength(3);
  });

  it('should aggregate scores from multiple games', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'endurance',
      seed: 'test-seed',
      language: 'en',
    };

    const result = await runGame({
      game,
      mode: 'endurance',
      context: ctx,
      modeConfig: {
        games: [game, game, game], // Three instances (minimum)
        gameActions: [
          [
            { type: 'tap', payload: { wordId: '0' } },
            { type: 'tap', payload: { wordId: '1' } },
          ],
          [
            { type: 'tap', payload: { wordId: '2' } },
            { type: 'tap', payload: { wordId: '3' } },
          ],
          [
            { type: 'tap', payload: { wordId: '4' } },
            { type: 'tap', payload: { wordId: '5' } },
          ],
        ],
      },
    });

    // Should aggregate scores from all game instances
    expect(result.summary.score).toBeGreaterThan(10);
    expect(result.summary.metadata.gameCount).toBe(3);
    expect(result.summary.metadata.totalScore).toBeGreaterThan(30); // 3 games × 2 actions × 10 points
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
    };

    await expect(
      runGame({
        game: brokenGame,
        mode: 'oneShot',
        context: ctx,
        actions: { type: 'tap', payload: { wordId: '0' } },
      })
    ).rejects.toThrow('Init failed');
  });

  it('should handle game update errors', async () => {
    const brokenGame: GameDefinition = {
      ...createMockGame(),
      update: () => {
        throw new Error('Update failed');
      },
    };

    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
    };

    await expect(
      runGame({
        game: brokenGame,
        mode: 'oneShot',
        context: ctx,
        actions: { type: 'tap', payload: { wordId: '0' } },
      })
    ).rejects.toThrow('Update failed');
  });

  it('should require actions for oneShot mode', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'test-seed',
      language: 'en',
    };

    await expect(
      runGame({
        game,
        mode: 'oneShot',
        context: ctx,
      })
    ).rejects.toThrow('One-shot mode requires a single action');
  });
});

describe('runGame - Configuration', () => {
  it('should track state history in journey mode', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'journey',
      seed: 'test-seed',
      language: 'en',
    };

    const actions: PlayerAction[] = [
      { type: 'tap', payload: { wordId: '0' } },
    ];

    const result = await runGame({
      game,
      mode: 'journey',
      context: ctx,
      actions,
    });

    // Journey mode always includes history
    expect(result.history).toBeDefined();
    expect(result.history!.length).toBeGreaterThan(0);
  });

  it('should use deterministic seed for reproducibility', async () => {
    const game = createMockGame();
    const ctx: GameContext = {
      mode: 'oneShot',
      seed: 'reproducible-seed',
      language: 'en',
    };

    const result1 = await runGame({
      game,
      mode: 'oneShot',
      context: ctx,
      actions: { type: 'tap', payload: { wordId: '0' } },
    });

    const result2 = await runGame({
      game,
      mode: 'oneShot',
      context: ctx,
      actions: { type: 'tap', payload: { wordId: '0' } },
    });

    // Same seed should produce same results
    expect(result1.summary.score).toBe(result2.summary.score);
  });
});
