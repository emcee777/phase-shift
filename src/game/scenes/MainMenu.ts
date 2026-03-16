// Phase Shift — Main Menu Scene
// Clean, minimalist title screen

import { Scene } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { ProgressManager } from '../systems/ProgressManager';

export class MainMenu extends Scene {
    private progress!: ProgressManager;

    constructor() {
        super('MainMenu');
    }

    create(): void {
        this.progress = new ProgressManager();
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Subtle grid background
        this.drawBackgroundGrid();

        // Title
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.28, 'PHASE', {
            fontFamily: '"Courier New", monospace',
            fontSize: '72px',
            color: '#4a9eff',
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.38, 'SHIFT', {
            fontFamily: '"Courier New", monospace',
            fontSize: '72px',
            color: '#ff8c4a',
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.48, 'A Quantum Puzzle Game', {
            ...FONTS.SUBTITLE,
            fontSize: '16px',
        }).setOrigin(0.5).setAlpha(0.6);

        // Play button
        const playBtn = this.createButton(GAME_WIDTH / 2, GAME_HEIGHT * 0.62, 'PLAY', 180, 48);
        playBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('WorldSelect');
            });
        });

        // Star count
        const totalStars = this.progress.getTotalStars();
        if (totalStars > 0) {
            this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.74, `Total Stars: ${totalStars}`, {
                ...FONTS.LEVEL_NAME,
                color: '#ffdd44',
            }).setOrigin(0.5);
        }

        // Controls hint
        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.88, 'Arrow Keys / WASD to move  |  Z: Undo  |  R: Restart', {
            ...FONTS.LEVEL_NAME,
        }).setOrigin(0.5).setAlpha(0.4);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT * 0.92, 'Q/E: Collapse into Dimension A/B  |  ESC: Pause', {
            ...FONTS.LEVEL_NAME,
        }).setOrigin(0.5).setAlpha(0.4);

        // Pulsing particles decoration
        this.createDecoParticle(GAME_WIDTH * 0.2, GAME_HEIGHT * 0.3, COLORS.DIM_A_PRIMARY);
        this.createDecoParticle(GAME_WIDTH * 0.8, GAME_HEIGHT * 0.3, COLORS.DIM_B_PRIMARY);
    }

    private drawBackgroundGrid(): void {
        const graphics = this.add.graphics();
        graphics.lineStyle(1, COLORS.FLOOR_LINE, 0.15);

        for (let x = 0; x < GAME_WIDTH; x += 48) {
            graphics.lineBetween(x, 0, x, GAME_HEIGHT);
        }
        for (let y = 0; y < GAME_HEIGHT; y += 48) {
            graphics.lineBetween(0, y, GAME_WIDTH, y);
        }
    }

    private createButton(x: number, y: number, label: string, w: number, h: number): Phaser.GameObjects.Rectangle {
        const bg = this.add.rectangle(x, y, w, h, COLORS.BUTTON, 0.9);
        bg.setStrokeStyle(2, COLORS.DIM_A_PRIMARY, 0.5);
        bg.setInteractive({ useHandCursor: true });

        this.add.text(x, y, label, {
            ...FONTS.BUTTON,
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
        bg.on('pointerout', () => bg.setFillStyle(COLORS.BUTTON));

        return bg;
    }

    private createDecoParticle(x: number, y: number, color: number): void {
        const circle = this.add.circle(x, y, 8, color, 0.3);
        const glow = this.add.circle(x, y, 20, color, 0.06);

        this.tweens.add({
            targets: [circle, glow],
            y: y + 20,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.tweens.add({
            targets: glow,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0.03,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    }
}
