import { describe, it, expect } from 'vitest';
import { acquireTargets } from '../src/game/systems/targeting.js';
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

describe('acquireTargets', () => {
  it('picks an enemy within range', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    acquireTargets([t], [e]);
    expect(t.target?.id).toBe(e.id);
  });

  it('skips enemies out of range', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 200, 0);
    acquireTargets([t], [e]);
    expect(t.target).toBeNull();
  });

  it('prefers enemy further along path (higher pathIndex/pathT)', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e1 = createEnemy(enemyDef, 40, 0);
    const e2 = createEnemy(enemyDef, 60, 0);
    e1.pathIndex = 0;
    e1.pathT = 0.1;
    e2.pathIndex = 0;
    e2.pathT = 0.5;
    acquireTargets([t], [e1, e2]);
    expect(t.target?.id).toBe(e2.id);
  });

  it('releases dead or out-of-range targets', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    t.target = e;
    e.alive = false;
    acquireTargets([t], [e]);
    expect(t.target).toBeNull();
  });

  it('keeps current target if still valid', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const cur = createEnemy(enemyDef, 50, 0);
    const other = createEnemy(enemyDef, 30, 0);
    t.target = cur;
    acquireTargets([t], [cur, other]);
    expect(t.target?.id).toBe(cur.id);
  });

  it('skips towers with zero range (e.g. barracks)', () => {
    const barracks = createTower({ ...towerDef, kind: 'barracks', range: 0 }, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    acquireTargets([barracks], [e]);
    expect(barracks.target).toBeNull();
  });
});
