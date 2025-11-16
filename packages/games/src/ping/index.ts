/**
 * PING - Rapid word filtering game
 *
 * Quickly select words that match a category as they appear
 * Tests: executive function, filtering under pressure, attention
 */

import type {
  GameDefinition,
  GameContext,
  GameState,
  PlayerAction,
  GameResultSummary,
} from '@sil/core';
import { calculateAverageSimilarity } from '@sil/semantics';

interface PingState {
  category: string;
  categoryWords: string[];
  allWords: string[];
  selectedWords: string[];
  correctWords: string[];
  incorrectWords: string[];
  round: number;
}

/**
 * Category definitions with positive and negative examples
 */
const CATEGORIES: Record<
  string,
  { name: string; positive: string[]; negative: string[] }
> = {
  animals: {
    name: 'Animals',
    positive: [
      'dog',
      'cat',
      'bird',
      'fish',
      'lion',
      'bear',
      'wolf',
      'deer',
      'eagle',
      'shark',
    ],
    negative: [
      'tree',
      'car',
      'house',
      'book',
      'phone',
      'chair',
      'lamp',
      'cloud',
      'rain',
      'star',
    ],
  },
  food: {
    name: 'Food',
    positive: [
      'apple',
      'bread',
      'cheese',
      'rice',
      'fish',
      'meat',
      'pasta',
      'soup',
      'salad',
      'cake',
    ],
    negative: [
      'hammer',
      'shirt',
      'car',
      'tree',
      'cloud',
      'rock',
      'metal',
      'glass',
      'paper',
      'wood',
    ],
  },
  nature: {
    name: 'Nature',
    positive: [
      'tree',
      'flower',
      'river',
      'mountain',
      'forest',
      'ocean',
      'sky',
      'rain',
      'sun',
      'moon',
    ],
    negative: [
      'computer',
      'phone',
      'car',
      'building',
      'factory',
      'road',
      'wire',
      'plastic',
      'metal',
      'concrete',
    ],
  },
  tools: {
    name: 'Tools',
    positive: [
      'hammer',
      'saw',
      'drill',
      'wrench',
      'screwdriver',
      'knife',
      'scissors',
      'axe',
      'shovel',
      'rake',
    ],
    negative: [
      'flower',
      'cloud',
      'dream',
      'song',
      'smile',
      'story',
      'dance',
      'game',
      'joke',
      'idea',
    ],
  },
};

/**
 * Select category based on seed
 */
function selectCategory(seed: string): string {
  const categories = Object.keys(CATEGORIES);
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return categories[hash % categories.length];
}

/**
 * Shuffle and combine words
 */
function prepareWords(categoryKey: string, seed: string): string[] {
  const category = CATEGORIES[categoryKey];
  const allWords = [...category.positive, ...category.negative];

  // Shuffle
  let hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = allWords.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = hash % (i + 1);
    [allWords[i], allWords[j]] = [allWords[j], allWords[i]];
  }

  return allWords.slice(0, 12); // Select 12 words for the game
}

/**
 * PING Game Definition
 */
export const pingGame: GameDefinition = {
  id: 'ping',
  name: 'PING',
  shortDescription: 'Quickly filter words by category',
  supportedModes: ['oneShot', 'journey', 'arena', 'endurance'],

  async init(ctx: GameContext): Promise<GameState> {
    const categoryKey = selectCategory(ctx.seed);
    const category = CATEGORIES[categoryKey];
    const words = prepareWords(categoryKey, ctx.seed);

    const state: PingState = {
      category: category.name,
      categoryWords: category.positive,
      allWords: words,
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
    const pingState = state.data as PingState;

    // Handle tap-many action
    if (action.type === 'tap-many') {
      const wordIds = action.payload.wordIds;
      const selectedWords = wordIds
        .map((id: string) => {
          const index = parseInt(id);
          return !isNaN(index) ? pingState.allWords[index] : null;
        })
        .filter((w): w is string => w !== null);

      // Determine correct and incorrect
      const correct: string[] = [];
      const incorrect: string[] = [];

      for (const word of selectedWords) {
        if (pingState.categoryWords.includes(word)) {
          correct.push(word);
        } else {
          incorrect.push(word);
        }
      }

      const newState: PingState = {
        ...pingState,
        selectedWords,
        correctWords: correct,
        incorrectWords: incorrect,
        round: pingState.round + 1,
      };

      return {
        step: state.step + 1,
        done: true, // PING is typically one round
        data: newState,
      };
    }

    return state;
  },

  async summarize(
    ctx: GameContext,
    state: GameState
  ): Promise<GameResultSummary> {
    const pingState = state.data as PingState;

    const correctCount = pingState.correctWords.length;
    const incorrectCount = pingState.incorrectWords.length;
    const totalSelected = pingState.selectedWords.length;

    // Calculate precision and recall
    const categoryWordsInSet = pingState.allWords.filter((w) =>
      pingState.categoryWords.includes(w)
    ).length;

    const precision =
      totalSelected > 0 ? (correctCount / totalSelected) * 100 : 0;
    const recall =
      categoryWordsInSet > 0 ? (correctCount / categoryWordsInSet) * 100 : 0;

    // F1 score as final score
    const f1 =
      precision + recall > 0
        ? (2 * precision * recall) / (precision + recall)
        : 0;

    const finalScore = Math.round(f1);
    const accuracy = Math.round(precision);

    // Skill signals
    const skillSignals: Record<string, number> = {
      executive: finalScore, // Executive filtering ability
      precision: accuracy, // Accuracy of selections
      recall: Math.round(recall), // Completeness of selection
    };

    return {
      score: finalScore,
      durationMs: 0,
      accuracy,
      skillSignals,
      metadata: {
        category: pingState.category,
        correct: correctCount,
        incorrect: incorrectCount,
        total: totalSelected,
        precision: Math.round(precision),
        recall: Math.round(recall),
      },
    };
  },

  uiSchema: {
    layout: 'grid',
    input: 'tap-many',
    feedback: 'score-bar',
    animation: 'pulse',
    cardStyle: 'word',
  },
};
