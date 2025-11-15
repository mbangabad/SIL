/**
 * TRACEWORD - Semantic gradient tracking game
 *
 * Given a conceptual "gradient direction" (e.g., cold → warm, small → large),
 * choose a word that represents the next step along that semantic gradient.
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

interface TracewordState {
  anchorA: string;
  anchorB: string;
  alpha: number;
  targetVector: number[];
  candidates: string[];
  candidateScores: number[];
  selectedIndex: number | null;
  score: number;
}

/**
 * Gradient pairs and their step candidates
 */
const GRADIENT_SETS = {
  temperature: {
    anchors: ['cold', 'hot'],
    candidates: ['cool', 'warm', 'chilly', 'tepid', 'mild'],
  },
  size: {
    anchors: ['small', 'large'],
    candidates: ['tiny', 'medium', 'big', 'huge', 'moderate'],
  },
  speed: {
    anchors: ['slow', 'fast'],
    candidates: ['sluggish', 'moderate', 'quick', 'rapid', 'steady'],
  },
};

/**
 * Select gradient set based on seed
 */
function selectGradientSet(seed: string) {
  const sets = Object.values(GRADIENT_SETS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sets[hash % sets.length];
}

/**
 * TRACEWORD Game Definition
 */
export const tracewordGame: GameDefinition = {
  id: 'traceword',
  name: 'TRACEWORD',
  shortDescription: 'Choose the word representing the next step along the hidden gradient',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const gradientSet = selectGradientSet(ctx.seed);
    const alpha = 0.4 + Math.random() * 0.2; // Random position between 0.4-0.6

    // Calculate interpolated target vector
    const targetVector = await interpolateVectors(
      gradientSet.anchors[0],
      gradientSet.anchors[1],
      alpha,
      ctx.language
    );

    if (!targetVector) {
      throw new Error('Could not calculate gradient');
    }

    // Calculate candidate scores
    const candidateScores = await Promise.all(
      gradientSet.candidates.map(async (word) => {
        const emb = await embeddingService.getEmbedding(word, ctx.language);
        if (!emb) return 0;
        return cosineSimilarity(targetVector, emb.vector);
      })
    );

    const state: TracewordState = {
      anchorA: gradientSet.anchors[0],
      anchorB: gradientSet.anchors[1],
      alpha,
      targetVector,
      candidates: gradientSet.candidates,
      candidateScores,
      selectedIndex: null,
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
    const tracewordState = state.data as TracewordState;

    if (action.type !== 'tap') return state;

    const candidateIndex = parseInt(action.payload.wordId);

    if (isNaN(candidateIndex) || candidateIndex < 0 || candidateIndex >= tracewordState.candidates.length) {
      return state;
    }

    const score = Math.round(tracewordState.candidateScores[candidateIndex] * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...tracewordState,
        selectedIndex: candidateIndex,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const tracewordState = state.data as TracewordState;

    return {
      score: tracewordState.score,
      durationMs: 0,
      accuracy: tracewordState.score,
      skillSignals: {
        semantic_gradient: tracewordState.score / 100,
        conceptual_navigation: tracewordState.score / 100,
      },
      metadata: {
        anchorA: tracewordState.anchorA,
        anchorB: tracewordState.anchorB,
        alpha: tracewordState.alpha,
        candidates: tracewordState.candidates,
        selectedIndex: tracewordState.selectedIndex,
      },
    };
  },

  uiSchema: {
    layout: 'list',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
