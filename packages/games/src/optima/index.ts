/**
 * OPTIMA Game
 * Choose the number representing the best tradeoff under a hidden multi-factor rule.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface OptimaState {
  hiddenWeights: { w1: number; w2: number };
  candidates: Array<{ value: number; payoff: number }>;
  selectedValue: number | null;
  score: number;
  startTime: number;
}

export const optimaGame: GameDefinition = {
  id: 'optima',
  name: 'OPTIMA',
  shortDescription: 'Pick the optimal number under hidden tradeoffs',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const w1 = 0.3 + random(baseSeed) * 0.4;
    const w2 = 1 - w1;

    const candidates = [];
    for (let i = 0; i < 9; i++) {
      const value = 10 + Math.floor(random(baseSeed + i + 1) * 80);
      const payoff = w1 * value + w2 * Math.sqrt(value * 10);
      candidates.push({ value, payoff });
    }

    return {
      step: 0,
      done: false,
      data: {
        hiddenWeights: { w1, w2 },
        candidates,
        selectedValue: null,
        score: 0,
        startTime: Date.now(),
      } as OptimaState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const optimaState = state.data as OptimaState;
    if (action.type === 'tap') {
      const selectedValue = typeof action.payload.wordId === 'string'
        ? parseInt(action.payload.wordId, 10)
        : optimaState.candidates[parseInt(action.payload.wordId)]?.value;

      const selected = optimaState.candidates.find(c => c.value === selectedValue);
      const maxPayoff = Math.max(...optimaState.candidates.map(c => c.payoff));
      const score = selected ? Math.round((selected.payoff / maxPayoff) * 100) : 0;

      return { ...state, done: true, data: { ...optimaState, selectedValue, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const optimaState = state.data as OptimaState;
    return {
      score: optimaState.score,
      durationMs: Date.now() - optimaState.startTime,
      skillSignals: {
        strategic_selection: optimaState.score,
        multi_factor_optimization: optimaState.score * 0.9,
        inference_efficiency: optimaState.score * 0.85,
      },
      metadata: { selectedValue: optimaState.selectedValue },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
