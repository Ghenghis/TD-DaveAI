import { describe, it, expect } from 'vitest';
import { Economy } from '../src/game/systems/economy.js';

describe('Economy', () => {
  it('starts with given gold', () => {
    const e = new Economy(100);
    expect(e.gold).toBe(100);
  });

  it('rewards bounty on kill', () => {
    const e = new Economy(0);
    e.reward(15);
    expect(e.gold).toBe(15);
  });

  it('canAfford / spend work together', () => {
    const e = new Economy(50);
    expect(e.canAfford(50)).toBe(true);
    expect(e.canAfford(51)).toBe(false);
    e.spend(50);
    expect(e.gold).toBe(0);
  });

  it('spend throws if insufficient gold', () => {
    const e = new Economy(10);
    expect(() => e.spend(20)).toThrow();
  });
});
