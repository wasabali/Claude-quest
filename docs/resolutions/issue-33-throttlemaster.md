# Resolution: Issue #33 — THROTTLEMASTER Villain Design

> Cross-reference: `docs/issues/content-bible.md §9`, `docs/sessions/2026-04-15-game-design.md §8`

---

## Context Gathered

- Design session: "Real name starts with K. Contacts player at Shame 7. Recruits at Shame 15."
- Content bible §9: Three real-name proposals (Karsten, Klaus, Kåre). Three appearance ideas. Confirmed motivation: passed over for promotion at OmniCloud Corp.
- Confirmed: Finding all 6 hidden areas unlocks THROTTLEMASTER's Workstation with his full backstory.
- Graph report: `BattleScene` (18 edges) and `WorldScene` (16 edges) are god nodes — any pre-battle taunt system needs to hook in carefully.

---

## Ideas Generated

**Q1/Q2 — World presence before reveal**

1. **Invisible hand + calling cards** — never visible as an NPC, but his fingerprints are everywhere: `/* THROTTLEMASTER WAS HERE */` comments in terminals, rate-limited encounters in tampered regions, NPCs mention "the throttling." During battles in tampered areas, a text popup appears mid-fight: *"Your latency has been increased. — T"*
2. **Mysterious hooded NPC that appears then vanishes** — appears briefly at the edge of screen during major story beats, gone when approached. GBC-style ghost effect (2-tile flicker).
3. **Pure off-screen presence** — only text references, no visual. Cheaper but less impactful.

**Winner: Option 1 + 2 combined.** Calling cards everywhere (cheap, funny), plus a ghostly appearance during the Act 2 crisis scene (dramatic). This uses existing dialog box infrastructure for the taunts and requires no new engine work — just flavor text in the encounter data and a scripted WorldScene moment.

**Q3 — Does player fight THROTTLEMASTER before Act 4?**

1. **No direct fight pre-reveal** — he's too smart to be caught. He sabotages from a distance. The mystery builds.
2. **One "phantom battle" in Act 2** — player fights a `rate_limited_encounter` where he taunts and then disconnects before you can win. Can't be defeated, timer expires, he escapes. Memorable.
3. **Full fight in Act 3 that he throws** — he lets you "win" to keep up appearances. Revealed later.

**Winner: Option 2.** A battle you *cannot win* is one of the great RPG moments. The encounter timer hits 0, he disconnects, you get a taunt message. No XP, but it sets up Act 4's real fight.

**Q4 — The Reveal**

1. **Player finds his notes in the hidden workstation** — investigation-based. Satisfying if player did the hidden areas. Shown to Professor Pedersen to change the ending.
2. **Kristoffer breaks down and confesses** — dramatic dialog scene in the NorCloud office. Accessible to all players.
3. **THROTTLEMASTER reveals himself during the Act 4 gym gauntlet** — dramatic mid-dungeon reveal.

**Winner: Options 1 + 2 combined.** High-shame players who found the workstation get the full reveal with notes. Everyone else gets Kristoffer's confession in Act 4 as the main story beat. Two reveal paths with different emotional tones.

**Q5/Q6 — Boss fight and arrest**

1. **Yes, full boss fight at end of Act 4** — 2-phase fight (rate limiting + resource exhaustion). Then dialog: Compliance Carina arrives, makes the arrest. Played for laughs — she's been monitoring him the whole time.
2. **No boss fight — Kristoffer turns him in** — dialog-only resolution. Anti-climactic.
3. **Player choice: fight or let him go** (if Shame ≥ 10) — most interesting but complex.

**Winner: Option 3** — gives the Shame system real narrative weight. Low shame: standard boss fight + arrest. High shame (≥10): option to let him go or join him. This gates content meaningfully.

**Q7 — Visual design**

Recommendation from the three proposals:
- **Base look:** Normal-looking engineer in a hoodie (relatable; the joke is he looks exactly like a burned-out senior engineer)
- **Distinctive element:** Always wears an OmniCloud Corp lanyard (company that was shut down). The lanyard is a plot clue for sharp-eyed players.
- **Battle sprite:** GBC 16×24px, dark hoodie, backlit terminal glow on face. 2-frame idle animation: shoulder slump → slightly less slump.
- **Post-reveal:** Loses the hood sprite. Now just "Karsten" — sad, middle-aged, holding a coffee.

**Q8 — Spoken lines (selected)**

```
Act 1 (terminal flavour): "/* TODO: fix this someday — THROTTLEMASTER */"
Act 2 battle taunt (appears mid-battle):
  "Your pipeline is now running in degraded mode."
  "Don't worry. You'll never catch me."
  "CONNECTION TIMEOUT"  [battle ends, he escapes]
Act 2 crisis scene: "I see you're on-call tonight. Good luck with that."
Act 3 terminal: "/* THROTTLEMASTER WAS HERE. OmniCloud Corp — never forget. */"
Act 4 reveal (low shame):
  "You want to know why I do this?"
  "I was the best engineer at OmniCloud."
  "They promoted Kristoffer instead."
  "So I decided: if the cloud can't be fair..."
  "...I'll throttle everyone to my level."
Act 4 reveal (high shame, ≥ 7):
  "I've been watching you, [name]."
  "You understand, don't you? Sometimes the wrong tool"
  "...is the only one that works."
Shame ≥ 15 recruitment:
  "Join me. We'll fork NorCloud."
  "You've already crossed every line I have."
  "I just crossed them first."
Post-defeat (standard):
  "...I just wanted to be recognised."
  "Was that so hard?"
Evil ending:
  "Welcome to the team, [name]."
  "Your first task: throttle Production Plains."
  "I'll handle the invoicing."
```

**Q9 — Real name**

**Karsten** wins. "Karsten was your colleague once. Now he's everyone's problem." It's mundane and Norwegian — the joke is that the villain is just a guy with a grudge and a rate limiter. His full name is **Karsten Ottesen**.

---

## Data Shape

```js
// src/data/story.js — THROTTLEMASTER NPC entry
throttlemaster: {
  id: 'throttlemaster',
  realName: 'Karsten Ottesen',
  displayName: 'THROTTLEMASTER',
  postRevealName: 'Karsten',
  domain: null,  // no domain — uses rate limiting as his mechanic
  sprite: 'throttlemaster_hooded',
  postRevealSprite: 'throttlemaster_unhooded',
  actFirstAppearance: 2,
  shameContact: 7,
  shameRecruitment: 15,
  // Dialog pools keyed by act + shame range
  dialogPools: {
    act2_taunt: [
      "Your pipeline is now running in degraded mode.",
      "I see you're on-call tonight. Good luck with that.",
      "/* THROTTLEMASTER WAS HERE */",
    ],
    act3_taunt: [
      "Still haven't figured it out?",
      "You're better than this team deserves, [name].",
    ],
    act4_reveal_low_shame: [ /* ... */ ],
    act4_reveal_high_shame: [ /* ... */ ],
    recruitment: [ /* ... */ ],
  },
},
```

```js
// src/data/encounters.js — phantom battle entry
throttlemaster_act2_escape: {
  id: 'throttlemaster_act2_escape',
  name: 'THROTTLEMASTER',
  type: 'scripted',       // not a normal encounter — cannot be won
  sla: 3,                 // 3 turns then he disconnects
  hp: 9999,               // effectively invulnerable
  onSlaExpiry: 'throttlemaster_escape_sequence',  // triggers scripted dialog
  escapeLine: "CONNECTION TIMEOUT — See you at the next incident.",
},
```

## Files Affected

- `src/data/story.js` — THROTTLEMASTER NPC definition, dialog pools
- `src/data/encounters.js` — phantom battle entry
- `src/scenes/WorldScene.js` — ghostly 2-tile sprite flicker at Act 2 crisis moment
- `src/scenes/BattleScene.js` — hook for mid-battle taunt injection (Act 2 tampered regions)
- `src/engine/BattleEngine.js` — scripted encounter handling (escape on SLA expiry)
- `src/config.js` — `SHAME_THRESHOLDS` already has 7 and 15 entries ✅

## Follow-ups

- Design the 2-phase Act 4 boss fight mechanics (rate limit phase + resource exhaustion phase)
- Design Compliance Carina's arrest dialog sequence
- Define "OmniCloud Corp" lore for the terminal calling cards

## Content Bible Update

> ✅ **THROTTLEMASTER (#33):**
> - **Real name:** Karsten Ottesen. Mundane. That's the joke.
> - **Appearance:** Dark hoodie, OmniCloud Corp lanyard (plot clue), backlit terminal glow. Post-reveal: just a tired guy with a coffee.
> - **World presence:** Calling cards in terminals (`/* THROTTLEMASTER WAS HERE */`), rate-limited encounters in tampered regions, mid-battle taunts. Brief ghostly overworld appearance at Act 2 crisis.
> - **Act 2 phantom battle:** A scripted 3-turn encounter you *cannot win* — he disconnects before you defeat him. No XP.
> - **Reveal:** Two paths — high-shame players find his workstation notes; everyone else gets Kristoffer's confession in Act 4.
> - **Act 4 boss:** 2-phase fight. Low-shame: fight + Compliance Carina arrest (played for laughs). Shame ≥ 10: option to let him go or join him.
> - **Recruitment message:** Dialog in his phantom battle + direct message at Shame 7.
> - **Key lines:** "If the cloud can't be fair, I'll throttle everyone to my level."
