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
