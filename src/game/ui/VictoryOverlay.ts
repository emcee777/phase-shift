// Phase Shift — VictoryOverlay
// Level complete: moves taken, par comparison, stars pop in with sparkle

import { Scene, GameObjects } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class VictoryOverlay {
    private scene: Scene;
    private container: GameObjects.Container;
    private stars: GameObjects.Arc[] = [];
    private onNext: (() => void) | null = null;
    private onReplay: (() => void) | null = null;
    private onMenu: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(500);
        this.container.setAlpha(0);
    }

    show(
        moves: number,
        par: [number, number, number],
        starCount: number,
        hasNextLevel: boolean,
        callbacks: {
            onNext?: () => void;
            onReplay?: () => void;
            onMenu?: () => void;
        },
    ): void {
        this.onNext = callbacks.onNext || null;
        this.onReplay = callbacks.onReplay || null;
        this.onMenu = callbacks.onMenu || null;

        this.container.removeAll(true);
        this.stars = [];

        // Darkened background
        const overlay = this.scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT,
            COLORS.OVERLAY_BG, 0.75,
        );
        this.container.add(overlay);

        // Panel
        const panelW = 380;
        const panelH = 320;
        const panelX = GAME_WIDTH / 2;
        const panelY = GAME_HEIGHT / 2;

        const panel = this.scene.add.rectangle(panelX, panelY, panelW, panelH, COLORS.HUD_BG, 0.95);
        panel.setStrokeStyle(2, COLORS.EXIT, 0.6);
        this.container.add(panel);

        // Title
        const title = this.scene.add.text(panelX, panelY - 120, 'LEVEL COMPLETE', {
            fontFamily: '"Courier New", monospace',
            fontSize: '28px',
            color: '#44ff44',
        }).setOrigin(0.5);
        this.container.add(title);

        // Stars with glow backing
        const starY = panelY - 65;
        for (let i = 0; i < 3; i++) {
            const x = panelX + (i - 1) * 50;
            const filled = i < starCount;

            // Glow behind star
            if (filled) {
                const starGlow = this.scene.add.circle(x, starY, 25, COLORS.STAR_GOLD, 0);
                this.container.add(starGlow);

                // Animate glow in with star
                this.scene.tweens.add({
                    targets: starGlow,
                    alpha: 0.12,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    duration: 300,
                    delay: 500 + i * 200,
                    ease: 'Power2',
                });
            }

            const star = this.scene.add.circle(
                x, starY, 18,
                filled ? COLORS.STAR_GOLD : COLORS.STAR_EMPTY,
                filled ? 0.9 : 0.3,
            );
            star.setStrokeStyle(2, filled ? COLORS.STAR_GOLD : COLORS.STAR_EMPTY, 0.5);
            this.container.add(star);
            this.stars.push(star);
        }

        // Moves text
        const movesText = this.scene.add.text(panelX, panelY - 15, `Moves: ${moves}`, {
            ...FONTS.HUD,
            fontSize: '20px',
        }).setOrigin(0.5);
        this.container.add(movesText);

        // Par text
        const parText = this.scene.add.text(
            panelX, panelY + 15,
            `Par: ${par[0]} (Gold)  ${par[1]} (Silver)  ${par[2]} (Bronze)`,
            { ...FONTS.LEVEL_NAME },
        ).setOrigin(0.5);
        this.container.add(parText);

        // Buttons
        const buttonY = panelY + 75;
        const buttonSpacing = hasNextLevel ? 110 : 80;

        if (hasNextLevel) {
            this.createButton(panelX - buttonSpacing, buttonY, 'REPLAY', () => this.onReplay?.());
            this.createButton(panelX, buttonY, 'NEXT', () => this.onNext?.());
            this.createButton(panelX + buttonSpacing, buttonY, 'MENU', () => this.onMenu?.());
        } else {
            this.createButton(panelX - buttonSpacing, buttonY, 'REPLAY', () => this.onReplay?.());
            this.createButton(panelX + buttonSpacing, buttonY, 'MENU', () => this.onMenu?.());
        }

        // Animate in
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 400,
            ease: 'Power2',
        });

        // Animate stars popping in one at a time with sparkle
        this.stars.forEach((star, i) => {
            if (i < starCount) {
                star.setScale(0);
                this.scene.tweens.add({
                    targets: star,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    delay: 400 + i * 200,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        // Sparkle burst on pop
                        this.spawnStarSparkle(star.x, star.y);
                    },
                });
            }
        });
    }

    private spawnStarSparkle(x: number, y: number): void {
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const dist = 12 + Math.random() * 8;
            const sparkle = this.scene.add.circle(x, y, 1.5, COLORS.STAR_GOLD, 0.8);
            this.container.add(sparkle);

            this.scene.tweens.add({
                targets: sparkle,
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 350,
                ease: 'Power2',
            });
        }
    }

    private createButton(x: number, y: number, label: string, onClick: () => void): void {
        const bg = this.scene.add.rectangle(x, y, 90, 36, COLORS.BUTTON, 0.9);
        bg.setStrokeStyle(1, COLORS.BUTTON_HOVER, 0.5);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(x, y, label, {
            fontFamily: '"Courier New", monospace',
            fontSize: '14px',
            color: '#ffffff',
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
        bg.on('pointerout', () => bg.setFillStyle(COLORS.BUTTON));
        bg.on('pointerdown', onClick);

        this.container.add([bg, text]);
    }

    hide(): void {
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                this.container.removeAll(true);
            },
        });
    }

    destroy(): void {
        this.container.destroy(true);
    }
}
