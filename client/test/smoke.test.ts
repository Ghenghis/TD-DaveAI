import { describe, it, expect } from 'vitest';
import { GAME_WIDTH, GAME_HEIGHT } from '../src/main.js';

describe('client smoke', () => {
  it('exports game dimensions', () => {
    expect(GAME_WIDTH).toBe(1280);
    expect(GAME_HEIGHT).toBe(768);
  });
});
