// Phase Shift — Phase Gate rendering
// Shimmering portal with vertical scan line and floating particles

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
    const bg = scene.add.rectangle(0, 0, size, size, color, 0.12);
    bg.setStrokeStyle(1, glow, 0.4);

    // Inner rings
    const ring1 = scene.add.circle(0, 0, size * 0.35, color, 0.08);
    ring1.setStrokeStyle(1, glow, 0.35);

    const ring2 = scene.add.circle(0, 0, size * 0.2, color, 0.12);
    ring2.setStrokeStyle(1, glow, 0.5);

    // Vertical scan line — thin bright line that scrolls through
    const scanLine = scene.add.rectangle(0, 0, 2, size, glow, 0.2);

    // Dimension indicator letter
    const items: GameObjects.GameObject[] = [bg, ring1, ring2, scanLine];

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

    // Shimmer animation on rings
    scene.tweens.add({
        targets: ring1,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0.04,
        duration: ANIM.PHASE_GATE_SHIMMER,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    scene.tweens.add({
        targets: ring2,
        scaleX: 0.8,
        scaleY: 0.8,
        alpha: 0.25,
        duration: ANIM.PHASE_GATE_SHIMMER * 0.7,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Scan line sweeps left to right continuously
    scene.tweens.add({
        targets: scanLine,
        x: { from: -size / 2, to: size / 2 },
        alpha: { from: 0.3, to: 0.05 },
        duration: 1800,
        repeat: -1,
        ease: 'Sine.easeInOut',
    });

    // Floating particles — 1-2 tiny dots float upward every 500ms
    scene.time.addEvent({
        delay: 600,
        loop: true,
        callback: () => {
            if (!container.active) return;
            const offsetX = (Math.random() - 0.5) * size * 0.6;
            const dot = scene.add.circle(
                x + offsetX, y + size * 0.3,
                1.5 + Math.random(), glow, 0.4,
            );
            dot.setDepth(22);

            scene.tweens.add({
                targets: dot,
                y: y - size * 0.5 - Math.random() * 10,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 800 + Math.random() * 400,
                ease: 'Power1',
                onComplete: () => dot.destroy(),
            });
        },
    });

    return container;
}
