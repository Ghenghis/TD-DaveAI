import type { WaveRequest } from '@td/shared';
import { waveResponseSchema, type WaveResponseParsed } from '../schema/wave.js';
import { ALL_ENEMY_KINDS, MAX_SPAWNS_PER_WAVE } from '@td/shared';

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

interface RequestArgs {
  apiKey: string;
  waveRequest: WaveRequest;
  timeoutMs: number;
}

const SYSTEM_PROMPT = `You are the wave director for a 2D tower defense game.
Output ONLY a JSON object: {"spawns":[{"enemyKind":"soldier|runner|tank|armored","atMs":<int>}, ...]}.
Rules:
- 5 to ${MAX_SPAWNS_PER_WAVE} spawns per wave.
- atMs is milliseconds from wave start, monotonically non-decreasing, starting at 0.
- Only use enemyKind values: ${ALL_ENEMY_KINDS.join(', ')}.
- Tune difficulty using waveNumber, lives, gold, towersBuilt, and previousWaveOutcome.
- No prose. No markdown fences. Just the JSON object.`;

export async function requestWaveFromDeepseek(args: RequestArgs): Promise<WaveResponseParsed> {
  const { apiKey, waveRequest, timeoutMs } = args;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  let resp: Response;
  try {
    resp = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(waveRequest) },
        ],
      }),
      signal: controller.signal,
    });
  } catch (e) {
    throw sanitize(new Error(`deepseek network error: ${describeError(e)}`), apiKey);
  } finally {
    clearTimeout(t);
  }

  if (!resp.ok) {
    throw sanitize(new Error(`deepseek http ${resp.status}`), apiKey);
  }

  let body: unknown;
  try {
    body = await resp.json();
  } catch (e) {
    throw sanitize(new Error('deepseek response not JSON'), apiKey);
  }

  const content = extractContent(body);
  if (content === null) throw sanitize(new Error('deepseek response missing content'), apiKey);

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw sanitize(new Error('deepseek content not valid JSON'), apiKey);
  }

  return waveResponseSchema.parse(parsed);
}

function extractContent(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) return null;
  const choices = (body as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) return null;
  const first = choices[0] as { message?: { content?: unknown } } | undefined;
  if (!first || typeof first.message?.content !== 'string') return null;
  return first.message.content;
}

function describeError(e: unknown): string {
  if (e instanceof Error) return e.name;
  return 'unknown';
}

function sanitize(err: Error, apiKey: string): Error {
  if (apiKey && err.message.includes(apiKey)) {
    err.message = err.message.split(apiKey).join('[REDACTED]');
  }
  return err;
}
