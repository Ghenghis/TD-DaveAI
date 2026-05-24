import type { WaveSpawn } from '@td/shared';

export class SpawnQueue {
  private next = 0;
  constructor(private readonly schedule: readonly WaveSpawn[]) {}

  tick(elapsedMs: number): WaveSpawn[] {
    const out: WaveSpawn[] = [];
    while (this.next < this.schedule.length && this.schedule[this.next]!.atMs <= elapsedMs) {
      out.push(this.schedule[this.next]!);
      this.next += 1;
    }
    return out;
  }

  done(): boolean {
    return this.next >= this.schedule.length;
  }
}
