// Phase Shift — Preloader
// Minimal preloader (all graphics are procedural)

import { Scene } from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    create(): void {
        // Brief flash of the title as loading screen
        this.cameras.main.setBackgroundColor(COLORS.BG);
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'PHASE SHIFT', {
            fontFamily: '"Courier New", monospace',
            fontSize: '32px',
            color: '#ffffff',
        }).setOrigin(0.5).setAlpha(0.3);

        // Proceed immediately (no assets to load)
        this.time.delayedCall(300, () => {
            this.scene.start('MainMenu');
        });
    }
}
