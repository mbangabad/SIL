/**
 * MOTIF - Prototype selection game
 *
 * Pick the one word that is the "prototype" of a shared motif among 4-7 displayed words.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import {
  embeddingService,
  cosineSimilarity,
  calculateClusterCenter,
} from '@sil/semantics';

interface MotifState {
  motifVector: number[];
  words: string[];
  wordScores: number[];
  selectedWordIndex: number | null;
  score: number;
}

/**
 * Motif clusters for prototype detection
 */
const MOTIF_SETS = {
  weather: ['rain', 'snow', 'wind', 'storm', 'cloud', 'fog', 'sun'],
  emotion: ['joy', 'sadness', 'anger', 'fear', 'love', 'hope', 'pride'],
  nature: ['tree', 'flower', 'grass', 'leaf', 'branch', 'root', 'seed'],
  water: ['ocean', 'river', 'lake', 'stream', 'pond', 'sea', 'wave'],
  time: ['hour', 'minute', 'second', 'day', 'week', 'month', 'year'],
};

/**
 * Select motif set based on seed
 */
function selectMotifSet(seed: string): string[] {
  const sets = Object.values(MOTIF_SETS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const selectedSet = sets[hash % sets.length];

  // Shuffle and select 6 words
  return [...selectedSet]
    .sort(() => 0.5 - Math.random())
    .slice(0, 6);
}

/**
 * MOTIF Game Definition
 */
export const motifGame: GameDefinition = {
  id: 'motif',
  name: 'MOTIF',
  shortDescription: 'Choose the word that best represents the hidden motif',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const words = selectMotifSet(ctx.seed);

    // Calculate motif centroid
    const motifVector = await calculateClusterCenter(words, ctx.language);

    // Calculate each word's similarity to centroid
    const wordScores = await Promise.all(
      words.map(async (word) => {
        const emb = await embeddingService.getEmbedding(word, ctx.language);
        if (!emb) return 0;
        return cosineSimilarity(motifVector, emb.vector);
      })
    );

    const state: MotifState = {
      motifVector,
      words,
      wordScores,
      selectedWordIndex: null,
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
    const motifState = state.data as MotifState;

    if (action.type !== 'tap') return state;

    const wordIndex = parseInt(action.payload.wordId);

    if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= motifState.words.length) {
      return state;
    }

    // Score is the similarity of selected word to motif centroid
    const score = Math.round(motifState.wordScores[wordIndex] * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...motifState,
        selectedWordIndex: wordIndex,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const motifState = state.data as MotifState;

    const accuracy = motifState.score;

    return {
      score: motifState.score,
      durationMs: 0,
      accuracy,
      skillSignals: {
        category_prototype_intuition: accuracy / 100,
        semantic_clustering: accuracy / 100,
      },
      metadata: {
        words: motifState.words,
        selectedIndex: motifState.selectedWordIndex,
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
