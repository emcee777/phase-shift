// Phase Shift — Phase Gate rendering (shimmering portal)

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, ANIM } from '../config/constants';
import { Dimension } from '../types';

export function createPhaseGate(
    scene: Scene, x: number, y: number,
    permeableDim?: Dimension,
): GameObjects.Container {
    const size = CELL_SIZE - 4;
    const color = COLORS.PHASE_GATE;
    const glow = COLORS.PHASE_GATE_GLOW;

    // Background shimmer
    const bg = scene.add.rectangle(0, 0, size, size, color, 0.15);
    bg.setStrokeStyle(1, glow, 0.5);

    // Inner rings
    const ring1 = scene.add.circle(0, 0, size * 0.35, color, 0.1);
    ring1.setStrokeStyle(1, glow, 0.4);

    const ring2 = scene.add.circle(0, 0, size * 0.2, color, 0.15);
    ring2.setStrokeStyle(1, glow, 0.6);

    // Dimension indicator letter
    const items: GameObjects.GameObject[] = [bg, ring1, ring2];

    if (permeableDim) {
        const letter = scene.add.text(0, 0, permeableDim === Dimension.A ? 'A' : 'B', {
            fontFamily: '"Courier New", monospace',
            fontSize: '12px',
            color: permeableDim === Dimension.A ? '#4a9eff' : '#ff8c4a',
        }).setOrigin(0.5);
        items.push(letter);
    }

    const container = scene.add.container(x, y, items);
    container.setDepth(20);

    // Shimmer animation
    scene.tweens.add({
        targets: ring1,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.05,
        duration: ANIM.PHASE_GATE_SHIMMER,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: ring2,
        scaleX: 0.8,
        scaleY: 0.8,
        alpha: 0.3,
        duration: ANIM.PHASE_GATE_SHIMMER * 0.7,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    return container;
}
