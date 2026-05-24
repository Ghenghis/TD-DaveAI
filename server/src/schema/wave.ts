import { z } from 'zod';
import type { EnemyKind, TowerKind } from '@td/shared';

// z.enum needs a literal tuple; we duplicate the names here so the inferred
// types are the proper EnemyKind/TowerKind unions (not just `string`). The
// shared @td/shared package owns the canonical lists; if you add a kind there,
// add it here too — TS will compile-error if either side drifts.
const enemyKindSchema = z.enum([
  'soldier',
  'runner',
  'tank',
  'armored',
] as const) satisfies z.ZodType<EnemyKind>;
const towerKindSchema = z.enum([
  'arrow',
  'cannon',
  'frost',
  'barracks',
] as const) satisfies z.ZodType<TowerKind>;

export const waveRequestSchema = z.object({
  waveNumber: z.number().int().nonnegative(),
  lives: z.number().int().nonnegative(),
  gold: z.number().int().nonnegative(),
  towersBuilt: z.array(
    z.object({
      kind: towerKindSchema,
      count: z.number().int().nonnegative(),
    }),
  ),
  previousWaveOutcome: z
    .object({
      enemiesLeaked: z.number().int().nonnegative(),
      timeToFinishMs: z.number().nonnegative(),
    })
    .optional(),
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
