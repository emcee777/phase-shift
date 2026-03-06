// Phase Shift — DualGrid system
// Manages both dimension grids simultaneously

import {
    TileType, Dimension, Position, GridCell, LevelGrid,
    DualGridState, LevelDefinition,
} from '../types';

export class DualGrid {
    private state: DualGridState;

    constructor() {
        this.state = {
            dimA: { width: 0, height: 0, cells: [] },
            dimB: { width: 0, height: 0, cells: [] },
            playerA: { x: 0, y: 0 },
            playerB: { x: 0, y: 0 },
            collapseCharges: 0,
            collapsedDimension: null,
        };
    }

    loadLevel(level: LevelDefinition): void {
        this.state.dimA = this.parseGrid(level.gridA);
        this.state.dimB = this.parseGrid(level.gridB);
        this.state.playerA = { x: level.startA[0], y: level.startA[1] };
        this.state.playerB = { x: level.startB[0], y: level.startB[1] };
        this.state.collapseCharges = level.collapseCharges;
        this.state.collapsedDimension = null;

        // Mark entangled boxes
        if (level.entanglements) {
            level.entanglements.forEach((ent, idx) => {
                const cellA = this.state.dimA.cells[ent.idA[1]][ent.idA[0]];
                const cellB = this.state.dimB.cells[ent.idB[1]][ent.idB[0]];
                cellA.entangleId = idx;
                cellB.entangleId = idx;
            });
        }
    }

    private parseGrid(data: number[][]): LevelGrid {
        const height = data.length;
        const width = data[0].length;
        const cells: GridCell[][] = [];

        for (let row = 0; row < height; row++) {
            cells[row] = [];
            for (let col = 0; col < width; col++) {
                const raw = data[row][col];
                const type = raw as TileType;
                const cell: GridCell = { type };

                // Phase gates: check if encoded with dimension info
                // We use 30 for phase gate permeable in A, 31 for B
                if (raw === 30) {
                    cell.type = TileType.PHASE_GATE;
                    cell.permeableDimension = Dimension.A;
                } else if (raw === 31) {
                    cell.type = TileType.PHASE_GATE;
                    cell.permeableDimension = Dimension.B;
                }

                cells[row][col] = cell;
            }
        }
        return { width, height, cells };
    }

    getState(): DualGridState {
        return this.state;
    }

    getDimGrid(dim: Dimension): LevelGrid {
        return dim === Dimension.A ? this.state.dimA : this.state.dimB;
    }

    getPlayerPos(dim: Dimension): Position {
        return dim === Dimension.A ? this.state.playerA : this.state.playerB;
    }

    setPlayerPos(dim: Dimension, pos: Position): void {
        if (dim === Dimension.A) {
            this.state.playerA = { ...pos };
        } else {
            this.state.playerB = { ...pos };
        }
    }

    getCell(dim: Dimension, x: number, y: number): GridCell | null {
        const grid = this.getDimGrid(dim);
        if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) {
            return null;
        }
        return grid.cells[y][x];
    }

    setCell(dim: Dimension, x: number, y: number, cell: GridCell): void {
        const grid = this.getDimGrid(dim);
        if (x >= 0 && x < grid.width && y >= 0 && y < grid.height) {
            grid.cells[y][x] = cell;
        }
    }

    setCellType(dim: Dimension, x: number, y: number, type: TileType): void {
        const cell = this.getCell(dim, x, y);
        if (cell) {
            cell.type = type;
        }
    }

    isInBounds(dim: Dimension, x: number, y: number): boolean {
        const grid = this.getDimGrid(dim);
        return x >= 0 && x < grid.width && y >= 0 && y < grid.height;
    }

    isWalkable(dim: Dimension, x: number, y: number): boolean {
        const cell = this.getCell(dim, x, y);
        if (!cell) return false;
        return cell.type !== TileType.WALL &&
               cell.type !== TileType.BOX &&
               cell.type !== TileType.ENTANGLED_BOX;
    }

    isBox(dim: Dimension, x: number, y: number): boolean {
        const cell = this.getCell(dim, x, y);
        if (!cell) return false;
        return cell.type === TileType.BOX || cell.type === TileType.ENTANGLED_BOX;
    }

    canPushBox(dim: Dimension, boxX: number, boxY: number, dx: number, dy: number): boolean {
        const behindX = boxX + dx;
        const behindY = boxY + dy;
        const behind = this.getCell(dim, behindX, behindY);
        if (!behind) return false;
        return behind.type === TileType.FLOOR ||
               behind.type === TileType.EXIT ||
               behind.type === TileType.ICE ||
               behind.type === TileType.PHASE_GATE ||
               behind.type === TileType.COLLAPSE_PICKUP;
    }

    moveBox(dim: Dimension, fromX: number, fromY: number, toX: number, toY: number): void {
        const fromCell = this.getCell(dim, fromX, fromY);
        const toCell = this.getCell(dim, toX, toY);
        if (!fromCell || !toCell) return;

        const boxType = fromCell.type;
        const entangleId = fromCell.entangleId;

        fromCell.type = TileType.FLOOR;
        fromCell.entangleId = undefined;

        toCell.type = boxType;
        toCell.entangleId = entangleId;
    }

    getCollapseCharges(): number {
        return this.state.collapseCharges;
    }

    setCollapseCharges(n: number): void {
        this.state.collapseCharges = n;
    }

    getCollapsedDimension(): Dimension | null {
        return this.state.collapsedDimension;
    }

    setCollapsedDimension(dim: Dimension | null): void {
        this.state.collapsedDimension = dim;
    }

    isComplete(): boolean {
        const dimA = this.state.dimA;
        const dimB = this.state.dimB;
        const pA = this.state.playerA;
        const pB = this.state.playerB;

        const cellA = dimA.cells[pA.y]?.[pA.x];
        const cellB = dimB.cells[pB.y]?.[pB.x];

        if (!cellA || !cellB) return false;

        return cellA.type === TileType.EXIT && cellB.type === TileType.EXIT;
    }

    /** Serialize current state for undo stack */
    serialize(moveCount: number): {
        dimA: number[][]; dimB: number[][];
        playerA: Position; playerB: Position;
        collapseCharges: number; collapsedDimension: Dimension | null;
        moveCount: number;
    } {
        return {
            dimA: this.serializeGrid(this.state.dimA),
            dimB: this.serializeGrid(this.state.dimB),
            playerA: { ...this.state.playerA },
            playerB: { ...this.state.playerB },
            collapseCharges: this.state.collapseCharges,
            collapsedDimension: this.state.collapsedDimension,
            moveCount,
        };
    }

    /** Restore from serialized state */
    restore(saved: {
        dimA: number[][]; dimB: number[][];
        playerA: Position; playerB: Position;
        collapseCharges: number; collapsedDimension: Dimension | null;
    }): void {
        this.state.dimA = this.parseGrid(saved.dimA);
        this.state.dimB = this.parseGrid(saved.dimB);
        this.state.playerA = { ...saved.playerA };
        this.state.playerB = { ...saved.playerB };
        this.state.collapseCharges = saved.collapseCharges;
        this.state.collapsedDimension = saved.collapsedDimension;
    }

    private serializeGrid(grid: LevelGrid): number[][] {
        const data: number[][] = [];
        for (let row = 0; row < grid.height; row++) {
            data[row] = [];
            for (let col = 0; col < grid.width; col++) {
                const cell = grid.cells[row][col];
                if (cell.type === TileType.PHASE_GATE && cell.permeableDimension === Dimension.A) {
                    data[row][col] = 30;
                } else if (cell.type === TileType.PHASE_GATE && cell.permeableDimension === Dimension.B) {
                    data[row][col] = 31;
                } else {
                    data[row][col] = cell.type as number;
                }
            }
        }
        return data;
    }

    /** Find all entangled box positions and their IDs in a dimension */
    findEntangledBoxes(dim: Dimension): Array<{ pos: Position; entangleId: number }> {
        const grid = this.getDimGrid(dim);
        const result: Array<{ pos: Position; entangleId: number }> = [];
        for (let y = 0; y < grid.height; y++) {
            for (let x = 0; x < grid.width; x++) {
                const cell = grid.cells[y][x];
                if (cell.type === TileType.ENTANGLED_BOX && cell.entangleId !== undefined) {
                    result.push({ pos: { x, y }, entangleId: cell.entangleId });
                }
            }
        }
        return result;
    }
}
