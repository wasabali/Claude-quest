# Cloud Quest

A browser-based GameBoy Color-style RPG where you play as a junior cloud engineer ascending to Principal Engineer.

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
