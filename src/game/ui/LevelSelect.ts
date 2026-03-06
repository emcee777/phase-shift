// Phase Shift — LevelSelect
// World/level grid with star ratings, locked/unlocked states

import { Scene, GameObjects } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';
import { ProgressManager } from '../systems/ProgressManager';
import { WORLD_NAMES } from '../config/levels';

export class LevelSelect {
    private scene: Scene;
    private container: GameObjects.Container;
    private onLevelSelected: ((level: number) => void) | null = null;
    private onBack: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(100);
    }

    show(
        world: number,
        progress: ProgressManager,
        callbacks: {
            onLevelSelected: (level: number) => void;
            onBack: () => void;
        },
    ): void {
        this.onLevelSelected = callbacks.onLevelSelected;
        this.onBack = callbacks.onBack;
        this.container.removeAll(true);

        // Background
        const bg = this.scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT, COLORS.BG,
        );
        this.container.add(bg);

        // World title
        const worldName = WORLD_NAMES[world] || `World ${world}`;
        const title = this.scene.add.text(
            GAME_WIDTH / 2, 60,
            `World ${world}: ${worldName}`,
            { ...FONTS.SUBTITLE },
        ).setOrigin(0.5);
        this.container.add(title);

        // Star count for this world
        const totalStars = progress.getWorldStars(world);
        const starText = this.scene.add.text(
            GAME_WIDTH / 2, 95,
            `Stars: ${totalStars} / 60`,
            { ...FONTS.LEVEL_NAME },
        ).setOrigin(0.5);
        this.container.add(starText);

        // Level grid: 5 columns x 4 rows
        const cols = 5;
        const cellW = 120;
        const cellH = 120;
        const startX = GAME_WIDTH / 2 - (cols * cellW) / 2 + cellW / 2;
        const startY = 150;

        for (let i = 0; i < 20; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * cellH;
            const levelNum = i + 1;

            const completed = progress.isLevelCompleted(world, levelNum);
            const stars = progress.getLevelStars(world, levelNum);
            // A level is unlocked if it's level 1 or the previous level is completed
            const unlocked = levelNum === 1 || progress.isLevelCompleted(world, levelNum - 1);

            this.createLevelCell(x, y, levelNum, completed, stars, unlocked);
        }

        // Back button
        const backBg = this.scene.add.rectangle(80, GAME_HEIGHT - 40, 120, 36, COLORS.BUTTON, 0.9);
        backBg.setStrokeStyle(1, COLORS.BUTTON_HOVER, 0.4);
        backBg.setInteractive({ useHandCursor: true });
        backBg.on('pointerover', () => backBg.setFillStyle(COLORS.BUTTON_HOVER));
        backBg.on('pointerout', () => backBg.setFillStyle(COLORS.BUTTON));
        backBg.on('pointerdown', () => this.onBack?.());

        const backText = this.scene.add.text(80, GAME_HEIGHT - 40, 'BACK', {
            ...FONTS.BUTTON, fontSize: '14px',
        }).setOrigin(0.5);

        this.container.add([backBg, backText]);
    }

    private createLevelCell(
        x: number, y: number, level: number,
        completed: boolean, stars: number, unlocked: boolean,
    ): void {
        const size = 80;
        const bgColor = unlocked
            ? (completed ? 0x1a3a1a : COLORS.BUTTON)
            : 0x222233;

        const bg = this.scene.add.rectangle(x, y, size, size, bgColor, 0.8);
        bg.setStrokeStyle(1, unlocked ? COLORS.BUTTON_HOVER : 0x333344, 0.5);

        if (unlocked) {
            bg.setInteractive({ useHandCursor: true });
            bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
            bg.on('pointerout', () => bg.setFillStyle(bgColor));
            bg.on('pointerdown', () => this.onLevelSelected?.(level));
        }

        const numText = this.scene.add.text(x, y - 10, String(level), {
            fontFamily: '"Courier New", monospace',
            fontSize: unlocked ? '22px' : '18px',
            color: unlocked ? '#ffffff' : '#555566',
        }).setOrigin(0.5);

        this.container.add([bg, numText]);

        // Stars
        if (unlocked && completed) {
            for (let s = 0; s < 3; s++) {
                const filled = s < stars;
                const starDot = this.scene.add.circle(
                    x + (s - 1) * 16, y + 20, 5,
                    filled ? COLORS.STAR_GOLD : COLORS.STAR_EMPTY,
                    filled ? 0.9 : 0.3,
                );
                this.container.add(starDot);
            }
        } else if (!unlocked) {
            // Lock icon (simple)
            const lock = this.scene.add.text(x, y + 16, 'LOCKED', {
                fontFamily: '"Courier New", monospace',
                fontSize: '8px',
                color: '#555566',
            }).setOrigin(0.5);
            this.container.add(lock);
        }
    }

    destroy(): void {
        this.container.destroy(true);
    }
}
