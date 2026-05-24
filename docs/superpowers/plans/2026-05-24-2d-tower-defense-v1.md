# 2D Tower Defense v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a playable browser-based 2D tower defense (1 map, 4 towers, 4 enemies) with an AI-driven adaptive wave director served by a thin Node proxy.

**Architecture:** Phaser 3 + TypeScript client (Vite) talking to an Express server that holds API keys (loaded from `G:\private`) and proxies to DeepSeek v4 with a deterministic fallback. Spec: `docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md`.

**Tech Stack:** TypeScript, Phaser 3, Vite, Node, Express, zod, Vitest, msw (HTTP mocks), DeepSeek v4 (chat completions), Kenney "Tower Defense" 2D pack (CC0).

---

## Repository Operations (read once, apply to every task)

**Branching (GitHub Flow):**
- `main` is protected (after Task 28). All work via PR.
- One feature branch per task. Name: `feature/NN-short-name` where `NN` is the task number (e.g. `feature/04-secrets-loader`, `feature/16-movement-system`).
- Each task starts: `git checkout main && git pull && git checkout -b feature/NN-short-name`.
- Each task ends: `git push -u origin feature/NN-short-name && gh pr create --fill --base main` then merge with squash after review.

**Worktrees (for parallel agent dispatch):**
- Use `superpowers:using-git-worktrees` to create an isolated worktree per task: `git worktree add ../TD-DaveAI-feature-NN feature/NN-short-name`.
- Tasks in Phase D (16–22) are pure functions and may be dispatched in parallel — each in its own worktree.

**Commit convention:**
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`, `refactor:`.
- Each task should produce 1–3 commits; squash-merge consolidates into one commit on `main`.
- Co-author trailer: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.

**Agent roles (per the project strategy):**
- **Implementer** — executes one task end-to-end in its worktree.
- **Code reviewer** — `superpowers:code-reviewer` agent reviews the PR before merge.
- **QA / integration** — runs full suite + `MANUAL_QA.md` at milestone boundaries (after Tasks 9, 22, and 27).

**Secrets discipline (applies to every task):**
- Never log, print, commit, or include API key values in any output.
- The real keys live at `G:\private`. The repo's `.gitignore` already blocks `private/`, `.env*`, `secrets.*`, `*.key`, `*.pem`.

**Definition of done for every task:**
- All tests written in the task pass.
- The full test suite (`npm test` from root) still passes.
- A PR has been opened against `main` and merged (or queued for review).
- The relevant `MANUAL_QA.md` entries (if any) have been updated.

---

## Task index

**Phase A — Foundations (sequential):**
- Task 1: Root workspace + base tooling
- Task 2: Shared types package

**Phase B — Server (sequential, TDD):**
- Task 3: Server package scaffold + Vitest config
- Task 4: Secrets loader
- Task 5: Zod schemas for wave req/resp
- Task 6: Deterministic fallback waves table
- Task 7: DeepSeek provider
- Task 8: `/api/wave` route handler with fallback
- Task 9: Express bootstrap + `/healthz` + listen

**Phase C — Asset pipeline + Client scaffold (sequential):**
- Task 10: `prepare-assets.ts` script
- Task 11: Client package scaffold (Vite + Phaser + Vitest)
- Task 12: BootScene (preload assets)
- Task 13: MenuScene
- Task 14: Map data + PlayScene shell with tilemap

**Phase D — Game systems (parallel-friendly, TDD):**
- Task 15: Entity classes
- Task 16: MovementSystem
- Task 17: TargetingSystem
- Task 18: FiringSystem
- Task 19: CollisionSystem
- Task 20: SpawnSystem
- Task 21: EconomySystem
- Task 22: LivesSystem

**Phase E — Client AI integration (sequential):**
- Task 23: Client fallback waves table
- Task 24: WaveDirectorClient

**Phase F — Integration (sequential):**
- Task 25: PlayScene full wiring
- Task 26: UI (HUD, BuildMenu, WaveBanner)
- Task 27: GameOverScene + scene flow

**Phase G — Quality + ship (sequential):**
- Task 28: CI workflow + branch protection
- Task 29: README, MANUAL_QA, CREDITS

---

## Task 1: Root workspace + base tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.prettierrc.json`
- Create: `.editorconfig`

- [ ] **Step 1: Create `package.json`** at repo root.

```json
{
  "name": "td-daveai",
  "private": true,
  "type": "module",
  "workspaces": ["shared", "server", "client"],
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"npm -w server run dev\" \"npm -w client run dev\"",
    "build": "npm -w shared run build && npm -w server run build && npm -w client run build",
    "test": "npm -w shared run test --if-present && npm -w server run test && npm -w client run test",
    "lint": "prettier --check ."
  },
  "devDependencies": {
    "concurrently": "^9.0.0",
    "prettier": "^3.3.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**.

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 3: Create `.prettierrc.json`**.

```json
{
  "singleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 4: Create `.editorconfig`**.

```
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
```

- [ ] **Step 5: Install root deps.**

Run: `npm install`
Expected: creates `node_modules/`, `package-lock.json`. No workspace child packages exist yet so npm will warn — that's fine.

- [ ] **Step 6: Commit and PR.**

```bash
git checkout -b feature/01-workspace-bootstrap
git add package.json tsconfig.base.json .prettierrc.json .editorconfig package-lock.json
git commit -m "chore: scaffold root workspace + tooling"
git push -u origin feature/01-workspace-bootstrap
gh pr create --fill --base main
```

---

## Task 2: Shared types package

**Files:**
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`
- Create: `shared/src/types.ts`
- Create: `shared/src/index.ts`

- [ ] **Step 1: Create `shared/package.json`.**

```json
{
  "name": "@td/shared",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json --noEmit"
  }
}
```

- [ ] **Step 2: Create `shared/tsconfig.json`.**

```json
{
  "extends": "../tsconfig.base.json",
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `shared/src/types.ts` — the contract from spec §5.1.**

```ts
export type EnemyKind = 'soldier' | 'runner' | 'tank' | 'armored';
export type TowerKind = 'arrow' | 'cannon' | 'frost' | 'barracks';

export interface TowerBuiltCount {
  kind: TowerKind;
  count: number;
}

export interface PreviousWaveOutcome {
  enemiesLeaked: number;
  timeToFinishMs: number;
}

export interface WaveRequest {
  waveNumber: number;
  lives: number;
  gold: number;
  towersBuilt: TowerBuiltCount[];
  previousWaveOutcome?: PreviousWaveOutcome;
}

export interface WaveSpawn {
  enemyKind: EnemyKind;
  atMs: number;
}

export type WaveSource = 'ai' | 'fallback';

export interface WaveResponse {
  spawns: WaveSpawn[];
  source: WaveSource;
}

export const MAX_SPAWNS_PER_WAVE = 25;
export const ALL_ENEMY_KINDS: readonly EnemyKind[] = ['soldier', 'runner', 'tank', 'armored'];
export const ALL_TOWER_KINDS: readonly TowerKind[] = ['arrow', 'cannon', 'frost', 'barracks'];
```

- [ ] **Step 4: Create `shared/src/index.ts`.**

```ts
export * from './types.js';
```

- [ ] **Step 5: Verify it typechecks.**

Run: `npm -w @td/shared run build`
Expected: exit 0, no output.

- [ ] **Step 6: Commit and PR.**

```bash
git checkout -b feature/02-shared-types
git add shared/
git commit -m "feat(shared): contract types for wave director"
git push -u origin feature/02-shared-types
gh pr create --fill --base main
```

---

## Task 3: Server package scaffold + Vitest config

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/vitest.config.ts`
- Create: `server/src/index.ts` (placeholder)
- Create: `server/test/smoke.test.ts`

- [ ] **Step 1: Create `server/package.json`.**

```json
{
  "name": "@td/server",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "@td/shared": "*",
    "express": "^4.21.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.0.0",
    "msw": "^2.6.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `server/tsconfig.json`.**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "module": "ESNext",
    "moduleResolution": "Bundler"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Create `server/vitest.config.ts`.**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 4: Create placeholder `server/src/index.ts`.**

```ts
export const SERVER_NAME = 'td-server';
```

- [ ] **Step 5: Write a smoke test `server/test/smoke.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { SERVER_NAME } from '../src/index.js';

describe('server smoke', () => {
  it('exports SERVER_NAME', () => {
    expect(SERVER_NAME).toBe('td-server');
  });
});
```

- [ ] **Step 6: Install + run.**

Run: `npm install`
Run: `npm -w @td/server run test`
Expected: 1 test passes.

- [ ] **Step 7: Commit and PR.**

```bash
git checkout -b feature/03-server-scaffold
git add server/ package-lock.json
git commit -m "chore(server): scaffold server package with vitest"
git push -u origin feature/03-server-scaffold
gh pr create --fill --base main
```

---

## Task 4: Secrets loader

**Files:**
- Create: `server/src/secrets.ts`
- Create: `server/test/secrets.test.ts`

- [ ] **Step 1: Write the failing test `server/test/secrets.test.ts`.**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadSecrets, type Secrets } from '../src/secrets.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'td-secrets-'));
});

describe('loadSecrets', () => {
  it('reads deepseek and minimax keys from files', () => {
    writeFileSync(join(dir, 'deepseek.key'), 'sk-deepseek-ABC\n');
    writeFileSync(join(dir, 'minimax.key'), 'mm-XYZ\n');
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-ABC');
    expect(s.minimaxKey).toBe('mm-XYZ');
    rmSync(dir, { recursive: true });
  });

  it('throws if deepseek key file missing — names the file, NOT the value', () => {
    expect(() => loadSecrets(dir)).toThrow(/deepseek\.key/);
    rmSync(dir, { recursive: true });
  });

  it('throws if deepseek key is empty', () => {
    writeFileSync(join(dir, 'deepseek.key'), '   \n');
    writeFileSync(join(dir, 'minimax.key'), 'mm-XYZ');
    expect(() => loadSecrets(dir)).toThrow(/deepseek\.key/);
    rmSync(dir, { recursive: true });
  });

  it('does not echo key values in thrown error messages', () => {
    writeFileSync(join(dir, 'deepseek.key'), 'sk-deepseek-SENSITIVE-12345');
    // omit minimax to trigger error
    try {
      loadSecrets(dir);
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      expect(msg).not.toContain('SENSITIVE-12345');
    }
    rmSync(dir, { recursive: true });
  });
});
```

- [ ] **Step 2: Run test — verify it fails.**

Run: `npm -w @td/server run test -- secrets`
Expected: FAIL with module-not-found or `loadSecrets is not a function`.

- [ ] **Step 3: Implement `server/src/secrets.ts`.**

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Secrets {
  deepseekKey: string;
  minimaxKey: string;
}

const REQUIRED_FILES = ['deepseek.key', 'minimax.key'] as const;

function readKey(dir: string, file: string): string {
  let raw: string;
  try {
    raw = readFileSync(join(dir, file), 'utf8');
  } catch {
    throw new Error(`missing secret file: ${file} in ${dir}`);
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`empty secret file: ${file}`);
  }
  return trimmed;
}

export function loadSecrets(dir: string = process.env.SECRETS_DIR ?? 'G:\\private'): Secrets {
  // Read in fixed order so error messages are deterministic.
  const [deepseekKey, minimaxKey] = REQUIRED_FILES.map((f) => readKey(dir, f)) as [string, string];
  return { deepseekKey, minimaxKey };
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/server run test -- secrets`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/04-secrets-loader
git add server/src/secrets.ts server/test/secrets.test.ts
git commit -m "feat(server): secrets loader with file-source and no-leak guarantee"
git push -u origin feature/04-secrets-loader
gh pr create --fill --base main
```

---

## Task 5: Zod schemas for wave req/resp

**Files:**
- Create: `server/src/schema/wave.ts`
- Create: `server/test/schema.test.ts`

- [ ] **Step 1: Write the failing test `server/test/schema.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { waveRequestSchema, waveResponseSchema } from '../src/schema/wave.js';

describe('waveRequestSchema', () => {
  it('accepts a valid request', () => {
    const r = waveRequestSchema.parse({
      waveNumber: 1, lives: 20, gold: 100,
      towersBuilt: [{ kind: 'arrow', count: 2 }],
    });
    expect(r.waveNumber).toBe(1);
  });

  it('rejects negative wave number', () => {
    expect(() => waveRequestSchema.parse({
      waveNumber: -1, lives: 20, gold: 0, towersBuilt: [],
    })).toThrow();
  });
});

describe('waveResponseSchema', () => {
  it('accepts valid AI output', () => {
    const r = waveResponseSchema.parse({
      spawns: [{ enemyKind: 'soldier', atMs: 0 }, { enemyKind: 'runner', atMs: 500 }],
    });
    expect(r.spawns).toHaveLength(2);
  });

  it('rejects unknown enemy kind', () => {
    expect(() => waveResponseSchema.parse({
      spawns: [{ enemyKind: 'dragon', atMs: 0 }],
    })).toThrow();
  });

  it('rejects negative atMs', () => {
    expect(() => waveResponseSchema.parse({
      spawns: [{ enemyKind: 'soldier', atMs: -1 }],
    })).toThrow();
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/server run test -- schema`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `server/src/schema/wave.ts`.**

```ts
import { z } from 'zod';
import { ALL_ENEMY_KINDS, ALL_TOWER_KINDS } from '@td/shared';

const enemyKindSchema = z.enum(ALL_ENEMY_KINDS as readonly [string, ...string[]]);
const towerKindSchema = z.enum(ALL_TOWER_KINDS as readonly [string, ...string[]]);

export const waveRequestSchema = z.object({
  waveNumber: z.number().int().nonnegative(),
  lives: z.number().int().nonnegative(),
  gold: z.number().int().nonnegative(),
  towersBuilt: z.array(z.object({
    kind: towerKindSchema,
    count: z.number().int().nonnegative(),
  })),
  previousWaveOutcome: z.object({
    enemiesLeaked: z.number().int().nonnegative(),
    timeToFinishMs: z.number().nonnegative(),
  }).optional(),
});

export const waveSpawnSchema = z.object({
  enemyKind: enemyKindSchema,
  atMs: z.number().int().nonnegative(),
});

export const waveResponseSchema = z.object({
  spawns: z.array(waveSpawnSchema).min(1).max(100), // server truncates to MAX_SPAWNS_PER_WAVE before sending
});

export type WaveRequestParsed = z.infer<typeof waveRequestSchema>;
export type WaveResponseParsed = z.infer<typeof waveResponseSchema>;
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/server run test -- schema`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/05-zod-schemas
git add server/src/schema/wave.ts server/test/schema.test.ts
git commit -m "feat(server): zod schemas for wave req/resp"
git push -u origin feature/05-zod-schemas
gh pr create --fill --base main
```

---

## Task 6: Deterministic fallback waves table

**Files:**
- Create: `server/src/fallback/waves.ts`
- Create: `server/test/fallback.test.ts`

- [ ] **Step 1: Write the failing test `server/test/fallback.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { fallbackWave } from '../src/fallback/waves.js';
import { MAX_SPAWNS_PER_WAVE, ALL_ENEMY_KINDS } from '@td/shared';

describe('fallbackWave', () => {
  it('returns at least one spawn for any wave 1..20', () => {
    for (let n = 1; n <= 20; n++) {
      const spawns = fallbackWave(n);
      expect(spawns.length).toBeGreaterThan(0);
      expect(spawns.length).toBeLessThanOrEqual(MAX_SPAWNS_PER_WAVE);
    }
  });

  it('uses only valid enemy kinds', () => {
    const spawns = fallbackWave(5);
    for (const s of spawns) {
      expect(ALL_ENEMY_KINDS).toContain(s.enemyKind);
    }
  });

  it('spawns are time-ordered', () => {
    const spawns = fallbackWave(7);
    for (let i = 1; i < spawns.length; i++) {
      expect(spawns[i]!.atMs).toBeGreaterThanOrEqual(spawns[i - 1]!.atMs);
    }
  });

  it('scales count with wave number', () => {
    expect(fallbackWave(10).length).toBeGreaterThan(fallbackWave(1).length);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/server run test -- fallback`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `server/src/fallback/waves.ts`.**

```ts
import type { WaveSpawn, EnemyKind } from '@td/shared';
import { MAX_SPAWNS_PER_WAVE } from '@td/shared';

// Curve: wave N has min(5 + N*2, 25) enemies, spaced 600ms apart.
// Composition shifts toward heavier mixes as N grows.
export function fallbackWave(waveNumber: number): WaveSpawn[] {
  const n = Math.max(1, Math.floor(waveNumber));
  const count = Math.min(5 + n * 2, MAX_SPAWNS_PER_WAVE);
  const gap = 600;
  const spawns: WaveSpawn[] = [];
  for (let i = 0; i < count; i++) {
    spawns.push({ enemyKind: pickKind(n, i), atMs: i * gap });
  }
  return spawns;
}

function pickKind(wave: number, index: number): EnemyKind {
  // Early waves: mostly soldier + some runner.
  // Mid waves: introduce armored.
  // Late waves: introduce tank, more armored.
  if (wave <= 2) return index % 4 === 3 ? 'runner' : 'soldier';
  if (wave <= 5) {
    if (index % 5 === 4) return 'armored';
    if (index % 3 === 2) return 'runner';
    return 'soldier';
  }
  // wave >= 6
  if (index % 7 === 6) return 'tank';
  if (index % 4 === 3) return 'armored';
  if (index % 3 === 2) return 'runner';
  return 'soldier';
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/server run test -- fallback`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/06-fallback-waves
git add server/src/fallback/waves.ts server/test/fallback.test.ts
git commit -m "feat(server): deterministic fallback waves table"
git push -u origin feature/06-fallback-waves
gh pr create --fill --base main
```

---

## Task 7: DeepSeek provider

**Files:**
- Create: `server/src/providers/deepseek.ts`
- Create: `server/test/deepseek.test.ts`

- [ ] **Step 1: Write the failing test `server/test/deepseek.test.ts`.**

```ts
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
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/server run test -- deepseek`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `server/src/providers/deepseek.ts`.**

```ts
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
    throw sanitize(new Error(`deepseek network error: ${describe(e)}`), apiKey);
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

function describe(e: unknown): string {
  if (e instanceof Error) return e.name;
  return 'unknown';
}

function sanitize(err: Error, apiKey: string): Error {
  if (apiKey && err.message.includes(apiKey)) {
    err.message = err.message.split(apiKey).join('[REDACTED]');
  }
  return err;
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/server run test -- deepseek`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/07-deepseek-provider
git add server/src/providers/deepseek.ts server/test/deepseek.test.ts
git commit -m "feat(server): DeepSeek provider with timeout + sanitized errors"
git push -u origin feature/07-deepseek-provider
gh pr create --fill --base main
```

---

## Task 8: `/api/wave` route handler with fallback

**Files:**
- Create: `server/src/routes/wave.ts`
- Create: `server/test/wave-route.test.ts`

- [ ] **Step 1: Write the failing test `server/test/wave-route.test.ts`.**

```ts
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
  const req = new Request('http://test/api/wave', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  // Use express handler directly through a tiny adapter.
  return await new Promise((resolve) => {
    const fakeReq: any = {
      method: 'POST',
      url: '/api/wave',
      headers: { 'content-type': 'application/json' },
      body,
    };
    const chunks: string[] = [];
    const fakeRes: any = {
      statusCode: 200,
      setHeader() {},
      status(s: number) { this.statusCode = s; return this; },
      json(j: any) { chunks.push(JSON.stringify(j)); resolve({ status: this.statusCode, body: j }); },
      send(s: any) { chunks.push(String(s)); resolve({ status: this.statusCode, body: s }); },
    };
    // Find and invoke the handler bound by createWaveRoute.
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
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/server run test -- wave-route`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `server/src/routes/wave.ts`.**

```ts
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
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/server run test -- wave-route`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/08-wave-route
git add server/src/routes/wave.ts server/test/wave-route.test.ts
git commit -m "feat(server): /api/wave route with fallback on error"
git push -u origin feature/08-wave-route
gh pr create --fill --base main
```

---

## Task 9: Express bootstrap + `/healthz` + listen

**Files:**
- Modify: `server/src/index.ts`
- Create: `server/test/health.test.ts`

- [ ] **Step 1: Write the failing test `server/test/health.test.ts`.**

```ts
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
      status(s: number) { this.statusCode = s; return this; },
      json(j: any) { resolve({ status: this.statusCode, body: j }); },
    };
    const layer = app._router.stack.find((l: any) => l.route?.path === url);
    layer.route.stack[0].handle(req, res, () => {});
  });
}
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/server run test -- health`
Expected: FAIL (`buildApp` is not a function).

- [ ] **Step 3: Replace `server/src/index.ts` with the real bootstrap.**

```ts
import express, { type Express } from 'express';
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
const isMain = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`;
if (isMain) {
  const secrets = loadSecrets();
  const app = buildApp({ generator: makeRealGenerator(secrets.deepseekKey) });
  const port = Number(process.env.PORT ?? 8787);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[${SERVER_NAME}] listening on :${port}`);
  });
}
```

- [ ] **Step 4: Update existing smoke test to keep passing.**

Open `server/test/smoke.test.ts`. The `SERVER_NAME` export still exists, so it should still pass. Re-run all server tests.

Run: `npm -w @td/server run test`
Expected: all tests pass (smoke, secrets, schema, fallback, deepseek, wave-route, health).

- [ ] **Step 5: Sanity-run the server.**

Set up `G:\private\deepseek.key` (your real key) and `G:\private\minimax.key` (real or placeholder), then:

Run: `npm -w @td/server run dev`
Expected: log line `[td-server] listening on :8787`. `curl http://localhost:8787/healthz` returns `{"ok":true}`.
Stop with Ctrl+C.

- [ ] **Step 6: Commit and PR.**

```bash
git checkout -b feature/09-server-bootstrap
git add server/src/index.ts server/test/health.test.ts
git commit -m "feat(server): express bootstrap, /healthz, real wave generator wiring"
git push -u origin feature/09-server-bootstrap
gh pr create --fill --base main
```

> **Milestone — QA gate:** dispatch the QA agent. Verify `npm test` from root passes all server suites; manually `curl /healthz` and `curl -X POST /api/wave -H 'content-type: application/json' -d '{"waveNumber":1,"lives":20,"gold":100,"towersBuilt":[]}'`. Confirm `source` is either `ai` or `fallback` and `spawns` is non-empty.

---

## Task 10: `prepare-assets.ts` script

**Files:**
- Create: `scripts/prepare-assets.ts`
- Create: `scripts/package.json` (so the script can be run with tsx)
- Create: `client/public/assets/.gitkeep`
- Modify: root `package.json` (add `assets` script)

- [ ] **Step 1: Create `scripts/package.json`.**

```json
{
  "name": "@td/scripts",
  "private": true,
  "type": "module",
  "scripts": {
    "prepare-assets": "tsx prepare-assets.ts"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.6.0"
  }
}
```

Add `"scripts"` to the root `package.json` workspaces array:
```json
"workspaces": ["shared", "server", "client", "scripts"]
```

And to root scripts:
```json
"assets": "npm -w @td/scripts run prepare-assets"
```

- [ ] **Step 2: Create `scripts/prepare-assets.ts`.**

```ts
import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const KENNEY_ROOT = process.env.KENNEY_ROOT ?? 'G:\\Kenney Game Assets All-in-1 3.5.0';
const DEST = join(process.cwd(), '..', 'client', 'public', 'assets');

interface CopySpec { from: string; to: string; }

// What v1 actually needs. Keep this list small.
const COPIES: CopySpec[] = [
  // Tower Defense top-down pack: full PNG set + tilesheet
  { from: '2D assets/Tower Defense/PNG', to: 'td-pack/PNG' },
  { from: '2D assets/Tower Defense/Tilesheet', to: 'td-pack/Tilesheet' },
  // UI sounds for clicks/notifications
  { from: 'Audio/UI Audio', to: 'audio/ui' },
  // One impact sound pack for hits
  { from: 'Audio/Impact Sounds', to: 'audio/impact' },
  // One music loop pack
  { from: 'Audio/Music Loops', to: 'audio/music' },
];

for (const c of COPIES) {
  const src = join(KENNEY_ROOT, c.from);
  const dst = join(DEST, c.to);
  if (!existsSync(src)) {
    // eslint-disable-next-line no-console
    console.error(`MISSING SOURCE: ${src}`);
    process.exit(1);
  }
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, { recursive: true });
  // eslint-disable-next-line no-console
  console.log(`copied ${c.from} -> ${c.to}`);
}
console.log('done');
```

- [ ] **Step 3: Create `client/public/assets/.gitkeep`** (empty file so the dir exists in git; actual assets are not committed — they're a build artifact).

- [ ] **Step 4: Update `.gitignore` to ignore copied assets.**

Add to `.gitignore`:
```
client/public/assets/*
!client/public/assets/.gitkeep
```

- [ ] **Step 5: Install + run.**

Run: `npm install`
Run: `npm run assets`
Expected: prints `copied ...` lines for each spec, ends with `done`.

- [ ] **Step 6: Commit and PR.**

```bash
git checkout -b feature/10-asset-pipeline
git add scripts/ client/public/assets/.gitkeep package.json package-lock.json .gitignore
git commit -m "chore: asset preparation script copies Kenney files into client/public"
git push -u origin feature/10-asset-pipeline
gh pr create --fill --base main
```

---

## Task 11: Client package scaffold

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/vitest.config.ts`
- Create: `client/index.html`
- Create: `client/src/main.ts`
- Create: `client/test/smoke.test.ts`

- [ ] **Step 1: Create `client/package.json`.**

```json
{
  "name": "@td/client",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@td/shared": "*",
    "phaser": "^3.86.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "jsdom": "^25.0.0",
    "typescript": "^5.6.0",
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `client/tsconfig.json`.**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"]
  },
  "include": ["src/**/*", "test/**/*"]
}
```

- [ ] **Step 3: Create `client/vite.config.ts`.**

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
});
```

- [ ] **Step 4: Create `client/vitest.config.ts`.**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create `client/index.html`.**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>TD-DaveAI</title>
    <style>
      html, body { margin: 0; padding: 0; background: #000; height: 100%; }
      #game { display: flex; align-items: center; justify-content: center; height: 100vh; }
    </style>
  </head>
  <body>
    <div id="game"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `client/src/main.ts`.**

```ts
import Phaser from 'phaser';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;

export function startGame(parent: string | HTMLElement = 'game'): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#1a1a1a',
    scene: [],
  });
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  startGame();
}
```

- [ ] **Step 7: Smoke test `client/test/smoke.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { GAME_WIDTH, GAME_HEIGHT } from '../src/main.js';

describe('client smoke', () => {
  it('exports game dimensions', () => {
    expect(GAME_WIDTH).toBe(1280);
    expect(GAME_HEIGHT).toBe(768);
  });
});
```

- [ ] **Step 8: Install + verify.**

Run: `npm install`
Run: `npm -w @td/client run test`
Expected: 1 test passes.
Run: `npm -w @td/client run dev`
Expected: Vite serves on `:5173`, page loads with a dark canvas (no scenes yet — black).
Stop with Ctrl+C.

- [ ] **Step 9: Commit and PR.**

```bash
git checkout -b feature/11-client-scaffold
git add client/ package-lock.json
git commit -m "chore(client): scaffold Phaser 3 + Vite + Vitest client"
git push -u origin feature/11-client-scaffold
gh pr create --fill --base main
```

---

## Task 12: BootScene (preload assets)

**Files:**
- Create: `client/src/scenes/BootScene.ts`
- Modify: `client/src/main.ts` (register scene)

- [ ] **Step 1: Create `client/src/scenes/BootScene.ts`.**

```ts
import Phaser from 'phaser';

export const SceneKeys = {
  Boot: 'BootScene',
  Menu: 'MenuScene',
  Play: 'PlayScene',
  GameOver: 'GameOverScene',
} as const;

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  preload(): void {
    // Tower defense tilesheet (path tiles, grass, etc.) — single PNG + JSON would be ideal,
    // but Kenney's PNG dir has individual sprites. We load atlas-by-folder for v1.
    this.load.path = '/assets/';

    // Individual sprites we use directly (named tiles + units).
    // Names align with `game/data/*.json` definitions.
    this.load.image('tile-grass', 'td-pack/PNG/towerDefense_tile024.png');
    this.load.image('tile-path', 'td-pack/PNG/towerDefense_tile280.png');
    this.load.image('tile-spawn', 'td-pack/PNG/towerDefense_tile248.png');
    this.load.image('tile-goal', 'td-pack/PNG/towerDefense_tile249.png');

    this.load.image('tower-arrow', 'td-pack/PNG/towerDefense_tile249.png');
    this.load.image('tower-cannon', 'td-pack/PNG/towerDefense_tile250.png');
    this.load.image('tower-frost', 'td-pack/PNG/towerDefense_tile251.png');
    this.load.image('tower-barracks', 'td-pack/PNG/towerDefense_tile252.png');

    this.load.image('enemy-soldier', 'td-pack/PNG/towerDefense_tile245.png');
    this.load.image('enemy-runner', 'td-pack/PNG/towerDefense_tile246.png');
    this.load.image('enemy-tank', 'td-pack/PNG/towerDefense_tile268.png');
    this.load.image('enemy-armored', 'td-pack/PNG/towerDefense_tile269.png');

    this.load.image('bullet', 'td-pack/PNG/towerDefense_tile272.png');

    this.load.audio('sfx-shoot', 'audio/impact/Audio/impactPlate_light_000.ogg');
    this.load.audio('sfx-hit', 'audio/impact/Audio/impactPlate_medium_000.ogg');
    this.load.audio('sfx-build', 'audio/ui/Audio/click_001.ogg');
  }

  create(): void {
    this.scene.start(SceneKeys.Menu);
  }
}
```

> Note: the exact Kenney tile numbers above are placeholders — the implementer should open `client/public/assets/td-pack/PNG/` after running `npm run assets`, pick visually appropriate sprites, and adjust the filenames. The structure stays the same.

- [ ] **Step 2: Update `client/src/main.ts` to register BootScene.**

```ts
import Phaser from 'phaser';
import { BootScene, SceneKeys } from './scenes/BootScene.js';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 768;

export function startGame(parent: string | HTMLElement = 'game'): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent,
    backgroundColor: '#1a1a1a',
    scene: [BootScene],
  });
}

if (typeof document !== 'undefined' && document.getElementById('game')) {
  startGame();
}

export { SceneKeys };
```

- [ ] **Step 3: Smoke-run.**

Run: `npm run assets` (if not already)
Run: `npm -w @td/client run dev`
Expected: page loads; BootScene tries to load images and switch to MenuScene. Since MenuScene doesn't exist yet, expect a console error about scene `MenuScene` not found. Visually the canvas is black. That's fine for now.

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/12-boot-scene
git add client/src/scenes/BootScene.ts client/src/main.ts
git commit -m "feat(client): BootScene with preload + scene key registry"
git push -u origin feature/12-boot-scene
gh pr create --fill --base main
```

---

## Task 13: MenuScene

**Files:**
- Create: `client/src/scenes/MenuScene.ts`
- Modify: `client/src/main.ts`

- [ ] **Step 1: Create `client/src/scenes/MenuScene.ts`.**

```ts
import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2 - 80, 'TD-DaveAI', {
      fontSize: '64px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const play = this.add.text(width / 2, height / 2 + 20, '▶  PLAY', {
      fontSize: '36px', color: '#88ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    play.on('pointerdown', () => this.scene.start(SceneKeys.Play));
    play.on('pointerover', () => play.setColor('#ccffcc'));
    play.on('pointerout', () => play.setColor('#88ff88'));

    this.add.text(width / 2, height - 40, 'v1 vertical slice', {
      fontSize: '14px', color: '#888888',
    }).setOrigin(0.5);
  }
}
```

- [ ] **Step 2: Register in `client/src/main.ts`.**

Change the `scene:` line to:
```ts
import { MenuScene } from './scenes/MenuScene.js';
// ...
scene: [BootScene, MenuScene],
```

- [ ] **Step 3: Smoke-run.**

Run: `npm -w @td/client run dev`
Expected: TD-DaveAI title appears; clicking PLAY errors because PlayScene doesn't exist. Acceptable.

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/13-menu-scene
git add client/src/scenes/MenuScene.ts client/src/main.ts
git commit -m "feat(client): MenuScene with PLAY button"
git push -u origin feature/13-menu-scene
gh pr create --fill --base main
```

---

## Task 14: Map data + PlayScene shell with tilemap

**Files:**
- Create: `client/src/game/data/maps/grasslands.json`
- Create: `client/src/game/data/towers.json`
- Create: `client/src/game/data/enemies.json`
- Create: `client/src/scenes/PlayScene.ts` (shell only; full wiring in Task 25)
- Modify: `client/src/main.ts`

- [ ] **Step 1: Create `client/src/game/data/maps/grasslands.json`.** A 20×12, 64px-tile map with a path snaking left-to-right.

```json
{
  "width": 20,
  "height": 12,
  "tileSize": 64,
  "spawn": [0, 5],
  "goal": [19, 5],
  "path": [[0, 5], [4, 5], [4, 2], [10, 2], [10, 8], [15, 8], [15, 5], [19, 5]],
  "buildableMask": [
    [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
    [true, true, true, true, false,true, true, true, true, true, false,true, true, true, true, false,true, true, true, false],
    [true, true, true, true, false,true, true, true, true, true, false,true, true, true, true, false,true, true, true, false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false,false,false,false,false,true, true, true, true, true, true, true, true, true, true, false,false,false,false,false],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true, false,true, true, true, true, false,true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true, false,true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
    [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true]
  ]
}
```

- [ ] **Step 2: Create `client/src/game/data/towers.json`.**

```json
[
  { "kind": "arrow",    "displayName": "Arrow Tower",    "cost":  50, "range": 180, "damage": 10, "fireRateMs": 600, "armorPenalty": 0.5 },
  { "kind": "cannon",   "displayName": "Cannon",         "cost": 100, "range": 160, "damage": 25, "fireRateMs": 1200, "armorPenalty": 1.0 },
  { "kind": "frost",    "displayName": "Frost Tower",    "cost":  75, "range": 150, "damage":  4, "fireRateMs": 800,  "slowFactor": 0.5, "slowMs": 1500, "armorPenalty": 1.0 },
  { "kind": "barracks", "displayName": "Barracks",       "cost":  80, "range":   0, "damage":  0, "fireRateMs": 0,    "blockerHp": 30, "blockerRespawnMs": 5000 }
]
```

- [ ] **Step 3: Create `client/src/game/data/enemies.json`.**

```json
[
  { "kind": "soldier", "displayName": "Soldier", "hp":  30, "speed":  60, "bounty":  8, "armor": false },
  { "kind": "runner",  "displayName": "Runner",  "hp":  18, "speed": 120, "bounty":  6, "armor": false },
  { "kind": "tank",    "displayName": "Tank",    "hp": 120, "speed":  35, "bounty": 18, "armor": false },
  { "kind": "armored", "displayName": "Armored", "hp":  60, "speed":  55, "bounty": 14, "armor": true }
]
```

- [ ] **Step 4: Create `client/src/scenes/PlayScene.ts` (shell — just draws the map).**

```ts
import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';
import mapData from '../game/data/maps/grasslands.json' assert { type: 'json' };

interface MapDef {
  width: number; height: number; tileSize: number;
  spawn: [number, number]; goal: [number, number];
  path: [number, number][];
  buildableMask: boolean[][];
}

export class PlayScene extends Phaser.Scene {
  constructor() { super(SceneKeys.Play); }

  create(): void {
    const map = mapData as MapDef;
    this.drawTiles(map);
    this.drawPath(map);
  }

  private drawTiles(map: MapDef): void {
    const ts = map.tileSize;
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const buildable = map.buildableMask[y]?.[x] ?? false;
        const key = buildable ? 'tile-grass' : 'tile-path';
        this.add.image(x * ts + ts / 2, y * ts + ts / 2, key).setDisplaySize(ts, ts);
      }
    }
    this.add.image(map.spawn[0] * ts + ts / 2, map.spawn[1] * ts + ts / 2, 'tile-spawn').setDisplaySize(ts, ts);
    this.add.image(map.goal[0]  * ts + ts / 2, map.goal[1]  * ts + ts / 2, 'tile-goal').setDisplaySize(ts, ts);
  }

  private drawPath(map: MapDef): void {
    const ts = map.tileSize;
    const g = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00, alpha: 0.5 } });
    const pts = map.path.map(([x, y]) => ({ x: x * ts + ts / 2, y: y * ts + ts / 2 }));
    g.beginPath();
    g.moveTo(pts[0]!.x, pts[0]!.y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]!.x, pts[i]!.y);
    g.strokePath();
  }
}
```

- [ ] **Step 5: Register in `client/src/main.ts`.** Add PlayScene to the scene array.

```ts
import { PlayScene } from './scenes/PlayScene.js';
// ...
scene: [BootScene, MenuScene, PlayScene],
```

- [ ] **Step 6: Smoke-run.**

Run: `npm -w @td/client run dev`
Expected: clicking PLAY shows the map with grass/path tiles and a yellow path line. No enemies/towers yet.

- [ ] **Step 7: Commit and PR.**

```bash
git checkout -b feature/14-playscene-shell
git add client/src/game/data/ client/src/scenes/PlayScene.ts client/src/main.ts
git commit -m "feat(client): map data + PlayScene shell with tile rendering"
git push -u origin feature/14-playscene-shell
gh pr create --fill --base main
```

---

## Task 15: Entity classes

**Files:**
- Create: `client/src/game/entities/Enemy.ts`
- Create: `client/src/game/entities/Tower.ts`
- Create: `client/src/game/entities/Bullet.ts`

These are data containers — no tests, since each system tested in isolation will exercise them.

- [ ] **Step 1: Create `client/src/game/entities/Enemy.ts`.**

```ts
import type { EnemyKind } from '@td/shared';

export interface EnemyDef {
  kind: EnemyKind;
  hp: number;
  speed: number; // pixels per second
  bounty: number;
  armor: boolean;
}

export interface Enemy {
  id: number;
  def: EnemyDef;
  hp: number;
  speed: number;
  pathIndex: number;   // index of the path segment we are currently traversing
  pathT: number;       // 0..1 along the current segment
  x: number;
  y: number;
  alive: boolean;
  slowExpiresAtMs?: number;
}

let nextId = 1;
export function createEnemy(def: EnemyDef, x: number, y: number): Enemy {
  return {
    id: nextId++, def, hp: def.hp, speed: def.speed,
    pathIndex: 0, pathT: 0, x, y, alive: true,
  };
}
```

- [ ] **Step 2: Create `client/src/game/entities/Tower.ts`.**

```ts
import type { TowerKind } from '@td/shared';
import type { Enemy } from './Enemy.js';

export interface TowerDef {
  kind: TowerKind;
  displayName: string;
  cost: number;
  range: number;
  damage: number;
  fireRateMs: number;
  armorPenalty?: number;   // multiplier when target.def.armor is true
  slowFactor?: number;     // 0..1 multiplier on enemy speed
  slowMs?: number;
}

export interface Tower {
  id: number;
  def: TowerDef;
  tileX: number;
  tileY: number;
  x: number;
  y: number;
  cooldownMs: number;
  target: Enemy | null;
}

let nextId = 1;
export function createTower(def: TowerDef, tileX: number, tileY: number, x: number, y: number): Tower {
  return { id: nextId++, def, tileX, tileY, x, y, cooldownMs: 0, target: null };
}
```

- [ ] **Step 3: Create `client/src/game/entities/Bullet.ts`.**

```ts
import type { Enemy } from './Enemy.js';
import type { Tower } from './Tower.js';

export interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: number;     // pixels per second
  damage: number;
  target: Enemy;
  source: Tower;
  alive: boolean;
}

let nextId = 1;
export function createBullet(source: Tower, target: Enemy, speed = 600): Bullet {
  return {
    id: nextId++, x: source.x, y: source.y, speed,
    damage: source.def.damage, target, source, alive: true,
  };
}
```

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/15-entities
git add client/src/game/entities/
git commit -m "feat(client): entity types (Enemy, Tower, Bullet)"
git push -u origin feature/15-entities
gh pr create --fill --base main
```

---

## Task 16: MovementSystem (TDD)

**Files:**
- Create: `client/src/game/systems/movement.ts`
- Create: `client/test/movement.test.ts`

**Parallel:** independent of Tasks 17–22.

- [ ] **Step 1: Write the failing test `client/test/movement.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { advanceMovement } from '../src/game/systems/movement.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const path: [number, number][] = [[0, 0], [100, 0], [100, 100]];

function mkEnemy(speed = 50) {
  return createEnemy({ kind: 'soldier', hp: 10, speed, bounty: 1, armor: false }, 0, 0);
}

describe('advanceMovement', () => {
  it('advances along the first segment', () => {
    const e = mkEnemy(50);
    advanceMovement([e], path, 1.0); // 50 pixels in 1s
    expect(e.x).toBeCloseTo(50, 1);
    expect(e.y).toBeCloseTo(0, 1);
    expect(e.pathIndex).toBe(0);
  });

  it('transitions to next segment when current segment finishes', () => {
    const e = mkEnemy(150);
    advanceMovement([e], path, 1.0); // 150 px, exceeds first 100-px segment
    expect(e.pathIndex).toBe(1);
    // 50 leftover px applied along (100,0)->(100,100): y should be ~50
    expect(e.x).toBeCloseTo(100, 1);
    expect(e.y).toBeCloseTo(50, 1);
  });

  it('marks enemy as leaked when reaching the last node', () => {
    const e = mkEnemy(1000);
    const leaked: number[] = [];
    advanceMovement([e], path, 1.0, (id) => leaked.push(id));
    expect(leaked).toContain(e.id);
    expect(e.alive).toBe(false);
  });

  it('ignores dead enemies', () => {
    const e = mkEnemy(50);
    e.alive = false;
    const before = { ...e };
    advanceMovement([e], path, 1.0);
    expect(e.x).toBe(before.x);
    expect(e.y).toBe(before.y);
  });

  it('respects slow effect when active', () => {
    const e = mkEnemy(100);
    e.slowExpiresAtMs = 5000;
    advanceMovement([e], path, 1.0, undefined, 0, 0.5); // current time 0, slow factor 0.5
    expect(e.x).toBeCloseTo(50, 1);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- movement`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `client/src/game/systems/movement.ts`.**

```ts
import type { Enemy } from '../entities/Enemy.js';

export type Path = readonly (readonly [number, number])[];
export type OnLeaked = (enemyId: number) => void;

export function advanceMovement(
  enemies: Enemy[],
  path: Path,
  dtSec: number,
  onLeaked?: OnLeaked,
  nowMs: number = 0,
  slowFactor: number = 0.5,
): void {
  for (const e of enemies) {
    if (!e.alive) continue;
    let remaining = e.speed * dtSec * (isSlowed(e, nowMs) ? slowFactor : 1);
    while (remaining > 0 && e.alive) {
      const a = path[e.pathIndex];
      const b = path[e.pathIndex + 1];
      if (!a || !b) {
        // reached the end
        e.alive = false;
        onLeaked?.(e.id);
        break;
      }
      const segLen = dist(a, b);
      const segRemaining = segLen * (1 - e.pathT);
      if (remaining < segRemaining) {
        e.pathT += remaining / segLen;
        remaining = 0;
      } else {
        remaining -= segRemaining;
        e.pathIndex += 1;
        e.pathT = 0;
      }
      // update position
      const cur = path[e.pathIndex];
      const nxt = path[e.pathIndex + 1];
      if (cur && nxt) {
        e.x = cur[0] + (nxt[0] - cur[0]) * e.pathT;
        e.y = cur[1] + (nxt[1] - cur[1]) * e.pathT;
      } else if (cur) {
        e.x = cur[0]; e.y = cur[1];
      }
    }
  }
}

function dist(a: readonly [number, number], b: readonly [number, number]): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return Math.hypot(dx, dy);
}

function isSlowed(e: Enemy, nowMs: number): boolean {
  return e.slowExpiresAtMs !== undefined && e.slowExpiresAtMs > nowMs;
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- movement`
Expected: 5 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/16-movement-system
git add client/src/game/systems/movement.ts client/test/movement.test.ts
git commit -m "feat(client): MovementSystem with slow + leak detection"
git push -u origin feature/16-movement-system
gh pr create --fill --base main
```

---

## Task 17: TargetingSystem (TDD)

**Files:**
- Create: `client/src/game/systems/targeting.ts`
- Create: `client/test/targeting.test.ts`

**Parallel:** independent of Tasks 16, 18–22.

- [ ] **Step 1: Write the failing test `client/test/targeting.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { acquireTargets } from '../src/game/systems/targeting.js';
import { createTower } from '../src/game/entities/Tower.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const towerDef = { kind: 'arrow' as const, displayName: 'Arrow', cost: 50, range: 100, damage: 10, fireRateMs: 600 };
const enemyDef = { kind: 'soldier' as const, hp: 30, speed: 50, bounty: 8, armor: false };

describe('acquireTargets', () => {
  it('picks an enemy within range', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    acquireTargets([t], [e]);
    expect(t.target?.id).toBe(e.id);
  });

  it('skips enemies out of range', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 200, 0);
    acquireTargets([t], [e]);
    expect(t.target).toBeNull();
  });

  it('prefers enemy further along path (higher pathIndex/pathT)', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e1 = createEnemy(enemyDef, 40, 0);
    const e2 = createEnemy(enemyDef, 60, 0);
    e1.pathIndex = 0; e1.pathT = 0.1;
    e2.pathIndex = 0; e2.pathT = 0.5;
    acquireTargets([t], [e1, e2]);
    expect(t.target?.id).toBe(e2.id);
  });

  it('releases dead or out-of-range targets', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    t.target = e;
    e.alive = false;
    acquireTargets([t], [e]);
    expect(t.target).toBeNull();
  });

  it('keeps current target if still valid', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const cur = createEnemy(enemyDef, 50, 0);
    const other = createEnemy(enemyDef, 30, 0);
    t.target = cur;
    acquireTargets([t], [cur, other]);
    expect(t.target?.id).toBe(cur.id);
  });

  it('skips towers with zero range (e.g. barracks)', () => {
    const barracks = createTower({ ...towerDef, kind: 'barracks', range: 0 }, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 50, 0);
    acquireTargets([barracks], [e]);
    expect(barracks.target).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- targeting`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/targeting.ts`.**

```ts
import type { Tower } from '../entities/Tower.js';
import type { Enemy } from '../entities/Enemy.js';

export function acquireTargets(towers: Tower[], enemies: Enemy[]): void {
  for (const t of towers) {
    if (t.def.range <= 0) { t.target = null; continue; }
    // Release if current target is dead or out of range.
    if (t.target && (!t.target.alive || distSq(t, t.target) > t.def.range * t.def.range)) {
      t.target = null;
    }
    if (t.target) continue;
    // Pick the enemy furthest along the path within range.
    let best: Enemy | null = null;
    let bestKey = -Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (distSq(t, e) > t.def.range * t.def.range) continue;
      const key = e.pathIndex + e.pathT;
      if (key > bestKey) { bestKey = key; best = e; }
    }
    t.target = best;
  }
}

function distSq(t: Tower, e: Enemy): number {
  const dx = t.x - e.x, dy = t.y - e.y;
  return dx * dx + dy * dy;
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- targeting`
Expected: 6 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/17-targeting-system
git add client/src/game/systems/targeting.ts client/test/targeting.test.ts
git commit -m "feat(client): TargetingSystem with furthest-along selection"
git push -u origin feature/17-targeting-system
gh pr create --fill --base main
```

---

## Task 18: FiringSystem (TDD)

**Files:**
- Create: `client/src/game/systems/firing.ts`
- Create: `client/test/firing.test.ts`

**Parallel.**

- [ ] **Step 1: Write the failing test `client/test/firing.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { fireTowers } from '../src/game/systems/firing.js';
import { createTower } from '../src/game/entities/Tower.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const towerDef = { kind: 'arrow' as const, displayName: 'Arrow', cost: 50, range: 100, damage: 10, fireRateMs: 600 };
const enemyDef = { kind: 'soldier' as const, hp: 30, speed: 50, bounty: 8, armor: false };

describe('fireTowers', () => {
  it('fires when target acquired and cooldown is 0', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    t.target = createEnemy(enemyDef, 50, 0);
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(1);
    expect(t.cooldownMs).toBe(towerDef.fireRateMs);
  });

  it('does not fire while cooldown remains', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    t.target = createEnemy(enemyDef, 50, 0);
    t.cooldownMs = 300;
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(0);
    expect(t.cooldownMs).toBe(284);
  });

  it('does not fire without a target', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const bullets = fireTowers([t], 16);
    expect(bullets).toHaveLength(0);
  });

  it('skips zero-fireRate towers', () => {
    const barracks = createTower({ ...towerDef, kind: 'barracks', fireRateMs: 0 }, 0, 0, 0, 0);
    barracks.target = createEnemy(enemyDef, 50, 0);
    const bullets = fireTowers([barracks], 16);
    expect(bullets).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- firing`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/firing.ts`.**

```ts
import type { Tower } from '../entities/Tower.js';
import { createBullet, type Bullet } from '../entities/Bullet.js';

export function fireTowers(towers: Tower[], dtMs: number): Bullet[] {
  const bullets: Bullet[] = [];
  for (const t of towers) {
    if (t.cooldownMs > 0) {
      t.cooldownMs = Math.max(0, t.cooldownMs - dtMs);
      continue;
    }
    if (!t.target || !t.target.alive) continue;
    if (t.def.fireRateMs <= 0) continue;
    bullets.push(createBullet(t, t.target));
    t.cooldownMs = t.def.fireRateMs;
  }
  return bullets;
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- firing`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/18-firing-system
git add client/src/game/systems/firing.ts client/test/firing.test.ts
git commit -m "feat(client): FiringSystem with cooldown handling"
git push -u origin feature/18-firing-system
gh pr create --fill --base main
```

---

## Task 19: CollisionSystem (TDD)

**Files:**
- Create: `client/src/game/systems/collision.ts`
- Create: `client/test/collision.test.ts`

**Parallel.**

- [ ] **Step 1: Write the failing test `client/test/collision.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { advanceBullets } from '../src/game/systems/collision.js';
import { createBullet } from '../src/game/entities/Bullet.js';
import { createTower } from '../src/game/entities/Tower.js';
import { createEnemy } from '../src/game/entities/Enemy.js';

const towerDef = { kind: 'arrow' as const, displayName: 'Arrow', cost: 50, range: 100, damage: 10, fireRateMs: 600, armorPenalty: 0.5 };
const enemyDef = { kind: 'soldier' as const, hp: 30, speed: 50, bounty: 8, armor: false };

describe('advanceBullets', () => {
  it('moves bullet toward target', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 600, 0);
    const b = createBullet(t, e, 300); // 300 px/s
    advanceBullets([b], 1.0); // 300 px in 1s
    expect(b.x).toBeCloseTo(300, 1);
  });

  it('hits target and deals damage when within hit radius', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 10, 0);
    const b = createBullet(t, e, 600);
    advanceBullets([b], 0.1);
    expect(e.hp).toBe(20); // 30 - 10
    expect(b.alive).toBe(false);
  });

  it('applies armor penalty against armored enemies', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const armored = createEnemy({ ...enemyDef, kind: 'armored', armor: true }, 10, 0);
    const b = createBullet(t, armored, 600);
    advanceBullets([b], 0.1);
    expect(armored.hp).toBe(25); // 30 - (10 * 0.5)
  });

  it('marks enemy dead when hp drops to <= 0', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy({ ...enemyDef, hp: 5 }, 10, 0);
    const b = createBullet(t, e, 600);
    advanceBullets([b], 0.1);
    expect(e.alive).toBe(false);
  });

  it('despawns bullet when its target died', () => {
    const t = createTower(towerDef, 0, 0, 0, 0);
    const e = createEnemy(enemyDef, 100, 0);
    const b = createBullet(t, e, 300);
    e.alive = false;
    advanceBullets([b], 0.1);
    expect(b.alive).toBe(false);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- collision`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/collision.ts`.**

```ts
import type { Bullet } from '../entities/Bullet.js';

const HIT_RADIUS = 12;

export function advanceBullets(bullets: Bullet[], dtSec: number): void {
  for (const b of bullets) {
    if (!b.alive) continue;
    if (!b.target.alive) { b.alive = false; continue; }
    const dx = b.target.x - b.x, dy = b.target.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d <= HIT_RADIUS) {
      const mult = b.target.def.armor && b.source.def.armorPenalty != null ? b.source.def.armorPenalty : 1;
      b.target.hp -= b.damage * mult;
      if (b.target.hp <= 0) b.target.alive = false;
      b.alive = false;
      continue;
    }
    const step = b.speed * dtSec;
    b.x += (dx / d) * step;
    b.y += (dy / d) * step;
  }
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- collision`
Expected: 5 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/19-collision-system
git add client/src/game/systems/collision.ts client/test/collision.test.ts
git commit -m "feat(client): CollisionSystem (bullet move + hit + armor penalty)"
git push -u origin feature/19-collision-system
gh pr create --fill --base main
```

---

## Task 20: SpawnSystem (TDD)

**Files:**
- Create: `client/src/game/systems/spawn.ts`
- Create: `client/test/spawn.test.ts`

**Parallel.**

- [ ] **Step 1: Write the failing test `client/test/spawn.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { SpawnQueue } from '../src/game/systems/spawn.js';
import type { WaveSpawn } from '@td/shared';

const spawns: WaveSpawn[] = [
  { enemyKind: 'soldier', atMs: 0 },
  { enemyKind: 'runner',  atMs: 500 },
  { enemyKind: 'tank',    atMs: 1200 },
];

describe('SpawnQueue', () => {
  it('emits spawns whose atMs has elapsed', () => {
    const q = new SpawnQueue(spawns);
    expect(q.tick(0)).toEqual([{ enemyKind: 'soldier', atMs: 0 }]);
    expect(q.tick(400)).toEqual([]);
    expect(q.tick(500)).toEqual([{ enemyKind: 'runner', atMs: 500 }]);
    expect(q.tick(1500)).toEqual([{ enemyKind: 'tank', atMs: 1200 }]);
  });

  it('reports done() when all spawns emitted', () => {
    const q = new SpawnQueue(spawns);
    expect(q.done()).toBe(false);
    q.tick(2000);
    expect(q.done()).toBe(true);
  });

  it('handles empty schedule', () => {
    const q = new SpawnQueue([]);
    expect(q.done()).toBe(true);
    expect(q.tick(0)).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- spawn`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/spawn.ts`.**

```ts
import type { WaveSpawn } from '@td/shared';

export class SpawnQueue {
  private next = 0;
  constructor(private readonly schedule: readonly WaveSpawn[]) {}

  tick(elapsedMs: number): WaveSpawn[] {
    const out: WaveSpawn[] = [];
    while (this.next < this.schedule.length && this.schedule[this.next]!.atMs <= elapsedMs) {
      out.push(this.schedule[this.next]!);
      this.next += 1;
    }
    return out;
  }

  done(): boolean { return this.next >= this.schedule.length; }
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- spawn`
Expected: 3 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/20-spawn-system
git add client/src/game/systems/spawn.ts client/test/spawn.test.ts
git commit -m "feat(client): SpawnQueue emits enemies on schedule"
git push -u origin feature/20-spawn-system
gh pr create --fill --base main
```

---

## Task 21: EconomySystem (TDD)

**Files:**
- Create: `client/src/game/systems/economy.ts`
- Create: `client/test/economy.test.ts`

**Parallel.**

- [ ] **Step 1: Write the failing test `client/test/economy.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { Economy } from '../src/game/systems/economy.js';

describe('Economy', () => {
  it('starts with given gold', () => {
    const e = new Economy(100);
    expect(e.gold).toBe(100);
  });

  it('rewards bounty on kill', () => {
    const e = new Economy(0);
    e.reward(15);
    expect(e.gold).toBe(15);
  });

  it('canAfford / spend work together', () => {
    const e = new Economy(50);
    expect(e.canAfford(50)).toBe(true);
    expect(e.canAfford(51)).toBe(false);
    e.spend(50);
    expect(e.gold).toBe(0);
  });

  it('spend throws if insufficient gold', () => {
    const e = new Economy(10);
    expect(() => e.spend(20)).toThrow();
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- economy`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/economy.ts`.**

```ts
export class Economy {
  constructor(public gold: number) {}
  reward(amount: number): void { this.gold += amount; }
  canAfford(amount: number): boolean { return this.gold >= amount; }
  spend(amount: number): void {
    if (!this.canAfford(amount)) throw new Error(`insufficient gold: need ${amount}, have ${this.gold}`);
    this.gold -= amount;
  }
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- economy`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/21-economy-system
git add client/src/game/systems/economy.ts client/test/economy.test.ts
git commit -m "feat(client): Economy (gold, reward, spend)"
git push -u origin feature/21-economy-system
gh pr create --fill --base main
```

---

## Task 22: LivesSystem (TDD)

**Files:**
- Create: `client/src/game/systems/lives.ts`
- Create: `client/test/lives.test.ts`

**Parallel.**

- [ ] **Step 1: Write the failing test `client/test/lives.test.ts`.**

```ts
import { describe, it, expect } from 'vitest';
import { Lives } from '../src/game/systems/lives.js';

describe('Lives', () => {
  it('decrements on leak', () => {
    const l = new Lives(20);
    l.onLeaked();
    expect(l.remaining).toBe(19);
  });

  it('gameOver when remaining reaches 0', () => {
    const l = new Lives(2);
    expect(l.gameOver()).toBe(false);
    l.onLeaked(); l.onLeaked();
    expect(l.gameOver()).toBe(true);
  });

  it('does not go below 0', () => {
    const l = new Lives(1);
    l.onLeaked(); l.onLeaked();
    expect(l.remaining).toBe(0);
  });
});
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- lives`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/systems/lives.ts`.**

```ts
export class Lives {
  constructor(public remaining: number) {}
  onLeaked(): void { this.remaining = Math.max(0, this.remaining - 1); }
  gameOver(): boolean { return this.remaining <= 0; }
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- lives`
Expected: 3 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/22-lives-system
git add client/src/game/systems/lives.ts client/test/lives.test.ts
git commit -m "feat(client): Lives counter with leak handling"
git push -u origin feature/22-lives-system
gh pr create --fill --base main
```

> **Milestone — QA gate:** dispatch QA agent. `npm test` must pass across all server + client suites. Expect 30+ passing tests total.

---

## Task 23: Client fallback waves table

**Files:**
- Create: `client/src/game/fallback/waves.ts`
- Create: `client/test/fallback.test.ts`

Mirror of server's fallback so the client survives a totally offline backend.

- [ ] **Step 1: Write the failing test `client/test/fallback.test.ts`.**

```ts
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
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- fallback`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/fallback/waves.ts`** — same algorithm as server but copy-pasted (intentional duplication; the two evolve independently if one ever drifts).

```ts
import type { WaveSpawn, EnemyKind } from '@td/shared';
import { MAX_SPAWNS_PER_WAVE } from '@td/shared';

export function clientFallbackWave(waveNumber: number): WaveSpawn[] {
  const n = Math.max(1, Math.floor(waveNumber));
  const count = Math.min(5 + n * 2, MAX_SPAWNS_PER_WAVE);
  const gap = 600;
  const spawns: WaveSpawn[] = [];
  for (let i = 0; i < count; i++) {
    spawns.push({ enemyKind: pickKind(n, i), atMs: i * gap });
  }
  return spawns;
}

function pickKind(wave: number, index: number): EnemyKind {
  if (wave <= 2) return index % 4 === 3 ? 'runner' : 'soldier';
  if (wave <= 5) {
    if (index % 5 === 4) return 'armored';
    if (index % 3 === 2) return 'runner';
    return 'soldier';
  }
  if (index % 7 === 6) return 'tank';
  if (index % 4 === 3) return 'armored';
  if (index % 3 === 2) return 'runner';
  return 'soldier';
}
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- fallback`
Expected: 2 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/23-client-fallback
git add client/src/game/fallback/waves.ts client/test/fallback.test.ts
git commit -m "feat(client): local fallback waves mirror"
git push -u origin feature/23-client-fallback
gh pr create --fill --base main
```

---

## Task 24: WaveDirectorClient (TDD)

**Files:**
- Create: `client/src/game/WaveDirectorClient.ts`
- Create: `client/test/wave-director-client.test.ts`

- [ ] **Step 1: Write the failing test `client/test/wave-director-client.test.ts`.**

```ts
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
```

- [ ] **Step 2: Run test — verify fail.**

Run: `npm -w @td/client run test -- wave-director-client`
Expected: FAIL.

- [ ] **Step 3: Implement `client/src/game/WaveDirectorClient.ts`.**

```ts
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
```

- [ ] **Step 4: Run tests — verify pass.**

Run: `npm -w @td/client run test -- wave-director-client`
Expected: 4 tests pass.

- [ ] **Step 5: Commit and PR.**

```bash
git checkout -b feature/24-wave-director-client
git add client/src/game/WaveDirectorClient.ts client/test/wave-director-client.test.ts
git commit -m "feat(client): WaveDirectorClient with local fallback"
git push -u origin feature/24-wave-director-client
gh pr create --fill --base main
```

---

## Task 25: PlayScene full wiring

**Files:**
- Modify: `client/src/scenes/PlayScene.ts` (replace shell with full game loop)

No new tests — system tests already cover the logic; this task is the integration into Phaser.

- [ ] **Step 1: Replace `client/src/scenes/PlayScene.ts` entirely.**

```ts
import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';
import mapData from '../game/data/maps/grasslands.json' assert { type: 'json' };
import towersData from '../game/data/towers.json' assert { type: 'json' };
import enemiesData from '../game/data/enemies.json' assert { type: 'json' };
import { createEnemy, type Enemy, type EnemyDef } from '../game/entities/Enemy.js';
import { createTower, type Tower, type TowerDef } from '../game/entities/Tower.js';
import type { Bullet } from '../game/entities/Bullet.js';
import { advanceMovement } from '../game/systems/movement.js';
import { acquireTargets } from '../game/systems/targeting.js';
import { fireTowers } from '../game/systems/firing.js';
import { advanceBullets } from '../game/systems/collision.js';
import { SpawnQueue } from '../game/systems/spawn.js';
import { Economy } from '../game/systems/economy.js';
import { Lives } from '../game/systems/lives.js';
import { WaveDirectorClient } from '../game/WaveDirectorClient.js';
import type { EnemyKind, TowerKind, WaveSpawn } from '@td/shared';

interface MapDef {
  width: number; height: number; tileSize: number;
  spawn: [number, number]; goal: [number, number];
  path: [number, number][];
  buildableMask: boolean[][];
}

interface SceneEvents {
  onHudUpdate(state: { lives: number; gold: number; wave: number; aiSource: 'ai' | 'fallback' | 'pending'; fallbackCount: number }): void;
  onGameOver(wave: number): void;
}

export class PlayScene extends Phaser.Scene {
  private map!: MapDef;
  private pathPx!: [number, number][];
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private bullets: Bullet[] = [];
  private enemyDefs!: Record<EnemyKind, EnemyDef>;
  private towerDefs!: Record<TowerKind, TowerDef>;
  private spawnQueue!: SpawnQueue;
  private economy!: Economy;
  private lives!: Lives;
  private waveNumber = 0;
  private waveElapsedMs = 0;
  private interWaveDelayMs = 0;
  private waveActive = false;
  private leakedThisWave = 0;
  private waveStartMs = 0;
  private aiSource: 'ai' | 'fallback' | 'pending' = 'pending';
  private fallbackCount = 0;
  private selectedTowerKind: TowerKind = 'arrow';
  private director = new WaveDirectorClient();
  private sceneEvents?: SceneEvents;

  // Sprite trackers (keyed by entity id)
  private enemySprites = new Map<number, Phaser.GameObjects.Image>();
  private towerSprites = new Map<number, Phaser.GameObjects.Image>();
  private bulletSprites = new Map<number, Phaser.GameObjects.Image>();

  constructor() { super(SceneKeys.Play); }

  init(data?: { events?: SceneEvents }): void {
    this.sceneEvents = data?.events;
    this.enemies = []; this.towers = []; this.bullets = [];
    this.enemySprites.clear(); this.towerSprites.clear(); this.bulletSprites.clear();
    this.waveNumber = 0; this.waveActive = false; this.aiSource = 'pending'; this.fallbackCount = 0;
  }

  create(): void {
    this.map = mapData as MapDef;
    this.pathPx = this.map.path.map(([x, y]) => [x * this.map.tileSize + this.map.tileSize / 2,
                                                  y * this.map.tileSize + this.map.tileSize / 2]);
    this.enemyDefs = Object.fromEntries((enemiesData as EnemyDef[]).map((d) => [d.kind, d])) as Record<EnemyKind, EnemyDef>;
    this.towerDefs = Object.fromEntries((towersData as TowerDef[]).map((d) => [d.kind, d])) as Record<TowerKind, TowerDef>;
    this.economy = new Economy(150);
    this.lives = new Lives(20);

    this.drawTiles();
    this.drawPath();
    this.setupBuildInput();
    this.startNextWave();
    this.emitHud();
  }

  update(time: number, deltaMs: number): void {
    const dtSec = deltaMs / 1000;
    if (!this.waveActive) {
      this.interWaveDelayMs -= deltaMs;
      if (this.interWaveDelayMs <= 0) this.startNextWave();
      this.updateAllSprites();
      return;
    }
    this.waveElapsedMs += deltaMs;
    const newSpawns = this.spawnQueue.tick(this.waveElapsedMs);
    for (const s of newSpawns) this.spawnEnemyFromSchedule(s);
    advanceMovement(this.enemies, this.pathPx, dtSec, (id) => this.onLeaked(id), this.waveElapsedMs);
    acquireTargets(this.towers, this.enemies);
    const fired = fireTowers(this.towers, deltaMs);
    for (const b of fired) this.addBullet(b);
    advanceBullets(this.bullets, dtSec);
    this.collectDead();
    this.updateAllSprites();
    if (this.spawnQueue.done() && this.enemies.length === 0) this.endWave();
    if (this.lives.gameOver()) this.endGame();
  }

  private async startNextWave(): Promise<void> {
    this.waveNumber += 1;
    this.aiSource = 'pending';
    this.emitHud();
    const req = {
      waveNumber: this.waveNumber, lives: this.lives.remaining, gold: this.economy.gold,
      towersBuilt: this.summarizeTowers(),
      previousWaveOutcome: this.waveStartMs > 0 ? {
        enemiesLeaked: this.leakedThisWave, timeToFinishMs: performance.now() - this.waveStartMs,
      } : undefined,
    };
    const resp = await this.director.fetchNext(req);
    this.aiSource = resp.source;
    if (resp.source === 'fallback') this.fallbackCount += 1;
    this.spawnQueue = new SpawnQueue(resp.spawns);
    this.waveElapsedMs = 0;
    this.waveActive = true;
    this.leakedThisWave = 0;
    this.waveStartMs = performance.now();
    this.emitHud();
  }

  private endWave(): void {
    this.waveActive = false;
    this.interWaveDelayMs = 3000;
  }

  private endGame(): void {
    this.scene.start(SceneKeys.GameOver, { wave: this.waveNumber });
  }

  private onLeaked(_id: number): void {
    this.lives.onLeaked();
    this.leakedThisWave += 1;
    this.emitHud();
  }

  private spawnEnemyFromSchedule(s: WaveSpawn): void {
    const def = this.enemyDefs[s.enemyKind];
    if (!def) return;
    const e = createEnemy(def, this.pathPx[0]![0], this.pathPx[0]![1]);
    this.enemies.push(e);
    const sprite = this.add.image(e.x, e.y, `enemy-${e.def.kind}`).setDisplaySize(48, 48);
    this.enemySprites.set(e.id, sprite);
  }

  private addBullet(b: Bullet): void {
    this.bullets.push(b);
    const sprite = this.add.image(b.x, b.y, 'bullet').setDisplaySize(16, 16);
    this.bulletSprites.set(b.id, sprite);
  }

  private collectDead(): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i]!;
      if (!e.alive) {
        const s = this.enemySprites.get(e.id); s?.destroy(); this.enemySprites.delete(e.id);
        if (e.hp <= 0) this.economy.reward(e.def.bounty);
        this.enemies.splice(i, 1);
      }
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i]!;
      if (!b.alive) {
        const s = this.bulletSprites.get(b.id); s?.destroy(); this.bulletSprites.delete(b.id);
        this.bullets.splice(i, 1);
      }
    }
  }

  private updateAllSprites(): void {
    for (const e of this.enemies) {
      const s = this.enemySprites.get(e.id); if (s) { s.x = e.x; s.y = e.y; }
    }
    for (const b of this.bullets) {
      const s = this.bulletSprites.get(b.id); if (s) { s.x = b.x; s.y = b.y; }
    }
  }

  private drawTiles(): void {
    const ts = this.map.tileSize;
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const buildable = this.map.buildableMask[y]?.[x] ?? false;
        this.add.image(x * ts + ts / 2, y * ts + ts / 2, buildable ? 'tile-grass' : 'tile-path').setDisplaySize(ts, ts);
      }
    }
    this.add.image(this.map.spawn[0] * ts + ts / 2, this.map.spawn[1] * ts + ts / 2, 'tile-spawn').setDisplaySize(ts, ts);
    this.add.image(this.map.goal[0]  * ts + ts / 2, this.map.goal[1]  * ts + ts / 2, 'tile-goal').setDisplaySize(ts, ts);
  }

  private drawPath(): void {
    const g = this.add.graphics({ lineStyle: { width: 4, color: 0xffff00, alpha: 0.3 } });
    g.beginPath();
    g.moveTo(this.pathPx[0]![0], this.pathPx[0]![1]);
    for (let i = 1; i < this.pathPx.length; i++) g.lineTo(this.pathPx[i]![0], this.pathPx[i]![1]);
    g.strokePath();
  }

  private setupBuildInput(): void {
    const ts = this.map.tileSize;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const tileX = Math.floor(p.x / ts);
      const tileY = Math.floor(p.y / ts);
      if (!this.canBuildAt(tileX, tileY)) return;
      const def = this.towerDefs[this.selectedTowerKind];
      if (!this.economy.canAfford(def.cost)) return;
      this.economy.spend(def.cost);
      const px = tileX * ts + ts / 2, py = tileY * ts + ts / 2;
      const t = createTower(def, tileX, tileY, px, py);
      this.towers.push(t);
      const sprite = this.add.image(px, py, `tower-${def.kind}`).setDisplaySize(ts, ts);
      this.towerSprites.set(t.id, sprite);
      this.sound.play('sfx-build');
      this.emitHud();
    });
  }

  setSelectedTower(kind: TowerKind): void { this.selectedTowerKind = kind; }

  private canBuildAt(tileX: number, tileY: number): boolean {
    if (tileY < 0 || tileY >= this.map.height || tileX < 0 || tileX >= this.map.width) return false;
    if (!this.map.buildableMask[tileY]?.[tileX]) return false;
    return !this.towers.some((t) => t.tileX === tileX && t.tileY === tileY);
  }

  private summarizeTowers(): { kind: TowerKind; count: number }[] {
    const counts = new Map<TowerKind, number>();
    for (const t of this.towers) counts.set(t.def.kind, (counts.get(t.def.kind) ?? 0) + 1);
    return Array.from(counts, ([kind, count]) => ({ kind, count }));
  }

  private emitHud(): void {
    this.sceneEvents?.onHudUpdate({
      lives: this.lives.remaining, gold: this.economy.gold,
      wave: this.waveNumber, aiSource: this.aiSource, fallbackCount: this.fallbackCount,
    });
  }
}
```

- [ ] **Step 2: Smoke-run.**

Run: server in one shell: `npm -w @td/server run dev`
Run: client in another: `npm -w @td/client run dev`
Open `http://localhost:5173`, click PLAY.
Expected: enemies spawn from the left, walk the path. Click on a green tile to place an arrow tower (default selection); it should fire bullets. Lives count decreases when enemies leak. Game-over screen on 0 lives (errors because GameOverScene doesn't exist yet — that's OK, fixed in Task 27).

- [ ] **Step 3: Run all tests to confirm nothing regressed.**

Run: `npm test` (from root)
Expected: all suites pass.

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/25-playscene-wiring
git add client/src/scenes/PlayScene.ts
git commit -m "feat(client): wire PlayScene with all systems + WaveDirectorClient"
git push -u origin feature/25-playscene-wiring
gh pr create --fill --base main
```

---

## Task 26: UI (HUD, BuildMenu, WaveBanner)

**Files:**
- Create: `client/src/ui/Hud.ts`
- Modify: `client/src/scenes/PlayScene.ts` (instantiate HUD + pass it as `events`)

A single class manages all three UI pieces (HUD bar at top, build menu at bottom, transient wave banner). Drawn as Phaser DOM/Graphics overlay, NOT HTML — keeps everything in the canvas.

- [ ] **Step 1: Create `client/src/ui/Hud.ts`.**

```ts
import Phaser from 'phaser';
import type { TowerKind } from '@td/shared';

interface HudState {
  lives: number; gold: number; wave: number;
  aiSource: 'ai' | 'fallback' | 'pending'; fallbackCount: number;
}

interface HudCallbacks {
  onSelectTower(kind: TowerKind): void;
}

export class Hud {
  private livesText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private aiText!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  private selectedKind: TowerKind = 'arrow';
  private buttons = new Map<TowerKind, Phaser.GameObjects.Text>();

  constructor(private readonly scene: Phaser.Scene, private readonly cb: HudCallbacks) {
    const w = scene.scale.width;
    const h = scene.scale.height;
    const topY = 16;
    this.livesText = scene.add.text(16, topY, '', { fontSize: '24px', color: '#ff8888' }).setScrollFactor(0).setDepth(1000);
    this.goldText  = scene.add.text(180, topY, '', { fontSize: '24px', color: '#ffd700' }).setScrollFactor(0).setDepth(1000);
    this.waveText  = scene.add.text(340, topY, '', { fontSize: '24px', color: '#ffffff' }).setScrollFactor(0).setDepth(1000);
    this.aiText    = scene.add.text(w - 16, topY, '', { fontSize: '14px', color: '#88aaff' }).setOrigin(1, 0).setScrollFactor(0).setDepth(1000);

    // Build menu — bottom strip
    const kinds: TowerKind[] = ['arrow', 'cannon', 'frost', 'barracks'];
    kinds.forEach((kind, i) => {
      const x = 16 + i * 220;
      const btn = scene.add.text(x, h - 48, this.label(kind), {
        fontSize: '20px', color: '#ffffff', backgroundColor: '#222244', padding: { x: 12, y: 8 },
      }).setScrollFactor(0).setDepth(1000).setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.select(kind));
      this.buttons.set(kind, btn);
    });
    this.select('arrow');

    // Wave banner
    this.banner = scene.add.text(w / 2, h / 2, '', {
      fontSize: '64px', color: '#ffffff', fontStyle: 'bold', backgroundColor: '#000000aa', padding: { x: 24, y: 16 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(2000).setAlpha(0);
  }

  update(s: HudState): void {
    this.livesText.setText(`♥ ${s.lives}`);
    this.goldText.setText(`◯ ${s.gold}`);
    this.waveText.setText(`Wave ${s.wave}`);
    const src = s.aiSource === 'ai' ? 'AI' : s.aiSource === 'fallback' ? 'FALLBACK' : 'PREP';
    this.aiText.setText(`director: ${src}${s.fallbackCount ? ` (fb:${s.fallbackCount})` : ''}`);
  }

  flashWaveBanner(wave: number): void {
    this.banner.setText(`Wave ${wave}`);
    this.scene.tweens.add({
      targets: this.banner, alpha: { from: 1, to: 0 }, duration: 1500, ease: 'Sine.easeOut',
    });
  }

  private select(kind: TowerKind): void {
    if (this.selectedKind === kind) return;
    this.buttons.get(this.selectedKind)?.setBackgroundColor('#222244');
    this.buttons.get(kind)?.setBackgroundColor('#445588');
    this.selectedKind = kind;
    this.cb.onSelectTower(kind);
  }

  private label(kind: TowerKind): string {
    const costs: Record<TowerKind, number> = { arrow: 50, cannon: 100, frost: 75, barracks: 80 };
    const names: Record<TowerKind, string> = { arrow: 'Arrow', cannon: 'Cannon', frost: 'Frost', barracks: 'Barracks' };
    return `${names[kind]}  ◯${costs[kind]}`;
  }
}
```

- [ ] **Step 2: Modify `PlayScene.create()` to instantiate the HUD.**

Add to `create()` after `this.startNextWave();`:
```ts
const hud = new Hud(this, { onSelectTower: (k) => this.setSelectedTower(k) });
this.sceneEvents = {
  onHudUpdate: (st) => {
    hud.update(st);
    if (st.aiSource !== 'pending' && this.waveActive && this.waveElapsedMs < 50) hud.flashWaveBanner(st.wave);
  },
  onGameOver: () => {},
};
this.emitHud();
```

Add at the top of the file:
```ts
import { Hud } from '../ui/Hud.js';
```

Remove the `init(data?)` line that reads `data?.events` if you prefer; we now construct the HUD inside `create` so init data isn't needed.

- [ ] **Step 3: Smoke-run.**

Run server + client, click PLAY.
Expected: HUD shows lives, gold, wave, director status. Bottom strip has four tower buttons; clicking a button changes the selected tower (highlight); clicking a buildable tile places that tower. Wave banner flashes on each new wave.

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/26-ui-hud
git add client/src/ui/Hud.ts client/src/scenes/PlayScene.ts
git commit -m "feat(client): HUD with lives/gold/wave/director-source + build menu + wave banner"
git push -u origin feature/26-ui-hud
gh pr create --fill --base main
```

---

## Task 27: GameOverScene + scene flow

**Files:**
- Create: `client/src/scenes/GameOverScene.ts`
- Modify: `client/src/main.ts`

- [ ] **Step 1: Create `client/src/scenes/GameOverScene.ts`.**

```ts
import Phaser from 'phaser';
import { SceneKeys } from './BootScene.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super(SceneKeys.GameOver); }

  create(data: { wave?: number }): void {
    const { width, height } = this.scale;
    const wave = data.wave ?? 0;
    this.add.text(width / 2, height / 2 - 60, 'GAME OVER', {
      fontSize: '64px', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5);
    this.add.text(width / 2, height / 2, `Reached wave ${wave}`, {
      fontSize: '28px', color: '#ffffff',
    }).setOrigin(0.5);
    const retry = this.add.text(width / 2, height / 2 + 80, '▶  RETRY', {
      fontSize: '28px', color: '#88ff88',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', () => this.scene.start(SceneKeys.Play));
    const menu = this.add.text(width / 2, height / 2 + 130, '↩  Menu', {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerdown', () => this.scene.start(SceneKeys.Menu));
  }
}
```

- [ ] **Step 2: Register in `client/src/main.ts`.**

```ts
import { GameOverScene } from './scenes/GameOverScene.js';
// ...
scene: [BootScene, MenuScene, PlayScene, GameOverScene],
```

- [ ] **Step 3: Run all tests + smoke-run.**

Run: `npm test`
Expected: all pass.
Run: server + client. Play until 0 lives.
Expected: GameOverScene shows wave count, Retry restarts PlayScene, Menu returns to MenuScene.

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/27-gameover-scene
git add client/src/scenes/GameOverScene.ts client/src/main.ts
git commit -m "feat(client): GameOverScene with retry + menu"
git push -u origin feature/27-gameover-scene
gh pr create --fill --base main
```

> **Milestone — QA gate:** dispatch QA agent. Run full `MANUAL_QA.md` checklist (created in Task 29) in a real browser.

---

## Task 28: CI workflow + branch protection

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create `.github/workflows/ci.yml`.**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

- [ ] **Step 2: Commit and PR.**

```bash
git checkout -b feature/28-ci
git add .github/workflows/ci.yml
git commit -m "ci: run lint + tests on push and PR"
git push -u origin feature/28-ci
gh pr create --fill --base main
```

- [ ] **Step 3: After this PR merges, enable branch protection on `main`.**

Run from any worktree:
```bash
gh api -X PUT repos/Ghenghis/TD-DaveAI/branches/main/protection \
  -f required_status_checks='{"strict":true,"contexts":["test"]}' \
  -f enforce_admins=false \
  -f required_pull_request_reviews=null \
  -f restrictions=null
```

This requires CI to pass before merge but does not require a human review (you are the only human). Adjust later if you add collaborators.

---

## Task 29: README, MANUAL_QA, CREDITS

**Files:**
- Create: `README.md`
- Create: `MANUAL_QA.md`
- Create: `CREDITS.md`

- [ ] **Step 1: Create `README.md`.**

```markdown
# TD-DaveAI

A 2D tower defense game with AI-generated waves (DeepSeek v4 via Node proxy).

## Quick start

1. Place API keys in `G:\private`:
   - `G:\private\deepseek.key` — your DeepSeek API key
   - `G:\private\minimax.key` — your Minimax API key (unused in v1)
2. Install: `npm install`
3. Prepare Kenney assets: `npm run assets`
   (assumes `G:\Kenney Game Assets All-in-1 3.5.0`; override with `KENNEY_ROOT=...`)
4. Run both server + client: `npm run dev`
5. Open `http://localhost:5173`

## Architecture

See [`docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md`](docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md).

## Tests

`npm test` runs server + client suites.

## License

MIT (game code). Kenney assets are CC0 — see [`CREDITS.md`](CREDITS.md).
```

- [ ] **Step 2: Create `MANUAL_QA.md`.**

```markdown
# Manual QA Checklist

Run before each milestone merge.

## Setup
- [ ] `npm run dev` starts both server (`:8787`) and client (`:5173`).
- [ ] `curl http://localhost:8787/healthz` returns `{"ok":true}`.

## Menu
- [ ] Title and PLAY button render correctly.
- [ ] Clicking PLAY transitions to game.

## Gameplay
- [ ] First wave starts within 3s of entering PlayScene.
- [ ] HUD shows lives=20, gold=150, wave=1.
- [ ] Director status shows "AI" (or "FALLBACK" if your DeepSeek key is missing — confirm both cases work).
- [ ] Enemies spawn from left edge, follow the yellow path, reach the right edge.
- [ ] Selecting a tower button highlights it.
- [ ] Clicking a green tile places the selected tower; gold deducts.
- [ ] Clicking a non-buildable (path or occupied) tile does nothing.
- [ ] Arrow tower fires bullets at the nearest enemy in range.
- [ ] Killing an enemy increases gold by its bounty.
- [ ] Enemy reaching the goal decrements lives.
- [ ] Wave ends after all enemies spawned + cleared; next wave starts within ~3s.
- [ ] Wave banner flashes on each new wave.

## Tower variety
- [ ] Cannon tower fires slower but hits harder.
- [ ] Frost tower visibly slows enemies (compare to no-frost).
- [ ] Armored enemies take ~half damage from arrow towers, full from cannon.

## Game over
- [ ] When lives reach 0, GameOver scene appears with correct wave count.
- [ ] Retry restarts PlayScene with fresh state.
- [ ] Menu returns to MenuScene.

## Resilience
- [ ] Kill the server (`Ctrl+C` in the server terminal). Client continues to play using fallback waves. Director status reads "FALLBACK" with fb-counter incrementing.
- [ ] Restart the server. Next wave resumes with "AI" status.

## Secrets
- [ ] Server logs do NOT contain any portion of your real API keys (grep the log output).
- [ ] HTTP error responses do NOT contain key fragments.
```

- [ ] **Step 3: Create `CREDITS.md`.**

```markdown
# Credits

## Art & audio

[Kenney](https://kenney.itch.io/kenney-game-assets) — all sprite and audio assets used in this game are from Kenney's Game Asset All-in-1 pack v3.5.0, released under CC0.
No attribution is required, but we credit anyway. Thanks, Kenney.

## AI

- [DeepSeek](https://api.deepseek.com) — wave director (v1).
- [Minimax](https://api.minimax.chat) — reserved for v2 (advisor / TTS).
```

- [ ] **Step 4: Commit and PR.**

```bash
git checkout -b feature/29-docs
git add README.md MANUAL_QA.md CREDITS.md
git commit -m "docs: README, manual QA checklist, asset credits"
git push -u origin feature/29-docs
gh pr create --fill --base main
```

> **Final QA gate:** run the full `MANUAL_QA.md` checklist in a real browser. When all boxes tick, v1 ships.

---

## Self-review notes

- **Spec coverage check:**
  - §2 stack: Tasks 1, 3, 7, 9, 11.
  - §3 layout: Tasks 1–3, 10, 11.
  - §4 entities & systems: Tasks 15–22.
  - §4.4 map representation: Task 14.
  - §4.5 data files: Task 14.
  - §5 wave director data flow: Tasks 4, 5, 6, 7, 8, 9 (server side); Tasks 23, 24 (client side); Task 25 (integration).
  - §6 error handling & secrets: Tasks 4, 7, 8, 24 (each with explicit no-leak tests).
  - §7 testing: every task with logic has a TDD test step; CI in Task 28; manual QA in Task 29.
  - §8 future milestones: explicitly out of scope for this plan.
- **Placeholder scan:** no TBDs. Asset tile numbers in Task 12 are flagged as placeholders (with an instruction to the implementer to pick visually appropriate sprites) — this is unavoidable since we can't predict which Kenney tile indices look best without running `prepare-assets`.
- **Type consistency:** `EnemyKind`/`TowerKind` enums are defined once in `@td/shared` (Task 2) and imported everywhere. `WaveResponse.source` literal values (`'ai'` / `'fallback'`) are used consistently across server route (Task 8) and client director (Task 24).

---

## Execution handoff

Plan complete and saved to `docs/superpowers/plans/2026-05-24-2d-tower-defense-v1.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, with the code-reviewer agent gating each PR before merge. Tasks 16–22 (game systems) dispatch in parallel.
2. **Inline Execution** — I execute tasks one at a time in this session with checkpoints for review.

Tell me which approach you want.
