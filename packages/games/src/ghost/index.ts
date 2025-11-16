/**
 * GHOST - Semantic silhouette inference game
 *
 * Guess a word that fits an invisible "semantic silhouette" defined by a hidden centroid.
 * Only a few clue words suggest its semantic neighborhood.
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

interface GhostState {
  clues: string[];
  targetVector: number[];
  guessWord: string | null;
  score: number;
}

/**
 * Theme clusters for GHOST
 */
const GHOST_THEMES = {
  weather: {
    target: 'weather',
    clues: ['rain', 'wind', 'cloud', 'storm'],
  },
  music: {
    target: 'music',
    clues: ['melody', 'rhythm', 'harmony', 'note'],
  },
  travel: {
    target: 'travel',
    clues: ['journey', 'destination', 'adventure', 'explore'],
  },
  ocean: {
    target: 'ocean',
    clues: ['wave', 'tide', 'salt', 'deep'],
  },
  memory: {
    target: 'memory',
    clues: ['remember', 'forget', 'past', 'recall'],
  },
};

/**
 * Select theme based on seed
 */
function selectTheme(seed: string) {
  const themes = Object.values(GHOST_THEMES);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
}

/**
 * GHOST Game Definition
 */
export const ghostGame: GameDefinition = {
  id: 'ghost',
  name: 'GHOST',
  shortDescription: 'Guess the word that fits the hidden semantic silhouette',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const theme = selectTheme(ctx.seed);

    // Calculate centroid from clues
    const targetVector = await calculateClusterCenter(theme.clues, ctx.language);

    const state: GhostState = {
      clues: theme.clues,
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
    const ghostState = state.data as GhostState;

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
          ...ghostState,
          guessWord,
          score: 0,
        },
      };
    }

    // Calculate similarity to target centroid
    const similarity = cosineSimilarity(
      ghostState.targetVector,
      guessEmbedding.vector
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...ghostState,
        guessWord,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const ghostState = state.data as GhostState;

    return {
      score: ghostState.score,
      durationMs: 0,
      accuracy: ghostState.score,
      skillSignals: {
        conceptual_navigation: ghostState.score / 100,
        inference_stability: ghostState.score / 100,
        semantic_reconstruction: ghostState.score / 100,
      },
      metadata: {
        clues: ghostState.clues,
        guess: ghostState.guessWord,
      },
    };
  },

  uiSchema: {
    layout: 'single',
    input: 'type-one-word',
    feedback: 'score-bar',
    animation: 'fade',
    cardStyle: 'word',
  },
};
