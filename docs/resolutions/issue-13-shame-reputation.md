## Resolution — Shame Points & Reputation

After staring at this issue for three hours at 2:47 AM with cold coffee, here is the full design for Shame and Reputation mechanics. Every decision traces back to your inline answers.

---

### Q1 — Shame Threshold Effects

#### 🔻 1 Shame: Pedersen Sighs

Professor Pedersen gains a new dialogue variant. Cursed locations become visible on the map (greyed-out markers with `?` icons). No gameplay change — just *awareness* that the dark side exists.

#### 🔻 3 Shame: "I Heard About What You Did"

A **pool of 15+ one-liners** randomly selected per NPC interaction. NPCs don't change behaviour — they just... *comment*.

**Examples (per scenario flavor):**

*General disgust:*
1. `"I heard what you did to that repo. We all heard."`
2. `"The postmortem channel has your name in bold."`
3. `"Someone left a screenshot of your git log in the break room."`
4. `"HR says you are not technically a war criminal."`
5. `"The CEO mentioned you by name in the all-hands. Not in a good way."`

*Technical horror:*
6. `"Did you... did you really chmod 777 production?"`
7. `"The firewall team printed your commit and hung it in their office. As a warning."`
8. `"Three services went down. They are calling it your name now."`
9. `"The SRE team made a drinking game out of your incidents."`
10. `"Legend says if you type your name in the terminal three times, an alert fires."`

*Grudging respect:*
11. `"I hate that what you did actually worked."`
12. `"The interns think you are cool. The seniors are concerned."`
13. `"That was the worst best fix I have ever seen."`

**Data shape** (new pool in `src/data/story.js`):

```js
export const SHAME_ONE_LINERS = {
  shame_3: [
    { id: 'shame3_01', text: 'I heard what you did to that repo. We all heard.', tone: 'disgust' },
    { id: 'shame3_02', text: 'The postmortem channel has your name in bold.', tone: 'disgust' },
    // ...
  ],
  shame_5: [ /* see below */ ],
  shame_10: [ /* see below */ ],
}
```

Selection: `seededRandom` picks from pool based on `npcId + shamePoints + location` seed. Same NPC says the same thing on repeated visits (until shame changes).

#### 🔻 5 Shame: "Person of Interest" — Trainers Use Cursed Skills

**Scrapped**: "trainers get harder" (boring stat inflation).

**New mechanic**: Named trainers start **using cursed techniques against you**. They've heard about your methods and decided to fight fire with fire.

- Trainers add 1 random cursed skill to their deck (from their own domain).
- They announce it before using: `"You taught me something. Watch this."`
- The trainer's cursed skill usage is marked in their post-battle dialogue: `"Don't look at me like that. You started it."`
- Wild encounters (incidents) are unaffected — incidents don't have moral opinions.

**One-liners for 5 shame:**
1. `"The Throttlemaster sends their regards. Here is my card."`
2. `"You have been flagged in the vendor risk assessment."`
3. `"Welcome to the watchlist. Snacks are in the back."`
4. `"Even the load balancer knows your name now."`
5. `"The firewall has a rule specifically for you. Rule #1: Deny."`

**Gameplay effect**: This makes the player's own escalation boomerang back at them. Funny and karmic.

#### 🔻 7 Shame: Throttlemaster Contact

Already defined. The Throttlemaster reaches out through encrypted NPC dialogue. Opens the quest to find all 6 Outcast locations.

#### 🔻 10 Shame: Shadow Engineer — The Transformation

**Title**: "Shadow Engineer" replaces current title permanently.

**The Holy Grail Skill**: `sudo chmod 777 /` is already in the game as a cursed technique (`chmod_777`). But for Shadow Engineer, we go bigger. The true "worst skill in the game" is **`EXEC xp_cmdshell`** — already defined at 999 damage, 3 shame per use, -20 reputation, and "the game asks three times if you are sure." This is the nuclear football. At Shame 10, it becomes **learnable without visiting the Outcast** — the Shadow Engineer just *knows*.

However, at 10 shame the player has likely earned most outcast skills already. So the Shadow Engineer unlock is **also** a **mutation of the player themselves**:

**Appearance change**:
- Player sprite swaps to `shadow_engineer` variant: dark circles under eyes, coffee cup permanently in hand, hoodie up
- Overworld sprite leaves a trail of faint `☕` particles (2-frame flicker, GBC style)
- Battle idle animation: player occasionally takes a sip of coffee mid-turn

**New passive effect**: `SHADOW_FATIGUE`
- All optimal-tier skills cost +10 budget (coffee is not free)
- All cursed-tier skills cost -5 budget (you are... efficient now)
- Heal items restore 20% less (your body runs on caffeine)
- New battle option: `☕ Sip Coffee` — skip turn, restore 15 HP. Always available. Uses no skill slot.

**One-liners for 10 shame:**
1. `"You don't look like an engineer anymore. You look like a consequence."`
2. `"The coffee machine fears you. It brews when you walk by. Unprompted."`
3. `"Your LinkedIn changed to Shadow Engineer and somehow got more recruiter messages."`
4. `"You have mass. Gravitational. Services orbit around you now."`
5. `"Legend. Shadow. Liability. HR uses all three."`

#### 🔻 15 Shame: Secret Ending

Already defined. The alternate ending becomes accessible. The Throttlemaster offers one final "job."

---

### Q2 — Emblem Grime

**Decision**: Grime applies to **ALL earned emblems**, not just the relevant domain.

When you use a cursed technique, every emblem you own gets `grime += 0.05`. The shame stains everything. You can't contain it.

**Rationale**: This creates a real cost to the evil path. Players who want shiny emblems *and* cursed power have to choose, or invest heavily in the polish minigame.

If a player has 4 earned emblems and uses 1 cursed technique: `4 × 0.05 = 0.20` total grime added across their collection.

---

### Q3 — Redemption Mechanic

**Shame itself never decreases.** It's a permanent record. But what shame *damages* can be repaired:

**Technical Debt Redemption** — `Cleanup Quests`:
- Available from Act 2 onward at the "Runbook Library"
- NPC "The Tech Debt Auditor" assigns refactoring quests
- Each quest clears 1 stack of technical_debt
- Quest examples: "Fix the YAML the intern wrote", "Resolve 3 `TODO: fix later` comments", "Write a runbook for the thing nobody documented"
- Completing all 10 debt quests earns the **"Clean Slate"** emblem variant (not a new emblem — a visual override on the SRE emblem)

**Reputation Redemption** — `Atonement Actions`:
- Winning battles with ONLY optimal-tier skills: +3 reputation
- Resolving incidents under half SLA time: +2 reputation
- Completing side quests: +1-5 reputation depending on quest
- Teaching skills to NPCs (new mechanic — share non-cursed skills): +2 reputation

**What cannot be redeemed**: Shame count, Shadow Engineer title (if earned), emblem grime (must be polished manually in the emblem minigame).

---

### Q4 — Shame Cap

**Mechanical cap at 10 = Shadow Engineer title.** Shame points can still accumulate above 10 for stat tracking, but no new mechanical effects trigger above 10 (except the 15-threshold for the secret ending).

Updated threshold table:

| Shame | Effect |
|---|---|
| 1 | Cursed locations visible, Pedersen sighs |
| 3 | NPC one-liners from shame pool |
| 5 | "Person of Interest" title, trainers mirror cursed skills, Throttlemaster card |
| 7 | Throttlemaster direct contact, outcast quest chain |
| 10 | "Shadow Engineer" title + appearance change + coffee passive + `EXEC xp_cmdshell` auto-learned. Grime rate doubles to 0.10/use |
| 15 | Secret ending accessible |

---

### Q5 — Mandatory Cursed Technique?

**Decision**: No mandatory cursed technique in the main story. There is *always* a non-cursed route.

**However**: One specific side quest in the Outcast Network *requires* a cursed technique to enter (`DO_NOT_TOUCH.exe` literally requires running a cursed command). This content is 100% optional and clearly labeled as "you know what you are doing."

The game *tempts* the player with cursed shortcuts:
- Act 2 has a time-pressure quest where the cursed solution is 3 turns faster
- Act 3 has an NPC who says "I'll only respect you if you've been to the dark side"
- But you can always say no and the game doesn't punish you for it

This preserves the core design: **cursed techniques are a choice, not a requirement.**

---

### Q6 — Reputation Range

**Decision**: Starts at 50. Range 0–100. Goes up and down naturally.

Starting at 50 means you're an unknown quantity. Not trusted, not distrusted. An intern with potential.

**Fun things to do with reputation levels:**

| Range | Title | Effects |
|---|---|---|
| 90-100 | "Distinguished Engineer" | Shop discounts 20%. NPCs offer bonus quests. Trainers give hints before battle. |
| 80-89 | "Senior Engineer" | Trainers teach signature skill on *any* win (not just optimal). |
| 60-79 | "Competent Engineer" | Normal gameplay. NPCs are professional. |
| 40-59 | "Adequate Engineer" | Starting zone. NPCs are neutral-to-polite. |
| 20-39 | "Liability" | Shop prices +20%. Some NPCs refuse to give hints. Trainers don't teach after battle. |
| 0-19 | "Walking Incident" | NPCs physically move away when you approach. The intern follows you around apologizing. Shops charge +50%. |

Updated `REPUTATION_THRESHOLDS` in `config.js`:
```js
export const REPUTATION_THRESHOLDS = [
  { min: 90, status: 'Distinguished Engineer', shopMod: -0.20, teachOnAnyWin: true },
  { min: 80, status: 'Senior Engineer',        shopMod: -0.10, teachOnAnyWin: true },
  { min: 60, status: 'Competent Engineer',     shopMod:  0,    teachOnAnyWin: false },
  { min: 40, status: 'Adequate Engineer',      shopMod:  0,    teachOnAnyWin: false },
  { min: 20, status: 'Liability',              shopMod:  0.20, teachOnAnyWin: false },
  { min:  0, status: 'Walking Incident',       shopMod:  0.50, teachOnAnyWin: false },
]
```

---

### Q7 — Permanent Reputation Damage

**Decision**: Scrapped. No actions cause *permanent* reputation damage. All reputation loss is rebuildable via the atonement actions in Q3.

Cursed/nuclear skills still cause reputation loss per use (as defined in `sideEffect.reputation`), but the player can always climb back.

---

### Q8 — NPC Snarkiness by Reputation

NPCs have reputation-variant dialogue. The `story.js` variant system already supports `reputationMin`/`reputationMax` conditions. We just need more variants.

**Snarkiness tiers with examples:**

**0-19 (Walking Incident):**
- Professor Pedersen: `"Ah. You. The one my insurance company called about."`
- Shop NPC: `"Cash only. And I'm counting it twice."`
- Random Intern: `"My mentor said I should not talk to you. But... is it true about the firewall?"`
- Ola the Ops Guy: `"I changed the root password again. No, you may not know why."`

**20-39 (Liability):**
- Professor Pedersen: `"I see you have chosen... a path."`
- Shop NPC: `"Surge pricing is active. Just for you."`
- Random Intern: `"Are you the one who triggered the rollback? Twice?"`

**40-59 (Adequate — starting zone, neutral):**
- Professor Pedersen: `"You show potential. That is the nicest thing I can say right now."`
- Shop NPC: `"Welcome! Standard prices, no surprises."`

**80-100 (Distinguished):**
- Professor Pedersen: `"I mentioned you in my keynote. You are welcome."`
- Shop NPC: `"For you? Discount. Always."`
- Random Intern: `"Can you sign my laptop?"`

---

### Q9 — Reputation Repair

**Decision**: Yes, reputation is fully repairable. See Q3 "Atonement Actions" above.

Key repair actions:
- Optimal-tier battle wins: +3 rep
- Fast incident resolution: +2 rep
- Side quests: +1 to +5 rep
- Teaching skills to NPCs: +2 rep
- Emblem polishing: +1 rep per shine level gained

Max theoretical rep gain per battle: +5 (optimal win + fast resolution).

---

### Q10 — Uptime vs Reputation

**Decision**: **Scrap Uptime as a separate stat.** It's redundant with Reputation.

`longestUptime` in `stats` stays as a *stat tracker* (like `battlesWon`) — it's a high score, not a live resource. It tracks "most consecutive battles won without an SLA breach." It shows in the stats screen and can trigger an emblem variant ("99.999% Uptime" polish on the SRE emblem).

It does NOT:
- Appear in the HUD
- Affect NPC behavior (that's Reputation's job)
- Act as a gating mechanism

---

### Files Affected

| File | Changes |
|---|---|
| `src/config.js` | Update `REPUTATION_THRESHOLDS` with `shopMod`, `teachOnAnyWin`. Add `SHADOW_ENGINEER` passive constants. |
| `src/state/GameState.js` | No structural changes (fields already exist). |
| `src/data/story.js` | Add `SHAME_ONE_LINERS` pool. Add reputation-variant NPC dialogues. |
| `src/data/skills.js` | No changes — existing skills are sufficient. |
| `src/data/items.js` | Add `☕ Sip Coffee` battle item (or handle as special action in BattleEngine). |
| `src/engine/BattleEngine.js` | Shadow Engineer passive: coffee sip action, budget cost modifiers. Trainer cursed-mirror AI at shame 5+. |
| `src/engine/SkillEngine.js` | Apply grime to all earned emblems on cursed use. Reputation-based XP/teach modifiers. |
| `src/engine/StatusEngine.js` | `SHADOW_FATIGUE` passive status (permanent, shame 10+). |
| Content bible | Update with all decisions above. |

### Follow-ups

- [ ] New issue: Design the "Tech Debt Auditor" NPC and cleanup quest chain
- [ ] New issue: Shadow Engineer sprite variant (pixel art spec)
- [ ] New issue: Implement coffee sip battle action
- [ ] New issue: Write full shame one-liner pool (target: 15+ per threshold)
- [ ] New issue: Trainer cursed-skill-mirror AI at shame 5+

### Content Bible Update

Add section **"5.1 Shame & Reputation Mechanics"** with:
- Full threshold table (updated from above)
- Redemption rules (debt quests, atonement actions)
- Shadow Engineer transformation spec
- Emblem grime rules (all earned emblems, 0.05 per cursed use, 0.10 at shame 10+)
- NPC snarkiness tiers with dialogue guidelines
- Uptime → stat tracker only (not a live resource)
