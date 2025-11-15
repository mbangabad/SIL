/**
 * Word Embedding Service
 *
 * Handles loading and accessing word embeddings
 * In production, this would connect to a vector database or load embeddings from disk
 */

import type { WordEmbedding } from './types';

/**
 * Embedding provider interface
 * Allows swapping between different embedding sources
 */
export interface EmbeddingProvider {
  getEmbedding(word: string, language?: string): Promise<WordEmbedding | null>;
  hasEmbedding(word: string, language?: string): Promise<boolean>;
}

/**
 * Mock embedding provider for development
 * Generates deterministic pseudo-embeddings for testing
 *
 * TODO: Replace with actual embedding service (e.g., GloVe, Word2Vec, Sentence-BERT)
 */
export class MockEmbeddingProvider implements EmbeddingProvider {
  private embeddingDim: number;

  constructor(embeddingDim: number = 100) {
    this.embeddingDim = embeddingDim;
  }

  async getEmbedding(
    word: string,
    language: string = 'en'
  ): Promise<WordEmbedding | null> {
    // Generate deterministic pseudo-vector based on word
    const vector = this.generatePseudoVector(word);

    return {
      word: word.toLowerCase(),
      vector,
      language,
      metadata: {
        frequency: this.estimateFrequency(word),
      },
    };
  }

  async hasEmbedding(word: string, language: string = 'en'): Promise<boolean> {
    // In mock mode, we always have embeddings
    return true;
  }

  /**
   * Generate a deterministic pseudo-vector for a word
   * This is NOT a real embedding, just for testing
   */
  private generatePseudoVector(word: string): number[] {
    const vector: number[] = [];
    let seed = 0;

    // Create a seed from the word
    for (let i = 0; i < word.length; i++) {
      seed += word.charCodeAt(i) * (i + 1);
    }

    // Generate deterministic values
    for (let i = 0; i < this.embeddingDim; i++) {
      // Simple pseudo-random based on word and dimension
      const x = Math.sin(seed + i) * 10000;
      vector.push(x - Math.floor(x));
    }

    // Normalize vector
    return this.normalize(vector);
  }

  /**
   * Normalize a vector to unit length
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );
    return vector.map((val) => val / magnitude);
  }

  /**
   * Estimate word frequency (placeholder)
   */
  private estimateFrequency(word: string): number {
    // Simple heuristic: shorter words are generally more frequent
    const baseFreq = Math.max(1, 10 - word.length);
    return baseFreq * 1000;
  }
}

/**
 * Embedding service with caching
 */
export class EmbeddingService {
  private provider: EmbeddingProvider;
  private cache: Map<string, WordEmbedding>;
  private cacheEnabled: boolean;

  constructor(provider: EmbeddingProvider, enableCache: boolean = true) {
    this.provider = provider;
    this.cache = new Map();
    this.cacheEnabled = enableCache;
  }

  /**
   * Get embedding for a word
   */
  async getEmbedding(
    word: string,
    language: string = 'en'
  ): Promise<WordEmbedding | null> {
    const key = `${language}:${word.toLowerCase()}`;

    // Check cache
    if (this.cacheEnabled && this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    // Fetch from provider
    const embedding = await this.provider.getEmbedding(word, language);

    // Store in cache
    if (embedding && this.cacheEnabled) {
      this.cache.set(key, embedding);
    }

    return embedding;
  }

  /**
   * Get embeddings for multiple words
   */
  async getEmbeddings(
    words: string[],
    language: string = 'en'
  ): Promise<Array<WordEmbedding | null>> {
    return Promise.all(
      words.map((word) => this.getEmbedding(word, language))
    );
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size;
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService(
  new MockEmbeddingProvider()
);
