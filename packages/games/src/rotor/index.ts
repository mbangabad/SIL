/**
 * ROTOR Game
 * Tap the shape rotated to match target orientation.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface RotorState {
  targetRotation: number;
  options: Array<{ id: string; rotation: number }>;
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  startTime: number;
}

export const rotorGame: GameDefinition = {
  id: 'rotor',
  name: 'ROTOR',
  shortDescription: 'Pick the rotated match',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const targetRotation = Math.floor(random(baseSeed) * 4) * 90;

    const options = [
      { id: 'opt-0', rotation: targetRotation },
      { id: 'opt-1', rotation: (targetRotation + 90) % 360 },
      { id: 'opt-2', rotation: (targetRotation + 180) % 360 },
      { id: 'opt-3', rotation: (targetRotation + 270) % 360 },
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(baseSeed + 10 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const correctIndex = options.findIndex(opt => opt.rotation === targetRotation);

    return {
      step: 0,
      done: false,
      data: {
        targetRotation,
        options,
        correctIndex,
        selectedIndex: null,
        score: 0,
        startTime: Date.now(),
      } as RotorState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const rotorState = state.data as RotorState;
    if (action.type === 'tap') {
      const selectedIndex = parseInt(action.payload.wordId) ?? 0;
      const score = selectedIndex === rotorState.correctIndex ? 100 : 0;
      return { ...state, done: true, data: { ...rotorState, selectedIndex, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const rotorState = state.data as RotorState;
    return {
      score: rotorState.score,
      durationMs: Date.now() - rotorState.startTime,
      skillSignals: {
        mental_rotation: rotorState.score,
        spatial_transformation: rotorState.score * 0.9,
        rotation_precision: rotorState.score * 0.85,
      },
      metadata: { targetRotation: rotorState.targetRotation },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'grid', feedback: 'hot-cold' },
};
