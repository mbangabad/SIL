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

### 🚧 In Progress

- [ ] PHASE 6: Platform features (profile, leaderboards, seasons)
- [ ] PHASE 7: Testing, database, deployment

## Implemented Games (12 Total)

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