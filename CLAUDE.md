# Phase Shift — Quantum Puzzle Game

## Tech Stack
Phaser 3.90 + Vite + TypeScript strict

## Architecture
- `src/game/types/index.ts` — Full type system (TileType, Dimension, Direction, etc.)
- `src/game/config/constants.ts` — Colors, sizes, animations
- `src/game/config/levels/` — Level definitions (world-01 through world-10)
- `src/game/systems/` — Game logic (DualGrid, MoveResolver, CollapseSystem, etc.)
- `src/game/entities/` — Rendering helpers (Particle, Box, Wall, etc.)
- `src/game/ui/` — HUD, overlays, menus
- `src/game/scenes/` — Phaser scenes (Boot, MainMenu, LevelScene, etc.)

## Key Design
- Split screen: Dimension A (blue, left) and Dimension B (orange, right)
- Player moves simultaneously in both dimensions
- Phase gates (permeable in one dim), entangled boxes (opposite push), collapse (single-dim move)
- 200 levels across 10 worlds of 20

## Build & Check
```bash
npx tsc --noEmit    # Type check
npm run build       # Production build
npm run dev         # Dev server
```

## Level Grid Encoding
- 0=Floor, 1=Wall, 2=Box, 3=PhaseGate, 4=EntangledBox, 5=Exit, 6=CollapsePickup, 7=Ice, 8=Player
- 30=PhaseGate(permeable in A), 31=PhaseGate(permeable in B)
