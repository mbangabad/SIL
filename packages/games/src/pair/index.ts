/** PAIR Game - Pick pair following same relational rule */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface PairState {
  referencePair: { a: number; b: number };
  rule: { type: 'sum' | 'product' | 'difference' | 'ratio'; value: number };
  candidates: Array<{ a: number; b: number; ruleValue: number }>;
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const pairGame: GameDefinition = {
  id: 'pair',
  name: 'PAIR',
  shortDescription: 'Pick the pair following the same rule',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Choose rule type
    const ruleTypes: Array<'sum' | 'product' | 'difference' | 'ratio'> = ['sum', 'product', 'difference', 'ratio'];
    const ruleType = ruleTypes[Math.floor(random(baseSeed) * 4)];

    // Generate reference pair
    const refA = Math.floor(random(baseSeed + 1) * 8) + 2;
    const refB = Math.floor(random(baseSeed + 2) * 8) + 2;

    const calculateRuleValue = (a: number, b: number, type: typeof ruleType): number => {
      if (type === 'sum') return a + b;
      if (type === 'product') return a * b;
      if (type === 'difference') return Math.abs(a - b);
      return a / b; // ratio
    };

    const ruleValue = calculateRuleValue(refA, refB, ruleType);

    // Generate candidates (1 correct + 8 incorrect)
    const candidates = [];

    // Correct candidate
    const correctA = Math.floor(random(baseSeed + 10) * 8) + 2;
    let correctB: number;
    if (ruleType === 'sum') correctB = ruleValue - correctA;
    else if (ruleType === 'product') correctB = Math.round(ruleValue / correctA);
    else if (ruleType === 'difference') correctB = correctA + ruleValue;
    else correctB = Math.round(correctA / ruleValue);

    correctB = Math.max(1, correctB);
    candidates.push({ a: correctA, b: correctB, ruleValue: calculateRuleValue(correctA, correctB, ruleType) });

    // Incorrect candidates
    for (let i = 0; i < 8; i++) {
      const a = Math.floor(random(baseSeed + 20 + i) * 8) + 2;
      const b = Math.floor(random(baseSeed + 30 + i) * 8) + 2;
      candidates.push({ a, b, ruleValue: calculateRuleValue(a, b, ruleType) });
    }

    // Shuffle candidates
    const correctIndex = 0;
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(random(baseSeed + 40 + i) * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    const finalCorrectIndex = candidates.findIndex(c => c.a === correctA && c.b === correctB);

    return {
      step: 0,
      done: false,
      data: {
        referencePair: { a: refA, b: refB },
        rule: { type: ruleType, value: ruleValue },
        candidates,
        correctIndex: finalCorrectIndex,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as PairState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const pairState = state.data as PairState;
    if (action.type === 'tap') {
      const selected = pairState.candidates[parseInt(action.payload.wordId)];
      const distance = Math.abs(pairState.rule.value - selected.ruleValue);
      const allDistances = pairState.candidates.map(c => Math.abs(pairState.rule.value - c.ruleValue));
      const maxDistance = Math.max(...allDistances);
      const score = maxDistance > 0 ? Math.round(Math.max(0, 100 - (distance / maxDistance) * 100)) : 100;
      return { ...state, done: true, data: { ...pairState, selectedIndex: parseInt(action.payload.wordId), score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const pairState = state.data as PairState;
    return {
      score: pairState.score,
      durationMs: Date.now() - pairState.startTime,
      skillSignals: { relational_reasoning: pairState.score, rule_abstraction: pairState.score * 0.9 },
      metadata: { ruleType: pairState.rule.type },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'score-bar' },
};
