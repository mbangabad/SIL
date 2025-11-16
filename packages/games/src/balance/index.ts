/** BALANCE Game - Proportional reasoning / seesaw balance */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface BalanceState {
  leftShapes: Array<{ shape: string; weight: number }>;
  totalLeftWeight: number;
  options: Array<{ shape: string; count: number; weight: number }>;
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const balanceGame: GameDefinition = {
  id: 'balance',
  name: 'BALANCE',
  shortDescription: 'Pick the shape that balances the seesaw',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const shapes = ['circle', 'square', 'triangle', 'star'];
    const weights = { circle: 1, square: 2, triangle: 3, star: 4 };

    // Generate left side (2-3 shapes)
    const leftCount = Math.floor(random(baseSeed) * 2) + 2;
    const leftShapes = [];
    let totalLeftWeight = 0;

    for (let i = 0; i < leftCount; i++) {
      const shape = shapes[Math.floor(random(baseSeed + i + 1) * shapes.length)];
      const weight = weights[shape as keyof typeof weights];
      leftShapes.push({ shape, weight });
      totalLeftWeight += weight;
    }

    // Generate options (correct answer + 3 distractors)
    const options = [];
    const correctShape = shapes[Math.floor(random(baseSeed + 10) * shapes.length)];
    const correctWeight = weights[correctShape as keyof typeof weights];
    const correctCount = Math.ceil(totalLeftWeight / correctWeight);

    options.push({ shape: correctShape, count: correctCount, weight: correctCount * correctWeight });

    // Add distractors
    for (let i = 0; i < 3; i++) {
      const shape = shapes[Math.floor(random(baseSeed + 20 + i) * shapes.length)];
      const weight = weights[shape as keyof typeof weights];
      const count = Math.floor(random(baseSeed + 30 + i) * 4) + 1;
      options.push({ shape, count, weight: count * weight });
    }

    // Shuffle options
    const correctIndex = 0;
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(baseSeed + 40 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const finalCorrectIndex = options.findIndex(opt => opt.shape === correctShape && opt.count === correctCount);

    return {
      step: 0,
      done: false,
      data: {
        leftShapes,
        totalLeftWeight,
        options,
        correctIndex: finalCorrectIndex,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as BalanceState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const balanceState = state.data as BalanceState;
    if (action.type === 'tap') {
      const score = parseInt(action.payload.wordId) === balanceState.correctIndex ? 100 : 0;
      return { ...state, done: true, data: { ...balanceState, selectedIndex: parseInt(action.payload.wordId), score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const balanceState = state.data as BalanceState;
    return {
      score: balanceState.score,
      durationMs: Date.now() - balanceState.startTime,
      skillSignals: { proportional_reasoning: balanceState.score, intuitive_physics: balanceState.score * 0.85 },
      metadata: { totalWeight: balanceState.totalLeftWeight },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
