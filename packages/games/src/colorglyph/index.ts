/**
 * COLORGLYPH - Color-emotion matching game
 *
 * Match words to colors based on emotional/semantic resonance
 * Tests: affective mapping, synesthetic thinking, emotional intelligence
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateSimilarity, embeddingService } from '@sil/semantics';

interface ColorGlyphState {
  targetColor: string;
  colorName: string;
  colorWords: string[];
  candidateWords: string[];
  selectedWordId: string | null;
  selectedWord: string | null;
  resonanceScore: number;
  round: number;
}

/**
 * Color definitions with associated emotional/semantic words
 */
const COLOR_MAPPINGS: Record<
  string,
  { hex: string; name: string; coreWords: string[]; candidates: string[] }
> = {
  red: {
    hex: '#ef4444',
    name: 'Red',
    coreWords: ['passion', 'anger', 'energy', 'fire'],
    candidates: [
      'love',
      'rage',
      'heat',
      'danger',
      'power',
      'blood',
      'rose',
      'sunset',
      'courage',
      'intense',
      'warm',
      'excitement',
    ],
  },
  blue: {
    hex: '#3b82f6',
    name: 'Blue',
    coreWords: ['calm', 'ocean', 'sky', 'peace'],
    candidates: [
      'water',
      'serenity',
      'cool',
      'deep',
      'tranquil',
      'ice',
      'sad',
      'trust',
      'wisdom',
      'loyalty',
      'heaven',
      'infinite',
    ],
  },
  green: {
    hex: '#10b981',
    name: 'Green',
    coreWords: ['nature', 'growth', 'life', 'fresh'],
    candidates: [
      'forest',
      'plant',
      'spring',
      'renewal',
      'hope',
      'harmony',
      'health',
      'leaf',
      'grass',
      'peace',
      'balance',
      'earth',
    ],
  },
  yellow: {
    hex: '#f59e0b',
    name: 'Yellow',
    coreWords: ['joy', 'sun', 'light', 'happy'],
    candidates: [
      'bright',
      'cheerful',
      'warm',
      'optimism',
      'energy',
      'gold',
      'lemon',
      'smile',
      'summer',
      'radiant',
      'glow',
      'positive',
    ],
  },
  purple: {
    hex: '#8b5cf6',
    name: 'Purple',
    coreWords: ['mystery', 'royal', 'magic', 'deep'],
    candidates: [
      'wisdom',
      'luxury',
      'dream',
      'spiritual',
      'noble',
      'elegant',
      'twilight',
      'mystic',
      'crown',
      'rare',
      'creative',
      'intuition',
    ],
  },
  orange: {
    hex: '#f97316',
    name: 'Orange',
    coreWords: ['energy', 'vibrant', 'warm', 'creative'],
    candidates: [
      'sunset',
      'fire',
      'enthusiasm',
      'adventure',
      'courage',
      'autumn',
      'citrus',
      'playful',
      'dynamic',
      'friendly',
      'glow',
      'excitement',
    ],
  },
};

/**
 * Select color based on seed
 */
function selectColor(seed: string): string {
  const colors = Object.keys(COLOR_MAPPINGS);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
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
 * Calculate color-word resonance
 * Uses average similarity to color's core words
 */
async function calculateColorResonance(
  word: string,
  colorWords: string[],
  language: string
): Promise<number> {
  const wordEmb = await embeddingService.getEmbedding(word, language);
  if (!wordEmb) return 0;

  let totalSim = 0;
  let count = 0;

  for (const colorWord of colorWords) {
    const result = await calculateSimilarity(word, colorWord, language);
    totalSim += result.score;
    count++;
  }

  return count > 0 ? totalSim / count : 0;
}

/**
 * COLORGLYPH Game Definition
 */
export const colorglyphGame: GameDefinition = {
  id: 'colorglyph',
  name: 'COLORGLYPH',
  shortDescription: 'Match words to colors based on emotional resonance',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const colorKey = selectColor(ctx.seed);
    const colorData = COLOR_MAPPINGS[colorKey];

    // Shuffle candidates
    const shuffledCandidates = shuffleArray(colorData.candidates, ctx.seed);
    const selectedCandidates = shuffledCandidates.slice(0, 9);

    const state: ColorGlyphState = {
      targetColor: colorData.hex,
      colorName: colorData.name,
      colorWords: colorData.coreWords,
      candidateWords: selectedCandidates,
      selectedWordId: null,
      selectedWord: null,
      resonanceScore: 0,
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
    const colorGlyphState = state.data as ColorGlyphState;

    // Only handle tap actions
    if (action.type !== 'tap') {
      return state;
    }

    const wordId = action.payload.wordId;
    const wordIndex = parseInt(wordId);

    if (
      isNaN(wordIndex) ||
      wordIndex < 0 ||
      wordIndex >= colorGlyphState.candidateWords.length
    ) {
      return state;
    }

    const selectedWord = colorGlyphState.candidateWords[wordIndex];

    // Calculate resonance
    const resonance = await calculateColorResonance(
      selectedWord,
      colorGlyphState.colorWords,
      ctx.language
    );

    const newState: ColorGlyphState = {
      ...colorGlyphState,
      selectedWordId: wordId,
      selectedWord,
      resonanceScore: resonance,
      round: colorGlyphState.round + 1,
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
    const colorGlyphState = state.data as ColorGlyphState;

    const finalScore = Math.round(colorGlyphState.resonanceScore * 100);
    const accuracy = finalScore;

    // Skill signals
    const skillSignals: Record<string, number> = {
      affective: finalScore, // Emotional mapping ability
      synesthesia: finalScore, // Cross-sensory association
      intuition: finalScore, // Intuitive resonance
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        color: colorGlyphState.colorName,
        colorHex: colorGlyphState.targetColor,
        selectedWord: colorGlyphState.selectedWord,
        resonance: Math.round(colorGlyphState.resonanceScore * 100),
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-one',
    feedback: 'score-bar',
    animation: 'fade',
    cardStyle: 'mixed',
  },
};
