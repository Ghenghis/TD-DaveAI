# 2D Tower Defense — v1 Vertical Slice Design

**Date:** 2026-05-24
**Status:** Approved, ready for implementation planning
**Scope:** Vertical slice (1 map, 4 towers, 4 enemies) with an AI-driven adaptive wave director.

---

## 1. Goals & non-goals

**Goals**
- Ship a playable browser-based 2D tower defense that demonstrably uses an LLM (DeepSeek v4) to generate each wave.
- Keep API keys (stored under `G:\private`) off the client and out of logs/responses.
- Build the codebase so the other planned AI features (procedural map generator, in-game advisor, boss/enemy AI) can be added later as bolt-on systems, not rewrites.

**Non-goals for v1**
- Multiple maps, meta-progression, account system, multiplayer, leaderboards.
- Advisor commentary, TTS via Minimax, boss-AI behavior, procedural map gen.
- Mobile/touch input, deployment to a public host.

---

## 2. Tech stack & high-level architecture

- **Client:** Phaser 3 + TypeScript, bundled with Vite. Top-down 2D view.
- **Server:** Node + Express + TypeScript. Single role: AI proxy + key custodian.
- **Shared:** A small TS package of types referenced by both sides.
- **AI provider for v1:** DeepSeek v4 (chat completions with `response_format: json_object`). Minimax wired in later for advisor/TTS.
- **Assets:** Kenney "Tower Defense" 2D pack (top-down) plus selected audio packs (UI, impact, music loops). Copied into `client/public/assets/` by a one-shot script.

```
[ Browser: Phaser 3 + TS ]
  ├─ scenes (boot, menu, play, gameover)
  ├─ Entity + System layer (movement, targeting, firing, collision, spawn, economy, lives)
  ├─ tilemap + path follower
  ├─ WaveDirectorClient ──HTTPS──▶ [ Node/Express server ]
                                          ├─ /api/wave  (calls DeepSeek)
                                          ├─ /healthz
                                          └─ reads keys from G:\private at boot
                                          (never echoed in logs/errors)
```

**Process model in dev:** root `npm run dev` uses `concurrently` to start Vite on `:5173` and Express on `:8787`. Vite proxies `/api/*` to Express so the browser only talks to one origin.

---

## 3. Repository layout

```
TowerDefence-DaveAi/
├─ client/                          # Phaser 3 + TypeScript, Vite-bundled
│   ├─ src/
│   │   ├─ main.ts                  # Phaser game bootstrap
│   │   ├─ scenes/
│   │   │   ├─ BootScene.ts         # preload + atlas loading
│   │   │   ├─ MenuScene.ts
│   │   │   ├─ PlayScene.ts         # the actual TD loop
│   │   │   └─ GameOverScene.ts
│   │   ├─ game/
│   │   │   ├─ entities/            # Enemy, Tower, Bullet
│   │   │   ├─ systems/             # movement, targeting, damage, spawn
│   │   │   ├─ data/                # tower defs, enemy defs, map JSON
│   │   │   └─ WaveDirectorClient.ts
│   │   └─ ui/                      # HUD, build menu, wave banner
│   ├─ public/assets/               # copied Kenney sprites, atlases, audio
│   ├─ index.html
│   ├─ vite.config.ts
│   └─ package.json
├─ server/                          # Node + Express, TypeScript
│   ├─ src/
│   │   ├─ index.ts                 # express bootstrap + routes
│   │   ├─ secrets.ts               # loads keys from G:\private (NEVER logged)
│   │   ├─ providers/
│   │   │   ├─ deepseek.ts          # POST → DeepSeek chat completions
│   │   │   └─ minimax.ts           # stub for v2
│   │   ├─ routes/
│   │   │   └─ wave.ts              # POST /api/wave
│   │   └─ schema/
│   │       └─ wave.ts              # zod schema for AI output validation
│   ├─ tsconfig.json
│   └─ package.json
├─ shared/                          # types referenced by both sides
│   └─ src/types.ts                 # WaveRequest, WaveResponse, EnemySpec
├─ scripts/
│   └─ prepare-assets.ts            # copies needed Kenney files into client/public
├─ docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md
├─ .gitignore                       # G:\private is OUTSIDE the repo; also ignore .env*
├─ package.json                     # workspaces: client, server, shared
└─ README.md
```

---

## 4. Game architecture (client)

A small Entity + System pattern, not a full ECS. Phaser's scene graph handles rendering; a thin systems layer handles game logic.

### 4.1 Entities (plain TS classes wrapping a Phaser sprite + state)

- **Enemy** — `hp, speed, bounty, pathIndex, pathT, kind`. Follows a polyline path; despawns on death or reaching the goal.
- **Tower** — `kind, damage, range, fireRate, lastFired, target`. Anchored to a tile; picks a target each tick.
- **Bullet** — `damage, speed, target`. Homing to the target's current position; despawns on hit.

### 4.2 Systems (pure functions called from `PlayScene.update(dt)`)

- **MovementSystem** — advances each enemy along its path by `speed * dt`.
- **TargetingSystem** — for each tower without a target (or whose target is dead/out of range), picks the enemy closest to the goal within range.
- **FiringSystem** — towers off cooldown spawn a `Bullet` aimed at their target.
- **CollisionSystem** — bullets vs enemies, applies damage, despawns bullet.
- **SpawnSystem** — reads the current wave's spawn schedule, instantiates `Enemy`s on the clock.
- **EconomySystem** — kills → bounty → gold; build/upgrade deducts gold.
- **LivesSystem** — enemy reaching goal → lose a life → game over at 0.

### 4.3 Scenes

- **BootScene** — loads sprite atlases, audio, map JSON, then transitions to `MenuScene`.
- **MenuScene** — Play / Settings / Quit. (Settings is a stub for v1.)
- **PlayScene** — runs the loop; owns the systems and entity arrays. Triggers `WaveDirectorClient.fetchNext(state)` between waves.
- **GameOverScene** — show wave reached + retry.

### 4.4 Map representation

A single JSON file:
```json
{
  "width": 20, "height": 12, "tileSize": 64,
  "tiles": [[...]],
  "path": [[x, y], ...],
  "buildableMask": [[true, false, ...]],
  "spawn": [0, 5],
  "goal": [19, 5]
}
```

Hand-authored for v1; the procedural map generator (v2) outputs the same shape.

### 4.5 Data files

`game/data/towers.json` (4 entries), `game/data/enemies.json` (4 entries), `game/data/maps/grasslands.json`.

The four v1 enemy kinds: `soldier` (baseline), `runner` (fast, low HP), `tank` (slow, high HP), `armored` (medium speed, takes ~50% damage from `arrow` and full damage from `cannon` — creates a real anti-armor tower choice).
The four v1 tower kinds: `arrow` (cheap single-target, weak vs armored), `cannon` (slow AoE, full damage vs armored), `frost` (slows targets, low damage), `barracks` (spawns a melee blocker — adds a second decision layer beyond raw DPS).

---

## 5. Data flow: AI wave director

The only async path in v1. Pre-wave only — keeps latency off the gameplay critical path.

```
PlayScene (between waves)
  │
  │  1. Build WaveRequest from current state
  │     { waveNumber, lives, gold, towersBuilt[{kind,count}],
  │       previousWaveOutcome: { enemiesLeaked, timeToFinish } }
  ▼
WaveDirectorClient.fetchNext(req)
  │
  │  2. POST /api/wave  (JSON, 5s client timeout)
  ▼
Express /api/wave route
  │
  │  3. Validate request shape with zod
  │  4. Build a system prompt that pins:
  │       - role: "you are a tower defense wave director"
  │       - allowed enemy kinds (the 4 in enemies.json)
  │       - max enemies per wave (e.g. 25)
  │       - JSON-only output, no prose
  │  5. Call DeepSeek v4 chat completions w/ response_format: json_object
  │       - 8s server timeout, single retry on 5xx
  ▼
DeepSeek
  │
  │  6. Returns JSON: { spawns: [{ enemyKind, atMs }, ...], rationale: string }
  ▼
Express
  │
  │  7. Parse + zod-validate the AI's response
  │  8. If invalid OR call failed: return the deterministic fallback wave
  │     (a static curve based on waveNumber — always works)
  │  9. Strip rationale before responding (don't send it back unless debug=1)
  ▼
WaveDirectorClient
  │
  │ 10. Hand spawns[] to SpawnSystem; show "Wave N" banner; resume play
```

### 5.1 Contract (`shared/src/types.ts`)

```ts
type EnemyKind = 'soldier' | 'runner' | 'tank' | 'armored';

interface WaveRequest {
  waveNumber: number;       // 1..N
  lives: number;
  gold: number;
  towersBuilt: { kind: string; count: number }[];
  previousWaveOutcome?: { enemiesLeaked: number; timeToFinishMs: number };
}

interface WaveSpawn { enemyKind: EnemyKind; atMs: number; }
interface WaveResponse { spawns: WaveSpawn[]; source: 'ai' | 'fallback'; }
```

### 5.2 Fallback wave

v1 must remain playable when DeepSeek is down, the key is missing, or the model returns junk. The fallback is a hand-tuned table indexed by `waveNumber` — predictable difficulty curve. The `source` field lets the HUD discreetly show whether the wave came from the AI (useful for demos and debugging).

### 5.3 Why pre-wave only

Player sees "Preparing wave…" for ≤1.5s; if the fetch takes longer we cancel and use the local fallback. No spinner-during-combat. AI never gates a frame.

---

## 6. Error handling & secrets discipline

### 6.1 Secrets (non-negotiable)

- `G:\private` is OUTSIDE the repo. `.gitignore` includes `private/`, `*.env*`, `secrets.*` as defense-in-depth.
- `server/secrets.ts` loads on boot, validates each required key is non-empty, and crashes loudly if any are missing — with a message that names the *file* but never the *value*.
- No key ever appears in: HTTP responses, log lines, error stacks (provider calls are wrapped to re-throw a sanitized error), or telemetry.
- A startup test in `server/test/secrets.test.ts` greps the server's combined log output for any substring of a known dummy key — fails CI if it leaks.
- The secrets directory path is configurable via env var (`SECRETS_DIR`), defaulting to `G:\private`.

### 6.2 Server → DeepSeek failures

| Failure | Behavior |
|---|---|
| Timeout (>8s) | One retry, then fallback wave. Log `wave_ai_timeout`, no payload. |
| 5xx | One retry with 500ms backoff, then fallback. |
| 4xx | No retry. Log status only. Fallback. |
| Invalid JSON / zod fail | No retry. Log the validation error (not the raw model output, since that could echo prompt-injection garbage). Fallback. |
| Spawn count > cap (25) | Truncate to cap, accept rest. |

### 6.3 Client failures

| Failure | Behavior |
|---|---|
| `/api/wave` 5xx or timeout (5s) | Client uses its own local fallback table (mirror of server's). Show "wave director offline" tooltip. |
| Asset load fail in `BootScene` | Show a fatal error overlay with "reload" button. |
| Physics NaN / runaway entities | Defensive bounds checks in MovementSystem; entities outside the map → despawn + warn. |

### 6.4 No silent fail-open

Every fallback path increments a counter visible in a `?debug=1` HUD panel so we notice if the AI path has quietly died.

---

## 7. Testing strategy

Focused on what actually breaks, not exhaustive coverage. Test runner: Vitest, both workspaces.

### 7.1 Server tests

- **`secrets.test.ts`** — boot fails when key file missing; loaded keys never leak to a captured logger stream (greps for known-prefix dummy values).
- **`wave.route.test.ts`** — happy path with a mocked DeepSeek (`msw` or a fake provider), then forced failures: timeout → fallback, malformed JSON → fallback, oversized payload → truncate.
- **`schema.test.ts`** — round-trips a handful of valid and invalid `WaveResponse`s through zod.

### 7.2 Client tests (headless — Phaser canvas not rendered)

- **`MovementSystem.test.ts`** — an enemy with `speed=100` and `dt=1.0` advances 100 units along a known path; reaching path end emits "leaked".
- **`TargetingSystem.test.ts`** — closest-to-goal-within-range selection, stale targets get released, dead targets get released.
- **`FiringSystem.test.ts`** — respects cooldown; doesn't fire without a target.
- **`EconomySystem.test.ts`** — gold flow, can't build when broke.
- **`WaveDirectorClient.test.ts`** — on network failure, returns the local fallback wave.

### 7.3 Manual smoke

Because Phaser rendering needs a real browser: a one-page `MANUAL_QA.md` checklist — "build tower, kill 10 enemies, survive 3 waves, lose 3 lives, restart" — run before each milestone.

### 7.4 Deliberately skipped in v1

- End-to-end browser tests (Playwright is heavy for a single scene; revisit after v1 ships).
- Visual regression (assets are static Kenney files).
- Load testing the proxy (single-user game; rate-limiting added if/when we expose it publicly).

### 7.5 CI

GitHub Actions workflow runs `npm run test` (both workspaces) on push. No deploy step yet.

---

## 8. Open questions / future milestones

- **v2 — procedural map generator.** New endpoint `/api/map`; same fallback-on-failure pattern. Validator must confirm the generated map has a contiguous path from spawn to goal.
- **v2 — advisor.** Either text bubbles (DeepSeek) or voice lines (Minimax TTS). Latency budget: 2–3s, can run concurrent with combat since it's non-blocking.
- **v3 — boss/enemy AI.** Highest-risk feature; needs streaming or pre-computed move pools to avoid per-tick LLM latency.
- **Asset licensing.** Kenney assets are CC0 — no attribution required, but a `CREDITS.md` is good form. To be added in v1.
- **Production deployment.** Out of scope for v1. When we get there: rate-limit `/api/wave`, add Origin check, move secrets to host environment (not `G:\private`).
