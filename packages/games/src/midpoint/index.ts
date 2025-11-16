/**
 * MIDPOINT Game
 * Pick the number closest to the true midpoint of A and B.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface MidpointState {
  numberA: number;
  numberB: number;
  midpoint: number;
  candidates: number[];
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

export const midpointGame: GameDefinition = {
  id: 'midpoint',
  name: 'MIDPOINT',
  shortDescription: 'Find the intuitive numeric midpoint',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const numberA = Math.floor(random(baseSeed) * 50) + 10;
    const numberB = Math.floor(random(baseSeed + 1) * 50) + 60;
    const midpoint = Math.round((numberA + numberB) / 2);

    const candidates = [];
    for (let i = 0; i < 9; i++) {
      const offset = (random(baseSeed + i + 2) - 0.5) * 30;
      candidates.push(Math.round(midpoint + offset));
    }

    return {
      step: 0,
      done: false,
      data: {
        numberA,
        numberB,
        midpoint,
        candidates: [...new Set(candidates)].slice(0, 9),
        selectedNumber: null,
        score: 0,
        startTime: Date.now(),
      } as MidpointState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const midState = state.data as MidpointState;
    if (action.type === 'tap') {
      const selected = typeof action.payload.wordId === 'string'
        ? parseInt(action.payload.wordId, 10)
        : midState.candidates[parseInt(action.payload.wordId)];

      const distance = Math.abs(selected - midState.midpoint);
      const score = Math.max(0, 100 - distance);

      return { ...state, done: true, data: { ...midState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const midState = state.data as MidpointState;
    return {
      score: midState.score,
      durationMs: Date.now() - midState.startTime,
      skillSignals: {
        numeric_midpoint_precision: midState.score,
        interpolation: midState.score * 0.95,
        proportionality_intuition: midState.score * 0.9,
      },
      metadata: { midpoint: midState.midpoint, selected: midState.selectedNumber },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
