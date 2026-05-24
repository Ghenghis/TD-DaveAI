import { describe, it, expect } from 'vitest';
import { buildApp } from '../src/index.js';
import { fallbackWave } from '../src/fallback/waves.js';

describe('app', () => {
  it('exposes /healthz', async () => {
    const app = buildApp({
      generator: async () => ({ spawns: fallbackWave(1), source: 'ai' }),
    });
    const got = await callJson(app, 'GET', '/healthz');
    expect(got.status).toBe(200);
    expect(got.body.ok).toBe(true);
  });
});

async function callJson(app: any, method: string, url: string, body?: unknown) {
  return await new Promise<{ status: number; body: any }>((resolve) => {
    const req: any = { method, url, headers: {}, body };
    const res: any = {
      statusCode: 200,
      setHeader() {},
      status(s: number) {
        this.statusCode = s;
        return this;
      },
      json(j: any) {
        resolve({ status: this.statusCode, body: j });
      },
    };
    const layer = app._router.stack.find((l: any) => l.route?.path === url);
    layer.route.stack[0].handle(req, res, () => {});
  });
}
