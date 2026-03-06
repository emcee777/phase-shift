// Phase Shift — Exit portal rendering
// Pulsing concentric rings with staggered timing, slow outer rotation

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, ANIM } from '../config/constants';

export function createExitPortal(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE - 6;

    // Ring 3 (outermost) — rotating container
    const ring3 = scene.add.circle(0, 0, size * 0.45, COLORS.EXIT, 0.05);
    ring3.setStrokeStyle(1.5, COLORS.EXIT_GLOW, 0.35);

    // Ring 2 (middle)
    const ring2 = scene.add.circle(0, 0, size * 0.32, COLORS.EXIT, 0.08);
    ring2.setStrokeStyle(1, COLORS.EXIT_GLOW, 0.5);

    // Ring 1 (inner)
    const ring1 = scene.add.circle(0, 0, size * 0.18, COLORS.EXIT, 0.12);
    ring1.setStrokeStyle(1, COLORS.EXIT_GLOW, 0.7);

    // Center dot — bright core
    const center = scene.add.circle(0, 0, 3, COLORS.EXIT_GLOW, 0.9);

    // Outer glow aura
    const aura = scene.add.circle(0, 0, size * 0.55, COLORS.EXIT, 0.04);

    const container = scene.add.container(x, y, [aura, ring3, ring2, ring1, center]);
    container.setDepth(10);

    // Staggered pulse on each ring
    scene.tweens.add({
        targets: ring3,
        scaleX: 1.15,
        scaleY: 1.15,
        alpha: 0.02,
        duration: ANIM.EXIT_PULSE,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: ring2,
        scaleX: 1.12,
        scaleY: 1.12,
        alpha: 0.04,
        duration: ANIM.EXIT_PULSE * 0.85,
        delay: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: ring1,
        scaleX: 0.85,
        scaleY: 0.85,
        alpha: 0.06,
        duration: ANIM.EXIT_PULSE * 0.7,
        delay: 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Center blinks gently
    scene.tweens.add({
        targets: center,
        alpha: 0.4,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Outer aura breathing
    scene.tweens.add({
        targets: aura,
        scaleX: 1.3,
        scaleY: 1.3,
        alpha: 0.01,
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Slow rotation of outermost ring — 1 revolution per 8 seconds
    scene.tweens.add({
        targets: ring3,
        angle: 360,
        duration: 8000,
        repeat: -1,
        ease: 'Linear',
    });

    return container;
}
