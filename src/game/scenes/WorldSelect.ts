// Phase Shift — WorldSelect scene
// World selection (10 worlds), shows progress per world

import { Scene } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { ProgressManager } from '../systems/ProgressManager';
import { WORLD_NAMES, TOTAL_WORLDS } from '../config/levels';

export class WorldSelect extends Scene {
    private progress!: ProgressManager;

    constructor() {
        super('WorldSelect');
    }

    create(): void {
        this.progress = new ProgressManager();
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Fade in from previous scene
        this.cameras.main.fadeIn(400, 0, 0, 0);

        // Title
        this.add.text(GAME_WIDTH / 2, 50, 'SELECT WORLD', {
            ...FONTS.TITLE,
            fontSize: '36px',
        }).setOrigin(0.5);

        // Total stars
        const totalStars = this.progress.getTotalStars();
        this.add.text(GAME_WIDTH / 2, 90, `Total Stars: ${totalStars} / ${TOTAL_WORLDS * 60}`, {
            ...FONTS.LEVEL_NAME,
            color: '#ffdd44',
        }).setOrigin(0.5);

        // World grid: 2 columns x 5 rows
        const cols = 2;
        const cellW = 400;
        const cellH = 110;
        const startX = GAME_WIDTH / 2 - cellW / 2;
        const startY = 130;

        for (let i = 0; i < TOTAL_WORLDS; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * cellH;
            const worldNum = i + 1;

            this.createWorldCard(x, y, worldNum);
        }

        // Back button
        const backBg = this.add.rectangle(80, GAME_HEIGHT - 40, 120, 36, COLORS.BUTTON, 0.9);
        backBg.setStrokeStyle(1, COLORS.BUTTON_HOVER, 0.4);
        backBg.setInteractive({ useHandCursor: true });
        backBg.on('pointerover', () => backBg.setFillStyle(COLORS.BUTTON_HOVER));
        backBg.on('pointerout', () => backBg.setFillStyle(COLORS.BUTTON));
        backBg.on('pointerdown', () => {
            this.cameras.main.fadeOut(400, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MainMenu');
            });
        });

        this.add.text(80, GAME_HEIGHT - 40, 'BACK', {
            ...FONTS.BUTTON, fontSize: '14px',
        }).setOrigin(0.5);
    }

    private createWorldCard(x: number, y: number, world: number): void {
        const unlocked = this.progress.isWorldUnlocked(world);
        const stars = this.progress.getWorldStars(world);
        const completed = this.progress.getWorldCompletion(world);
        const name = WORLD_NAMES[world] || `World ${world}`;

        const cardW = 380;
        const cardH = 90;
        const centerX = x + cardW / 2;
        const centerY = y + cardH / 2;

        const bgColor = unlocked ? COLORS.BUTTON : 0x1a1a2e;
        const bg = this.add.rectangle(centerX, centerY, cardW, cardH, bgColor, 0.7);
        bg.setStrokeStyle(1, unlocked ? COLORS.DIVIDER : 0x222233, 0.5);

        if (unlocked) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
            bg.on('pointerout', () => bg.setFillStyle(bgColor));
            bg.on('pointerdown', () => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('LevelSelectScene', { world });
                });
            });
        }

        // World number
        const numColor = unlocked ? (world <= 5 ? '#4a9eff' : '#ff8c4a') : '#444455';
        this.add.text(x + 30, centerY - 12, String(world), {
            fontFamily: '"Courier New", monospace',
            fontSize: '32px',
            color: numColor,
        }).setOrigin(0.5);

        // World name
        this.add.text(x + 70, centerY - 14, name, {
            fontFamily: '"Courier New", monospace',
            fontSize: '18px',
            color: unlocked ? '#ffffff' : '#555566',
        }).setOrigin(0, 0.5);

        // Progress
        if (unlocked) {
            this.add.text(x + 70, centerY + 12, `${completed}/20 levels  |  ${stars}/60 stars`, {
                ...FONTS.LEVEL_NAME,
                color: '#8888aa',
            }).setOrigin(0, 0.5);
        } else {
            this.add.text(x + 70, centerY + 12, 'LOCKED', {
                ...FONTS.LEVEL_NAME,
                color: '#555566',
            }).setOrigin(0, 0.5);
        }

        // Star display
        if (unlocked && stars > 0) {
            const starX = x + cardW - 50;
            const starDot = this.add.circle(starX, centerY, 8, COLORS.STAR_GOLD, 0.8);
            this.add.text(starX + 14, centerY, String(stars), {
                fontFamily: '"Courier New", monospace',
                fontSize: '14px',
                color: '#ffdd44',
            }).setOrigin(0, 0.5);
            // Prevent unused var lint error
            starDot.setDepth(0);
        }
    }
}
