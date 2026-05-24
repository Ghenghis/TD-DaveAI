import type { Enemy } from './Enemy.js';
import type { Tower } from './Tower.js';

export interface Bullet {
  id: number;
  x: number;
  y: number;
  speed: number;
  damage: number;
  target: Enemy;
  source: Tower;
  alive: boolean;
}

let nextId = 1;
export function createBullet(source: Tower, target: Enemy, speed = 600): Bullet {
  return {
    id: nextId++,
    x: source.x,
    y: source.y,
    speed,
    damage: source.def.damage,
    target,
    source,
    alive: true,
  };
}
