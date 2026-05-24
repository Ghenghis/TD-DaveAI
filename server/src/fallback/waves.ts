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
