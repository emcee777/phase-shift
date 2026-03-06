// Phase Shift — Exit portal rendering (pulsing ring)

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, ANIM } from '../config/constants';

export function createExitPortal(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE - 6;

    // Outer glow ring
    const outerRing = scene.add.circle(0, 0, size * 0.45, COLORS.EXIT, 0.08);
    outerRing.setStrokeStyle(2, COLORS.EXIT_GLOW, 0.5);

    // Inner ring
    const innerRing = scene.add.circle(0, 0, size * 0.25, COLORS.EXIT, 0.12);
    innerRing.setStrokeStyle(1, COLORS.EXIT_GLOW, 0.7);

    // Center dot
    const center = scene.add.circle(0, 0, 3, COLORS.EXIT_GLOW, 0.8);

    const container = scene.add.container(x, y, [outerRing, innerRing, center]);
    container.setDepth(10);

    // Pulse animation
    scene.tweens.add({
        targets: outerRing,
        scaleX: 1.15,
        scaleY: 1.15,
        alpha: 0.04,
        duration: ANIM.EXIT_PULSE,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: innerRing,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: ANIM.EXIT_PULSE * 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: center,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    return container;
}
