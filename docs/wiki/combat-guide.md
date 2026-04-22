# Combat Guide

Cloud Quest's battle system is built around **domain matchups** and **solution quality**. Every fight rewards you for using the right tool for the job — and punishes you (eventually) for taking shortcuts.

---

## Domain Matchup Cycle

Seven domains form a circular matchup chain. Each domain deals **×2 damage** to the one it beats and **×0.5 damage** to the one that beats it. Everything else is ×1 neutral.

```
Linux → beats → Security → beats → Serverless → beats → Cloud
  ↑                                                        ↓
Kubernetes ← beats ← Containers ← beats ← IaC ← beats ←─┘
```

| Domain | Strong Against | Weak Against |
|---|---|---|
| 🐧 Linux | Security | Kubernetes |
| 🔒 Security | Serverless | Linux |
| ⚡ Serverless | Cloud | Security |
| ☁️ Cloud | IaC | Serverless |
| 🏗️ IaC | Containers | Cloud |
| 🐳 Containers | Kubernetes | IaC |
| ☸️ Kubernetes | Linux | Containers |
| 📊 Observability | *(none)* | *(none)* |

### Observability — The Support Domain

Observability doesn't deal damage. Instead, it **reveals** enemy information: domain type, HP, status effects, next moves, and weaknesses. It's the scout class. Use it to diagnose before you attack.

**Key insight:** Enemy domain types are **hidden** at the start of every battle. You can guess and attack (risky) or spend a turn using an Observability skill to reveal the domain (safe but costs a turn).

---

## Battle Types

### Incident Battles (Wild Encounters)

Incidents are technical problems — the player version of "the app is down." They appear as you explore the world.

**How they work:**
1. You see **symptoms** — error messages, alerts, weird behavior
2. The enemy domain is **hidden** until you use a reveal skill
3. An **SLA timer** counts down each turn — set per encounter
4. If the timer hits 0 → **SLA breach** → HP and reputation damage (−15 reputation)
5. Fix it before the timer expires for full rewards

Incident timers are set per encounter using that encounter's SLA value:

| Encounter SLA | What It Means |
|---|---|
| 2 turns | Very tight — you need to know the domain already or guess |
| 3 turns | Tight — one turn to diagnose, two to resolve |
| 4 turns | Comfortable — standard difficulty |
| 5 turns | Plenty of time — diagnose, plan, execute |
| 10 turns | Default when unspecified — no rush |

**Tip:** Short-SLA incidents leave very little room to scout. Reveal skills are most valuable when you expect a tight timer.

### Engineer Battles (Trainer Battles)

Other engineers challenge you to battle. These are more strategic — both sides have skill decks and take turns.

**Key differences from incidents:**
- No SLA timer (usually)
- Engineers **telegraph their next move** one turn in advance — pay attention to their dialog
- **Any win** teaches you the trainer's **signature skill** — aim for Optimal for the best XP bonus

---

## Solution Quality Tiers

Every battle resolution is graded on quality. Better solutions = better rewards.

| Tier | XP Multiplier | Shame | What It Means |
|---|---|---|---|
| **Optimal** | ×2 | 0 | Right domain, diagnosed first. The textbook solution. |
| **Standard** | ×1 | 0 | Right domain, no diagnosis. You knew what to do. |
| **Shortcut** | ×0.5 | 0 | Wrong domain, but it worked. Effective, not elegant. |
| **Cursed** | ×0.25 | +1 | Forbidden technique. It works. But at what cost? |
| **Nuclear** | ×0 | +2 | Scorched earth. You won, but you lost something worse. |

**Reputation impact:** Cursed and nuclear skills apply a variable reputation penalty defined per skill. SLA breaches cost −15 reputation. See [Reputation & Shame](reputation-and-shame.md) for full details.

**The game never blocks you for a bad solution.** It just remembers. Shortcuts close doors that Optimal solutions open.

---

## Turn Phases

Each turn resolves in distinct phases:

1. **Status Tick** — Active status effects tick/expire
2. **Skill Phase** — Your selected skill resolves, damage calculated
3. **SLA Tick** — SLA timer decrements (incident battles only)
4. **Enemy Phase** — Enemy resolves their move (engineer battles only)
5. **Turn End** — Check win/lose conditions, award XP

---

## Status Effects

Status effects can be applied during battle and last for a set number of turns.

| Status | Effect | Duration |
|---|---|---|
| Throttled | Only 1 skill every 2 turns | 3 turns |
| Cold Start | Skip first turn of battle | 1 turn |
| Deprecated | Skills 50% effectiveness | 4 turns |
| On-Call | Random encounters after each battle | 5 turns |
| Cost Alert | Budget drains 2× faster | 3 turns |
| Technical Debt | Max HP reduced by 2 per stack | Permanent |
| In Review | Cannot act for 1–3 turns | Random |

**Technical Debt** is the nastiest — it's permanent and stacks. Each cursed technique use can add it. Clear it through **cleanup quests**.

---

## Budget

Some skills cost **Budget** to use. Budget is your cloud spending limit. Expensive skills are often powerful, but running out of budget mid-battle is a real problem.

Budget-free skills (cost 0) are reliable staples. Budget skills are powerful burst options. Manage both.

---

## Strategy Tips

1. **Always diagnose first** — Spend turn 1 using a reveal skill in incident battles. The ×2 damage from a correct matchup more than compensates for the lost turn.
2. **Watch telegraphs** — In engineer battles, the enemy hints at their next move. Counter it.
3. **Build a balanced deck** — Your 6 active skills should cover at least 3 domains plus one Observability skill.
4. **Respect the SLA** — In short-SLA encounters (2–3 turns), you may not have time to diagnose. Know your common domains per region.
5. **Avoid cursed techniques** — They're powerful but the Shame is permanent. See [Reputation & Shame](reputation-and-shame.md).

---

## XP and Leveling

XP is earned from battles, quests, and reading certain items. The amount depends on your solution tier.

| Level | Cumulative XP Required |
|---|---|
| 1 | 0 |
| 2 | 100 |
| 3 | 250 |
| 4 | 450 |
| 5 | 700 |
| 6 | 1,000 |
| 7 | 1,350 |
| 8 | 1,750 |
| 9 | 2,200 |
| 10 | 2,700 |
| 11 | 3,250 |
| 12 | 3,850 |
| 13 | 4,500 |
| 14 | 5,200 |
| 15 | 5,950 |
| 16 | 6,750 |
| 17 | 7,600 |
| 18 | 8,500 |
| 19 | 9,450 |
| 20 | 10,450 |

Optimal solutions give ×2 XP — meaning an Optimal player levels roughly twice as fast as a Standard one.

---

## Battle Audio Cues

Every meaningful battle event plays a distinct sound effect. Learn to recognise them — they give you feedback even when you're not looking at the numbers.

| Situation | Sound |
|---|---|
| Normal hit lands | Impact crunch (`sfx_damage_hit`) |
| Critical / domain advantage hit | Bigger crunch + screen flash (`sfx_damage_critical`) |
| Heal effect triggers | Rising arpeggio (`sfx_heal`) |
| Status applied | Wobble/warble tone (`sfx_status_apply`) |
| Status expires | Soft release (`sfx_status_expire`) |
| Skill misses or fails | Descending sad trombone (`sfx_skill_fail`) |
| Shame increases | Ominous chord (`sfx_shame`) |
| SLA timer ticks | Clock tick each turn (`sfx_sla_tick`) |
| SLA breach | Alarm klaxon — address it before it fires (`sfx_sla_breach`) |
| Budget spent | Coin loss jingle (`sfx_budget_drain`) |
| Reputation changes | Pitch up for gain, pitch down for loss (`sfx_reputation_change`) |
| Battle starts | Alert jingle (`sfx_encounter_start`) |

BGM switches automatically: `battle_incident` for random encounters, `battle_engineer` for trainer fights, `battle_cursed` when cursed techniques are active, and `battle_throttlemaster` for THROTTLEMASTER boss phases.

See [Audio Reference](audio.md) for the full SFX and BGM listing.

---

*"Spend a turn diagnosing. Always. The matchup bonus is worth it." — The Solutions Oracle*
