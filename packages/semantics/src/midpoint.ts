/**
 * Midpoint Scoring
 *
 * Calculate how close a word is to the semantic midpoint between two anchor words
 * Used in games like SPAN where players find bridging concepts
 */

import type { MidpointResult } from './types';
import { embeddingService } from './embeddings';
import { cosineSimilarity } from './similarity';

/**
 * Calculate the midpoint vector between two vectors
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Midpoint vector (normalized)
 */
export function calculateMidpointVector(
  vecA: number[],
  vecB: number[]
): number[] {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have same dimension');
  }

  const midpoint: number[] = [];

  for (let i = 0; i < vecA.length; i++) {
    midpoint.push((vecA[i] + vecB[i]) / 2);
  }

  // Normalize midpoint vector
  return normalizeVector(midpoint);
}

/**
 * Normalize a vector to unit length
 */
function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  if (magnitude === 0) {
    return vector;
  }

  return vector.map((val) => val / magnitude);
}

/**
 * Calculate how close a word is to the midpoint between two anchors
 *
 * @param word - Word to evaluate
 * @param anchorA - First anchor word
 * @param anchorB - Second anchor word
 * @param language - Language code
 * @returns Midpoint result with score
 */
export async function calculateMidpointScore(
  word: string,
  anchorA: string,
  anchorB: string,
  language: string = 'en'
): Promise<MidpointResult> {
  // Get embeddings for all words
  const [wordEmb, anchorAEmb, anchorBEmb] = await Promise.all([
    embeddingService.getEmbedding(word, language),
    embeddingService.getEmbedding(anchorA, language),
    embeddingService.getEmbedding(anchorB, language),
  ]);

  if (!wordEmb || !anchorAEmb || !anchorBEmb) {
    throw new Error(
      `Could not find embeddings for "${word}", "${anchorA}", or "${anchorB}"`
    );
  }

  // Calculate midpoint vector
  const midpointVec = calculateMidpointVector(
    anchorAEmb.vector,
    anchorBEmb.vector
  );

  // Calculate similarity to midpoint
  const score = cosineSimilarity(wordEmb.vector, midpointVec);

  // Calculate distances to each anchor
  const distanceA = 1 - cosineSimilarity(wordEmb.vector, anchorAEmb.vector);
  const distanceB = 1 - cosineSimilarity(wordEmb.vector, anchorBEmb.vector);

  return {
    score,
    distanceA,
    distanceB,
  };
}

/**
 * Calculate balance score
 * How equally distant is the word from both anchors?
 * Returns 1.0 for perfect balance, lower for imbalanced
 *
 * @param word - Word to evaluate
 * @param anchorA - First anchor word
 * @param anchorB - Second anchor word
 * @param language - Language code
 * @returns Balance score (0-1)
 */
export async function calculateBalanceScore(
  word: string,
  anchorA: string,
  anchorB: string,
  language: string = 'en'
): Promise<number> {
  const [wordEmb, anchorAEmb, anchorBEmb] = await Promise.all([
    embeddingService.getEmbedding(word, language),
    embeddingService.getEmbedding(anchorA, language),
    embeddingService.getEmbedding(anchorB, language),
  ]);

  if (!wordEmb || !anchorAEmb || !anchorBEmb) {
    throw new Error('Could not find embeddings');
  }

  const simA = cosineSimilarity(wordEmb.vector, anchorAEmb.vector);
  const simB = cosineSimilarity(wordEmb.vector, anchorBEmb.vector);

  // Calculate how balanced the similarities are
  // Perfect balance: simA ≈ simB → balance score = 1.0
  // Imbalanced: large difference → balance score closer to 0
  const diff = Math.abs(simA - simB);
  const balanceScore = 1 - diff;

  return Math.max(0, balanceScore);
}

/**
 * Find best midpoint word from a list of candidates
 *
 * @param candidates - List of candidate words
 * @param anchorA - First anchor word
 * @param anchorB - Second anchor word
 * @param language - Language code
 * @returns Best candidate and its score
 */
export async function findBestMidpoint(
  candidates: string[],
  anchorA: string,
  anchorB: string,
  language: string = 'en'
): Promise<{ word: string; score: number }> {
  let bestWord = candidates[0];
  let bestScore = 0;

  for (const candidate of candidates) {
    try {
      const result = await calculateMidpointScore(
        candidate,
        anchorA,
        anchorB,
        language
      );

      if (result.score > bestScore) {
        bestScore = result.score;
        bestWord = candidate;
      }
    } catch (error) {
      // Skip words without embeddings
      continue;
    }
  }

  return { word: bestWord, score: bestScore };
}

/**
 * Generate a semantic path between two anchors
 * Returns intermediate words that form a chain from A to B
 *
 * @param anchorA - Starting word
 * @param anchorB - Ending word
 * @param steps - Number of intermediate steps
 * @param candidates - Pool of candidate words
 * @param language - Language code
 * @returns Array of words forming the path
 */
export async function generateSemanticPath(
  anchorA: string,
  anchorB: string,
  steps: number,
  candidates: string[],
  language: string = 'en'
): Promise<string[]> {
  const path: string[] = [anchorA];

  // Get anchor embeddings
  const [anchorAEmb, anchorBEmb] = await Promise.all([
    embeddingService.getEmbedding(anchorA, language),
    embeddingService.getEmbedding(anchorB, language),
  ]);

  if (!anchorAEmb || !anchorBEmb) {
    throw new Error('Could not find anchor embeddings');
  }

  // For each step, find the candidate closest to the interpolated position
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1); // Interpolation factor

    // Interpolate between anchors
    const targetVec: number[] = [];
    for (let j = 0; j < anchorAEmb.vector.length; j++) {
      targetVec.push(
        anchorAEmb.vector[j] * (1 - t) + anchorBEmb.vector[j] * t
      );
    }

    // Find closest candidate to target
    let bestWord = '';
    let bestSim = -1;

    for (const candidate of candidates) {
      // Skip already used words
      if (path.includes(candidate)) continue;

      const candEmb = await embeddingService.getEmbedding(candidate, language);
      if (!candEmb) continue;

      const sim = cosineSimilarity(candEmb.vector, targetVec);

      if (sim > bestSim) {
        bestSim = sim;
        bestWord = candidate;
      }
    }

    if (bestWord) {
      path.push(bestWord);
    }
  }

  path.push(anchorB);
  return path;
}
