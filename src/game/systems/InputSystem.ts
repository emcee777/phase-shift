// Phase Shift — InputSystem
// Arrow key / WASD input handling, queues moves, connects to MoveResolver

import { Scene, Input } from 'phaser';
import { Direction, Dimension } from '../types';

export type InputCallback = (direction: Direction) => void;
export type CollapseCallback = (dimension: Dimension) => void;
export type UndoCallback = () => void;
export type RedoCallback = () => void;
export type PauseCallback = () => void;
export type RestartCallback = () => void;

export class InputSystem {
    private scene: Scene;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
    private onMove: InputCallback | null = null;
    private onCollapse: CollapseCallback | null = null;
    private onUndo: UndoCallback | null = null;
    private onRedo: RedoCallback | null = null;
    private onPause: PauseCallback | null = null;
    private onRestart: RestartCallback | null = null;
    private enabled = true;
    private lastMoveTime = 0;
    private moveThrottle = 120; // ms between moves

    constructor(scene: Scene) {
        this.scene = scene;
        this.setupKeys();
    }

    private setupKeys(): void {
        if (!this.scene.input.keyboard) return;

        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.wasd = {
            W: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.W),
            A: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
            S: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.S),
            D: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.D),
            Z: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.Z),
            Y: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.Y),
            R: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.R),
            Q: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.Q),
            E: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.E),
            ESC: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.ESC),
        };
    }

    setOnMove(cb: InputCallback): void { this.onMove = cb; }
    setOnCollapse(cb: CollapseCallback): void { this.onCollapse = cb; }
    setOnUndo(cb: UndoCallback): void { this.onUndo = cb; }
    setOnRedo(cb: RedoCallback): void { this.onRedo = cb; }
    setOnPause(cb: PauseCallback): void { this.onPause = cb; }
    setOnRestart(cb: RestartCallback): void { this.onRestart = cb; }

    setEnabled(val: boolean): void { this.enabled = val; }

    update(time: number): void {
        if (!this.enabled) return;

        // Movement — throttled
        if (time - this.lastMoveTime >= this.moveThrottle) {
            const dir = this.getDirection();
            if (dir !== null && this.onMove) {
                this.onMove(dir);
                this.lastMoveTime = time;
            }
        }

        // Undo (Z)
        if (Input.Keyboard.JustDown(this.wasd.Z) && this.onUndo) {
            this.onUndo();
        }

        // Redo (Y)
        if (Input.Keyboard.JustDown(this.wasd.Y) && this.onRedo) {
            this.onRedo();
        }

        // Collapse dimension A (Q)
        if (Input.Keyboard.JustDown(this.wasd.Q) && this.onCollapse) {
            this.onCollapse(Dimension.A);
        }

        // Collapse dimension B (E)
        if (Input.Keyboard.JustDown(this.wasd.E) && this.onCollapse) {
            this.onCollapse(Dimension.B);
        }

        // Restart (R)
        if (Input.Keyboard.JustDown(this.wasd.R) && this.onRestart) {
            this.onRestart();
        }

        // Pause (ESC)
        if (Input.Keyboard.JustDown(this.wasd.ESC) && this.onPause) {
            this.onPause();
        }
    }

    private getDirection(): Direction | null {
        const up = this.cursors.up?.isDown || this.wasd.W?.isDown;
        const down = this.cursors.down?.isDown || this.wasd.S?.isDown;
        const left = this.cursors.left?.isDown || this.wasd.A?.isDown;
        const right = this.cursors.right?.isDown || this.wasd.D?.isDown;

        // Priority: most recent key (approximate with just-down checks first)
        if (Input.Keyboard.JustDown(this.cursors.up) || Input.Keyboard.JustDown(this.wasd.W)) return Direction.UP;
        if (Input.Keyboard.JustDown(this.cursors.down) || Input.Keyboard.JustDown(this.wasd.S)) return Direction.DOWN;
        if (Input.Keyboard.JustDown(this.cursors.left) || Input.Keyboard.JustDown(this.wasd.A)) return Direction.LEFT;
        if (Input.Keyboard.JustDown(this.cursors.right) || Input.Keyboard.JustDown(this.wasd.D)) return Direction.RIGHT;

        // Held keys
        if (up) return Direction.UP;
        if (down) return Direction.DOWN;
        if (left) return Direction.LEFT;
        if (right) return Direction.RIGHT;

        return null;
    }

    destroy(): void {
        // Keys are cleaned up by Phaser scene shutdown
        this.onMove = null;
        this.onCollapse = null;
        this.onUndo = null;
        this.onRedo = null;
        this.onPause = null;
        this.onRestart = null;
    }
}
