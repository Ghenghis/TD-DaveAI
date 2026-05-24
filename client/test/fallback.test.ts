import { describe, it, expect } from 'vitest';
import { clientFallbackWave } from '../src/game/fallback/waves.js';
import { ALL_ENEMY_KINDS, MAX_SPAWNS_PER_WAVE } from '@td/shared';

describe('clientFallbackWave', () => {
  it('returns valid spawns', () => {
    const s = clientFallbackWave(3);
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(MAX_SPAWNS_PER_WAVE);
    for (const x of s) expect(ALL_ENEMY_KINDS).toContain(x.enemyKind);
  });

  it('is monotonically increasing in time', () => {
    const s = clientFallbackWave(5);
    for (let i = 1; i < s.length; i++) expect(s[i]!.atMs).toBeGreaterThanOrEqual(s[i - 1]!.atMs);
  });
});
