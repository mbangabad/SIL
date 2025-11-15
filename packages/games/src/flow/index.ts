/**
 * FLOW - Coherent word stream game
 *
 * Type a rapid chain of related words to maintain semantic flow
 * Tests: fluency, associative speed, semantic neighborhood navigation
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateSimilarity } from '@sil/semantics';

interface FlowState {
  startWord: string;
  submittedWords: string[];
  linkScores: number[];
  invalidWords: string[];
  round: number;
  maxRounds: number;
}

/**
 * Starting words for flow chains
 */
const FLOW_STARTERS = [
  'ocean',
  'mountain',
  'city',
  'forest',
  'dream',
  'music',
  'time',
  'light',
  'journey',
  'home',
];

/**
 * Select starting word based on seed
 */
function selectStartWord(seed: string): string {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FLOW_STARTERS[hash % FLOW_STARTERS.length];
}

/**
 * Validate word (basic check)
 */
function isValidWord(word: string): boolean {
  if (!word || word.length < 2 || word.length > 20) {
    return false;
  }

  const validPattern = /^[a-zA-Z]+$/;
  return validPattern.test(word);
}

/**
 * FLOW Game Definition
 */
export const flowGame: GameDefinition = {
  id: 'flow',
  name: 'FLOW',
  shortDescription: 'Type a rapid chain of semantically related words',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const startWord = selectStartWord(ctx.seed);
    const maxRounds = ctx.mode === 'oneShot' ? 3 : ctx.mode === 'journey' ? 7 : 15;

    const state: FlowState = {
      startWord,
      submittedWords: [],
      linkScores: [],
      invalidWords: [],
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
    const flowState = state.data as FlowState;

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
          ...flowState,
          invalidWords: [...flowState.invalidWords, word],
        },
      };
    }

    // Check for duplicates
    if (
      flowState.submittedWords.includes(word) ||
      word === flowState.startWord
    ) {
      return state;
    }

    // Calculate link strength to previous word
    const previousWord =
      flowState.submittedWords.length > 0
        ? flowState.submittedWords[flowState.submittedWords.length - 1]
        : flowState.startWord;

    const linkResult = await calculateSimilarity(word, previousWord, ctx.language);
    const linkScore = linkResult.score;

    // Update state
    const newState: FlowState = {
      ...flowState,
      submittedWords: [...flowState.submittedWords, word],
      linkScores: [...flowState.linkScores, linkScore],
      round: flowState.round + 1,
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
    const flowState = state.data as FlowState;

    // Calculate final score (average neighborhood coherence)
    let finalScore = 0;
    if (flowState.linkScores.length > 0) {
      const avgCoherence =
        flowState.linkScores.reduce((sum, s) => sum + s, 0) /
        flowState.linkScores.length;
      finalScore = Math.round(avgCoherence * 100);
    }

    // Calculate fluency (words submitted vs max rounds)
    const fluency = (flowState.submittedWords.length / flowState.maxRounds) * 100;

    // Calculate consistency (variance in link scores)
    let consistency = 100;
    if (flowState.linkScores.length > 1) {
      const avg = finalScore / 100;
      const variance =
        flowState.linkScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) /
        flowState.linkScores.length;
      consistency = Math.max(0, 100 - variance * 200);
    }

    // Skill signals
    const skillSignals: Record<string, number> = {
      fluency: Math.round(fluency), // Word generation speed
      coherence: finalScore, // Semantic coherence
      association: finalScore, // Associative strength
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy: finalScore,
      skillSignals,
      metadata: {
        startWord: flowState.startWord,
        chain: [flowState.startWord, ...flowState.submittedWords],
        chainLength: flowState.submittedWords.length + 1,
        linkScores: flowState.linkScores.map((s) => Math.round(s * 100)),
        fluency: Math.round(fluency),
        consistency: Math.round(consistency),
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
