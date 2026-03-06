// Phase Shift — Collapse pickup rendering
// Glowing diamond orb with pulsing aura

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS } from '../config/constants';

export function createCollapsePickup(scene: Scene, x: number, y: number): GameObjects.Container {
    const size = CELL_SIZE * 0.3;

    // Outer glow aura
    const aura = scene.add.circle(0, 0, size * 2, COLORS.COLLAPSE_PICKUP, 0.05);

    // Inner glow ring
    const glowRing = scene.add.circle(0, 0, size * 1.3, COLORS.COLLAPSE_PICKUP, 0.1);

    // Diamond shape
    const diamond = scene.add.polygon(0, 0, [
        { x: 0, y: -size },
        { x: size, y: 0 },
        { x: 0, y: size },
        { x: -size, y: 0 },
    ], COLORS.COLLAPSE_PICKUP, 0.7);
    diamond.setStrokeStyle(1, COLORS.COLLAPSE_PICKUP_GLOW, 0.8);

    // Bright center dot
    const center = scene.add.circle(0, 0, 2.5, COLORS.COLLAPSE_PICKUP_GLOW, 0.9);

    const container = scene.add.container(x, y, [aura, glowRing, diamond, center]);
    container.setDepth(25);

    // Rotate diamond
    scene.tweens.add({
        targets: diamond,
        angle: 360,
        duration: 4000,
        repeat: -1,
        ease: 'Linear',
    });

    // Pulse aura
    scene.tweens.add({
        targets: aura,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 0.02,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Pulse inner glow
    scene.tweens.add({
        targets: glowRing,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.04,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Center brightness pulse
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
