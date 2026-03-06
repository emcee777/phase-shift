// Phase Shift — Level registry

import { LevelDefinition } from '../../types';
import { WORLD_01 } from './world-01';
import { WORLD_02 } from './world-02';

export const ALL_LEVELS: LevelDefinition[] = [
    ...WORLD_01,
    ...WORLD_02,
];

export const WORLDS: Record<number, LevelDefinition[]> = {
    1: WORLD_01,
    2: WORLD_02,
};

export const WORLD_NAMES: Record<number, string> = {
    1: 'Awakening',
    2: 'Duality',
    3: 'Phase Walk',
    4: 'Entanglement',
    5: 'Superposition',
    6: 'Interference',
    7: 'Collapse',
    8: 'Decoherence',
    9: 'Quantum Leap',
    10: 'Singularity',
};

export const TOTAL_WORLDS = 2; // Will grow as more worlds are added

export function getLevel(world: number, level: number): LevelDefinition | undefined {
    const worldLevels = WORLDS[world];
    if (!worldLevels) return undefined;
    return worldLevels.find(l => l.level === level);
}

export function getWorldLevels(world: number): LevelDefinition[] {
    return WORLDS[world] ?? [];
}
