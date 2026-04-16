# Reputation & Shame

Cloud Quest tracks two independent character stats that shape your experience: **Reputation** (rebuildable) and **Shame** (permanent). Together, they determine how NPCs treat you, what content you can access, and which ending you get.

---

## Reputation

**Range:** 0–100
**Default start:** 50
**Can recover:** ✅ Yes

Reputation represents how other engineers and NPCs perceive you. It goes up when you solve problems well and down when you take shortcuts or use cursed techniques.

### How Reputation Changes

| Action | Rep Change |
|---|---|
| Cursed technique use | Variable penalty per skill (typically −8 to −20) |
| Nuclear technique use | Variable penalty per skill (typically −13 to −30) |
| SLA breach | −15 |
| Quest completion | Varies by quest |

### Reputation Effects

| Rep Level | Effect |
|---|---|
| 80–100 | NPCs offer best prices, extra dialog options, and side quests |
| 60–79 | Normal treatment |
| 40–59 | Some NPCs distrust you. Fewer side quests available. |
| 20–39 | Most NPCs refuse to help. Trainers are harder. |
| 0–19 | Only cursed trainers will talk to you. THROTTLEMASTER notices. |

### Rebuilding Reputation

Reputation is always recoverable:
- Win battles with Optimal solutions
- Complete quests cleanly
- Help NPCs with their problems
- Avoid cursed techniques for a while

---

## Shame Points

**Range:** 0+
**Default start:** 0
**Can recover:** ❌ Never

Shame Points are **permanent**. They only go up. Every cursed technique adds +1 Shame. Every nuclear technique adds +2. There is no way to reduce Shame — it's a permanent record of every line you crossed.

### How Shame Accumulates

| Action | Shame |
|---|---|
| Cursed technique use | +1 |
| Nuclear technique use | +2 |

There is currently no gameplay mitigation for Shame gain.

### Shame Thresholds

| Shame | What Happens |
|---|---|
| 0 | Clean record. NPCs trust you. |
| 1–2 | Minor flavor dialog changes. Some NPCs give you "the look." |
| 3–4 | Access to some hidden areas and cursed trainers. |
| 5 | Certain secret content becomes visible (e.g., deleted StackOverflow threads). |
| 7 | **THROTTLEMASTER makes contact.** He's been watching. He's impressed. |
| 10 | NPC dialog shifts significantly. Cursed trainers offer upgraded techniques. |
| 15 | **Alternate ending unlocked.** THROTTLEMASTER offers to recruit you. |

---

## The Interesting Middle: High Rep + High Shame

The most nuanced character state is **high Reputation AND high Shame**. You're an excellent engineer who crossed every line to get there. NPCs are confused by you. Trainers respect your skill but question your methods.

This state unlocks unique dialog and interactions that neither pure-good nor pure-evil players see.

---

## Technical Debt

**Range:** 0–10
**Cleared by:** Cleanup quests

Technical Debt is a side effect of cursed technique use. Each cursed technique may add a **Technical Debt stack**, which applies a permanent −2 Max HP debuff (up to −20 at max stacks).

Unlike Shame, Technical Debt **can** be cleared through special **cleanup quests** — side missions that represent paying down your shortcuts.

| Debt Stacks | Max HP Penalty |
|---|---|
| 0 | None |
| 1 | −2 |
| 5 | −10 |
| 10 | −20 (maximum) |

---

## The Evil Path

See [Hidden Areas](hidden-areas.md) for details on the Outcast Network and THROTTLEMASTER's storyline.

At Shame 15, you can choose to join THROTTLEMASTER and pursue the alternate "Fork the Company" ending. This is a fully viable path — the game never blocks you. It just asks: at what cost?

### Key Evil Path Moments

1. **Shame 3–4** — Outcast Network locations begin to appear
2. **Shame 7** — THROTTLEMASTER contacts you directly
3. **Shame 10** — Cursed trainers offer upgraded nuclear techniques
4. **Shame 15** — THROTTLEMASTER offers recruitment. Alternate ending available.

---

## Strategy: To Curse or Not to Curse?

**Arguments for staying clean:**
- Better XP multipliers from Optimal solutions (×2 XP)
- No Technical Debt means full HP
- Better story outcomes and NPC interactions
- Avoid permanent Shame accumulation

**Arguments for the dark side:**
- Cursed techniques bypass domain matchups entirely
- Nuclear techniques are incredibly powerful in emergencies
- The evil path has its own unique content, areas, and storyline
- THROTTLEMASTER's backstory is only available to high-Shame players
- Some of the funniest dialog in the game is locked behind Shame thresholds

**The game's design encourages experimentation.** Your first playthrough doesn't have to be perfect.

---

*"Shame is permanent. It never goes down. Every shortcut you take follows you." — Professor Pedersen*
