# Resolution: Issue #36 — NPC World Reactivity

> Cross-reference: `docs/issues/content-bible.md §5`, `src/data/story.js`

---

## Context Gathered

- Design session: "NPCs update their dialogue. Reputation controls NPC dialogue at thresholds."
- Content bible §5: Proposed `dialogByAct` pattern for Old Margaret. No other NPC has act-based dialog yet.
- Issue #34 resolution already established `dialogByAct` as the standard pattern for act-based reactivity.
- Graph report: `WorldScene` (16 edges, Community 2 with DialogBox) — NPC dialog changes are contained within WorldScene rendering; no engine involvement needed.

---

## Ideas Generated

**Q1 — Do NPCs update after quest completion?**

1. **`followUpDialog` + `dialogByAct` covers it** — quest completion sets a flag; NPC dialog checks that flag first before checking act. Same infrastructure, layered.
2. **Separate `postQuestDialog` array** — redundant with `followUpDialog` already decided in #29.
3. **Static dialog forever** — world feels dead.

**Winner: Option 1** — the resolution from #29 (`followUpDialog`) already covers quest NPCs. Act-based dialog handles world progression. Flag checks handle edge cases. One unified system.

**Q2 — Narrative callbacks (Old Margaret at the finale)?**

1. **Act 5 `dialogByAct` entry for each side-quest NPC** — every completed side quest NPC gets a one-liner in Finale that references their resolution.
2. **Physical appearance at Cloud Console finale** — NPCs show up as a crowd sprite. Technically complex.
3. **No callbacks** — missed opportunity.

**Winner: Option 1** — one-liner `dialogByAct[finale]` per completed NPC. "Your server's been running for a year now." (Margaret). "The tests haven't flaked since." (Dave). Cheap, rewarding. Triggered only if quest was completed (`requiresFlags: ['{quest}_complete']`).

**Q3 — Shame reactions: global or specific NPCs?**

1. **Specific named NPCs only** — only NPCs who "would know" react: Professor Pedersen, Kristoffer, Ola the Ops Guy (your first trainer), any gym leader you've beaten. Generic NPCs say nothing.
2. **Global dialog shift for all NPCs** — unrealistic (how does a random encounter NPC know about your repo?)
3. **Region-specific NPCs** — too complex to maintain.

**Winner: Option 1** — shame reactions are personal. The people who trained you react. A `shameDialog` pool per NPC activated at thresholds from `SHAME_THRESHOLDS` in `config.js`.

**Shame reaction NPC table:**

| NPC | Shame 3 | Shame 7 | Shame 10 |
|-----|---------|---------|----------|
| Professor Pedersen | "I heard about what you did to the repo… I'm disappointed." | "He's contacted you, hasn't he. Be careful." | "I can't watch you go down this path." |
| Kristoffer | "Some… concerning reports about your methods." | "THROTTLEMASTER reached out to you? I can tell." | "You're going down Karsten's path. Please stop." |
| Ola the Ops Guy | "Some people are talking about your techniques." | "I won't comment. But I heard things." | "You're not who I thought you were." |
| Gym leaders (beaten) | "I've heard about you…" (pre-battle only) | Same | Refuses to teach (Shame ≥ 10) |
| Cursed trainers | "You're finally learning the right way." | "I had a feeling about you." | "Welcome to the dark side. We have root access." |

**Q4 — Kristoffer reacts to shame** — addressed in #34 resolution above. ✅

**Q5 — Shop prices and reputation**

1. **Reputation tiers affect prices** — `rep ≥ 60`: base price; `rep 40–59`: +10%; `rep 20–39`: +25%; `rep < 20`: +50% (or some shops refuse to serve you). This is already partially decided in the #13 resolution.
2. **Flat prices, reputation irrelevant to economy** — simpler but loses a mechanic.
3. **Reputation gives discounts (not penalties)** — frame it as "high rep earns deals" rather than "low rep pays more." Better player experience.

**Winner: Option 3** — reputation grants discounts: `rep ≥ 80`: −15% prices; `rep 60–79`: base; `rep < 40`: +15% surcharge; `rep < 20`: shops refuse to deal with you directly (must use a vending machine). Consistent with #13 resolution.

**Q6 — Post-Act 1 Localhost Town updates**

Old Margaret `dialogByAct[2]`: "Did you see that traffic spike? Unbelievable!" Ola `dialogByAct[2]`: "You shipped to prod? Now the real work starts." Professor Pedersen `dialogByAct[2]`: "I heard about the viral moment. Don't let it go to your head."

**Q7 — Post-THROTTLEMASTER-reveal Kristoffer dialog**

Kristoffer in Act 4 (Architecture District) after `throttlemaster_unmasked` flag:
- "It was Karsten. I knew, and I said nothing. I'm sorry."
- "We worked together at OmniCloud. He was brilliant."  
- "When they promoted me instead of him… something broke."
- (Player choice: "Was it worth it?" → Kristoffer: "I don't know.")

**Q8 — Field trainer rematches**

1. **Yes, rematches available post-game** — trainers have a `rematchDeck` array; after the finale, all trainers offer a harder rematch. Simple data addition.
2. **No rematches** — misses a post-game hook.
3. **Rematches available after beating their region's gym** — mid-game rematches, not just post-game.

**Winner: Option 1** — post-game only. Adds replay value cheaply. Rematch gives +50% XP compared to first fight. Rematch dialog: "You're back. Good. I've been training."

**Q9 — Cursed trainers react to technique use**

Yes. Each cursed trainer has a `techniqueUsedDialog` field:
- The Force Pusher: "Ah, you've found the path of least resistance. Fewer approvals, more chaos."
- Skip-Tests Sigrid: "Tests. Are. Waste. Of. Time. You understand now."
- rm-rf Rune: "You've used it. There's no coming back from rm -rf. Welcome."

This triggers once, on first battle after learning and using their skill. `story.flags['acknowledged_{trainer_id}'] = true` prevents repeat triggers.

---

## Data Shape

```js
// Extension to all NPC entries in src/data/story.js
old_margaret: {
  id: 'old_margaret',
  location: 'localhost_town',
  dialogByAct: {
    1: ["My website keeps going down!", "Can you help?"],
    2: ["Did you see that traffic spike?", "Unbelievable."],
    3: ["Things are calmer now.", "Still making bread. Still online."],
    4: ["I heard about the THROTTLEMASTER thing.", "Scary stuff."],
    finale: ["Go get 'em!", "The cloud needs you."],
  },
  followUpDialog: ["The website's been running for 3 days!", "You're a lifesaver!"],  // after quest_complete flag
  shameDialog: {
    3: null,   // Margaret doesn't react to Shame 3 — she's not technical
    7: null,
    10: null,
  },
  rematchDeck: null,  // not a trainer, no rematch
  techniqueUsedDialog: null,
},

// Cursed trainer example
force_pusher: {
  id: 'force_pusher',
  // ...existing fields...
  techniqueUsedDialog: [
    "Ah, you've found the path of least resistance.",
    "Fewer approvals, more chaos.",
    "Rules are for people who didn't write the code.",
  ],
  techniqueUsedFlag: 'acknowledged_force_pusher',
},
```

## Files Affected

- `src/data/story.js` — add `dialogByAct`, `shameDialog`, `techniqueUsedDialog`, `rematchDeck` to all NPC entries
- `src/scenes/WorldScene.js` — dialog resolution: check `techniqueUsedFlag` → check `followUpDialog` → check `shameDialog` threshold → check `dialogByAct[currentAct]` → fallback to default
- `src/data/trainers.js` — add `rematchDeck` to all field trainers
- `src/data/items.js` — shop reputation pricing flag (or handled in `ServiceCatalogScene`)

## Follow-ups

- Define `dialogByAct` entries for all 8 existing trainers (currently have none)
- Define `rematchDeck` for all 8 field trainers (post-game content)
- Cursed trainer `techniqueUsedDialog` for all 10 existing cursed trainers

## Content Bible Update

> ✅ **NPC world reactivity (#36):**
> - All NPCs support `dialogByAct`, `followUpDialog` (post-quest), `shameDialog` (threshold-keyed), `rematchDeck` (post-game), `techniqueUsedDialog` (cursed trainers only).
> - Shame reactions are personal: only NPCs who trained you or know you react (Pedersen, Kristoffer, Ola, gym leaders beaten, cursed trainers).
> - Shop reputation pricing: rep ≥ 80 = −15%; rep 60–79 = base; rep < 40 = +15%; rep < 20 = refused service (vending machine only).
> - Field trainer rematches available post-game, harder decks, +50% XP.
> - Cursed trainers react once on first technique use (flag-gated).
> - Post-finale: all completed side-quest NPCs have a one-liner `dialogByAct[finale]` callback.
