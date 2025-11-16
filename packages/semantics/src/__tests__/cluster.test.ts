/**
 * Tests for cluster analysis functions
 */

import { describe, it, expect } from 'vitest';
import {
  calculateClusterCenter,
  calculateClusterHeat,
  calculateClusterHeatFromVector,
  normalizeVector,
} from '../cluster';
import { embeddingService } from '../embeddings';

describe('normalizeVector', () => {
  it('should normalize vector to unit length', () => {
    const vec = [3, 4]; // Length 5
    const result = normalizeVector(vec);

    expect(result[0]).toBeCloseTo(0.6, 5);
    expect(result[1]).toBeCloseTo(0.8, 5);

    // Check magnitude is 1
    const magnitude = Math.sqrt(result[0] ** 2 + result[1] ** 2);
    expect(magnitude).toBeCloseTo(1, 5);
  });

  it('should handle zero vector', () => {
    const vec = [0, 0, 0];
    const result = normalizeVector(vec);

    expect(result).toEqual([0, 0, 0]);
  });

  it('should handle negative values', () => {
    const vec = [-3, 4];
    const result = normalizeVector(vec);

    expect(result[0]).toBeCloseTo(-0.6, 5);
    expect(result[1]).toBeCloseTo(0.8, 5);
  });

  it('should handle unit vector', () => {
    const vec = [1, 0, 0];
    const result = normalizeVector(vec);

    expect(result).toEqual([1, 0, 0]);
  });
});

describe('calculateClusterCenter', () => {
  it('should calculate centroid of word vectors', async () => {
    const words = ['ocean', 'sea', 'wave'];

    // Mock embeddings
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.9, 0.1, 0],
        wave: [0.8, 0.2, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateClusterCenter(words);

    // Average should be around [0.9, 0.1, 0]
    expect(result.centroid).toHaveLength(3);
    expect(result.centroid[0]).toBeCloseTo(0.9, 1);
    expect(result.centroid[1]).toBeCloseTo(0.1, 1);
    expect(result.words).toEqual(words);
  });

  it('should handle empty word list', async () => {
    const words: string[] = [];

    const result = await calculateClusterCenter(words);

    expect(result.centroid).toEqual([]);
    expect(result.words).toEqual([]);
  });

  it('should skip words without embeddings', async () => {
    const words = ['ocean', 'unknownword', 'sea'];

    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.8, 0.2, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateClusterCenter(words);

    // Should calculate center using only found words
    expect(result.centroid).toHaveLength(3);
    expect(result.words).toEqual(['ocean', 'sea']); // Only valid words
  });

  it('should normalize cluster center', async () => {
    const words = ['ocean'];

    embeddingService.getEmbedding = async (w: string) => {
      return w === 'ocean' ? { word: w, vector: [3, 4, 0] } : null;
    };

    const result = await calculateClusterCenter(words);

    // Should be normalized
    const magnitude = Math.sqrt(
      result.centroid.reduce((sum, val) => sum + val * val, 0)
    );
    expect(magnitude).toBeCloseTo(1, 5);
  });
});

describe('calculateClusterHeat', () => {
  it('should return high heat for word close to cluster', async () => {
    const word = 'tide';
    const clusterWords = ['ocean', 'sea', 'wave'];

    // Mock embeddings - tide is very similar
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.95, 0.1, 0],
        wave: [0.9, 0.2, 0],
        tide: [0.92, 0.15, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateClusterHeat(word, clusterWords);

    expect(result.heat).toBeGreaterThan(0.8);
    expect(result.word).toBe(word);
    expect(result.clusterCenter).toBeDefined();
  });

  it('should return low heat for word far from cluster', async () => {
    const word = 'desert';
    const clusterWords = ['ocean', 'sea', 'wave'];

    // Mock embeddings - desert is dissimilar
    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.95, 0.1, 0],
        wave: [0.9, 0.2, 0],
        desert: [0, 1, 0], // Orthogonal
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateClusterHeat(word, clusterWords);

    expect(result.heat).toBeLessThan(0.5);
  });

  it('should return 0 heat if word not found', async () => {
    const word = 'unknownword';
    const clusterWords = ['ocean', 'sea'];

    embeddingService.getEmbedding = async (w: string) => {
      const vectors: Record<string, number[]> = {
        ocean: [1, 0, 0],
        sea: [0.95, 0.1, 0],
      };
      return vectors[w] ? { word: w, vector: vectors[w] } : null;
    };

    const result = await calculateClusterHeat(word, clusterWords);

    expect(result.heat).toBe(0);
    expect(result.word).toBe(word);
  });
});

describe('calculateClusterHeatFromVector', () => {
  it('should calculate heat from pre-computed vector', async () => {
    const word = 'wave';
    const targetVector = [1, 0, 0]; // Ocean-like vector

    embeddingService.getEmbedding = async (w: string) => {
      return w === 'wave' ? { word: w, vector: [0.9, 0.1, 0] } : null;
    };

    const result = await calculateClusterHeatFromVector(word, targetVector);

    expect(result.heat).toBeGreaterThan(0.8);
    expect(result.word).toBe(word);
    expect(result.clusterCenter).toEqual(targetVector);
  });

  it('should return 0 if word not found', async () => {
    const word = 'unknownword';
    const targetVector = [1, 0, 0];

    embeddingService.getEmbedding = async () => null;

    const result = await calculateClusterHeatFromVector(word, targetVector);

    expect(result.heat).toBe(0);
  });

  it('should handle zero target vector', async () => {
    const word = 'ocean';
    const targetVector = [0, 0, 0];

    embeddingService.getEmbedding = async (w: string) => {
      return w === 'ocean' ? { word: w, vector: [1, 0, 0] } : null;
    };

    const result = await calculateClusterHeatFromVector(word, targetVector);

    // Zero vector should give 0 heat
    expect(result.heat).toBe(0);
  });
});
