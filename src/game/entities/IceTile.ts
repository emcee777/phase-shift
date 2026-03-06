// Phase Shift — Ice tile rendering

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';

export function createIceTile(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE - 2;

    const bg = scene.add.rectangle(0, 0, size, size, COLORS.ICE, 0.15);
    bg.setStrokeStyle(1, COLORS.ICE_STROKE, 0.3);

    // Diagonal lines for ice texture
    const line1 = scene.add.line(0, 0,
        -size * 0.3, -size * 0.3, size * 0.3, size * 0.3,
        COLORS.ICE_STROKE, 0.15);
    const line2 = scene.add.line(0, 0,
        size * 0.1, -size * 0.4, -size * 0.1, size * 0.4,
        COLORS.ICE_STROKE, 0.1);

    const container = scene.add.container(x, y, [bg, line1, line2]);
    container.setDepth(5);
    return container;
}
