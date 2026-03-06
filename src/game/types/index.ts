// Phase Shift — Type definitions

export enum TileType {
    FLOOR = 0,
    WALL = 1,
    BOX = 2,
    PHASE_GATE = 3,
    ENTANGLED_BOX = 4,
    EXIT = 5,
    COLLAPSE_PICKUP = 6,
    ICE = 7,
    PLAYER = 8,
}

export enum Dimension {
    A = 'A',
    B = 'B',
}

export enum Direction {
    UP = 'UP',
    DOWN = 'DOWN',
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

export interface Position {
    x: number;
    y: number;
}

export interface GridCell {
    type: TileType;
    /** For entangled boxes, links to partner in other dimension */
    entangleId?: number;
    /** For phase gates, which dimension they're permeable in */
    permeableDimension?: Dimension;
}

export interface LevelGrid {
    width: number;
    height: number;
    cells: GridCell[][];
}

export interface DualGridState {
    dimA: LevelGrid;
    dimB: LevelGrid;
    playerA: Position;
    playerB: Position;
    collapseCharges: number;
    collapsedDimension: Dimension | null;
}

export interface LevelDefinition {
    id: string;
    world: number;
    level: number;
    name: string;
    /** Grid data for dimension A — row-major, each number is a TileType */
    gridA: number[][];
    /** Grid data for dimension B — row-major */
    gridB: number[][];
    /** Player start in dimension A [col, row] */
    startA: [number, number];
    /** Player start in dimension B [col, row] */
    startB: [number, number];
    /** Number of collapse charges available */
    collapseCharges: number;
    /** Par moves for star ratings */
    par: [number, number, number]; // [gold, silver, bronze]
    /** Tutorial text shown at level start (optional) */
    tutorial?: string;
    /** Entanglement pairs: [idA, idB] positions */
    entanglements?: Array<{
        idA: [number, number]; // [col, row] in dim A
        idB: [number, number]; // [col, row] in dim B
    }>;
}

export interface MoveResult {
    valid: boolean;
    playerAMoved: boolean;
    playerBMoved: boolean;
    newPlayerA: Position;
    newPlayerB: Position;
    boxPushA?: { from: Position; to: Position };
    boxPushB?: { from: Position; to: Position };
    entangledPushes?: Array<{
        dimension: Dimension;
        from: Position;
        to: Position;
    }>;
    pickedUpCollapse?: { dimension: Dimension; pos: Position };
    slidOnIce?: { dimension: Dimension; path: Position[] };
}

export interface UndoState {
    dimA: number[][];
    dimB: number[][];
    playerA: Position;
    playerB: Position;
    collapseCharges: number;
    collapsedDimension: Dimension | null;
    moveCount: number;
}

export interface GameProgress {
    /** world -> level -> best moves (-1 = incomplete) */
    levels: Record<string, Record<string, number>>;
    /** world -> level -> stars earned (0-3) */
    stars: Record<string, Record<string, number>>;
    /** Highest world unlocked */
    unlockedWorld: number;
}

export const DIRECTION_VECTORS: Record<Direction, Position> = {
    [Direction.UP]: { x: 0, y: -1 },
    [Direction.DOWN]: { x: 0, y: 1 },
    [Direction.LEFT]: { x: -1, y: 0 },
    [Direction.RIGHT]: { x: 1, y: 0 },
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
    [Direction.UP]: Direction.DOWN,
    [Direction.DOWN]: Direction.UP,
    [Direction.LEFT]: Direction.RIGHT,
    [Direction.RIGHT]: Direction.LEFT,
};
