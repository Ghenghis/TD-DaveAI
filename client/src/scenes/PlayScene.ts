import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';
import mapData from '../game/data/maps/grasslands.json' with { type: 'json' };
import towersData from '../game/data/towers.json' with { type: 'json' };
import enemiesData from '../game/data/enemies.json' with { type: 'json' };
import { createEnemy, type Enemy, type EnemyDef } from '../game/entities/Enemy.js';
import { createTower, type Tower, type TowerDef } from '../game/entities/Tower.js';
import type { Bullet } from '../game/entities/Bullet.js';
import { advanceMovement } from '../game/systems/movement.js';
import { acquireTargets } from '../game/systems/targeting.js';
import { fireTowers } from '../game/systems/firing.js';
import { advanceBullets } from '../game/systems/collision.js';
import { SpawnQueue } from '../game/systems/spawn.js';
import { Economy } from '../game/systems/economy.js';
import { Lives } from '../game/systems/lives.js';
import { WaveDirectorClient } from '../game/WaveDirectorClient.js';
import type { EnemyKind, TowerKind, WaveSpawn } from '@td/shared';

interface MapDef {
  width: number;
  height: number;
  tileSize: number;
  spawn: [number, number];
  goal: [number, number];
  path: [number, number][];
  buildableMask: boolean[][];
}

interface SceneEvents {
  onHudUpdate(state: {
    lives: number;
    gold: number;
    wave: number;
    aiSource: 'ai' | 'fallback' | 'pending';
    fallbackCount: number;
  }): void;
  onGameOver(wave: number): void;
}

export class PlayScene extends Phaser.Scene {
  private map!: MapDef;
  private pathPx!: [number, number][];
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private bullets: Bullet[] = [];
  private enemyDefs!: Record<EnemyKind, EnemyDef>;
  private towerDefs!: Record<TowerKind, TowerDef>;
  private spawnQueue!: SpawnQueue;
  private economy!: Economy;
  private lives!: Lives;
  private waveNumber = 0;
  private waveElapsedMs = 0;
  private interWaveDelayMs = 0;
  private waveActive = false;
  private leakedThisWave = 0;
  private waveStartMs = 0;
  private aiSource: 'ai' | 'fallback' | 'pending' = 'pending';
  private fallbackCount = 0;
  private selectedTowerKind: TowerKind = 'arrow';
  private director = new WaveDirectorClient();
  private sceneEvents?: SceneEvents;

  private enemySprites = new Map<number, Phaser.GameObjects.Image>();
  private towerSprites = new Map<number, Phaser.GameObjects.Image>();
  private bulletSprites = new Map<number, Phaser.GameObjects.Image>();

  constructor() {
    super(SceneKeys.Play);
  }

  init(data?: { events?: SceneEvents }): void {
    this.sceneEvents = data?.events;
    this.enemies = [];
    this.towers = [];
    this.bullets = [];
    this.enemySprites.clear();
    this.towerSprites.clear();
    this.bulletSprites.clear();
    this.waveNumber = 0;
    this.waveActive = false;
    this.aiSource = 'pending';
    this.fallbackCount = 0;
  }

  create(): void {
    this.map = mapData as MapDef;
    this.pathPx = this.map.path.map(([x, y]) => [
      x * this.map.tileSize + this.map.tileSize / 2,
      y * this.map.tileSize + this.map.tileSize / 2,
    ]);
    this.enemyDefs = Object.fromEntries(
      (enemiesData as EnemyDef[]).map((d) => [d.kind, d]),
    ) as Record<EnemyKind, EnemyDef>;
    this.towerDefs = Object.fromEntries(
      (towersData as TowerDef[]).map((d) => [d.kind, d]),
    ) as Record<TowerKind, TowerDef>;
    this.economy = new Economy(150);
    this.lives = new Lives(20);

    this.drawTiles();
    this.drawPath();
    this.setupBuildInput();
    void this.startNextWave();
    this.emitHud();
  }

  override update(time: number, deltaMs: number): void {
    const dtSec = deltaMs / 1000;
    if (!this.waveActive) {
      this.interWaveDelayMs -= deltaMs;
      if (this.interWaveDelayMs <= 0) void this.startNextWave();
      this.updateAllSprites();
      return;
    }
    this.waveElapsedMs += deltaMs;
    const newSpawns = this.spawnQueue.tick(this.waveElapsedMs);
    for (const s of newSpawns) this.spawnEnemyFromSchedule(s);
    advanceMovement(
      this.enemies,
      this.pathPx,
      dtSec,
      (id) => this.onLeaked(id),
      this.waveElapsedMs,
    );
    acquireTargets(this.towers, this.enemies);
    const fired = fireTowers(this.towers, deltaMs);
    for (const b of fired) this.addBullet(b);
    advanceBullets(this.bullets, dtSec);
    this.collectDead();
    this.updateAllSprites();
    if (this.spawnQueue.done() && this.enemies.length === 0) this.endWave();
    if (this.lives.gameOver()) this.endGame();
  }

  private async startNextWave(): Promise<void> {
    this.waveNumber += 1;
    this.aiSource = 'pending';
    this.emitHud();
    const req = {
      waveNumber: this.waveNumber,
      lives: this.lives.remaining,
      gold: this.economy.gold,
      towersBuilt: this.summarizeTowers(),
      previousWaveOutcome:
        this.waveStartMs > 0
          ? {
              enemiesLeaked: this.leakedThisWave,
              timeToFinishMs: performance.now() - this.waveStartMs,
            }
          : undefined,
    };
    const resp = await this.director.fetchNext(req);
    this.aiSource = resp.source;
    if (resp.source === 'fallback') this.fallbackCount += 1;
    this.spawnQueue = new SpawnQueue(resp.spawns);
    this.waveElapsedMs = 0;
    this.waveActive = true;
    this.leakedThisWave = 0;
    this.waveStartMs = performance.now();
    this.emitHud();
  }

  private endWave(): void {
    this.waveActive = false;
    this.interWaveDelayMs = 3000;
  }

  private endGame(): void {
    this.scene.start(SceneKeys.GameOver, { wave: this.waveNumber });
  }

  private onLeaked(_id: number): void {
    this.lives.onLeaked();
    this.leakedThisWave += 1;
    this.emitHud();
  }

  private spawnEnemyFromSchedule(s: WaveSpawn): void {
    const def = this.enemyDefs[s.enemyKind];
    if (!def) return;
    const e = createEnemy(def, this.pathPx[0]![0], this.pathPx[0]![1]);
    this.enemies.push(e);
    const sprite = this.add.image(e.x, e.y, `enemy-${e.def.kind}`).setDisplaySize(48, 48);
    this.enemySprites.set(e.id, sprite);
  }

  private addBullet(b: Bullet): void {
    this.bullets.push(b);
    const sprite = this.add.image(b.x, b.y, 'bullet').setDisplaySize(16, 16);
    this.bulletSprites.set(b.id, sprite);
  }

  private collectDead(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      if (!e.alive) {
        const s = this.enemySprites.get(e.id);
        s?.destroy();
        this.enemySprites.delete(e.id);
        if (e.hp <= 0) this.economy.reward(e.def.bounty);
        this.enemies.splice(i, 1);
      }
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      if (!b.alive) {
        const s = this.bulletSprites.get(b.id);
        s?.destroy();
        this.bulletSprites.delete(b.id);
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateAllSprites(): void {
    for (const e of this.enemies) {
      const s = this.enemySprites.get(e.id);
      if (s) {
        s.x = e.x;
        s.y = e.y;
      }
    }
    for (const b of this.bullets) {
      const s = this.bulletSprites.get(b.id);
      if (s) {
        s.x = b.x;
        s.y = b.y;
      }
    }
  }

  private drawTiles(): void {
    const ts = this.map.tileSize;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const buildable = this.map.buildableMask[y]?.[x] ?? false;
        this.add
          .image(x * ts + ts / 2, y * ts + ts / 2, buildable ? 'tile-grass' : 'tile-path')
          .setDisplaySize(ts, ts);
      }
    }
    this.add
      .image(this.map.spawn[0] * ts + ts / 2, this.map.spawn[1] * ts + ts / 2, 'tile-spawn')
      .setDisplaySize(ts, ts);
    this.add
      .image(this.map.goal[0] * ts + ts / 2, this.map.goal[1] * ts + ts / 2, 'tile-goal')
      .setDisplaySize(ts, ts);
  }

  private drawPath(): void {
    const g = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00, alpha: 0.3 } });
    g.beginPath();
    g.moveTo(this.pathPx[0]![0], this.pathPx[0]![1]);
    for (let i = 1; i < this.pathPx.length; i++) g.lineTo(this.pathPx[i]![0], this.pathPx[i]![1]);
    g.strokePath();
  }

  private setupBuildInput(): void {
    const ts = this.map.tileSize;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const tileX = Math.floor(p.x / ts);
      const tileY = Math.floor(p.y / ts);
      if (!this.canBuildAt(tileX, tileY)) return;
      const def = this.towerDefs[this.selectedTowerKind];
      if (!this.economy.canAfford(def.cost)) return;
      this.economy.spend(def.cost);
      const px = tileX * ts + ts / 2,
        py = tileY * ts + ts / 2;
      const t = createTower(def, tileX, tileY, px, py);
      this.towers.push(t);
      const sprite = this.add.image(px, py, `tower-${def.kind}`).setDisplaySize(ts, ts);
      this.towerSprites.set(t.id, sprite);
      try {
        this.sound.play('sfx-build');
      } catch {
        /* audio not loaded, ignore */
      }
      this.emitHud();
    });
  }

  setSelectedTower(kind: TowerKind): void {
    this.selectedTowerKind = kind;
  }

  private canBuildAt(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.map.height || tileX < 0 || tileX >= this.map.width) return false;
    if (!this.map.buildableMask[tileY]?.[tileX]) return false;
    return !this.towers.some((t) => t.tileX === tileX && t.tileY === tileY);
  }

  private summarizeTowers(): { kind: TowerKind; count: number }[] {
    const counts = new Map<TowerKind, number>();
    for (const t of this.towers) counts.set(t.def.kind, (counts.get(t.def.kind) ?? 0) + 1);
    return Array.from(counts, ([kind, count]) => ({ kind, count }));
  }

  private emitHud(): void {
    this.sceneEvents?.onHudUpdate({
      lives: this.lives.remaining,
      gold: this.economy.gold,
      wave: this.waveNumber,
      aiSource: this.aiSource,
      fallbackCount: this.fallbackCount,
    });
  }
}
