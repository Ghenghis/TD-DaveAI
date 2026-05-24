import Phaser from 'phaser';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;

export function startGame(parent: string | HTMLElement = 'game'): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#1a1a1a',
    scene: [],
  });
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  startGame();
}
