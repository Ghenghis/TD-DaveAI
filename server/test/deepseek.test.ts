import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

import { requestWaveFromDeepseek } from '../src/providers/deepseek.js';

const handlers = [
  http.post('https://api.deepseek.com/chat/completions', async ({ request }) => {
    const body = (await request.json()) as { messages: { role: string; content: string }[] };
    const userMsg = body.messages.find((m) => m.role === 'user')?.content ?? '';
    // echo back a tiny valid wave; tests confirm we parse it
    return HttpResponse.json({
      choices: [
        {
          message: {
            content: JSON.stringify({
              spawns: [
                { enemyKind: 'soldier', atMs: 0 },
                { enemyKind: 'runner', atMs: 500 },
              ],
            }),
          },
        },
      ],
    });
  }),
];

const mockServer = setupServer(...handlers);

beforeAll(() => mockServer.listen({ onUnhandledRequest: 'error' }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());

describe('requestWaveFromDeepseek', () => {
  it('returns parsed spawns on success', async () => {
    const out = await requestWaveFromDeepseek({
      apiKey: 'sk-test',
      waveRequest: { waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] },
      timeoutMs: 2000,
    });
    expect(out.spawns).toHaveLength(2);
    expect(out.spawns[0]!.enemyKind).toBe('soldier');
  });

  it('throws on HTTP 500', async () => {
    mockServer.use(
      http.post('https://api.deepseek.com/chat/completions', () => new HttpResponse(null, { status: 500 })),
    );
    await expect(
      requestWaveFromDeepseek({
        apiKey: 'sk-test',
        waveRequest: { waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] },
        timeoutMs: 2000,
      }),
    ).rejects.toThrow(/deepseek/i);
  });

  it('throws on malformed model JSON', async () => {
    mockServer.use(
      http.post('https://api.deepseek.com/chat/completions', () =>
        HttpResponse.json({ choices: [{ message: { content: 'not json' } }] }),
      ),
    );
    await expect(
      requestWaveFromDeepseek({
        apiKey: 'sk-test',
        waveRequest: { waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] },
        timeoutMs: 2000,
      }),
    ).rejects.toThrow();
  });

  it('does not include the api key in thrown errors', async () => {
    expect.assertions(1);
    const sensitiveKey = 'sk-deepseek-SECRET-9999';
    mockServer.use(
      http.post('https://api.deepseek.com/chat/completions', () => new HttpResponse(null, { status: 500 })),
    );
    try {
      await requestWaveFromDeepseek({
        apiKey: sensitiveKey,
        waveRequest: { waveNumber: 1, lives: 20, gold: 100, towersBuilt: [] },
        timeoutMs: 2000,
      });
    } catch (e) {
      expect(String(e instanceof Error ? e.message : e)).not.toContain('SECRET-9999');
    }
  });
});
