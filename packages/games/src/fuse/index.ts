/** FUSE Game - Pattern fusion / rule combination */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface FuseState {
  pattern1: number[];
  pattern2: number[];
  fusionRule: 'sum' | 'max' | 'min' | 'avg';
  correctFusion: number[];
  options: number[][];
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const fuseGame: GameDefinition = {
  id: 'fuse',
  name: 'FUSE',
  shortDescription: 'Fuse two patterns and pick the result',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    // Generate two patterns (3 numbers each)
    const pattern1 = [];
    const pattern2 = [];
    for (let i = 0; i < 3; i++) {
      pattern1.push(Math.floor(random(ctx.seed + i) * 20) + 10);
      pattern2.push(Math.floor(random(ctx.seed + i + 10) * 20) + 10);
    }

    // Choose fusion rule
    const rules: Array<'sum' | 'max' | 'min' | 'avg'> = ['sum', 'max', 'min', 'avg'];
    const fusionRule = rules[Math.floor(random(ctx.seed + 20) * 4)];

    // Apply fusion rule
    const correctFusion = [];
    for (let i = 0; i < 3; i++) {
      if (fusionRule === 'sum') correctFusion.push(pattern1[i] + pattern2[i]);
      else if (fusionRule === 'max') correctFusion.push(Math.max(pattern1[i], pattern2[i]));
      else if (fusionRule === 'min') correctFusion.push(Math.min(pattern1[i], pattern2[i]));
      else correctFusion.push(Math.round((pattern1[i] + pattern2[i]) / 2));
    }

    // Generate options (correct + 3 distractors)
    const options = [correctFusion];
    for (let i = 0; i < 3; i++) {
      const distractor = [];
      for (let j = 0; j < 3; j++) {
        const offset = Math.floor((random(ctx.seed + 30 + i * 3 + j) - 0.5) * 20);
        distractor.push(Math.max(1, correctFusion[j] + offset));
      }
      options.push(distractor);
    }

    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(ctx.seed + 50 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.findIndex(opt =>
      opt.length === correctFusion.length &&
      opt.every((val, idx) => val === correctFusion[idx])
    );

    return {
      step: 0,
      done: false,
      data: {
        pattern1,
        pattern2,
        fusionRule,
        correctFusion,
        options,
        correctIndex,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as FuseState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const fuseState = state.data as FuseState;
    if (action.type === 'select') {
      const score = action.payload.index === fuseState.correctIndex ? 100 : 0;
      return { ...state, done: true, data: { ...fuseState, selectedIndex: action.payload.index, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const fuseState = state.data as FuseState;
    return {
      score: fuseState.score,
      durationMs: Date.now() - fuseState.startTime,
      skillSignals: { pattern_fusion: fuseState.score, rule_combination: fuseState.score * 0.9 },
      metadata: { fusionRule: fuseState.fusionRule },
    };
  },

  uiSchema: { primaryInput: 'grid', layout: '2x2', feedback: 'hot-cold', showScore: true },
};
