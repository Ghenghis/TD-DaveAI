import { describe, it, expect } from 'vitest';
import { advanceMovement } from '../src/game/systems/movement.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const path: [number, number][] = [
  [0, 0],
  [100, 0],
  [100, 100],
];

function mkEnemy(speed = 50) {
  return createEnemy({ kind: 'soldier', hp: 10, speed, bounty: 1, armor: false }, 0, 0);
}

describe('advanceMovement', () => {
  it('advances along the first segment', () => {
    const e = mkEnemy(50);
    advanceMovement([e], path, 1.0);
    expect(e.x).toBeCloseTo(50, 1);
    expect(e.y).toBeCloseTo(0, 1);
    expect(e.pathIndex).toBe(0);
  });

  it('transitions to next segment when current segment finishes', () => {
    const e = mkEnemy(150);
    advanceMovement([e], path, 1.0);
    expect(e.pathIndex).toBe(1);
    expect(e.x).toBeCloseTo(100, 1);
    expect(e.y).toBeCloseTo(50, 1);
  });

  it('marks enemy as leaked when reaching the last node', () => {
    const e = mkEnemy(1000);
    const leaked: number[] = [];
    advanceMovement([e], path, 1.0, (id) => leaked.push(id));
    expect(leaked).toContain(e.id);
    expect(e.alive).toBe(false);
  });

  it('ignores dead enemies', () => {
    const e = mkEnemy(50);
    e.alive = false;
    const before = { ...e };
    advanceMovement([e], path, 1.0);
    expect(e.x).toBe(before.x);
    expect(e.y).toBe(before.y);
  });

  it('respects slow effect when active', () => {
    const e = mkEnemy(100);
    e.slowExpiresAtMs = 5000;
    advanceMovement([e], path, 1.0, undefined, 0, 0.5);
    expect(e.x).toBeCloseTo(50, 1);
  });
});
