import type { TowerKind } from '@td/shared';
import type { Enemy } from './Enemy.js';

export interface TowerDef {
  kind: TowerKind;
  displayName: string;
  cost: number;
  range: number;
  damage: number;
  fireRateMs: number;
  armorPenalty?: number;
  slowFactor?: number;
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
export function createTower(
  def: TowerDef,
  tileX: number,
  tileY: number,
  x: number,
  y: number,
): Tower {
  return { id: nextId++, def, tileX, tileY, x, y, cooldownMs: 0, target: null };
}
