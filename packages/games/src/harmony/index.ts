/** HARMONY Game - Ratio matching / proportional intuition */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface HarmonyState {
  referencePair: { a: number; b: number };
  referenceRatio: number;
  candidates: Array<{ a: number; b: number; ratio: number }>;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const harmonyGame: GameDefinition = {
  id: 'harmony',
  name: 'HARMONY',
  shortDescription: 'Pick the pair most proportional to the reference',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Generate reference pair
    const refA = Math.floor(random(baseSeed) * 8) + 2;
    const refB = Math.floor(random(baseSeed + 1) * 8) + 2;
    const referenceRatio = refA / refB;

    // Generate 9 candidate pairs
    const candidates = [];
    for (let i = 0; i < 9; i++) {
      const offset = (random(baseSeed + i + 2) - 0.5) * 0.8;
      const targetRatio = referenceRatio + offset;
      const a = Math.floor(random(baseSeed + i + 20) * 8) + 2;
      const b = Math.round(a / targetRatio);
      const actualRatio = a / Math.max(1, b);
      candidates.push({ a, b: Math.max(1, b), ratio: actualRatio });
    }

    return {
      step: 0,
      done: false,
      data: {
        referencePair: { a: refA, b: refB },
        referenceRatio,
        candidates,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as HarmonyState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const harmonyState = state.data as HarmonyState;
    if (action.type === 'tap') {
      const selected = harmonyState.candidates[parseInt(action.payload.wordId)];
      const distance = Math.abs(harmonyState.referenceRatio - selected.ratio);
      const score = Math.round(Math.max(0, 100 - distance * 50));
      return { ...state, done: true, data: { ...harmonyState, selectedIndex: parseInt(action.payload.wordId), score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const harmonyState = state.data as HarmonyState;
    return {
      score: harmonyState.score,
      durationMs: Date.now() - harmonyState.startTime,
      skillSignals: { ratio_comparison: harmonyState.score, proportional_intuition: harmonyState.score * 0.9 },
      metadata: { referenceRatio: harmonyState.referenceRatio },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
