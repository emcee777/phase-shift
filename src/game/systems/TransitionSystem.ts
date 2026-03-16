// Phase Shift — TransitionSystem
// Level transition animations
// v2: split-reveal for level entry (dim A slides from left, dim B from right)

import { Scene } from 'phaser';
import { COLORS, ANIM, GAME_WIDTH, GAME_HEIGHT, PANEL_WIDTH, HUD_HEIGHT } from '../config/constants';

export class TransitionSystem {
    private scene: Scene;
    private overlay: Phaser.GameObjects.Rectangle | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    /**
     * Fade in from black. Call when a level starts.
     */
    fadeIn(duration: number = ANIM.TRANSITION_DURATION): Promise<void> {
        return new Promise((resolve) => {
            this.overlay = this.scene.add.rectangle(
                GAME_WIDTH / 2, GAME_HEIGHT / 2,
                GAME_WIDTH, GAME_HEIGHT,
                COLORS.OVERLAY_BG, 1,
            );
            this.overlay.setDepth(1000);

            this.scene.tweens.add({
                targets: this.overlay,
                alpha: 0,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    this.overlay?.destroy();
                    this.overlay = null;
                    resolve();
                },
            });
        });
    }

    /**
     * Fade out to black. Call when leaving a level.
     */
    fadeOut(duration: number = ANIM.TRANSITION_DURATION): Promise<void> {
        return new Promise((resolve) => {
            this.overlay = this.scene.add.rectangle(
                GAME_WIDTH / 2, GAME_HEIGHT / 2,
                GAME_WIDTH, GAME_HEIGHT,
                COLORS.OVERLAY_BG, 0,
            );
            this.overlay.setDepth(1000);

            this.scene.tweens.add({
                targets: this.overlay,
                alpha: 1,
                duration,
                ease: 'Power2',
                onComplete: () => {
                    resolve();
                },
            });
        });
    }

    /**
     * Split-reveal entry: two curtains slide away from center.
     * Dimension A panel is revealed from the left side (curtain slides left),
     * Dimension B panel is revealed from the right side (curtain slides right).
     * Duration ~450ms for a crisp reveal that doesn't delay gameplay.
     */
    splitReveal(duration: number = 450): void {
        const panelH = GAME_HEIGHT - HUD_HEIGHT;
        const panelY = HUD_HEIGHT + panelH / 2;

        // Left curtain covers Dimension A — starts in place, slides left to reveal
        const curtainA = this.scene.add.rectangle(
            PANEL_WIDTH / 2, panelY,
            PANEL_WIDTH, panelH,
            COLORS.OVERLAY_BG, 1,
        );
        curtainA.setDepth(999);

        // Right curtain covers Dimension B — starts in place, slides right to reveal
        const curtainB = this.scene.add.rectangle(
            PANEL_WIDTH + PANEL_WIDTH / 2, panelY,
            PANEL_WIDTH, panelH,
            COLORS.OVERLAY_BG, 1,
        );
        curtainB.setDepth(999);

        // Slide left curtain out to the left
        this.scene.tweens.add({
            targets: curtainA,
            x: -PANEL_WIDTH / 2,
            duration,
            ease: 'Cubic.easeOut',
            onComplete: () => curtainA.destroy(),
        });

        // Slide right curtain out to the right
        this.scene.tweens.add({
            targets: curtainB,
            x: GAME_WIDTH + PANEL_WIDTH / 2,
            duration,
            ease: 'Cubic.easeOut',
            onComplete: () => curtainB.destroy(),
        });
    }

    /**
     * Smooth fade for world/level navigation (400ms).
     */
    sceneFade(duration: number = 400): Promise<void> {
        return this.fadeOut(duration);
    }

    /**
     * Clean up overlay if scene is shutting down.
     */
    destroy(): void {
        this.overlay?.destroy();
        this.overlay = null;
    }
}
