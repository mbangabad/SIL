/** RISK Game - Risk-reward tradeoff reasoning */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface RiskState {
  hiddenRisk: 'low' | 'med' | 'high';
  candidates: Array<{ value: number; volatility: number }>;
  selectedValue: number | null;
  score: number;
  startTime: number;
}

export const riskGame: GameDefinition = {
  id: 'risk',
  name: 'RISK',
  shortDescription: 'Pick the number with the best risk-reward tradeoff',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);
    const risks: Array<'low' | 'med' | 'high'> = ['low', 'med', 'high'];
    const hiddenRisk = risks[Math.floor(random(baseSeed) * 3)];
    const targetVol = hiddenRisk === 'low' ? 0.2 : hiddenRisk === 'med' ? 0.5 : 0.8;

    const candidates = [];
    for (let i = 0; i < 9; i++) {
      const value = 10 + Math.floor(random(baseSeed + i + 1) * 80);
      const volatility = random(baseSeed + i + 10);
      candidates.push({ value, volatility });
    }

    return {
      step: 0,
      done: false,
      data: { hiddenRisk, candidates, selectedValue: null, score: 0, startTime: Date.now() } as RiskState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const riskState = state.data as RiskState;
    if (action.type === 'tap') {
      const selected = riskState.candidates[parseInt(action.payload.wordId)];
      const targetVol = riskState.hiddenRisk === 'low' ? 0.2 : riskState.hiddenRisk === 'med' ? 0.5 : 0.8;
      const score = Math.round(Math.max(0, 100 - Math.abs(targetVol - selected.volatility) * 100));
      return { ...state, done: true, data: { ...riskState, selectedValue: selected.value, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const riskState = state.data as RiskState;
    return {
      score: riskState.score,
      durationMs: Date.now() - riskState.startTime,
      skillSignals: { risk_profile: riskState.score, decision_style: riskState.score * 0.9 },
      metadata: { hiddenRisk: riskState.hiddenRisk },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
