// Phase Shift — Boot scene
// Minimal initialization, no assets to load (all procedural)

import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    create(): void {
        this.scene.start('Preloader');
    }
}
