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
  pathIndex: number;
  pathT: number;
  x: number;
  y: number;
  alive: boolean;
  slowExpiresAtMs?: number;
}

let nextId = 1;
export function createEnemy(def: EnemyDef, x: number, y: number): Enemy {
  return {
    id: nextId++,
    def,
    hp: def.hp,
    speed: def.speed,
    pathIndex: 0,
    pathT: 0,
    x,
    y,
    alive: true,
  };
}
