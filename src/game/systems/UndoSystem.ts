// Phase Shift — UndoSystem
// Full undo/redo stack for puzzle state

import { UndoState } from '../types';
import { DualGrid } from './DualGrid';

export class UndoSystem {
    private undoStack: UndoState[] = [];
    private redoStack: UndoState[] = [];
    private grid: DualGrid;

    constructor(grid: DualGrid) {
        this.grid = grid;
    }

    /** Save current state before a move */
    saveState(moveCount: number): void {
        const state = this.grid.serialize(moveCount);
        this.undoStack.push(state);
        // Clear redo stack on new move
        this.redoStack = [];
    }

    /** Undo last move, returns the restored move count */
    undo(): number | null {
        if (this.undoStack.length === 0) return null;

        // Save current state for redo
        const currentMoveCount = this.undoStack[this.undoStack.length - 1].moveCount + 1;
        this.redoStack.push(this.grid.serialize(currentMoveCount));

        // Restore previous state
        const prev = this.undoStack.pop()!;
        this.grid.restore(prev);
        return prev.moveCount;
    }

    /** Redo last undone move, returns the new move count */
    redo(): number | null {
        if (this.redoStack.length === 0) return null;

        // Save current for undo again
        const state = this.grid.serialize(
            this.redoStack[this.redoStack.length - 1].moveCount - 1
        );
        this.undoStack.push(state);

        const next = this.redoStack.pop()!;
        this.grid.restore(next);
        return next.moveCount;
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    reset(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    getUndoCount(): number {
        return this.undoStack.length;
    }
}
