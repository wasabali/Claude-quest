# Add Trainer

Scaffold a new trainer definition in `src/data/trainers.js`. Invoke with the trainer concept (e.g. "Kubernetes specialist, mid-game, hostile").

## What you need from the user

- The trainer concept or name
- Their domain specialty (pick from valid domains below)
- Their location (region or area ID)
- Whether they are a cursed trainer (hidden area, shameRequired > 0)
- Their deck of 3–5 skill IDs (must already exist in `src/data/skills.js`)

If any are missing from the invocation, read `src/data/trainers.js` and `src/data/skills.js` first to get context, then ask.

---

## Step 1 — Read both files

Read `src/data/trainers.js` and `src/data/skills.js` before writing anything. You need to:
- Know which skill IDs exist to populate `deck`
- Know the last trainer entry to append correctly

## Step 2 — Determine field values

### Valid domains

`linux` | `containers` | `kubernetes` | `cloud` | `security` | `iac` | `serverless` | `observability`

Cursed trainers use `domain: null`.
`observability` is outside the normal damage matchup cycle (deals 0 damage, only reveals). Only use it when the trainer concept is explicitly observability-focused (e.g. an SRE who only queries metrics).

### Domain matchup cycle (for picking the right deck)

```
linux → beats → security
security → beats → serverless
serverless → beats → cloud
cloud → beats → iac
iac → beats → containers
containers → beats → kubernetes
kubernetes → beats → linux
```

A trainer's deck should contain skills matching their domain. The player needs to counter the trainer's domain.

### Location IDs (known areas)

`localhost_town` | `pipeline_pass` | `container_port` | `cloud_citadel` | `kernel_caves` | `serverless_steppes`

Hidden/cursed areas: `three_am_tavern` | `legacy_codebase` | `outcast_network` | `shadow_registry`

## Step 3 — Write the entry

### Standard trainer

```js
trainer_id: {
  id: 'trainer_id',
  name: 'Full Display Name',
  domain: 'kubernetes',
  deck: ['kubectl_apply', 'kubectl_rollout_restart', 'kubectl_describe'],
  signatureSkill: 'kubectl_apply',   // taught to player on Optimal win
  telegraphs: [
    'First line — foreshadows the move they are about to use.',
    'Second line — alternate telegraph, used randomly.',
    'Third line — optional, used for signature move.',
  ],
  introDialog: 'One to two sentences. Their personality. Why they fight.',
  winDialog: 'What they say when player wins. What they teach or reveal.',
  loseDialog: 'What they say when player loses. Should sting slightly.',
  isCursedTrainer: false,
  shameRequired: 0,
  location: 'container_port',
},
```

### Cursed trainer

```js
trainer_id: {
  id: 'trainer_id',
  name: 'Full Display Name',
  domain: null,
  deck: ['deploy_directly_to_prod', 'skip_tests_scroll'],
  signatureSkill: 'deploy_directly_to_prod',
  telegraphs: [
    'No time for a pipeline...',
    'Tests are just suggestions...',
  ],
  introDialog: 'They know you found them. They know what you\'ve done.',
  winDialog: 'What forbidden knowledge they pass on.',
  loseDialog: 'You\'re not reckless enough yet.',
  isCursedTrainer: true,
  shameRequired: 2,   // minimum shame to unlock this trainer
  location: 'three_am_tavern',
},
```

## Step 4 — ID rules

- `id` must be `snake_case`, descriptive, unique
- `id` must match the object key exactly
- Format pattern: `{name}_{role}` e.g. `ola_ops_guy`, `hotfix_hakon`, `kube_master`

## Step 5 — Dialog quality rules

- `introDialog`: establish personality and stakes in 1–2 sentences; no question marks (trainers don't ask — they assert)
- `winDialog`: teach something. Either reveals a technique, gives a hint, or unlocks a path. Never just "good game."
- `loseDialog`: must sting. Short. Direct. Optionally gives a hint at what the player needs to learn.
- `telegraphs`: 2–3 lines. Each foreshadows a specific move in the deck. The player should be able to pattern-match if paying attention.

## Step 6 — Append to the file

Add the new entry inside the `const TRAINERS = { ... }` object, after the last existing entry.

Do NOT touch the export block at the bottom:

```js
export const getById = (id) => TRAINERS[id]
export const getAll  = () => Object.values(TRAINERS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

## Step 7 — Verify

- [ ] `id` matches the object key
- [ ] All skill IDs in `deck` exist in `src/data/skills.js`
- [ ] `signatureSkill` is one of the skills in `deck`
- [ ] `domain` is valid (or `null` for cursed trainers)
- [ ] If `isCursedTrainer: true`: `shameRequired >= 2`, `domain: null`, location is a hidden area
- [ ] `telegraphs` has at least 2 entries
- [ ] All dialog fields are filled (no `null`, no empty string)
- [ ] Export block is unchanged
