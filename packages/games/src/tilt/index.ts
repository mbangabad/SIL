/** TILT Game - Distribution balance / median intuition */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface TiltState {
  numbers: number[];
  median: number;
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

export const tiltGame: GameDefinition = {
  id: 'tilt',
  name: 'TILT',
  shortDescription: 'Pick the number closest to the group\'s median',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);
    const numbers = [];
    for (let i = 0; i < 9; i++) {
      numbers.push(10 + Math.floor(random(baseSeed + i) * 80));
    }
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return {
      step: 0,
      done: false,
      data: { numbers, median, selectedNumber: null, score: 0, startTime: Date.now() } as TiltState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const tiltState = state.data as TiltState;
    if (action.type === 'tap') {
      const selected = typeof action.payload.wordId === 'string' ? parseInt(action.payload.wordId, 10) : tiltState.numbers[parseInt(action.payload.wordId)];
      const score = Math.max(0, 100 - Math.abs(selected - tiltState.median));
      return { ...state, done: true, data: { ...tiltState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const tiltState = state.data as TiltState;
    return {
      score: tiltState.score,
      durationMs: Date.now() - tiltState.startTime,
      skillSignals: { distribution_intuition: tiltState.score, statistical_reasoning: tiltState.score * 0.9 },
      metadata: { median: tiltState.median },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
