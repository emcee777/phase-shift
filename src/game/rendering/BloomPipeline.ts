// Phase Shift — Bloom/Glow post-processing
// Uses Phaser's built-in BloomFXPipeline via camera.postFX
// Requires WebGL renderer (set in main.ts)

import { Scene } from 'phaser';

/**
 * Apply a soft bloom effect to the main camera.
 * Low intensity for elegant glow, not neon.
 */
export function applyBloom(scene: Scene): Phaser.FX.Bloom | null {
    const camera = scene.cameras.main;

    // postFX is only available in WebGL mode
    if (!camera.postFX) {
        return null;
    }

    // addBloom(color, offsetX, offsetY, blurStrength, strength, steps)
    // Low strength (0.25) for subtle, elegant glow
    const bloom = camera.postFX.addBloom(
        0xffffff,  // color — white to bloom all bright areas equally
        0.5,       // offsetX — slight spread
        0.5,       // offsetY — slight spread
        0.8,       // blurStrength — soft blur
        0.25,      // strength — LOW for elegance
        6,         // steps — quality
    );

    return bloom;
}

/**
 * Remove bloom from camera.
 */
export function removeBloom(scene: Scene): void {
    const camera = scene.cameras.main;
    if (camera.postFX) {
        camera.postFX.clear();
    }
}
