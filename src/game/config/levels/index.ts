// Phase Shift — Level registry

import { LevelDefinition } from '../../types';
import { WORLD_01 } from './world-01';
import { WORLD_02 } from './world-02';
import { WORLD_03 } from './world-03';
import { WORLD_04 } from './world-04';
import { WORLD_05 } from './world-05';
import { WORLD_06 } from './world-06';
import { WORLD_07 } from './world-07';
import { WORLD_08 } from './world-08';
import { WORLD_09 } from './world-09';
import { WORLD_10 } from './world-10';

export const ALL_LEVELS: LevelDefinition[] = [
    ...WORLD_01,
    ...WORLD_02,
    ...WORLD_03,
    ...WORLD_04,
    ...WORLD_05,
    ...WORLD_06,
    ...WORLD_07,
    ...WORLD_08,
    ...WORLD_09,
    ...WORLD_10,
];

export const WORLDS: Record<number, LevelDefinition[]> = {
    1: WORLD_01,
    2: WORLD_02,
    3: WORLD_03,
    4: WORLD_04,
    5: WORLD_05,
    6: WORLD_06,
    7: WORLD_07,
    8: WORLD_08,
    9: WORLD_09,
    10: WORLD_10,
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

export const TOTAL_WORLDS = 10;

export function getLevel(world: number, level: number): LevelDefinition | undefined {
    const worldLevels = WORLDS[world];
    if (!worldLevels) return undefined;
    return worldLevels.find(l => l.level === level);
}

export function getWorldLevels(world: number): LevelDefinition[] {
    return WORLDS[world] ?? [];
}
