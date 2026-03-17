# Phase Shift

> Quantum puzzle game with dual-dimension mechanics. Built entirely with procedural graphics — no sprites, no art assets. Your code IS the art.

## Play

[Play Phase Shift](https://emcee777.github.io/phase-shift/)

## About

Phase Shift is a puzzle game where you exist in two dimensions simultaneously. Move your particle through Dimension A (blue, left) and Dimension B (orange, right) at the same time. Push entangled boxes that mirror your movements across dimensions. Navigate phase gates, slide on ice, and collapse into a single dimension to solve increasingly complex puzzles.

**200 levels across 10 worlds.** Built with zero art assets — elegant procedural visuals.

## Features

- **200 levels** across 10 worlds with progressive difficulty
- **Dual-dimension** split-screen — solve puzzles in two spaces at once
- **Entangled boxes** — push in one dimension, the partner moves OPPOSITE in the other
- **Phase gates** — dimension-specific passability
- **Ice tiles** — slide until collision
- **Collapse mechanic** — temporarily move in only one dimension
- **Par-based star system** — gold/silver/bronze ratings
- **Full undo/redo** — unlimited state restoration
- **Procedural graphics** — motion blur afterimages, staggered ring animations, squash-and-stretch

## How to Play

- **Arrow keys / WASD** — Move
- **Q / E** — Collapse to Dimension A / B
- **Z** — Undo | **Y** — Redo
- **R** — Restart level
- **ESC** — Pause

**Goal:** Reach the exit portal in BOTH dimensions simultaneously.

## Tech Stack

| Component | Version |
|-----------|---------|
| [Phaser](https://phaser.io/) | 3.90.0 |
| TypeScript | 5.7.2 (strict) |
| [Vite](https://vitejs.dev/) | 6.3.1 |
| Renderer | WebGL + PostFX |

## Development

```bash
npm install
npm run dev    # Dev server (port 8080)
npm run build  # Production build
```

## Architecture

- **DualGrid** — Two independent grids for simultaneous puzzle state
- **MoveResolver** — Atomic, deterministic movement resolution
- **EntanglementSystem** — Linked box pairs with opposite-direction coupling
- **PhaseGateSystem** — Dimension-specific passability logic
- **CollapseSystem** — Single-dimension mode management
- **UndoSystem** — Full state serialization and restoration
- **CompletionChecker** — Both-dimension exit verification

## Contributing

Contributions welcome! Level design is data (arrays in config/levels/). Visual changes are code. No art tools needed.

## License

MIT — see [LICENSE](LICENSE)
