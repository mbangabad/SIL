/** GROWTH Game - Infer output from growth function samples */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface GrowthState {
  samples: Array<{ input: number; output: number }>;
  targetInput: number;
  correctOutput: number;
  options: number[];
  selectedIndex: number | null;
  growthFunction: { type: 'linear' | 'exponential' | 'quadratic'; param: number };
  score: number;
  startTime: number;
}

export const growthGame: GameDefinition = {
  id: 'growth',
  name: 'GROWTH',
  shortDescription: 'Infer the output from the growth pattern',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Choose growth function type
    const types: Array<'linear' | 'exponential' | 'quadratic'> = ['linear', 'exponential', 'quadratic'];
    const growthType = types[Math.floor(random(baseSeed) * 3)];
    const param = 1 + Math.floor(random(baseSeed + 1) * 4); // 1-4

    const applyGrowth = (x: number): number => {
      if (growthType === 'linear') return x * param;
      if (growthType === 'exponential') return Math.pow(x, param);
      return param * x * x; // quadratic
    };

    // Generate 3 samples
    const samples = [];
    for (let i = 0; i < 3; i++) {
      const input = i + 2;
      const output = Math.round(applyGrowth(input));
      samples.push({ input, output });
    }

    // Target input
    const targetInput = 5;
    const correctOutput = Math.round(applyGrowth(targetInput));

    // Generate options (correct + 3 distractors)
    const options = [correctOutput];
    for (let i = 0; i < 3; i++) {
      const offset = Math.floor((random(baseSeed + 10 + i) - 0.5) * correctOutput);
      options.push(Math.max(1, correctOutput + offset));
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(baseSeed + 20 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      step: 0,
      done: false,
      data: {
        samples,
        targetInput,
        correctOutput,
        options,
        selectedIndex: null,
        growthFunction: { type: growthType, param },
        score: 0,
        startTime: Date.now(),
      } as GrowthState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const growthState = state.data as GrowthState;
    if (action.type === 'tap') {
      const selected = growthState.options[parseInt(action.payload.wordId)];
      const distance = Math.abs(selected - growthState.correctOutput);
      const maxDistance = Math.max(...growthState.options.map(o => Math.abs(o - growthState.correctOutput)));
      const score = maxDistance > 0 ? Math.round(Math.max(0, 100 - (distance / maxDistance) * 100)) : 100;
      return { ...state, done: true, data: { ...growthState, selectedIndex: parseInt(action.payload.wordId), score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const growthState = state.data as GrowthState;
    return {
      score: growthState.score,
      durationMs: Date.now() - growthState.startTime,
      skillSignals: { function_induction: growthState.score, extrapolation: growthState.score * 0.9 },
      metadata: { growthType: growthState.growthFunction.type },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
