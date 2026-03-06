// Phase Shift — World 1: Awakening
// Single dimension only — teach basic Sokoban mechanics
// Grid: 0=floor, 1=wall, 2=box, 5=exit, 8=player
// In world 1, both dimensions have the SAME layout

import { LevelDefinition } from '../../types';

// Helper: mirror grid for both dimensions in world 1
function mirror(
    id: number, name: string, grid: number[][],
    start: [number, number], par: [number, number, number],
    tutorial?: string
): LevelDefinition {
    return {
        id: `1-${id}`,
        world: 1,
        level: id,
        name,
        gridA: grid,
        gridB: grid,
        startA: start,
        startB: start,
        collapseCharges: 0,
        par,
        tutorial,
    };
}

export const WORLD_01: LevelDefinition[] = [
    // Level 1: Just walk to the exit
    mirror(1, 'First Steps', [
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,0,0,1],
        [1,0,0,5,1],
        [1,1,1,1,1],
    ], [1, 1], [3, 5, 8],
    'Use arrow keys or WASD to move. Reach the green exit.'),

    // Level 2: Simple path with walls
    mirror(2, 'Corridor', [
        [1,1,1,1,1,1],
        [1,0,0,1,0,1],
        [1,0,0,0,0,1],
        [1,1,0,1,0,1],
        [1,0,0,0,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [6, 9, 12],
    'Navigate around walls to reach the exit.'),

    // Level 3: First box push
    mirror(3, 'Push', [
        [1,1,1,1,1],
        [1,0,0,0,1],
        [1,0,2,0,1],
        [1,0,0,5,1],
        [1,1,1,1,1],
    ], [1, 1], [4, 6, 9],
    'Walk into a box to push it. Clear a path to the exit.'),

    // Level 4: Push box out of the way
    mirror(4, 'Clear Path', [
        [1,1,1,1,1,1],
        [1,0,0,0,0,1],
        [1,0,2,0,0,1],
        [1,0,0,0,0,1],
        [1,0,0,0,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [5, 8, 12],
    'Push the box aside to reach the exit.'),

    // Level 5: Two boxes
    mirror(5, 'Double Trouble', [
        [1,1,1,1,1,1],
        [1,0,0,0,0,1],
        [1,0,2,0,0,1],
        [1,0,0,2,0,1],
        [1,0,0,0,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [6, 9, 14],
    'Push boxes carefully — you cannot pull them back! Press Z to undo.'),

    // Level 6: Don't get stuck
    mirror(6, 'Think Ahead', [
        [1,1,1,1,1,1],
        [1,0,0,0,0,1],
        [1,2,0,1,0,1],
        [1,0,0,1,0,1],
        [1,0,0,0,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [5, 8, 11]),

    // Level 7: L-shaped corridor
    mirror(7, 'L-Bend', [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [8, 12, 16]),

    // Level 8: Box into corner
    mirror(8, 'Corner Push', [
        [1,1,1,1,1,1],
        [1,0,0,0,0,1],
        [1,0,2,0,0,1],
        [1,0,0,1,0,1],
        [1,0,0,1,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [5, 8, 12]),

    // Level 9: Multiple paths
    mirror(9, 'Crossroads', [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [8, 12, 16]),

    // Level 10: Push chain (two boxes in a row)
    mirror(10, 'Chain Reaction', [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,0,2,0,0,1],
        [1,0,0,2,0,0,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [6, 10, 15]),

    // Level 11: Zigzag
    mirror(11, 'Zigzag', [
        [1,1,1,1,1,1,1],
        [1,0,0,0,1,0,1],
        [1,1,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,1,1,1,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [10, 14, 18]),

    // Level 12: Push box to make bridge
    mirror(12, 'Bridge Builder', [
        [1,1,1,1,1,1],
        [1,0,2,0,0,1],
        [1,0,1,1,0,1],
        [1,0,0,0,0,1],
        [1,0,0,0,5,1],
        [1,1,1,1,1,1],
    ], [1, 1], [6, 9, 13]),

    // Level 13: Three boxes
    mirror(13, 'Triple Threat', [
        [1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1],
        [1,0,2,0,2,0,1],
        [1,0,0,2,0,0,1],
        [1,0,0,0,0,0,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [7, 11, 16]),

    // Level 14: Narrow passages
    mirror(14, 'Tight Squeeze', [
        [1,1,1,1,1,1,1],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,2,1,0,1],
        [1,0,0,0,0,0,1],
        [1,0,1,0,1,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [8, 12, 17]),

    // Level 15: Box maze
    mirror(15, 'Warehouse', [
        [1,1,1,1,1,1,1],
        [1,0,0,2,0,0,1],
        [1,0,1,0,1,0,1],
        [1,2,0,0,0,2,1],
        [1,0,1,0,1,0,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [8, 13, 18]),

    // Level 16: Dead-end awareness
    mirror(16, 'Dead Ends', [
        [1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1],
        [1,0,0,2,0,0,0,1],
        [1,1,0,1,1,0,1,1],
        [1,0,0,0,0,0,5,1],
        [1,1,1,1,1,1,1,1],
    ], [1, 1], [9, 14, 20]),

    // Level 17: Two-room puzzle
    mirror(17, 'Two Rooms', [
        [1,1,1,1,1,1,1],
        [1,0,0,1,0,0,1],
        [1,0,2,0,0,0,1],
        [1,0,0,1,2,0,1],
        [1,1,0,1,0,1,1],
        [1,0,0,0,0,5,1],
        [1,1,1,1,1,1,1],
    ], [1, 1], [9, 14, 19]),

    // Level 18: Spiral
    mirror(18, 'Spiral', [
        [1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,0,1,0,0,1,0,1],
        [1,0,1,5,0,1,0,1],
        [1,0,1,1,0,1,0,1],
        [1,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1],
    ], [1, 1], [14, 18, 24]),

    // Level 19: Box relay
    mirror(19, 'Relay', [
        [1,1,1,1,1,1,1,1],
        [1,0,0,2,0,0,0,1],
        [1,0,1,0,1,0,0,1],
        [1,0,0,0,0,2,0,1],
        [1,0,1,0,1,0,0,1],
        [1,0,0,0,0,0,5,1],
        [1,1,1,1,1,1,1,1],
    ], [1, 1], [10, 15, 20]),

    // Level 20: World 1 finale
    mirror(20, 'Graduation', [
        [1,1,1,1,1,1,1,1],
        [1,0,0,0,2,0,0,1],
        [1,0,1,0,1,0,0,1],
        [1,0,2,0,0,0,1,1],
        [1,1,0,1,0,2,0,1],
        [1,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,5,1],
        [1,1,1,1,1,1,1,1],
    ], [1, 1], [12, 18, 25],
    'World 1 complete! Next: dual dimensions...'),
];
