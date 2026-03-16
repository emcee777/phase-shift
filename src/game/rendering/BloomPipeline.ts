// Phase Shift — Bloom/Glow post-processing
// Uses Phaser's built-in BloomFXPipeline + VignetteFX via camera.postFX
// Requires WebGL renderer (set in main.ts)

import { Scene } from 'phaser';

/**
 * Apply soft bloom + vignette to the main camera.
 * Low intensity for elegant puzzle aesthetic, not neon.
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
        1,         // offsetX
        1,         // offsetY
        1,         // blurStrength — soft blur
        0.25,      // strength — LOW for elegance
    );

    // Subtle vignette — draws eye toward center split, ~25% radius falloff
    camera.postFX.addVignette(0.5, 0.5, 0.25);

    return bloom;
}

/**
 * Remove bloom/FX from camera.
 */
export function removeBloom(scene: Scene): void {
    const camera = scene.cameras.main;
    if (camera.postFX) {
        camera.postFX.clear();
    }
}
