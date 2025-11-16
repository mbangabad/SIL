/**
 * Similarity Scoring
 *
 * Calculate semantic similarity between words using cosine similarity
 */

import type { SimilarityResult } from './types';
import { embeddingService } from './embeddings';

/**
 * Calculate cosine similarity between two vectors
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Cosine similarity (0-1, where 1 is identical)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimension');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitude === 0) {
    return 0;
  }

  // Clamp to [0, 1] range
  return Math.max(0, Math.min(1, dotProduct / magnitude));
}

/**
 * Calculate similarity between two words
 *
 * @param wordA - First word
 * @param wordB - Second word
 * @param language - Language code
 * @returns Similarity result with score
 */
export async function calculateSimilarity(
  wordA: string,
  wordB: string,
  language: string = 'en'
): Promise<SimilarityResult> {
  const [embeddingA, embeddingB] = await Promise.all([
    embeddingService.getEmbedding(wordA, language),
    embeddingService.getEmbedding(wordB, language),
  ]);

  if (!embeddingA || !embeddingB) {
    throw new Error(
      `Could not find embeddings for "${wordA}" or "${wordB}"`
    );
  }

  const score = cosineSimilarity(embeddingA.vector, embeddingB.vector);

  return { score };
}

/**
 * Calculate similarity between a word and a target vector
 *
 * @param word - Word to compare
 * @param targetVector - Target vector (theme, cluster center, etc.)
 * @param language - Language code
 * @returns Similarity result
 */
export async function calculateSimilarityToVector(
  word: string,
  targetVector: number[],
  language: string = 'en'
): Promise<SimilarityResult> {
  const embedding = await embeddingService.getEmbedding(word, language);

  if (!embedding) {
    throw new Error(`Could not find embedding for "${word}"`);
  }

  const score = cosineSimilarity(embedding.vector, targetVector);

  return { score };
}

/**
 * Calculate average similarity of a word to a set of words
 * Useful for cluster/theme scoring
 *
 * @param word - Word to compare
 * @param words - Set of words to compare against
 * @param language - Language code
 * @returns Average similarity score
 */
export async function calculateAverageSimilarity(
  word: string,
  words: string[],
  language: string = 'en'
): Promise<number> {
  const wordEmbedding = await embeddingService.getEmbedding(word, language);

  if (!wordEmbedding) {
    throw new Error(`Could not find embedding for "${word}"`);
  }

  const similarities = await Promise.all(
    words.map(async (w) => {
      const emb = await embeddingService.getEmbedding(w, language);
      if (!emb) return 0;
      return cosineSimilarity(wordEmbedding.vector, emb.vector);
    })
  );

  const sum = similarities.reduce((acc, val) => acc + val, 0);
  return sum / similarities.length;
}

/**
 * Find most similar word from a list
 *
 * @param targetWord - Word to find similarity to
 * @param candidates - List of candidate words
 * @param language - Language code
 * @returns Most similar word and its score
 */
export async function findMostSimilar(
  targetWord: string,
  candidates: string[],
  language: string = 'en'
): Promise<{ word: string; score: number }> {
  const targetEmbedding = await embeddingService.getEmbedding(
    targetWord,
    language
  );

  if (!targetEmbedding) {
    throw new Error(`Could not find embedding for "${targetWord}"`);
  }

  let bestWord = candidates[0];
  let bestScore = 0;

  for (const candidate of candidates) {
    const candidateEmbedding = await embeddingService.getEmbedding(
      candidate,
      language
    );

    if (!candidateEmbedding) continue;

    const score = cosineSimilarity(
      targetEmbedding.vector,
      candidateEmbedding.vector
    );

    if (score > bestScore) {
      bestScore = score;
      bestWord = candidate;
    }
  }

  return { word: bestWord, score: bestScore };
}

/**
 * Calculate percentile rank of a score
 * Given a score and a list of reference scores, determine percentile
 *
 * @param score - Score to rank
 * @param referenceScores - List of reference scores
 * @returns Percentile (0-100)
 */
export function calculatePercentile(
  score: number,
  referenceScores: number[]
): number {
  if (referenceScores.length === 0) return 50;

  const lowerCount = referenceScores.filter((s) => s < score).length;
  const percentile = (lowerCount / referenceScores.length) * 100;

  return Math.round(percentile);
}
