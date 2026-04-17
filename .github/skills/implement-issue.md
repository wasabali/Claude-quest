# Implement Issue

Implement a GitHub issue following Cloud Quest's architecture and conventions. Invoke with an issue number (e.g. "implement issue 6").

## Step 1 — Understand the issue

Fetch the issue content. Read:
- The issue title and body
- Any referenced design issues (e.g. "See #41")
- Labels (determines which layer to work in)

Then read the relevant source files before writing any code.

## Step 2 — Identify the layer

| Label / location | Layer | Rules |
|---|---|---|
| `src/engine/` | Engine | Zero Phaser imports. Pure functions. Return `BattleEvent[]`. Unit tests required. |
| `src/data/` | Data | Pure object definitions. No logic. Registry exports only. No imports from engine or scenes. |
| `src/scenes/` | Scene | Phaser only. Delegates logic to engines. No game logic in scene. |
| `src/ui/` | UI | Phaser components. Reusable. No game state mutation. |
| `src/state/` | State | `GameState.js` only. Single mutable object. |

## Step 3 — Engine layer implementation (if applicable)

If the issue touches `src/engine/`, use TDD:

1. Write tests first in the corresponding `tests/` file
2. Run `npm test` — confirm tests fail
3. Write minimal implementation
4. Run `npm test` — confirm green
5. Refactor only if tests stay green

Engine code constraints:
- No `import Phaser` anywhere in `src/engine/`
- Functions return `BattleEvent[]` — never mutate state silently
- All public functions must be exported

```js
// BattleEvent shape — every engine function returns these
{
  type: 'damage' | 'heal' | 'status_apply' | 'status_remove'
      | 'budget_drain' | 'shame' | 'dialog' | 'sla_tick'
      | 'reveal' | 'win' | 'lose',
  target: 'player' | 'opponent',
  value: Number,
  text: String,   // 'dialog' type only
}
```

Domain matchup system (implement exactly as specified):

```js
const DOMAIN_MATCHUPS = {
  linux:       { strong: 'security',   weak: 'kubernetes'  },
  security:    { strong: 'serverless', weak: 'linux'       },
  serverless:  { strong: 'cloud',      weak: 'security'    },
  cloud:       { strong: 'iac',        weak: 'serverless'  },
  iac:         { strong: 'containers', weak: 'cloud'       },
  containers:  { strong: 'kubernetes', weak: 'iac'         },
  kubernetes:  { strong: 'linux',      weak: 'containers'  },
  observability: { strong: null, weak: null },
}
const STRONG_MULTIPLIER = 2.0
const WEAK_MULTIPLIER   = 0.5
```

## Step 4 — Data layer implementation (if applicable)

If the issue adds skill/trainer/item data to `src/data/`:

- Use the add-skill or add-trainer skills for scaffolding
- IDs are `snake_case`, must match object key
- No logic, no conditionals, no imports from engine or scenes
- Registry exports must remain at the bottom:

```js
export const getById = (id) => DATA[id]
export const getAll  = () => Object.values(DATA)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

## Step 5 — Scene layer implementation (if applicable)

If the issue touches `src/scenes/`:

- Extend `BaseScene`
- All game logic goes through engine calls — never inline calculations
- Use `DialogBox` for all in-game dialogue (never raw Phaser text)
- Read `GameState` fresh each frame — never cache across frames
- Use `fadeToScene()` for transitions — never `this.scene.start()` in gameplay
- Pixel art compliance (non-negotiable):
  - No tweens on `x`, `y`, `scaleX`, `scaleY` — use frame swaps
  - No non-integer scale values
  - No `setAlpha()` transitions — hide/show is instant
  - All text uses `{ fontFamily: CONFIG.FONT }`

```js
// Correct pattern: engine call → render events
onSkillSelected(skillId) {
  const events = this.engine.useSkill(skillId)
  events.forEach(event => this.renderEvent(event))
}
```

## Step 6 — GameState access

Read directly from `GameState`. Never copy values to local variables that persist across frames.

```js
// Correct
update() { this.hud.setHp(GameState.player.hp, GameState.player.maxHp) }

// Wrong — stale after GameState changes
create() { this.cachedHp = GameState.player.hp }
```

## Step 7 — Code quality rules

- No defensive programming for internal code paths — only validate at system boundaries (user input, external APIs)
- No helper abstractions for one-off operations — inline is fine
- No feature flags, no backwards-compat shims
- No added docstrings, comments, or type annotations on code you didn't change
- Only add comments where the logic is genuinely non-obvious

## Step 8 — Commit

When the implementation is complete and tests pass:

1. Stage only the files you changed
2. Write a concise commit message: what changed and why (reference the issue number)
3. Push to the development branch

## Step 9 — Verify

Before reporting done:
- [ ] `npm test` passes (if engine code was changed)
- [ ] No Phaser imports in `src/engine/`
- [ ] No game logic in scenes
- [ ] No logic in `src/data/`
- [ ] Registry exports unchanged in data files
- [ ] Pixel art compliance checklist cleared (if scene was changed)
- [ ] Commit pushed to branch
