// Phase Shift — PhaseGateSystem
// Dimension-specific passability logic for phase gates

import { Dimension, TileType, Position } from '../types';
import { DualGrid } from './DualGrid';

export class PhaseGateSystem {
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    /**
     * Check if a phase gate at (x,y) in the given dimension is passable.
     * Phase gates with permeableDimension matching `dim` act as floor.
     * Phase gates with permeableDimension NOT matching act as walls.
     * Phase gates without permeableDimension are always passable.
     */
    isPassable(dim: Dimension, x: number, y: number): boolean {
        const cell = this.grid.getCell(dim, x, y);
        if (!cell || cell.type !== TileType.PHASE_GATE) return false;

        // No dimension restriction — always passable
        if (!cell.permeableDimension) return true;

        // Only passable in the dimension it's marked for
        return cell.permeableDimension === dim;
    }

    /**
     * Get all phase gate positions in a dimension
     */
    getPhaseGates(dim: Dimension): Array<{ pos: Position; permeableDim?: Dimension }> {
        const grid = this.grid.getDimGrid(dim);
        const gates: Array<{ pos: Position; permeableDim?: Dimension }> = [];

        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.cells[y][x];
                if (cell.type === TileType.PHASE_GATE) {
                    gates.push({
                        pos: { x, y },
                        permeableDim: cell.permeableDimension,
                    });
                }
            }
        }
        return gates;
    }
}
