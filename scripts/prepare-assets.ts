import { cpSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const KENNEY_ROOT = process.env.KENNEY_ROOT ?? 'G:\\Kenney Game Assets All-in-1 3.5.0';
const DEST = join(process.cwd(), '..', 'client', 'public', 'assets');

interface CopySpec {
  from: string;
  to: string;
}

// What v1 actually needs. Keep this list small.
const COPIES: CopySpec[] = [
  { from: '2D assets/Tower Defense/PNG', to: 'td-pack/PNG' },
  { from: '2D assets/Tower Defense/Tilesheet', to: 'td-pack/Tilesheet' },
  { from: 'Audio/UI Audio', to: 'audio/ui' },
  { from: 'Audio/Impact Sounds', to: 'audio/impact' },
  { from: 'Audio/Music Loops', to: 'audio/music' },
];

for (const c of COPIES) {
  const src = join(KENNEY_ROOT, c.from);
  const dst = join(DEST, c.to);
  if (!existsSync(src)) {
    // eslint-disable-next-line no-console
    console.error(`MISSING SOURCE: ${src}`);
    process.exit(1);
  }
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst, { recursive: true });
  // eslint-disable-next-line no-console
  console.log(`copied ${c.from} -> ${c.to}`);
}
console.log('done');
