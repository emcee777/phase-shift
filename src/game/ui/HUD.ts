// Phase Shift — HUD
// Displays level info, move count with color coding, collapse charges as glowing orbs

import { Scene, GameObjects } from 'phaser';
import { COLORS, FONTS, GAME_WIDTH, HUD_HEIGHT } from '../config/constants';
import { Dimension } from '../types';

export class HUD {
    private scene: Scene;
    private container: GameObjects.Container;
    private levelText: GameObjects.Text;
    private moveText: GameObjects.Text;
    private collapseText: GameObjects.Text;
    private collapseOrbs: Array<{ core: GameObjects.Arc; glow: GameObjects.Arc }> = [];
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

        // Color based on par — green below, yellow at, red above
        if (par) {
            if (count <= par[0]) {
                this.moveText.setColor('#44ff44');
            } else if (count <= par[1]) {
                this.moveText.setColor('#ffdd44');
            } else if (count <= par[2]) {
                this.moveText.setColor('#ff8844');
            } else {
                this.moveText.setColor('#ff4444');
            }
        }
    }

    setCollapseCharges(current: number, max: number): void {
        if (max === 0) {
            this.collapseText.setText('');
            this.clearOrbs();
            return;
        }

        this.collapseText.setText('Collapse: ');
        this.clearOrbs();

        const startX = this.collapseText.x + this.collapseText.width + 8;
        for (let i = 0; i < max; i++) {
            const filled = i < current;
            const orbX = startX + i * 22;
            const orbY = HUD_HEIGHT / 2;

            // Glow circle behind
            const glow = this.scene.add.circle(
                orbX, orbY, 8,
                filled ? COLORS.COLLAPSE_ACTIVE : COLORS.COLLAPSE_INACTIVE,
                filled ? 0.15 : 0.03,
            ).setDepth(209);

            // Core orb
            const core = this.scene.add.circle(
                orbX, orbY, 5,
                filled ? COLORS.COLLAPSE_ACTIVE : COLORS.COLLAPSE_INACTIVE,
                filled ? 0.9 : 0.2,
            ).setDepth(210);
            core.setStrokeStyle(1, filled ? COLORS.COLLAPSE_PICKUP_GLOW : COLORS.COLLAPSE_INACTIVE, filled ? 0.5 : 0.1);

            if (filled) {
                // Gentle pulse on filled orbs
                this.scene.tweens.add({
                    targets: glow,
                    scaleX: 1.3,
                    scaleY: 1.3,
                    alpha: 0.06,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                });
            }

            this.collapseOrbs.push({ core, glow });
        }
    }

    private clearOrbs(): void {
        for (const orb of this.collapseOrbs) {
            orb.core.destroy();
            orb.glow.destroy();
        }
        this.collapseOrbs = [];
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
        this.clearOrbs();
    }
}
