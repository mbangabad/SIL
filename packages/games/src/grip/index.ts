/**
 * GRIP - Theme-based word selection game
 *
 * Pick the word most semantically similar to a hidden theme
 * Tests: precision, semantic inference, intuition
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

interface GripState {
  themeWord: string;
  themeVector: number[];
  words: string[];
  selectedWordId: string | null;
  round: number;
  scores: number[];
}

/**
 * Word pools for different themes
 */
const WORD_POOLS: Record<string, { theme: string; words: string[] }> = {
  ocean: {
    theme: 'ocean',
    words: [
      'wave',
      'tide',
      'reef',
      'ship',
      'sail',
      'beach',
      'storm',
      'calm',
      'deep',
      'anchor',
      'pearl',
      'salt',
      'moon',
      'fish',
      'coral',
      'sand',
      'wind',
      'harbor',
      'coast',
      'drift',
    ],
  },
  mountain: {
    theme: 'mountain',
    words: [
      'peak',
      'summit',
      'cliff',
      'valley',
      'ridge',
      'slope',
      'alpine',
      'snow',
      'rock',
      'trail',
      'forest',
      'eagle',
      'stone',
      'climb',
      'height',
      'cloud',
      'vista',
      'range',
      'base',
      'crest',
    ],
  },
  city: {
    theme: 'city',
    words: [
      'street',
      'tower',
      'metro',
      'park',
      'light',
      'crowd',
      'noise',
      'store',
      'cafe',
      'plaza',
      'traffic',
      'bridge',
      'building',
      'square',
      'corner',
      'avenue',
      'urban',
      'skyline',
      'market',
      'district',
    ],
  },
};

/**
 * Select a random theme based on seed
 */
function selectTheme(seed: string): string {
  const themes = Object.keys(WORD_POOLS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
}

/**
 * Shuffle array using seed
 */
function shuffleArray<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = arr.length - 1; i > 0; i--) {
    // Simple seeded random
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * GRIP Game Definition
 */
export const gripGame: GameDefinition = {
  id: 'grip',
  name: 'GRIP',
  shortDescription: 'Find the word closest to the hidden theme',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    // Select theme
    const themeKey = selectTheme(ctx.seed);
    const themeData = WORD_POOLS[themeKey];

    // Get theme vector
    const themeEmbedding = await embeddingService.getEmbedding(
      themeData.theme,
      ctx.language
    );

    if (!themeEmbedding) {
      throw new Error(`Could not find embedding for theme: ${themeData.theme}`);
    }

    // Shuffle and select 9 words
    const shuffledWords = shuffleArray(themeData.words, ctx.seed);
    const selectedWords = shuffledWords.slice(0, 9);

    const state: GripState = {
      themeWord: themeData.theme,
      themeVector: themeEmbedding.vector,
      words: selectedWords,
      selectedWordId: null,
      round: 0,
      scores: [],
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
    const gripState = state.data as GripState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (isNaN(wordIndex) || wordIndex < 0 || wordIndex >= gripState.words.length) {
      return state;
    }

    const selectedWord = gripState.words[wordIndex];

    // Calculate similarity to theme
    const result = await calculateClusterHeatFromVector(
      selectedWord,
      gripState.themeVector,
      ctx.language
    );

    const score = Math.round(result.heat * 100);

    // Update state
    const newState: GripState = {
      ...gripState,
      selectedWordId: wordId,
      scores: [...gripState.scores, score],
      round: gripState.round + 1,
    };

    // Check if game should end based on mode
    const shouldEnd =
      ctx.mode === 'oneShot' ||
      (ctx.mode === 'journey' && newState.round >= 5);

    return {
      step: state.step + 1,
      done: shouldEnd,
      data: newState,
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const gripState = state.data as GripState;

    // Calculate final score
    let finalScore = 0;
    if (gripState.scores.length > 0) {
      // Average of all scores
      finalScore = Math.round(
        gripState.scores.reduce((sum, s) => sum + s, 0) / gripState.scores.length
      );
    }

    // Calculate accuracy (how close to perfect 100)
    const accuracy = finalScore;

    // Skill signals
    const skillSignals: Record<string, number> = {
      precision: accuracy, // How accurate the selections were
      inference: finalScore, // Ability to infer the theme
    };

    // If multiple rounds, also track consistency
    if (gripState.scores.length > 1) {
      const variance =
        gripState.scores.reduce((sum, s) => sum + Math.pow(s - finalScore, 2), 0) /
        gripState.scores.length;
      const consistency = Math.max(0, 100 - variance);
      skillSignals.consistency = consistency;
    }

    return {
      score: finalScore,
      durationMs: 0, // Will be set by mode runner
      accuracy,
      skillSignals,
      metadata: {
        theme: gripState.themeWord,
        rounds: gripState.round,
        scores: gripState.scores,
        words: gripState.words,
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'scale',
    cardStyle: 'word',
  },
};
