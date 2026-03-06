// Phase Shift — Player particle rendering (glowing dot with trail)

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, TRAIL, ANIM } from '../config/constants';
import { Dimension, Position } from '../types';

export class PlayerParticle {
    private scene: Scene;
    private container: GameObjects.Container;
    private core: GameObjects.Arc;
    private glow: GameObjects.Arc;
    private trailSegments: GameObjects.Arc[] = [];
    private trailPositions: Position[] = [];
    private dimension: Dimension;

    constructor(scene: Scene, x: number, y: number, dim: Dimension) {
        this.scene = scene;
        this.dimension = dim;

        const color = dim === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;
        const glowColor = dim === Dimension.A ? COLORS.DIM_A_GLOW : COLORS.DIM_B_GLOW;

        // Outer glow
        this.glow = scene.add.circle(0, 0, CELL_SIZE * 0.4, glowColor, 0.15);

        // Core particle
        this.core = scene.add.circle(0, 0, CELL_SIZE * 0.22, color, 1);
        this.core.setStrokeStyle(2, 0xffffff, 0.6);

        this.container = scene.add.container(x, y, [this.glow, this.core]);
        this.container.setDepth(100);

        // Pulse animation on glow
        scene.tweens.add({
            targets: this.glow,
            scaleX: 1.3,
            scaleY: 1.3,
            alpha: 0.08,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Create trail segments
        for (let i = 0; i < TRAIL.MAX_SEGMENTS; i++) {
            const seg = scene.add.circle(x, y, CELL_SIZE * 0.15, color, 0);
            seg.setDepth(90);
            this.trailSegments.push(seg);
        }
    }

    moveTo(pixelX: number, pixelY: number, duration: number = ANIM.MOVE_DURATION): void {
        // Record trail position
        this.trailPositions.unshift({ x: this.container.x, y: this.container.y });
        if (this.trailPositions.length > TRAIL.MAX_SEGMENTS) {
            this.trailPositions.pop();
        }

        // Animate particle
        this.scene.tweens.add({
            targets: this.container,
            x: pixelX,
            y: pixelY,
            duration,
            ease: 'Power2',
        });

        // Animate trail
        this.updateTrail();
    }

    private updateTrail(): void {
        const color = this.dimension === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;

        for (let i = 0; i < TRAIL.MAX_SEGMENTS; i++) {
            const seg = this.trailSegments[i];
            if (i < this.trailPositions.length) {
                const pos = this.trailPositions[i];
                const t = i / TRAIL.MAX_SEGMENTS;
                const alpha = TRAIL.ALPHA_START * (1 - t);
                const scale = TRAIL.SIZE_START * (1 - t * 0.6);

                seg.setFillStyle(color, alpha);
                this.scene.tweens.add({
                    targets: seg,
                    x: pos.x,
                    y: pos.y,
                    scaleX: scale,
                    scaleY: scale,
                    alpha: alpha,
                    duration: ANIM.PARTICLE_TRAIL_FADE,
                    ease: 'Power1',
                });
            } else {
                seg.setAlpha(0);
            }
        }
    }

    setPosition(pixelX: number, pixelY: number): void {
        this.container.setPosition(pixelX, pixelY);
        this.trailPositions = [];
        for (const seg of this.trailSegments) {
            seg.setPosition(pixelX, pixelY);
            seg.setAlpha(0);
        }
    }

    setCollapsed(active: boolean): void {
        if (active) {
            this.core.setAlpha(1);
            this.glow.setAlpha(0.25);
        } else {
            this.core.setAlpha(0.35);
            this.glow.setAlpha(0.05);
        }
    }

    setNormal(): void {
        this.core.setAlpha(1);
        this.glow.setAlpha(0.15);
    }

    destroy(): void {
        this.container.destroy();
        for (const seg of this.trailSegments) {
            seg.destroy();
        }
    }

    getContainer(): GameObjects.Container {
        return this.container;
    }
}
