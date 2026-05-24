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
      const cur = path[e.pathIndex];
      const nxt = path[e.pathIndex + 1];
      if (cur && nxt) {
        e.x = cur[0] + (nxt[0] - cur[0]) * e.pathT;
        e.y = cur[1] + (nxt[1] - cur[1]) * e.pathT;
      } else if (cur) {
        e.x = cur[0];
        e.y = cur[1];
      }
    }
  }
}

function dist(a: readonly [number, number], b: readonly [number, number]): number {
  const dx = b[0] - a[0],
    dy = b[1] - a[1];
  return Math.hypot(dx, dy);
}

function isSlowed(e: Enemy, nowMs: number): boolean {
  return e.slowExpiresAtMs !== undefined && e.slowExpiresAtMs > nowMs;
}
