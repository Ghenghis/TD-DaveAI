import Phaser from 'phaser';

export const SceneKeys = {
  Boot: 'BootScene',
  Menu: 'MenuScene',
  Play: 'PlayScene',
  GameOver: 'GameOverScene',
} as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  preload(): void {
    this.load.path = '/assets/';

    // Tile sprites
    this.load.image('tile-grass', 'td-pack/PNG/Default size/towerDefense_tile024.png');
    this.load.image('tile-path', 'td-pack/PNG/Default size/towerDefense_tile280.png');
    this.load.image('tile-spawn', 'td-pack/PNG/Default size/towerDefense_tile248.png');
    this.load.image('tile-goal', 'td-pack/PNG/Default size/towerDefense_tile249.png');

    // Towers
    this.load.image('tower-arrow', 'td-pack/PNG/Default size/towerDefense_tile249.png');
    this.load.image('tower-cannon', 'td-pack/PNG/Default size/towerDefense_tile250.png');
    this.load.image('tower-frost', 'td-pack/PNG/Default size/towerDefense_tile251.png');
    this.load.image('tower-barracks', 'td-pack/PNG/Default size/towerDefense_tile252.png');

    // Enemies
    this.load.image('enemy-soldier', 'td-pack/PNG/Default size/towerDefense_tile245.png');
    this.load.image('enemy-runner', 'td-pack/PNG/Default size/towerDefense_tile246.png');
    this.load.image('enemy-tank', 'td-pack/PNG/Default size/towerDefense_tile268.png');
    this.load.image('enemy-armored', 'td-pack/PNG/Default size/towerDefense_tile269.png');

    this.load.image('bullet', 'td-pack/PNG/Default size/towerDefense_tile272.png');

    this.load.audio('sfx-shoot', 'audio/impact/Audio/impactPlate_light_000.ogg');
    this.load.audio('sfx-hit', 'audio/impact/Audio/impactPlate_medium_000.ogg');
    this.load.audio('sfx-build', 'audio/ui/Audio/click_001.ogg');
  }

  create(): void {
    this.scene.start(SceneKeys.Menu);
  }
}
