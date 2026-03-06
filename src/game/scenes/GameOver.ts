// Phase Shift — GameOver scene (legacy, redirects to MainMenu)
import { Scene } from 'phaser';

export class GameOver extends Scene {
    constructor() {
        super('GameOver');
    }

    create(): void {
        this.scene.start('MainMenu');
    }
}
