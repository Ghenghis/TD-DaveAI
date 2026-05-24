import type { Tower } from '../entities/Tower.js';
import { createBullet, type Bullet } from '../entities/Bullet.js';

export function fireTowers(towers: Tower[], dtMs: number): Bullet[] {
  const bullets: Bullet[] = [];
  for (const t of towers) {
    if (t.cooldownMs > 0) {
      t.cooldownMs = Math.max(0, t.cooldownMs - dtMs);
      continue;
    }
    if (!t.target || !t.target.alive) continue;
    if (t.def.fireRateMs <= 0) continue;
    bullets.push(createBullet(t, t.target));
    t.cooldownMs = t.def.fireRateMs;
  }
  return bullets;
}
