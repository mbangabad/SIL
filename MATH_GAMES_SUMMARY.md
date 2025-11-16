# Math/Logic/Spatial Games - Implementation Plan

## Summary
Implementing 25 new math/logic/spatial/strategy games to complement the existing 25 semantic word games.
Total platform games after implementation: **50 games**

## Game Categories

### Batch 1: Spatial & Numeric Foundation (5 games)
1. **ALIGN** - Tap point closest to hidden spatial center
2. **NUMGRIP** - Pick number closest to hidden target
3. **SPAN2D** - Pick 2D point closest to target
4. **GRIDLOGIC** - Complete mini logic grid pattern
5. **SHIFT** - Pick shape following transformation pattern

### Batch 2: Optimization & Pattern (5 games)
6. **OPTIMA** - Choose optimal number under hidden tradeoffs
7. **NEXT** - Identify next number in pattern
8. **ROTOR** - Tap rotated shape matching target
9. **MIDPOINT** - Find numeric midpoint of two numbers
10. **INVERSE** - Infer inverse rule from samples

### Batch 3: Risk & Transformation (5 games)
11. **RISK** - Pick number with best risk-reward tradeoff
12. **ANGLE** - Pick angle closest to hidden orientation
13. **TILT** - Pick number closest to group median
14. **FLIP** - Pick correctly flipped shape version
15. **MATCHRATE** - Match hidden growth rate

### Batch 4: Sequence & Balance (5 games)
16. **JUMP** - Identify jump and continue sequence
17. **BALANCE** - Choose shape that balances seesaw
18. **CHOICE** - Pick highest payoff option
19. **SPREAD** - Pick number best centered in spread
20. **HARMONY** - Pick pair most proportional to reference

### Batch 5: Ordering & Fusion (5 games)
21. **ORDER** - Tap numbers in ascending order
22. **GROWTH** - Infer output from growth samples
23. **PAIR** - Pick pair following same rule
24. **PACK** - Pick number fitting hidden capacity
25. **FUSE** - Fuse two patterns and pick result

## Implementation Status
- ✅ ALIGN - Complete
- ✅ NUMGRIP - Complete
- ✅ SPAN2D - Complete
- 🚧 Remaining 22 games - In progress

## Technical Notes
- All games use standard GameDefinition interface
- No semantic embeddings required (pure math/logic)
- Simpler than semantic games (no async embedding lookups)
- Most use numeric distance/proximity calculations
- Pattern matching uses deterministic rule systems

## Platform Impact
After implementation:
- **50 total games** (25 semantic + 25 math/logic)
- **4 game modes** for each
- **Complete cognitive assessment** across semantic AND numeric/spatial domains
- **Maximum variety** for players
