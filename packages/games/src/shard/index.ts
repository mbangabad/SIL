/**
 * SHARD - Semantic reconstruction game
 *
 * A single hidden target word is represented by 3-5 "semantic shards" (neighbors).
 * Player must reconstruct the original word from these shards.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { embeddingService, cosineSimilarity } from '@sil/semantics';

interface ShardState {
  shards: string[];
  targetWord: string;
  targetVector: number[];
  guessWord: string | null;
  score: number;
}

/**
 * Target words with their semantic shards
 */
const SHARD_SETS = {
  music: {
    target: 'music',
    shards: ['melody', 'harmony', 'rhythm', 'song'],
  },
  ocean: {
    target: 'ocean',
    shards: ['wave', 'tide', 'salt', 'deep'],
  },
  forest: {
    target: 'forest',
    shards: ['tree', 'leaf', 'wood', 'green'],
  },
  time: {
    target: 'time',
    shards: ['hour', 'moment', 'past', 'future'],
  },
  memory: {
    target: 'memory',
    shards: ['remember', 'recall', 'past', 'forget'],
  },
};

/**
 * Select shard set based on seed
 */
function selectShardSet(seed: string) {
  const sets = Object.values(SHARD_SETS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sets[hash % sets.length];
}

/**
 * SHARD Game Definition
 */
export const shardGame: GameDefinition = {
  id: 'shard',
  name: 'SHARD',
  shortDescription: 'Reconstruct the hidden word from semantic fragments',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const shardSet = selectShardSet(ctx.seed);

    // Get target embedding
    const targetEmbedding = await embeddingService.getEmbedding(
      shardSet.target,
      ctx.language
    );

    if (!targetEmbedding) {
      throw new Error(`Could not find embedding for target: ${shardSet.target}`);
    }

    const state: ShardState = {
      shards: shardSet.shards,
      targetWord: shardSet.target,
      targetVector: targetEmbedding.vector,
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
    const shardState = state.data as ShardState;

    if (action.type !== 'submitWord') return state;

    const guessWord = action.payload.text.toLowerCase().trim();

    // Check if exact match
    if (guessWord === shardState.targetWord) {
      return {
        step: state.step + 1,
        done: true,
        data: {
          ...shardState,
          guessWord,
          score: 100,
        },
      };
    }

    // Calculate similarity
    const guessEmbedding = await embeddingService.getEmbedding(
      guessWord,
      ctx.language
    );

    if (!guessEmbedding) {
      return {
        step: state.step + 1,
        done: true,
        data: {
          ...shardState,
          guessWord,
          score: 0,
        },
      };
    }

    const similarity = cosineSimilarity(
      shardState.targetVector,
      guessEmbedding.vector
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...shardState,
        guessWord,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const shardState = state.data as ShardState;

    return {
      score: shardState.score,
      durationMs: 0,
      accuracy: shardState.score,
      skillSignals: {
        semantic_reconstruction: shardState.score / 100,
        associative_precision: shardState.score / 100,
      },
      metadata: {
        shards: shardState.shards,
        target: shardState.targetWord,
        guess: shardState.guessWord,
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
