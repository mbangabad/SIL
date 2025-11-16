/**
 * Cluster Heat Scoring
 *
 * Calculate how close a word is to a semantic cluster/theme
 * Used in games like CLUSTER and GRIP
 */

import type { ClusterHeatResult } from './types';
import { embeddingService } from './embeddings';
import { cosineSimilarity } from './similarity';

/**
 * Calculate cluster center vector from a set of words
 *
 * @param words - Words defining the cluster
 * @param language - Language code
 * @returns Cluster center vector (normalized)
 */
export async function calculateClusterCenter(
  words: string[],
  language: string = 'en'
): Promise<number[]> {
  if (words.length === 0) {
    throw new Error('Cannot calculate cluster center from empty word list');
  }

  // Get all embeddings
  const embeddings = await Promise.all(
    words.map((word) => embeddingService.getEmbedding(word, language))
  );

  // Filter out nulls
  const validEmbeddings = embeddings.filter((emb) => emb !== null);

  if (validEmbeddings.length === 0) {
    throw new Error('No valid embeddings found for cluster words');
  }

  // Calculate average vector
  const dim = validEmbeddings[0]!.vector.length;
  const centerVec: number[] = new Array(dim).fill(0);

  for (const emb of validEmbeddings) {
    for (let i = 0; i < dim; i++) {
      centerVec[i] += emb!.vector[i];
    }
  }

  // Average
  for (let i = 0; i < dim; i++) {
    centerVec[i] /= validEmbeddings.length;
  }

  // Normalize
  return normalizeVector(centerVec);
}

/**
 * Normalize a vector to unit length
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((val) => val / magnitude);
}

/**
 * Calculate heat score for a word relative to a cluster
 *
 * @param word - Word to score
 * @param clusterWords - Words defining the cluster
 * @param language - Language code
 * @returns Cluster heat result
 */
export async function calculateClusterHeat(
  word: string,
  clusterWords: string[],
  language: string = 'en'
): Promise<ClusterHeatResult> {
  const wordEmb = await embeddingService.getEmbedding(word, language);

  if (!wordEmb) {
    throw new Error(`Could not find embedding for "${word}"`);
  }

  // Calculate cluster center
  const clusterCenter = await calculateClusterCenter(clusterWords, language);

  // Calculate similarity to cluster center
  const heat = cosineSimilarity(wordEmb.vector, clusterCenter);

  // Distance = 1 - similarity
  const distance = 1 - heat;

  return {
    heat,
    distance,
  };
}

/**
 * Calculate heat score for a word relative to a precomputed cluster vector
 *
 * @param word - Word to score
 * @param clusterVector - Precomputed cluster center vector
 * @param language - Language code
 * @returns Cluster heat result
 */
export async function calculateClusterHeatFromVector(
  word: string,
  clusterVector: number[],
  language: string = 'en'
): Promise<ClusterHeatResult> {
  const wordEmb = await embeddingService.getEmbedding(word, language);

  if (!wordEmb) {
    throw new Error(`Could not find embedding for "${word}"`);
  }

  const heat = cosineSimilarity(wordEmb.vector, clusterVector);
  const distance = 1 - heat;

  return {
    heat,
    distance,
  };
}

/**
 * Rank words by their heat relative to a cluster
 *
 * @param words - Words to rank
 * @param clusterWords - Words defining the cluster
 * @param language - Language code
 * @returns Words sorted by heat (hottest first)
 */
export async function rankByClusterHeat(
  words: string[],
  clusterWords: string[],
  language: string = 'en'
): Promise<Array<{ word: string; heat: number }>> {
  const clusterCenter = await calculateClusterCenter(clusterWords, language);

  const results = await Promise.all(
    words.map(async (word) => {
      try {
        const result = await calculateClusterHeatFromVector(
          word,
          clusterCenter,
          language
        );
        return { word, heat: result.heat };
      } catch (error) {
        return { word, heat: 0 };
      }
    })
  );

  // Sort by heat (descending)
  return results.sort((a, b) => b.heat - a.heat);
}

/**
 * Convert heat to a categorical label
 *
 * @param heat - Heat score (0-1)
 * @returns Label ('freezing', 'cold', 'warm', 'hot', 'burning')
 */
export function heatToLabel(heat: number): string {
  if (heat < 0.2) return 'freezing';
  if (heat < 0.4) return 'cold';
  if (heat < 0.6) return 'warm';
  if (heat < 0.8) return 'hot';
  return 'burning';
}

/**
 * Convert heat to a color gradient (cold = blue, hot = red)
 *
 * @param heat - Heat score (0-1)
 * @returns CSS color string
 */
export function heatToColor(heat: number): string {
  // Interpolate between blue (cold) and red (hot)
  const r = Math.round(heat * 255);
  const b = Math.round((1 - heat) * 255);
  const g = 0;

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Find outliers in a cluster
 * Returns words that are least similar to the cluster center
 *
 * @param words - Words to analyze
 * @param threshold - Heat threshold for outliers (default 0.3)
 * @param language - Language code
 * @returns Outlier words with their heat scores
 */
export async function findOutliers(
  words: string[],
  threshold: number = 0.3,
  language: string = 'en'
): Promise<Array<{ word: string; heat: number }>> {
  // Calculate cluster center from all words
  const clusterCenter = await calculateClusterCenter(words, language);

  const results = await Promise.all(
    words.map(async (word) => {
      const result = await calculateClusterHeatFromVector(
        word,
        clusterCenter,
        language
      );
      return { word, heat: result.heat };
    })
  );

  // Filter outliers (low heat)
  return results.filter((r) => r.heat < threshold);
}

/**
 * Create a themed word set
 * Given a theme word, find similar words from a candidate pool
 *
 * @param themeWord - Central theme word
 * @param candidates - Pool of candidate words
 * @param count - Number of words to return
 * @param language - Language code
 * @returns Themed word set
 */
export async function createThemedWordSet(
  themeWord: string,
  candidates: string[],
  count: number = 9,
  language: string = 'en'
): Promise<string[]> {
  const themeEmb = await embeddingService.getEmbedding(themeWord, language);

  if (!themeEmb) {
    throw new Error(`Could not find embedding for theme word "${themeWord}"`);
  }

  // Calculate similarity for all candidates
  const scored = await Promise.all(
    candidates.map(async (word) => {
      const emb = await embeddingService.getEmbedding(word, language);
      if (!emb) return { word, score: 0 };

      const score = cosineSimilarity(themeEmb.vector, emb.vector);
      return { word, score };
    })
  );

  // Sort by similarity (descending)
  scored.sort((a, b) => b.score - a.score);

  // Return top N
  return scored.slice(0, count).map((s) => s.word);
}
