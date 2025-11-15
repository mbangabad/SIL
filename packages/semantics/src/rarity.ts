/**
 * Rarity Scoring
 *
 * Calculate how rare/uncommon a word is based on:
 * - Frequency (inverse log frequency)
 * - Pattern compliance (e.g., specific letter patterns)
 * - Phonetic complexity
 */

import type { RarityResult } from './types';
import { embeddingService } from './embeddings';

/**
 * Calculate rarity score based on word frequency
 *
 * @param word - Word to score
 * @param language - Language code
 * @returns Rarity score (0-100, higher = rarer)
 */
export async function calculateFrequencyRarity(
  word: string,
  language: string = 'en'
): Promise<number> {
  const embedding = await embeddingService.getEmbedding(word, language);

  if (!embedding || !embedding.metadata?.frequency) {
    // If no frequency data, use length as proxy
    return calculateLengthRarity(word);
  }

  const frequency = embedding.metadata.frequency;

  // Inverse log frequency
  // Common words (high frequency) → low rarity
  // Rare words (low frequency) → high rarity
  const logFreq = Math.log10(frequency + 1);
  const maxLogFreq = 6; // Assume max frequency ~1M
  const rarity = 100 * (1 - logFreq / maxLogFreq);

  return Math.max(0, Math.min(100, rarity));
}

/**
 * Calculate rarity based on word length
 * Longer words are generally rarer
 *
 * @param word - Word to score
 * @returns Rarity score (0-100)
 */
export function calculateLengthRarity(word: string): number {
  const length = word.length;

  // Typical word length is 5-6
  // Rarity increases for very short or very long words
  let rarity: number;

  if (length <= 3) {
    rarity = 20; // Very short words are common
  } else if (length <= 5) {
    rarity = 30; // Short words are somewhat common
  } else if (length <= 7) {
    rarity = 50; // Average length
  } else if (length <= 10) {
    rarity = 70; // Longer words are rarer
  } else {
    rarity = 90; // Very long words are very rare
  }

  return rarity;
}

/**
 * Check if a word matches a specific pattern
 * Patterns use a simple notation:
 * - V = vowel (a, e, i, o, u)
 * - C = consonant (any non-vowel letter)
 *
 * @param word - Word to check
 * @param pattern - Pattern string (e.g., "CVCVC")
 * @returns True if word matches pattern
 */
export function matchesPattern(word: string, pattern: string): boolean {
  if (word.length !== pattern.length) {
    return false;
  }

  const vowels = new Set(['a', 'e', 'i', 'o', 'u']);
  const wordLower = word.toLowerCase();

  for (let i = 0; i < word.length; i++) {
    const char = wordLower[i];
    const patternChar = pattern[i];

    const isVowel = vowels.has(char);

    if (patternChar === 'V' && !isVowel) {
      return false;
    }

    if (patternChar === 'C' && isVowel) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate rarity score for a word with pattern constraint
 * Words that match rare patterns get higher scores
 *
 * @param word - Word to score
 * @param pattern - Required pattern (optional)
 * @param language - Language code
 * @returns Rarity result
 */
export async function calculateRarity(
  word: string,
  pattern?: string,
  language: string = 'en'
): Promise<RarityResult> {
  // Base rarity from frequency
  let rarityScore = await calculateFrequencyRarity(word, language);

  // Pattern compliance bonus
  let patternMatch = true;
  if (pattern) {
    patternMatch = matchesPattern(word, pattern);

    if (!patternMatch) {
      // Word doesn't match required pattern
      rarityScore = 0;
    } else {
      // Boost score for pattern compliance
      rarityScore = Math.min(100, rarityScore * 1.2);
    }
  }

  return {
    rarityScore: Math.round(rarityScore),
    patternMatch,
  };
}

/**
 * Find all words matching a pattern from a list
 *
 * @param words - List of words
 * @param pattern - Pattern to match
 * @returns Words matching the pattern
 */
export function filterByPattern(words: string[], pattern: string): string[] {
  return words.filter((word) => matchesPattern(word, pattern));
}

/**
 * Calculate phonetic complexity score
 * More complex phonetic structures are rarer
 *
 * @param word - Word to analyze
 * @returns Complexity score (0-100)
 */
export function calculatePhoneticComplexity(word: string): number {
  const wordLower = word.toLowerCase();
  let complexity = 0;

  // Factor 1: Consonant clusters
  const consonantClusterRegex = /[bcdfghjklmnpqrstvwxyz]{3,}/g;
  const clusters = wordLower.match(consonantClusterRegex) || [];
  complexity += clusters.length * 20;

  // Factor 2: Unusual letter combinations
  const unusualCombos = ['xz', 'qx', 'jq', 'vw', 'wv'];
  for (const combo of unusualCombos) {
    if (wordLower.includes(combo)) {
      complexity += 15;
    }
  }

  // Factor 3: Silent letters (estimated)
  const silentPatterns = ['kn', 'gn', 'mb', 'wr', 'gh'];
  for (const pattern of silentPatterns) {
    if (wordLower.includes(pattern)) {
      complexity += 10;
    }
  }

  return Math.min(100, complexity);
}

/**
 * Generate list of words matching a pattern
 * (Placeholder - in production would query word database)
 *
 * @param pattern - Pattern to match
 * @param count - Number of words to generate
 * @returns List of matching words
 */
export function generateWordsForPattern(
  pattern: string,
  count: number = 10
): string[] {
  // Placeholder implementation
  // In production, this would query a word database
  const words: string[] = [];

  const vowels = ['a', 'e', 'i', 'o', 'u'];
  const consonants = [
    'b',
    'c',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'm',
    'n',
    'p',
    'q',
    'r',
    's',
    't',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];

  for (let i = 0; i < count; i++) {
    let word = '';

    for (const char of pattern) {
      if (char === 'V') {
        word += vowels[Math.floor(Math.random() * vowels.length)];
      } else if (char === 'C') {
        word += consonants[Math.floor(Math.random() * consonants.length)];
      }
    }

    words.push(word);
  }

  return words;
}
