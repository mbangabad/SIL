/** ANGLE Game - Spatial orientation estimation */
import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface AngleState {
  hiddenAngle: number;
  options: Array<{ id: string; angle: number }>;
  selectedId: string | null;
  score: number;
  startTime: number;
}

export const angleGame: GameDefinition = {
  id: 'angle',
  name: 'ANGLE',
  shortDescription: 'Pick the angle closest to the hidden orientation',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);
    const hiddenAngle = Math.floor(random(baseSeed) * 360);
    const options = [];
    for (let i = 0; i < 9; i++) {
      const offset = (random(baseSeed + i + 1) - 0.5) * 120;
      options.push({ id: `angle-${i}`, angle: (hiddenAngle + offset + 360) % 360 });
    }

    return {
      step: 0,
      done: false,
      data: { hiddenAngle, options, selectedId: null, score: 0, startTime: Date.now() } as AngleState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const angleState = state.data as AngleState;
    if (action.type === 'tap') {
      const selected = angleState.options[parseInt(action.payload.wordId)];
      const delta = Math.min(Math.abs(angleState.hiddenAngle - selected.angle), 360 - Math.abs(angleState.hiddenAngle - selected.angle));
      const score = Math.round(Math.max(0, 100 - (delta / 180) * 100));
      return { ...state, done: true, data: { ...angleState, selectedId: selected.id, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const angleState = state.data as AngleState;
    return {
      score: angleState.score,
      durationMs: Date.now() - angleState.startTime,
      skillSignals: { spatial_angle_precision: angleState.score, rotation_intuition: angleState.score * 0.9 },
      metadata: { hiddenAngle: angleState.hiddenAngle },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
