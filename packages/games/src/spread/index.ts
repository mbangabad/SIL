/** SPREAD Game - Range/spread center intuition */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface SpreadState {
  numbers: number[];
  range: { min: number; max: number };
  idealCenter: number;
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

export const spreadGame: GameDefinition = {
  id: 'spread',
  name: 'SPREAD',
  shortDescription: 'Pick the number most centered in the spread',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Generate a set of numbers with known range
    const min = 10 + Math.floor(random(baseSeed) * 30);
    const max = min + 40 + Math.floor(random(baseSeed + 1) * 40);
    const idealCenter = (min + max) / 2;

    // Generate 9 candidate numbers
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      const offset = (random(baseSeed + i + 2) - 0.5) * (max - min);
      const num = Math.round(idealCenter + offset);
      numbers.push(Math.max(min, Math.min(max, num)));
    }

    return {
      step: 0,
      done: false,
      data: {
        numbers,
        range: { min, max },
        idealCenter,
        selectedNumber: null,
        score: 0,
        startTime: Date.now(),
      } as SpreadState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const spreadState = state.data as SpreadState;
    if (action.type === 'tap') {
      const selected = spreadState.numbers[parseInt(action.payload.wordId)];
      const distance = Math.abs(selected - spreadState.idealCenter);
      const maxDistance = (spreadState.range.max - spreadState.range.min) / 2;
      const score = Math.round(Math.max(0, 100 - (distance / maxDistance) * 100));
      return { ...state, done: true, data: { ...spreadState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const spreadState = state.data as SpreadState;
    return {
      score: spreadState.score,
      durationMs: Date.now() - spreadState.startTime,
      skillSignals: { distribution_intuition: spreadState.score, range_estimation: spreadState.score * 0.9 },
      metadata: { range: spreadState.range },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
