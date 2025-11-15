/**
 * ONE - Single perfect choice game
 *
 * Make one choice - pick the best word for the context
 * Tests: decisiveness, intuition, semantic precision
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
  rankByClusterHeat,
} from '@sil/semantics';

interface OneState {
  prompt: string;
  contextWords: string[];
  themeVector: number[];
  candidateWords: string[];
  selectedWordId: string | null;
  selectedWord: string | null;
  score: number;
  optimalWord: string;
}

/**
 * Prompts with context and candidates
 */
const ONE_PROMPTS: Array<{
  prompt: string;
  context: string[];
  candidates: string[];
}> = [
  {
    prompt: 'Complete the journey',
    context: ['mountain', 'climb', 'summit', 'peak'],
    candidates: [
      'descent',
      'valley',
      'triumph',
      'achievement',
      'view',
      'clouds',
      'sky',
      'return',
      'rest',
    ],
  },
  {
    prompt: 'Find the emotion',
    context: ['love', 'heart', 'connection', 'bond'],
    candidates: [
      'joy',
      'passion',
      'devotion',
      'warmth',
      'trust',
      'intimacy',
      'care',
      'affection',
      'tenderness',
    ],
  },
  {
    prompt: 'Describe the moment',
    context: ['silence', 'peace', 'calm', 'still'],
    candidates: [
      'quiet',
      'tranquil',
      'serene',
      'meditation',
      'rest',
      'breathe',
      'pause',
      'presence',
      'zen',
    ],
  },
  {
    prompt: 'Choose the beginning',
    context: ['dawn', 'light', 'new', 'fresh'],
    candidates: [
      'sunrise',
      'morning',
      'start',
      'hope',
      'awakening',
      'birth',
      'origin',
      'emergence',
      'spring',
    ],
  },
  {
    prompt: 'Find the transformation',
    context: ['change', 'shift', 'evolve', 'grow'],
    candidates: [
      'metamorphosis',
      'transition',
      'rebirth',
      'renewal',
      'adaptation',
      'revolution',
      'development',
      'progress',
      'emergence',
    ],
  },
];

/**
 * Select prompt based on seed
 */
function selectPrompt(seed: string): {
  prompt: string;
  context: string[];
  candidates: string[];
} {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ONE_PROMPTS[hash % ONE_PROMPTS.length];
}

/**
 * Shuffle array
 */
function shuffleArray<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * ONE Game Definition
 */
export const oneGame: GameDefinition = {
  id: 'one',
  name: 'ONE',
  shortDescription: 'Make one perfect choice',
  supportedModes: ['oneShot', 'journey', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const promptData = selectPrompt(ctx.seed);

    // Calculate theme vector from context
    const themeVector = await calculateClusterCenter(
      promptData.context,
      ctx.language
    );

    // Shuffle candidates
    const shuffledCandidates = shuffleArray(promptData.candidates, ctx.seed);

    // Pre-calculate optimal word (for metadata, not shown to player)
    const ranked = await rankByClusterHeat(
      promptData.candidates,
      promptData.context,
      ctx.language
    );
    const optimalWord = ranked[0]?.word || promptData.candidates[0];

    const state: OneState = {
      prompt: promptData.prompt,
      contextWords: promptData.context,
      themeVector,
      candidateWords: shuffledCandidates,
      selectedWordId: null,
      selectedWord: null,
      score: 0,
      optimalWord,
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
    const oneState = state.data as OneState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (
      isNaN(wordIndex) ||
      wordIndex < 0 ||
      wordIndex >= oneState.candidateWords.length
    ) {
      return state;
    }

    const selectedWord = oneState.candidateWords[wordIndex];

    // Calculate score (heat relative to context)
    const heatResult = await calculateClusterHeatFromVector(
      selectedWord,
      oneState.themeVector,
      ctx.language
    );

    const score = heatResult.heat;

    const newState: OneState = {
      ...oneState,
      selectedWordId: wordId,
      selectedWord,
      score,
    };

    return {
      step: state.step + 1,
      done: true, // ONE is always a single choice
      data: newState,
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const oneState = state.data as OneState;

    const finalScore = Math.round(oneState.score * 100);
    const accuracy = finalScore;

    // Skill signals
    const skillSignals: Record<string, number> = {
      precision: finalScore, // Semantic precision
      intuition: finalScore, // Intuitive choice
      decisiveness: 100, // Made a decision (always 100 if completed)
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        prompt: oneState.prompt,
        context: oneState.contextWords,
        selectedWord: oneState.selectedWord,
        optimalWord: oneState.optimalWord,
        wasOptimal: oneState.selectedWord === oneState.optimalWord,
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
