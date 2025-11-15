/**
 * Supabase Embedding Provider
 *
 * Stores and retrieves embeddings from Supabase vector store
 * Uses pgvector extension for efficient similarity search
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { WordEmbedding, EmbeddingProvider } from '../types';

export interface SupabaseEmbeddingConfig {
  supabaseUrl: string;
  supabaseKey: string;
  tableName?: string;
  dimension?: number;
}

/**
 * Supabase-based embedding provider
 * Stores embeddings in Supabase with pgvector
 */
export class SupabaseEmbeddingProvider implements EmbeddingProvider {
  private client: SupabaseClient;
  private tableName: string;
  private cache: Map<string, WordEmbedding> = new Map();

  constructor(config: SupabaseEmbeddingConfig) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey);
    this.tableName = config.tableName || 'word_embeddings';
  }

  async getEmbedding(
    word: string,
    language: string = 'en'
  ): Promise<WordEmbedding | null> {
    const cacheKey = `${language}:${word.toLowerCase()}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Query Supabase
    const { data, error } = await this.client
      .from(this.tableName)
      .select('word, vector, language, metadata')
      .eq('word', word.toLowerCase())
      .eq('language', language)
      .single();

    if (error || !data) {
      return null;
    }

    const embedding: WordEmbedding = {
      word: data.word,
      vector: data.vector,
      language: data.language,
      metadata: data.metadata,
    };

    // Cache result
    this.cache.set(cacheKey, embedding);

    return embedding;
  }

  async hasEmbedding(word: string, language: string = 'en'): Promise<boolean> {
    const { count, error } = await this.client
      .from(this.tableName)
      .select('word', { count: 'exact', head: true })
      .eq('word', word.toLowerCase())
      .eq('language', language);

    return !error && (count || 0) > 0;
  }

  /**
   * Store an embedding in Supabase
   */
  async storeEmbedding(embedding: WordEmbedding): Promise<boolean> {
    const { error } = await this.client.from(this.tableName).upsert({
      word: embedding.word.toLowerCase(),
      vector: embedding.vector,
      language: embedding.language,
      metadata: embedding.metadata,
    });

    if (!error) {
      // Update cache
      const cacheKey = `${embedding.language}:${embedding.word.toLowerCase()}`;
      this.cache.set(cacheKey, embedding);
    }

    return !error;
  }

  /**
   * Batch store embeddings
   */
  async batchStore(embeddings: WordEmbedding[]): Promise<number> {
    const records = embeddings.map((emb) => ({
      word: emb.word.toLowerCase(),
      vector: emb.vector,
      language: emb.language,
      metadata: emb.metadata,
    }));

    const { data, error } = await this.client
      .from(this.tableName)
      .upsert(records);

    if (error) {
      console.error('Batch store error:', error);
      return 0;
    }

    // Update cache
    embeddings.forEach((emb) => {
      const cacheKey = `${emb.language}:${emb.word.toLowerCase()}`;
      this.cache.set(cacheKey, emb);
    });

    return embeddings.length;
  }

  /**
   * Find similar words using vector similarity
   */
  async findSimilar(
    word: string,
    limit: number = 10,
    language: string = 'en'
  ): Promise<Array<{ word: string; similarity: number }>> {
    // First get the word's embedding
    const embedding = await this.getEmbedding(word, language);
    if (!embedding) return [];

    // Use pgvector's cosine similarity
    const { data, error } = await this.client.rpc('find_similar_words', {
      query_vector: embedding.vector,
      match_language: language,
      match_limit: limit,
    });

    if (error || !data) {
      console.error('Find similar error:', error);
      return [];
    }

    return data;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
