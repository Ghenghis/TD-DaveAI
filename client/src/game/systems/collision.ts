import type { Bullet } from '../entities/Bullet.js';

const HIT_RADIUS = 12;

export function advanceBullets(bullets: Bullet[], dtSec: number): void {
  for (const b of bullets) {
    if (!b.alive) continue;
    if (!b.target.alive) {
      b.alive = false;
      continue;
    }
    const dx = b.target.x - b.x,
      dy = b.target.y - b.y;
    const d = Math.hypot(dx, dy);
    if (d <= HIT_RADIUS) {
      const mult =
        b.target.def.armor && b.source.def.armorPenalty != null ? b.source.def.armorPenalty : 1;
      b.target.hp -= b.damage * mult;
      if (b.target.hp <= 0) b.target.alive = false;
      b.alive = false;
      continue;
    }
    const step = b.speed * dtSec;
    b.x += (dx / d) * step;
    b.y += (dy / d) * step;
  }
}
