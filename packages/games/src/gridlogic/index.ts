/**
 * GRIDLOGIC Game
 *
 * Raven-like micro-matrix: tap cell that completes the pattern.
 * Tests pattern induction and relational reasoning.
 */

import type { GameDefinition, GameContext, GameState, PlayerAction, GameResultSummary } from '@sil/core';

type GridCell = 'circle' | 'square' | 'triangle' | 'star' | null;

interface GridLogicState {
  grid: GridCell[][];
  missingPosition: { row: number; col: number };
  correctAnswer: GridCell;
  options: GridCell[];
  selectedAnswer: GridCell | null;
  score: number;
  startTime: number;
}

/**
 * Generate a simple pattern grid (3x3)
 */
function generatePatternGrid(seed: number): { grid: GridCell[][]; missing: { row: number; col: number }; answer: GridCell } {
  const shapes: GridCell[] = ['circle', 'square', 'triangle', 'star'];
  const random = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  // Pattern types
  const patternType = Math.floor(random(seed) * 3);

  let grid: GridCell[][] = [];
  let answer: GridCell = 'circle';

  if (patternType === 0) {
    // Row pattern: each row has same shape
    const shape1 = shapes[Math.floor(random(seed + 1) * shapes.length)];
    const shape2 = shapes[Math.floor(random(seed + 2) * shapes.length)];
    const shape3 = shapes[Math.floor(random(seed + 3) * shapes.length)];

    grid = [
      [shape1, shape1, shape1],
      [shape2, shape2, shape2],
      [shape3, shape3, null], // Missing last cell
    ];
    answer = shape3;
  } else if (patternType === 1) {
    // Column pattern: each column has same shape
    const shape1 = shapes[Math.floor(random(seed + 1) * shapes.length)];
    const shape2 = shapes[Math.floor(random(seed + 2) * shapes.length)];
    const shape3 = shapes[Math.floor(random(seed + 3) * shapes.length)];

    grid = [
      [shape1, shape2, shape3],
      [shape1, shape2, shape3],
      [shape1, shape2, null], // Missing last cell
    ];
    answer = shape3;
  } else {
    // Diagonal pattern
    const shape = shapes[Math.floor(random(seed + 1) * shapes.length)];
    const other = shapes[Math.floor(random(seed + 2) * shapes.length)];

    grid = [
      [shape, other, other],
      [other, shape, other],
      [other, other, null], // Missing diagonal cell
    ];
    answer = shape;
  }

  return {
    grid,
    missing: { row: 2, col: 2 },
    answer,
  };
}

export const gridlogicGame: GameDefinition = {
  id: 'gridlogic',
  name: 'GRIDLOGIC',
  shortDescription: 'Complete the mini-logic grid',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const { grid, missing, answer } = generatePatternGrid(ctx.seed);

    // Generate options (correct + 3 distractors)
    const shapes: GridCell[] = ['circle', 'square', 'triangle', 'star'];
    const options = [
      answer,
      ...shapes.filter(s => s !== answer).slice(0, 3)
    ];

    // Shuffle options
    const random = (s: number) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(random(ctx.seed + 10 + i) * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    const state: GridLogicState = {
      grid,
      missingPosition: missing,
      correctAnswer: answer,
      options,
      selectedAnswer: null,
      score: 0,
      startTime: Date.now(),
    };

    return {
      step: 0,
      done: false,
      data: state,
    };
  },

  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState {
    const gridState = state.data as GridLogicState;

    if (action.type === 'select') {
      const selected = action.payload.word as GridCell;
      const isCorrect = selected === gridState.correctAnswer;
      const score = isCorrect ? 100 : 0;

      return {
        ...state,
        done: true,
        data: {
          ...gridState,
          selectedAnswer: selected,
          score,
        },
      };
    }

    return state;
  },

  summarize(ctx: GameContext, state: GameState): GameResultSummary {
    const gridState = state.data as GridLogicState;

    return {
      score: gridState.score,
      durationMs: Date.now() - gridState.startTime,
      skillSignals: {
        pattern_induction: gridState.score,
        relational_reasoning: gridState.score * 0.9,
        visual_logic: gridState.score * 0.85,
      },
      metadata: {
        correctAnswer: gridState.correctAnswer,
        selectedAnswer: gridState.selectedAnswer,
        patternType: 'grid',
      },
    };
  },

  uiSchema: {
    primaryInput: 'grid',
    layout: '3x3',
    feedback: 'percentile',
    showScore: true,
  },
};
