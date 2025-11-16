/**
 * Tests for the 13 new semantic word games
 *
 * Tests all Tier A, B, and C games for:
 * - Initialization
 * - State updates
 * - Game completion
 * - Scoring logic
 */

import { describe, it, expect } from 'vitest';
import type { GameContext, PlayerAction } from '@sil/core';

// Tier A games
import { tribesGame } from '../tribes';
import { echochainGame } from '../echochain';
import { ghostGame } from '../ghost';
import { motifGame } from '../motif';
import { flockGame } from '../flock';

// Tier B games
import { mergeGame } from '../merge';
import { pivotwordGame } from '../pivotword';
import { radialGame } from '../radial';
import { tracewordGame } from '../traceword';
import { shardGame } from '../shard';

// Tier C games
import { spokeGame } from '../spoke';
import { warpwordGame } from '../warpword';
import { vectorGame } from '../vector';

const mockContext: GameContext = {
  userId: 'test-user',
  seed: 12345,
  language: 'en',
  mode: 'oneShot',
};

describe('Tier A Games', () => {
  describe('TRIBES', () => {
    it('should initialize with tribes and target', async () => {
      const state = await tribesGame.init(mockContext);
      expect(state.step).toBe(0);
      expect(state.done).toBe(false);
      expect(state.data).toHaveProperty('tribes');
      expect(state.data).toHaveProperty('targetTribeId');
    });

    it('should handle tribe selection', async () => {
      const state = await tribesGame.init(mockContext);
      const action: PlayerAction = {
        type: 'select',
        payload: { tribeId: 'A' },
        timestamp: Date.now(),
      };
      const newState = tribesGame.update(mockContext, state, action);
      expect(newState.data.selectedTribeId).toBe('A');
      expect(newState.done).toBe(true);
    });

    it('should generate summary with score', async () => {
      const state = await tribesGame.init(mockContext);
      const action: PlayerAction = {
        type: 'select',
        payload: { tribeId: state.data.targetTribeId },
        timestamp: Date.now(),
      };
      const finalState = tribesGame.update(mockContext, state, action);
      const summary = tribesGame.summarize(mockContext, finalState);
      expect(summary.score).toBeGreaterThan(0);
    });
  });

  describe('ECHOCHAIN', () => {
    it('should initialize with prompt', async () => {
      const state = await echochainGame.init(mockContext);
      expect(state.step).toBe(0);
      expect(state.done).toBe(false);
      expect(state.data).toHaveProperty('promptWord');
    });

    it('should handle word submission', async () => {
      const state = await echochainGame.init(mockContext);
      const action: PlayerAction = {
        type: 'submit',
        payload: { word: 'ocean' },
        timestamp: Date.now(),
      };
      const newState = echochainGame.update(mockContext, state, action);
      expect(newState.data.submittedWord).toBe('ocean');
      expect(newState.done).toBe(true);
    });
  });

  describe('GHOST', () => {
    it('should initialize with clues', async () => {
      const state = await ghostGame.init(mockContext);
      expect(state.data).toHaveProperty('clues');
      expect(Array.isArray(state.data.clues)).toBe(true);
    });
  });

  describe('MOTIF', () => {
    it('should initialize with word set and scores', async () => {
      const state = await motifGame.init(mockContext);
      expect(state.data).toHaveProperty('words');
      expect(state.data).toHaveProperty('wordScores');
      expect(state.data.words.length).toBeGreaterThan(0);
    });
  });

  describe('FLOCK', () => {
    it('should initialize with word stream', async () => {
      const state = await flockGame.init(mockContext);
      expect(state.data).toHaveProperty('stream');
      expect(Array.isArray(state.data.stream)).toBe(true);
    });
  });
});

describe('Tier B Games', () => {
  describe('MERGE', () => {
    it('should initialize with anchor words', async () => {
      const state = await mergeGame.init(mockContext);
      expect(state.data).toHaveProperty('anchorA');
      expect(state.data).toHaveProperty('anchorB');
    });

    it('should handle word submission', async () => {
      const state = await mergeGame.init(mockContext);
      const action: PlayerAction = {
        type: 'submit',
        payload: { word: 'blend' },
        timestamp: Date.now(),
      };
      const newState = mergeGame.update(mockContext, state, action);
      expect(newState.done).toBe(true);
      expect(newState.data).toHaveProperty('score');
    });
  });

  describe('PIVOTWORD', () => {
    it('should initialize with anchors and candidates', async () => {
      const state = await pivotwordGame.init(mockContext);
      expect(state.data).toHaveProperty('anchorA');
      expect(state.data).toHaveProperty('anchorB');
      expect(state.data).toHaveProperty('candidates');
    });
  });

  describe('RADIAL', () => {
    it('should initialize with words in radial layout', async () => {
      const state = await radialGame.init(mockContext);
      expect(state.data).toHaveProperty('words');
      expect(state.data.words.length).toBeGreaterThan(0);
    });
  });

  describe('TRACEWORD', () => {
    it('should initialize with gradient anchors', async () => {
      const state = await tracewordGame.init(mockContext);
      expect(state.data).toHaveProperty('anchorA');
      expect(state.data).toHaveProperty('anchorB');
    });
  });

  describe('SHARD', () => {
    it('should initialize with fragments', async () => {
      const state = await shardGame.init(mockContext);
      expect(state.data).toHaveProperty('fragments');
      expect(Array.isArray(state.data.fragments)).toBe(true);
    });
  });
});

describe('Tier C Games', () => {
  describe('SPOKE', () => {
    it('should initialize with anchor and candidates', async () => {
      const state = await spokeGame.init(mockContext);
      expect(state.data).toHaveProperty('anchor');
      expect(state.data).toHaveProperty('candidates');
      expect(state.data.candidates.length).toBeGreaterThan(0);
    });
  });

  describe('WARPWORD', () => {
    it('should initialize with original word', async () => {
      const state = await warpwordGame.init(mockContext);
      expect(state.data).toHaveProperty('originalWord');
    });
  });

  describe('VECTOR', () => {
    it('should initialize with anchor words and slider', async () => {
      const state = await vectorGame.init(mockContext);
      expect(state.data).toHaveProperty('anchorA');
      expect(state.data).toHaveProperty('anchorB');
      expect(state.data).toHaveProperty('targetPosition');
      expect(state.data).toHaveProperty('userPosition');
    });

    it('should handle slider updates', async () => {
      const state = await vectorGame.init(mockContext);
      const action: PlayerAction = {
        type: 'custom',
        payload: { type: 'slider', value: 0.7 },
        timestamp: Date.now(),
      };
      const newState = vectorGame.update(mockContext, state, action);
      expect(newState.data.userPosition).toBe(0.7);
    });

    it('should handle slider submit', async () => {
      const state = await vectorGame.init(mockContext);
      const action: PlayerAction = {
        type: 'custom',
        payload: { type: 'submit' },
        timestamp: Date.now(),
      };
      const newState = vectorGame.update(mockContext, state, action);
      expect(newState.done).toBe(true);
      expect(newState.data).toHaveProperty('score');
    });
  });
});

describe('All New Games - General Properties', () => {
  const allNewGames = [
    tribesGame,
    echochainGame,
    ghostGame,
    motifGame,
    flockGame,
    mergeGame,
    pivotwordGame,
    radialGame,
    tracewordGame,
    shardGame,
    spokeGame,
    warpwordGame,
    vectorGame,
  ];

  allNewGames.forEach((game) => {
    describe(game.name, () => {
      it('should have required properties', () => {
        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game).toHaveProperty('shortDescription');
        expect(game).toHaveProperty('supportedModes');
        expect(game).toHaveProperty('init');
        expect(game).toHaveProperty('update');
        expect(game).toHaveProperty('summarize');
        expect(game).toHaveProperty('uiSchema');
      });

      it('should support at least one mode', () => {
        expect(game.supportedModes.length).toBeGreaterThan(0);
      });

      it('should initialize successfully', async () => {
        const state = await game.init(mockContext);
        expect(state).toBeDefined();
        expect(state.step).toBe(0);
        expect(state.done).toBe(false);
        expect(state.data).toBeDefined();
      });

      it('should have valid uiSchema', () => {
        expect(game.uiSchema).toBeDefined();
        expect(game.uiSchema).toHaveProperty('primaryInput');
      });
    });
  });
});
