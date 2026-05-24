# TD-DaveAI

A 2D tower defense game with AI-generated waves (DeepSeek v4 via Node proxy).

## Quick start

1. Place API keys in `G:\private`:
   - `G:\private\deepseek.key` — your DeepSeek API key
   - `G:\private\minimax.key` — your Minimax API key (unused in v1)
2. Install: `npm install` (note: if your environment has `NODE_ENV=production` set, use `NODE_ENV=development npm install` to get devDependencies)
3. Prepare Kenney assets: `npm run assets`
   (assumes `G:\Kenney Game Assets All-in-1 3.5.0`; override with `KENNEY_ROOT=...`)
4. Run both server + client: `npm run dev`
5. Open `http://localhost:5173`

## Architecture

See [`docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md`](docs/superpowers/specs/2026-05-24-2d-tower-defense-design.md).

## Tests

`npm test` runs server + client suites.

## License

MIT (game code). Kenney assets are CC0 — see [`CREDITS.md`](CREDITS.md).
