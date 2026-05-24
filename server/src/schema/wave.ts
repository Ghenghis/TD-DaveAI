import { z } from 'zod';
import { ALL_ENEMY_KINDS, ALL_TOWER_KINDS } from '@td/shared';

const enemyKindSchema = z.enum(ALL_ENEMY_KINDS as readonly [string, ...string[]]);
const towerKindSchema = z.enum(ALL_TOWER_KINDS as readonly [string, ...string[]]);

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
