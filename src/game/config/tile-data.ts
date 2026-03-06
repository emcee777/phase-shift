// Phase Shift — Tile type definitions and behaviors

import { TileType } from '../types';

export interface TileBehavior {
    walkable: boolean;
    pushable: boolean;
    solid: boolean;
    collectible: boolean;
    slippery: boolean;
    label: string;
}

export const TILE_BEHAVIORS: Record<TileType, TileBehavior> = {
    [TileType.FLOOR]: {
        walkable: true, pushable: false, solid: false,
        collectible: false, slippery: false, label: 'Floor',
    },
    [TileType.WALL]: {
        walkable: false, pushable: false, solid: true,
        collectible: false, slippery: false, label: 'Wall',
    },
    [TileType.BOX]: {
        walkable: false, pushable: true, solid: true,
        collectible: false, slippery: false, label: 'Box',
    },
    [TileType.PHASE_GATE]: {
        walkable: true, pushable: false, solid: false,
        collectible: false, slippery: false, label: 'Phase Gate',
    },
    [TileType.ENTANGLED_BOX]: {
        walkable: false, pushable: true, solid: true,
        collectible: false, slippery: false, label: 'Entangled Box',
    },
    [TileType.EXIT]: {
        walkable: true, pushable: false, solid: false,
        collectible: false, slippery: false, label: 'Exit',
    },
    [TileType.COLLAPSE_PICKUP]: {
        walkable: true, pushable: false, solid: false,
        collectible: true, slippery: false, label: 'Collapse Pickup',
    },
    [TileType.ICE]: {
        walkable: true, pushable: false, solid: false,
        collectible: false, slippery: true, label: 'Ice',
    },
    [TileType.PLAYER]: {
        walkable: true, pushable: false, solid: false,
        collectible: false, slippery: false, label: 'Player Start',
    },
};
