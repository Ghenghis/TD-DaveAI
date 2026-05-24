# Manual QA Checklist

Run before each milestone merge.

## Setup

- [ ] `npm run dev` starts both server (`:8787`) and client (`:5173`).
- [ ] `curl http://localhost:8787/healthz` returns `{"ok":true}`.

## Menu

- [ ] Title and PLAY button render correctly.
- [ ] Clicking PLAY transitions to game.

## Gameplay

- [ ] First wave starts within 3s of entering PlayScene.
- [ ] HUD shows lives=20, gold=150, wave=1.
- [ ] Director status shows "AI" (or "FALLBACK" if your DeepSeek key is missing).
- [ ] Enemies spawn from left edge, follow the yellow path, reach the right edge.
- [ ] Selecting a tower button highlights it.
- [ ] Clicking a green tile places the selected tower; gold deducts.
- [ ] Clicking a non-buildable (path or occupied) tile does nothing.
- [ ] Arrow tower fires bullets at the nearest enemy in range.
- [ ] Killing an enemy increases gold by its bounty.
- [ ] Enemy reaching the goal decrements lives.
- [ ] Wave ends after all enemies spawned + cleared; next wave starts within ~3s.
- [ ] Wave banner flashes on each new wave.

## Tower variety

- [ ] Cannon tower fires slower but hits harder.
- [ ] Frost tower visibly slows enemies (compare to no-frost).
- [ ] Armored enemies take ~half damage from arrow towers, full from cannon.

## Game over

- [ ] When lives reach 0, GameOver scene appears with correct wave count.
- [ ] Retry restarts PlayScene with fresh state.
- [ ] Menu returns to MenuScene.

## Resilience

- [ ] Kill the server. Client continues to play using fallback waves. Director status reads "FALLBACK".
- [ ] Restart the server. Next wave resumes with "AI" status.

## Secrets

- [ ] Server logs do NOT contain any portion of real API keys.
- [ ] HTTP error responses do NOT contain key fragments.
