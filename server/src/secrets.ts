import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Secrets {
  deepseekKey: string;
  minimaxKey: string;
}

/**
 * Sort .env files for deterministic first-match-wins order:
 *   .env  <  .env2  <  .env.*  <  everything else (alphabetical within each bucket)
 */
function sortEnvFiles(files: string[]): string[] {
  const rank = (f: string): number => {
    if (f === '.env') return 0;
    if (/^\.env\d+$/.test(f)) return 1; // .env2, .env3, …
    if (f.startsWith('.env.')) return 2;
    return 3;
  };
  return [...files].sort((a, b) => {
    const d = rank(a) - rank(b);
    return d !== 0 ? d : a.localeCompare(b);
  });
}

/** Parse a single dotenv-format file into a key→value map. Values are never logged. */
function parseDotenv(filepath: string): Map<string, string> {
  const map = new Map<string, string>();
  let raw: string;
  try {
    raw = readFileSync(filepath, 'utf8');
  } catch {
    // Unreadable file — skip silently; missing-key error is raised by the caller.
    return map;
  }
  for (const rawLine of raw.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let value = line.slice(eqIdx + 1).trim();
    // Strip surrounding single or double quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && !map.has(key)) {
      map.set(key, value);
    }
  }
  return map;
}

export function loadSecrets(dir: string = process.env.SECRETS_DIR ?? 'G:\\private'): Secrets {
  // Gather files matching *.env* (covers hidden files like .env, .env2, .hermes.env, etc.)
  let allFiles: string[];
  try {
    allFiles = readdirSync(dir);
  } catch {
    throw new Error(`secrets dir not found or not readable: ${dir}`);
  }

  // Match files whose names contain "env" — catches .env, .env2, .env.deploy, .hermes.env
  const envFiles = sortEnvFiles(allFiles.filter((f) => /env/i.test(f)));

  // Collect keys with first-match-wins (sortEnvFiles already determined priority)
  const merged = new Map<string, string>();
  for (const file of envFiles) {
    const entries = parseDotenv(join(dir, file));
    for (const [k, v] of entries) {
      if (!merged.has(k)) {
        merged.set(k, v);
      }
    }
  }

  // Also support legacy standalone .key files as fallback
  const fallbackDeepseek = tryReadKeyFile(dir, 'deepseek.key');
  const fallbackMinimax = tryReadKeyFile(dir, 'minimax.key');
  if (fallbackDeepseek && !merged.has('DEEPSEEK_API_KEY')) {
    merged.set('DEEPSEEK_API_KEY', fallbackDeepseek);
  }
  if (fallbackMinimax && !merged.has('MINIMAX_API_KEY')) {
    merged.set('MINIMAX_API_KEY', fallbackMinimax);
  }

  const missing: string[] = [];
  if (!merged.has('DEEPSEEK_API_KEY')) missing.push('DEEPSEEK_API_KEY');
  if (!merged.has('MINIMAX_API_KEY')) missing.push('MINIMAX_API_KEY');

  if (missing.length > 0) {
    const scanned = envFiles.length > 0 ? envFiles.join(', ') : '(none)';
    throw new Error(
      `secrets not found: ${missing.join(', ')} — scanned files: ${scanned} in ${dir}`,
    );
  }

  return {
    // Non-null assertion safe: we checked `missing` above.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    deepseekKey: merged.get('DEEPSEEK_API_KEY')!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    minimaxKey: merged.get('MINIMAX_API_KEY')!,
  };
}

function tryReadKeyFile(dir: string, file: string): string | null {
  try {
    const raw = readFileSync(join(dir, file), 'utf8').trim();
    return raw || null;
  } catch {
    return null;
  }
}
