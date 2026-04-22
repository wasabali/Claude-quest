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

- Canvas: 1920×1080, `Phaser.Scale.FIT` — fills browser, preserves ratio
- Font: Press Start 2P only. No other fonts.
- No smooth tweening. All animations are 2–4 frame sprite flips.
- Tile size: 48×48px. Viewport: 40×~22 tiles.
- UI windows: 9-slice panels (PokeRogue-style)
- No `pixelArt: true`, no `antialias: false` — full resolution rendering

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

## Mandatory Skill Triggers

**Before doing any of the following tasks, you MUST read the corresponding skill file first.** These are not optional — the skill files contain the authoritative workflow, constraints, and checklists that keep the codebase consistent.

| Task | Read this skill first |
|---|---|
| Implementing a GitHub issue | `.github/skills/implement-issue.md` |
| Touching `src/engine/` (BattleEngine, SkillEngine, StatusEngine, EncounterEngine) | `.github/skills/cloud-quest-battle.md` |
| Adding or editing anything in `src/scenes/` or `src/ui/` | `.github/skills/phaser-scene-patterns.md` |
| Adding skills, trainers, items, or emblems to `src/data/` | `.github/skills/game-data-registry.md` |
| Adding a new CLI command as a game skill | `.github/skills/add-skill.md` |
| Adding a new trainer NPC | `.github/skills/add-trainer.md` |
| Adding yourself or another developer as a trainer | `.github/skills/add-yourself.md` |
| Converting a real work incident into an encounter | `.github/skills/add-incident.md` |
| Drafting a new GitHub issue from a feature idea | `.github/skills/spec-issue.md` |
| Fixing review comments and merging a PR | `.github/skills/merge-pr.md` |
| Filing issues for contradictions, bugs, or gaps | `.github/skills/triage-issues.md` |
| Answering a `[Design Question]` issue | `.github/skills/resolve-question.md` |
| Regenerating the wiki after content changes | `.github/skills/update-wiki.md` |
| Adding sprites, tilesets, animations, or extracting PokeRogue assets | `.github/skills/visual-assets.md` |

After **every** issue implementation you **must** also follow `.github/skills/post-implementation.md`. This is not optional.

## Available Skills

Skills are defined in `.github/skills/` and provide specialised workflows for common tasks.

| Skill | When to use |
|---|---|
| `spec-issue "<feature idea>"` | Draft a well-specced development issue from a feature idea — acceptance criteria, affected layers, data shapes. Creates issues that `implement-issue` can pick up. |
| `implement-issue <number>` | Implement a GitHub issue following Cloud Quest's architecture and conventions. |
| `add-skill "<cli command>"` | Scaffold a new skill definition in `src/data/skills.js` from a real CLI command. |
| `add-trainer "<concept>"` | Scaffold a new trainer definition in `src/data/trainers.js`. |
| `add-incident "<description>"` | Turn a real work problem into a Cloud Quest battle incident in `src/data/`. |
| `add-yourself "<bio>"` | Add yourself to the game as a trainer NPC with your real CLI commands as skills. |
| `cloud-quest-battle` | Load the complete battle system reference — use before touching `BattleEngine`, `SkillEngine`, `StatusEngine`, `BattleScene`, or any battle logic. |
| `game-data-registry` | Load the data layer reference — use before adding skills, items, trainers, or emblems to `src/data/`. |
| `phaser-scene-patterns` | Load Phaser 3 scene patterns — use before implementing or modifying any scene or UI component. |
| `triage-issues "<area>"` | Scan codebase and docs for contradictions, errors, and open questions, then file GitHub issues. |
| `resolve-question <number>` | Iterate design ideas for a `[Design Question]` issue and find the best fit. |
| `update-wiki` | Regenerate `docs/wiki/` pages from current data files and design docs. |
| `merge-pr <owner/repo#pr>` | Fix actionable PR review feedback, check for merge conflicts, and merge cleanly only after checks pass. |
| `post-implementation` | **Mandatory** after every issue implementation. Runs stress tests + triage, regenerates wiki, updates graphify. Replaces the old `game-health.yml` and `wiki-sync.yml` pipelines. |
| `visual-assets` | Generate sprite specifications, extract PokeRogue assets, plan animations, design tilesets, maintain CREDITS files. Use when adding any visual content. |

## Specialized Agents

These agents are invoked by Claude Code's task tool for specialized work. When you are asked to perform tasks in these areas, recommend the appropriate agent or follow the matching skill file.

| Agent | When to use | Skill to read first |
|---|---|---|
| `battle-engine-tdd` | Implementing or modifying any file in `src/engine/`. Writes tests first, enforces zero Phaser dependency. | `.github/skills/cloud-quest-battle.md` |
| `game-data-author` | Adding or editing content in `src/data/` — skills, items, trainers, emblems. Validates all field values. | `.github/skills/game-data-registry.md` |
| `content-contributor` | Adding real developers as trainers, turning CLI commands into skills, or converting incidents into encounters. | `.github/skills/add-yourself.md` |
| `phaser-reviewer` | Reviewing scenes, UI components, or `src/main.js`. Checks engine/scene separation and pixel art compliance. | `.github/skills/phaser-scene-patterns.md` |
| `issue-triager` | Autonomously scanning the codebase and docs for contradictions, errors, and gaps, then filing GitHub issues. | `.github/skills/triage-issues.md` |
| `stress-test` | Running the Monte Carlo balance simulation suite in `tests/stress/` to find balance problems. | `.github/skills/post-implementation.md` |
| `merge-agent` | Fixing PR review feedback, resolving merge conflicts, and merging when all checks pass. | `.github/skills/merge-pr.md` |
| `sprite-artist` | Adding sprites, tilesets, animations, UI elements, or extracting PokeRogue assets. Produces specifications and handles integration. | `.github/skills/visual-assets.md` |

## graphify

Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` if it exists.
If `graphify-out/wiki/index.md` exists, navigate it for deep questions.
Type `/graphify` in Copilot Chat to build or update the knowledge graph.
