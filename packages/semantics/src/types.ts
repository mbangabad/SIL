/**
 * Semantics Engine Types
 *
 * Defines interfaces for semantic operations:
 * - Word embeddings
 * - Similarity calculations
 * - Rarity scoring
 * - Cluster analysis
 */

/**
 * Vector representation of a word
 */
export interface WordEmbedding {
  word: string;
  vector: number[];
  language: string;
  /** Optional metadata (frequency, part of speech, etc.) */
  metadata?: {
    frequency?: number;
    pos?: string;
    [key: string]: any;
  };
}

/**
 * Result of a similarity calculation
 */
export interface SimilarityResult {
  /** Cosine similarity score (0-1) */
  score: number;
  /** Percentile rank (0-100) */
  percentile?: number;
}

/**
 * Result of a rarity calculation
 */
export interface RarityResult {
  /** Rarity score (0-100, higher = rarer) */
  rarityScore: number;
  /** Word frequency rank (optional) */
  frequencyRank?: number;
  /** Pattern compliance (optional) */
  patternMatch?: boolean;
}

/**
 * Result of a midpoint calculation
 */
export interface MidpointResult {
  /** How close the word is to the semantic midpoint (0-1) */
  score: number;
  /** Distance from anchor A */
  distanceA?: number;
  /** Distance from anchor B */
  distanceB?: number;
}

/**
 * Result of a cluster heat calculation
 */
export interface ClusterHeatResult {
  /** Heat/proximity to cluster center (0-1) */
  heat: number;
  /** Distance from cluster center */
  distance?: number;
}

/**
 * Configuration for the semantics engine
 */
export interface SemanticsConfig {
  /** Embedding model to use (e.g., 'glove-100', 'word2vec-300') */
  embeddingModel?: string;
  /** Language code */
  language?: string;
  /** Enable caching */
  enableCache?: boolean;
  /** Cache TTL in seconds */
  cacheTTL?: number;
}
