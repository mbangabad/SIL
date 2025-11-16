/** FLIP Game - Spatial transformation (flip recognition) */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface FlipState {
  shape: string;
  flipType: 'H' | 'V';
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const flipGame: GameDefinition = {
  id: 'flip',
  name: 'FLIP',
  shortDescription: 'Pick the correct flipped version of the shape',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);
    const shapes = ['arrow', 'L-shape', 'triangle', 'asymmetric'];
    const shape = shapes[Math.floor(random(baseSeed) * shapes.length)];
    const flipType = random(baseSeed + 1) > 0.5 ? 'H' : 'V';
    const correctIndex = Math.floor(random(baseSeed + 2) * 4);

    return {
      step: 0,
      done: false,
      data: { shape, flipType, correctIndex, selectedIndex: null, score: 0, startTime: Date.now() } as FlipState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const flipState = state.data as FlipState;
    if (action.type === 'tap') {
      const score = parseInt(action.payload.wordId) === flipState.correctIndex ? 100 : 0;
      return { ...state, done: true, data: { ...flipState, selectedIndex: parseInt(action.payload.wordId), score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const flipState = state.data as FlipState;
    return {
      score: flipState.score,
      durationMs: Date.now() - flipState.startTime,
      skillSignals: { spatial_transformation: flipState.score, reflection_reasoning: flipState.score * 0.9 },
      metadata: { flipType: flipState.flipType },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
