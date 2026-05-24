import type { WaveRequest, WaveResponse } from '@td/shared';
import { clientFallbackWave } from './fallback/waves.js';

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

export class WaveDirectorClient {
  constructor(
    private readonly fetcher: Fetcher = (u, i) => fetch(u, i),
    private readonly url: string = '/api/wave',
    private readonly timeoutMs: number = 5000,
  ) {}

  async fetchNext(req: WaveRequest): Promise<WaveResponse> {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const resp = await this.fetcher(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      if (!resp.ok) return this.local(req);
      const body = await resp.json();
      if (!body || !Array.isArray(body.spawns)) return this.local(req);
      return body as WaveResponse;
    } catch {
      return this.local(req);
    } finally {
      clearTimeout(t);
    }
  }

  private local(req: WaveRequest): WaveResponse {
    return { spawns: clientFallbackWave(req.waveNumber), source: 'fallback' };
  }
}
