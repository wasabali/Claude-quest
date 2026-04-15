---
name: add-yourself
description: Add yourself to Cloud Quest as a trainer NPC and turn your real CLI commands into battle skills. Invoke with a short description of yourself (e.g. /add-yourself "I'm a Kubernetes engineer at Acme, I live in kubectl and helm").
---

# What is Cloud Quest?

Cloud Quest is a GameBoy Color-style RPG where you play as a junior cloud engineer fighting your way to Principal Engineer. You solve incidents (real technical problems — CrashLoopBackOff, 503 errors, runaway costs), battle other engineers in turn-based fights, and learn real CLI commands.

**Commands are your weapons.** `kubectl apply`, `az webapp deploy`, `terraform plan` — these are the skills in your battle deck.

**Domains are the type system.** There are 7 combat domains in a cycle:
```
Linux → Security → Serverless → Cloud → IaC → Containers → Kubernetes → Linux
```
Each domain deals ×2 damage to the one it beats, ×0.5 to the one it's weak against.

**Trainer NPCs are real engineer archetypes.** When the player beats a trainer in battle, they learn that trainer's signature skill. Trainers telegraph their moves one turn in advance. Their dialog reflects their real personality.

You can add yourself as a trainer the player encounters in the world — with your actual commands as skills, your real opinions as dialog, and your domain expertise as your battle type.

---

## What you need to provide

Either extract this from the invocation, or ask the developer:

1. **Your name** (display name for the NPC, can be a handle)
2. **Your job title / role** (e.g. "Platform Engineer", "DevOps Lead", "Cloud Architect")
3. **Your primary domain** — pick one: `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless`
4. **3–5 real CLI commands you actually use** (the more specific the better — flags and all)
5. **Your personality in one sentence** (how colleagues would describe you in a code review)
6. **Your signature move** — the one command you reach for first, always
7. **Your location** — where in the game world should the player find you? Pick one:
   - `localhost_town` — beginner area, friendly
   - `pipeline_pass` — mid-game, CI/CD focused
   - `container_port` — containers/Docker area
   - `cloud_citadel` — cloud platform area
   - `kernel_caves` — Linux/infra area
   - `serverless_steppes` — serverless area
   - `three_am_tavern` — hidden area for the cursed/chaotic (requires shame ≥ 2)

---

## Step 1 — Create skills for your commands

For each CLI command, create a skill entry in `src/data/skills.js`.

Read the file first. Then append each skill using this template:

```js
command_snake_case: {
  id: 'command_snake_case',
  displayName: 'actual-cli-command --with-flags',
  domain: 'kubernetes',    // match your chosen domain
  tier: 'optimal',         // optimal | standard | shortcut | cursed | nuclear
  isCursed: false,
  budgetCost: 0,
  description: 'One sentence. What this command actually does.',
  effect: { type: 'damage', value: 30 },   // see power guide below
  sideEffect: null,
  warningText: null,
},
```

### Power guide (effect.value)
| Command type | Base power |
|---|---|
| Create / apply / deploy | 30–40 |
| Observe / debug / inspect | 20–25 (or `{ type: 'reveal', value: 0 }` for observability) |
| Restart / rollout | 25–35 |
| Delete / force / override | 40–60 |
| Known-destructive (force push, rm, drop) | 50–80 — set `tier: 'cursed'` or `'nuclear'`, `domain: null`, `isCursed: true` |

### Tier guide
- `optimal` — the right tool for the job, you'd be proud of this in a review
- `standard` — solid but not the cleanest
- `shortcut` — works, but your tech lead raises an eyebrow
- `cursed` — you know this is wrong. `domain: null`, `isCursed: true`, add `sideEffect` and `warningText`
- `nuclear` — scorched earth. `domain: null`, `isCursed: true`. There will be consequences.

### ID rules
- Convert command to `snake_case`, strip flags
- Example: `kubectl rollout restart deployment/api` → `kubectl_rollout_restart`
- If an ID already exists, suffix with `_2` or be more specific

---

## Step 2 — Create your trainer NPC

Add your trainer entry to `src/data/trainers.js`. Read the file first.

```js
your_id_here: {
  id: 'your_id_here',               // snake_case of your name
  name: 'Your Display Name',
  domain: 'kubernetes',             // your chosen domain
  deck: ['skill_id_1', 'skill_id_2', 'skill_id_3'],  // use the skills you just created
  signatureSkill: 'skill_id_1',     // taught to the player on an Optimal win
  telegraphs: [
    'One line that hints at your next move. In character.',
    'A second telegraph line. Different vibe.',
    'Optional third — used before your signature move.',
  ],
  introDialog: 'One or two sentences. Your engineer personality. Why you fight. No questions — assert.',
  winDialog: 'What you say when the player beats you. Teach them something real.',
  loseDialog: 'What you say when you lose. Short. Stings a little. Maybe a hint.',
  isCursedTrainer: false,           // true only for three_am_tavern / hidden areas
  shameRequired: 0,                 // 0 for normal trainers; 2+ for cursed
  location: 'container_port',      // where the player finds you
},
```

### Dialog quality rules
- **`introDialog`**: Your real engineering philosophy in 1–2 sentences. No "um" or questions. Assert.
  - Bad: *"Oh hey, are you here for a battle?"*
  - Good: *"I've been running this cluster since before you knew what a pod was."*
- **`winDialog`**: You just lost. What do you give them? A real command, a hard-won opinion, a shortcut.
  - Bad: *"Good fight! Here's your prize."*
  - Good: *"Not bad. You should know — `kubectl rollout undo` will save you one day."*
- **`loseDialog`**: They beat you. Own it, but make it sting or be useful.
  - Bad: *"Oh well, you won!"*
  - Good: *"You got lucky. Come back when you know what `--dry-run=client` is for."*
- **`telegraphs`**: Foreshadow the move. The player should be able to guess your next action if they're paying attention.
  - Bad: *"I'm going to attack you."*
  - Good: *"This cluster hasn't been healthy since the last deploy..."* (hints at a rollout restart)

---

## Step 3 — Verify

- [ ] Each skill ID matches its object key exactly
- [ ] All skill `domain` values are valid
- [ ] `signatureSkill` is one of the skills in `deck`
- [ ] `telegraphs` has at least 2 entries
- [ ] No Phaser imports in either data file
- [ ] Registry exports at bottom of both files are unchanged

---

## Example — a completed contribution

```js
// src/data/skills.js
kubectl_rollout_restart: {
  id: 'kubectl_rollout_restart',
  displayName: 'kubectl rollout restart deployment/api',
  domain: 'kubernetes',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Restart a deployment rolling update. Fixes most things that are quietly broken.',
  effect: { type: 'damage', value: 35 },
  sideEffect: null,
  warningText: null,
},

// src/data/trainers.js
ola_ops_guy: {
  id: 'ola_ops_guy',
  name: 'Ola the Ops Guy',
  domain: 'kubernetes',
  deck: ['kubectl_rollout_restart', 'kubectl_describe', 'kubectl_logs'],
  signatureSkill: 'kubectl_rollout_restart',
  telegraphs: [
    'This pod\'s been restarting since Tuesday...',
    'Let me check the events on that node.',
    'Time to restart some services.',
  ],
  introDialog: 'I\'ve been running this cluster since before you knew what a pod was. Let\'s see what you\'ve got.',
  winDialog: 'Decent. One thing — always check events before you restart. `kubectl describe pod` first.',
  loseDialog: 'Read the logs. Then come back.',
  isCursedTrainer: false,
  shameRequired: 0,
  location: 'container_port',
},
```
