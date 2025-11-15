/**
 * CLUSTER - Hot/cold navigation game
 *
 * Navigate toward a hidden theme by getting heat feedback
 * Tests: theme inference, iterative refinement, strategic thinking
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
  heatToLabel,
} from '@sil/semantics';

interface ClusterState {
  themeWord: string;
  themeVector: number[];
  candidateWords: string[];
  selectedWords: string[];
  heatScores: number[];
  round: number;
  maxRounds: number;
}

/**
 * Theme clusters with candidate words
 */
const THEME_CLUSTERS: Record<
  string,
  { theme: string; core: string[]; candidates: string[] }
> = {
  space: {
    theme: 'space',
    core: ['star', 'planet', 'orbit', 'galaxy'],
    candidates: [
      'moon',
      'rocket',
      'asteroid',
      'comet',
      'nebula',
      'cosmos',
      'void',
      'gravity',
      'light',
      'dark',
      'infinite',
      'universe',
      'meteor',
      'satellite',
      'telescope',
      'astronaut',
    ],
  },
  music: {
    theme: 'music',
    core: ['melody', 'rhythm', 'harmony', 'song'],
    candidates: [
      'note',
      'chord',
      'beat',
      'sound',
      'voice',
      'instrument',
      'piano',
      'guitar',
      'drum',
      'symphony',
      'concert',
      'band',
      'tempo',
      'pitch',
      'tune',
      'composer',
    ],
  },
  garden: {
    theme: 'garden',
    core: ['flower', 'soil', 'plant', 'grow'],
    candidates: [
      'seed',
      'bloom',
      'petal',
      'root',
      'leaf',
      'water',
      'sun',
      'garden',
      'rose',
      'tulip',
      'green',
      'spring',
      'fresh',
      'life',
      'earth',
      'nurture',
    ],
  },
  winter: {
    theme: 'winter',
    core: ['snow', 'cold', 'ice', 'frost'],
    candidates: [
      'freeze',
      'chill',
      'white',
      'crystal',
      'flake',
      'wind',
      'storm',
      'frozen',
      'icicle',
      'december',
      'season',
      'coat',
      'ski',
      'mountain',
      'fireplace',
      'blizzard',
    ],
  },
};

/**
 * Select theme based on seed
 */
function selectTheme(seed: string): string {
  const themes = Object.keys(THEME_CLUSTERS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
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
 * CLUSTER Game Definition
 */
export const clusterGame: GameDefinition = {
  id: 'cluster',
  name: 'CLUSTER',
  shortDescription: 'Navigate toward the hidden theme using heat feedback',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const themeKey = selectTheme(ctx.seed);
    const themeData = THEME_CLUSTERS[themeKey];

    // Calculate theme vector from core words
    const themeVector = await calculateClusterCenter(
      themeData.core,
      ctx.language
    );

    // Shuffle candidate words
    const shuffledCandidates = shuffleArray(themeData.candidates, ctx.seed);
    const selectedCandidates = shuffledCandidates.slice(0, 12);

    const maxRounds = ctx.mode === 'oneShot' ? 1 : ctx.mode === 'journey' ? 5 : 10;

    const state: ClusterState = {
      themeWord: themeData.theme,
      themeVector,
      candidateWords: selectedCandidates,
      selectedWords: [],
      heatScores: [],
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
    const clusterState = state.data as ClusterState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (
      isNaN(wordIndex) ||
      wordIndex < 0 ||
      wordIndex >= clusterState.candidateWords.length
    ) {
      return state;
    }

    const selectedWord = clusterState.candidateWords[wordIndex];

    // Calculate heat
    const heatResult = await calculateClusterHeatFromVector(
      selectedWord,
      clusterState.themeVector,
      ctx.language
    );

    const newState: ClusterState = {
      ...clusterState,
      selectedWords: [...clusterState.selectedWords, selectedWord],
      heatScores: [...clusterState.heatScores, heatResult.heat],
      round: clusterState.round + 1,
    };

    // Check if game should end
    const shouldEnd =
      newState.round >= newState.maxRounds ||
      heatResult.heat >= 0.9; // Found very hot word

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
    const clusterState = state.data as ClusterState;

    // Calculate final score
    let finalScore = 0;
    if (clusterState.heatScores.length > 0) {
      // Best heat score achieved
      const maxHeat = Math.max(...clusterState.heatScores);
      finalScore = Math.round(maxHeat * 100);

      // Bonus for finding it quickly
      const efficiency = 1 - (clusterState.round - 1) / clusterState.maxRounds;
      finalScore = Math.round(finalScore * (0.7 + 0.3 * efficiency));
    }

    // Calculate improvement over rounds
    let improvement = 0;
    if (clusterState.heatScores.length > 1) {
      const firstHeat = clusterState.heatScores[0];
      const lastHeat = clusterState.heatScores[clusterState.heatScores.length - 1];
      improvement = Math.max(0, (lastHeat - firstHeat) * 100);
    }

    // Skill signals
    const skillSignals: Record<string, number> = {
      inference: finalScore, // Ability to infer theme
      navigation: Math.round(improvement), // Strategic navigation
      convergence: finalScore, // Ability to converge on target
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy: finalScore,
      skillSignals,
      metadata: {
        theme: clusterState.themeWord,
        rounds: clusterState.round,
        selectedWords: clusterState.selectedWords,
        heatScores: clusterState.heatScores.map((h) => Math.round(h * 100)),
        heatLabels: clusterState.heatScores.map(heatToLabel),
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'hot-cold',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
