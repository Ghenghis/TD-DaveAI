import { describe, it, expect } from 'vitest';
import { SERVER_NAME } from '../src/index.js';

describe('server smoke', () => {
  it('exports SERVER_NAME', () => {
    expect(SERVER_NAME).toBe('td-server');
  });
});
