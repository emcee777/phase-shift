// Phase Shift — Player particle rendering
// Layered: core (bright) + inner glow + outer aura + pulse + motion blur trail

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, TRAIL, ANIM } from '../config/constants';
import { Dimension, Position } from '../types';

export class PlayerParticle {
    private scene: Scene;
    private container: GameObjects.Container;
    private core: GameObjects.Arc;
    private innerGlow: GameObjects.Arc;
    private outerAura: GameObjects.Arc;
    private trailSegments: GameObjects.Arc[] = [];
    private trailPositions: Position[] = [];
    private afterimages: GameObjects.Arc[] = [];
    private dimension: Dimension;

    constructor(scene: Scene, x: number, y: number, dim: Dimension) {
        this.scene = scene;
        this.dimension = dim;

        const dimColor = dim === Dimension.A ? COLORS.DIM_A_PRIMARY : COLORS.DIM_B_PRIMARY;

        // Outer aura — 3x size, very subtle
        this.outerAura = scene.add.circle(0, 0, CELL_SIZE * 0.6, dimColor, 0.08);

        // Inner glow — slightly larger than core, semi-transparent
        this.innerGlow = scene.add.circle(0, 0, CELL_SIZE * 0.32, dimColor, 0.4);

        // Core particle — small bright circle (white with faint dimension tint)
        const coreColor = dim === Dimension.A ? 0xddeeff : 0xffeeDD;
        this.core = scene.add.circle(0, 0, CELL_SIZE * 0.16, coreColor, 1);
        this.core.setStrokeStyle(1.5, 0xffffff, 0.8);

        this.container = scene.add.container(x, y, [this.outerAura, this.innerGlow, this.core]);
        this.container.setDepth(100);

        // Pulse animation — subtle scale breathing (2 second cycle)
        scene.tweens.add({
            targets: this.container,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Outer aura pulse — slow fade in/out
        scene.tweens.add({
            targets: this.outerAura,
            scaleX: 1.4,
            scaleY: 1.4,
            alpha: 0.04,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Inner glow subtle pulse
        scene.tweens.add({
            targets: this.innerGlow,
            alpha: 0.25,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // Create trail segments
        for (let i = 0; i < TRAIL.MAX_SEGMENTS; i++) {
            const seg = scene.add.circle(x, y, CELL_SIZE * 0.12, dimColor, 0);
            seg.setDepth(90);
            this.trailSegments.push(seg);
        }

        // Pre-create afterimage circles (reused on each move)
        for (let i = 0; i < 3; i++) {
            const img = scene.add.circle(x, y, CELL_SIZE * 0.14, coreColor, 0);
            img.setDepth(95);
            this.afterimages.push(img);
        }
    }

    moveTo(pixelX: number, pixelY: number, duration: number = ANIM.MOVE_DURATION): void {
        const prevX = this.container.x;
        const prevY = this.container.y;

        // Record trail position
        this.trailPositions.unshift({ x: prevX, y: prevY });
        if (this.trailPositions.length > TRAIL.MAX_SEGMENTS) {
            this.trailPositions.pop();
        }

        // Motion blur afterimages
        this.spawnAfterimages(prevX, prevY, pixelX, pixelY, duration);

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

    private spawnAfterimages(
        fromX: number, fromY: number,
        toX: number, toY: number,
        duration: number,
    ): void {
        const dimColor = this.dimension === Dimension.A ? 0xddeeff : 0xffeeDD;

        for (let i = 0; i < 3; i++) {
            const t = (i + 1) / 4; // 0.25, 0.5, 0.75 along path
            const ix = fromX + (toX - fromX) * t;
            const iy = fromY + (toY - fromY) * t;
            const alpha = 0.4 - i * 0.12;

            const img = this.afterimages[i];
            img.setPosition(fromX, fromY);
            img.setFillStyle(dimColor, alpha);
            img.setAlpha(alpha);
            img.setScale(1 - i * 0.15);

            this.scene.tweens.add({
                targets: img,
                x: ix,
                y: iy,
                alpha: 0,
                duration: duration * 1.5,
                delay: i * 15,
                ease: 'Power2',
            });
        }
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
        for (const img of this.afterimages) {
            img.setPosition(pixelX, pixelY);
            img.setAlpha(0);
        }
    }

    setCollapsed(active: boolean): void {
        if (active) {
            this.core.setAlpha(1);
            this.innerGlow.setAlpha(0.4);
            this.outerAura.setAlpha(0.12);
        } else {
            this.core.setAlpha(0.3);
            this.innerGlow.setAlpha(0.1);
            this.outerAura.setAlpha(0.02);
        }
    }

    setNormal(): void {
        this.core.setAlpha(1);
        this.innerGlow.setAlpha(0.4);
        this.outerAura.setAlpha(0.08);
    }

    destroy(): void {
        this.container.destroy();
        for (const seg of this.trailSegments) {
            seg.destroy();
        }
        for (const img of this.afterimages) {
            img.destroy();
        }
    }

    getContainer(): GameObjects.Container {
        return this.container;
    }
}
