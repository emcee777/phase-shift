// Phase Shift — Ice tile rendering
// Crystalline look with subtle shine and directional lines

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';

export function createIceTile(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE - 2;

    const gfx = scene.add.graphics();

    // Base fill — faint ice blue
    gfx.fillStyle(COLORS.ICE, 0.12);
    gfx.fillRect(-size / 2, -size / 2, size, size);

    // Shine highlight at top-left
    gfx.fillStyle(0xffffff, 0.06);
    gfx.fillTriangle(
        -size / 2, -size / 2,
        size / 2, -size / 2,
        -size / 2, size / 2,
    );

    // Diagonal crystalline lines
    gfx.lineStyle(1, COLORS.ICE_STROKE, 0.12);
    gfx.lineBetween(-size * 0.3, -size * 0.3, size * 0.3, size * 0.3);
    gfx.lineStyle(1, COLORS.ICE_STROKE, 0.08);
    gfx.lineBetween(size * 0.1, -size * 0.4, -size * 0.1, size * 0.4);
    gfx.lineStyle(1, COLORS.ICE_STROKE, 0.06);
    gfx.lineBetween(-size * 0.35, size * 0.1, size * 0.15, -size * 0.35);

    // Subtle border
    gfx.lineStyle(1, COLORS.ICE_STROKE, 0.2);
    gfx.strokeRect(-size / 2, -size / 2, size, size);

    const container = scene.add.container(x, y, [gfx]);
    container.setDepth(5);
    return container;
}
