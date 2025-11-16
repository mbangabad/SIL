/**
 * Tests for similarity scoring functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  cosineSimilarity,
  calculateSimilarity,
  calculateSimilarityToVector,
  calculateAverageSimilarity,
  findMostSimilar,
  calculatePercentile,
} from '../similarity';
import { embeddingService } from '../embeddings';

describe('cosineSimilarity', () => {
  it('should return 1 for identical vectors', () => {
    const vec = [1, 2, 3, 4, 5];
    const result = cosineSimilarity(vec, vec);
    expect(result).toBe(1);
  });

  it('should return 0 for orthogonal vectors', () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];
    const result = cosineSimilarity(vecA, vecB);
    expect(result).toBe(0);
  });

  it('should return value between 0 and 1 for similar vectors', () => {
    const vecA = [1, 2, 3];
    const vecB = [2, 3, 4];
    const result = cosineSimilarity(vecA, vecB);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should handle negative vectors correctly', () => {
    const vecA = [1, 2, 3];
    const vecB = [-1, -2, -3];
    const result = cosineSimilarity(vecA, vecB);
    // Opposite vectors should give 0 (clamped from negative)
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(0.1);
  });

  it('should return 0 for zero magnitude vectors', () => {
    const vecA = [0, 0, 0];
    const vecB = [1, 2, 3];
    const result = cosineSimilarity(vecA, vecB);
    expect(result).toBe(0);
  });

  it('should throw error for vectors of different lengths', () => {
    const vecA = [1, 2, 3];
    const vecB = [1, 2];
    expect(() => cosineSimilarity(vecA, vecB)).toThrow('Vectors must have same dimension');
  });

  it('should be commutative', () => {
    const vecA = [1, 2, 3, 4];
    const vecB = [5, 6, 7, 8];
    const resultAB = cosineSimilarity(vecA, vecB);
    const resultBA = cosineSimilarity(vecB, vecA);
    expect(resultAB).toBe(resultBA);
  });

  it('should handle unit vectors correctly', () => {
    const vecA = [1, 0];
    const vecB = [0.707, 0.707]; // 45 degree angle
    const result = cosineSimilarity(vecA, vecB);
    expect(result).toBeCloseTo(0.707, 2);
  });
});

describe('calculatePercentile', () => {
  it('should return 50 for empty reference scores', () => {
    const result = calculatePercentile(50, []);
    expect(result).toBe(50);
  });

  it('should return 0 for lowest score', () => {
    const referenceScores = [10, 20, 30, 40, 50];
    const result = calculatePercentile(5, referenceScores);
    expect(result).toBe(0);
  });

  it('should return 100 for highest score', () => {
    const referenceScores = [10, 20, 30, 40, 50];
    const result = calculatePercentile(60, referenceScores);
    expect(result).toBe(100);
  });

  it('should return 50 for median score', () => {
    const referenceScores = [10, 20, 30, 40, 50];
    const result = calculatePercentile(30, referenceScores);
    expect(result).toBe(40); // 2 out of 5 are lower = 40%
  });

  it('should handle duplicate scores', () => {
    const referenceScores = [10, 10, 10, 20, 20];
    const result = calculatePercentile(15, referenceScores);
    expect(result).toBe(60); // 3 out of 5 are lower
  });

  it('should round to nearest integer', () => {
    const referenceScores = [1, 2, 3];
    const result = calculatePercentile(2.5, referenceScores);
    expect(Number.isInteger(result)).toBe(true);
  });
});

describe('calculateSimilarityToVector', () => {
  it('should calculate similarity between word and vector', async () => {
    const word = 'ocean';
    const targetVector = [0.1, 0.2, 0.3]; // Simple test vector

    // Mock embedding
    const mockEmbedding = { word: 'ocean', vector: [0.1, 0.2, 0.3] };
    embeddingService.getEmbedding = async () => mockEmbedding;

    const result = await calculateSimilarityToVector(word, targetVector);

    expect(result).toHaveProperty('score');
    expect(result.score).toBe(1); // Identical vectors
  });

  it('should throw error if word not found', async () => {
    const word = 'unknownword123';
    const targetVector = [0.1, 0.2, 0.3];

    embeddingService.getEmbedding = async () => null;

    await expect(calculateSimilarityToVector(word, targetVector)).rejects.toThrow(
      'Could not find embedding'
    );
  });
});

describe('calculateAverageSimilarity', () => {
  it('should calculate average similarity correctly', async () => {
    const word = 'ocean';
    const words = ['sea', 'wave', 'tide'];

    // Mock embeddings
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.9, 0.1, 0],
        wave: [0.8, 0.2, 0],
        tide: [0.7, 0.3, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateAverageSimilarity(word, words);

    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should handle words without embeddings gracefully', async () => {
    const word = 'ocean';
    const words = ['sea', 'unknownword'];

    embeddingService.getEmbedding = async (w: string) => {
      if (w === 'ocean') return { word: w, vector: [1, 0, 0] };
      if (w === 'sea') return { word: w, vector: [0.9, 0.1, 0] };
      return null;
    };

    const result = await calculateAverageSimilarity(word, words);

    // Should still calculate average despite one missing word
    expect(result).toBeGreaterThan(0);
  });
});

describe('findMostSimilar', () => {
  it('should find most similar word from candidates', async () => {
    const targetWord = 'ocean';
    const candidates = ['desert', 'sea', 'mountain'];

    // Mock embeddings with ocean closest to sea
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.95, 0.05, 0],
        desert: [0, 1, 0],
        mountain: [0, 0, 1],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await findMostSimilar(targetWord, candidates);

    expect(result.word).toBe('sea');
    expect(result.score).toBeGreaterThan(0.9);
  });

  it('should return first candidate if target not found', async () => {
    const targetWord = 'unknownword';
    const candidates = ['word1', 'word2'];

    embeddingService.getEmbedding = async () => null;

    await expect(findMostSimilar(targetWord, candidates)).rejects.toThrow();
  });

  it('should skip candidates without embeddings', async () => {
    const targetWord = 'ocean';
    const candidates = ['unknownword', 'sea'];

    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.9, 0.1, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await findMostSimilar(targetWord, candidates);

    expect(result.word).toBe('sea');
  });
});
