// Phase Shift — MenuUI
// Pause menu overlay (resume, restart, quit to menu)

import { Scene, GameObjects } from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

export class MenuUI {
    private scene: Scene;
    private container: GameObjects.Container;
    private visible = false;
    private onResume: (() => void) | null = null;
    private onRestart: (() => void) | null = null;
    private onQuit: (() => void) | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        this.container.setDepth(600);
        this.container.setAlpha(0);
        this.container.setVisible(false);
    }

    show(callbacks: {
        onResume: () => void;
        onRestart: () => void;
        onQuit: () => void;
    }): void {
        this.onResume = callbacks.onResume;
        this.onRestart = callbacks.onRestart;
        this.onQuit = callbacks.onQuit;
        this.visible = true;

        this.container.removeAll(true);

        // Darkened overlay
        const overlay = this.scene.add.rectangle(
            GAME_WIDTH / 2, GAME_HEIGHT / 2,
            GAME_WIDTH, GAME_HEIGHT,
            COLORS.OVERLAY_BG, 0.7,
        );
        overlay.setInteractive(); // Block clicks through
        this.container.add(overlay);

        // Panel
        const panelX = GAME_WIDTH / 2;
        const panelY = GAME_HEIGHT / 2;
        const panel = this.scene.add.rectangle(panelX, panelY, 280, 260, COLORS.HUD_BG, 0.95);
        panel.setStrokeStyle(2, COLORS.DIVIDER, 0.5);
        this.container.add(panel);

        // Title
        const title = this.scene.add.text(panelX, panelY - 90, 'PAUSED', {
            fontFamily: '"Courier New", monospace',
            fontSize: '28px',
            color: '#ffffff',
        }).setOrigin(0.5);
        this.container.add(title);

        // Buttons
        this.createMenuButton(panelX, panelY - 25, 'RESUME', () => this.onResume?.());
        this.createMenuButton(panelX, panelY + 25, 'RESTART', () => this.onRestart?.());
        this.createMenuButton(panelX, panelY + 75, 'QUIT TO MENU', () => this.onQuit?.());

        // Animate in
        this.container.setVisible(true);
        this.container.setAlpha(0);
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            duration: 200,
            ease: 'Power2',
        });
    }

    private createMenuButton(x: number, y: number, label: string, onClick: () => void): void {
        const bg = this.scene.add.rectangle(x, y, 200, 36, COLORS.BUTTON, 0.9);
        bg.setStrokeStyle(1, COLORS.BUTTON_HOVER, 0.4);
        bg.setInteractive({ useHandCursor: true });

        const text = this.scene.add.text(x, y, label, {
            fontFamily: '"Courier New", monospace',
            fontSize: '16px',
            color: '#ffffff',
        }).setOrigin(0.5);

        bg.on('pointerover', () => bg.setFillStyle(COLORS.BUTTON_HOVER));
        bg.on('pointerout', () => bg.setFillStyle(COLORS.BUTTON));
        bg.on('pointerdown', onClick);

        this.container.add([bg, text]);
    }

    hide(): void {
        if (!this.visible) return;
        this.visible = false;

        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            duration: 150,
            onComplete: () => {
                this.container.setVisible(false);
                this.container.removeAll(true);
            },
        });
    }

    isVisible(): boolean {
        return this.visible;
    }

    destroy(): void {
        this.container.destroy(true);
    }
}
