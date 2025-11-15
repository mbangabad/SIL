/**
 * LOOP - Cyclical semantic chains game
 *
 * Build a semantic chain that loops back to the starting word
 * Tests: circular reasoning, semantic closure, narrative coherence
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateSimilarity } from '@sil/semantics';

interface LoopState {
  startWord: string;
  chain: string[];
  linkScores: number[];
  loopScore: number;
  round: number;
  targetLength: number;
}

/**
 * Starting words for loops
 */
const LOOP_STARTERS = [
  'circle',
  'journey',
  'cycle',
  'time',
  'life',
  'season',
  'story',
  'dream',
  'wave',
  'breath',
];

/**
 * Select starting word based on seed
 */
function selectStartWord(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return LOOP_STARTERS[hash % LOOP_STARTERS.length];
}

/**
 * Validate word
 */
function isValidWord(word: string): boolean {
  if (!word || word.length < 2 || word.length > 20) {
    return false;
  }

  const validPattern = /^[a-zA-Z]+$/;
  return validPattern.test(word);
}

/**
 * LOOP Game Definition
 */
export const loopGame: GameDefinition = {
  id: 'loop',
  name: 'LOOP',
  shortDescription: 'Build a semantic chain that loops back to start',
  supportedModes: ['journey', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const startWord = selectStartWord(ctx.seed);
    const targetLength = ctx.mode === 'journey' ? 5 : 7;

    const state: LoopState = {
      startWord,
      chain: [startWord],
      linkScores: [],
      loopScore: 0,
      round: 0,
      targetLength,
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
    const loopState = state.data as LoopState;

    // Only handle submitWord actions
    if (action.type !== 'submitWord') {
      return state;
    }

    const word = action.payload.text.toLowerCase().trim();

    // Validate word
    if (!isValidWord(word)) {
      return state;
    }

    // Check for duplicates (except start word at the end)
    const isCompletingLoop =
      loopState.chain.length === loopState.targetLength &&
      word === loopState.startWord;

    if (!isCompletingLoop && loopState.chain.includes(word)) {
      return state;
    }

    // Calculate link strength to previous word
    const previousWord = loopState.chain[loopState.chain.length - 1];
    const linkResult = await calculateSimilarity(word, previousWord, ctx.language);
    const linkScore = linkResult.score;

    // If completing loop, calculate closure score
    let loopScore = 0;
    if (isCompletingLoop) {
      // Loop score is the link back to start
      loopScore = linkScore;
    }

    const newState: LoopState = {
      ...loopState,
      chain: [...loopState.chain, word],
      linkScores: [...loopState.linkScores, linkScore],
      loopScore: isCompletingLoop ? loopScore : loopState.loopScore,
      round: loopState.round + 1,
    };

    // Game ends when loop is completed
    const shouldEnd = isCompletingLoop;

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
    const loopState = state.data as LoopState;

    // Calculate chain quality (average link strength)
    let chainQuality = 0;
    if (loopState.linkScores.length > 0) {
      chainQuality =
        loopState.linkScores.reduce((sum, s) => sum + s, 0) /
        loopState.linkScores.length;
    }

    // Final score combines chain quality and loop closure
    const chainScore = chainQuality * 100;
    const closureScore = loopState.loopScore * 100;

    // Weight: 60% chain quality, 40% closure
    const finalScore = Math.round(chainScore * 0.6 + closureScore * 0.4);

    // Calculate coherence (variance in link scores)
    let coherence = 100;
    if (loopState.linkScores.length > 1) {
      const variance =
        loopState.linkScores.reduce(
          (sum, s) => sum + Math.pow(s - chainQuality, 2),
          0
        ) / loopState.linkScores.length;
      coherence = Math.max(0, 100 - variance * 200);
    }

    // Skill signals
    const skillSignals: Record<string, number> = {
      coherence: Math.round(coherence), // Narrative coherence
      closure: Math.round(closureScore), // Ability to close the loop
      circularity: finalScore, // Cyclical thinking
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy: Math.round(chainScore),
      skillSignals,
      metadata: {
        startWord: loopState.startWord,
        chain: loopState.chain,
        loopCompleted: loopState.chain[loopState.chain.length - 1] === loopState.startWord,
        chainQuality: Math.round(chainScore),
        closureQuality: Math.round(closureScore),
        linkScores: loopState.linkScores.map((s) => Math.round(s * 100)),
      },
    };
  },

  uiSchema: {
    layout: 'list',
    input: 'type-one-word',
    feedback: 'score-bar',
    animation: 'fade',
    cardStyle: 'word',
  },
};
