/**
 * SPLICE - Creative word blending game
 *
 * Create or find a word that blends two given concepts
 * Tests: creative synthesis, conceptual blending, linguistic creativity
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateMidpointScore } from '@sil/semantics';

interface SpliceState {
  wordA: string;
  wordB: string;
  submittedWord: string | null;
  blendScore: number;
  round: number;
}

/**
 * Word pairs for blending
 */
const SPLICE_PAIRS: Array<{ a: string; b: string }> = [
  { a: 'fire', b: 'water' },
  { a: 'sun', b: 'moon' },
  { a: 'earth', b: 'sky' },
  { a: 'love', b: 'war' },
  { a: 'light', b: 'dark' },
  { a: 'dream', b: 'reality' },
  { a: 'chaos', b: 'order' },
  { a: 'past', b: 'future' },
  { a: 'body', b: 'mind' },
  { a: 'nature', b: 'machine' },
];

/**
 * Select pair based on seed
 */
function selectPair(seed: string): { a: string; b: string } {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return SPLICE_PAIRS[hash % SPLICE_PAIRS.length];
}

/**
 * Validate word
 */
function isValidWord(word: string): boolean {
  if (!word || word.length < 3 || word.length > 20) {
    return false;
  }

  const validPattern = /^[a-zA-Z]+$/;
  return validPattern.test(word);
}

/**
 * SPLICE Game Definition
 */
export const spliceGame: GameDefinition = {
  id: 'splice',
  name: 'SPLICE',
  shortDescription: 'Create a word that blends two concepts',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const pair = selectPair(ctx.seed);

    const state: SpliceState = {
      wordA: pair.a,
      wordB: pair.b,
      submittedWord: null,
      blendScore: 0,
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
    const spliceState = state.data as SpliceState;

    // Only handle submitWord actions
    if (action.type !== 'submitWord') {
      return state;
    }

    const word = action.payload.text.toLowerCase().trim();

    // Validate word
    if (!isValidWord(word)) {
      return state;
    }

    // Calculate blend score (how well it bridges the two concepts)
    const midpointResult = await calculateMidpointScore(
      word,
      spliceState.wordA,
      spliceState.wordB,
      ctx.language
    );

    const blendScore = midpointResult.score;

    const newState: SpliceState = {
      ...spliceState,
      submittedWord: word,
      blendScore,
      round: spliceState.round + 1,
    };

    return {
      step: state.step + 1,
      done: true, // SPLICE is typically one round
      data: newState,
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const spliceState = state.data as SpliceState;

    const finalScore = Math.round(spliceState.blendScore * 100);
    const accuracy = finalScore;

    // Bonus for creative/unusual submissions
    let creativityBonus = 0;
    if (spliceState.submittedWord) {
      // Longer, more complex words get creativity bonus
      const wordLength = spliceState.submittedWord.length;
      if (wordLength > 8) {
        creativityBonus = Math.min(20, (wordLength - 8) * 3);
      }
    }

    const finalScoreWithBonus = Math.min(100, finalScore + creativityBonus);

    // Skill signals
    const skillSignals: Record<string, number> = {
      synthesis: finalScore, // Conceptual blending ability
      creativity: finalScoreWithBonus, // Creative synthesis
      innovation: Math.round(creativityBonus), // Linguistic innovation
    };

    return {
      score: finalScoreWithBonus,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        wordA: spliceState.wordA,
        wordB: spliceState.wordB,
        submittedWord: spliceState.submittedWord,
        blendScore: finalScore,
        creativityBonus: Math.round(creativityBonus),
      },
    };
  },

  uiSchema: {
    layout: 'dual-anchor',
    input: 'type-one-word',
    feedback: 'score-bar',
    animation: 'scale',
    cardStyle: 'word',
  },
};
