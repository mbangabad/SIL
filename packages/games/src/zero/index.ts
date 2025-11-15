/**
 * ZERO - Rare word generation game
 *
 * Find the rarest word matching a specific pattern
 * Tests: divergent thinking, vocabulary depth, pattern recognition
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateRarity, matchesPattern } from '@sil/semantics';

interface ZeroState {
  pattern: string;
  patternDescription: string;
  submittedWords: string[];
  scores: number[];
  currentWord: string;
  round: number;
}

/**
 * Pattern library with descriptions
 */
const PATTERNS: Array<{ pattern: string; description: string }> = [
  { pattern: 'CVCVC', description: '5 letters: consonant-vowel-consonant-vowel-consonant' },
  { pattern: 'VCCV', description: '4 letters: vowel-consonant-consonant-vowel' },
  { pattern: 'CVCC', description: '4 letters: consonant-vowel-consonant-consonant' },
  { pattern: 'CCVC', description: '4 letters: consonant-consonant-vowel-consonant' },
  { pattern: 'CVCV', description: '4 letters: consonant-vowel-consonant-vowel' },
  { pattern: 'VCVC', description: '4 letters: vowel-consonant-vowel-consonant' },
  { pattern: 'CVVCV', description: '5 letters: consonant-vowel-vowel-consonant-vowel' },
  { pattern: 'CVCVV', description: '5 letters: consonant-vowel-consonant-vowel-vowel' },
];

/**
 * Select a pattern based on seed
 */
function selectPattern(seed: string): { pattern: string; description: string } {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return PATTERNS[hash % PATTERNS.length];
}

/**
 * Validate word (basic English word check)
 * In production, this would check against a dictionary
 */
function isValidWord(word: string): boolean {
  // Basic validation: only letters, reasonable length
  if (!word || word.length < 3 || word.length > 15) {
    return false;
  }

  const validPattern = /^[a-zA-Z]+$/;
  return validPattern.test(word);
}

/**
 * ZERO Game Definition
 */
export const zeroGame: GameDefinition = {
  id: 'zero',
  name: 'ZERO',
  shortDescription: 'Find the rarest word matching the pattern',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const patternData = selectPattern(ctx.seed);

    const state: ZeroState = {
      pattern: patternData.pattern,
      patternDescription: patternData.description,
      submittedWords: [],
      scores: [],
      currentWord: '',
      round: 0,
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
    const zeroState = state.data as ZeroState;

    // Only handle submitWord actions
    if (action.type !== 'submitWord') {
      return state;
    }

    const word = action.payload.text.toLowerCase().trim();

    // Validate word
    if (!isValidWord(word)) {
      return {
        ...state,
        data: {
          ...zeroState,
          currentWord: '',
        },
      };
    }

    // Check if word matches pattern
    if (!matchesPattern(word, zeroState.pattern)) {
      return {
        ...state,
        data: {
          ...zeroState,
          currentWord: '',
        },
      };
    }

    // Check if word was already submitted
    if (zeroState.submittedWords.includes(word)) {
      return {
        ...state,
        data: {
          ...zeroState,
          currentWord: '',
        },
      };
    }

    // Calculate rarity score
    const rarityResult = await calculateRarity(word, zeroState.pattern, ctx.language);
    const score = rarityResult.rarityScore;

    // Update state
    const newState: ZeroState = {
      ...zeroState,
      submittedWords: [...zeroState.submittedWords, word],
      scores: [...zeroState.scores, score],
      currentWord: '',
      round: zeroState.round + 1,
    };

    // Check if game should end
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
    const zeroState = state.data as ZeroState;

    // Calculate final score
    let finalScore = 0;
    if (zeroState.scores.length > 0) {
      // Use the highest rarity score
      finalScore = Math.max(...zeroState.scores);
    }

    // Calculate average score for accuracy
    const avgScore =
      zeroState.scores.length > 0
        ? zeroState.scores.reduce((sum, s) => sum + s, 0) / zeroState.scores.length
        : 0;

    // Skill signals
    const skillSignals: Record<string, number> = {
      divergence: finalScore, // Ability to find rare words
      vocabulary: avgScore, // Overall vocabulary depth
      creativity: finalScore, // Creative thinking (same as divergence for this game)
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy: avgScore,
      skillSignals,
      metadata: {
        pattern: zeroState.pattern,
        patternDescription: zeroState.patternDescription,
        words: zeroState.submittedWords,
        scores: zeroState.scores,
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
