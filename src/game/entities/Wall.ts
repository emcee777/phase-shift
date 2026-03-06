// Phase Shift — Wall rendering
// Beveled look: lighter top-left edge, darker bottom-right edge
// Faint dimension-colored tint instead of neutral gray

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';
import { Dimension } from '../types';

export function createWall(
    scene: Scene,
    x: number, y: number,
    dim: Dimension,
): GameObjects.Container {
    const size = CELL_SIZE - 2;
    const color = dim === Dimension.A ? COLORS.DIM_A_DARK : COLORS.DIM_B_DARK;

    const gfx = scene.add.graphics();

    // Main body
    gfx.fillStyle(color, 1);
    gfx.fillRect(-size / 2, -size / 2, size, size);

    // Top edge — lighter bevel
    gfx.fillStyle(0xffffff, 0.08);
    gfx.fillRect(-size / 2, -size / 2, size, 3);
    // Left edge — lighter bevel
    gfx.fillStyle(0xffffff, 0.06);
    gfx.fillRect(-size / 2, -size / 2, 3, size);

    // Bottom edge — darker bevel
    gfx.fillStyle(0x000000, 0.15);
    gfx.fillRect(-size / 2, size / 2 - 3, size, 3);
    // Right edge — darker bevel
    gfx.fillStyle(0x000000, 0.12);
    gfx.fillRect(size / 2 - 3, -size / 2, 3, size);

    // Subtle outer stroke
    gfx.lineStyle(1, COLORS.WALL_STROKE, 0.25);
    gfx.strokeRect(-size / 2, -size / 2, size, size);

    const container = scene.add.container(x, y, [gfx]);
    container.setDepth(15);
    return container;
}
