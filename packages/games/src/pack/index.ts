/** PACK Game - Capacity constraint reasoning */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface PackState {
  capacity: number;
  numbers: number[];
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

export const packGame: GameDefinition = {
  id: 'pack',
  name: 'PACK',
  shortDescription: 'Pick the number that best fits the hidden capacity',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Hidden capacity
    const capacity = 40 + Math.floor(random(baseSeed) * 40);

    // Generate 9 candidate numbers
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      const offset = (random(baseSeed + i + 1) - 0.5) * 60;
      numbers.push(Math.max(10, Math.round(capacity + offset)));
    }

    return {
      step: 0,
      done: false,
      data: {
        capacity,
        numbers,
        selectedNumber: null,
        score: 0,
        startTime: Date.now(),
      } as PackState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const packState = state.data as PackState;
    if (action.type === 'tap') {
      const selected = packState.numbers[parseInt(action.payload.wordId)];
      const distance = Math.abs(selected - packState.capacity);
      const score = Math.round(Math.max(0, 100 - distance));
      return { ...state, done: true, data: { ...packState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const packState = state.data as PackState;
    return {
      score: packState.score,
      durationMs: Date.now() - packState.startTime,
      skillSignals: { capacity_reasoning: packState.score, constraint_satisfaction: packState.score * 0.9 },
      metadata: { capacity: packState.capacity },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
