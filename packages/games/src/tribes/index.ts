/**
 * TRIBES - Cluster-based word selection game
 *
 * Three small clusters ("tribes") of 3-5 words each.
 * Player picks the tribe that matches the hidden theme best.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import {
  calculateClusterCenter,
  calculateClusterHeatFromVector,
  embeddingService,
} from '@sil/semantics';

interface TribesState {
  tribes: Array<{
    id: string;
    words: string[];
    centroid: number[];
  }>;
  targetTribeId: string;
  selectedTribeId: string | null;
  score: number;
}

/**
 * Word pools for different tribes
 */
const TRIBE_THEMES = {
  nature: ['ocean', 'forest', 'mountain', 'river', 'desert'],
  emotion: ['joy', 'sadness', 'anger', 'fear', 'love'],
  technology: ['computer', 'internet', 'software', 'algorithm', 'data'],
  food: ['apple', 'bread', 'cheese', 'rice', 'meat'],
  time: ['hour', 'day', 'week', 'month', 'year'],
  color: ['red', 'blue', 'green', 'yellow', 'purple'],
};

/**
 * Select random words for a tribe
 */
function selectTribeWords(theme: string[], count: number, seed: string): string[] {
  const shuffled = [...theme].sort((a, b) => {
    const hash = (a + b + seed).split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    return (hash % 2) - 0.5;
  });
  return shuffled.slice(0, count);
}

/**
 * TRIBES Game Definition
 */
export const tribesGame: GameDefinition = {
  id: 'tribes',
  name: 'TRIBES',
  shortDescription: 'Choose the word cluster aligned with the hidden theme',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    // Select 3 random themes
    const themeKeys = Object.keys(TRIBE_THEMES);
    const selectedThemes = themeKeys
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Build tribes
    const tribes = await Promise.all(
      selectedThemes.map(async (themeKey, idx) => {
        const theme = TRIBE_THEMES[themeKey as keyof typeof TRIBE_THEMES];
        const words = selectTribeWords(theme, 4, ctx.seed + idx);

        // Calculate centroid
        const centroid = await calculateClusterCenter(words, ctx.language);

        return {
          id: String.fromCharCode(65 + idx), // A, B, C
          words,
          centroid,
        };
      })
    );

    // Pick target tribe (first one for now, can randomize)
    const targetTribeId = tribes[0].id;

    const state: TribesState = {
      tribes,
      targetTribeId,
      selectedTribeId: null,
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
    const tribesState = state.data as TribesState;

    if (action.type !== 'tap') return state;

    const tribeId = action.payload.wordId;
    const selectedTribe = tribesState.tribes.find(t => t.id === tribeId);

    if (!selectedTribe) return state;

    // Get target tribe centroid
    const targetTribe = tribesState.tribes.find(
      t => t.id === tribesState.targetTribeId
    );

    if (!targetTribe) return state;

    // Calculate similarity between selected centroid and target centroid
    const similarity = calculateCosineSimilarity(
      selectedTribe.centroid,
      targetTribe.centroid
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...tribesState,
        selectedTribeId: tribeId,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const tribesState = state.data as TribesState;

    const accuracy = tribesState.selectedTribeId === tribesState.targetTribeId
      ? 100
      : tribesState.score;

    return {
      score: tribesState.score,
      durationMs: 0,
      accuracy,
      skillSignals: {
        category_decision: accuracy / 100,
        semantic_clustering: tribesState.score / 100,
      },
      metadata: {
        selectedTribe: tribesState.selectedTribeId,
        targetTribe: tribesState.targetTribeId,
        tribes: tribesState.tribes.map(t => ({
          id: t.id,
          words: t.words,
        })),
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'percentile',
    animation: 'pulse',
    cardStyle: 'word',
  },
};

/**
 * Helper: Calculate cosine similarity between two vectors
 */
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return Math.max(0, Math.min(1, dotProduct / magnitude));
}
