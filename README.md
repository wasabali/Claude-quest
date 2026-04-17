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

<!-- GAME-HEALTH-START -->

## 🏥 Game Health Dashboard

_Automated balance & integrity checks run on every push to `main`._

| Metric | Status | Details |
|---|---|---|
| 🗄️ Data Integrity | ✅ | 19/19 tests passing |
| ⚔️ Skill Balance | ✅ | 13/13 tests passing |
| 🎮 Battle Simulations | ✅ | 6/6 tests passing |
| 📈 Progression & Economy | ✅ | 11/11 tests passing |
| 🎲 Encounter Distribution | ✅ | 10/10 tests passing |
| 🛡️ Exploit Detection | ✅ | 11/11 tests passing |
| 🚪 Gate & Quest Integrity | ✅ | 9/9 tests passing |
| 💬 Story & NPC Consistency | ✅ | 4/4 tests passing |
| 🏅 Emblem Balance | ✅ | 4/4 tests passing |
| 🏁 Full Playthrough Sim | ✅ | 3/3 tests passing |
| **Overall** | ✅ | **90/90** tests passing |

_Last updated: 2026-04-17T19:06:47.360Z_

<!-- GAME-HEALTH-END -->

---

## Attribution

> Battle backgrounds, UI windows, and HUD assets adapted from [PokeRogue](https://github.com/pagefaultgames/pokerogue) by pagefaultgames, used under CC-BY-NC-SA-4.0.
