import { describe, it, expect } from 'vitest';
import { Lives } from '../src/game/systems/lives.js';

describe('Lives', () => {
  it('decrements on leak', () => {
    const l = new Lives(20);
    l.onLeaked();
    expect(l.remaining).toBe(19);
  });

  it('gameOver when remaining reaches 0', () => {
    const l = new Lives(2);
    expect(l.gameOver()).toBe(false);
    l.onLeaked();
    l.onLeaked();
    expect(l.gameOver()).toBe(true);
  });

  it('does not go below 0', () => {
    const l = new Lives(1);
    l.onLeaked();
    l.onLeaked();
    expect(l.remaining).toBe(0);
  });
});
