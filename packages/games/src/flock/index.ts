/**
 * FLOCK - Semantic filtering game
 *
 * Words flow onto the screen; tap ONLY the ones belonging to a hidden semantic theme.
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

interface FlockState {
  theme: string;
  themeVector: number[];
  stream: Array<{
    word: string;
    isTarget: boolean;
  }>;
  currentIndex: number;
  hits: number;
  misses: number;
  falsePositives: number;
  threshold: number;
}

/**
 * Theme definitions for FLOCK
 */
const FLOCK_THEMES = {
  ocean: {
    targets: ['wave', 'tide', 'coral', 'reef', 'shore', 'salt'],
    distractors: ['mountain', 'forest', 'desert', 'city', 'garden', 'road'],
  },
  music: {
    targets: ['melody', 'harmony', 'rhythm', 'chord', 'tone', 'pitch'],
    distractors: ['color', 'shape', 'number', 'taste', 'smell', 'touch'],
  },
  nature: {
    targets: ['tree', 'flower', 'leaf', 'grass', 'bird', 'bee'],
    distractors: ['car', 'phone', 'computer', 'building', 'road', 'metal'],
  },
};

/**
 * Select theme and build stream
 */
async function buildStream(
  seed: string,
  language: string
): Promise<{
  stream: Array<{ word: string; isTarget: boolean }>;
  themeVector: number[];
  theme: string;
}> {
  const themeKeys = Object.keys(FLOCK_THEMES);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const themeKey = themeKeys[hash % themeKeys.length];
  const theme = FLOCK_THEMES[themeKey as keyof typeof FLOCK_THEMES];

  // Mix targets and distractors (60% targets, 40% distractors)
  const stream: Array<{ word: string; isTarget: boolean }> = [
    ...theme.targets.slice(0, 9).map(word => ({ word, isTarget: true })),
    ...theme.distractors.slice(0, 6).map(word => ({ word, isTarget: false })),
  ];

  // Shuffle stream
  stream.sort(() => 0.5 - Math.random());

  // Calculate theme vector
  const themeVector = await calculateClusterCenter(theme.targets, language);

  return {
    stream,
    themeVector,
    theme: themeKey,
  };
}

/**
 * FLOCK Game Definition
 */
export const flockGame: GameDefinition = {
  id: 'flock',
  name: 'FLOCK',
  shortDescription: 'Tap only the words related to the hidden theme',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const { stream, themeVector, theme } = await buildStream(ctx.seed, ctx.language);

    const state: FlockState = {
      theme,
      themeVector,
      stream,
      currentIndex: 0,
      hits: 0,
      misses: 0,
      falsePositives: 0,
      threshold: 0.4, // Similarity threshold for targets
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
    const flockState = state.data as FlockState;

    if (action.type === 'tap-many') {
      // Process tapped words
      const tappedIds = action.payload.wordIds || [];

      let hits = flockState.hits;
      let misses = flockState.misses;
      let falsePositives = flockState.falsePositives;

      for (const wordId of tappedIds) {
        const index = parseInt(wordId);
        if (isNaN(index) || index >= flockState.stream.length) continue;

        const item = flockState.stream[index];
        if (item.isTarget) {
          hits++;
        } else {
          falsePositives++;
        }
      }

      // Count misses (targets not tapped)
      const tappedIndices = new Set(tappedIds.map(id => parseInt(id)));
      misses = flockState.stream.filter(
        (item, idx) => item.isTarget && !tappedIndices.has(idx)
      ).length;

      return {
        step: state.step + 1,
        done: true,
        data: {
          ...flockState,
          hits,
          misses,
          falsePositives,
        },
      };
    }

    return state;
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const flockState = state.data as FlockState;

    // Score = (hits - penalties) * 10
    const penalties = flockState.falsePositives * 0.5 + flockState.misses * 0.3;
    const rawScore = Math.max(0, flockState.hits - penalties);
    const score = Math.round(rawScore * 10);

    // Accuracy = hits / total targets
    const totalTargets = flockState.stream.filter(item => item.isTarget).length;
    const accuracy = totalTargets > 0
      ? Math.round((flockState.hits / totalTargets) * 100)
      : 0;

    return {
      score,
      durationMs: 0,
      accuracy,
      skillSignals: {
        semantic_filtering: accuracy / 100,
        inhibition_strength: Math.max(0, 1 - (flockState.falsePositives / flockState.hits || 0)),
        executive_function: accuracy / 100,
      },
      metadata: {
        theme: flockState.theme,
        hits: flockState.hits,
        misses: flockState.misses,
        falsePositives: flockState.falsePositives,
      },
    };
  },

  uiSchema: {
    layout: 'list',
    input: 'tap-many',
    feedback: 'hot-cold',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
