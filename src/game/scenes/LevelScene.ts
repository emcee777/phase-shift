// Phase Shift — LevelScene
// THE MAIN PUZZLE SCENE: Split screen, dual grids, full gameplay

import { Scene, GameObjects } from 'phaser';
import {
    COLORS, CELL_SIZE, GAME_WIDTH, GAME_HEIGHT, ANIM,
    PANEL_WIDTH, DIVIDER_WIDTH, HUD_HEIGHT, getGridOffset,
} from '../config/constants';
import { TileType, Dimension, Direction, LevelDefinition } from '../types';
import { DualGrid } from '../systems/DualGrid';
import { MoveResolver } from '../systems/MoveResolver';
import { CollapseSystem } from '../systems/CollapseSystem';
import { UndoSystem } from '../systems/UndoSystem';
import { CompletionChecker } from '../systems/CompletionChecker';
import { LevelLoader } from '../systems/LevelLoader';
import { InputSystem } from '../systems/InputSystem';
import { TransitionSystem } from '../systems/TransitionSystem';
import { ProgressManager } from '../systems/ProgressManager';
import { PlayerParticle } from '../entities/Particle';
import { createBox, animateBoxPush } from '../entities/Box';
import { createWall } from '../entities/Wall';
import { createExitPortal } from '../entities/ExitPortal';
import { createPhaseGate } from '../entities/PhaseGate';
import { createCollapsePickup } from '../entities/CollapsePickup';
import { createIceTile } from '../entities/IceTile';
import { HUD } from '../ui/HUD';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { VictoryOverlay } from '../ui/VictoryOverlay';
import { MenuUI } from '../ui/MenuUI';

export class LevelScene extends Scene {
    // Systems
    private grid!: DualGrid;
    private moveResolver!: MoveResolver;
    private collapseSystem!: CollapseSystem;
    private undoSystem!: UndoSystem;
    private completionChecker!: CompletionChecker;
    private levelLoader!: LevelLoader;
    private inputSystem!: InputSystem;
    private transitionSystem!: TransitionSystem;
    private progress!: ProgressManager;

    // UI
    private hud!: HUD;
    private tutorial!: TutorialOverlay;
    private victory!: VictoryOverlay;
    private pauseMenu!: MenuUI;

    // Rendering
    private particleA!: PlayerParticle;
    private particleB!: PlayerParticle;
    private tileObjectsA: GameObjects.GameObject[] = [];
    private tileObjectsB: GameObjects.GameObject[] = [];
    private boxMapA: Map<string, GameObjects.Container> = new Map();
    private boxMapB: Map<string, GameObjects.Container> = new Map();
    private gridGraphicsA!: GameObjects.Graphics;
    private gridGraphicsB!: GameObjects.Graphics;
    private dividerLine!: GameObjects.Rectangle;

    // State
    private currentWorld = 1;
    private currentLevelNum = 1;
    private currentLevel: LevelDefinition | null = null;
    private moveCount = 0;
    private levelComplete = false;
    private paused = false;
    private animating = false;

    constructor() {
        super('LevelScene');
    }

    init(data: { world: number; level: number }): void {
        this.currentWorld = data.world || 1;
        this.currentLevelNum = data.level || 1;
    }

    create(): void {
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Initialize systems
        this.grid = new DualGrid();
        this.moveResolver = new MoveResolver(this.grid);
        this.collapseSystem = new CollapseSystem(this.grid);
        this.undoSystem = new UndoSystem(this.grid);
        this.completionChecker = new CompletionChecker(this.grid);
        this.levelLoader = new LevelLoader(this.grid, this.undoSystem);
        this.inputSystem = new InputSystem(this);
        this.transitionSystem = new TransitionSystem(this);
        this.progress = new ProgressManager();

        // Initialize UI
        this.hud = new HUD(this);
        this.tutorial = new TutorialOverlay(this);
        this.victory = new VictoryOverlay(this);
        this.pauseMenu = new MenuUI(this);

        // Center divider
        this.dividerLine = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2 + HUD_HEIGHT / 2,
            DIVIDER_WIDTH, GAME_HEIGHT - HUD_HEIGHT,
            COLORS.DIVIDER, 0.4,
        );
        this.dividerLine.setDepth(150);

        // Grid backgrounds
        this.gridGraphicsA = this.add.graphics();
        this.gridGraphicsB = this.add.graphics();

        // Set up input handlers
        this.inputSystem.setOnMove((dir) => this.handleMove(dir));
        this.inputSystem.setOnUndo(() => this.handleUndo());
        this.inputSystem.setOnRedo(() => this.handleRedo());
        this.inputSystem.setOnCollapse((dim) => this.handleCollapse(dim));
        this.inputSystem.setOnRestart(() => this.restartLevel());
        this.inputSystem.setOnPause(() => this.togglePause());

        // Load level
        this.loadLevel(this.currentWorld, this.currentLevelNum);

        // Fade in
        this.transitionSystem.fadeIn();
    }

    update(time: number): void {
        if (!this.paused && !this.levelComplete && !this.animating) {
            this.inputSystem.update(time);
        }
    }

    // --- Level Loading ---

    private loadLevel(world: number, level: number): void {
        this.currentLevel = this.levelLoader.loadLevel(world, level);
        if (!this.currentLevel) {
            this.scene.start('WorldSelect');
            return;
        }

        this.currentWorld = world;
        this.currentLevelNum = level;
        this.moveCount = 0;
        this.levelComplete = false;
        this.paused = false;
        this.animating = false;

        // Update HUD
        this.hud.setLevel(this.currentLevel.name, world, level);
        this.hud.setMoves(0, this.currentLevel.par);
        this.hud.setCollapseCharges(this.currentLevel.collapseCharges, this.currentLevel.collapseCharges);
        this.hud.setCollapseMode(null);

        // Render both grids
        this.renderGrids();

        // Show tutorial if present
        if (this.currentLevel.tutorial) {
            this.tutorial.show(this.currentLevel.tutorial, 6000);
        }
    }

    private restartLevel(): void {
        this.levelLoader.restartLevel();
        this.moveCount = 0;
        this.levelComplete = false;
        this.paused = false;
        this.animating = false;

        if (this.currentLevel) {
            this.hud.setMoves(0, this.currentLevel.par);
            this.hud.setCollapseCharges(this.currentLevel.collapseCharges, this.currentLevel.collapseCharges);
            this.hud.setCollapseMode(null);
        }

        this.victory.hide();
        this.pauseMenu.hide();
        this.renderGrids();
    }

    // --- Input Handlers ---

    private handleMove(direction: Direction): void {
        if (this.levelComplete || this.paused || this.animating) return;

        // Save state for undo
        this.undoSystem.saveState(this.moveCount);

        // Resolve move
        const result = this.moveResolver.resolve(direction);

        if (!result.valid) {
            // Pop the undo state we just saved
            this.undoSystem.undo();
            return;
        }

        this.moveCount++;
        this.animating = true;

        // Animate player movement
        if (result.playerAMoved) {
            const px = this.gridToPixelX(Dimension.A, result.newPlayerA.x);
            const py = this.gridToPixelY(Dimension.A, result.newPlayerA.y);
            this.particleA.moveTo(px, py);
        }

        if (result.playerBMoved) {
            const px = this.gridToPixelX(Dimension.B, result.newPlayerB.x);
            const py = this.gridToPixelY(Dimension.B, result.newPlayerB.y);
            this.particleB.moveTo(px, py);
        }

        // Animate box pushes
        if (result.boxPushA) {
            const key = `${result.boxPushA.from.x},${result.boxPushA.from.y}`;
            const box = this.boxMapA.get(key);
            if (box) {
                const toX = this.gridToPixelX(Dimension.A, result.boxPushA.to.x);
                const toY = this.gridToPixelY(Dimension.A, result.boxPushA.to.y);
                animateBoxPush(this, box, toX, toY);
                this.boxMapA.delete(key);
                this.boxMapA.set(`${result.boxPushA.to.x},${result.boxPushA.to.y}`, box);
            }
        }

        if (result.boxPushB) {
            const key = `${result.boxPushB.from.x},${result.boxPushB.from.y}`;
            const box = this.boxMapB.get(key);
            if (box) {
                const toX = this.gridToPixelX(Dimension.B, result.boxPushB.to.x);
                const toY = this.gridToPixelY(Dimension.B, result.boxPushB.to.y);
                animateBoxPush(this, box, toX, toY);
                this.boxMapB.delete(key);
                this.boxMapB.set(`${result.boxPushB.to.x},${result.boxPushB.to.y}`, box);
            }
        }

        // Entangled pushes
        if (result.entangledPushes) {
            for (const ep of result.entangledPushes) {
                const map = ep.dimension === Dimension.A ? this.boxMapA : this.boxMapB;
                const key = `${ep.from.x},${ep.from.y}`;
                const box = map.get(key);
                if (box) {
                    const toX = this.gridToPixelX(ep.dimension, ep.to.x);
                    const toY = this.gridToPixelY(ep.dimension, ep.to.y);
                    animateBoxPush(this, box, toX, toY);
                    map.delete(key);
                    map.set(`${ep.to.x},${ep.to.y}`, box);
                }
            }
        }

        // Collapse pickup
        if (result.pickedUpCollapse) {
            this.hud.setCollapseCharges(
                this.grid.getCollapseCharges(),
                this.currentLevel?.collapseCharges || 0,
            );
            // Remove the pickup visual — re-render is simpler
            this.time.delayedCall(ANIM.MOVE_DURATION, () => {
                this.renderGrids();
            });
        }

        // Update HUD
        this.hud.setMoves(this.moveCount, this.currentLevel?.par);

        // After animation completes, check completion
        this.time.delayedCall(ANIM.MOVE_DURATION + 20, () => {
            this.animating = false;

            if (this.completionChecker.isComplete()) {
                this.handleLevelComplete();
            }
        });
    }

    private handleUndo(): void {
        if (this.levelComplete || this.paused) return;

        const restoredMoveCount = this.undoSystem.undo();
        if (restoredMoveCount === null) return;

        this.moveCount = restoredMoveCount;
        this.hud.setMoves(this.moveCount, this.currentLevel?.par);
        this.hud.setCollapseCharges(
            this.grid.getCollapseCharges(),
            this.currentLevel?.collapseCharges || 0,
        );
        this.hud.setCollapseMode(this.grid.getCollapsedDimension());

        // Update particle visibility for collapse state
        this.updateCollapseVisuals();

        this.renderGrids();
    }

    private handleRedo(): void {
        if (this.levelComplete || this.paused) return;

        const restoredMoveCount = this.undoSystem.redo();
        if (restoredMoveCount === null) return;

        this.moveCount = restoredMoveCount;
        this.hud.setMoves(this.moveCount, this.currentLevel?.par);
        this.hud.setCollapseCharges(
            this.grid.getCollapseCharges(),
            this.currentLevel?.collapseCharges || 0,
        );
        this.hud.setCollapseMode(this.grid.getCollapsedDimension());
        this.updateCollapseVisuals();
        this.renderGrids();
    }

    private handleCollapse(dim: Dimension): void {
        if (this.levelComplete || this.paused) return;

        // Save for undo
        this.undoSystem.saveState(this.moveCount);

        const changed = this.collapseSystem.toggleCollapse(dim);
        if (!changed) {
            this.undoSystem.undo();
            return;
        }

        this.hud.setCollapseMode(this.collapseSystem.getCollapsedDimension());
        this.hud.setCollapseCharges(
            this.collapseSystem.getCharges(),
            this.currentLevel?.collapseCharges || 0,
        );

        this.updateCollapseVisuals();
    }

    private updateCollapseVisuals(): void {
        const collapsed = this.collapseSystem.getCollapsedDimension();
        if (collapsed === Dimension.A) {
            this.particleA.setCollapsed(true);
            this.particleB.setCollapsed(false);
        } else if (collapsed === Dimension.B) {
            this.particleA.setCollapsed(false);
            this.particleB.setCollapsed(true);
        } else {
            this.particleA.setNormal();
            this.particleB.setNormal();
        }
    }

    // --- Level Completion ---

    private handleLevelComplete(): void {
        this.levelComplete = true;
        this.inputSystem.setEnabled(false);

        // Calculate stars
        const par = this.currentLevel!.par;
        const starCount = this.moveCount <= par[0] ? 3 : this.moveCount <= par[1] ? 2 : this.moveCount <= par[2] ? 1 : 0;

        // Save progress
        this.progress.completeLevel(
            this.currentWorld, this.currentLevelNum,
            this.moveCount, par,
        );

        // Show victory after delay
        this.time.delayedCall(ANIM.LEVEL_COMPLETE_DELAY, () => {
            this.playCompletionAnimation();

            const nextLevel = this.levelLoader.getNextLevel();

            this.victory.show(this.moveCount, par, starCount, nextLevel !== null, {
                onNext: () => {
                    if (nextLevel) {
                        this.victory.hide();
                        this.time.delayedCall(200, () => {
                            this.inputSystem.setEnabled(true);
                            this.loadLevel(nextLevel.world, nextLevel.level);
                        });
                    }
                },
                onReplay: () => {
                    this.victory.hide();
                    this.inputSystem.setEnabled(true);
                    this.restartLevel();
                },
                onMenu: () => {
                    this.scene.start('LevelSelectScene', { world: this.currentWorld });
                },
            });
        });
    }

    private playCompletionAnimation(): void {
        // Burst particles from both exit positions
        const posA = this.grid.getPlayerPos(Dimension.A);
        const posB = this.grid.getPlayerPos(Dimension.B);

        this.burstParticles(
            this.gridToPixelX(Dimension.A, posA.x),
            this.gridToPixelY(Dimension.A, posA.y),
            COLORS.DIM_A_PRIMARY,
        );
        this.burstParticles(
            this.gridToPixelX(Dimension.B, posB.x),
            this.gridToPixelY(Dimension.B, posB.y),
            COLORS.DIM_B_PRIMARY,
        );
    }

    private burstParticles(x: number, y: number, color: number): void {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const dist = 40 + Math.random() * 30;
            const dot = this.add.circle(x, y, 3 + Math.random() * 3, color, 0.8);
            dot.setDepth(400);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 600 + Math.random() * 300,
                ease: 'Power2',
                onComplete: () => dot.destroy(),
            });
        }
    }

    // --- Pause ---

    private togglePause(): void {
        if (this.levelComplete) return;

        if (this.paused) {
            this.paused = false;
            this.pauseMenu.hide();
            this.inputSystem.setEnabled(true);
        } else {
            this.paused = true;
            this.inputSystem.setEnabled(false);
            this.pauseMenu.show({
                onResume: () => {
                    this.paused = false;
                    this.pauseMenu.hide();
                    this.inputSystem.setEnabled(true);
                },
                onRestart: () => {
                    this.pauseMenu.hide();
                    this.inputSystem.setEnabled(true);
                    this.restartLevel();
                },
                onQuit: () => {
                    this.scene.start('LevelSelectScene', { world: this.currentWorld });
                },
            });
        }
    }

    // --- Grid Rendering ---

    private renderGrids(): void {
        // Clear old tiles
        this.clearTileObjects();

        const state = this.grid.getState();

        // Draw grid backgrounds
        this.drawGridBackground(Dimension.A, state.dimA.width, state.dimA.height);
        this.drawGridBackground(Dimension.B, state.dimB.width, state.dimB.height);

        // Render tiles for both dimensions
        this.renderDimensionTiles(Dimension.A, state.dimA.width, state.dimA.height);
        this.renderDimensionTiles(Dimension.B, state.dimB.width, state.dimB.height);

        // Create / reposition particles
        if (this.particleA) this.particleA.destroy();
        if (this.particleB) this.particleB.destroy();

        this.particleA = new PlayerParticle(
            this,
            this.gridToPixelX(Dimension.A, state.playerA.x),
            this.gridToPixelY(Dimension.A, state.playerA.y),
            Dimension.A,
        );

        this.particleB = new PlayerParticle(
            this,
            this.gridToPixelX(Dimension.B, state.playerB.x),
            this.gridToPixelY(Dimension.B, state.playerB.y),
            Dimension.B,
        );

        // Restore collapse visuals if needed
        this.updateCollapseVisuals();
    }

    private drawGridBackground(dim: Dimension, width: number, height: number): void {
        const graphics = dim === Dimension.A ? this.gridGraphicsA : this.gridGraphicsB;
        graphics.clear();

        const panelIndex = dim === Dimension.A ? 0 : 1;
        const offset = getGridOffset(width, height, panelIndex as 0 | 1);
        const bgColor = dim === Dimension.A ? COLORS.DIM_A_BG : COLORS.DIM_B_BG;

        // Panel background
        const panelX = panelIndex * PANEL_WIDTH;
        graphics.fillStyle(bgColor, 0.5);
        graphics.fillRect(panelX, HUD_HEIGHT, PANEL_WIDTH, GAME_HEIGHT - HUD_HEIGHT);

        // Grid lines
        graphics.lineStyle(1, COLORS.FLOOR_LINE, 0.2);
        for (let x = 0; x <= width; x++) {
            graphics.lineBetween(
                offset.x + x * CELL_SIZE, offset.y,
                offset.x + x * CELL_SIZE, offset.y + height * CELL_SIZE,
            );
        }
        for (let y = 0; y <= height; y++) {
            graphics.lineBetween(
                offset.x, offset.y + y * CELL_SIZE,
                offset.x + width * CELL_SIZE, offset.y + y * CELL_SIZE,
            );
        }
    }

    private renderDimensionTiles(dim: Dimension, width: number, height: number): void {
        const grid = this.grid.getDimGrid(dim);
        const tileObjects = dim === Dimension.A ? this.tileObjectsA : this.tileObjectsB;
        const boxMap = dim === Dimension.A ? this.boxMapA : this.boxMapB;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = grid.cells[y][x];
                const px = this.gridToPixelX(dim, x);
                const py = this.gridToPixelY(dim, y);

                switch (cell.type) {
                    case TileType.WALL: {
                        const wall = createWall(this, px, py, dim);
                        tileObjects.push(wall);
                        break;
                    }
                    case TileType.BOX: {
                        const box = createBox(this, px, py, false);
                        tileObjects.push(box);
                        boxMap.set(`${x},${y}`, box);
                        break;
                    }
                    case TileType.ENTANGLED_BOX: {
                        const ebox = createBox(this, px, py, true);
                        tileObjects.push(ebox);
                        boxMap.set(`${x},${y}`, ebox);
                        break;
                    }
                    case TileType.EXIT: {
                        const exit = createExitPortal(this, px, py);
                        tileObjects.push(exit);
                        break;
                    }
                    case TileType.PHASE_GATE: {
                        const gate = createPhaseGate(this, px, py, cell.permeableDimension);
                        tileObjects.push(gate);
                        break;
                    }
                    case TileType.COLLAPSE_PICKUP: {
                        const pickup = createCollapsePickup(this, px, py);
                        tileObjects.push(pickup);
                        break;
                    }
                    case TileType.ICE: {
                        const ice = createIceTile(this, px, py);
                        tileObjects.push(ice);
                        break;
                    }
                }
            }
        }
    }

    private clearTileObjects(): void {
        for (const obj of this.tileObjectsA) {
            if ('destroy' in obj) (obj as GameObjects.GameObject).destroy();
        }
        for (const obj of this.tileObjectsB) {
            if ('destroy' in obj) (obj as GameObjects.GameObject).destroy();
        }
        this.tileObjectsA = [];
        this.tileObjectsB = [];
        this.boxMapA.clear();
        this.boxMapB.clear();
    }

    // --- Coordinate Helpers ---

    private gridToPixelX(dim: Dimension, gridX: number): number {
        const grid = this.grid.getDimGrid(dim);
        const panelIndex = dim === Dimension.A ? 0 : 1;
        const offset = getGridOffset(grid.width, grid.height, panelIndex as 0 | 1);
        return offset.x + gridX * CELL_SIZE + CELL_SIZE / 2;
    }

    private gridToPixelY(dim: Dimension, gridY: number): number {
        const grid = this.grid.getDimGrid(dim);
        const panelIndex = dim === Dimension.A ? 0 : 1;
        const offset = getGridOffset(grid.width, grid.height, panelIndex as 0 | 1);
        return offset.y + gridY * CELL_SIZE + CELL_SIZE / 2;
    }

    // --- Cleanup ---

    shutdown(): void {
        this.inputSystem?.destroy();
        this.transitionSystem?.destroy();
        this.hud?.destroy();
        this.tutorial?.destroy();
        this.victory?.destroy();
        this.pauseMenu?.destroy();
        this.particleA?.destroy();
        this.particleB?.destroy();
        this.clearTileObjects();
    }
}
