/**
 * NEXT Game
 * Identify the next number in an intuitive visual pattern.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

interface NextState {
  sequence: number[];
  ruleType: 'add' | 'multiply' | 'quadratic';
  ruleValue: number;
  correctNext: number;
  options: number[];
  selectedNumber: number | null;
  score: number;
  startTime: number;
}

export const nextGame: GameDefinition = {
  id: 'next',
  name: 'NEXT',
  shortDescription: 'Choose the next number in the pattern',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const baseSeed = parseInt(ctx.seed, 10) || 0;
    const random = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

    const ruleTypes: Array<'add' | 'multiply' | 'quadratic'> = ['add', 'multiply', 'quadratic'];
    const ruleType = ruleTypes[Math.floor(random(baseSeed) * ruleTypes.length)];

    let sequence: number[];
    let correctNext: number;
    let ruleValue: number;

    if (ruleType === 'add') {
      ruleValue = 2 + Math.floor(random(baseSeed + 1) * 4); // +2 to +5
      const start = 1 + Math.floor(random(baseSeed + 2) * 10);
      sequence = [start, start + ruleValue, start + 2 * ruleValue];
      correctNext = start + 3 * ruleValue;
    } else if (ruleType === 'multiply') {
      ruleValue = 2;
      const start = 1 + Math.floor(random(baseSeed + 2) * 3);
      sequence = [start, start * 2, start * 4];
      correctNext = start * 8;
    } else {
      ruleValue = 1;
      sequence = [1, 4, 9]; // squares: 1², 2², 3²
      correctNext = 16; // 4²
    }

    const options = [
      correctNext,
      correctNext + 1,
      correctNext - 1,
      correctNext + ruleValue,
    ];

    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(baseSeed + 10 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    return {
      step: 0,
      done: false,
      data: {
        sequence,
        ruleType,
        ruleValue,
        correctNext,
        options,
        selectedNumber: null,
        score: 0,
        startTime: Date.now(),
      } as NextState,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const nextState = state.data as NextState;
    if (action.type === 'tap') {
      const selected = typeof action.payload.wordId === 'string'
        ? parseInt(action.payload.wordId, 10)
        : nextState.options[parseInt(action.payload.wordId)];

      const score = selected === nextState.correctNext ? 100 : 0;
      return { ...state, done: true, data: { ...nextState, selectedNumber: selected, score } };
    }
    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const nextState = state.data as NextState;
    return {
      score: nextState.score,
      durationMs: Date.now() - nextState.startTime,
      skillSignals: {
        pattern_induction: nextState.score,
        sequence_reasoning: nextState.score * 0.95,
      },
      metadata: { correctNext: nextState.correctNext, selected: nextState.selectedNumber },
    };
  },

  uiSchema: { input: 'tap-one', layout: 'list', feedback: 'percentile' },
};
