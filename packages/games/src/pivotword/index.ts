/**
 * PIVOTWORD - Semantic pivot selection game
 *
 * Choose the word that best "connects" two anchors, acting as a semantic pivot.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculatePivotScore } from '@sil/semantics';

interface PivotwordState {
  anchorA: string;
  anchorB: string;
  candidates: string[];
  pivotScores: number[];
  selectedIndex: number | null;
  score: number;
}

/**
 * Anchor pairs and their pivot candidates
 */
const PIVOT_SETS = {
  oceanLand: {
    anchors: ['ocean', 'land'],
    candidates: ['shore', 'beach', 'coast', 'island', 'harbor', 'cliff'],
  },
  dayNight: {
    anchors: ['day', 'night'],
    candidates: ['dawn', 'dusk', 'twilight', 'noon', 'midnight', 'shadow'],
  },
  firWater: {
    anchors: ['fire', 'water'],
    candidates: ['steam', 'smoke', 'ice', 'boil', 'heat', 'cold'],
  },
};

/**
 * Select pivot set based on seed
 */
function selectPivotSet(seed: string) {
  const sets = Object.values(PIVOT_SETS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sets[hash % sets.length];
}

/**
 * PIVOTWORD Game Definition
 */
export const pivotwordGame: GameDefinition = {
  id: 'pivotword',
  name: 'PIVOTWORD',
  shortDescription: 'Pick the word that best connects two anchors',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const pivotSet = selectPivotSet(ctx.seed);

    // Calculate pivot scores for all candidates
    const pivotScores = await Promise.all(
      pivotSet.candidates.map(candidate =>
        calculatePivotScore(
          candidate,
          pivotSet.anchors[0],
          pivotSet.anchors[1],
          ctx.language
        )
      )
    );

    const state: PivotwordState = {
      anchorA: pivotSet.anchors[0],
      anchorB: pivotSet.anchors[1],
      candidates: pivotSet.candidates,
      pivotScores,
      selectedIndex: null,
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
    const pivotwordState = state.data as PivotwordState;

    if (action.type !== 'tap') return state;

    const candidateIndex = parseInt(action.payload.wordId);

    if (isNaN(candidateIndex) || candidateIndex < 0 || candidateIndex >= pivotwordState.candidates.length) {
      return state;
    }

    // Normalize pivot score to 0-100
    const maxScore = Math.max(...pivotwordState.pivotScores);
    const rawScore = pivotwordState.pivotScores[candidateIndex];
    const score = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...pivotwordState,
        selectedIndex: candidateIndex,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const pivotwordState = state.data as PivotwordState;

    return {
      score: pivotwordState.score,
      durationMs: 0,
      accuracy: pivotwordState.score,
      skillSignals: {
        analogy_strength: pivotwordState.score / 100,
        convergent_precision: pivotwordState.score / 100,
      },
      metadata: {
        anchorA: pivotwordState.anchorA,
        anchorB: pivotwordState.anchorB,
        candidates: pivotwordState.candidates,
        selectedIndex: pivotwordState.selectedIndex,
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
