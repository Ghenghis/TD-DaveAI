import { describe, it, expect } from 'vitest';
import { SpawnQueue } from '../src/game/systems/spawn.js';
import type { WaveSpawn } from '@td/shared';

const spawns: WaveSpawn[] = [
  { enemyKind: 'soldier', atMs: 0 },
  { enemyKind: 'runner', atMs: 500 },
  { enemyKind: 'tank', atMs: 1200 },
];

describe('SpawnQueue', () => {
  it('emits spawns whose atMs has elapsed', () => {
    const q = new SpawnQueue(spawns);
    expect(q.tick(0)).toEqual([{ enemyKind: 'soldier', atMs: 0 }]);
    expect(q.tick(400)).toEqual([]);
    expect(q.tick(500)).toEqual([{ enemyKind: 'runner', atMs: 500 }]);
    expect(q.tick(1500)).toEqual([{ enemyKind: 'tank', atMs: 1200 }]);
  });

  it('reports done() when all spawns emitted', () => {
    const q = new SpawnQueue(spawns);
    expect(q.done()).toBe(false);
    q.tick(2000);
    expect(q.done()).toBe(true);
  });

  it('handles empty schedule', () => {
    const q = new SpawnQueue([]);
    expect(q.done()).toBe(true);
    expect(q.tick(0)).toEqual([]);
  });
});
