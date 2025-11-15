/**
 * MERGE - Semantic blending game
 *
 * Given two words, enter a semantic blend word that lies conceptually between them.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { embeddingService, cosineSimilarity } from '@sil/semantics';

interface MergeState {
  anchorA: string;
  anchorB: string;
  targetVector: number[];
  guessWord: string | null;
  score: number;
}

/**
 * Anchor pairs for semantic blending
 */
const ANCHOR_PAIRS = [
  ['hot', 'cold'],
  ['day', 'night'],
  ['land', 'sea'],
  ['fire', 'water'],
  ['past', 'future'],
  ['happy', 'sad'],
  ['big', 'small'],
  ['fast', 'slow'],
];

/**
 * Select anchor pair based on seed
 */
function selectAnchors(seed: string): [string, string] {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pair = ANCHOR_PAIRS[hash % ANCHOR_PAIRS.length];
  return [pair[0], pair[1]];
}

/**
 * MERGE Game Definition
 */
export const mergeGame: GameDefinition = {
  id: 'merge',
  name: 'MERGE',
  shortDescription: 'Blend two concepts with one word',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const [anchorA, anchorB] = selectAnchors(ctx.seed);

    // Get embeddings
    const [embA, embB] = await Promise.all([
      embeddingService.getEmbedding(anchorA, ctx.language),
      embeddingService.getEmbedding(anchorB, ctx.language),
    ]);

    if (!embA || !embB) {
      throw new Error(`Could not find embeddings for anchors: ${anchorA}, ${anchorB}`);
    }

    // Calculate midpoint
    const targetVector = embA.vector.map((val, idx) =>
      (val + embB.vector[idx]) / 2
    );

    const state: MergeState = {
      anchorA,
      anchorB,
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
    const mergeState = state.data as MergeState;

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
          ...mergeState,
          guessWord,
          score: 0,
        },
      };
    }

    // Score based on similarity to midpoint
    const similarity = cosineSimilarity(
      mergeState.targetVector,
      guessEmbedding.vector
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...mergeState,
        guessWord,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const mergeState = state.data as MergeState;

    return {
      score: mergeState.score,
      durationMs: 0,
      accuracy: mergeState.score,
      skillSignals: {
        semantic_blending: mergeState.score / 100,
        analogy_strength: mergeState.score / 100,
        creativity: mergeState.score / 100,
      },
      metadata: {
        anchorA: mergeState.anchorA,
        anchorB: mergeState.anchorB,
        guess: mergeState.guessWord,
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
