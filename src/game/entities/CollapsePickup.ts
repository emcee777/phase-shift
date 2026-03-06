// Phase Shift — Collapse pickup rendering

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';

export function createCollapsePickup(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE * 0.3;

    // Diamond shape
    const diamond = scene.add.polygon(0, 0, [
        { x: 0, y: -size },
        { x: size, y: 0 },
        { x: 0, y: size },
        { x: -size, y: 0 },
    ], COLORS.COLLAPSE_PICKUP, 0.6);
    diamond.setStrokeStyle(1, COLORS.COLLAPSE_PICKUP_GLOW, 0.8);

    // Glow
    const glow = scene.add.circle(0, 0, size * 1.5, COLORS.COLLAPSE_PICKUP, 0.08);

    const container = scene.add.container(x, y, [glow, diamond]);
    container.setDepth(25);

    // Rotate animation
    scene.tweens.add({
        targets: diamond,
        angle: 360,
        duration: 4000,
        repeat: -1,
        ease: 'Linear',
    });

    scene.tweens.add({
        targets: glow,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.03,
        duration: 1500,
        yoyo: true,
        repeat: -1,
    });

    return container;
}
