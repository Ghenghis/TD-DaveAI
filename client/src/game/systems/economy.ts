export class Economy {
  constructor(public gold: number) {}

  reward(amount: number): void {
    this.gold += amount;
  }

  canAfford(amount: number): boolean {
    return this.gold >= amount;
  }

  spend(amount: number): void {
    if (!this.canAfford(amount)) {
      throw new Error(`insufficient gold: need ${amount}, have ${this.gold}`);
    }
    this.gold -= amount;
  }
}
