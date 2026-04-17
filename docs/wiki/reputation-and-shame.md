# Reputation & Shame

Cloud Quest tracks two independent character stats that shape your experience: **Reputation** (rebuildable) and **Shame** (permanent-ish). Together they determine how NPCs treat you, what content you can access, and which ending you get.

---

## Reputation

**Range:** −100 to 100  
**Default start:** 50  
**Can recover:** ✅ Yes — fully

Reputation represents how other engineers and NPCs perceive you. It goes up when you solve problems well and down when you take shortcuts or use cursed techniques. Unlike Shame, Reputation is always rebuildable — even from deep in the negatives.

### How Reputation Changes

| Action | Rep Change |
|---|---|
| Optimal solution | +10 |
| Standard solution | +3 |
| Shortcut solution | −5 |
| Cursed technique | Variable (typically −8 to −20) |
| Nuclear technique | Variable (typically −13 to −30) |
| SLA breach | −10 |
| Engineer battle win (optimal) | +8 |
| Engineer battle loss | −5 |

### Reputation Status Labels

| Score | Status | How NPCs Treat You |
|---|---|---|
| 80–100 | Distinguished Engineer | Extra dialog, best prices, side quests offered |
| 60–79 | Competent Engineer | Normal treatment |
| 40–59 | Adequate Engineer | Some side quests hidden |
| 20–39 | Liability | NPCs are unhelpful, trainers are terse |
| 0–19 | Walking Incident | Only cursed trainers deal with you |
| −1 to −25 | Known Incident | NPCs are openly snarky — "Oh. It's you." |
| −26 to −50 | Do Not Pair With | NPCs actively avoid you — "I was just leaving." |
| −51 to −100 | The Reason We Have Runbooks | Your name is now a cautionary tale. Runbooks cite you by name. |

### Rebuilding Reputation

Reputation is always recoverable — even from −100:
- Win battles with Optimal solutions (+10 each)
- Complete quests cleanly
- Help NPCs with their problems
- Avoid cursed techniques for a while

---

## Shame Points

**Range:** 0+  
**Default start:** 0  
**Can recover:** ✅ Slightly — see Redemption below

Shame Points are semi-permanent. They go up when you use cursed or nuclear techniques and only come down through deliberate effort. Every shortcut follows you.

### How Shame Accumulates

| Action | Shame |
|---|---|
| Cursed technique use | +1 |
| Nuclear technique use | +2 |

### Shame Thresholds

| Shame | What Happens |
|---|---|
| 0 | Clean record. NPCs trust you. |
| 1–2 | Minor flavour dialog changes. Pedersen sighs. Cursed locations become faintly visible. |
| 3–4 | NPCs start dropping **random one-liners** about what you did — different every visit. The intern looked at your commit history and closed the tab pretty fast. |
| 5 | **Person of Interest** title. Access to the full cursed trainer network. Three AM Tavern fully active. Trainers start mirroring cursed techniques back at you. |
| 7 | **THROTTLEMASTER makes contact.** He's been watching. He's impressed. Cursed outcast network opens fully. |
| 10 | **Shadow Engineer** title. Visual change: you now look permanently tired and always want coffee. Gym leaders refuse to teach their signature skills after defeat. Unlocks the holy grail skill: `kubectl delete ns production --grace-period=0 --force`. |
| 15 | **Alternate ending unlocked.** THROTTLEMASTER offers to recruit you. The evil path is complete. |

### Shame Threshold: 3–4 — The One-Liner Pool

At shame 3–4, NPCs don't repeat the same line about you. They have a **pool of reactions** that rotate — different each visit. Once you hit shame 5, dedicated escalating responses kick in instead.

Examples from the pool:

- *"I heard about what you did to the repo. You know that `git reflog` exists, right?"*
- *"Someone told me what happened in prod last week. ...We don't need to talk about it."*
- *"I can't believe you committed directly to main. Professor Pedersen is inconsolable."*
- *"So I heard about the force push. The whole team had to re-clone. You know that?"*
- *"The intern cried. Just so you know. After your last deployment."*
- *"Three people filed Jira tickets about you. Personally. About you."*

### Shame Threshold: 5 — Trainers Use Cursed Skills

At Shame 5, normal trainers start occasionally using cursed skills themselves. They've heard about you. They're not playing fair anymore. This makes battles harder without changing trainer stats — it's behavioural, not numerical. You made the world worse; now it fights back.

### Shame Threshold: 10 — Shadow Engineer

Reaching 10 Shame earns you the **Shadow Engineer** title and a visual change. Your sprite now looks permanently exhausted and is depicted with a coffee cup. The flavour text on your skill menu changes. Trainers treat you differently — some with fear, some with respect, some with a mix of both.

More importantly: you unlock the **holy grail skill**:

> **`kubectl delete ns production --grace-period=0 --force`**  
> The move that ends careers and starts legends. Instant win. −50 rep. +3 shame. Your name goes in the runbook.

This skill can only be used if you have 10+ Shame Points.

---

## Emblem Grime

Every time you gain Shame Points, **all earned emblems** accumulate grime:

```
+0.05 grime per shame point gained, per earned emblem
```

This is a visible consequence — your achievements literally get dirty from your choices. The Emblem polish minigame lets you clean them, but the grime keeps coming if you keep sinning.

---

## Shame Redemption

Shame is not truly permanent anymore — but reducing it requires real effort:

### Item: Coffee and an Apology
- A lukewarm coffee and a sticky note that says "sorry about the deploy."
- Reduces 1 Shame Point when used from the inventory.
- Rare drop from cleanup quests and specific hidden vendors.
- *"The coffee is bad. The apology is genuine. Mostly."*

### Item: Published Post-Mortem
- A blameless post-mortem you wrote about your own mistakes.
- Reduces 1 Shame Point when used.
- Obtained by completing specific story quests.
- *"You named your mistakes. People read it. The damage is done, but at least you owned it."*

> Redemption is real, but it's slow. You earned the Shame one bad decision at a time. You'll un-earn it one honest act at a time.

---

## The Interesting Middle: High Rep + High Shame

The most nuanced character state is **high Reputation AND high Shame**. You're an excellent engineer who crossed every line to get there. NPCs are confused by you. Trainers respect your skill but question your methods.

This state unlocks unique dialog that neither pure-good nor pure-evil players see. Professor Pedersen will tell you: *"Your work is impressive. I wish I could say the same about your methods. *sighs* I hope you know what you're doing."*

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

## Uptime vs Reputation

Uptime and Reputation are different things:

- **Reputation** is a persistent global stat. It reflects your long-term track record across the entire game world — how NPCs, trainers, and the community perceive you over time.
- **Uptime** is a per-battle performance metric. It tracks your incident response time and SLA adherence during a specific battle. High uptime means you resolved the incident quickly and cleanly; breaching the SLA timer directly damages your Reputation for that session.

Think of Reputation as your career record and Uptime as your shift performance. A bad shift (low uptime, SLA breach) hurts your Reputation. A good career (high Reputation) can absorb a few bad shifts.

---

## The Evil Path

See [Hidden Areas](hidden-areas.md) for details on the Outcast Network and THROTTLEMASTER's storyline.

At Shame 15, you can choose to join THROTTLEMASTER and pursue the alternate **"Fork the Company"** ending. This is a fully viable path — the game never blocks you. It just asks: at what cost?

### Three Endings

| Ending | Condition | What Happens |
|---|---|---|
| **"The Post-Mortem"** | Shame < 10 | Beat The CTO. Promoted to Principal Engineer. Confluence page generated (0 views). 47 Azure Monitor alerts await. |
| **"The Shadow Post-Mortem"** | Shame 10–14 | Beat The CTO. Promoted, but: "There are also some audit findings. We'll discuss those in a separate meeting." Minor-key credits. 47 compliance findings pending. |
| **"Fork the Company"** | Shame ≥ 15 | Skip The CTO. Join THROTTLEMASTER. TechThrottle Consulting AS. Monthly Azure bill: €47,000. Title: **Principal Villain.** |

### Key Evil Path Moments

1. **Shame 1** — Cursed areas become faintly visible on the map; Professor Pedersen starts sighing around you
2. **Shame 3** — Outcast Network locations begin to appear; NPCs drop one-liners about what you did
3. **Shame 5** — Person of Interest title; trainers start fighting dirty (mirroring cursed techniques)
4. **Shame 7** — THROTTLEMASTER contacts you directly
5. **Shame 10** — Shadow Engineer title; gym leaders won't teach; holy grail skill unlocked; you look tired
6. **Shame 15** — THROTTLEMASTER offers recruitment; alternate ending available

---

## Strategy: To Curse or Not to Curse?

**Arguments for staying clean:**
- Better XP multipliers from Optimal solutions (×2 XP)
- No Technical Debt means full HP
- Better story outcomes and NPC interactions
- Gym leaders teach you their skills
- No emblem grime accumulation
- Avoid permanent Shame accumulation
- Professor Pedersen stops sighing

**Arguments for the dark side:**
- Cursed techniques bypass domain matchups entirely
- Nuclear techniques are incredibly powerful in emergencies
- The evil path has its own unique content, areas, and storyline
- THROTTLEMASTER's backstory is only available to high-Shame players
- The Shadow Engineer skill is genuinely the most powerful move in the game
- Some of the funniest dialog in the game is locked behind Shame thresholds
- You can partially redeem yourself with Coffee and an Apology

**The game's design encourages experimentation.** Your first playthrough doesn't have to be perfect.

---

*"Shame is semi-permanent. It goes down slowly. Every shortcut you take still follows you — you just have the option to own it." — Professor Pedersen, revised edition*

