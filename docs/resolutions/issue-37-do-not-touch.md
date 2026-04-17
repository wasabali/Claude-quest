# Resolution: Issue #37 — DO_NOT_TOUCH.exe

> Cross-reference: `docs/issues/content-bible.md §2 (Hidden Areas H6)`, `docs/sessions/2026-04-15-game-design.md §9`

---

## Context Gathered

- Design session §9: `DO_NOT_TOUCH.exe` is Hidden Area H6 — discovered by opening it "despite every NPC saying not to." Teaches `EXEC xp_cmdshell`. Contains "notes only" (no outcast trainer).
- Content bible §2: "Open it despite every NPC saying not to." Location: OldCorp Basement.
- Content bible §5: Dagny the DBA is the proposed NPC who warns about it. "If you open it anyway, she panics. If you fix it properly, she gives you a rare item."
- This is already a *confirmed* hidden area in the outcast network. The question is just what the mechanics are.

---

## Ideas Generated

**Q1 — Quest or story beat?**

1. **Full 2-choice quest** — player can choose to open it or migrate it properly. Both are valid paths with different consequences. Opening = hidden area access + shame. Migrating properly = rare item from Dagny.
2. **Pure environmental storytelling** — no choice, just exists for flavor. Too much wasted potential.
3. **Forced story beat** — player *must* open it to progress. No, this breaks the "never blocks" rule.

**Winner: Option 1.** Two paths: proper migration (professional) vs opening it (curious/chaotic). The content bible already confirms opening it is how you access H6. The proper path should also have a reward so it doesn't feel like the punishment option.

**Q2 — Mechanics if it's a quest**

Idea A: **Open it = immediate incident battle.** The VB6 billing system wakes up. You must fight it or flee. "CRITICAL ERROR: Migration Detected."
Idea B: **Open it = horror text sequence, then EXEC xp_cmdshell learned automatically.** No battle — the "horror" is reading the code. Too passive.
Idea C: **Open it = Legacy Monolith appears as a sub-battle.** The file is executable and runs the Monolith encounter again. +1 shame from touching it.
Idea D: **Proper migration = 3-choice quiz** (which migration strategy?). Optimal solution gives Dagny's rare item. Shortcut solution keeps the system running but breaks something later.

**Winner: Idea A + D combined.** Two distinct quest paths:
- **"Open it"**: incident battle with "The VB6 Billing Horror" (special encounter, immune to cloud skills, Linux/Security only, +1 shame, teaches `EXEC xp_cmdshell` on win, flag `do_not_touch_opened = true`)
- **"Migrate it"**: 3-choice quiz (migration strategy), optimal earns Dagny's rare item (`legacy_migration_badge`), completes the main Act 3 story flag

**Q3 — What if player ignores it?**

`DO_NOT_TOUCH.exe` is an optional side element — the OldCorp migration quest completes without touching it. Dagny mentions it ("There's one service I should warn you about…"), but if you leave without interacting, Act 3 proceeds normally. The hidden area H6 just remains inaccessible.

**Q4 — Wrong choice consequences**

- Choose to open it: +1 shame, triggers VB6 Billing Horror battle. If you lose the battle: −20 HP, −10 rep, system continues running (you failed to defeat it). The billing system lives. "The invoices will be wrong for months."
- Choose wrong migration strategy: budget drain (wrong cloud tool = wasted spend), Dagny shakes her head. Retry available.
- Choose optimal migration: `EXEC xp_cmdshell` NOT learned (you migrated it away from VB6), but Dagny gives `legacy_migration_badge` which acts as a key item for a later quest.

Interesting trade-off: opening it (cursed path) teaches a powerful skill; migrating it properly (optimal) gives a different reward but closes the path to `EXEC xp_cmdshell`.

**Q5 — OldCorp CTO follow-up: "Can you also fix my home Wi-Fi?"**

1. **Joke ending line only** — one-liner after the quest, no mechanics. The correct answer.
2. **Optional side quest** — too on-the-nose, would undercut the joke.
3. **Becomes a recurring NPC gag** — he mentions his Wi-Fi in every subsequent region. Less is more.

**Winner: Option 1.** It's a punchline. Let it land and leave. Final dialog line after the OldCorp quest resolves: *"The migration is complete. Can you also fix my home Wi-Fi?" — OldCorp CTO.* That's the whole bit. Fade to black.

**Q6 — Other environmental storytelling moments**

Yes. Here's the canonical list of "mini-story, not a formal quest" moments in the game:

| Location | Object | Story |
|----------|--------|-------|
| Pipeline Pass terminal 3 | `// TODO: fix this — THROTTLEMASTER` comment | Act 1 foreshadowing |
| Staging Valley server room | `.env` file left on a staging server | "root_password: hunter2" in plain text |
| Shell Cavern, dark corner | `~/.bash_history` readable terminal | Contains someone's worst commands. Nuclear-tier stuff. |
| OldCorp Basement, unused desk | THROTTLEMASTER's old nameplate: "Karsten Ottesen, Senior Engineer" | The reveal before the reveal |
| Azure Town vending machine | `AZURE_COUPON_CODE=AZFREE100` scratched on the side | Works. Gives +50 budget. |
| Kubernetes Colosseum locker room | `kubectl get pods --all-namespaces \| grep -v Running` output pinned to wall | 47 pods. None are Running. |
| Architecture District whiteboard | A system diagram with "TODO: Add observability" sticky note | 5 years old |

These are all **sign/terminal interactions** (`type: 'sign'` in the interactions registry). No quest state, no rewards — just worldbuilding.

---

## Data Shape

```js
// src/data/quests.js — DO_NOT_TOUCH quest
do_not_touch: {
  id: 'do_not_touch',
  npc: 'dagny_dba',
  location: 'oldcorp_basement',
  act: 3,
  type: 'branch',          // new type: two distinct paths
  requiresFlags: ['act_3_started', 'oldcorp_entered'],
  excludeFlags: ['do_not_touch_resolved'],
  reminderDialog: ["There's one service I should warn you about…"],
  branches: {
    open: {
      label: "Open it anyway",
      triggerEncounter: 'vb6_billing_horror',
      onWin: {
        shameDelta: 1,
        learnSkill: 'exec_xp_cmdshell',
        setFlag: 'do_not_touch_opened',
      },
      onLoss: {
        hpDelta: -20,
        repDelta: -10,
        dialog: ["The invoices will be wrong for months.", "You couldn't contain it."],
      },
    },
    migrate: {
      label: "Migrate it properly",
      quiz: [
        { text: 'Rewrite it in Python and YOLO deploy', result: 'wrong', budgetLoss: 50 },
        { text: 'Lift and shift to Azure App Service', result: 'standard', xp: 80 },
        { text: 'Strangler fig pattern — migrate incrementally', result: 'optimal', xp: 150, itemDrop: 'legacy_migration_badge' },
      ],
      onOptimal: {
        setFlag: 'do_not_touch_migrated_optimal',
        dagnyDialog: ["That's exactly right.", "Take this — you've earned it.", "The migration badge. Wear it with pride."],
      },
      followUpLine: "Can you also fix my home Wi-Fi?",  // OldCorp CTO's closing line
    },
  },
  completionFlag: 'do_not_touch_resolved',
},
```

```js
// src/data/encounters.js — VB6 Billing Horror
vb6_billing_horror: {
  id: 'vb6_billing_horror',
  name: 'The VB6 Billing Horror',
  type: 'incident',
  domain: 'linux',        // old-school: linux/security only effective
  immuneDomains: ['cloud', 'iac', 'kubernetes', 'containers'],
  hp: 80,
  sla: 5,
  symptom: 'CRITICAL ERROR 0x80004005: Migration Detected.',
  encounterText: ['It was running since 1998.', 'It did not want to stop.'],
  onDefeat: { learnSkill: 'exec_xp_cmdshell', shameDelta: 1 },
},
```

## Files Affected

- `src/data/quests.js` — add `do_not_touch` quest with `branch` type
- `src/data/encounters.js` — add `vb6_billing_horror` encounter
- `src/data/interactions.js` — add environmental storytelling sign/terminal entries
- `src/engine/QuestEngine.js` — add `branch` quest type handling
- `src/engine/BattleEngine.js` — add `immuneDomains` support to damage calculation

## Follow-ups

- `exec_xp_cmdshell` skill needs defining in `skills.js` (cursed/nuclear tier, SQL injection themed)
- `legacy_migration_badge` key item needs defining in `items.js`
- `branch` quest type needs to be distinguished from `quiz` in QuestEngine

## Content Bible Update

> ✅ **DO_NOT_TOUCH.exe (#37):**
> - Two-path quest: open it (cursed path, +1 shame, battles VB6 Billing Horror, learns `EXEC xp_cmdshell`) vs migrate it (optimal path, quiz-based, earns `legacy_migration_badge` from Dagny).
> - Ignorable — Act 3 progresses without touching it.
> - OldCorp CTO closing line: "Can you also fix my home Wi-Fi?" — joke ending, no mechanics.
> - Environmental storytelling: 7 non-quest story moments (terminal comments, .env files, THROTTLEMASTER nameplate, etc.) defined in `interactions.js`.
