// Phase Shift — TutorialOverlay
// In-level hint text displayed at the top of the play area

import { Scene, GameObjects } from 'phaser';
import { FONTS, GAME_WIDTH, HUD_HEIGHT } from '../config/constants';

export class TutorialOverlay {
    private scene: Scene;
    private container: GameObjects.Container;
    private bg: GameObjects.Rectangle;
    private text: GameObjects.Text;
    private visible = false;

    constructor(scene: Scene) {
        this.scene = scene;

        this.bg = scene.add.rectangle(
            GAME_WIDTH / 2, HUD_HEIGHT + 30, GAME_WIDTH - 40, 40,
            0x000000, 0.7,
        );
        this.bg.setDepth(300);

        this.text = scene.add.text(GAME_WIDTH / 2, HUD_HEIGHT + 30, '', {
            ...FONTS.TUTORIAL,
        }).setOrigin(0.5).setDepth(301);

        this.container = scene.add.container(0, 0, [this.bg, this.text]);
        this.container.setAlpha(0);
        this.container.setDepth(300);
    }

    show(message: string, duration: number = 5000): void {
        this.text.setText(message);

        // Resize background to fit text
        this.bg.width = Math.min(this.text.width + 32, GAME_WIDTH - 20);
        this.bg.height = this.text.height + 16;

        this.visible = true;
        this.container.setAlpha(0);

        // Fade in
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 300,
            ease: 'Power2',
        });

        // Auto-hide after duration
        if (duration > 0) {
            this.scene.time.delayedCall(duration, () => {
                this.hide();
            });
        }
    }

    hide(): void {
        if (!this.visible) return;
        this.visible = false;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
        });
    }

    destroy(): void {
        this.container.destroy(true);
    }
}
