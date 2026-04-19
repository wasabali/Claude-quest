# Cloud Quest

A browser-based RPG where you play as a junior cloud engineer ascending to Principal Engineer.

Solve incidents with real cloud CLI commands, battle other engineers, earn certification emblems, and try not to `rm -rf /` anything important.

---

## Tech Stack

- **Phaser 3** — game engine
- **Vite** — dev server + bundler
- **Azure Static Web Apps** — hosting
- **Tiled** — map editor

## Development

```bash
npm install
npm run dev      # localhost:5173
npm run build    # production build
npm test         # unit tests
```

## Design

All game design decisions are documented in `docs/sessions/` and tracked as GitHub issues.

- Domain matchup system — #41
- Solution quality tiers — #42
- Incident battles — #43
- Engineer battles — #44
- NPC command gating — #45
- Reputation & Shame system — #46
- Evil engineer path — #47
- Outcast network & hidden areas — #48

## 🏥 Game Health

Game health checks (stress tests, wiki updates, balance triage) run automatically as part of every AI-assisted issue implementation via the `post-implementation` skill — not as separate CI pipelines. See `.github/skills/post-implementation.md` for details.

---

## Attribution

> Battle backgrounds, UI windows, and HUD assets adapted from [PokeRogue](https://github.com/pagefaultgames/pokerogue) by pagefaultgames, used under CC-BY-NC-SA-4.0.
