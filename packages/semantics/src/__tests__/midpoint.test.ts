/**
 * Tests for midpoint calculation functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateMidpointVector,
  findBestMidpoint,
  scoreMidpointCandidate,
} from '../midpoint';
import { embeddingService } from '../embeddings';

describe('calculateMidpointVector', () => {
  it('should calculate midpoint between two vectors', () => {
    const vecA = [1, 0, 0];
    const vecB = [0, 1, 0];

    const result = calculateMidpointVector(vecA, vecB);

    // Midpoint should be average, then normalized
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(0.707, 2); // 1/sqrt(2)
    expect(result[1]).toBeCloseTo(0.707, 2);
    expect(result[2]).toBeCloseTo(0, 5);

    // Should be normalized
    const magnitude = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('should handle identical vectors', () => {
    const vec = [1, 2, 3];

    const result = calculateMidpointVector(vec, vec);

    // Midpoint of identical vectors should be same direction
    expect(result[0]).toBeCloseTo(vec[0] / Math.sqrt(14), 5);
    expect(result[1]).toBeCloseTo(vec[1] / Math.sqrt(14), 5);
    expect(result[2]).toBeCloseTo(vec[3] / Math.sqrt(14), 5);
  });

  it('should handle opposite vectors', () => {
    const vecA = [1, 0, 0];
    const vecB = [-1, 0, 0];

    const result = calculateMidpointVector(vecA, vecB);

    // Opposite vectors should give zero or near-zero result
    expect(Math.abs(result[0])).toBeLessThan(0.1);
  });

  it('should throw error for mismatched dimensions', () => {
    const vecA = [1, 2, 3];
    const vecB = [1, 2];

    expect(() => calculateMidpointVector(vecA, vecB)).toThrow('same dimension');
  });
});

describe('scoreMidpointCandidate', () => {
  it('should give high score to word equidistant from both anchors', async () => {
    const candidate = 'coast';
    const wordA = 'ocean';
    const wordB = 'land';

    // Mock embeddings - coast is midpoint
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        land: [0, 1, 0],
        coast: [0.7, 0.7, 0], // Roughly equidistant
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await scoreMidpointCandidate(candidate, wordA, wordB);

    expect(result.score).toBeGreaterThan(0.6);
    expect(result.balanceScore).toBeGreaterThan(0.8); // Should be well-balanced
  });

  it('should give low score to word close to one anchor', async () => {
    const candidate = 'wave';
    const wordA = 'ocean';
    const wordB = 'desert';

    // Mock embeddings - wave is close to ocean
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        desert: [0, 1, 0],
        wave: [0.95, 0.1, 0], // Very close to ocean
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await scoreMidpointCandidate(candidate, wordA, wordB);

    expect(result.balanceScore).toBeLessThan(0.5); // Imbalanced
  });

  it('should return 0 score if embeddings not found', async () => {
    const candidate = 'unknown';
    const wordA = 'ocean';
    const wordB = 'land';

    embeddingService.getEmbedding = async () => null;

    const result = await scoreMidpointCandidate(candidate, wordA, wordB);

    expect(result.score).toBe(0);
    expect(result.balanceScore).toBe(0);
  });
});

describe('findBestMidpoint', () => {
  it('should find best midpoint from candidates', async () => {
    const wordA = 'hot';
    const wordB = 'cold';
    const candidates = ['warm', 'freezing', 'boiling'];

    // Mock embeddings
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        hot: [1, 0, 0],
        cold: [-1, 0, 0],
        warm: [0.1, 0, 0], // Best midpoint
        freezing: [-0.9, 0, 0], // Close to cold
        boiling: [0.9, 0, 0], // Close to hot
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await findBestMidpoint(wordA, wordB, candidates);

    expect(result.word).toBe('warm');
    expect(result.score).toBeGreaterThan(0.5);
  });

  it('should return candidate with highest balance score', async () => {
    const wordA = 'day';
    const wordB = 'night';
    const candidates = ['dawn', 'noon', 'midnight'];

    // Mock embeddings
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        day: [1, 0, 0],
        night: [-1, 0, 0],
        dawn: [0, 0.5, 0], // Most balanced
        noon: [0.8, 0, 0], // Close to day
        midnight: [-0.8, 0, 0], // Close to night
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await findBestMidpoint(wordA, wordB, candidates);

    expect(result.word).toBe('dawn');
  });

  it('should skip candidates without embeddings', async () => {
    const wordA = 'start';
    const wordB = 'end';
    const candidates = ['middle', 'unknown', 'center'];

    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        start: [1, 0, 0],
        end: [0, 1, 0],
        middle: [0.5, 0.5, 0],
        center: [0.4, 0.6, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await findBestMidpoint(wordA, wordB, candidates);

    // Should still find a result despite 'unknown' missing
    expect(['middle', 'center']).toContain(result.word);
  });

  it('should handle empty candidates list', async () => {
    const wordA = 'start';
    const wordB = 'end';
    const candidates: string[] = [];

    const result = await findBestMidpoint(wordA, wordB, candidates);

    expect(result.word).toBe('');
    expect(result.score).toBe(0);
  });
});
