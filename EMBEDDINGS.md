# Word Embeddings Guide

This guide explains how to set up and use word embeddings in the SIL platform.

## Overview

The SIL platform supports multiple embedding providers:

1. **MockEmbeddingProvider** - For testing and development (default)
2. **FileEmbeddingProvider** - Load from GloVe, Word2Vec, or FastText files
3. **SupabaseEmbeddingProvider** - Store and retrieve from Supabase with pgvector

## Quick Start

### Using Mock Embeddings (Default)

No setup required! The platform uses mock embeddings by default for development.

```typescript
import { embeddingService } from '@sil/semantics';

const embedding = await embeddingService.getEmbedding('ocean', 'en');
```

### Using File-Based Embeddings

#### 1. Download Embeddings

**GloVe (Recommended)**:
```bash
# Download GloVe 100d embeddings (~350MB)
wget http://nlp.stanford.edu/data/glove.6B.zip
unzip glove.6B.zip
mkdir -p data/
mv glove.6B.100d.txt data/
```

**Word2Vec**:
```bash
# Download Word2Vec Google News (~3.5GB)
wget https://s3.amazonaws.com/dl4j-distribution/GoogleNews-vectors-negative300.bin.gz
gunzip GoogleNews-vectors-negative300.bin.gz
mv GoogleNews-vectors-negative300.bin data/
```

**FastText**:
```bash
# Download FastText English (~7GB)
wget https://dl.fbaipublicfiles.com/fasttext/vectors-english/wiki-news-300d-1M.vec.zip
unzip wiki-news-300d-1M.vec.zip
mv wiki-news-300d-1M.vec data/
```

#### 2. Configure Environment

```bash
# .env
EMBEDDINGS_PROVIDER=file
EMBEDDINGS_FILE_PATH=./data/glove.6B.100d.txt
EMBEDDINGS_DIMENSION=100
EMBEDDINGS_FORMAT=glove
```

#### 3. Initialize in Code

```typescript
import { FileEmbeddingProvider, EmbeddingService } from '@sil/semantics';

const provider = new FileEmbeddingProvider({
  filePath: process.env.EMBEDDINGS_FILE_PATH,
  format: 'glove',
  dimension: 100,
  normalize: true,
  maxWords: 100000, // Optional: limit for memory
});

const embeddingService = new EmbeddingService(provider);

// Load embeddings (async)
await embeddingService.provider.load();

// Now ready to use
const embedding = await embeddingService.getEmbedding('ocean');
```

### Using Supabase Embeddings

#### 1. Set Up Supabase

Enable pgvector extension in Supabase:

```sql
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE word_embeddings (
  id BIGSERIAL PRIMARY KEY,
  word TEXT NOT NULL,
  vector vector(100), -- Adjust dimension as needed
  language TEXT DEFAULT 'en',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(word, language)
);

-- Create index for similarity search
CREATE INDEX ON word_embeddings USING ivfflat (vector vector_cosine_ops);

-- Function to find similar words
CREATE OR REPLACE FUNCTION find_similar_words(
  query_vector vector(100),
  match_language TEXT DEFAULT 'en',
  match_limit INT DEFAULT 10
)
RETURNS TABLE (
  word TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    word_embeddings.word,
    1 - (word_embeddings.vector <=> query_vector) AS similarity
  FROM word_embeddings
  WHERE language = match_language
  ORDER BY word_embeddings.vector <=> query_vector
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql;
```

#### 2. Load Embeddings into Supabase

```typescript
import { FileEmbeddingProvider, SupabaseEmbeddingProvider } from '@sil/semantics';

// Load from file
const fileProvider = new FileEmbeddingProvider({
  filePath: './data/glove.6B.100d.txt',
  format: 'glove',
  dimension: 100,
});

await fileProvider.load();

// Create Supabase provider
const supabaseProvider = new SupabaseEmbeddingProvider({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_SERVICE_KEY,
  dimension: 100,
});

// Batch upload (example: first 10k words)
const words = ['ocean', 'sea', 'mountain', /* ... */];
const embeddings = [];

for (const word of words) {
  const emb = await fileProvider.getEmbedding(word);
  if (emb) embeddings.push(emb);

  // Batch in chunks of 1000
  if (embeddings.length >= 1000) {
    await supabaseProvider.batchStore(embeddings);
    embeddings.length = 0;
    console.log(`Uploaded ${words.indexOf(word)} words...`);
  }
}

// Upload remaining
if (embeddings.length > 0) {
  await supabaseProvider.batchStore(embeddings);
}
```

#### 3. Use Supabase Provider

```typescript
import { SupabaseEmbeddingProvider, EmbeddingService } from '@sil/semantics';

const provider = new SupabaseEmbeddingProvider({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
});

const embeddingService = new EmbeddingService(provider);

// Get embedding
const embedding = await embeddingService.getEmbedding('ocean');

// Find similar words
const similar = await provider.findSimilar('ocean', 10);
// Returns: [{ word: 'sea', similarity: 0.85 }, ...]
```

## Embedding Formats

### GloVe Format
```
word1 0.123 -0.456 0.789 ...
word2 -0.234 0.567 -0.890 ...
```

### Word2Vec Format
```
100000 300
word1 0.123 -0.456 0.789 ...
word2 -0.234 0.567 -0.890 ...
```

### FastText Format
```
1000000 300
word1 0.123 -0.456 0.789 ...
word2 -0.234 0.567 -0.890 ...
```

## Performance Tips

### Memory Management

```typescript
// Limit words loaded
const provider = new FileEmbeddingProvider({
  filePath: './data/glove.6B.300d.txt',
  format: 'glove',
  dimension: 300,
  maxWords: 50000, // Only load 50k most common words
});
```

### Caching

```typescript
// Caching is enabled by default
const service = new EmbeddingService(provider, true);

// Check cache size
console.log('Cache size:', service.getCacheSize());

// Clear cache
service.clearCache();
```

### Supabase Performance

```sql
-- Use appropriate index based on your similarity metric
CREATE INDEX ON word_embeddings USING ivfflat (vector vector_cosine_ops); -- Cosine
CREATE INDEX ON word_embeddings USING ivfflat (vector vector_l2_ops);     -- Euclidean
CREATE INDEX ON word_embeddings USING ivfflat (vector vector_ip_ops);     -- Inner product
```

## Recommended Embeddings

### For Development
- **GloVe 6B 100d** - Small, fast, good quality (822MB)
- Download: http://nlp.stanford.edu/data/glove.6B.zip

### For Production
- **GloVe 840B 300d** - Large, high quality (5.6GB)
- **Word2Vec Google News 300d** - Very high quality (3.5GB)
- **FastText English 300d** - Handles misspellings well (7GB)

### For Specific Languages
- **FastText Multilingual** - Supports 157 languages
- Download: https://fasttext.cc/docs/en/crawl-vectors.html

## Switching Providers

```typescript
// Start with mock
let provider = new MockEmbeddingProvider();

// Switch to file
if (process.env.EMBEDDINGS_PROVIDER === 'file') {
  provider = new FileEmbeddingProvider({
    filePath: process.env.EMBEDDINGS_FILE_PATH,
    format: process.env.EMBEDDINGS_FORMAT,
    dimension: Number(process.env.EMBEDDINGS_DIMENSION),
  });
  await provider.load();
}

// Switch to Supabase
if (process.env.EMBEDDINGS_PROVIDER === 'supabase') {
  provider = new SupabaseEmbeddingProvider({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_ANON_KEY,
  });
}

// Create service
const embeddingService = new EmbeddingService(provider);
```

## Troubleshooting

### Out of Memory
- Reduce `maxWords` parameter
- Use smaller embedding dimension (50d or 100d instead of 300d)
- Use Supabase provider instead of file provider

### Slow Loading
- Use binary formats (Word2Vec .bin) instead of text
- Enable caching
- Load embeddings once at startup, not per-request

### Missing Words
- Use FastText (handles out-of-vocabulary words better)
- Implement fallback to character-level embeddings
- Generate pseudo-embeddings for unknown words

## Next Steps

1. Download embeddings from recommended sources
2. Configure environment variables
3. Initialize provider in your application
4. Test with sample words
5. Monitor performance and memory usage

For more information, see the [Deployment Guide](DEPLOYMENT.md).
