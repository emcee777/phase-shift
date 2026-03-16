// Phase Shift — LevelScene
// THE MAIN PUZZLE SCENE: Split screen, dual grids, full gameplay
// Visual polish: bloom, ambient particles, enhanced divider, move particles
// Polish v2: animated background, screen FX, audio skeleton, enhanced victory

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
import { applyBloom } from '../rendering/BloomPipeline';
import { HUD } from '../ui/HUD';
import { TutorialOverlay } from '../ui/TutorialOverlay';
import { VictoryOverlay } from '../ui/VictoryOverlay';
import { MenuUI } from '../ui/MenuUI';
import { AudioManager } from '../audio/AudioManager';

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
    private audio!: AudioManager;

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
    private bgGraphicsA!: GameObjects.Graphics;
    private bgGraphicsB!: GameObjects.Graphics;
    private dividerLine!: GameObjects.Rectangle;
    private dividerGlow!: GameObjects.Rectangle;
    private ambientMotes: GameObjects.Arc[] = [];

    // Animated background scroll offsets
    private bgScrollA = 0;
    private bgScrollB = 0;

    // Exit portal references for victory animation
    private exitPortalA: GameObjects.Container | null = null;
    private exitPortalB: GameObjects.Container | null = null;

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

        // Apply soft bloom + vignette
        applyBloom(this);

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
        this.audio = new AudioManager();

        // Initialize UI
        this.hud = new HUD(this);
        this.tutorial = new TutorialOverlay(this);
        this.victory = new VictoryOverlay(this);
        this.pauseMenu = new MenuUI(this);

        // Animated background graphics (depth 0, below everything)
        this.bgGraphicsA = this.add.graphics();
        this.bgGraphicsA.setDepth(0);
        this.bgGraphicsB = this.add.graphics();
        this.bgGraphicsB.setDepth(0);

        // Center divider with glow
        this.dividerGlow = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2 + HUD_HEIGHT / 2,
            DIVIDER_WIDTH + 6, GAME_HEIGHT - HUD_HEIGHT,
            0xffffff, 0.04,
        );
        this.dividerGlow.setDepth(149);

        this.dividerLine = this.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2 + HUD_HEIGHT / 2,
            DIVIDER_WIDTH, GAME_HEIGHT - HUD_HEIGHT,
            0xffffff, 0.3,
        );
        this.dividerLine.setDepth(150);

        // Divider pulse
        this.tweens.add({
            targets: this.dividerGlow,
            alpha: 0.08,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.tweens.add({
            targets: this.dividerLine,
            alpha: 0.2,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

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

        // Enable audio on first user interaction (browser autoplay policy)
        this.input.once('pointerdown', () => this.audio.enable());
        this.input.keyboard?.once('keydown', () => this.audio.enable());

        // Spawn ambient motes
        this.spawnAmbientMotes();

        // Load level
        this.loadLevel(this.currentWorld, this.currentLevelNum);

        // Split-reveal entry transition
        this.transitionSystem.splitReveal();
    }

    update(_time: number, delta: number): void {
        if (!this.paused && !this.levelComplete && !this.animating) {
            this.inputSystem.update(_time);
        }

        // Animate scrolling background every frame
        this.updateAnimatedBackground(delta);
    }

    // --- Animated Background ---

    private updateAnimatedBackground(delta: number): void {
        // Dimension A scrolls diagonally top-right
        // Dimension B scrolls diagonally top-left (opposite direction)
        // Speed: very slow — barely perceptible, just adds life
        const speed = 0.012;
        this.bgScrollA = (this.bgScrollA + speed * delta) % 40;
        this.bgScrollB = (this.bgScrollB + speed * delta) % 40;

        this.drawDiagonalBg(this.bgGraphicsA, Dimension.A, this.bgScrollA, 1);
        this.drawDiagonalBg(this.bgGraphicsB, Dimension.B, this.bgScrollB, -1);
    }

    private drawDiagonalBg(gfx: GameObjects.Graphics, dim: Dimension, scroll: number, dir: 1 | -1): void {
        gfx.clear();

        const panelIndex = dim === Dimension.A ? 0 : 1;
        const panelX = panelIndex * PANEL_WIDTH;
        const color = dim === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;
        const spacing = 40; // px between diagonal lines

        const areaY = HUD_HEIGHT;
        const areaH = GAME_HEIGHT - HUD_HEIGHT;

        // Draw diagonal lines spanning the panel
        // Lines go at 45° angle, scrolling in `dir` direction
        gfx.lineStyle(1, color, 0.03);

        // Number of lines needed to cover panel + overflow for seamless scroll
        const lineCount = Math.ceil((PANEL_WIDTH + areaH) / spacing) + 2;

        for (let i = -1; i < lineCount; i++) {
            const base = i * spacing + scroll * dir;

            // Line from top-edge point to bottom-edge point (45° diagonal)
            const x1 = panelX + base;
            const y1 = areaY;
            const x2 = panelX + base + areaH * dir;
            const y2 = areaY + areaH;

            gfx.lineBetween(x1, y1, x2, y2);
        }
    }

    // --- Ambient Particles ---

    private spawnAmbientMotes(): void {
        // Very sparse — 2 motes per dimension, slow drift
        for (let i = 0; i < 2; i++) {
            this.createAmbientMote(Dimension.A);
            this.createAmbientMote(Dimension.B);
        }
    }

    private createAmbientMote(dim: Dimension): void {
        const panelX = dim === Dimension.A ? 0 : PANEL_WIDTH;
        const color = dim === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;

        const x = panelX + Math.random() * PANEL_WIDTH;
        const y = HUD_HEIGHT + 40 + Math.random() * (GAME_HEIGHT - HUD_HEIGHT - 80);
        const mote = this.add.circle(x, y, 1.5 + Math.random(), color, 0.15 + Math.random() * 0.1);
        mote.setDepth(3);
        this.ambientMotes.push(mote);

        const driftMote = () => {
            if (!mote.active) return;
            const targetX = panelX + 20 + Math.random() * (PANEL_WIDTH - 40);
            const targetY = HUD_HEIGHT + 40 + Math.random() * (GAME_HEIGHT - HUD_HEIGHT - 80);

            this.tweens.add({
                targets: mote,
                x: targetX,
                y: targetY,
                alpha: 0.08 + Math.random() * 0.15,
                duration: 6000 + Math.random() * 4000,
                ease: 'Sine.easeInOut',
                onComplete: driftMote,
            });
        };

        driftMote();
    }

    // --- Move Particles ---

    private spawnMoveParticles(px: number, py: number, color: number): void {
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 10;
            const dot = this.add.circle(px, py, 1.5, color, 0.5);
            dot.setDepth(95);

            this.tweens.add({
                targets: dot,
                x: px + Math.cos(angle) * dist,
                y: py + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 300 + Math.random() * 200,
                ease: 'Power2',
                onComplete: () => dot.destroy(),
            });
        }
    }

    private spawnBoxPushParticles(px: number, py: number, color: number): void {
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 8 + Math.random() * 8;
            const dot = this.add.circle(px, py, 1 + Math.random(), color, 0.6);
            dot.setDepth(55);

            this.tweens.add({
                targets: dot,
                x: px + Math.cos(angle) * dist,
                y: py + Math.sin(angle) * dist,
                alpha: 0,
                duration: 250 + Math.random() * 150,
                ease: 'Power1',
                onComplete: () => dot.destroy(),
            });
        }
    }

    private spawnCollapseParticles(px: number, py: number, dim: Dimension): void {
        const color = dim === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const startDist = 20;
            const startX = px + Math.cos(angle) * startDist;
            const startY = py + Math.sin(angle) * startDist;
            const dot = this.add.circle(startX, startY, 2, color, 0.6);
            dot.setDepth(110);

            this.tweens.add({
                targets: dot,
                x: px,
                y: py,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 400,
                delay: i * 30,
                ease: 'Power2',
                onComplete: () => dot.destroy(),
            });
        }
    }

    // --- Screen Effects ---

    /**
     * Subtle camera micro-shift in the given direction — adds physical weight to movement.
     * 1px shift, settles in 50ms.
     */
    private cameraMicroShift(direction: Direction): void {
        const offset = 1; // px
        let dx = 0;
        let dy = 0;

        switch (direction) {
            case Direction.UP:    dy = -offset; break;
            case Direction.DOWN:  dy =  offset; break;
            case Direction.LEFT:  dx = -offset; break;
            case Direction.RIGHT: dx =  offset; break;
        }

        // Snap to offset, then spring back
        const cam = this.cameras.main;
        cam.setScroll(cam.scrollX + dx, cam.scrollY + dy);
        this.tweens.add({
            targets: cam,
            scrollX: cam.scrollX - dx,
            scrollY: cam.scrollY - dy,
            duration: 50,
            ease: 'Power2',
        });
    }

    /**
     * Box push: slightly stronger micro-shift + brief 0.003 camera shake.
     */
    private cameraBoxPushEffect(direction: Direction): void {
        this.cameraMicroShift(direction);
        this.time.delayedCall(40, () => {
            this.cameras.main.shake(80, 0.003);
        });
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

        // Camera micro-shift — adds physical weight to every step
        this.cameraMicroShift(direction);

        // Play move sound
        this.audio.playMove();

        // Animate player movement + spawn move particles at previous position
        if (result.playerAMoved) {
            this.spawnMoveParticles(this.particleA.getContainer().x, this.particleA.getContainer().y, COLORS.DIM_A_PRIMARY);
            const px = this.gridToPixelX(Dimension.A, result.newPlayerA.x);
            const py = this.gridToPixelY(Dimension.A, result.newPlayerA.y);
            this.particleA.moveTo(px, py);
        }

        if (result.playerBMoved) {
            this.spawnMoveParticles(this.particleB.getContainer().x, this.particleB.getContainer().y, COLORS.DIM_B_PRIMARY);
            const px = this.gridToPixelX(Dimension.B, result.newPlayerB.x);
            const py = this.gridToPixelY(Dimension.B, result.newPlayerB.y);
            this.particleB.moveTo(px, py);
        }

        // Track whether any box was pushed for camera effect
        const anyBoxPushed = !!(result.boxPushA || result.boxPushB);

        if (result.boxPushA) {
            const key = `${result.boxPushA.from.x},${result.boxPushA.from.y}`;
            const box = this.boxMapA.get(key);
            if (box) {
                const toX = this.gridToPixelX(Dimension.A, result.boxPushA.to.x);
                const toY = this.gridToPixelY(Dimension.A, result.boxPushA.to.y);
                const fromPx = this.gridToPixelX(Dimension.A, result.boxPushA.from.x);
                const fromPy = this.gridToPixelY(Dimension.A, result.boxPushA.from.y);
                animateBoxPush(this, box, toX, toY, direction);
                this.spawnBoxPushParticles(fromPx, fromPy, COLORS.BOX_STROKE);
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
                const fromPx = this.gridToPixelX(Dimension.B, result.boxPushB.from.x);
                const fromPy = this.gridToPixelY(Dimension.B, result.boxPushB.from.y);
                animateBoxPush(this, box, toX, toY, direction);
                this.spawnBoxPushParticles(fromPx, fromPy, COLORS.BOX_STROKE);
                this.boxMapB.delete(key);
                this.boxMapB.set(`${result.boxPushB.to.x},${result.boxPushB.to.y}`, box);
            }
        }

        if (anyBoxPushed) {
            this.cameraBoxPushEffect(direction);
            this.audio.playBoxPush();
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
            if (result.entangledPushes.length > 0) {
                this.audio.playEntangleConnect();
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

        // Undo sound
        this.audio.playUndo();

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

        // Gold screen flash on collapse activate (subtle — low RGB values for gentle tint)
        this.cameras.main.flash(ANIM.COLLAPSE_FLASH, 60, 45, 0);

        // Collapse sound
        this.audio.playCollapseActivate();

        // Collapse swirl particles around active player
        const activeDim = this.collapseSystem.getCollapsedDimension();
        if (activeDim) {
            const pos = this.grid.getPlayerPos(activeDim);
            const px = this.gridToPixelX(activeDim, pos.x);
            const py = this.gridToPixelY(activeDim, pos.y);
            this.spawnCollapseParticles(px, py, activeDim);
        }

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
            this.playCompletionAnimation(starCount);

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

    private playCompletionAnimation(starCount: number): void {
        // Green flash on level complete (subtle — low RGB values for gentle tint)
        this.cameras.main.flash(300, 0, 45, 0);

        // Brief celebratory camera shake after flash
        this.time.delayedCall(200, () => {
            this.cameras.main.shake(200, 0.004);
        });

        // Camera zoom to exit portal area (1.0 → 1.05, spring back)
        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.05,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.tweens.add({
                    targets: this.cameras.main,
                    zoom: 1.0,
                    duration: 400,
                    ease: 'Back.easeOut',
                });
            },
        });

        // Play level complete + star sounds
        this.audio.playLevelComplete();
        for (let i = 0; i < starCount; i++) {
            this.audio.playStarEarned(i);
        }

        // Exit portal expand dramatically
        if (this.exitPortalA) {
            this.tweens.add({
                targets: this.exitPortalA,
                scaleX: 3.0,
                scaleY: 3.0,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
            });
        }
        if (this.exitPortalB) {
            this.tweens.add({
                targets: this.exitPortalB,
                scaleX: 3.0,
                scaleY: 3.0,
                alpha: 0,
                duration: 500,
                ease: 'Power2',
            });
        }

        // 30-particle burst from player positions in both dimensions
        const posA = this.grid.getPlayerPos(Dimension.A);
        const posB = this.grid.getPlayerPos(Dimension.B);
        const pxA = this.gridToPixelX(Dimension.A, posA.x);
        const pyA = this.gridToPixelY(Dimension.A, posA.y);
        const pxB = this.gridToPixelX(Dimension.B, posB.x);
        const pyB = this.gridToPixelY(Dimension.B, posB.y);

        this.burstParticles(pxA, pyA, COLORS.DIM_A_PRIMARY);
        this.burstParticles(pxB, pyB, COLORS.DIM_B_PRIMARY);
        this.burstSparkleRing(pxA, pyA, COLORS.DIM_A_GLOW);
        this.burstSparkleRing(pxB, pyB, COLORS.DIM_B_GLOW);

        // Golden star burst at star positions (mid-screen)
        if (starCount > 0) {
            this.time.delayedCall(350, () => {
                this.spawnStarBurst(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, starCount);
            });
        }
    }

    private spawnStarBurst(cx: number, cy: number, count: number): void {
        // Offset positions for 3 potential stars
        const offsets = [-50, 0, 50];
        for (let i = 0; i < count && i < 3; i++) {
            const bx = cx + offsets[i];
            this.time.delayedCall(i * 120, () => {
                for (let j = 0; j < 8; j++) {
                    const angle = (j / 8) * Math.PI * 2;
                    const dist = 15 + Math.random() * 20;
                    const spark = this.add.circle(bx, cy, 2 + Math.random(), COLORS.STAR_GOLD, 0.9);
                    spark.setDepth(450);
                    this.tweens.add({
                        targets: spark,
                        x: bx + Math.cos(angle) * dist,
                        y: cy + Math.sin(angle) * dist,
                        alpha: 0,
                        scaleX: 0.1,
                        scaleY: 0.1,
                        duration: 500 + Math.random() * 300,
                        ease: 'Power2',
                        onComplete: () => spark.destroy(),
                    });
                }
            });
        }
    }

    private burstParticles(x: number, y: number, color: number): void {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const dist = 45 + Math.random() * 35;
            const dot = this.add.circle(x, y, 2 + Math.random() * 3, color, 0.9);
            dot.setDepth(400);

            this.tweens.add({
                targets: dot,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 700 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => dot.destroy(),
            });
        }
    }

    private burstSparkleRing(x: number, y: number, color: number): void {
        // Expanding ring
        const ring = this.add.circle(x, y, 5, color, 0);
        ring.setStrokeStyle(2, color, 0.6);
        ring.setDepth(401);

        this.tweens.add({
            targets: ring,
            scaleX: 8,
            scaleY: 8,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => ring.destroy(),
        });

        // Tiny sparkles with delay
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
            const dist = 25 + Math.random() * 15;
            const sparkle = this.add.circle(x, y, 1.5, 0xffffff, 0);
            sparkle.setDepth(402);

            this.tweens.add({
                targets: sparkle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: { from: 0.8, to: 0 },
                scaleX: { from: 1, to: 0.2 },
                scaleY: { from: 1, to: 0.2 },
                duration: 500,
                delay: 200 + i * 50,
                ease: 'Power2',
                onComplete: () => sparkle.destroy(),
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
        this.exitPortalA = null;
        this.exitPortalB = null;

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
        const lineColor = dim === Dimension.A ? COLORS.DIM_A_DARK : COLORS.DIM_B_DARK;

        // Panel background
        const panelX = panelIndex * PANEL_WIDTH;
        graphics.fillStyle(bgColor, 0.6);
        graphics.fillRect(panelX, HUD_HEIGHT, PANEL_WIDTH, GAME_HEIGHT - HUD_HEIGHT);

        // Grid lines — dimension-colored, very subtle
        graphics.lineStyle(1, lineColor, 0.08);
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
                        // Track for victory animation
                        if (dim === Dimension.A) {
                            this.exitPortalA = exit;
                        } else {
                            this.exitPortalB = exit;
                        }
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
        this.audio?.destroy();
        this.clearTileObjects();
        for (const mote of this.ambientMotes) {
            mote.destroy();
        }
        this.ambientMotes = [];
        this.bgGraphicsA?.destroy();
        this.bgGraphicsB?.destroy();
    }
}
