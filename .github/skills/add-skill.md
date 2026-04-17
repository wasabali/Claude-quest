# Add Skill

Scaffold a new skill definition in `src/data/skills.js`. Invoke with the real CLI command to add (e.g. "kubectl rollout restart").

## What you need from the user

- The real CLI command (e.g. `kubectl rollout restart deployment/api`)
- The domain (pick from the table below, or ask if unclear)
- The tier (pick from the table below, or ask if unclear)
- Whether it should be cursed (if tier is `cursed` or `nuclear`, it must be)

If any of those are missing from the invocation, ask before writing anything.

---

## Step 1 — Read the existing file

Read `src/data/skills.js` in full before touching it. Note the last entry so you can append correctly.

## Step 2 — Determine all field values

Use these tables. No other values are valid.

### Domain

| Value | Beats | Weak against |
|---|---|---|
| `linux` | `security` | `kubernetes` |
| `security` | `serverless` | `linux` |
| `serverless` | `cloud` | `security` |
| `cloud` | `iac` | `serverless` |
| `iac` | `containers` | `cloud` |
| `containers` | `kubernetes` | `iac` |
| `kubernetes` | `linux` | `containers` |
| `observability` | nothing | nothing (support — reveals info, 0 damage) |
| `null` | bypasses matchup entirely (cursed/nuclear only) |

### Tier

| Value | XP mult | Rep | Shame | Notes |
|---|---|---|---|---|
| `optimal` | ×2 | +10 | 0 | Strong correct-domain technique |
| `standard` | ×1 | +3 | 0 | Reasonable correct-domain technique |
| `shortcut` | ×0.5 | −5 | 0 | Works but suboptimal |
| `cursed` | ×0.25 | −15 | +1 | Forbidden — must set `isCursed: true`, `domain: null` |
| `nuclear` | ×0 | −30 | +2 | Most destructive — must set `isCursed: true`, `domain: null` |

### Effect types

| Type | When to use |
|---|---|
| `damage` | Combat damage. Set `value` to base power (10–80). |
| `reveal` | Observability skills only. `value: 0`. |
| `heal` | Restores player HP. `value` = HP restored. |
| `status_apply` | Applies a status effect to target. Add `status` field with status name. |
| `buff_clear` | Removes buffs. Add `turns` and `target` fields. |
| `status_clear` | Removes all statuses. Add `target: 'both' | 'player' | 'opponent'`. |

## Step 3 — Write the entry

Use this exact shape. Field order must match.

### Standard / Optimal / Shortcut

```js
command_snake_case: {
  id: 'command_snake_case',
  displayName: 'actual cli command --flags',
  domain: 'cloud',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'One sentence. What it does in battle. Plain language.',
  effect: { type: 'damage', value: 30 },
  sideEffect: null,
  warningText: null,
},
```

### Observability (support)

```js
command_snake_case: {
  id: 'command_snake_case',
  displayName: 'actual cli command',
  domain: 'observability',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Reveals enemy domain type and HP.',
  effect: { type: 'reveal', value: 0 },
  sideEffect: null,
  warningText: null,
},
```

### Cursed / Nuclear

```js
command_snake_case: {
  id: 'command_snake_case',
  displayName: 'actual cli command --dangerous-flag',
  domain: null,
  tier: 'cursed',
  isCursed: true,
  budgetCost: 0,
  description: 'What it does. Be specific about collateral.',
  effect: { type: 'damage', value: 60 },
  sideEffect: { type: 'reputation_damage', value: 15 },
  warningText: 'This will work. But at what cost?',
},
```

## Step 4 — ID rules

- `id` must be `snake_case` of the command, stripping flags
- `id` must match the object key exactly
- If a similar skill already exists, suffix with `_2` or use a more specific name
- Example: `kubectl rollout restart` → `kubectl_rollout_restart`

## Step 5 — Append to the file

Add the new entry inside the `const SKILLS = { ... }` object, after the last existing entry.

Do NOT touch the export block at the bottom. It must stay exactly as:

```js
export const getById = (id) => SKILLS[id]
export const getAll  = () => Object.values(SKILLS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

## Step 6 — Verify

After writing, confirm:
- [ ] `id` matches the object key
- [ ] `domain` is a valid value from the table (or `null` for cursed)
- [ ] `tier` is a valid value from the table
- [ ] If `tier` is `cursed` or `nuclear`: `isCursed: true`, `domain: null`, `sideEffect` is not null, `warningText` is not null
- [ ] `displayName` is the real CLI command as typed, not a description
- [ ] Export block at bottom is unchanged
