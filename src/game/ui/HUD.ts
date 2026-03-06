// Phase Shift — HUD
// Displays level info, move count, collapse charges, undo indicator

import { Scene, GameObjects } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, HUD_HEIGHT } from '../config/constants';
import { Dimension } from '../types';

export class HUD {
    private scene: Scene;
    private container: GameObjects.Container;
    private levelText: GameObjects.Text;
    private moveText: GameObjects.Text;
    private collapseText: GameObjects.Text;
    private collapseIndicators: GameObjects.Arc[] = [];
    private undoText: GameObjects.Text;
    private dimALabel: GameObjects.Text;
    private dimBLabel: GameObjects.Text;
    private collapseStatus: GameObjects.Text;

    constructor(scene: Scene) {
        this.scene = scene;

        // Background bar
        const bg = scene.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT / 2, GAME_WIDTH, HUD_HEIGHT, COLORS.HUD_BG);
        bg.setDepth(200);

        // Divider line at bottom of HUD
        const divider = scene.add.rectangle(GAME_WIDTH / 2, HUD_HEIGHT, GAME_WIDTH, 2, COLORS.DIVIDER, 0.5);
        divider.setDepth(201);

        // Level name (left)
        this.levelText = scene.add.text(16, HUD_HEIGHT / 2, '', {
            ...FONTS.HUD,
        }).setOrigin(0, 0.5).setDepth(210);

        // Move counter (center-left)
        this.moveText = scene.add.text(280, HUD_HEIGHT / 2, 'Moves: 0', {
            ...FONTS.HUD,
        }).setOrigin(0, 0.5).setDepth(210);

        // Collapse charges (center)
        this.collapseText = scene.add.text(440, HUD_HEIGHT / 2, '', {
            ...FONTS.HUD,
        }).setOrigin(0, 0.5).setDepth(210);

        // Collapse mode status
        this.collapseStatus = scene.add.text(GAME_WIDTH / 2, HUD_HEIGHT / 2, '', {
            ...FONTS.HUD, color: '#ffdd44',
        }).setOrigin(0.5, 0.5).setDepth(210);

        // Undo hint (right)
        this.undoText = scene.add.text(GAME_WIDTH - 16, HUD_HEIGHT / 2, 'Z:Undo  R:Restart', {
            ...FONTS.LEVEL_NAME,
        }).setOrigin(1, 0.5).setDepth(210);

        // Dimension labels
        this.dimALabel = scene.add.text(GAME_WIDTH / 4, HUD_HEIGHT + 14, 'DIMENSION A', {
            fontFamily: '"Courier New", monospace',
            fontSize: '11px',
            color: '#4a9eff',
        }).setOrigin(0.5).setDepth(210).setAlpha(0.6);

        this.dimBLabel = scene.add.text((GAME_WIDTH * 3) / 4, HUD_HEIGHT + 14, 'DIMENSION B', {
            fontFamily: '"Courier New", monospace',
            fontSize: '11px',
            color: '#ff8c4a',
        }).setOrigin(0.5).setDepth(210).setAlpha(0.6);

        this.container = scene.add.container(0, 0, [
            bg, divider, this.levelText, this.moveText,
            this.collapseText, this.collapseStatus, this.undoText,
            this.dimALabel, this.dimBLabel,
        ]);
        this.container.setDepth(200);
    }

    setLevel(name: string, world: number, level: number): void {
        this.levelText.setText(`${world}-${level}: ${name}`);
    }

    setMoves(count: number, par?: [number, number, number]): void {
        let text = `Moves: ${count}`;
        if (par) {
            text += ` (Par: ${par[0]})`;
        }
        this.moveText.setText(text);

        // Color based on par
        if (par) {
            if (count <= par[0]) {
                this.moveText.setColor('#44ff44');
            } else if (count <= par[1]) {
                this.moveText.setColor('#ffdd44');
            } else {
                this.moveText.setColor('#ccccdd');
            }
        }
    }

    setCollapseCharges(current: number, max: number): void {
        if (max === 0) {
            this.collapseText.setText('');
            // Clean up indicators
            for (const ind of this.collapseIndicators) ind.destroy();
            this.collapseIndicators = [];
            return;
        }

        this.collapseText.setText('Collapse: ');

        // Rebuild indicators
        for (const ind of this.collapseIndicators) ind.destroy();
        this.collapseIndicators = [];

        const startX = this.collapseText.x + this.collapseText.width + 8;
        for (let i = 0; i < max; i++) {
            const filled = i < current;
            const dot = this.scene.add.circle(
                startX + i * 18, HUD_HEIGHT / 2, 5,
                filled ? COLORS.COLLAPSE_ACTIVE : COLORS.COLLAPSE_INACTIVE,
                filled ? 0.9 : 0.3,
            ).setDepth(210);
            this.collapseIndicators.push(dot);
        }
    }

    setCollapseMode(dim: Dimension | null): void {
        if (dim) {
            const label = dim === Dimension.A ? 'COLLAPSED: DIM A' : 'COLLAPSED: DIM B';
            const color = dim === Dimension.A ? '#4a9eff' : '#ff8c4a';
            this.collapseStatus.setText(label).setColor(color);
        } else {
            this.collapseStatus.setText('');
        }
    }

    destroy(): void {
        this.container.destroy(true);
        for (const ind of this.collapseIndicators) ind.destroy();
    }
}
