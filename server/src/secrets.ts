import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Secrets {
  deepseekKey: string;
  minimaxKey: string;
}

const REQUIRED_FILES = ['deepseek.key', 'minimax.key'] as const;

function readKey(dir: string, file: string): string {
  let raw: string;
  try {
    raw = readFileSync(join(dir, file), 'utf8');
  } catch {
    throw new Error(`missing secret file: ${file} in ${dir}`);
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`empty secret file: ${file}`);
  }
  return trimmed;
}

export function loadSecrets(dir: string = process.env.SECRETS_DIR ?? 'G:\\private'): Secrets {
  // Read in fixed order so error messages are deterministic.
  const [deepseekKey, minimaxKey] = REQUIRED_FILES.map((f) => readKey(dir, f)) as [string, string];
  return { deepseekKey, minimaxKey };
}
