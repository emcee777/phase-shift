// Phase Shift — TransitionSystem
// Level transition animations (fade in/out)

import { Scene } from 'phaser';
import { COLORS, ANIM, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

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
     * Clean up overlay if scene is shutting down.
     */
    destroy(): void {
        this.overlay?.destroy();
        this.overlay = null;
    }
}
