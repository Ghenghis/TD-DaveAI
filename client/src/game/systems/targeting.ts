import type { Tower } from '../entities/Tower.js';
import type { Enemy } from '../entities/Enemy.js';

export function acquireTargets(towers: Tower[], enemies: Enemy[]): void {
  for (const t of towers) {
    if (t.def.range <= 0) {
      t.target = null;
      continue;
    }
    if (t.target && (!t.target.alive || distSq(t, t.target) > t.def.range * t.def.range)) {
      t.target = null;
    }
    if (t.target) continue;
    let best: Enemy | null = null;
    let bestKey = -Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      if (distSq(t, e) > t.def.range * t.def.range) continue;
      const key = e.pathIndex + e.pathT;
      if (key > bestKey) {
        bestKey = key;
        best = e;
      }
    }
    t.target = best;
  }
}

function distSq(t: Tower, e: Enemy): number {
  const dx = t.x - e.x,
    dy = t.y - e.y;
  return dx * dx + dy * dy;
}
