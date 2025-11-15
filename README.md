# Semantic Intelligence League (SIL)

A platform for word games powered by semantic AI.

## Project Structure

```
monorepo/
├── apps/
│   ├── web/         → Next.js frontend application
│   └── api/         → Express backend API
├── packages/
│   ├── core/        → Game engine (types, mode runners, orchestration)
│   ├── games/       → Game plugins (GRIP, ZERO, PING, etc.)
│   ├── semantics/   → Semantic scoring library
│   └── ui/          → React UI component library
```

## Features

### Core Engine
- **4 Game Modes**: One-Shot, Journey, Arena, Endurance
- **Extensible Plugin System**: Easy to add new games
- **Type-Safe**: Full TypeScript support
- **Mode Runners**: Handles all game orchestration logic

### Semantics Engine
- **Similarity Scoring**: Cosine similarity between word embeddings
- **Rarity Scoring**: Frequency-based and pattern-based rarity
- **Midpoint Calculation**: Find semantic bridges between concepts
- **Cluster Analysis**: Theme proximity and hot/cold feedback
- **Caching Layer**: Performance optimization for vector operations

### UI Components
- **WordCard**: Interactive word display with multiple states
- **WordGrid**: Flexible grid layouts (3×3, 3×4, 4×4)
- **ScoreBar**: Animated progress bars
- **HotColdMeter**: Gradient heat visualization
- **InputBox**: Text input for word submission
- **SummaryCard**: Game results display
- **BrainprintChart**: Cognitive profile visualization (radar, bars, compact)
- **LeaderboardTable**: Rankings table with tiers and medals

## Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Express, TypeScript
- **Build System**: Turborepo (monorepo orchestration)
- **Package Manager**: pnpm (workspaces)
- **Language**: TypeScript 5

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Package Scripts

Each package has standard scripts:
- `dev`: Development mode with watch
- `build`: Production build
- `test`: Run tests
- `lint`: Lint code
- `clean`: Remove build artifacts

## Implementation Status

### ✅ Completed

- [x] PHASE 1: Monorepo setup with Turborepo
- [x] PHASE 2: Core engine (types, mode runners, orchestration)
- [x] PHASE 3: Semantics engine (similarity, rarity, midpoint, cluster)
- [x] PHASE 4: UI component library
- [x] PHASE 5: All 12 game plugins complete
- [x] PHASE 6: Platform features foundation - Part 1
- [x] PHASE 6: API endpoints and profile pages - Part 2
- [x] PHASE 7: Testing and deployment infrastructure
- [x] Real embeddings implementation (File, Supabase, Mock providers)
- [x] Complete Supabase integration (pgvector, RLS, migrations)
- [x] **13 new semantic word games** (Tier A, B, C)

### 🚧 Remaining Work

- [ ] Game play UI pages (`/play/[gameId]`)
- [ ] Game state management integration
- [ ] Comprehensive test coverage (game-specific tests)

## Implemented Games (25 Total)

### Original Games (12)

### ✅ GRIP
**Theme-based word selection** — Pick the word most similar to a hidden theme
Modes: One-Shot, Journey, Arena, Endurance
Skills: Precision, Semantic Inference, Intuition

### ✅ ZERO
**Rare word generation** — Find the rarest word matching a pattern
Modes: One-Shot, Journey, Arena, Endurance
Skills: Divergent Thinking, Vocabulary Depth, Pattern Recognition

### ✅ PING
**Rapid word filtering** — Quickly select words matching a category
Modes: One-Shot, Journey, Arena, Endurance
Skills: Executive Function, Filtering Under Pressure, Attention

### ✅ SPAN
**Semantic bridging** — Find the word that bridges two concepts
Modes: One-Shot, Journey, Arena, Endurance
Skills: Conceptual Blending, Creative Linking, Semantic Midpoint Detection

### ✅ CLUSTER
**Hot/cold navigation** — Navigate toward a hidden theme using heat feedback
Modes: One-Shot, Journey, Arena, Endurance
Skills: Theme Inference, Iterative Refinement, Strategic Thinking

### ✅ COLORGLYPH
**Color-emotion matching** — Match words to colors based on emotional resonance
Modes: One-Shot, Journey, Arena, Endurance
Skills: Affective Mapping, Synesthetic Thinking, Emotional Intelligence

### ✅ TRACE
**Semantic chain building** — Build a semantic chain by finding the next link
Modes: One-Shot, Journey, Arena, Endurance
Skills: Associative Thinking, Coherence Maintenance, Chain Reasoning

### ✅ FLOW
**Coherent word streams** — Type a rapid chain of semantically related words
Modes: One-Shot, Journey, Arena, Endurance
Skills: Fluency, Associative Speed, Semantic Neighborhood Navigation

### ✅ TENSOR
**Timeline word selection** — Select relevant words from a flowing timeline
Modes: One-Shot, Journey, Arena, Endurance
Skills: Temporal Attention, Selective Processing, Sustained Focus

### ✅ SPLICE
**Creative word blending** — Create a word that blends two concepts
Modes: One-Shot, Journey, Arena, Endurance
Skills: Creative Synthesis, Conceptual Blending, Linguistic Creativity

### ✅ ONE
**Single perfect choice** — Make one choice - pick the best word for the context
Modes: One-Shot, Journey, Endurance
Skills: Decisiveness, Intuition, Semantic Precision

### ✅ LOOP
**Cyclical semantic chains** — Build a semantic chain that loops back to start
Modes: Journey, Endurance
Skills: Circular Reasoning, Semantic Closure, Narrative Coherence

### New Semantic Word Games (13)

**Tier A: Semantic Foundation**

### ✅ TRIBES
**Cluster selection** — Choose the word cluster matching a hidden theme
Modes: One-Shot, Journey, Arena, Endurance
Skills: Pattern Recognition, Cluster Analysis, Theme Inference

### ✅ ECHOCHAIN
**Semantic resonance** — Enter words with high semantic similarity to prompt
Modes: One-Shot, Journey, Arena, Endurance
Skills: Associative Thinking, Semantic Fluency, Resonance Detection

### ✅ GHOST
**Word inference** — Guess the hidden word from semantic clues
Modes: One-Shot, Journey, Arena, Endurance
Skills: Deductive Reasoning, Pattern Completion, Semantic Inference

### ✅ MOTIF
**Prototype selection** — Pick the word that best represents a semantic cluster
Modes: One-Shot, Journey, Arena, Endurance
Skills: Prototype Detection, Cluster Centrality, Representative Thinking

### ✅ FLOCK
**Semantic filtering** — Tap only words related to hidden theme in word stream
Modes: One-Shot, Journey, Arena, Endurance
Skills: Executive Function, Theme Detection, Rapid Classification

**Tier B: Advanced Semantics**

### ✅ MERGE
**Semantic blending** — Find the word that blends two anchor concepts
Modes: One-Shot, Journey, Arena, Endurance
Skills: Conceptual Fusion, Midpoint Detection, Creative Synthesis

### ✅ PIVOTWORD
**Pivot selection** — Find the word that best connects two anchor words
Modes: One-Shot, Journey, Arena, Endurance
Skills: Bridging, Connection Finding, Semantic Pathfinding

### ✅ RADIAL
**Center identification** — Select the word nearest to conceptual center
Modes: One-Shot, Journey, Arena, Endurance
Skills: Centroid Detection, Spatial Reasoning, Cluster Navigation

### ✅ TRACEWORD
**Gradient tracking** — Find the next step along a semantic gradient
Modes: One-Shot, Journey, Arena, Endurance
Skills: Gradient Perception, Directional Thinking, Path Following

### ✅ SHARD
**Word reconstruction** — Guess the original word from semantic fragments
Modes: One-Shot, Journey, Arena, Endurance
Skills: Pattern Completion, Reconstruction, Semantic Memory

**Tier C: Expert Semantics**

### ✅ SPOKE
**Triangle selection** — Pick two words forming strongest semantic triangle
Modes: One-Shot, Journey, Arena, Endurance
Skills: Geometric Reasoning, Triangle Coherence, Multi-word Relationships

### ✅ WARPWORD
**Transformation tracking** — Guess how a word has been semantically warped
Modes: One-Shot, Journey, Arena, Endurance
Skills: Transformation Detection, Interpolation, Change Perception

### ✅ VECTOR
**Gradient positioning** — Position slider on semantic gradient between anchors
Modes: One-Shot, Journey, Arena, Endurance
Skills: Precision Positioning, Gradient Mapping, Spatial Calibration

## Game Plugin Architecture

All games implement the `GameDefinition` interface:

```typescript
interface GameDefinition {
  id: string;
  name: string;
  supportedModes: GameMode[];
  init(ctx: GameContext): GameState;
  update(ctx: GameContext, state: GameState, action: PlayerAction): GameState;
  summarize(ctx: GameContext, state: GameState): GameResultSummary;
  uiSchema: GameUISchema;
}
```

Games are completely independent modules that plug into the platform.

## Design Philosophy

1. **Separation of Concerns**: Games, engine, UI, and semantics are separate
2. **Type Safety**: Comprehensive TypeScript types prevent runtime errors
3. **Extensibility**: Easy to add new games without modifying core
4. **Performance**: Caching and optimization built in from the start
5. **Developer Experience**: Clear APIs, good documentation

## License

MIT