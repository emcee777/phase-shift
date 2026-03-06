// Phase Shift — MoveResolver
// Resolves a move in both dimensions, handles collisions, boxes, phase gates, ice

import {
    Direction, Dimension, Position, TileType, MoveResult,
    DIRECTION_VECTORS, OPPOSITE_DIRECTION,
} from '../types';
import { DualGrid } from './DualGrid';

export class MoveResolver {
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    resolve(direction: Direction): MoveResult {
        const collapsed = this.grid.getCollapsedDimension();
        const vec = DIRECTION_VECTORS[direction];

        // If collapsed into one dimension, only move in that dimension
        if (collapsed !== null) {
            return this.resolveSingleDimension(direction, vec, collapsed);
        }

        // Normal dual-dimension move
        return this.resolveDualMove(direction, vec);
    }

    private resolveSingleDimension(direction: Direction, vec: Position, dim: Dimension): MoveResult {
        const player = this.grid.getPlayerPos(dim);
        const otherDim = dim === Dimension.A ? Dimension.B : Dimension.A;
        const otherPlayer = this.grid.getPlayerPos(otherDim);

        const result: MoveResult = {
            valid: false,
            playerAMoved: false,
            playerBMoved: false,
            newPlayerA: { ...this.grid.getPlayerPos(Dimension.A) },
            newPlayerB: { ...this.grid.getPlayerPos(Dimension.B) },
        };

        const moveResult = this.tryMove(dim, player, vec, direction);
        if (!moveResult.canMove) {
            return result;
        }

        // Apply move in the collapsed dimension only
        result.valid = true;
        const newPos = moveResult.newPos;

        if (dim === Dimension.A) {
            result.playerAMoved = true;
            result.newPlayerA = newPos;
            result.newPlayerB = { ...otherPlayer };
        } else {
            result.playerBMoved = true;
            result.newPlayerB = newPos;
            result.newPlayerA = { ...otherPlayer };
        }

        // Apply box push if needed
        if (moveResult.boxPush) {
            this.grid.moveBox(dim, moveResult.boxPush.from.x, moveResult.boxPush.from.y,
                moveResult.boxPush.to.x, moveResult.boxPush.to.y);
            if (dim === Dimension.A) {
                result.boxPushA = moveResult.boxPush;
            } else {
                result.boxPushB = moveResult.boxPush;
            }

            // Handle entangled box pushes
            if (moveResult.entangledPush) {
                this.grid.moveBox(otherDim,
                    moveResult.entangledPush.from.x, moveResult.entangledPush.from.y,
                    moveResult.entangledPush.to.x, moveResult.entangledPush.to.y);
                result.entangledPushes = [{
                    dimension: otherDim,
                    from: moveResult.entangledPush.from,
                    to: moveResult.entangledPush.to,
                }];
            }
        }

        // Check for collapse pickup
        if (moveResult.pickedUpCollapse) {
            result.pickedUpCollapse = { dimension: dim, pos: newPos };
        }

        // Apply player position
        this.grid.setPlayerPos(dim, newPos);

        return result;
    }

    private resolveDualMove(direction: Direction, vec: Position): MoveResult {
        const playerA = this.grid.getPlayerPos(Dimension.A);
        const playerB = this.grid.getPlayerPos(Dimension.B);

        const result: MoveResult = {
            valid: false,
            playerAMoved: false,
            playerBMoved: false,
            newPlayerA: { ...playerA },
            newPlayerB: { ...playerB },
        };

        // Try move in both dimensions
        const moveA = this.tryMove(Dimension.A, playerA, vec, direction);
        const moveB = this.tryMove(Dimension.B, playerB, vec, direction);

        // At least one dimension must allow movement for the move to be valid
        if (!moveA.canMove && !moveB.canMove) {
            return result;
        }

        result.valid = true;

        // Apply dimension A
        if (moveA.canMove) {
            result.playerAMoved = true;
            result.newPlayerA = moveA.newPos;

            if (moveA.boxPush) {
                this.grid.moveBox(Dimension.A,
                    moveA.boxPush.from.x, moveA.boxPush.from.y,
                    moveA.boxPush.to.x, moveA.boxPush.to.y);
                result.boxPushA = moveA.boxPush;

                if (moveA.entangledPush) {
                    this.grid.moveBox(Dimension.B,
                        moveA.entangledPush.from.x, moveA.entangledPush.from.y,
                        moveA.entangledPush.to.x, moveA.entangledPush.to.y);
                    result.entangledPushes = result.entangledPushes || [];
                    result.entangledPushes.push({
                        dimension: Dimension.B,
                        from: moveA.entangledPush.from,
                        to: moveA.entangledPush.to,
                    });
                }
            }

            if (moveA.pickedUpCollapse) {
                result.pickedUpCollapse = { dimension: Dimension.A, pos: moveA.newPos };
            }

            this.grid.setPlayerPos(Dimension.A, moveA.newPos);
        }

        // Apply dimension B
        if (moveB.canMove) {
            result.playerBMoved = true;
            result.newPlayerB = moveB.newPos;

            if (moveB.boxPush) {
                this.grid.moveBox(Dimension.B,
                    moveB.boxPush.from.x, moveB.boxPush.from.y,
                    moveB.boxPush.to.x, moveB.boxPush.to.y);
                result.boxPushB = moveB.boxPush;

                if (moveB.entangledPush) {
                    this.grid.moveBox(Dimension.A,
                        moveB.entangledPush.from.x, moveB.entangledPush.from.y,
                        moveB.entangledPush.to.x, moveB.entangledPush.to.y);
                    result.entangledPushes = result.entangledPushes || [];
                    result.entangledPushes.push({
                        dimension: Dimension.A,
                        from: moveB.entangledPush.from,
                        to: moveB.entangledPush.to,
                    });
                }
            }

            if (moveB.pickedUpCollapse) {
                result.pickedUpCollapse = { dimension: Dimension.B, pos: moveB.newPos };
            }

            this.grid.setPlayerPos(Dimension.B, moveB.newPos);
        }

        return result;
    }

    private tryMove(dim: Dimension, player: Position, vec: Position, direction: Direction): {
        canMove: boolean;
        newPos: Position;
        boxPush?: { from: Position; to: Position };
        entangledPush?: { from: Position; to: Position };
        pickedUpCollapse?: boolean;
        icePath?: Position[];
    } {
        const newX = player.x + vec.x;
        const newY = player.y + vec.y;

        // Out of bounds
        if (!this.grid.isInBounds(dim, newX, newY)) {
            return { canMove: false, newPos: player };
        }

        const targetCell = this.grid.getCell(dim, newX, newY);
        if (!targetCell) {
            return { canMove: false, newPos: player };
        }

        // Wall — cannot pass
        if (targetCell.type === TileType.WALL) {
            return { canMove: false, newPos: player };
        }

        // Phase gate — check if passable in this dimension
        if (targetCell.type === TileType.PHASE_GATE) {
            // Phase gates are always passable (they're like floor but special)
            return { canMove: true, newPos: { x: newX, y: newY } };
        }

        // Box or Entangled Box — try to push
        if (targetCell.type === TileType.BOX || targetCell.type === TileType.ENTANGLED_BOX) {
            if (this.grid.canPushBox(dim, newX, newY, vec.x, vec.y)) {
                const pushTo = { x: newX + vec.x, y: newY + vec.y };
                const boxPush = { from: { x: newX, y: newY }, to: pushTo };

                let entangledPush: { from: Position; to: Position } | undefined;

                // Handle entangled box — push partner in OPPOSITE direction
                if (targetCell.type === TileType.ENTANGLED_BOX && targetCell.entangleId !== undefined) {
                    const otherDim = dim === Dimension.A ? Dimension.B : Dimension.A;
                    const partners = this.grid.findEntangledBoxes(otherDim);
                    const partner = partners.find(p => p.entangleId === targetCell.entangleId);

                    if (partner) {
                        const oppDir = OPPOSITE_DIRECTION[direction];
                        const oppVec = DIRECTION_VECTORS[oppDir];
                        const partnerTo = {
                            x: partner.pos.x + oppVec.x,
                            y: partner.pos.y + oppVec.y,
                        };

                        // Check if partner can move
                        if (this.grid.canPushBox(otherDim, partner.pos.x, partner.pos.y, oppVec.x, oppVec.y)) {
                            entangledPush = { from: partner.pos, to: partnerTo };
                        } else {
                            // If entangled partner can't move, the whole push fails
                            return { canMove: false, newPos: player };
                        }
                    }
                }

                return { canMove: true, newPos: { x: newX, y: newY }, boxPush, entangledPush };
            }
            return { canMove: false, newPos: player };
        }

        // Collapse pickup
        if (targetCell.type === TileType.COLLAPSE_PICKUP) {
            this.grid.setCellType(dim, newX, newY, TileType.FLOOR);
            this.grid.setCollapseCharges(this.grid.getCollapseCharges() + 1);
            return { canMove: true, newPos: { x: newX, y: newY }, pickedUpCollapse: true };
        }

        // Ice — slide until hitting something
        if (targetCell.type === TileType.ICE) {
            const path = this.resolveIceSlide(dim, newX, newY, vec);
            const finalPos = path[path.length - 1];
            return { canMove: true, newPos: finalPos, icePath: path };
        }

        // Floor or Exit — free to walk
        if (targetCell.type === TileType.FLOOR || targetCell.type === TileType.EXIT ||
            targetCell.type === TileType.PLAYER) {
            return { canMove: true, newPos: { x: newX, y: newY } };
        }

        return { canMove: false, newPos: player };
    }

    private resolveIceSlide(dim: Dimension, startX: number, startY: number, vec: Position): Position[] {
        const path: Position[] = [{ x: startX, y: startY }];
        let cx = startX;
        let cy = startY;

        for (let i = 0; i < 20; i++) { // Safety limit
            const nx = cx + vec.x;
            const ny = cy + vec.y;

            if (!this.grid.isInBounds(dim, nx, ny)) break;

            const cell = this.grid.getCell(dim, nx, ny);
            if (!cell) break;

            if (cell.type === TileType.WALL || cell.type === TileType.BOX ||
                cell.type === TileType.ENTANGLED_BOX) {
                break;
            }

            cx = nx;
            cy = ny;
            path.push({ x: cx, y: cy });

            // Stop sliding if we hit non-ice
            if (cell.type !== TileType.ICE) break;
        }

        return path;
    }
}
