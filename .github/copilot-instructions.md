# Cloud Quest — Phaser 3 Browser RPG

A GameBoy Color-style RPG where the player is a cloud engineer using real CLI commands in turn-based battles. Phaser 3 + Vite, hosted on Azure Static Web Apps. No backend, no framework, fully stateless.

---

## Non-Negotiable Architecture Rules

- **Engine scripts** (`src/engine/`) must never import Phaser. Pure JS logic, unit-testable with Node.js only.
- **Scenes** (`src/scenes/`) delegate all logic to engines. They receive events and render them. No game logic in scenes.
- **All mutable state** lives in `GameState.js`. Never store persistent state in a scene, engine instance, or module-level variable.
- **Data modules** (`src/data/`) export pure object definitions only. No logic, no imports from engine or scenes.

## Folder Purpose

| Folder | Contains | Phaser allowed? |
|---|---|---|
| `src/state/` | GameState, SaveManager | No |
| `src/data/` | Skills, items, trainers, quests, encounters | No |
| `src/engine/` | BattleEngine, SkillEngine, StatusEngine, EncounterEngine | No |
| `src/scenes/` | Phaser scenes — rendering only | Yes |
| `src/ui/` | Reusable Phaser UI components (DialogBox, Menu, HUD) | Yes |
| `src/utils/` | crypto, fileIO, random | No |

## Data Registry Pattern

All data modules (`src/data/*.js`) must follow this exact pattern — no exceptions:

```js
const SKILLS = {
  az_webapp_deploy: { id: 'az_webapp_deploy', ...fields },
}
export const getById = (id) => SKILLS[id]
export const getAll  = () => Object.values(SKILLS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

Never iterate data arrays in game logic. Always use `getById()`.

## Skill Fields

Every entry in `src/data/skills.js`:

```js
{
  id: 'az_webapp_deploy',          // snake_case, matches the object key
  displayName: 'az webapp deploy', // the actual CLI command
  domain: 'cloud',                 // see Domain Values below
  tier: 'optimal',                 // see Tier Values below
  isCursed: false,
  budgetCost: 0,
  description: 'Deploy to Azure App Service.',
  effect: { type: 'damage', value: 30 },
  sideEffect: null,                // cursed techniques only
  warningText: null,               // shown before cursed technique use
}
```

**Domain values:** `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless` `observability`

**Tier values:** `optimal` `standard` `shortcut` `cursed` `nuclear`

## Domain Matchup Cycle

```
Linux → Security → Serverless → Cloud → IaC → Containers → Kubernetes → Linux
```

Each domain deals ×2 damage to the domain it beats, ×0.5 to the domain that beats it, ×1 neutral otherwise. Observability deals no damage — it reveals enemy type and status.

Defined in `src/config.js` as `DOMAIN_MATCHUPS`. Never hardcode multipliers inline.

## Solution Quality Tiers

| Tier | XP | Rep | Shame | When |
|---|---|---|---|---|
| optimal | ×2 | +++ | 0 | Correct domain, diagnosed first |
| standard | ×1 | + | 0 | Correct domain, no diagnosis |
| shortcut | ×0.5 | − | 0 | Wrong domain but worked |
| cursed | ×0.25 | −− | +1 | Cursed technique used |
| nuclear | ×0 | −−− | +2 | Nuclear technique used |

## GameState Shape

```js
// src/state/GameState.js
export const GameState = {
  player: { name, level, xp, hp, maxHp, budget, reputation, shamePoints, technicalDebt, location, playtime },
  skills: { active: [], learned: [], cursed: [] },
  inventory: { tools: [], keyItems: [], credentials: [], docs: [], junk: [] },
  emblems: {},
  story: { act, completedQuests: [], flags: {} },
  stats: { battlesWon, battlesLost, cursedTechniquesUsed, slaBreaches },
  _session: { isDirty: false, lastSavedAt: null }
}
```

`_session` is never written to the save file. Everything else is.

## Visual Style

- Canvas: 160×144px native, 640×576px display (4× integer scale, CSS `image-rendering: pixelated`)
- Font: Press Start 2P only. No other fonts.
- No smooth tweening. All animations are 2–4 frame sprite flips.
- Max 56 colours total on screen. Max 4 colours per sprite.
- Tile size: 16×16px. Player sprite: 16×24px.

## Naming Conventions

- Files exporting a class: `PascalCase.js` — scenes, engines, UI components, state managers (e.g. `BattleEngine.js`, `BaseScene.js`, `DialogBox.js`, `GameState.js`)
- Files exporting functions or data: `camelCase.js` — utils, data modules, config (e.g. `skills.js`, `random.js`, `config.js`)
- Classes / scenes: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE` defined in `src/config.js`
- Data IDs: `snake_case` strings that match their object key

## Do Not

- Import Phaser in any `src/engine/` or `src/data/` file
- Store state outside `GameState.js`
- Iterate data arrays in game logic — use `getById()`
- Add smooth tweens or sub-pixel movement
- Hardcode domain names, tier names, or multiplier values — use `src/config.js`
- Add logic to data files
