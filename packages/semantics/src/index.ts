/**
 * @sil/semantics - Semantic scoring engine for SIL
 *
 * Exports:
 * - Embedding service (word vectors)
 * - Similarity calculations (cosine similarity)
 * - Rarity scoring (frequency, patterns)
 * - Midpoint scoring (semantic bridging)
 * - Cluster analysis (theme proximity)
 */

export * from './types';
export * from './embeddings';
export * from './similarity';
export * from './rarity';
export * from './midpoint';
export * from './cluster';

// Export embedding providers
export { FileEmbeddingProvider } from './providers/FileEmbeddingProvider';
export { SupabaseEmbeddingProvider } from './providers/SupabaseEmbeddingProvider';

// Re-export main functions for convenience
export {
  embeddingService,
  type EmbeddingProvider,
  type EmbeddingService,
} from './embeddings';

export {
  calculateSimilarity,
  calculateAverageSimilarity,
  findMostSimilar,
  cosineSimilarity,
  calculatePercentile,
} from './similarity';

export {
  calculateRarity,
  calculateFrequencyRarity,
  matchesPattern,
  filterByPattern,
} from './rarity';

export {
  calculateMidpointScore,
  calculateBalanceScore,
  findBestMidpoint,
  generateSemanticPath,
} from './midpoint';

export {
  calculateClusterHeat,
  calculateClusterCenter,
  rankByClusterHeat,
  heatToLabel,
  heatToColor,
  createThemedWordSet,
} from './cluster';
