// Phase Shift — World 2: Duality
// Introduce dual dimensions — DIFFERENT layouts in A and B
// The player moves simultaneously in both, same direction
// Must reach exit in BOTH dimensions at the same time

import { LevelDefinition } from '../../types';

export const WORLD_02: LevelDefinition[] = [
    // Level 1: Same layout, different start/exit positions
    {
        id: '2-1', world: 2, level: 1, name: 'Split Screen',
        gridA: [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,5,1],
            [1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,5,0,0,1],
            [1,1,1,1,1],
        ],
        startA: [1, 1], startB: [3, 1],
        collapseCharges: 0,
        par: [4, 6, 10],
        tutorial: 'You now exist in TWO dimensions. Same input, different worlds. Reach BOTH exits.',
    },

    // Level 2: Wall in one dimension blocks differently
    {
        id: '2-2', world: 2, level: 2, name: 'Divergence',
        gridA: [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,1,0,1],
            [1,0,0,5,1],
            [1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,5,0,0,1],
            [1,1,1,1,1],
        ],
        startA: [1, 1], startB: [3, 1],
        collapseCharges: 0,
        par: [4, 7, 10],
        tutorial: 'Walls differ between dimensions. A move can succeed in one and be blocked in the other.',
    },

    // Level 3: Both have walls, need to navigate both
    {
        id: '2-3', world: 2, level: 3, name: 'Parallel Paths',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,1,1,0,1],
            [1,0,0,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,1,1,0,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 10, 14],
    },

    // Level 4: Exit positions force specific routing
    {
        id: '2-4', world: 2, level: 4, name: 'Convergence',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,1,0,1],
            [1,0,0,0,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,1,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        startA: [4, 1], startB: [1, 1],
        collapseCharges: 0,
        par: [6, 9, 13],
    },

    // Level 5: Asymmetric walls create interesting paths
    {
        id: '2-5', world: 2, level: 5, name: 'Asymmetry',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,1,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,5,0,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,1,1],
            [1,0,0,0,0,1],
            [1,0,5,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 9, 14],
    },

    // Level 6: Maze in one, open in other
    {
        id: '2-6', world: 2, level: 6, name: 'Labyrinth',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,1,0,0,0,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,1,0,0,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,0,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [8, 12, 18],
    },

    // Level 7: Walls form channels
    {
        id: '2-7', world: 2, level: 7, name: 'Channels',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,1,0,1],
            [1,0,1,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,1,0,0,1],
            [1,0,0,1,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 10, 14],
    },

    // Level 8: Box in one dimension only
    {
        id: '2-8', world: 2, level: 8, name: 'One-Sided Box',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,2,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 10, 15],
        tutorial: 'A box in one dimension may block your path while the other is clear.',
    },

    // Level 9: Boxes in both dimensions
    {
        id: '2-9', world: 2, level: 9, name: 'Double Boxes',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,2,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,2,0,1],
            [1,0,0,0,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [7, 11, 16],
    },

    // Level 10: Synchronized box pushing
    {
        id: '2-10', world: 2, level: 10, name: 'Sync Push',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,2,0,0,1],
            [1,0,0,5,0,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,2,0,1],
            [1,0,5,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 10, 14],
    },

    // Level 11: One blocked, one free
    {
        id: '2-11', world: 2, level: 11, name: 'Imbalance',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,1,1,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,5,0,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,1,1,1],
            [1,0,0,0,0,1],
            [1,0,5,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [7, 11, 16],
    },

    // Level 12: Need to use wall bouncing (one side blocked, other side moves)
    {
        id: '2-12', world: 2, level: 12, name: 'Wall Bounce',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,1,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,1,0,0,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [2, 1], startB: [2, 1],
        collapseCharges: 0,
        par: [5, 8, 12],
        tutorial: 'Hitting a wall in one dimension while moving freely in the other is key to solving puzzles.',
    },

    // Level 13: Larger grid with wall patterns
    {
        id: '2-13', world: 2, level: 13, name: 'Split Maze',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,1,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,1,0,0,1],
            [1,0,0,0,0,0,1],
            [1,0,0,1,0,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [8, 13, 18],
    },

    // Level 14: L-shaped walls in both
    {
        id: '2-14', world: 2, level: 14, name: 'Mirror L',
        gridA: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,1,1,0,0,1],
            [1,0,0,0,5,1],
            [1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1],
            [1,0,0,0,0,1],
            [1,0,0,0,0,1],
            [1,0,0,1,1,1],
            [1,5,0,0,0,1],
            [1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [4, 1],
        collapseCharges: 0,
        par: [6, 10, 14],
    },

    // Level 15: Box and wall combo
    {
        id: '2-15', world: 2, level: 15, name: 'Obstruction',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,2,0,1,0,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,2,0,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [8, 13, 18],
    },

    // Level 16: Tight corridors
    {
        id: '2-16', world: 2, level: 16, name: 'Squeeze Play',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,0,1,0,0,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [9, 14, 20],
    },

    // Level 17: Diamond pattern
    {
        id: '2-17', world: 2, level: 17, name: 'Diamond',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,1,0,0,1],
            [1,0,1,0,1,0,1],
            [1,0,0,1,0,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,1,0,0,0,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,1,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [8, 13, 18],
    },

    // Level 18: Box chain in both dimensions
    {
        id: '2-18', world: 2, level: 18, name: 'Dual Chain',
        gridA: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,2,0,0,1],
            [1,0,0,0,0,0,1],
            [1,0,2,0,0,0,1],
            [1,0,0,0,0,5,1],
            [1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,2,0,1],
            [1,0,0,0,0,0,1],
            [1,0,0,0,2,0,1],
            [1,5,0,0,0,0,1],
            [1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [5, 1],
        collapseCharges: 0,
        par: [9, 14, 20],
    },

    // Level 19: Complex routing
    {
        id: '2-19', world: 2, level: 19, name: 'Routing',
        gridA: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,0,1],
            [1,0,0,0,0,0,1,1],
            [1,1,0,1,0,0,0,1],
            [1,0,0,0,0,0,5,1],
            [1,1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,1,0,1,0,1],
            [1,1,0,0,0,0,0,1],
            [1,0,0,0,1,0,1,1],
            [1,5,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [6, 1],
        collapseCharges: 0,
        par: [10, 16, 22],
    },

    // Level 20: World 2 finale — complex dual navigation
    {
        id: '2-20', world: 2, level: 20, name: 'Duality Mastered',
        gridA: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,1,0,0,1],
            [1,0,0,2,0,0,1,1],
            [1,1,0,0,0,0,0,1],
            [1,0,0,1,0,2,0,1],
            [1,0,0,0,0,0,5,1],
            [1,1,1,1,1,1,1,1],
        ],
        gridB: [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,0,1,0,0,1,1],
            [1,1,0,0,2,0,0,1],
            [1,0,0,0,0,1,0,1],
            [1,0,2,0,0,0,0,1],
            [1,5,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1],
        ],
        startA: [1, 1], startB: [6, 1],
        collapseCharges: 0,
        par: [14, 20, 28],
        tutorial: 'World 2 complete! Phase gates await...',
    },
];
