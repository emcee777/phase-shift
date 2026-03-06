// Phase Shift — Game scene (legacy, redirects to LevelScene)
import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create(): void {
        this.scene.start('LevelScene', { world: 1, level: 1 });
    }
}
