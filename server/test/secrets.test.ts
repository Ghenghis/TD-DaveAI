import { describe, it, expect, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadSecrets } from '../src/secrets.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'td-secrets-'));
});

function cleanup() {
  rmSync(dir, { recursive: true });
}

describe('loadSecrets — .env file scanning', () => {
  it('reads both keys from a single .env file', () => {
    writeFileSync(
      join(dir, '.env'),
      'DEEPSEEK_API_KEY=sk-deepseek-FAKE-abc\nMINIMAX_API_KEY=mm-FAKE-xyz\n',
    );
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-abc');
    expect(s.minimaxKey).toBe('mm-FAKE-xyz');
    cleanup();
  });

  it('reads keys from two different files (.env + .env2)', () => {
    writeFileSync(join(dir, '.env'), 'DEEPSEEK_API_KEY=sk-deepseek-FAKE-111\n');
    writeFileSync(join(dir, '.env2'), 'MINIMAX_API_KEY=mm-FAKE-222\n');
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-111');
    expect(s.minimaxKey).toBe('mm-FAKE-222');
    cleanup();
  });

  it('first-match wins: .env beats .env2 for same key', () => {
    writeFileSync(
      join(dir, '.env'),
      'DEEPSEEK_API_KEY=FAKE-from-env\nMINIMAX_API_KEY=mm-FAKE-xyz\n',
    );
    writeFileSync(join(dir, '.env2'), 'DEEPSEEK_API_KEY=FAKE-from-env2\n');
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('FAKE-from-env');
    cleanup();
  });

  it('strips surrounding double quotes from values', () => {
    writeFileSync(
      join(dir, '.env'),
      'DEEPSEEK_API_KEY="sk-deepseek-FAKE-quoted"\nMINIMAX_API_KEY="mm-FAKE-dquote"\n',
    );
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-quoted');
    expect(s.minimaxKey).toBe('mm-FAKE-dquote');
    cleanup();
  });

  it('strips surrounding single quotes from values', () => {
    writeFileSync(
      join(dir, '.env'),
      "DEEPSEEK_API_KEY='sk-deepseek-FAKE-squoted'\nMINIMAX_API_KEY='mm-FAKE-squote'\n",
    );
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-squoted');
    expect(s.minimaxKey).toBe('mm-FAKE-squote');
    cleanup();
  });

  it('ignores blank lines and comment lines', () => {
    writeFileSync(
      join(dir, '.env'),
      [
        '# This is a comment',
        '',
        '  ',
        'DEEPSEEK_API_KEY=sk-deepseek-FAKE-cmt',
        '# another comment',
        'MINIMAX_API_KEY=mm-FAKE-cmt',
        '',
      ].join('\n'),
    );
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-cmt');
    expect(s.minimaxKey).toBe('mm-FAKE-cmt');
    cleanup();
  });

  it('throws listing missing variable names when both keys absent', () => {
    // No .env files at all — empty temp dir
    expect(() => loadSecrets(dir)).toThrow(/DEEPSEEK_API_KEY/);
    expect(() => loadSecrets(dir)).toThrow(/MINIMAX_API_KEY/);
    cleanup();
  });

  it('no-leak guarantee: thrown error must NOT contain the fake secret value', () => {
    expect.assertions(2);
    writeFileSync(
      join(dir, '.env'),
      'DEEPSEEK_API_KEY=sk-FAKE-SECRET-99\n',
      // MINIMAX_API_KEY intentionally omitted to trigger error
    );
    try {
      loadSecrets(dir);
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      expect(msg).not.toContain('SECRET-99');
      expect(msg).toMatch(/MINIMAX_API_KEY/);
    }
    cleanup();
  });

  it('reads from .env.deploy style file when that is the only env file', () => {
    writeFileSync(
      join(dir, '.env.deploy'),
      'DEEPSEEK_API_KEY=sk-deepseek-FAKE-deploy\nMINIMAX_API_KEY=mm-FAKE-deploy\n',
    );
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-deploy');
    expect(s.minimaxKey).toBe('mm-FAKE-deploy');
    cleanup();
  });

  it('falls back to legacy .key files if no .env files present', () => {
    writeFileSync(join(dir, 'deepseek.key'), 'sk-deepseek-FAKE-legacy\n');
    writeFileSync(join(dir, 'minimax.key'), 'mm-FAKE-legacy\n');
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-FAKE-legacy');
    expect(s.minimaxKey).toBe('mm-FAKE-legacy');
    cleanup();
  });
});
