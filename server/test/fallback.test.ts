import { describe, it, expect } from 'vitest';
import { fallbackWave } from '../src/fallback/waves.js';
import { MAX_SPAWNS_PER_WAVE, ALL_ENEMY_KINDS } from '@td/shared';

describe('fallbackWave', () => {
  it('returns at least one spawn for any wave 1..20', () => {
    for (let n = 1; n <= 20; n++) {
      const spawns = fallbackWave(n);
      expect(spawns.length).toBeGreaterThan(0);
      expect(spawns.length).toBeLessThanOrEqual(MAX_SPAWNS_PER_WAVE);
    }
  });

  it('uses only valid enemy kinds', () => {
    const spawns = fallbackWave(5);
    for (const s of spawns) {
      expect(ALL_ENEMY_KINDS).toContain(s.enemyKind);
    }
  });

  it('spawns are time-ordered', () => {
    const spawns = fallbackWave(7);
    for (let i = 1; i < spawns.length; i++) {
      expect(spawns[i]!.atMs).toBeGreaterThanOrEqual(spawns[i - 1]!.atMs);
    }
  });

  it('scales count with wave number', () => {
    expect(fallbackWave(10).length).toBeGreaterThan(fallbackWave(1).length);
  });
});
