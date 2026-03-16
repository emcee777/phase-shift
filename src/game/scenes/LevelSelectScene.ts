// Phase Shift — LevelSelectScene
// Grid of 20 levels within a world

import { Scene } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { ProgressManager } from '../systems/ProgressManager';
import { WORLD_NAMES } from '../config/levels';

export class LevelSelectScene extends Scene {
    private progress!: ProgressManager;
    private selectedWorld = 1;

    constructor() {
        super('LevelSelectScene');
    }

    init(data: { world: number }): void {
        this.selectedWorld = data.world || 1;
    }

    create(): void {
        this.progress = new ProgressManager();
        this.cameras.main.setBackgroundColor(COLORS.BG);

        // Fade in from previous scene
        this.cameras.main.fadeIn(400, 0, 0, 0);

        const world = this.selectedWorld;
        const worldName = WORLD_NAMES[world] || `World ${world}`;

        // Title
        this.add.text(GAME_WIDTH / 2, 50, `World ${world}: ${worldName}`, {
            ...FONTS.SUBTITLE,
            fontSize: '28px',
        }).setOrigin(0.5);

        // Star count
        const totalStars = this.progress.getWorldStars(world);
        this.add.text(GAME_WIDTH / 2, 85, `Stars: ${totalStars} / 60`, {
            ...FONTS.LEVEL_NAME,
            color: '#ffdd44',
        }).setOrigin(0.5);

        // Level grid: 5 columns x 4 rows
        const cols = 5;
        const cellW = 130;
        const cellH = 130;
        const gridW = cols * cellW;
        const startX = (GAME_WIDTH - gridW) / 2 + cellW / 2;
        const startY = 130;

        for (let i = 0; i < 20; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * cellH;
            const levelNum = i + 1;

            const completed = this.progress.isLevelCompleted(world, levelNum);
            const stars = this.progress.getLevelStars(world, levelNum);
            const bestMoves = this.progress.getBestMoves(world, levelNum);
            const unlocked = levelNum === 1 || this.progress.isLevelCompleted(world, levelNum - 1);

            this.createLevelCell(x, y, levelNum, completed, stars, bestMoves, unlocked);
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
                this.scene.start('WorldSelect');
            });
        });

        this.add.text(80, GAME_HEIGHT - 40, 'BACK', {
            ...FONTS.BUTTON, fontSize: '14px',
        }).setOrigin(0.5);
    }

    private createLevelCell(
        x: number, y: number, level: number,
        completed: boolean, stars: number, bestMoves: number | null,
        unlocked: boolean,
    ): void {
        const size = 100;
        const bgColor = unlocked
            ? (completed ? 0x1a3a1a : COLORS.BUTTON)
            : 0x1a1a2e;

        const bg = this.add.rectangle(x, y, size, size, bgColor, 0.8);
        bg.setStrokeStyle(1, unlocked ? COLORS.BUTTON_HOVER : 0x333344, 0.4);

        if (unlocked) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
            bg.on('pointerout', () => bg.setFillStyle(bgColor));
            bg.on('pointerdown', () => {
                this.cameras.main.fadeOut(400, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('LevelScene', {
                        world: this.selectedWorld,
                        level,
                    });
                });
            });
        }

        // Level number
        this.add.text(x, y - 15, String(level), {
            fontFamily: '"Courier New", monospace',
            fontSize: unlocked ? '24px' : '20px',
            color: unlocked ? '#ffffff' : '#555566',
        }).setOrigin(0.5);

        if (unlocked && completed) {
            // Stars
            for (let s = 0; s < 3; s++) {
                const filled = s < stars;
                this.add.circle(
                    x + (s - 1) * 18, y + 18, 6,
                    filled ? COLORS.STAR_GOLD : COLORS.STAR_EMPTY,
                    filled ? 0.9 : 0.3,
                );
            }
            // Best moves
            if (bestMoves !== null) {
                this.add.text(x, y + 38, `${bestMoves} moves`, {
                    fontFamily: '"Courier New", monospace',
                    fontSize: '9px',
                    color: '#8888aa',
                }).setOrigin(0.5);
            }
        } else if (!unlocked) {
            this.add.text(x, y + 16, 'LOCKED', {
                fontFamily: '"Courier New", monospace',
                fontSize: '9px',
                color: '#555566',
            }).setOrigin(0.5);
        }
    }
}
