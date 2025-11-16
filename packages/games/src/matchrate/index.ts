/** MATCHRATE Game - Trend/growth rate matching */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface MatchrateState {
  hiddenSlope: number;
  options: Array<{ value: number; slope: number }>;
  selectedValue: number | null;
  score: number;
  startTime: number;
}

export const matchrateGame: GameDefinition = {
  id: 'matchrate',
  name: 'MATCHRATE',
  shortDescription: 'Match the hidden growth rate',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);
    const hiddenSlope = 0.2 + random(baseSeed) * 0.6;
    const options = [];
    for (let i = 0; i < 4; i++) {
      const slope = 0.1 + random(baseSeed + i + 1) * 0.8;
      options.push({ value: 10 + i * 5, slope });
    }

    return {
      step: 0,
      done: false,
      data: { hiddenSlope, options, selectedValue: null, score: 0, startTime: Date.now() } as MatchrateState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const matchState = state.data as MatchrateState;
    if (action.type === 'tap') {
      const selected = matchState.options[parseInt(action.payload.wordId)];
      const score = Math.round(Math.max(0, 100 - Math.abs(matchState.hiddenSlope - selected.slope) * 100));
      return { ...state, done: true, data: { ...matchState, selectedValue: selected.value, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const matchState = state.data as MatchrateState;
    return {
      score: matchState.score,
      durationMs: Date.now() - matchState.startTime,
      skillSignals: { trend_inference: matchState.score, rate_of_change_estimation: matchState.score * 0.9 },
      metadata: { hiddenSlope: matchState.hiddenSlope },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'list', feedback: 'score-bar' },
};
