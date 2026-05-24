import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      // Swap Phaser for a lightweight stub when running under jsdom
      phaser: resolve(__dirname, 'test/__mocks__/phaser.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
  },
});
