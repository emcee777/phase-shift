// Phase Shift — Wall rendering

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';
import { Dimension } from '../types';

export function createWall(
    scene: Scene,
    x: number, y: number,
    dim: Dimension,
): GameObjects.Rectangle {
    const color = dim === Dimension.A ? COLORS.DIM_A_DARK : COLORS.DIM_B_DARK;
    const strokeColor = COLORS.WALL_STROKE;

    const rect = scene.add.rectangle(x, y, CELL_SIZE - 2, CELL_SIZE - 2, color);
    rect.setStrokeStyle(1, strokeColor, 0.4);
    return rect;
}
