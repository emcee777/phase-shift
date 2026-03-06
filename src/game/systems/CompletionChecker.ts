// Phase Shift — CompletionChecker
// Checks if the particle is on the exit in BOTH dimensions simultaneously

import { TileType, Dimension } from '../types';
import { DualGrid } from './DualGrid';

export class CompletionChecker {
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    /**
     * Check if the level is complete.
     * The player must be on the exit tile in BOTH dimensions.
     * Cannot complete while collapsed.
     */
    isComplete(): boolean {
        // Cannot complete while in collapsed mode
        if (this.grid.getCollapsedDimension() !== null) {
            return false;
        }

        return this.grid.isComplete();
    }

    /**
     * Check if the player is on the exit in a specific dimension.
     */
    isOnExit(dim: Dimension): boolean {
        const pos = this.grid.getPlayerPos(dim);
        const cell = this.grid.getCell(dim, pos.x, pos.y);
        return cell?.type === TileType.EXIT || false;
    }

    /**
     * Get completion status for both dimensions.
     */
    getStatus(): { dimA: boolean; dimB: boolean; complete: boolean } {
        const dimA = this.isOnExit(Dimension.A);
        const dimB = this.isOnExit(Dimension.B);
        return {
            dimA,
            dimB,
            complete: dimA && dimB && this.grid.getCollapsedDimension() === null,
        };
    }
}
