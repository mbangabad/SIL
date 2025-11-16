/**
 * NUMGRIP Game
 *
 * Pick the number closest to the hidden target.
 * Tests magnitude estimation and numeric precision.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface NumgripState {
  target: number;
  candidates: number[];
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

/**
 * Generate candidate numbers around target with random offsets
 */
function generateCandidates(target: number, count: number, seed: number): number[] {
  const candidates: number[] = [];
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < count; i++) {
    // Gaussian-ish offset
    const offset = (random(seed + i) - 0.5) * 40; // ±20 range
    const value = Math.round(Math.max(0, Math.min(100, target + offset)));
    candidates.push(value);
  }

  // Ensure no exact duplicates
  return [...new Set(candidates)].slice(0, count);
}

export const numgripGame: GameDefinition = {
  id: 'numgrip',
  name: 'NUMGRIP',
  shortDescription: 'Pick the number closest to the hidden target',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // Generate hidden target
    const target = Math.round(random(ctx.seed) * 100);

    // Generate candidates
    const candidates = generateCandidates(target, 9, ctx.seed + 1);

    const state: NumgripState = {
      target,
      candidates,
      selectedNumber: null,
      score: 0,
      startTime: Date.now(),
    };

    return {
      step: 0,
      done: false,
      data: state,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const numgripState = state.data as NumgripState;

    if (action.type === 'select') {
      const selectedNumber = typeof action.payload.word === 'string'
        ? parseInt(action.payload.word, 10)
        : action.payload.index !== undefined
        ? numgripState.candidates[action.payload.index]
        : null;

      if (selectedNumber === null || isNaN(selectedNumber)) {
        return state;
      }

      // Calculate score based on distance from target
      const distance = Math.abs(numgripState.target - selectedNumber);
      const score = Math.round(Math.max(0, 100 - distance));

      return {
        ...state,
        done: true,
        data: {
          ...numgripState,
          selectedNumber,
          score,
        },
      };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const numgripState = state.data as NumgripState;

    return {
      score: numgripState.score,
      durationMs: Date.now() - numgripState.startTime,
      skillSignals: {
        numeric_precision: numgripState.score,
        magnitude_estimation: numgripState.score * 0.95,
        decision_speed: Math.min(100, 10000 / (Date.now() - numgripState.startTime) * 100),
      },
      metadata: {
        target: numgripState.target,
        selected: numgripState.selectedNumber,
        distance: numgripState.selectedNumber
          ? Math.abs(numgripState.target - numgripState.selectedNumber)
          : null,
      },
    };
  },

  uiSchema: {
    primaryInput: 'grid',
    layout: '3x3',
    feedback: 'score-bar',
    showScore: true,
  },
};
