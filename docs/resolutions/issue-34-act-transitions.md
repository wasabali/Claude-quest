# Resolution: Issue #34 — Story Act Transitions

> Cross-reference: `docs/issues/content-bible.md §1`, `src/state/GameState.js`

---

## Context Gathered

- GameState already has `story.act` (integer) and `story.flags` (object) — the infrastructure for act transitions exists.
- Design session: Act 1 ends "when you successfully push your first app to production."
- Content bible §1: Acts outlined, triggers not yet defined. World changes per act not defined.
- Graph report: `markDirty()` is a cross-community bridge (betweenness 0.146) — any act transition must call `markDirty()` to persist the state change.

---

## Ideas Generated

**Q1 — What triggers act transitions?**

1. **Story flag triggers automatic transition** — when a specific `completedQuest` + gym flag combination is set, the game auto-advances `story.act`. No manual action. Like Pokémon — you beat the gym, the world updates.
2. **Player explicitly "reports in" to Kristoffer** — you must walk to his office and trigger the transition. More deliberate but adds a travel-back-to-NPC step.
3. **Gym count only** — advance when N gyms beaten. Ignores quests, loses narrative meaning.

**Winner: Option 1** — flag-triggered automatic transitions. Clean, invisible to the player, consistent with how quests already work.

**Act transition trigger table:**

| Act → Next | Trigger Flags | Notes |
|------------|---------------|-------|
| Prologue → Act 1 | `starter_deck_chosen` + `first_battle_won` | Leaving the lab for the first time |
| Act 1 → Act 2 | `margaret_quest_complete` + `gym_1_beaten` | "Push to Production" complete |
| Act 2 → Act 3 | `gym_2_beaten` + `gym_3_beaten` + `staging_deployed` | Both Act 2 gyms + viral moment |
| Act 3 → Act 4 | `gym_4_beaten` + `gym_5_beaten` + `do_not_touch_resolved` | All Act 3 gyms + OldCorp quest |
| Act 4 → Finale | `gym_6_beaten` + `gym_7_beaten` + `throttlemaster_unmasked` | THROTTLEMASTER revealed |

**Q2 — Cutscene or dialog at act transitions?**

1. **Full-screen dialog sequence** — black screen, title card (e.g., "ACT 2 — It Works on My Machine"), then 3–5 lines of narration. GBC-appropriate, no new scene needed.
2. **In-world: Kristoffer calls you on the phone** — a dialog box appears as if you received a message. Diegetic, cheaper.
3. **Nothing — world just changes silently** — jarring, confusing.

**Winner: Option 1** — title card + 3-line narration. Reuses `DialogBox` component. No new scene. The title card can be a simple overlay on the current scene (black background, Press Start 2P font, fade after 2 seconds via simple JS timeout).

**Act transition narration (draft):**
```
Prologue → Act 1:
"Professor Pedersen waves you off."
"The world's problems await."
"Your first commit awaits."

Act 1 → Act 2:
"Margaret's bakery went live."
"Four hours later:"
"The bakery was on the front page of HN."

Act 2 → Act 3:
"NorCloud AS has a new client."
"OldCorp. Legacy systems since 1987."
"They said: 'Don't touch anything.'"

Act 3 → Act 4:
"The migration is done."
"But something doesn't add up."
"Kristoffer knows more than he's said."

Act 4 → Finale:
"THROTTLEMASTER is Karsten Ottesen."
"Kristoffer's ex-colleague from OmniCloud."
"Now: the CTO is waiting."
```

**Q3 — World changes between acts?**

1. **NPC dialog pools keyed by act** — cheapest. NPCs have `dialogByAct` arrays. Act 2 Margaret says "Did you see the traffic spike?" Act 3 she says "I've barely slept." No tile changes needed.
2. **Visual tile changes** (e.g. Production Plains catches fire in Act 2) — expensive, requires multiple tilemap variants.
3. **New NPCs appear per act** — add new NPC IDs to a region's `actNpcs` list. Medium cost.

**Winner: Options 1 + 3 combined.** Dialog pools by act (cheap, high impact) + new NPC appearances per act (adds life). No tile redraws for MVP.

**New NPCs appearing per act:**
- Act 2: SLA Signe appears in Production Plains; THROTTLEMASTER's first terminal calling card appears in Pipeline Pass
- Act 3: Dagny the DBA appears in OldCorp Basement; Intern Ivan's Act 3 encounter activates
- Act 4: Compliance Carina appears in Azure Town; Kristoffer moves to Architecture District
- Finale: Professor Pedersen appears at The Cloud Console entrance

**Q4 — "App goes viral" mechanic**

1. **Narrative text only** — title card "The bakery was on the front page of HN." Production Plains encounter rate increases. Simple flag + encounter pool swap.
2. **Scripted battle sequence** — wave of High CPU + Disk Full encounters triggers automatically on first entry to Production Plains. Cinematic but requires scripted encounter logic.
3. **Uptime timer mini-game** — new scene. Too expensive.

**Winner: Option 2** — scripted encounter wave on first Production Plains entry after Act 2 starts. 3 encounters in a row, then SLA Signe appears and gives you the On-Call Phone. Takes 5–10 minutes of play, feels earned.

**Q5 — The 3:17am scene**

1. **Scripted dialog sequence** — after the viral wave, black screen, clock shows "03:17", 5-line narration. Reroutes to apartment. Player "wakes up" at Localhost Town.
2. **Player triggers by visiting apartment between 23:00–05:00 game time** — too complex (requires in-game clock).
3. **Just flavor text during the Production Plains crisis** — weaker moment.

**Winner: Option 1** — forced scripted sequence after the viral battle wave. The clock is a static image (tile-rendered "03:17" on black). This is one of the game's best moments; it needs to be seen by every player.

**Q6 — Professor Pedersen across acts**

He appears:
- Prologue: his lab (tutorial)
- Act 1: still in lab; available for hints
- Act 2: mentions hearing about the viral moment, gives a worried look
- Act 3: visits NorCloud office once; warns about `DO_NOT_TOUCH.exe`
- Act 4: reacts to THROTTLEMASTER reveal
- Finale: stands at Cloud Console entrance, gives a speech
- Post-game: back in his lab, studying for AZ-900 ("Exam is next Tuesday.")

He stays in his lab by default; scripted appearances are one-off dialog triggers keyed to flags.

**Q7 — Kristoffer's locations**

| Act | Location | What he does |
|-----|----------|-------------|
| Act 1 | NorCloud AS office (Localhost Town) | Assigns quests, encourages |
| Act 2 | Roams to Production Plains | Checks in during crisis, nervous |
| Act 3 | OldCorp Basement occasionally | Increasingly evasive |
| Act 4 | Architecture District | Confrontable here; confession scene |
| Finale | Absent | Mentioned in CTO's dialog |
| Post-game | NorCloud office | "I'm sorry. That's all I can say." |

His office can be visited any time; his dialog updates per act flag.

**Q8 — Kristoffer reacts to shame**

Yes. At shame thresholds:
- Shame 3: "I've heard some… concerning things about your methods."
- Shame 7: "THROTTLEMASTER contacted you, didn't he. I can tell."
- Shame 10: "You're going down the same path Karsten did. Please stop."
- Shame 15 (evil path): His Act 4 confession scene is replaced by a confrontation. "You're going to join him, aren't you."

---

## Data Shape

```js
// src/data/story.js — act transition definitions
const ACT_TRANSITIONS = {
  prologue_to_1: {
    triggerFlags: ['starter_deck_chosen', 'first_battle_won'],
    newAct: 1,
    titleCard: 'ACT 1',
    titleSub: '"Push to Production"',
    narration: [
      'Professor Pedersen waves you off.',
      'The world\'s problems await.',
      'Your first commit awaits.',
    ],
  },
  act1_to_2: {
    triggerFlags: ['margaret_quest_complete', 'gym_1_beaten'],
    newAct: 2,
    titleCard: 'ACT 2',
    titleSub: '"It Works on My Machine"',
    narration: [
      "Margaret's bakery went live.",
      "Four hours later:",
      "It was on the front page of HN.",
    ],
  },
  // ... etc
}

export const getById = (id) => ACT_TRANSITIONS[id]
export const getAll = () => Object.values(ACT_TRANSITIONS)
export const getBy = (field, value) => getAll().filter(x => x[field] === value)
```

```js
// NPC dialog by act — pattern for all story NPCs
old_margaret: {
  dialogByAct: {
    1: ["My website keeps going down!", "Can you help me?"],
    2: ["Did you see the traffic spike?", "I've been baking non-stop."],
    3: ["Things are calmer now.", "Still making bread. Still online."],
    4: ["I heard about the THROTTLEMASTER thing.", "Scary stuff."],
    finale: ["Go get 'em. The cloud needs you."],
  },
},
```

## Files Affected

- `src/data/story.js` — act transition definitions, NPC `dialogByAct` pools, Kristoffer location/dialog per act
- `src/state/GameState.js` — `story.act` field already exists ✅
- `src/engine/` — new `StoryEngine.js`: `checkActTransition(flags) → transition | null`
- `src/scenes/WorldScene.js` — check for act transitions on quest/gym completion; render title cards; scripted viral sequence; 3:17am sequence
- `src/config.js` — add `ACT_TITLES` constant

## Follow-ups

- Design the scripted Production Plains viral encounter wave (3-battle sequence)
- Design the 3:17am scene as a proper WorldScene scripted sequence
- Kristoffer's confrontation dialog for Shame ≥ 15 evil path

## Content Bible Update

> ✅ **Act transitions (#34):**
> - Triggers: story flag combinations (quest complete + gym beaten). Automatic, no manual step.
> - Presentation: full-screen title card (ACT N + subtitle) + 3-line narration. Reuses DialogBox.
> - World changes: NPC dialog pools keyed by `dialogByAct`. New NPCs appear per act (no tile redraws for MVP).
> - "App goes viral": scripted 3-battle wave on first Production Plains entry in Act 2, then 3:17am cutscene.
> - Professor Pedersen: appears across all acts via flag-triggered dialog, stays in lab by default.
> - Kristoffer: roams to relevant regions per act; confrontable in Act 4 Architecture District; reacts to shame at 3/7/10/15 thresholds.
