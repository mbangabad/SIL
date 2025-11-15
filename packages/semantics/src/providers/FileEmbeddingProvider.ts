/**
 * File-based Embedding Provider
 *
 * Loads word embeddings from files (GloVe, Word2Vec, FastText formats)
 * Supports lazy loading and memory-efficient access
 */

import { readFileSync } from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import type { WordEmbedding, EmbeddingProvider } from '../types';

export interface FileEmbeddingConfig {
  /** Path to embeddings file */
  filePath: string;
  /** Format: 'glove', 'word2vec', 'fasttext' */
  format: 'glove' | 'word2vec' | 'fasttext';
  /** Dimension of embeddings (e.g., 50, 100, 300) */
  dimension: number;
  /** Language code */
  language?: string;
  /** Max words to load (for memory management) */
  maxWords?: number;
  /** Whether to normalize vectors */
  normalize?: boolean;
}

/**
 * File-based embedding provider
 * Loads embeddings from disk
 */
export class FileEmbeddingProvider implements EmbeddingProvider {
  private embeddings: Map<string, number[]> = new Map();
  private config: FileEmbeddingConfig;
  private loaded: boolean = false;
  private loading: Promise<void> | null = null;

  constructor(config: FileEmbeddingConfig) {
    this.config = {
      language: 'en',
      normalize: true,
      ...config,
    };
  }

  /**
   * Load embeddings from file
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    if (this.loading) return this.loading;

    this.loading = this._loadFromFile();
    await this.loading;
    this.loaded = true;
    this.loading = null;
  }

  private async _loadFromFile(): Promise<void> {
    const { filePath, format, dimension, maxWords } = this.config;

    console.log(`Loading embeddings from ${filePath} (${format} format)...`);

    return new Promise((resolve, reject) => {
      const rl = createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity,
      });

      let lineCount = 0;
      let firstLine = true;

      rl.on('line', (line) => {
        // Skip header line for Word2Vec format
        if (format === 'word2vec' && firstLine) {
          firstLine = false;
          return;
        }

        // Check max words limit
        if (maxWords && lineCount >= maxWords) {
          rl.close();
          return;
        }

        const parts = line.trim().split(' ');
        if (parts.length < dimension + 1) return; // Skip malformed lines

        const word = parts[0].toLowerCase();
        const vector = parts.slice(1, dimension + 1).map(Number);

        // Validate vector
        if (vector.length !== dimension || vector.some(isNaN)) {
          return; // Skip invalid vectors
        }

        // Normalize if configured
        const finalVector = this.config.normalize
          ? this.normalize(vector)
          : vector;

        this.embeddings.set(word, finalVector);
        lineCount++;

        if (lineCount % 10000 === 0) {
          console.log(`Loaded ${lineCount} embeddings...`);
        }
      });

      rl.on('close', () => {
        console.log(`Finished loading ${this.embeddings.size} embeddings`);
        resolve();
      });

      rl.on('error', (error) => {
        console.error('Error loading embeddings:', error);
        reject(error);
      });
    });
  }

  async getEmbedding(
    word: string,
    language: string = 'en'
  ): Promise<WordEmbedding | null> {
    // Ensure embeddings are loaded
    await this.load();

    const normalizedWord = word.toLowerCase();
    const vector = this.embeddings.get(normalizedWord);

    if (!vector) {
      return null;
    }

    return {
      word: normalizedWord,
      vector,
      language: language || this.config.language || 'en',
    };
  }

  async hasEmbedding(word: string, language?: string): Promise<boolean> {
    await this.load();
    return this.embeddings.has(word.toLowerCase());
  }

  /**
   * Get statistics about loaded embeddings
   */
  getStats() {
    return {
      count: this.embeddings.size,
      dimension: this.config.dimension,
      format: this.config.format,
      loaded: this.loaded,
    };
  }

  /**
   * Normalize vector to unit length
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(
      vector.reduce((sum, val) => sum + val * val, 0)
    );

    if (magnitude === 0) return vector;

    return vector.map((val) => val / magnitude);
  }

  /**
   * Clear embeddings from memory
   */
  clear(): void {
    this.embeddings.clear();
    this.loaded = false;
  }
}
