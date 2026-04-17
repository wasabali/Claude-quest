# CLAUDE.md

This file provides guidance to Claude Code when working on Cloud Quest.

## Project Overview

**Cloud Quest** is a browser-based RPG built with Phaser 3. You play as a junior cloud engineer progressing to Principal Engineer by solving incidents, battling other engineers, and learning real cloud CLI commands. Funny, educational, satirical. Zero backend — fully stateless, runs in any browser.

See `docs/sessions/2026-04-15-game-design.md` for the full design record and all decisions made.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| **Phaser 3** | Game engine (HTML5 Canvas/WebGL) |
| **Vite** | Dev server + bundler (with path aliases — see `vite.config.js`) |
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
├── index.html                  # Game shell (Press Start 2P font, PokeRogue attribution)
├── package.json                # vite + phaser
├── vite.config.js              # Path aliases, dev server headers, build config
├── staticwebapp.config.json    # COOP/COEP headers for Azure Static Web Apps
├── src/
│   ├── main.js                 # Phaser config + scene registry — nothing else
│   ├── config.js               # Constants: resolution, palette, tile size, XP table
│   ├── overrides.js            # Dev-only test overrides (shame, location, SLA, deck)
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
│   │   ├── encounters.js       # Pool-based encounter tables per region (common/rare/cursed)
│   │   └── story.js            # Act definitions, flags, dialog trees
│   │
│   ├── engine/                 # Pure logic — no Phaser, fully unit-testable
│   │   ├── BattleEngine.js     # Turn resolution, phase queue, win condition, event log
│   │   ├── SkillEngine.js      # Skill effects, domain matchups, solution quality, XP
│   │   ├── StatusEngine.js     # Status effect application + decay per turn
│   │   └── EncounterEngine.js  # Encounter probability + pool selection per region
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
        └── bgm-loop-points.json  # Loop start/end times per track (seconds)
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

### Path Aliases

Import from these aliases — never use deep relative paths (`../../engine/...`).

```js
import { BattleEngine }  from '#engine/BattleEngine.js'
import { getById }       from '#data/skills.js'
import { GameState }     from '#state/GameState.js'
import { DialogBox }     from '#ui/DialogBox.js'
import { seededRandom }  from '#utils/random.js'
```

Aliases are defined in `vite.config.js` and map to `src/{name}/`.

### Phase-Based Turn System

Battle turns are not one monolithic function. Each discrete step is a **phase** — a function that returns a `BattleEvent[]` and optionally enqueues the next phase. `BattleEngine` owns a phase queue and iterates it.

```js
// Phases in a single player turn (order matters):
// 1. StatusTickPhase   — tick/expire active status effects
// 2. SkillPhase        — resolve the selected skill, calculate damage
// 3. SlaTickPhase      — decrement SLA timer, fire breach event if 0
// 4. EnemyPhase        — resolve enemy move (Engineer mode only)
// 5. TurnEndPhase      — check win/lose conditions, award XP

// Each phase returns BattleEvent[] — BattleScene renders them in order.
// Never resolve two phases in one step. Never skip phases.
```

This makes turn logic testable in isolation: test `SlaTickPhase` without running `SkillPhase`.

### Pool-Based Encounter Tables

`encounters.js` organises enemies by rarity pool per region — not a flat list.

```js
localhost_town: {
  common: ['503_error', 'npm_install_hang'],
  rare:   ['infinite_loop', 'port_conflict'],
  cursed: [],   // no cursed encounters in starting town
},
three_am_tavern: {
  common: ['merge_conflict', 'missing_semicolon'],
  rare:   ['prod_incident', 'runaway_process'],
  cursed: ['sev1_at_3am'],
},
```

`EncounterEngine` rolls against pool weights: common = 70%, rare = 25%, cursed = 5% (when available). The seeded RNG in `random.js` makes rolls reproducible from a given seed.

### Audio — BGM Loop Points

`assets/audio/bgm-loop-points.json` maps each track ID to `{ start, end }` in seconds. `BaseScene.playBgm(trackId)` reads this file to loop tracks seamlessly (avoiding the silent gap at the end of a file).

```js
// In BaseScene.js
playBgm(trackId) {
  const loop = BGM_LOOP_POINTS[trackId] ?? { start: 0, end: 0 }
  // configure Phaser audio source with loop markers
}
```

Fill in `start`/`end` values once tracks are finalized.

### Dev Overrides

`src/overrides.js` lets you bypass grinding during development. Values are null by default (no effect). Uncomment what you need; never commit uncommented overrides.

```js
// Test the evil path without accumulating 7 shame manually:
SHAME_OVERRIDE: 7,

// Test cursed area without navigating there:
LOCATION_OVERRIDE: 'three_am_tavern',
```

`GameState.js` reads `Overrides` at startup in dev mode (`import.meta.env.DEV`).

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

## Visual Style

- **Resolution**: 1920×1080 canvas, `Phaser.Scale.FIT` — fills browser, preserves ratio
- **Renderer**: WebGL (Phaser AUTO)
- **Tile size**: 48×48px — viewport shows 40 tiles wide × ~22 tiles tall
- **Font**: Press Start 2P (Google Fonts, free)
- **No smooth tweening** — all animations are 2–4 frame sprite flips
- **UI windows**: 9-slice panels following PokeRogue's `ui-theme.ts` pattern
- **Visual foundation**: PokeRogue assets (CC-BY-NC-SA-4.0) for battle backgrounds, UI chrome, HUD elements

No `pixelArt: true`, no `antialias: false` — rendering at full resolution, not upscaling pixel art.

```js
// src/config.js
export const CONFIG = {
  WIDTH: 1920,
  HEIGHT: 1080,
  TILE_SIZE: 48,
  FONT: '"Press Start 2P"',
}

// src/main.js — Phaser game config
new Phaser.Game({
  type: Phaser.AUTO,
  width: CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ BootScene, TitleScene, WorldScene, BattleScene, /* ... */ ],
})
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

## Available Skills

Skills are invoked in Claude Code with `/skill-name`. They load specialised context or scaffold content into the codebase.

| Skill | When to use |
|---|---|
| `/spec-issue "<feature idea>"` | Draft a well-specced development issue from a feature idea — acceptance criteria, affected layers, data shapes. Creates issues that `/implement-issue` can pick up. |
| `/implement-issue <number>` | Implement a GitHub issue following Cloud Quest's architecture and conventions. |
| `/add-skill "<cli command>"` | Scaffold a new skill definition in `src/data/skills.js` from a real CLI command. |
| `/add-trainer "<concept>"` | Scaffold a new trainer definition in `src/data/trainers.js`. |
| `/add-incident "<description>"` | Turn a real work problem into a Cloud Quest battle incident in `src/data/`. |
| `/add-yourself "<bio>"` | Add yourself to the game as a trainer NPC with your real CLI commands as skills. |
| `/cloud-quest-battle` | Load the complete battle system reference — use before touching `BattleEngine`, `SkillEngine`, `StatusEngine`, `BattleScene`, or any battle logic. |
| `/game-data-registry` | Load the data layer reference — use before adding skills, items, trainers, or emblems to `src/data/`. |
| `/phaser-scene-patterns` | Load Phaser 3 scene patterns — use before implementing or modifying any scene or UI component. |
| `/triage-issues "<area>"` | Scan codebase and docs for contradictions, errors, and open questions, then file GitHub issues. |
| `/resolve-question <number>` | Iterate design ideas for a `[Design Question]` issue and find the best fit. |
| `/update-wiki` | Regenerate `docs/wiki/` pages from current data files and design docs. |

---

## Available Sub-Agents

Sub-agents are specialised Claude instances invoked via the `task` tool. Use them instead of doing the work yourself when the task falls in their area.

| Agent | When to use |
|---|---|
| **`battle-engine-tdd`** | Implementing or modifying any file in `src/engine/`. Writes tests first, then minimal implementation. Enforces zero Phaser dependency. |
| **`game-data-author`** | Adding or editing content in `src/data/` — skills, items, trainers, emblems. Validates domains, tiers, registry pattern, and cursed technique structure. |
| **`content-contributor`** | Adding real developers as trainers, turning CLI commands into skills, or converting work incidents into game encounters. Knows the full game world and writes in-character dialog. |
| **`phaser-reviewer`** | Reviewing scenes, UI components, or `src/main.js`. Checks engine/scene separation, GameState usage, pixel art compliance, and Phaser 3 best practices. Does **not** review engine scripts. |
| **`issue-triager`** | Autonomously scanning the codebase and docs for contradictions, errors, and gaps, then filing well-labelled GitHub issues. |
| **`stress-test`** | Running the Monte Carlo balance simulation suite in `tests/stress/` to find overpowered skills, broken progression, exploit paths, or empty encounter pools. |

---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
