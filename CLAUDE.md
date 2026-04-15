# CLAUDE.md

This file provides guidance to Claude Code when working on Cloud Quest.

## Project Overview

**Cloud Quest** is a browser-based GameBoy Color-style RPG built with Phaser 3. You play as a junior cloud engineer progressing to Principal Engineer by solving incidents, battling other engineers, and learning real cloud CLI commands. Funny, educational, satirical. Zero backend — fully stateless, runs in any browser.

See `docs/sessions/2026-04-15-game-design.md` for the full design record and all decisions made.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Phaser 3** | Game engine (HTML5 Canvas/WebGL) |
| **Vite** | Dev server + bundler |
| **Vanilla JavaScript (ES modules)** | No framework |
| **Azure Static Web Apps** | Hosting — free tier, custom headers |
| **GitHub Actions** | CI/CD — build and deploy to Azure |
| **Tiled Map Editor** | Tile map authoring — exports `.tmj` |

---

## Running the Game

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

---

## Folder Structure

```
cloud-quest/
├── index.html                  # GameBoy Color shell (CSS border, buttons)
├── package.json                # vite + phaser
├── staticwebapp.config.json    # COOP/COEP headers for Azure Static Web Apps
├── src/
│   ├── main.js                 # Phaser config + scene registry — nothing else
│   ├── config.js               # Constants: resolution, palette, tile size, XP table
│   │
│   ├── state/
│   │   ├── GameState.js        # Single mutable object — the only mutable state
│   │   └── SaveManager.js      # .cloudquest export/import/checksum
│   │
│   ├── data/                   # Pure definitions — no logic, no imports from engine/scenes
│   │   ├── skills.js           # All skill definitions
│   │   ├── items.js            # All item definitions
│   │   ├── trainers.js         # Good trainers + cursed trainers
│   │   ├── quests.js           # Quest stages, rewards, flags
│   │   ├── emblems.js          # Emblem metadata
│   │   ├── encounters.js       # Encounter tables per region
│   │   └── story.js            # Act definitions, flags, dialog trees
│   │
│   ├── engine/                 # Pure logic — no Phaser, fully unit-testable
│   │   ├── BattleEngine.js     # Turn resolution, win condition, event log
│   │   ├── SkillEngine.js      # Skill effects, domain matchups, solution quality, XP
│   │   ├── StatusEngine.js     # Status effect application + decay per turn
│   │   └── EncounterEngine.js  # Encounter probability + selection per region
│   │
│   ├── scenes/                 # Phaser scenes — rendering only, delegate logic to engines
│   │   ├── BaseScene.js        # Abstract base: showDialog(), fadeIn/Out(), playSound()
│   │   ├── BootScene.js        # Preload all assets
│   │   ├── TitleScene.js       # Main menu: New Game / Load Save
│   │   ├── WorldScene.js       # Overworld: Tiled map, player movement, NPC interaction
│   │   ├── BattleScene.js      # Battle rendering: HUD, skill menu, animations
│   │   ├── InventoryScene.js   # Bag UI: tabbed navigation, item use
│   │   ├── EmblemScene.js      # Emblem case + mouse-drag polish minigame
│   │   └── SaveScene.js        # Commit/checkout UI styled as git terminal
│   │
│   ├── ui/                     # Reusable Phaser UI components
│   │   ├── HUD.js              # HP bar, budget meter, 💾 unsaved indicator
│   │   ├── DialogBox.js        # Typewriter text box
│   │   ├── Menu.js             # D-pad navigable list menu
│   │   └── ShineEffect.js      # Sparkle/glow for polished emblems
│   │
│   └── utils/
│       ├── crypto.js           # SHA-256 via Web Crypto API
│       ├── fileIO.js           # download() and openFilePicker() helpers
│       └── random.js           # Seeded RNG for reproducible encounter rolls
│
└── assets/
    ├── sprites/
    ├── maps/                   # Tiled .tmj exports
    └── audio/
```

---

## Architecture — Key Patterns

### GameState — Single Source of Truth

All mutable game data lives in `GameState.js`. Engines and scenes read/write only this. Nothing else is mutable.

```js
// src/state/GameState.js
export const GameState = {
  player: {
    name, level, xp, hp, maxHp, budget,
    reputation,    // 0–100, rebuildable
    shamePoints,   // 0+, permanent, never decremented
    technicalDebt, // 0–10, cleared by cleanup quests
    location, playtime
  },
  skills:    { active: [], learned: [], cursed: [] },
  inventory: { tools: [], keyItems: [], credentials: [], docs: [], junk: [] },
  emblems:   { tux: { earned, shine }, ... },
  story:     { act, completedQuests: [], flags: {} },
  stats:     { battlesWon, battlesLost, cursedTechniquesUsed, ... },
  _session:  { isDirty: false, lastSavedAt: null }  // not persisted
}
```

### Data Modules — Registry Pattern

Every data module exports `getById()` for O(1) lookup. Never iterate arrays in game logic.

```js
// src/data/skills.js
const SKILLS = {
  az_webapp_deploy: { id: 'az_webapp_deploy', domain: 'cloud', tier: 'optimal', ... },
}
export const getById  = (id) => SKILLS[id]
export const getAll   = () => Object.values(SKILLS)
export const getBy    = (field, value) => getAll().filter(x => x[field] === value)
```

### Engine Scripts — No Phaser

`engine/` files contain pure logic. No Phaser imports. No scene references. This makes them unit-testable with plain Node.js.

```js
// Good — pure function
export function calculateDamage(skillDomain, enemyDomain, basePower) { ... }

// Bad — Phaser dependency in engine
import Phaser from 'phaser'
```

### Scenes — Rendering Only

Scenes delegate all logic to engines. They receive events from engines and render them.

---

## Key Design Decisions

- **Commands as skills** — player uses real cloud CLI commands in battle
- **Domain matchups** — 7 domains in a cycle: `Linux → Security → Serverless → Cloud → IaC → Containers → Kubernetes → Linux`. Observability is a special support domain (reveals, no damage).
- **Solution quality tiers** — Optimal (×2 XP) / Standard (×1) / Shortcut (×0.5) / Cursed (×0.25, +1 Shame) / Nuclear (×0, +2 Shame)
- **Two encounter types** — Incidents (technical problems, symptom-first, SLA timer) and Engineer battles (domain counter strategy, move telegraphing)
- **NPC command gating** — specific commands required to pass NPCs and progress; multiple solutions with different downstream consequences
- **Reputation & Shame** — two independent stats. Reputation is rebuildable (0–100). Shame is permanent (never decremented).
- **Evil path** — cursed techniques bypass domain matchups, accumulate Shame and Technical Debt, open alternate content and a different ending
- **Outcast network** — 6 hidden areas found by doing things NPCs say not to do; teach the most powerful cursed techniques
- **Save format** — `.cloudquest` (base64-encoded JSON + SHA-256 checksum), no backend

Design issues: #41 (domain matchups) · #42 (solution tiers) · #43 (incidents) · #44 (engineer battles) · #45 (NPC gating) · #46 (reputation/shame) · #47 (evil path) · #48 (outcast network) · #50 (Easter egg)

---

## Visual Style — Non-Negotiable

- **Resolution**: 160×144px native, scaled 4× to 640×576px display
- **Pixel scaling**: CSS `image-rendering: pixelated` on the canvas; no browser smoothing
- **Palette**: Max 56 colors total on screen; max 4 colors per sprite
- **Font**: Press Start 2P (Google Fonts, free)
- **No smooth tweening** — all animations are 2–4 frame sprite flips

```js
// src/config.js
export const CONFIG = {
  WIDTH: 160,
  HEIGHT: 144,
  SCALE: 4,
  TILE_SIZE: 16,
  FONT: '"Press Start 2P"',
}
```

---

## Skill Data Shape

```js
// src/data/skills.js
{
  id: 'az_webapp_deploy',
  displayName: 'az webapp deploy',
  domain: 'cloud',           // linux|containers|kubernetes|cloud|security|iac|serverless|observability
  tier: 'optimal',           // optimal|standard|shortcut|cursed|nuclear
  isCursed: false,
  budgetCost: 0,
  description: 'Deploy to Azure App Service.',
  effect: { type: 'damage', value: 30 },
  sideEffect: null,          // cursed techniques only
  warningText: null,         // shown before cursed technique use
}
```

## Domain Matchup Table

```js
// src/config.js
export const DOMAIN_MATCHUPS = {
  linux:       { strong: 'security',   weak: 'kubernetes'  },
  security:    { strong: 'serverless', weak: 'linux'       },
  serverless:  { strong: 'cloud',      weak: 'security'    },
  cloud:       { strong: 'iac',        weak: 'serverless'  },
  iac:         { strong: 'containers', weak: 'cloud'       },
  containers:  { strong: 'kubernetes', weak: 'iac'         },
  kubernetes:  { strong: 'linux',      weak: 'containers'  },
  observability: { strong: null, weak: null }  // special — no damage cycle
}
export const STRONG_MULTIPLIER = 2.0
export const WEAK_MULTIPLIER   = 0.5
```

---

## Testing

```bash
npm test          # Run all unit tests
npm run test:watch
```

Engine scripts in `src/engine/` must have unit tests. Scenes do not require unit tests.

---

## Useful References

- [Phaser 3 docs](https://newdocs.phaser.io/)
- [Tiled map editor](https://www.mapeditor.org/)
- [Azure Static Web Apps docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
