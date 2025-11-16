/**
 * WARPWORD - Semantic transformation tracking game
 *
 * A semantic morph (interpolation) is implied between Word A and Word B.
 * You must guess the destination word after a hidden interpolation "warp."
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import {
  interpolateVectors,
  embeddingService,
  cosineSimilarity,
} from '@sil/semantics';

interface WarpwordState {
  anchorA: string;
  anchorB: string;
  warpAlpha: number;
  targetVector: number[];
  guessWord: string | null;
  score: number;
}

/**
 * Warp anchor pairs
 */
const WARP_PAIRS = [
  ['cold', 'hot'],
  ['small', 'big'],
  ['slow', 'fast'],
  ['dark', 'light'],
  ['soft', 'hard'],
];

/**
 * Select warp pair based on seed
 */
function selectWarpPair(seed: string): [string, string] {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pair = WARP_PAIRS[hash % WARP_PAIRS.length];
  return [pair[0], pair[1]];
}

/**
 * WARPWORD Game Definition
 */
export const warpwordGame: GameDefinition = {
  id: 'warpword',
  name: 'WARPWORD',
  shortDescription: 'Guess the word produced by a semantic warp',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const [anchorA, anchorB] = selectWarpPair(ctx.seed);

    // Generate random warp factor
    const warpAlpha = 0.3 + Math.random() * 0.4; // Range: 0.3-0.7

    // Calculate warped target vector
    const targetVector = await interpolateVectors(
      anchorA,
      anchorB,
      warpAlpha,
      ctx.language
    );

    if (!targetVector) {
      throw new Error('Could not calculate warp vector');
    }

    const state: WarpwordState = {
      anchorA,
      anchorB,
      warpAlpha,
      targetVector,
      guessWord: null,
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
    const warpwordState = state.data as WarpwordState;

    if (action.type !== 'submitWord') return state;

    const guessWord = action.payload.text.toLowerCase().trim();

    // Get guess embedding
    const guessEmbedding = await embeddingService.getEmbedding(
      guessWord,
      ctx.language
    );

    if (!guessEmbedding) {
      return {
        step: state.step + 1,
        done: true,
        data: {
          ...warpwordState,
          guessWord,
          score: 0,
        },
      };
    }

    // Calculate similarity to warped vector
    const similarity = cosineSimilarity(
      warpwordState.targetVector,
      guessEmbedding.vector
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...warpwordState,
        guessWord,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const warpwordState = state.data as WarpwordState;

    return {
      score: warpwordState.score,
      durationMs: 0,
      accuracy: warpwordState.score,
      skillSignals: {
        semantic_transformation_tracking: warpwordState.score / 100,
        analogy_strength: warpwordState.score / 100,
        continuous_mapping: warpwordState.score / 100,
      },
      metadata: {
        anchorA: warpwordState.anchorA,
        anchorB: warpwordState.anchorB,
        warpAlpha: warpwordState.warpAlpha,
        guess: warpwordState.guessWord,
      },
    };
  },

  uiSchema: {
    layout: 'dual-anchor',
    input: 'type-one-word',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
