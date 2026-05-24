import Phaser from 'phaser';
import { BootScene, SceneKeys } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { PlayScene } from './scenes/PlayScene.js';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;

export function startGame(parent: string | HTMLElement = 'game'): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#1a1a1a',
    scene: [BootScene, MenuScene, PlayScene],
  });
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  startGame();
}

export { SceneKeys };
