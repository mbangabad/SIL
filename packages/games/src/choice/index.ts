/** CHOICE Game - Multi-attribute decision making */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface ChoiceState {
  options: Array<{ cost: number; benefit: number; payoff: number }>;
  hiddenWeights: { costWeight: number; benefitWeight: number };
  optimalIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const choiceGame: GameDefinition = {
  id: 'choice',
  name: 'CHOICE',
  shortDescription: 'Pick the option with the highest payoff',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Hidden scoring function weights
    const costWeight = 0.3 + random(ctx.seed) * 0.4; // 0.3 to 0.7
    const benefitWeight = 1 - costWeight;

    // Generate 4 options with cost and benefit
    const options = [];
    for (let i = 0; i < 4; i++) {
      const cost = 10 + Math.floor(random(ctx.seed + i + 1) * 80);
      const benefit = 10 + Math.floor(random(ctx.seed + i + 10) * 80);
      const payoff = benefitWeight * benefit - costWeight * cost;
      options.push({ cost, benefit, payoff });
    }

    // Find optimal option
    let optimalIndex = 0;
    let maxPayoff = options[0].payoff;
    for (let i = 1; i < options.length; i++) {
      if (options[i].payoff > maxPayoff) {
        maxPayoff = options[i].payoff;
        optimalIndex = i;
      }
    }

    return {
      step: 0,
      done: false,
      data: {
        options,
        hiddenWeights: { costWeight, benefitWeight },
        optimalIndex,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as ChoiceState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const choiceState = state.data as ChoiceState;
    if (action.type === 'select') {
      const selectedPayoff = choiceState.options[action.payload.index].payoff;
      const optimalPayoff = choiceState.options[choiceState.optimalIndex].payoff;
      const payoffRange = Math.max(...choiceState.options.map(o => o.payoff)) - Math.min(...choiceState.options.map(o => o.payoff));
      const distance = Math.abs(optimalPayoff - selectedPayoff);
      const score = payoffRange > 0 ? Math.round(Math.max(0, 100 - (distance / payoffRange) * 100)) : 100;
      return { ...state, done: true, data: { ...choiceState, selectedIndex: action.payload.index, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const choiceState = state.data as ChoiceState;
    return {
      score: choiceState.score,
      durationMs: Date.now() - choiceState.startTime,
      skillSignals: { multi_attribute_decision: choiceState.score, utility_estimation: choiceState.score * 0.9 },
      metadata: { weights: choiceState.hiddenWeights },
    };
  },

  uiSchema: { primaryInput: 'grid', layout: '2x2', feedback: 'score-bar', showScore: true },
};
