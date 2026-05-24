import { describe, it, expect } from 'vitest';
import express from 'express';
import { createWaveRoute } from '../src/routes/wave.js';
import type { WaveRequest, WaveResponse } from '@td/shared';

function buildApp(generator: (req: WaveRequest) => Promise<WaveResponse>) {
  const app = express();
  app.use(express.json());
  app.post('/api/wave', createWaveRoute(generator));
  return app;
}

async function post(app: ReturnType<typeof buildApp>, body: unknown): Promise<{ status: number; body: any }> {
  return await new Promise((resolve) => {
    const fakeReq: any = {
      method: 'POST',
      url: '/api/wave',
      headers: { 'content-type': 'application/json' },
      body,
    };
    const fakeRes: any = {
      statusCode: 200,
      setHeader() {},
      status(s: number) { this.statusCode = s; return this; },
      json(j: any) { resolve({ status: this.statusCode, body: j }); },
      send(s: any) { resolve({ status: this.statusCode, body: s }); },
    };
    const handler = (app as any)._router.stack.find((l: any) => l.route?.path === '/api/wave')?.route.stack[0].handle;
    handler(fakeReq, fakeRes, () => {});
  });
}

describe('POST /api/wave', () => {
  const validReq: WaveRequest = { waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] };

  it('returns AI spawns when generator succeeds', async () => {
    const app = buildApp(async () => ({
      spawns: [{ enemyKind: 'soldier', atMs: 0 }],
      source: 'ai',
    }));
    const r = await post(app, validReq);
    expect(r.status).toBe(200);
    expect(r.body.source).toBe('ai');
    expect(r.body.spawns).toHaveLength(1);
  });

  it('returns fallback when generator throws', async () => {
    const app = buildApp(async () => { throw new Error('upstream dead'); });
    const r = await post(app, validReq);
    expect(r.status).toBe(200);
    expect(r.body.source).toBe('fallback');
    expect(r.body.spawns.length).toBeGreaterThan(0);
  });

  it('returns 400 for malformed body', async () => {
    const app = buildApp(async () => ({ spawns: [], source: 'ai' }));
    const r = await post(app, { junk: true });
    expect(r.status).toBe(400);
  });

  it('truncates oversized AI output to MAX_SPAWNS_PER_WAVE', async () => {
    const overlarge = Array.from({ length: 50 }, (_, i) => ({ enemyKind: 'soldier' as const, atMs: i * 100 }));
    const app = buildApp(async () => ({ spawns: overlarge, source: 'ai' }));
    const r = await post(app, validReq);
    expect(r.body.spawns.length).toBeLessThanOrEqual(25);
  });
});
