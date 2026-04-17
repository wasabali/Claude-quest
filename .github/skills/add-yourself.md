# Add Yourself

Add yourself to Cloud Quest as an NPC. You don't need to be an engineer — managers, POs, scrum masters, security people, designers, and anyone else can become part of the game world. Choose your level of involvement: from a simple NPC with a catchphrase to a full battle trainer or quest giver.

Invoke with a short description of yourself (e.g. "I'm a product owner who lives in Jira" or "I'm a Kubernetes engineer at Acme, I live in kubectl and helm" or "I'm a scrum master, I just want a funny cameo").

# What is Cloud Quest?

Cloud Quest is a GameBoy Color-style RPG where you play as a junior cloud engineer fighting your way to Principal Engineer. You solve incidents (real technical problems — CrashLoopBackOff, 502 errors, runaway costs), battle other engineers in turn-based fights, and learn real CLI commands.

The game world is full of NPCs — not just engineers. There are managers who block your path with process, POs who hand out quests, scrum masters who give items, and random characters who exist just to be funny. Everyone in the industry has a place in Cloud Quest.

---

## Step 0 — Choose your NPC type

Ask the person what level of involvement they want. There are four tiers:

### 🗣️ Tier 1: Catchphrase NPC (simplest)
A character the player can talk to. They say something funny or insightful when interacted with. No battle, no quest, no items — just vibes.

**Best for:** anyone who just wants a cameo — managers, execs, designers, recruiters, whoever.

### 🎁 Tier 2: Item / Skill Giver NPC
Like Tier 1, but the NPC gives the player a random item or teaches a skill when first spoken to.

**Best for:** mentors, leads, or anyone who wants to contribute something useful to the player's journey.

### 📋 Tier 3: Quest NPC
The NPC gives the player a quest with dialog choices and rewards. Can be a simple one-stage quest or multi-stage.

**Best for:** product owners, scrum masters, managers, or anyone with a real scenario they want to turn into a quest.

### ⚔️ Tier 4: Battle Trainer
A full trainer NPC the player battles using domain-matched skills. Trainer teaches their signature skill on defeat.

**Best for:** engineers, SREs, DevOps folks, security engineers — anyone who uses real CLI commands daily.

---

## What you need from the person

### All tiers need:
1. **Name** (display name for the NPC — real name, handle, or a fun alias)
2. **Role / title** (e.g. "Product Owner", "Scrum Master", "Platform Engineer", "VP of Engineering")
3. **Location** — where should the player find you? Pick one:
   - `localhost_town` — beginner area, friendly
   - `pipeline_pass` — CI/CD and process area
   - `jira_dungeon` — workflow, tickets, process-heavy area
   - `production_plains` — mid-game production environment
   - `kubernetes_colosseum` — Kubernetes battles
   - `security_vault` — security-focused area
   - `shell_cavern` — Linux/terminal area
   - `helm_repository` — Helm/container packaging
   - `architecture_district` — architecture and IaC area
   - `three_am_tavern` — hidden area for the chaotic (requires shame ≥ 3)
4. **Personality in one sentence** (how colleagues would describe them)

### Tier 1 additionally needs:
5. **A catchphrase or 1–3 dialog lines** (what they say when the player talks to them)

### Tier 2 additionally needs:
5. **What they give** — an item ID from `src/data/items.js` or a skill ID from `src/data/skills.js`
6. **A dialog line** when giving the item/skill

### Tier 3 additionally needs:
5. **The quest scenario** — what problem does the player help them with?
6. **Dialog choices** — what options does the player pick from? (at least one correct, one wrong)
7. **Reward** — XP amount and/or item(s)

### Tier 4 additionally needs:
5. **Primary domain** — `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless` `observability`
6. **3–5 real CLI commands** they actually use (specific — flags and all)
7. **Signature skill** — the one command they reach for first
8. **Difficulty** — 1 (beginner) to 5 (endgame)

If any info is missing, ask before writing anything.

---

## Tier 1 — Catchphrase NPC

Add a story dialog entry to `src/data/story.js`. Read the file first.

```js
npc_your_id: {
  id: 'npc_your_id',
  pages: [
    "First line of dialog when the player talks to you.",
    "Second line — optional. Add as many pages as you want.",
  ],
},
```

### Dialog quality rules for non-battle NPCs
- Write like a real person in a real office — not a generic RPG NPC
- Lean into the role's real personality and frustrations
- It's fine to be funny, sarcastic, tired, or enthusiastic — match the person

**Examples by role:**
- **Product Owner**: *"The backlog is not a wishlist. It's a graveyard of good intentions."*
- **Scrum Master**: *"Stand-up was supposed to be 15 minutes. It's been 45. Again."*
- **Engineering Manager**: *"I don't write code anymore. I write performance reviews. It's worse."*
- **Designer**: *"I handed over the Figma file three weeks ago. They're still using Comic Sans."*
- **Recruiter**: *"Looking for a senior engineer. Must have 10 years of Kubernetes experience. Kubernetes is 10 years old. I see no problem."*
- **VP of Engineering**: *"We're moving to microservices. No, I haven't read the RFD. Why do you ask?"*

---

## Tier 2 — Item / Skill Giver NPC

Do everything from Tier 1 (add the story dialog entry), **plus** connect the NPC to an item or skill gift.

The gift is triggered by adding a quest flag or gate interaction. The simplest approach:

1. Add dialog to `src/data/story.js` that includes the gift moment
2. If giving an **existing item**, reference its ID from `src/data/items.js`
3. If giving a **new item**, create it in `src/data/items.js`:

```js
your_item_id: {
  id:             'your_item_id',
  displayName:    'Your Item Name',
  tab:            'tools',              // tools | keyItems | credentials | docs | junk
  description:    'Funny one-liner about what this item is.',
  usableInBattle: false,
  battleAction:   'examine',
  worldActions:   ['examine', 'drop'],
  effect:         null,                 // or { type: 'heal_hp', value: 20 } etc.
},
```

---

## Tier 3 — Quest NPC

Do everything from Tier 1 (story dialog), **plus** add a quest to `src/data/quests.js`. Read the file first.

```js
your_quest_id: {
  id: 'your_quest_id',
  npc: 'your_npc_id',
  location: 'jira_dungeon',
  stages: [
    {
      dialog: ['First line of the problem.', 'Second line — explain the situation.'],
      choices: [
        { text: 'A wrong answer', correct: false, hpLoss: 10 },
        { text: 'The right answer', correct: true },
        { text: 'A funny wrong answer', correct: false, hpLoss: 10 },
      ],
      correctDialog: ['Great response when player picks correctly.'],
      wrongDialog: ['Response when player picks wrong.'],
    },
  ],
  rewards: { xp: 50, items: [{ id: 'item_id', qty: 1 }] },
  completedDialog: ['What the NPC says if the player talks to them after completing the quest.'],
  followUp: null,
},
```

### Quest scenario ideas by role
- **Product Owner**: *"The requirements changed mid-sprint. Again. Help me re-prioritise."*
- **Scrum Master**: *"Retro actions have piled up. Nobody's doing them. Fix this."*
- **Manager**: *"I need to justify headcount. Give me metrics that prove we need another engineer."*
- **Security**: *"Someone committed a secret to the public repo. Find it before the scanner does."*
- **QA Lead**: *"The flaky test suite is blocking the release. What do we do?"*

---

## Tier 4 — Battle Trainer

This is the full engineer experience. You create skills for their commands and a trainer entry.

### Step 1 — Create skills

Add skill entries to `src/data/skills.js`. Read the file first. Match the existing format exactly:

```js
command_snake_case: {
  id: 'command_snake_case',
  displayName: 'actual-cli-command --with-flags',
  domain: 'kubernetes',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'One sentence. What this command actually does.',
  effect: { type: 'damage', value: 30 },
  sideEffect: null,
  warningText: null,
  learnedFrom: 'Trainer Display Name',
  learnedAt: 'location_id',
  availableInAct: 1,
},
```

#### Power guide (effect.value)
| Command type | Base power |
|---|---|
| Create / apply / deploy | 30–40 |
| Observe / debug / inspect | 20–25 (or `{ type: 'reveal_domain', value: 1 }` for observability) |
| Restart / rollout | 25–35 |
| Delete / force / override | 40–60 |
| Known-destructive (force push, rm, drop) | 50–80 — set `tier: 'cursed'` or `'nuclear'`, `isCursed: true` |

#### Tier guide
- `optimal` — the right tool for the job
- `standard` — solid but not the cleanest
- `shortcut` — works, but your tech lead raises an eyebrow
- `cursed` — you know this is wrong. Keep the real domain, set `isCursed: true`, add `sideEffect` and `warningText`
- `nuclear` — scorched earth. Keep the real domain, set `isCursed: true`. There will be consequences.

Note: cursed/nuclear skills keep their real domain. Matchup bypass is handled by `isCursed`/`tier` in the engine, not `domain: null`.

### Step 2 — Create the trainer entry

Add to `src/data/trainers.js`. Read the file first.

#### Standard trainer
```js
your_id: {
  id: 'your_id',
  name: 'Display Name',
  domain: 'kubernetes',
  location: 'kubernetes_colosseum',
  difficulty: 3,                    // 1 (beginner) to 5 (endgame)
  signatureSkill: 'skill_id',      // taught to player on win
  isCursed: false,
},
```

#### Cursed trainer
```js
your_id: {
  id: 'your_id',
  name: 'Display Name',
  vibe: 'Short personality summary — one sentence max.',
  domain: 'iac',                    // keep the real domain
  cursedSkill: 'skill_id',
  isCursed: true,
},
```

---

## Verify

### All tiers
- [ ] `id` matches the object key in every file touched
- [ ] No Phaser imports in any data file
- [ ] Registry exports at bottom of each file are unchanged
- [ ] Location IDs exist in `src/data/encounters.js` or `src/data/gates.js`

### Tier 4 (Battle Trainer) additionally
- [ ] All skill `domain` values are valid (one of: `linux` `containers` `kubernetes` `cloud` `security` `iac` `serverless` `observability`)
- [ ] `signatureSkill` exists in `src/data/skills.js`
- [ ] Cursed trainers have `isCursed: true` and `cursedSkill` set
- [ ] Skill IDs match their object keys

---

## Examples

### Tier 1 — A Product Owner cameo

```js
// src/data/story.js
npc_po_priya: {
  id: 'npc_po_priya',
  pages: [
    "Priya the PO: The backlog has 847 items.",
    "I've prioritised them all as P1.",
    "Don't look at me like that.",
  ],
},
```

### Tier 3 — A Scrum Master quest

```js
// src/data/story.js
npc_scrum_sam: {
  id: 'npc_scrum_sam',
  pages: [
    "Sam the Scrum Master: Stand-up ran 45 minutes today.",
    "We need to fix the process. Can you help?",
  ],
},

// src/data/quests.js
sam_standup_quest: {
  id: 'sam_standup_quest',
  npc: 'scrum_sam',
  location: 'jira_dungeon',
  stages: [
    {
      dialog: ['Stand-up keeps running over.', 'Three people gave status updates about their lunch.'],
      choices: [
        { text: 'Add a timer and enforce 2 mins per person', correct: true },
        { text: 'Cancel stand-up entirely', correct: false, hpLoss: 10 },
        { text: 'Make it async in Slack', correct: false, hpLoss: 10 },
      ],
      correctDialog: ['Finally! Someone with sense.'],
      wrongDialog: ['That... will not go well.'],
    },
  ],
  rewards: { xp: 40, items: [] },
  completedDialog: ['Stand-up was 12 minutes today. A personal best.'],
  followUp: null,
},
```

### Tier 4 — An engineer battle trainer

```js
// src/data/skills.js
kubectl_rollout_restart: {
  id: 'kubectl_rollout_restart',
  displayName: 'kubectl rollout restart deployment/api',
  domain: 'kubernetes',
  tier: 'optimal',
  isCursed: false,
  budgetCost: 0,
  description: 'Restart a deployment. Fixes most things that are quietly broken.',
  effect: { type: 'damage', value: 35 },
  sideEffect: null,
  warningText: null,
  learnedFrom: 'Ola the Ops Guy',
  learnedAt: 'kubernetes_colosseum',
  availableInAct: 2,
},

// src/data/trainers.js
ola_ops: {
  id: 'ola_ops',
  name: 'Ola the Ops Guy',
  domain: 'kubernetes',
  location: 'kubernetes_colosseum',
  difficulty: 3,
  signatureSkill: 'kubectl_rollout_restart',
  isCursed: false,
},
```
