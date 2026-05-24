import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { loadSecrets, type Secrets } from '../src/secrets.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'td-secrets-'));
});

describe('loadSecrets', () => {
  it('reads deepseek and minimax keys from files', () => {
    writeFileSync(join(dir, 'deepseek.key'), 'sk-deepseek-ABC\n');
    writeFileSync(join(dir, 'minimax.key'), 'mm-XYZ\n');
    const s = loadSecrets(dir);
    expect(s.deepseekKey).toBe('sk-deepseek-ABC');
    expect(s.minimaxKey).toBe('mm-XYZ');
    rmSync(dir, { recursive: true });
  });

  it('throws if deepseek key file missing — names the file, NOT the value', () => {
    expect(() => loadSecrets(dir)).toThrow(/deepseek\.key/);
    rmSync(dir, { recursive: true });
  });

  it('throws if deepseek key is empty', () => {
    writeFileSync(join(dir, 'deepseek.key'), '   \n');
    writeFileSync(join(dir, 'minimax.key'), 'mm-XYZ');
    expect(() => loadSecrets(dir)).toThrow(/deepseek\.key/);
    rmSync(dir, { recursive: true });
  });

  it('does not echo key values in thrown error messages', () => {
    writeFileSync(join(dir, 'deepseek.key'), 'sk-deepseek-SENSITIVE-12345');
    // omit minimax to trigger error
    try {
      loadSecrets(dir);
    } catch (e) {
      const msg = String(e instanceof Error ? e.message : e);
      expect(msg).not.toContain('SENSITIVE-12345');
    }
    rmSync(dir, { recursive: true });
  });
});
