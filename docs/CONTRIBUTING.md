# Contributing to Cloud Quest

Cloud Quest is a GameBoy Color-style RPG where you fight incidents and battle other engineers using real CLI commands. The best content comes from real engineers — your actual commands, your real incidents, your actual opinions about Terraform.

This guide explains how to add yourself to the game.

---

## What you can contribute

| Contribution | What it becomes in-game |
|---|---|
| **Yourself** | A trainer NPC the player can battle |
| **Your CLI commands** | Battle skills the player can learn by beating you |
| **A real incident you've solved** | A wild encounter the player has to resolve |

---

## Adding yourself as a trainer

You need five things:

1. **Your name** — what the NPC is called (can be a handle)
2. **Your domain** — your primary tech type: `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless` `observability` (support/reveal only — deals 0 damage, used by SRE/monitoring-focused engineers)
3. **3–5 real CLI commands you actually use** (flags included)
4. **Your personality in one sentence** — how a colleague would describe you in a code review
5. **Your location** — where in the world the player finds you:

| Location | Vibe |
|---|---|
| `localhost_town` | Beginner area, friendly |
| `pipeline_pass` | CI/CD, config drift |
| `container_port` | Docker, registries, images |
| `cloud_citadel` | Azure/AWS/GCP, billing, IAM |
| `kernel_caves` | Linux, permissions, cron, processes |
| `serverless_steppes` | Functions, cold starts, event chaos |
| `three_am_tavern` | Hidden. Cursed engineers only. |

### The quick way — use the slash command

If you have Claude Code installed:

```
/add-yourself "I'm a platform engineer at Acme, I live in kubectl and helm all day"
```

Claude will ask a few questions and write both the skill entries and your trainer entry.

### The manual way

**Step 1** — Open `src/data/skills.js` and add an entry for each command:

```js
kubectl_rollout_restart: {
  id: 'kubectl_rollout_restart',
  displayName: 'kubectl rollout restart deployment/api',
  domain: 'kubernetes',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Restart a deployment rolling update. Fixes most things quietly broken.',
  effect: { type: 'damage', value: 35 },
  sideEffect: null,
  warningText: null,
},
```

**Step 2** — Open `src/data/trainers.js` and add your entry:

```js
ola_ops_guy: {
  id: 'ola_ops_guy',
  name: 'Ola the Ops Guy',
  domain: 'kubernetes',
  deck: ['kubectl_rollout_restart', 'kubectl_describe', 'kubectl_logs'],
  signatureSkill: 'kubectl_rollout_restart',  // taught to the player when they beat you
  telegraphs: [
    'This pod\'s been restarting since Tuesday...',
    'Let me check the events on that node.',
  ],
  introDialog: 'I\'ve been running this cluster since before you knew what a pod was.',
  winDialog: 'Not bad. You should know — `kubectl rollout undo` will save you one day.',
  loseDialog: 'Read the logs. Then come back.',
  isCursedTrainer: false,
  shameRequired: 0,
  location: 'container_port',
},
```

**Dialog rules:**
- `introDialog`: Your real engineering philosophy. No questions — assert your worldview.
- `winDialog`: You just lost. Teach them something real. A command, a hard-won opinion.
- `loseDialog`: They beat you. Own it. Make it sting or be useful.

---

## Adding a real incident

An incident is a wild encounter — the player stumbles into it while exploring, like running into a Pokemon in tall grass. Except instead of a creature, it's a CrashLoopBackOff at 2am.

You need:

1. **What the player sees first** — the symptom (what appears in the terminal or alert)
2. **The actual root cause** — hidden until the player uses an Observability skill to reveal it
3. **The domain type** — `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless`
4. **Severity** — sets how many turns the player has before SLA breach:

| Severity | Turns | Situation |
|---|---|---|
| `sev3` | 10 | Annoying but not on fire |
| `sev2` | 6 | Affecting users or team velocity |
| `sev1` | 3 | Production down |
| `sev0` | 1 | You were paged at 3am |

### The quick way — use the slash command

```
/add-incident "Our pods keep OOMKilling in prod after the latest deploy"
```

### The manual way

**Step 1** — Add to `src/data/incidents.js` (create the file if it doesn't exist yet — see the registry pattern in `src/data/skills.js`):

```js
crashloopbackoff_oom: {
  id: 'crashloopbackoff_oom',
  displayName: 'CrashLoopBackOff',
  domain: 'containers',
  hp: 75,
  slaTimer: 6,
  severity: 'sev2',
  symptoms: [
    'Pod restart count: 23.',
    'OOMKilled. Exit code 137.',
    'kubectl describe shows memory pressure on the node.',
  ],
  rootCause: 'Memory limit (128Mi) below actual usage after image upgrade (~200Mi idle).',
  revealDialog: 'Domain revealed: Containers. The pod keeps exceeding its memory limit.',
  resolveDialog: 'Memory limits updated to 512Mi. Pod stable.',
  slaBreachDialog: 'This is now a P1. The on-call rotation has been paged.',
},
```

**Step 2** — Open `src/data/encounters.js` and add the incident ID to the right region and pool:

```js
container_port: {
  common: ['crashloopbackoff_oom'],  // ← add here
  rare:   [],
  cursed: [],
},
```

Pools: `common` (seen every week), `rare` (happens sometimes), `cursed` (haunts your dreams).

---

## Domain matchups

Your domain determines your combat strengths and weaknesses.

```
linux → beats → security → beats → serverless → beats → cloud
cloud → beats → iac → beats → containers → beats → kubernetes → beats → linux
```

Strong match = ×2 damage. Weak match = ×0.5. Pick your domain honestly — it should match your actual tech.

---

## Checklist before opening a PR

- [ ] Skill IDs match their object keys exactly (`id: 'foo'` inside `foo: { ... }`)
- [ ] All incident `domain` values are one of the 7 combat types (`linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless`) — `observability` is not valid for incidents
- [ ] Skill and trainer `domain` values may also include `observability` (support/reveal — no damage)
- [ ] `signatureSkill` is one of the IDs in `deck`
- [ ] `slaTimer` matches severity (1/3/6/10 for sev0/1/2/3)
- [ ] No imports from `engine/` or `scenes/` in data files
- [ ] Dialog sounds like a real engineer, not a game NPC

---

## Questions?

Open an issue or use `/add-yourself` or `/add-incident` — Claude knows the whole game world and will walk you through it.
