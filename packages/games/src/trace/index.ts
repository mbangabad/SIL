/**
 * TRACE - Semantic chain building game
 *
 * Build a semantic chain by selecting the next most related word
 * Tests: associative thinking, coherence maintenance, chain reasoning
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateSimilarity, findMostSimilar } from '@sil/semantics';

interface TraceState {
  chain: string[];
  candidateWords: string[];
  usedWords: Set<string>;
  linkScores: number[];
  round: number;
  maxRounds: number;
}

/**
 * Starting words for semantic chains
 */
const CHAIN_STARTERS: Record<string, { start: string; pool: string[] }> = {
  mountain_journey: {
    start: 'mountain',
    pool: [
      'peak',
      'climb',
      'summit',
      'trail',
      'forest',
      'tree',
      'leaf',
      'green',
      'grass',
      'field',
      'river',
      'water',
      'ocean',
      'wave',
      'sand',
      'beach',
      'sunset',
      'sky',
      'cloud',
      'rain',
    ],
  },
  fire_transformation: {
    start: 'fire',
    pool: [
      'flame',
      'heat',
      'light',
      'glow',
      'warm',
      'sun',
      'day',
      'bright',
      'gold',
      'shine',
      'star',
      'night',
      'dark',
      'shadow',
      'mystery',
      'secret',
      'whisper',
      'silence',
      'peace',
      'calm',
    ],
  },
  seed_growth: {
    start: 'seed',
    pool: [
      'plant',
      'grow',
      'sprout',
      'leaf',
      'stem',
      'flower',
      'bloom',
      'petal',
      'color',
      'beauty',
      'joy',
      'smile',
      'happy',
      'love',
      'heart',
      'soul',
      'spirit',
      'dream',
      'hope',
      'future',
    ],
  },
};

/**
 * Select chain based on seed
 */
function selectChain(seed: string): string {
  const chains = Object.keys(CHAIN_STARTERS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return chains[hash % chains.length];
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
 * TRACE Game Definition
 */
export const traceGame: GameDefinition = {
  id: 'trace',
  name: 'TRACE',
  shortDescription: 'Build a semantic chain by finding the next link',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const chainKey = selectChain(ctx.seed);
    const chainData = CHAIN_STARTERS[chainKey];

    // Shuffle word pool
    const shuffledPool = shuffleArray(chainData.pool, ctx.seed);
    const selectedPool = shuffledPool.slice(0, 12);

    const maxRounds = ctx.mode === 'oneShot' ? 1 : ctx.mode === 'journey' ? 5 : 10;

    const state: TraceState = {
      chain: [chainData.start],
      candidateWords: selectedPool,
      usedWords: new Set([chainData.start]),
      linkScores: [],
      round: 0,
      maxRounds,
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
    const traceState = state.data as TraceState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (
      isNaN(wordIndex) ||
      wordIndex < 0 ||
      wordIndex >= traceState.candidateWords.length
    ) {
      return state;
    }

    const selectedWord = traceState.candidateWords[wordIndex];

    // Check if word was already used
    if (traceState.usedWords.has(selectedWord)) {
      return state;
    }

    // Calculate link strength (similarity to previous word in chain)
    const previousWord = traceState.chain[traceState.chain.length - 1];
    const linkResult = await calculateSimilarity(
      selectedWord,
      previousWord,
      ctx.language
    );

    const linkScore = linkResult.score;

    // Update state
    const newUsedWords = new Set(traceState.usedWords);
    newUsedWords.add(selectedWord);

    const newState: TraceState = {
      ...traceState,
      chain: [...traceState.chain, selectedWord],
      usedWords: newUsedWords,
      linkScores: [...traceState.linkScores, linkScore],
      round: traceState.round + 1,
    };

    // Check if game should end
    const shouldEnd = newState.round >= newState.maxRounds;

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
    const traceState = state.data as TraceState;

    // Calculate final score
    let finalScore = 0;
    if (traceState.linkScores.length > 0) {
      // Average link strength
      const avgLink =
        traceState.linkScores.reduce((sum, s) => sum + s, 0) /
        traceState.linkScores.length;
      finalScore = Math.round(avgLink * 100);
    }

    // Calculate coherence (consistency of link strengths)
    let coherence = 100;
    if (traceState.linkScores.length > 1) {
      const avg = finalScore / 100;
      const variance =
        traceState.linkScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
        traceState.linkScores.length;
      coherence = Math.max(0, 100 - variance * 100);
    }

    // Skill signals
    const skillSignals: Record<string, number> = {
      association: finalScore, // Associative thinking
      coherence: Math.round(coherence), // Chain coherence
      linkage: finalScore, // Link quality
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy: finalScore,
      skillSignals,
      metadata: {
        chain: traceState.chain,
        chainLength: traceState.chain.length,
        linkScores: traceState.linkScores.map((s) => Math.round(s * 100)),
        averageLink: finalScore,
        coherence: Math.round(coherence),
      },
    };
  },

  uiSchema: {
    layout: 'list',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'fade',
    cardStyle: 'word',
  },
};
