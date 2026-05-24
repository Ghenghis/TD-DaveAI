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
    // tile024 = solid green grass (confirmed correct)
    this.load.image('tile-grass', 'td-pack/PNG/Default size/towerDefense_tile024.png');
    // tile200 = brown dirt road with subtle centered stripe — reads as a real
    // road against the green grass; the stripe is short enough to look fine
    // on both horizontal and vertical path segments.
    this.load.image('tile-path', 'td-pack/PNG/Default size/towerDefense_tile200.png');
    // tile187 = green circle on sand — bright green spawn marker
    this.load.image('tile-spawn', 'td-pack/PNG/Default size/towerDefense_tile187.png');
    // tile197 = blue-grey scalloped circle on sand — visually distinct goal marker
    this.load.image('tile-goal', 'td-pack/PNG/Default size/towerDefense_tile197.png');

    // Towers — four visually distinct turret/tower sprites
    // tile249 = green tower body + grey barrel cap (arrow/basic tower)
    this.load.image('tower-arrow', 'td-pack/PNG/Default size/towerDefense_tile249.png');
    // tile204 = grey turret base with twin red rocket stubs (cannon)
    this.load.image('tower-cannon', 'td-pack/PNG/Default size/towerDefense_tile204.png');
    // tile205 = grey base with two upright missiles (frost/missile)
    this.load.image('tower-frost', 'td-pack/PNG/Default size/towerDefense_tile205.png');
    // tile206 = grey base with single large rocket (barracks/heavy)
    this.load.image('tower-barracks', 'td-pack/PNG/Default size/towerDefense_tile206.png');

    // Enemies — four top-down vehicle/unit sprites
    // tile245 = small green oval vehicle (soldier/jeep)
    this.load.image('enemy-soldier', 'td-pack/PNG/Default size/towerDefense_tile245.png');
    // tile246 = grey+red oval unit (runner — lighter armored)
    this.load.image('enemy-runner', 'td-pack/PNG/Default size/towerDefense_tile246.png');
    // tile247 = brown oval with green markings (tank — chunkier look)
    this.load.image('enemy-tank', 'td-pack/PNG/Default size/towerDefense_tile247.png');
    // tile248 = grey+teal oval (armored — heaviest non-tank)
    this.load.image('enemy-armored', 'td-pack/PNG/Default size/towerDefense_tile248.png');

    // tile272 = small yellow circle — clean bullet/projectile dot
    this.load.image('bullet', 'td-pack/PNG/Default size/towerDefense_tile272.png');

    this.load.audio('sfx-shoot', 'audio/impact/Audio/impactPlate_light_000.ogg');
    this.load.audio('sfx-hit', 'audio/impact/Audio/impactPlate_medium_000.ogg');
    this.load.audio('sfx-build', 'audio/ui/Audio/click1.ogg');
  }

  create(): void {
    this.scene.start(SceneKeys.Menu);
  }
}
