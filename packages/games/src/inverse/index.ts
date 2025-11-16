/**
 * INVERSE Game
 * Given input→output samples, pick the correct inverse output for a new input.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface InverseState {
  function: { type: 'add' | 'multiply' | 'composite'; value: number };
  samples: Array<{ input: number; output: number }>;
  targetOutput: number;
  correctInput: number;
  options: number[];
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

function applyFunction(x: number, fn: { type: string; value: number }): number {
  if (fn.type === 'add') return x + fn.value;
  if (fn.type === 'multiply') return x * fn.value;
  return (x + fn.value) * 2; // composite
}

function inverseFunction(y: number, fn: { type: string; value: number }): number {
  if (fn.type === 'add') return y - fn.value;
  if (fn.type === 'multiply') return y / fn.value;
  return (y / 2) - fn.value; // composite inverse
}

export const inverseGame: GameDefinition = {
  id: 'inverse',
  name: 'INVERSE',
  shortDescription: 'Infer the inverse rule from samples',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const functionTypes: Array<'add' | 'multiply' | 'composite'> = ['add', 'multiply', 'composite'];
    const fnType = functionTypes[Math.floor(random(ctx.seed) * functionTypes.length)];
    const fnValue = fnType === 'multiply' ? 2 : 3 + Math.floor(random(ctx.seed + 1) * 5);

    const fn = { type: fnType, value: fnValue };

    const samples = [
      { input: 2, output: applyFunction(2, fn) },
      { input: 4, output: applyFunction(4, fn) },
    ];

    const targetOutput = 20;
    const correctInput = Math.round(inverseFunction(targetOutput, fn));

    const options = [
      correctInput,
      correctInput + 1,
      correctInput - 1,
      correctInput + 2,
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(ctx.seed + 10 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      step: 0,
      done: false,
      data: {
        function: fn,
        samples,
        targetOutput,
        correctInput,
        options,
        selectedNumber: null,
        score: 0,
        startTime: Date.now(),
      } as InverseState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const invState = state.data as InverseState;
    if (action.type === 'select') {
      const selected = typeof action.payload.word === 'string'
        ? parseInt(action.payload.word, 10)
        : invState.options[action.payload.index];

      const score = selected === invState.correctInput ? 100 : 0;
      return { ...state, done: true, data: { ...invState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const invState = state.data as InverseState;
    return {
      score: invState.score,
      durationMs: Date.now() - invState.startTime,
      skillSignals: {
        functional_inverse_reasoning: invState.score,
        rule_inversion: invState.score * 0.95,
        relational_mapping: invState.score * 0.9,
        inductive_logic: invState.score * 0.85,
      },
      metadata: { correctInput: invState.correctInput, selected: invState.selectedNumber },
    };
  },

  uiSchema: { primaryInput: 'grid', layout: 'list', feedback: 'percentile', showScore: true },
};
