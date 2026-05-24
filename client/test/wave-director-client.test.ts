import { describe, it, expect, vi } from 'vitest';
import { WaveDirectorClient } from '../src/game/WaveDirectorClient.js';

describe('WaveDirectorClient.fetchNext', () => {
  it('returns server response on success', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({
      spawns: [{ enemyKind: 'soldier', atMs: 0 }], source: 'ai',
    }), { status: 200 }));
    const c = new WaveDirectorClient(fetcher);
    const r = await c.fetchNext({ waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] });
    expect(r.source).toBe('ai');
    expect(r.spawns).toHaveLength(1);
  });

  it('returns local fallback when fetch rejects', async () => {
    const fetcher = vi.fn(async () => { throw new Error('network down'); });
    const c = new WaveDirectorClient(fetcher);
    const r = await c.fetchNext({ waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] });
    expect(r.source).toBe('fallback');
    expect(r.spawns.length).toBeGreaterThan(0);
  });

  it('returns local fallback on non-2xx', async () => {
    const fetcher = vi.fn(async () => new Response('boom', { status: 500 }));
    const c = new WaveDirectorClient(fetcher);
    const r = await c.fetchNext({ waveNumber: 3, lives: 20, gold: 100, towersBuilt: [] });
    expect(r.source).toBe('fallback');
  });

  it('returns local fallback on body parse failure', async () => {
    const fetcher = vi.fn(async () => new Response('not json', { status: 200 }));
    const c = new WaveDirectorClient(fetcher);
    const r = await c.fetchNext({ waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] });
    expect(r.source).toBe('fallback');
  });
});
