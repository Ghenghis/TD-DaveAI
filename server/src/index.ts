import express, { type Express } from 'express';
import { fileURLToPath } from 'node:url';
import { createWaveRoute, type WaveGenerator } from './routes/wave.js';
import { loadSecrets } from './secrets.js';
import { requestWaveFromDeepseek } from './providers/deepseek.js';
import { fallbackWave } from './fallback/waves.js';
import type { WaveRequest, WaveResponse } from '@td/shared';

export const SERVER_NAME = 'td-server';

interface BuildAppOpts {
  generator: WaveGenerator;
}

export function buildApp(opts: BuildAppOpts): Express {
  const app = express();
  app.use(express.json({ limit: '32kb' }));
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.post('/api/wave', createWaveRoute(opts.generator));
  return app;
}

function makeRealGenerator(deepseekKey: string): WaveGenerator {
  return async (req: WaveRequest): Promise<WaveResponse> => {
    try {
      const out = await requestWaveFromDeepseek({
        apiKey: deepseekKey,
        waveRequest: req,
        timeoutMs: 8000,
      });
      return { spawns: out.spawns, source: 'ai' };
    } catch (e) {
      // single retry on transient failure
      try {
        const out = await requestWaveFromDeepseek({
          apiKey: deepseekKey,
          waveRequest: req,
          timeoutMs: 8000,
        });
        return { spawns: out.spawns, source: 'ai' };
      } catch {
        return { spawns: fallbackWave(req.waveNumber), source: 'fallback' };
      }
    }
  };
}

// Boot only when run directly (not when imported by tests).
// fileURLToPath handles the triple-slash file:///C:/... form that Node uses on Windows.
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const secrets = loadSecrets();
  const app = buildApp({ generator: makeRealGenerator(secrets.deepseekKey) });
  const port = Number(process.env.PORT ?? 8787);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[${SERVER_NAME}] listening on :${port}`);
  });
}
