import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver);
  }

  create(data: { wave?: number }): void {
    const { width, height } = this.scale;
    const wave = data.wave ?? 0;
    this.add
      .text(width / 2, height / 2 - 60, 'GAME OVER', {
        fontSize: '64px',
        color: '#ff4444',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, height / 2, `Reached wave ${wave}`, {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    const retry = this.add
      .text(width / 2, height / 2 + 80, '▶  RETRY', {
        fontSize: '28px',
        color: '#88ff88',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.start(SceneKeys.Play));
    const menu = this.add
      .text(width / 2, height / 2 + 130, '↩  Menu', {
        fontSize: '20px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start(SceneKeys.Menu));
  }
}
