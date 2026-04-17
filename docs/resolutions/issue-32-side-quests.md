# Resolution: Issue #32 — Side Quest Mechanics

> Cross-reference: `docs/issues/content-bible.md §5`, `src/data/quests.js`

---

## Context Gathered

- Graph report: `resolveTurn()` (8 edges) is the battle god node — quest mechanics that trigger battles need to route through it cleanly.
- Content bible §5 lists 6 side quest NPCs with no mechanics. Old Margaret in `quests.js` is the pattern to follow.
- Design session: "The game never blocks progress for a bad solution. It remembers." — wrong answers have consequences but aren't dead ends.

---

## Ideas Generated

**Q1 — Same 3-choice quiz format for all quests?**

1. **All quizzes, different penalty types** — same format, but each quest's wrong answers have domain-appropriate penalties (Budget Barry drains budget, Nervous Nancy triggers a security battle, Dev Dave fails a test run).
2. **Mix of quizzes and mini-battles** — some quests end in a battle encounter instead of a quiz. Higher reward, more interesting.
3. **Pure conversation trees** — no mechanical penalty, just dialogue branching. Cheap to implement, but boring.

**Winner: Option 1** — consistent quiz format with *thematically appropriate* wrong-answer penalties. Same engine, different flavours. Old Margaret is the template; penalties scale to the domain.

**Q2/Q3 — Answer options and penalties per quest**

See decisions below — each quest gets fully designed choices.

**Q4 — Retry after wrong answer?**

1. **Yes, re-enter building** — consequence applied, but retry allowed. Same as resolved #29.
2. **One-shot, no retry** — too punishing, contradicts the "game never blocks" principle.
3. **Retry costs an item** — interesting but adds complexity. Not for MVP.

**Winner: Option 1** — consistent with #29.

**Q5 — Follow-up visits?**

1. **All quests get a follow-up** — brief one-liner after completion. Cheap, adds warmth.
2. **Only major quests get follow-ups** — Margaret, Architect Alice.
3. **No follow-ups** — static world.

**Winner: Option 1** — a single `followUpDialog` field per quest costs nothing and makes the world feel alive.

**Q6 — Intern Ivan placement**

1. **Roaming NPC, 5 fixed locations across 5 acts** — one per act, always in a new region. Each encounter is a separate mini-quest with increasing absurdity.
2. **One-time encounter in a fixed location** — simpler but wastes the escalating joke.
3. **Random spawn anywhere** — technically complex, comedically messy.

**Winner: Option 1** — the escalating joke is the whole point. Act 1: "What is a container?" → Act 2: "What is a Kubernetes?" → Act 3: "What is the cloud?" → Act 4: "What is a computer?" → Act 5/Finale: "What is infrastructure?" His reward tier escalates too.

**Q7 — Architect Alice multi-step quest**

1. **4-stage chain, one per Act 3 sub-region** — visit her after each sub-region to review that layer of the design (infra → containers → observability → security). Each stage unlocks the next.
2. **Single long conversation** — cheaper, less satisfying.
3. **Triggered by story flags, not location** — clean, but less world-embedded.

**Winner: Option 1** — fits the Architecture District lore and rewards systematic play.

---

## Recommended Decisions

### Q1 — Quest format
All side quests use the 3-choice quiz format. Wrong-answer penalties are domain-appropriate, not generic HP loss.

### Q2/Q3 — Full quest designs

**Dev Dave (Pipeline Pass) — Flaky Tests**
```
Prompt: "My pipeline fails randomly. The test passes locally every time."
A) "Delete the failing test"         → wrong  (-20 budget, "It's still flaky. Cheaper now I guess.")
B) "Add retry logic to the test"     → standard (+75 XP, "It passes more often. Still not fixed.")
C) "Find the race condition and fix it" → optimal (+120 XP, Skip Tests scroll, flag: dave_quest_optimal)
Wrong penalty: budget drain (it's a CI pipeline — wasted credits is the right joke)
```

**Startup Steve (Staging Valley) — Storage Full**
```
Prompt: "We ran out of disk space. The app is crashing."
A) "Delete the logs folder"          → shortcut (+30 XP, -5 rep, "That's one way to do it...")
B) "Mount a bigger volume"           → standard (+60 XP, Storage Key item)
C) "Identify and clean up old artifacts" → optimal (+90 XP, Storage Key + CI Badge, flag: steve_quest_optimal)
Wrong penalty: -10 HP (the app crashes harder on Steve's box)
```

**Nervous Nancy (Production Plains) — Data Breach**
```
Prompt: "Someone is accessing our database. What do I do first?"
A) "Change your passwords"           → standard (+80 XP, -5 rep, "Better late than never.")
B) "Rotate all credentials and revoke access" → optimal (+120 XP, Security Scan badge, flag: nancy_quest_optimal)
C) "Don't worry, it's probably fine" → nuclear (+0 XP, +2 shame, -30 rep, triggers mini incident battle: "Leaked Secret" encounter)
Wrong penalty on nuclear: immediate Leaked Secret battle (no SLA timer — Nancy panics, you must fight through it)
```

**Budget Barry (Azure Town) — Azure Bill Tripled**
```
Prompt: "Our Azure bill went from €200 to €600 overnight. Help!"
A) "Call Microsoft and yell at them" → wrong  (-15 rep, "They said it's our fault.")
B) "Enable cost alerts and investigate" → optimal (+100 XP, Cost Alert Suppressor, flag: barry_quest_optimal)
C) "Delete everything and start over" → cursed (+25 XP, +1 shame, -30 rep, "The bill is gone. So is the service.")
Wrong penalty: -30 budget ("Barry panicked and bought Reserved Instances for everything. You'll be paying for 3 years.")
```

**Intern Ivan (Roaming — 5 encounters)**
| Act | Location | Question | Correct Answer | Wrong Answer | Reward |
|-----|----------|----------|----------------|-------------|--------|
| 1 | Pipeline Pass | "What is a container?" | "An isolated process with its own filesystem" | "A box?" | +30 XP |
| 2 | Staging Valley | "What is a Kubernetes?" | "Container orchestration at scale" | "Is that Greek?" | +40 XP |
| 3 | Jira Dungeon | "What is the cloud?" | "Someone else's computer, billed per second" | "Like weather?" | +50 XP |
| 4 | Architecture District | "What is a computer?" | "..." (no wrong answer — Ivan runs off) | — | +60 XP |
| Finale | Cloud Console lobby | "What is infrastructure?" | "Everything you don't notice until it breaks" | — | +100 XP, Dockertle treat |

Wrong answers: Ivan nods very seriously and writes it down. No penalty — it's Ivan.

**Architect Alice (Architecture District) — Multi-step System Design Review**

4 stages, unlocked sequentially via `story.flags`:

| Stage | Trigger | Ask | Correct Answer | Reward |
|-------|---------|-----|----------------|--------|
| 1 | Enter Architecture District | "How would you handle high traffic?" | "Auto-scaling + load balancer" | Blueprint v1 key item |
| 2 | Complete Security Vault | "How would you secure it?" | "Zero-trust + IAM roles" | Blueprint v2 key item |
| 3 | Beat Kube Master | "How would you containerise it?" | "Docker + Kubernetes with resource limits" | Blueprint v3 key item |
| 4 | All 3 blueprints + Beat gym 7 | "Present the full design" | (Final quiz combining all 3) | +200 XP + rare Cloudémon unlock flag |

Wrong answers in Alice's quest: -1 stage (Blueprint v1 → must redo stage 1). "We need to revisit the fundamentals."

### Q4 — Retry: Yes, re-enter building
Consistent with #29 resolution.

### Q5 — All quests get a follow-up line
One-line `followUpDialog` on all completed quests.

### Q6 — Intern Ivan roams across 5 acts (see table above)
Flag `ivan_act_{n}_encountered` tracks each meeting.

### Q7 — Alice's 4-stage chain across Act 3–4 (see table above)

---

## Data Shape

```js
// Extension of existing quests.js pattern
dev_dave_flaky: {
  id: 'dev_dave_flaky',
  npc: 'dev_dave',
  location: 'pipeline_pass',
  act: 1,
  type: 'quiz',
  requiresFlags: ['act_1_started'],
  excludeFlags: ['dave_quest_complete'],
  reminderDialog: ["Still getting flaky tests?", "Come talk to me."],
  stages: [
    {
      dialog: ["My pipeline keeps failing randomly.", "Passes locally every time."],
      choices: [
        { text: 'Delete the failing test',         result: 'wrong',    budgetLoss: 20 },
        { text: 'Add retry logic to the test',     result: 'standard', xp: 75 },
        { text: 'Find the race condition and fix', result: 'optimal',  xp: 120, itemDrop: 'skip_tests_scroll' },
      ],
      wrongDialog: ["It's still flaky. Cheaper now."],
      correctDialog: ["The race condition! I never thought of that."],
    },
  ],
  followUpDialog: ["That fix held up in prod.", "You're the real MVP."],
  completionFlag: 'dave_quest_complete',
},
```

---

## Files Affected

- `src/data/quests.js` — add 6 new quest definitions following the pattern above
- `src/data/story.js` — add Intern Ivan's roaming dialog entries per act
- `src/scenes/WorldScene.js` — Intern Ivan spawn logic per act flag

## Follow-ups

- Architect Alice's blueprint item IDs need defining in `items.js`
- Ivan's Dockertle treat item needs defining in `items.js`
- Nancy's Leaked Secret battle needs an encounter entry in `encounters.js`

## Content Bible Update

> ✅ **Side quest mechanics (#32):** All quests use 3-choice quiz format. Wrong-answer penalties are domain-appropriate (budget drain for Dave, battle for Nancy, etc.). All quests get follow-up dialog. Intern Ivan roams across 5 acts with escalating questions. Architect Alice is a 4-stage chain requiring Blueprints v1–v3 as key items.
