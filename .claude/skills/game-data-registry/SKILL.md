---
name: game-data-registry
description: Reference for adding new skills, items, trainers, and emblems to Cloud Quest's data layer. Use when creating new game content. Covers the registry pattern, all required fields, valid domain/tier values, and cursed technique structure.
---

# Game Data Registry — Cloud Quest

## The Registry Pattern

Every data module in `src/data/` must export these three functions. No exceptions.

```js
const SKILLS = {
  // entries go here
}

export const getById = (id) => SKILLS[id]
export const getAll  = () => Object.values(SKILLS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

Never add a `find()`, `filter()`, or `Array.from()` call directly in game logic. Use `getBy()`.

---

## Adding a Skill (`src/data/skills.js`)

### Standard / Optimal / Shortcut Skill

```js
az_webapp_deploy: {
  id: 'az_webapp_deploy',
  displayName: 'az webapp deploy',
  domain: 'cloud',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Deploy to Azure App Service.',
  effect: { type: 'damage', value: 30 },
  sideEffect: null,
  warningText: null,
},
```

### Observability Skill (support domain — no damage)

```js
az_monitor_logs: {
  id: 'az_monitor_logs',
  displayName: 'az monitor logs',
  domain: 'observability',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Pull Azure Monitor logs. Reveals enemy domain type and HP.',
  effect: { type: 'reveal', value: 0 },
  sideEffect: null,
  warningText: null,
},
```

### Cursed Technique

```js
git_push_force: {
  id: 'git_push_force',
  displayName: 'git push --force',
  domain: null,           // null — bypasses domain matchup entirely
  tier: 'cursed',
  isCursed: true,
  budgetCost: 0,
  description: 'Wipe the opponent\'s last 3 turns of buffs. Side effects guaranteed.',
  effect: { type: 'buff_clear', turns: 3, target: 'opponent' },
  sideEffect: { type: 'buff_clear', turns: 1, target: 'player' },
  warningText: 'This will work. But at what cost?',
},
```

### Nuclear Technique

```js
rm_rf: {
  id: 'rm_rf',
  displayName: 'rm -rf /',
  domain: null,
  tier: 'nuclear',
  isCursed: true,
  budgetCost: 0,
  description: 'Wipes all status effects — yours and theirs. Nothing survives.',
  effect: { type: 'status_clear', target: 'both' },
  sideEffect: { type: 'reputation_damage', value: 30 },
  warningText: 'This will work. But at what cost?',
},
```

### Valid Domain Values

| Value | Beats | Weak against |
|---|---|---|
| `linux` | `security` | `kubernetes` |
| `security` | `serverless` | `linux` |
| `serverless` | `cloud` | `security` |
| `cloud` | `iac` | `serverless` |
| `iac` | `containers` | `cloud` |
| `containers` | `kubernetes` | `iac` |
| `kubernetes` | `linux` | `containers` |
| `observability` | nothing | nothing |
| `null` | — | bypasses matchup |

### Valid Tier Values

| Value | XP mult | Rep | Shame |
|---|---|---|---|
| `optimal` | ×2 | +++ | 0 |
| `standard` | ×1 | + | 0 |
| `shortcut` | ×0.5 | − | 0 |
| `cursed` | ×0.25 | −− | +1 |
| `nuclear` | ×0 | −−− | +2 |

---

## Adding a Trainer (`src/data/trainers.js`)

```js
ola_ops_guy: {
  id: 'ola_ops_guy',
  name: 'Ola the Ops Guy',
  domain: 'linux',
  deck: ['systemctl_restart', 'grep_logs', 'chmod_fix'],
  signatureSkill: 'systemctl_restart',   // taught to player on Optimal win
  telegraphs: [
    'Time to restart some services...',
    'Let\'s see what\'s in those logs...',
  ],
  introDialog: 'You dare challenge the Ops Guy? I\'ve been doing this since before containers existed.',
  winDialog: 'Not bad. Let me show you how systemctl actually works.',
  loseDialog: 'Read the man page. Then come back.',
  isCursedTrainer: false,
  shameRequired: 0,
  location: 'localhost_town',
},
```

### Cursed Trainer

```js
hotfix_hakon: {
  id: 'hotfix_hakon',
  name: 'Hotfix Håkon',
  domain: null,
  deck: ['deploy_directly_to_prod', 'skip_tests_scroll'],
  signatureSkill: 'deploy_directly_to_prod',
  telegraphs: [
    'No time for a pipeline...',
    'Tests are just suggestions...',
  ],
  introDialog: 'You found me. That means you\'ve made some choices. Same.',
  winDialog: 'Fine. Here\'s how to deploy without the pipeline. Don\'t tell anyone.',
  loseDialog: 'You\'re not ready to be this reckless.',
  isCursedTrainer: true,
  shameRequired: 2,
  location: 'three_am_tavern',
},
```

---

## Adding an Item (`src/data/items.js`)

```js
red_bull: {
  id: 'red_bull',
  name: 'Red Bull',
  tab: 'tools',             // tools | keyItems | credentials | docs | junk
  stackable: true,
  description: '3am fuel. Restores 30 HP.',
  effect: { type: 'heal', value: 30 },
  useInBattle: true,
},

terraform_state_file: {
  id: 'terraform_state_file',
  name: 'Terraform State File',
  tab: 'docs',
  stackable: false,
  description: 'Don\'t touch it. Don\'t move it. Don\'t even look at it.',
  effect: null,
  useInBattle: false,
},
```
