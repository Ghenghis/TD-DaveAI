import { describe, it, expect } from 'vitest';
import { waveRequestSchema, waveResponseSchema } from '../src/schema/wave.js';

describe('waveRequestSchema', () => {
  it('accepts a valid request', () => {
    const r = waveRequestSchema.parse({
      waveNumber: 1,
      lives: 20,
      gold: 100,
      towersBuilt: [{ kind: 'arrow', count: 2 }],
    });
    expect(r.waveNumber).toBe(1);
  });

  it('rejects negative wave number', () => {
    expect(() =>
      waveRequestSchema.parse({
        waveNumber: -1,
        lives: 20,
        gold: 0,
        towersBuilt: [],
      }),
    ).toThrow();
  });
});

describe('waveResponseSchema', () => {
  it('accepts valid AI output', () => {
    const r = waveResponseSchema.parse({
      spawns: [
        { enemyKind: 'soldier', atMs: 0 },
        { enemyKind: 'runner', atMs: 500 },
      ],
    });
    expect(r.spawns).toHaveLength(2);
  });

  it('rejects unknown enemy kind', () => {
    expect(() =>
      waveResponseSchema.parse({
        spawns: [{ enemyKind: 'dragon', atMs: 0 }],
      }),
    ).toThrow();
  });

  it('rejects negative atMs', () => {
    expect(() =>
      waveResponseSchema.parse({
        spawns: [{ enemyKind: 'soldier', atMs: -1 }],
      }),
    ).toThrow();
  });
});
