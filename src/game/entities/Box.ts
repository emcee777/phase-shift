// Phase Shift — Box rendering
// Rounded corners, inner gradient effect, squash-and-stretch push animation

import { GameObjects, Scene } from 'phaser';
import { CELL_SIZE, COLORS, ANIM } from '../config/constants';
import { Direction } from '../types';

export function createBox(
    scene: Scene, x: number, y: number, entangled: boolean = false,
): GameObjects.Container {
    const size = CELL_SIZE - 8;
    const radius = 6;
    const color = entangled ? COLORS.ENTANGLED_BOX : COLORS.BOX;
    const stroke = entangled ? COLORS.ENTANGLED_BOX_STROKE : COLORS.BOX_STROKE;

    // Draw rounded rectangle via Graphics
    const gfx = scene.add.graphics();

    // Body — main fill
    gfx.fillStyle(color, 0.85);
    gfx.fillRoundedRect(-size / 2, -size / 2, size, size, radius);

    // Gradient illusion — lighter strip at top
    gfx.fillStyle(0xffffff, 0.08);
    gfx.fillRoundedRect(-size / 2, -size / 2, size, size * 0.45, { tl: radius, tr: radius, bl: 0, br: 0 });

    // Darker strip at bottom
    gfx.fillStyle(0x000000, 0.12);
    gfx.fillRoundedRect(-size / 2, size * 0.05, size, size * 0.45, { tl: 0, tr: 0, bl: radius, br: radius });

    // Stroke
    gfx.lineStyle(1.5, stroke, 0.7);
    gfx.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);

    const items: GameObjects.GameObject[] = [gfx];

    // Inner detail — diamond for entangled, cross for regular
    if (entangled) {
        const diamond = scene.add.polygon(0, 0, [
            { x: 0, y: -size * 0.25 },
            { x: size * 0.25, y: 0 },
            { x: 0, y: size * 0.25 },
            { x: -size * 0.25, y: 0 },
        ], COLORS.ENTANGLED_BOX_STROKE, 0.25);
        items.push(diamond);

        // Subtle pulsing glow for entangled boxes
        const aura = scene.add.circle(0, 0, size * 0.45, COLORS.ENTANGLED_BOX, 0.06);
        items.push(aura);
        scene.tweens.add({
            targets: aura,
            alpha: 0.12,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });
    } else {
        const cross1 = scene.add.line(0, 0,
            -size * 0.2, -size * 0.2, size * 0.2, size * 0.2, stroke, 0.2);
        const cross2 = scene.add.line(0, 0,
            size * 0.2, -size * 0.2, -size * 0.2, size * 0.2, stroke, 0.2);
        items.push(cross1, cross2);
    }

    const container = scene.add.container(x, y, items);
    container.setDepth(50);
    return container;
}

/**
 * Animate a box being pushed with squash-and-stretch.
 * Squashes in push direction, stretches perpendicular, then settles.
 */
export function animateBoxPush(
    scene: Scene, box: GameObjects.Container,
    toX: number, toY: number,
    _direction?: Direction,
): void {
    const dx = toX - box.x;
    const dy = toY - box.y;
    const isHorizontal = Math.abs(dx) > Math.abs(dy);

    // Phase 1: Squash in push direction
    const squashX = isHorizontal ? 0.85 : 1.1;
    const squashY = isHorizontal ? 1.1 : 0.85;

    scene.tweens.add({
        targets: box,
        scaleX: squashX,
        scaleY: squashY,
        duration: ANIM.BOX_PUSH_DURATION * 0.3,
        ease: 'Power1',
        onComplete: () => {
            // Phase 2: Stretch as it moves
            scene.tweens.add({
                targets: box,
                scaleX: isHorizontal ? 1.08 : 0.95,
                scaleY: isHorizontal ? 0.95 : 1.08,
                duration: ANIM.BOX_PUSH_DURATION * 0.4,
                ease: 'Power1',
                onComplete: () => {
                    // Phase 3: Settle back to normal
                    scene.tweens.add({
                        targets: box,
                        scaleX: 1,
                        scaleY: 1,
                        duration: ANIM.BOX_PUSH_DURATION * 0.5,
                        ease: 'Back.easeOut',
                    });
                },
            });
        },
    });

    // Position tween runs concurrently
    scene.tweens.add({
        targets: box,
        x: toX,
        y: toY,
        duration: ANIM.BOX_PUSH_DURATION,
        ease: 'Power2',
    });
}

/**
 * Draw a faint pulsing connection line between entangled box pairs.
 * Returns the graphics object for cleanup.
 */
export function createEntanglementLine(
    scene: Scene,
    x1: number, y1: number,
    x2: number, y2: number,
): GameObjects.Graphics {
    const gfx = scene.add.graphics();
    gfx.setDepth(45);

    const drawLine = (alpha: number) => {
        gfx.clear();
        gfx.lineStyle(1, COLORS.ENTANGLED_BOX_STROKE, alpha);

        // Dotted line effect
        const dx = x2 - x1;
        const dy = y2 - y1;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(dist / 8);
        const nx = dx / dist;
        const ny = dy / dist;

        for (let i = 0; i < segments; i += 2) {
            const sx = x1 + nx * i * 8;
            const sy = y1 + ny * i * 8;
            const ex = x1 + nx * Math.min((i + 1) * 8, dist);
            const ey = y1 + ny * Math.min((i + 1) * 8, dist);
            gfx.lineBetween(sx, sy, ex, ey);
        }
    };

    drawLine(0.15);

    // Pulse alpha
    const pulseObj = { alpha: 0.15 };
    scene.tweens.add({
        targets: pulseObj,
        alpha: 0.08,
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: () => drawLine(pulseObj.alpha),
    });

    return gfx;
}
