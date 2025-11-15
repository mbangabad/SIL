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

### 🚧 In Progress

- [ ] PHASE 5: Game plugins (12 games)
- [ ] PHASE 6: Platform features (profile, leaderboards, seasons)
- [ ] PHASE 7: Testing, database, deployment

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