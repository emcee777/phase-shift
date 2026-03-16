// Phase Shift — Game configuration

import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { WorldSelect } from './scenes/WorldSelect';
import { LevelSelectScene } from './scenes/LevelSelectScene';
import { LevelScene } from './scenes/LevelScene';
import { Game as LegacyGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { WEBGL, Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './config/constants';

const config: Phaser.Types.Core.GameConfig = {
    type: WEBGL,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: COLORS.BG,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT,
        parent: 'game-container',
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        WorldSelect,
        LevelSelectScene,
        LevelScene,
        LegacyGame,
        GameOver,
    ],
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent });
};

export default StartGame;
