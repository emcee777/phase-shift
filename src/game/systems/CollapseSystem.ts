// Phase Shift — CollapseSystem
// Manages the collapse mechanic — temporarily move in only one dimension

import { Dimension } from '../types';
import { DualGrid } from './DualGrid';

export class CollapseSystem {
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    /** Toggle collapse into a dimension. Returns true if state changed. */
    toggleCollapse(dimension: Dimension): boolean {
        const current = this.grid.getCollapsedDimension();

        // If already collapsed into this dimension, uncollapse
        if (current === dimension) {
            this.grid.setCollapsedDimension(null);
            return true;
        }

        // If collapsed into the other dimension, switch
        if (current !== null) {
            this.grid.setCollapsedDimension(dimension);
            return true;
        }

        // Not collapsed — try to collapse (costs a charge)
        if (this.grid.getCollapseCharges() <= 0) {
            return false;
        }

        this.grid.setCollapseCharges(this.grid.getCollapseCharges() - 1);
        this.grid.setCollapsedDimension(dimension);
        return true;
    }

    /** Exit collapse mode without using a charge */
    exitCollapse(): void {
        this.grid.setCollapsedDimension(null);
    }

    isCollapsed(): boolean {
        return this.grid.getCollapsedDimension() !== null;
    }

    getCollapsedDimension(): Dimension | null {
        return this.grid.getCollapsedDimension();
    }

    getCharges(): number {
        return this.grid.getCollapseCharges();
    }
}
