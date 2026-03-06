// Phase Shift — Box rendering

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, ANIM } from '../config/constants';

export function createBox(
    scene: Scene, x: number, y: number, entangled: boolean = false,
): GameObjects.Container {
    const size = CELL_SIZE - 8;
    const color = entangled ? COLORS.ENTANGLED_BOX : COLORS.BOX;
    const stroke = entangled ? COLORS.ENTANGLED_BOX_STROKE : COLORS.BOX_STROKE;

    const rect = scene.add.rectangle(0, 0, size, size, color, 0.85);
    rect.setStrokeStyle(2, stroke, 0.8);

    const items: GameObjects.GameObject[] = [rect];

    // Inner detail — cross pattern for regular, diamond for entangled
    if (entangled) {
        const diamond = scene.add.polygon(0, 0, [
            { x: 0, y: -size * 0.3 },
            { x: size * 0.3, y: 0 },
            { x: 0, y: size * 0.3 },
            { x: -size * 0.3, y: 0 },
        ], COLORS.ENTANGLED_BOX_STROKE, 0.3);
        items.push(diamond);
    } else {
        const cross1 = scene.add.line(0, 0, -size * 0.25, -size * 0.25, size * 0.25, size * 0.25, stroke, 0.3);
        const cross2 = scene.add.line(0, 0, size * 0.25, -size * 0.25, -size * 0.25, size * 0.25, stroke, 0.3);
        items.push(cross1, cross2);
    }

    const container = scene.add.container(x, y, items);
    container.setDepth(50);
    return container;
}

export function animateBoxPush(
    scene: Scene, box: GameObjects.Container,
    toX: number, toY: number,
): void {
    scene.tweens.add({
        targets: box,
        x: toX,
        y: toY,
        duration: ANIM.BOX_PUSH_DURATION,
        ease: 'Power2',
    });
}
