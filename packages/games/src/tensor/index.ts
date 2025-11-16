/**
 * TENSOR - Timeline word selection game
 *
 * Words flow on a timeline - tap the ones relevant to the theme
 * Tests: temporal attention, selective processing, sustained focus
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateClusterHeatFromVector, calculateClusterCenter } from '@sil/semantics';

interface TensorState {
  theme: string;
  themeVector: number[];
  timeline: Array<{ word: string; timestamp: number }>;
  selectedWords: string[];
  correctWords: string[];
  incorrectWords: string[];
  round: number;
}

/**
 * Theme timelines with relevant and distractor words
 */
const TENSOR_THEMES: Record<
  string,
  { theme: string; coreWords: string[]; relevant: string[]; distractors: string[] }
> = {
  nature: {
    theme: 'nature',
    coreWords: ['forest', 'river', 'mountain', 'sky'],
    relevant: [
      'tree',
      'leaf',
      'water',
      'cloud',
      'stone',
      'wind',
      'bird',
      'flower',
      'grass',
      'earth',
    ],
    distractors: [
      'computer',
      'phone',
      'car',
      'building',
      'plastic',
      'metal',
      'screen',
      'keyboard',
      'wire',
      'concrete',
    ],
  },
  technology: {
    theme: 'technology',
    coreWords: ['computer', 'internet', 'digital', 'machine'],
    relevant: [
      'code',
      'data',
      'screen',
      'keyboard',
      'software',
      'network',
      'device',
      'system',
      'processor',
      'binary',
    ],
    distractors: [
      'tree',
      'flower',
      'ocean',
      'mountain',
      'bird',
      'cloud',
      'grass',
      'sunset',
      'forest',
      'river',
    ],
  },
  emotion: {
    theme: 'emotion',
    coreWords: ['love', 'joy', 'fear', 'anger'],
    relevant: [
      'happiness',
      'sadness',
      'hope',
      'despair',
      'passion',
      'calm',
      'anxiety',
      'peace',
      'excitement',
      'sorrow',
    ],
    distractors: [
      'table',
      'chair',
      'door',
      'window',
      'floor',
      'wall',
      'ceiling',
      'roof',
      'brick',
      'wood',
    ],
  },
};

/**
 * Select theme based on seed
 */
function selectTheme(seed: string): string {
  const themes = Object.keys(TENSOR_THEMES);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
}

/**
 * Create timeline of words
 */
function createTimeline(
  relevant: string[],
  distractors: string[],
  seed: string,
  count: number = 15
): Array<{ word: string; timestamp: number }> {
  // Mix relevant and distractor words
  const allWords = [...relevant, ...distractors];

  // Shuffle
  let hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = allWords.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
  }

  // Create timeline with timestamps
  const timeline = allWords.slice(0, count).map((word, index) => ({
    word,
    timestamp: index * 1000, // 1 second intervals
  }));

  return timeline;
}

/**
 * TENSOR Game Definition
 */
export const tensorGame: GameDefinition = {
  id: 'tensor',
  name: 'TENSOR',
  shortDescription: 'Select relevant words from a flowing timeline',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const themeKey = selectTheme(ctx.seed);
    const themeData = TENSOR_THEMES[themeKey];

    // Calculate theme vector
    const themeVector = await calculateClusterCenter(
      themeData.coreWords,
      ctx.language
    );

    // Create timeline
    const timeline = createTimeline(
      themeData.relevant,
      themeData.distractors,
      ctx.seed,
      15
    );

    const state: TensorState = {
      theme: themeData.theme,
      themeVector,
      timeline,
      selectedWords: [],
      correctWords: [],
      incorrectWords: [],
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
    const tensorState = state.data as TensorState;

    // Handle tap-many action (final submission)
    if (action.type === 'tap-many') {
      const wordIds = action.payload.wordIds;
      const selectedWords = wordIds
        .map((id: string) => {
          const index = parseInt(id);
          return !isNaN(index) && index < tensorState.timeline.length
            ? tensorState.timeline[index].word
            : null;
        })
        .filter((w): w is string => w !== null);

      // Classify selections
      const correct: string[] = [];
      const incorrect: string[] = [];

      const themeKey = selectTheme(ctx.seed);
      const themeData = TENSOR_THEMES[themeKey];

      for (const word of selectedWords) {
        if (themeData.relevant.includes(word)) {
          correct.push(word);
        } else {
          incorrect.push(word);
        }
      }

      const newState: TensorState = {
        ...tensorState,
        selectedWords,
        correctWords: correct,
        incorrectWords: incorrect,
        round: tensorState.round + 1,
      };

      return {
        step: state.step + 1,
        done: true,
        data: newState,
      };
    }

    return state;
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const tensorState = state.data as TensorState;

    const themeKey = selectTheme(ctx.seed);
    const themeData = TENSOR_THEMES[themeKey];

    const correctCount = tensorState.correctWords.length;
    const incorrectCount = tensorState.incorrectWords.length;
    const totalRelevant = themeData.relevant.filter((w) =>
      tensorState.timeline.map((t) => t.word).includes(w)
    ).length;

    // Calculate metrics
    const precision =
      correctCount + incorrectCount > 0
        ? (correctCount / (correctCount + incorrectCount)) * 100
        : 0;

    const recall = totalRelevant > 0 ? (correctCount / totalRelevant) * 100 : 0;

    // F1 score
    const f1 =
      precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    const finalScore = Math.round(f1);
    const accuracy = Math.round(precision);

    // Skill signals
    const skillSignals: Record<string, number> = {
      attention: finalScore, // Sustained attention
      selectivity: accuracy, // Selective processing
      focus: Math.round(recall), // Focus on relevant items
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        theme: tensorState.theme,
        correct: correctCount,
        incorrect: incorrectCount,
        totalRelevant,
        precision: Math.round(precision),
        recall: Math.round(recall),
      },
    };
  },

  uiSchema: {
    layout: 'timeline',
    input: 'tap-many',
    feedback: 'score-bar',
    animation: 'fade',
    cardStyle: 'word',
  },
};
