/**
 * VECTOR - Semantic direction slider game
 *
 * Slide a semantic "dial" to the point you believe best aligns with the hidden
 * conceptual dimension (e.g., calm → intense, abstract → concrete).
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import {
  calculateGradientDirection,
  projectOntoGradient,
  embeddingService,
} from '@sil/semantics';

interface VectorState {
  anchorA: string;
  anchorB: string;
  directionVector: number[];
  targetPosition: number; // 0-1
  userPosition: number; // 0-1
  score: number;
}

/**
 * Semantic dimensions for VECTOR
 */
const SEMANTIC_DIMENSIONS = [
  ['calm', 'intense'],
  ['simple', 'complex'],
  ['concrete', 'abstract'],
  ['light', 'heavy'],
  ['soft', 'hard'],
];

/**
 * Hidden target themes for positioning
 */
const TARGET_THEMES = [
  'moderate',
  'medium',
  'balanced',
  'neutral',
  'middle',
];

/**
 * Select dimension based on seed
 */
function selectDimension(seed: string): [string, string] {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const dim = SEMANTIC_DIMENSIONS[hash % SEMANTIC_DIMENSIONS.length];
  return [dim[0], dim[1]];
}

/**
 * Select target theme
 */
function selectTargetTheme(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1);
  return TARGET_THEMES[hash % TARGET_THEMES.length];
}

/**
 * VECTOR Game Definition
 */
export const vectorGame: GameDefinition = {
  id: 'vector',
  name: 'VECTOR',
  shortDescription: 'Slide to the point matching the hidden semantic direction',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const [anchorA, anchorB] = selectDimension(ctx.seed);
    const targetTheme = selectTargetTheme(ctx.seed + 'theme');

    // Calculate direction vector
    const directionVector = await calculateGradientDirection(
      anchorA,
      anchorB,
      ctx.language
    );

    if (!directionVector) {
      throw new Error('Could not calculate direction vector');
    }

    // Calculate target position by projecting theme onto gradient
    const targetPosition = await projectOntoGradient(
      targetTheme,
      anchorA,
      anchorB,
      ctx.language
    );

    const state: VectorState = {
      anchorA,
      anchorB,
      directionVector,
      targetPosition,
      userPosition: 0.5, // Start at middle
      score: 0,
    };

    return {
      step: 0,
      done: false,
      data: state,
    };
  },

  async update(
    ctx: GameContext,
    state: GameState,
    action: PlayerAction
  ): Promise<GameState> {
    const vectorState = state.data as VectorState;

    // Handle slider update
    if (action.type === 'custom' && action.payload.type === 'slider') {
      const position = Math.max(0, Math.min(1, action.payload.value));

      return {
        ...state,
        data: {
          ...vectorState,
          userPosition: position,
        },
      };
    }

    // Handle submit
    if (action.type === 'custom' && action.payload.type === 'submit') {
      // Calculate score based on distance from target
      const distance = Math.abs(vectorState.targetPosition - vectorState.userPosition);
      const score = Math.round((1 - distance) * 100);

      return {
        step: state.step + 1,
        done: true,
        data: {
          ...vectorState,
          score,
        },
      };
    }

    return state;
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const vectorState = state.data as VectorState;

    return {
      score: vectorState.score,
      durationMs: 0,
      accuracy: vectorState.score,
      skillSignals: {
        semantic_precision: vectorState.score / 100,
        gradient_mapping: vectorState.score / 100,
        dimension_reasoning: vectorState.score / 100,
      },
      metadata: {
        anchorA: vectorState.anchorA,
        anchorB: vectorState.anchorB,
        targetPosition: vectorState.targetPosition,
        userPosition: vectorState.userPosition,
      },
    };
  },

  uiSchema: {
    layout: 'single',
    input: 'tap-one', // Note: Frontend should implement as slider
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
