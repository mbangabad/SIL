/**
 * SPAN - Semantic bridging game
 *
 * Find the word that best bridges two anchor concepts
 * Tests: conceptual blending, semantic midpoint detection, creative linking
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateMidpointScore, calculateBalanceScore } from '@sil/semantics';

interface SpanState {
  anchorA: string;
  anchorB: string;
  candidateWords: string[];
  selectedWordId: string | null;
  selectedWord: string | null;
  midpointScore: number;
  balanceScore: number;
  round: number;
}

/**
 * Anchor pairs that work well for bridging
 */
const ANCHOR_PAIRS: Array<{ a: string; b: string; candidates: string[] }> = [
  {
    a: 'fire',
    b: 'water',
    candidates: [
      'steam',
      'energy',
      'nature',
      'heat',
      'ice',
      'boil',
      'vapor',
      'cloud',
      'element',
    ],
  },
  {
    a: 'earth',
    b: 'sky',
    candidates: [
      'horizon',
      'mountain',
      'cloud',
      'tree',
      'bird',
      'wind',
      'ground',
      'air',
      'atmosphere',
    ],
  },
  {
    a: 'day',
    b: 'night',
    candidates: [
      'twilight',
      'dusk',
      'dawn',
      'evening',
      'sunset',
      'sunrise',
      'time',
      'shadow',
      'light',
    ],
  },
  {
    a: 'love',
    b: 'hate',
    candidates: [
      'passion',
      'emotion',
      'anger',
      'conflict',
      'feeling',
      'heart',
      'intensity',
      'relationship',
      'indifference',
    ],
  },
  {
    a: 'old',
    b: 'young',
    candidates: [
      'middle',
      'age',
      'time',
      'generation',
      'wisdom',
      'experience',
      'life',
      'growth',
      'mature',
    ],
  },
  {
    a: 'hot',
    b: 'cold',
    candidates: [
      'warm',
      'cool',
      'temperature',
      'weather',
      'climate',
      'lukewarm',
      'moderate',
      'mild',
      'tepid',
    ],
  },
];

/**
 * Select anchor pair based on seed
 */
function selectAnchorPair(seed: string): {
  a: string;
  b: string;
  candidates: string[];
} {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return ANCHOR_PAIRS[hash % ANCHOR_PAIRS.length];
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
 * SPAN Game Definition
 */
export const spanGame: GameDefinition = {
  id: 'span',
  name: 'SPAN',
  shortDescription: 'Find the word that bridges two concepts',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const anchorPair = selectAnchorPair(ctx.seed);
    const shuffledCandidates = shuffleArray(anchorPair.candidates, ctx.seed);

    const state: SpanState = {
      anchorA: anchorPair.a,
      anchorB: anchorPair.b,
      candidateWords: shuffledCandidates,
      selectedWordId: null,
      selectedWord: null,
      midpointScore: 0,
      balanceScore: 0,
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
    const spanState = state.data as SpanState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (
      isNaN(wordIndex) ||
      wordIndex < 0 ||
      wordIndex >= spanState.candidateWords.length
    ) {
      return state;
    }

    const selectedWord = spanState.candidateWords[wordIndex];

    // Calculate midpoint score
    const midpointResult = await calculateMidpointScore(
      selectedWord,
      spanState.anchorA,
      spanState.anchorB,
      ctx.language
    );

    // Calculate balance score
    const balanceScore = await calculateBalanceScore(
      selectedWord,
      spanState.anchorA,
      spanState.anchorB,
      ctx.language
    );

    const newState: SpanState = {
      ...spanState,
      selectedWordId: wordId,
      selectedWord,
      midpointScore: midpointResult.score,
      balanceScore,
      round: spanState.round + 1,
    };

    // Check if game should end
    const shouldEnd =
      ctx.mode === 'oneShot' ||
      (ctx.mode === 'journey' && newState.round >= 3);

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
    const spanState = state.data as SpanState;

    // Final score is combination of midpoint and balance
    const midpointScore = spanState.midpointScore * 100;
    const balanceScore = spanState.balanceScore * 100;
    const finalScore = Math.round((midpointScore * 0.7 + balanceScore * 0.3));

    const accuracy = Math.round(midpointScore);

    // Skill signals
    const skillSignals: Record<string, number> = {
      bridging: finalScore, // Ability to find semantic bridges
      balance: Math.round(balanceScore), // Balance between anchors
      creativity: Math.round(midpointScore), // Creative linking
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        anchorA: spanState.anchorA,
        anchorB: spanState.anchorB,
        selectedWord: spanState.selectedWord,
        midpointScore: Math.round(midpointScore),
        balanceScore: Math.round(balanceScore),
      },
    };
  },

  uiSchema: {
    layout: 'dual-anchor',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'scale',
    cardStyle: 'word',
  },
};
