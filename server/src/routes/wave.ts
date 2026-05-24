import type { RequestHandler } from 'express';
import type { WaveRequest, WaveResponse, WaveSpawn } from '@td/shared';
import { MAX_SPAWNS_PER_WAVE } from '@td/shared';
import { waveRequestSchema } from '../schema/wave.js';
import { fallbackWave } from '../fallback/waves.js';

export type WaveGenerator = (req: WaveRequest) => Promise<WaveResponse>;

export function createWaveRoute(generate: WaveGenerator): RequestHandler {
  return async (req, res) => {
    const parsed = waveRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'invalid_request' });
      return;
    }
    let out: WaveResponse;
    try {
      out = await generate(parsed.data as WaveRequest);
    } catch {
      out = { spawns: fallbackWave(parsed.data.waveNumber), source: 'fallback' };
    }
    out = enforceCap(out);
    res.status(200).json(out);
  };
}

function enforceCap(r: WaveResponse): WaveResponse {
  if (r.spawns.length <= MAX_SPAWNS_PER_WAVE) return r;
  const trimmed: WaveSpawn[] = r.spawns.slice(0, MAX_SPAWNS_PER_WAVE);
  return { spawns: trimmed, source: r.source };
}
