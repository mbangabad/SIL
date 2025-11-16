/**
 * ECHOCHAIN - Semantic resonance word game
 *
 * Given a word, the user must enter ANY word that "sounds" semantically similar
 * — not phonetic, but conceptual resonance.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { embeddingService, cosineSimilarity } from '@sil/semantics';

interface EchochainState {
  prompt: string;
  promptVector: number[];
  guessWord: string | null;
  score: number;
}

/**
 * Prompt word pool for ECHOCHAIN
 */
const PROMPT_WORDS = [
  'ocean', 'mountain', 'forest', 'desert', 'river',
  'joy', 'fear', 'love', 'hope', 'dream',
  'music', 'art', 'dance', 'poetry', 'story',
  'light', 'shadow', 'echo', 'silence', 'storm',
  'journey', 'discovery', 'mystery', 'wonder', 'magic',
];

/**
 * Select prompt word based on seed
 */
function selectPromptWord(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PROMPT_WORDS[hash % PROMPT_WORDS.length];
}

/**
 * ECHOCHAIN Game Definition
 */
export const echochainGame: GameDefinition = {
  id: 'echochain',
  name: 'ECHOCHAIN',
  shortDescription: 'Enter a word that semantically resonates with the prompt',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const prompt = selectPromptWord(ctx.seed);

    // Get prompt embedding
    const promptEmbedding = await embeddingService.getEmbedding(
      prompt,
      ctx.language
    );

    if (!promptEmbedding) {
      throw new Error(`Could not find embedding for prompt: ${prompt}`);
    }

    const state: EchochainState = {
      prompt,
      promptVector: promptEmbedding.vector,
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
    const echochainState = state.data as EchochainState;

    if (action.type !== 'submitWord') return state;

    const guessWord = action.payload.text.toLowerCase().trim();

    // Get guess embedding
    const guessEmbedding = await embeddingService.getEmbedding(
      guessWord,
      ctx.language
    );

    if (!guessEmbedding) {
      // Word not found - return low score
      return {
        step: state.step + 1,
        done: true,
        data: {
          ...echochainState,
          guessWord,
          score: 0,
        },
      };
    }

    // Calculate similarity
    const similarity = cosineSimilarity(
      echochainState.promptVector,
      guessEmbedding.vector
    );

    const score = Math.round(similarity * 100);

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...echochainState,
        guessWord,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const echochainState = state.data as EchochainState;

    return {
      score: echochainState.score,
      durationMs: 0,
      accuracy: echochainState.score,
      skillSignals: {
        associative_range: echochainState.score / 100,
        semantic_precision: echochainState.score / 100,
      },
      metadata: {
        prompt: echochainState.prompt,
        guess: echochainState.guessWord,
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
