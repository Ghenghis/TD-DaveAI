import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 80, 'TD-DaveAI', {
        fontSize: '64px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const play = this.add
      .text(width / 2, height / 2 + 20, '▶  PLAY', {
        fontSize: '36px',
        color: '#88ff88',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    play.on('pointerdown', () => this.scene.start(SceneKeys.Play));
    play.on('pointerover', () => play.setColor('#ccffcc'));
    play.on('pointerout', () => play.setColor('#88ff88'));

    this.add
      .text(width / 2, height - 40, 'v1 vertical slice', {
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);
  }
}
