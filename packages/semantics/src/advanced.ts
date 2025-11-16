/**
 * Advanced Semantic Operations
 *
 * Additional semantic functions for complex game mechanics:
 * - Vector interpolation
 * - Triangle scoring
 * - Gradient tracking
 */

import { embeddingService } from './embeddings';
import { cosineSimilarity } from './similarity';
import { normalizeVector } from './cluster';

/**
 * Interpolate between two word vectors
 *
 * @param wordA - First word
 * @param wordB - Second word
 * @param alpha - Interpolation factor (0 = A, 1 = B)
 * @param language - Language code
 * @returns Interpolated vector
 */
export async function interpolateVectors(
  wordA: string,
  wordB: string,
  alpha: number,
  language: string = 'en'
): Promise<number[] | null> {
  const [embA, embB] = await Promise.all([
    embeddingService.getEmbedding(wordA, language),
    embeddingService.getEmbedding(wordB, language),
  ]);

  if (!embA || !embB) return null;

  // Linear interpolation: result = A + alpha * (B - A)
  const interpolated = embA.vector.map((val, idx) =>
    val + alpha * (embB.vector[idx] - val)
  );

  return normalizeVector(interpolated);
}

/**
 * Calculate triangle score for semantic coherence
 * Triangle formed by three words: anchor, word1, word2
 *
 * @param anchor - Central word
 * @param word1 - First peripheral word
 * @param word2 - Second peripheral word
 * @param language - Language code
 * @returns Triangle strength score (0-1)
 */
export async function calculateTriangleScore(
  anchor: string,
  word1: string,
  word2: string,
  language: string = 'en'
): Promise<number> {
  const [embAnchor, emb1, emb2] = await Promise.all([
    embeddingService.getEmbedding(anchor, language),
    embeddingService.getEmbedding(word1, language),
    embeddingService.getEmbedding(word2, language),
  ]);

  if (!embAnchor || !emb1 || !emb2) return 0;

  // Triangle strength = average of all three edge similarities
  const sim1 = cosineSimilarity(embAnchor.vector, emb1.vector);
  const sim2 = cosineSimilarity(embAnchor.vector, emb2.vector);
  const sim3 = cosineSimilarity(emb1.vector, emb2.vector);

  return (sim1 + sim2 + sim3) / 3;
}

/**
 * Calculate pivot score for a word connecting two anchors
 *
 * @param pivot - Word to evaluate
 * @param anchorA - First anchor
 * @param anchorB - Second anchor
 * @param language - Language code
 * @returns Pivot strength (sum of similarities to both anchors)
 */
export async function calculatePivotScore(
  pivot: string,
  anchorA: string,
  anchorB: string,
  language: string = 'en'
): Promise<number> {
  const [embPivot, embA, embB] = await Promise.all([
    embeddingService.getEmbedding(pivot, language),
    embeddingService.getEmbedding(anchorA, language),
    embeddingService.getEmbedding(anchorB, language),
  ]);

  if (!embPivot || !embA || !embB) return 0;

  const simA = cosineSimilarity(embPivot.vector, embA.vector);
  const simB = cosineSimilarity(embPivot.vector, embB.vector);

  return simA + simB;
}

/**
 * Find nearest word to a target vector from candidates
 *
 * @param targetVector - Target vector
 * @param candidates - List of candidate words
 * @param language - Language code
 * @returns Best match word and score
 */
export async function findNearestToVector(
  targetVector: number[],
  candidates: string[],
  language: string = 'en'
): Promise<{ word: string; score: number }> {
  let bestWord = candidates[0] || '';
  let bestScore = 0;

  for (const word of candidates) {
    const emb = await embeddingService.getEmbedding(word, language);
    if (!emb) continue;

    const score = cosineSimilarity(targetVector, emb.vector);
    if (score > bestScore) {
      bestScore = score;
      bestWord = word;
    }
  }

  return { word: bestWord, score: bestScore };
}

/**
 * Calculate semantic gradient direction vector
 *
 * @param wordA - Start word
 * @param wordB - End word
 * @param language - Language code
 * @returns Normalized gradient direction vector
 */
export async function calculateGradientDirection(
  wordA: string,
  wordB: string,
  language: string = 'en'
): Promise<number[] | null> {
  const [embA, embB] = await Promise.all([
    embeddingService.getEmbedding(wordA, language),
    embeddingService.getEmbedding(wordB, language),
  ]);

  if (!embA || !embB) return null;

  // Direction vector = B - A (normalized)
  const direction = embB.vector.map((val, idx) => val - embA.vector[idx]);
  return normalizeVector(direction);
}

/**
 * Project a point onto a gradient direction
 *
 * @param word - Word to project
 * @param anchorA - Gradient start
 * @param anchorB - Gradient end
 * @param language - Language code
 * @returns Projection value (0 = at A, 1 = at B)
 */
export async function projectOntoGradient(
  word: string,
  anchorA: string,
  anchorB: string,
  language: string = 'en'
): Promise<number> {
  const [embWord, embA, embB] = await Promise.all([
    embeddingService.getEmbedding(word, language),
    embeddingService.getEmbedding(anchorA, language),
    embeddingService.getEmbedding(anchorB, language),
  ]);

  if (!embWord || !embA || !embB) return 0.5;

  // Vector from A to word
  const wordVec = embWord.vector.map((val, idx) => val - embA.vector[idx]);

  // Direction from A to B
  const direction = embB.vector.map((val, idx) => val - embA.vector[idx]);

  // Project wordVec onto direction
  const dotProduct = wordVec.reduce((sum, val, idx) => sum + val * direction[idx], 0);
  const directionMagnitude = Math.sqrt(
    direction.reduce((sum, val) => sum + val * val, 0)
  );

  if (directionMagnitude === 0) return 0.5;

  // Projection length / direction length = position on [0,1]
  const projection = dotProduct / (directionMagnitude * directionMagnitude);

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, projection));
}
