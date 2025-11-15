/**
 * RADIAL - Wheel-based semantic center selection game
 *
 * Words arranged in a circle. Tap the one closest to the semantic center of the hidden concept.
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

interface RadialState {
  words: string[];
  targetVector: number[];
  wordScores: number[];
  selectedIndex: number | null;
  score: number;
}

/**
 * Theme sets for RADIAL
 */
const RADIAL_THEMES = {
  water: ['ocean', 'river', 'lake', 'rain', 'stream', 'pond', 'sea', 'wave'],
  emotion: ['joy', 'love', 'fear', 'anger', 'sadness', 'hope', 'pride', 'shame'],
  nature: ['tree', 'flower', 'grass', 'leaf', 'forest', 'garden', 'plant', 'bloom'],
  time: ['hour', 'minute', 'day', 'week', 'month', 'year', 'moment', 'era'],
};

/**
 * Select theme and words
 */
function selectThemeWords(seed: string): string[] {
  const themes = Object.values(RADIAL_THEMES);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const theme = themes[hash % themes.length];

  return theme.slice(0, 8);
}

/**
 * RADIAL Game Definition
 */
export const radialGame: GameDefinition = {
  id: 'radial',
  name: 'RADIAL',
  shortDescription: 'Tap the word nearest the hidden conceptual center',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const words = selectThemeWords(ctx.seed);

    // Calculate cluster centroid
    const targetVector = await calculateClusterCenter(words, ctx.language);

    // Calculate each word's similarity to centroid
    const wordScores = await Promise.all(
      words.map(async (word) => {
        const emb = await embeddingService.getEmbedding(word, ctx.language);
        if (!emb) return 0;
        return cosineSimilarity(targetVector, emb.vector);
      })
    );

    const state: RadialState = {
      words,
      targetVector,
      wordScores,
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
    const radialState = state.data as RadialState;

    if (action.type !== 'tap') return state;

    const wordIndex = parseInt(action.payload.wordId);

    if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= radialState.words.length) {
      return state;
    }

    const score = Math.round(radialState.wordScores[wordIndex] * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...radialState,
        selectedIndex: wordIndex,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const radialState = state.data as RadialState;

    return {
      score: radialState.score,
      durationMs: 0,
      accuracy: radialState.score,
      skillSignals: {
        semantic_geometry: radialState.score / 100,
        conceptual_centroiding: radialState.score / 100,
      },
      metadata: {
        words: radialState.words,
        selectedIndex: radialState.selectedIndex,
      },
    };
  },

  uiSchema: {
    layout: 'wheel',
    input: 'tap-one',
    feedback: 'hot-cold',
    animation: 'scale',
    cardStyle: 'word',
  },
};
