import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';
import mapData from '../game/data/maps/grasslands.json' with { type: 'json' };

interface MapDef {
  width: number;
  height: number;
  tileSize: number;
  spawn: [number, number];
  goal: [number, number];
  path: [number, number][];
  buildableMask: boolean[][];
}

export class PlayScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Play);
  }

  create(): void {
    const map = mapData as MapDef;
    this.drawTiles(map);
    this.drawPath(map);
  }

  private drawTiles(map: MapDef): void {
    const ts = map.tileSize;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const buildable = map.buildableMask[y]?.[x] ?? false;
        const key = buildable ? 'tile-grass' : 'tile-path';
        this.add.image(x * ts + ts / 2, y * ts + ts / 2, key).setDisplaySize(ts, ts);
      }
    }
    this.add
      .image(map.spawn[0] * ts + ts / 2, map.spawn[1] * ts + ts / 2, 'tile-spawn')
      .setDisplaySize(ts, ts);
    this.add
      .image(map.goal[0] * ts + ts / 2, map.goal[1] * ts + ts / 2, 'tile-goal')
      .setDisplaySize(ts, ts);
  }

  private drawPath(map: MapDef): void {
    const ts = map.tileSize;
    const g = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00, alpha: 0.5 } });
    const pts = map.path.map(([x, y]) => ({ x: x * ts + ts / 2, y: y * ts + ts / 2 }));
    g.beginPath();
    g.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
    g.strokePath();
  }
}
