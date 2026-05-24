import { describe, it, expect } from 'vitest';
import { fireTowers } from '../src/game/systems/firing.js';
import { createTower } from '../src/game/entities/Tower.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const towerDef = {
  kind: 'arrow' as const,
  displayName: 'Arrow',
  cost: 50,
  range: 100,
  damage: 10,
  fireRateMs: 600,
};
const enemyDef = { kind: 'soldier' as const, hp: 30, speed: 50, bounty: 8, armor: false };

describe('fireTowers', () => {
  it('fires when target acquired and cooldown is 0', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    t.target = createEnemy(enemyDef, 50, 0);
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(1);
    expect(t.cooldownMs).toBe(towerDef.fireRateMs);
  });

  it('does not fire while cooldown remains', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    t.target = createEnemy(enemyDef, 50, 0);
    t.cooldownMs = 300;
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(0);
    expect(t.cooldownMs).toBe(284);
  });

  it('does not fire without a target', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(0);
  });

  it('skips zero-fireRate towers', () => {
    const barracks = createTower({ ...towerDef, kind: 'barracks', fireRateMs: 0 }, 0, 0, 0, 0);
    barracks.target = createEnemy(enemyDef, 50, 0);
    const bullets = fireTowers([barracks], 16);
    expect(bullets).toHaveLength(0);
  });
});
