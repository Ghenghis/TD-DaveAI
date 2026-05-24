export class Lives {
  constructor(public remaining: number) {}
  onLeaked(): void {
    this.remaining = Math.max(0, this.remaining - 1);
  }
  gameOver(): boolean {
    return this.remaining <= 0;
  }
}
