// Phase Shift — EntanglementSystem
// Manages entangled box pairs across dimensions

import { Dimension, Position, TileType, OPPOSITE_DIRECTION, DIRECTION_VECTORS, Direction } from '../types';
import { DualGrid } from './DualGrid';

export interface EntangledPair {
    id: number;
    posA: Position;
    posB: Position;
}

export class EntanglementSystem {
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    /**
     * Get all entangled box pairs across both dimensions.
     */
    getEntangledPairs(): EntangledPair[] {
        const boxesA = this.grid.findEntangledBoxes(Dimension.A);
        const boxesB = this.grid.findEntangledBoxes(Dimension.B);
        const pairs: EntangledPair[] = [];

        for (const a of boxesA) {
            const partner = boxesB.find(b => b.entangleId === a.entangleId);
            if (partner) {
                pairs.push({
                    id: a.entangleId,
                    posA: a.pos,
                    posB: partner.pos,
                });
            }
        }
        return pairs;
    }

    /**
     * Check if pushing an entangled box in one dimension is valid.
     * The partner in the other dimension must be able to move in the OPPOSITE direction.
     */
    canPushEntangled(
        pushDim: Dimension, pushPos: Position, direction: Direction,
    ): { valid: boolean; partnerFrom?: Position; partnerTo?: Position } {
        const cell = this.grid.getCell(pushDim, pushPos.x, pushPos.y);
        if (!cell || cell.type !== TileType.ENTANGLED_BOX || cell.entangleId === undefined) {
            return { valid: false };
        }

        const otherDim = pushDim === Dimension.A ? Dimension.B : Dimension.A;
        const partners = this.grid.findEntangledBoxes(otherDim);
        const partner = partners.find(p => p.entangleId === cell.entangleId);

        if (!partner) {
            // No partner found — treat as regular box push
            return { valid: true };
        }

        const oppDir = OPPOSITE_DIRECTION[direction];
        const oppVec = DIRECTION_VECTORS[oppDir];
        const partnerTo = {
            x: partner.pos.x + oppVec.x,
            y: partner.pos.y + oppVec.y,
        };

        // Check if partner can move to target
        if (!this.grid.canPushBox(otherDim, partner.pos.x, partner.pos.y, oppVec.x, oppVec.y)) {
            return { valid: false };
        }

        return {
            valid: true,
            partnerFrom: partner.pos,
            partnerTo,
        };
    }
}
