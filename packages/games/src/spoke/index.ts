/**
 * SPOKE - Semantic triangle selection game
 *
 * An anchor word in the center with 6-8 surrounding words.
 * Pick the two that form the strongest semantic "triangle" with the anchor.
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateTriangleScore } from '@sil/semantics';

interface SpokeState {
  anchor: string;
  candidates: string[];
  triangleScores: Map<string, number>; // key: "i,j" -> score
  selectedIndices: number[];
  score: number;
}

/**
 * Spoke sets with anchor and candidates
 */
const SPOKE_SETS = {
  ocean: {
    anchor: 'ocean',
    candidates: ['wave', 'tide', 'shore', 'deep', 'salt', 'fish', 'reef', 'boat'],
  },
  music: {
    anchor: 'music',
    candidates: ['melody', 'harmony', 'rhythm', 'song', 'note', 'chord', 'beat', 'tune'],
  },
  time: {
    anchor: 'time',
    candidates: ['hour', 'minute', 'past', 'future', 'moment', 'day', 'clock', 'year'],
  },
};

/**
 * Select spoke set based on seed
 */
function selectSpokeSet(seed: string) {
  const sets = Object.values(SPOKE_SETS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return sets[hash % sets.length];
}

/**
 * SPOKE Game Definition
 */
export const spokeGame: GameDefinition = {
  id: 'spoke',
  name: 'SPOKE',
  shortDescription: 'Pick the two words forming the strongest semantic triangle',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const spokeSet = selectSpokeSet(ctx.seed);

    // Pre-calculate all triangle scores (for all pairs)
    const triangleScores = new Map<string, number>();

    for (let i = 0; i < spokeSet.candidates.length; i++) {
      for (let j = i + 1; j < spokeSet.candidates.length; j++) {
        const score = await calculateTriangleScore(
          spokeSet.anchor,
          spokeSet.candidates[i],
          spokeSet.candidates[j],
          ctx.language
        );
        triangleScores.set(`${i},${j}`, score);
      }
    }

    const state: SpokeState = {
      anchor: spokeSet.anchor,
      candidates: spokeSet.candidates,
      triangleScores,
      selectedIndices: [],
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
    const spokeState = state.data as SpokeState;

    if (action.type !== 'tap-many') return state;

    const selectedIds = action.payload.wordIds || [];
    const selectedIndices = selectedIds
      .map(id => parseInt(id))
      .filter(idx => !isNaN(idx) && idx >= 0 && idx < spokeState.candidates.length);

    // Need exactly 2 selections
    if (selectedIndices.length !== 2) {
      return state;
    }

    // Get triangle score
    const [i, j] = selectedIndices.sort((a, b) => a - b);
    const triangleScore = spokeState.triangleScores.get(`${i},${j}`) || 0;

    // Normalize to 0-100
    const allScores = Array.from(spokeState.triangleScores.values());
    const maxScore = Math.max(...allScores);
    const score = maxScore > 0 ? Math.round((triangleScore / maxScore) * 100) : 0;

    return {
      step: state.step + 1,
      done: true,
      data: {
        ...spokeState,
        selectedIndices,
        score,
      },
    };
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const spokeState = state.data as SpokeState;

    return {
      score: spokeState.score,
      durationMs: 0,
      accuracy: spokeState.score,
      skillSignals: {
        analogical_reasoning: spokeState.score / 100,
        triangle_coherence: spokeState.score / 100,
        convergent_selection: spokeState.score / 100,
      },
      metadata: {
        anchor: spokeState.anchor,
        candidates: spokeState.candidates,
        selectedIndices: spokeState.selectedIndices,
      },
    };
  },

  uiSchema: {
    layout: 'wheel',
    input: 'tap-many',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
