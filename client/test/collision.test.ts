import { describe, it, expect } from 'vitest';
import { advanceBullets } from '../src/game/systems/collision.js';
import { createBullet } from '../src/game/entities/Bullet.js';
import { createTower } from '../src/game/entities/Tower.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const towerDef = {
  kind: 'arrow' as const,
  displayName: 'Arrow',
  cost: 50,
  range: 100,
  damage: 10,
  fireRateMs: 600,
  armorPenalty: 0.5,
};
const enemyDef = { kind: 'soldier' as const, hp: 30, speed: 50, bounty: 8, armor: false };

describe('advanceBullets', () => {
  it('moves bullet toward target', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 600, 0);
    const b = createBullet(t, e, 300);
    advanceBullets([b], 1.0);
    expect(b.x).toBeCloseTo(300, 1);
  });

  it('hits target and deals damage when within hit radius', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 10, 0);
    const b = createBullet(t, e, 600);
    advanceBullets([b], 0.1);
    expect(e.hp).toBe(20);
    expect(b.alive).toBe(false);
  });

  it('applies armor penalty against armored enemies', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const armored = createEnemy({ ...enemyDef, kind: 'armored', armor: true }, 10, 0);
    const b = createBullet(t, armored, 600);
    advanceBullets([b], 0.1);
    expect(armored.hp).toBe(25);
  });

  it('marks enemy dead when hp drops to <= 0', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy({ ...enemyDef, hp: 5 }, 10, 0);
    const b = createBullet(t, e, 600);
    advanceBullets([b], 0.1);
    expect(e.alive).toBe(false);
  });

  it('despawns bullet when its target died', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 100, 0);
    const b = createBullet(t, e, 300);
    e.alive = false;
    advanceBullets([b], 0.1);
    expect(b.alive).toBe(false);
  });
});
