// Phase Shift — LevelLoader
// Parses level definitions and sets up both dimension grids

import { LevelDefinition } from '../types';
import { DualGrid } from './DualGrid';
import { UndoSystem } from './UndoSystem';
import { getLevel, getWorldLevels, TOTAL_WORLDS } from '../config/levels';

export class LevelLoader {
    private grid: DualGrid;
    private undoSystem: UndoSystem;
    private currentLevel: LevelDefinition | null = null;

    constructor(grid: DualGrid, undoSystem: UndoSystem) {
        this.grid = grid;
        this.undoSystem = undoSystem;
    }

    /**
     * Load a level by world and level number.
     * Returns the level definition if found, null otherwise.
     */
    loadLevel(world: number, level: number): LevelDefinition | null {
        const def = getLevel(world, level);
        if (!def) return null;

        this.grid.loadLevel(def);
        this.undoSystem.reset();
        this.currentLevel = def;
        return def;
    }

    /**
     * Reload the current level (restart).
     */
    restartLevel(): LevelDefinition | null {
        if (!this.currentLevel) return null;
        this.grid.loadLevel(this.currentLevel);
        this.undoSystem.reset();
        return this.currentLevel;
    }

    getCurrentLevel(): LevelDefinition | null {
        return this.currentLevel;
    }

    /**
     * Get the next level definition. Returns null if at end of all worlds.
     */
    getNextLevel(): { world: number; level: number } | null {
        if (!this.currentLevel) return null;

        const { world, level } = this.currentLevel;

        // Try next level in same world
        if (level < 20) {
            const next = getLevel(world, level + 1);
            if (next) return { world, level: level + 1 };
        }

        // Try first level of next world
        if (world < TOTAL_WORLDS) {
            const next = getLevel(world + 1, 1);
            if (next) return { world: world + 1, level: 1 };
        }

        return null;
    }

    /**
     * Check if a world has levels defined.
     */
    hasWorld(world: number): boolean {
        return getWorldLevels(world).length > 0;
    }

    /**
     * Get the count of levels in a world.
     */
    getLevelCount(world: number): number {
        return getWorldLevels(world).length;
    }
}
