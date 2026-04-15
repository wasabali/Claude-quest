---
name: cloud-quest-battle
description: Complete reference for Cloud Quest's battle system. Use when implementing or modifying BattleEngine, SkillEngine, StatusEngine, BattleScene, or any battle-related logic. Covers domain matchups, solution quality, SLA timers, incident vs engineer modes, and shame/reputation mechanics.
---

# Cloud Quest Battle System Reference

## Two Battle Modes

### Incident Mode (wild encounters)
The enemy is a technical problem — a 503 error, a CrashLoopBackOff, an Azure bill spike. The player must diagnose the root cause before the fix commands deal full damage.

- Enemy domain type is hidden at start
- Using an Observability command reveals it
- Using the correct domain without reveal: 50% damage
- Using the correct domain after reveal: full damage (×2 if strong match)
- SLA timer counts down each turn — breach triggers penalties

### Engineer Mode (trainer battles)
Two skill decks. Both sides pick a command per turn. Domain matchups apply. The engineer telegraphs their next move one turn in advance.

- Enemy deck defined in `TrainerData.deck`
- Enemy telegraphs next move with a line from `TrainerData.telegraphs`
- Win quality determines reward (see Solution Quality below)

---

## Domain Matchup System

```js
// src/config.js
export const DOMAIN_MATCHUPS = {
  linux:        { strong: 'security',   weak: 'kubernetes'  },
  security:     { strong: 'serverless', weak: 'linux'       },
  serverless:   { strong: 'cloud',      weak: 'security'    },
  cloud:        { strong: 'iac',        weak: 'serverless'  },
  iac:          { strong: 'containers', weak: 'cloud'       },
  containers:   { strong: 'kubernetes', weak: 'iac'         },
  kubernetes:   { strong: 'linux',      weak: 'containers'  },
  observability: { strong: null, weak: null },
}
export const STRONG_MULTIPLIER = 2.0
export const WEAK_MULTIPLIER   = 0.5
```

### Damage Calculation

```js
function calculateDamage(skillDomain, enemyDomain, basePower) {
  if (skillDomain === null) return basePower  // cursed — flat, no matchup
  if (skillDomain === 'observability') return 0  // support domain, no damage

  const matchup = DOMAIN_MATCHUPS[skillDomain]
  if (matchup.strong === enemyDomain) return Math.floor(basePower * STRONG_MULTIPLIER)
  if (matchup.weak === enemyDomain)   return Math.floor(basePower * WEAK_MULTIPLIER)
  return basePower  // neutral
}
```

---

## Solution Quality Assessment

```js
function assessQuality(skill, opponent, domainRevealed) {
  if (skill.tier === 'nuclear')  return 'nuclear'
  if (skill.tier === 'cursed')   return 'cursed'

  const correctDomain = skill.domain === DOMAIN_MATCHUPS[skill.domain]?.strong
    ? skill.domain : null  // simplified — actual logic checks against opponent domain

  if (correctDomain && domainRevealed) return 'optimal'
  if (correctDomain && !domainRevealed) return 'standard'
  return 'shortcut'
}
```

### Quality Rewards

| Quality | XP mult | Rep delta | Shame delta | Engineer win reward |
|---|---|---|---|---|
| optimal | ×2 | +10 | 0 | Teaches signature skill |
| standard | ×1 | +3 | 0 | Hints at related command |
| shortcut | ×0.5 | −5 | 0 | Small XP only |
| cursed | ×0.25 | −15 | +1 | No teaching, trainer leaves |
| nuclear | ×0 | −30 | +2 | Trainer warns NPCs about player |

---

## SLA Timer

Every incident has an `slaTimer` (turns remaining). Decrements each turn.

```js
function tickSla(state) {
  state.slaTimer--
  if (state.slaTimer <= 0 && !state.slaBreached) {
    state.slaBreached = true
    return [
      { type: 'dialog', text: 'SLA BREACHED. You\'ll hear about this.' },
      { type: 'damage', target: 'player', value: 20 },
      { type: 'reputation_damage', target: 'player', value: 10 },
    ]
  }
  return [{ type: 'sla_tick', value: state.slaTimer }]
}
```

Resolving before breach gives an XP speed bonus. Resolving after breach still wins but with penalties already applied.

---

## BattleEvent Shape

All engine functions return `BattleEvent[]`. BattleScene iterates and renders each.

```js
// BattleEvent is a union. Not every event carries target/value.

// Numeric events that affect one side directly.
{
  type: 'damage'             // hp loss
      | 'heal'               // hp gain
      | 'status_apply'       // status effect added
      | 'status_remove'      // status effect expired
      | 'budget_drain'       // budget loss
      | 'shame'              // shame point added
      | 'reputation_damage'  // reputation loss
      | 'sla_tick'           // SLA countdown updated
      | 'reveal'             // enemy domain revealed
      | 'win'                // battle won
      | 'lose',              // battle lost
  target: 'player' | 'opponent',
  value: Number,
}

// Text-only log event.
{
  type: 'dialog',
  text: String,
}
```

---

## Status Effects

```js
const STATUSES = {
  throttled:      { desc: 'Only 1 skill every 2 turns', duration: 3 },
  cold_start:     { desc: 'Skip first turn of battle', duration: 1 },
  deprecated:     { desc: 'Skills 50% effectiveness', duration: 4 },
  on_call:        { desc: 'Random encounters after each battle', duration: 5 },
  cost_alert:     { desc: 'Budget drains 2× faster', duration: 3 },
  technical_debt: { desc: 'Max HP reduced by 2 per stack', duration: -1 }, // permanent until cleared
  in_review:      { desc: 'Cannot act for 1–3 turns', duration: 'random' },
}
```

---

## Technical Debt (Cursed Technique Accumulation)

Each cursed/nuclear technique use increments `GameState.player.technicalDebt` by 1 (capped at 10). Each stack permanently reduces `maxHp` by 2 until cleared by a cleanup quest.

```js
function applyTechnicalDebt(amount = 1) {
  const newDebt = Math.min(GameState.player.technicalDebt + amount, 10)
  GameState.player.technicalDebt = newDebt
  GameState.player.maxHp = 100 - (newDebt * 2)
  GameState.player.hp = Math.min(GameState.player.hp, GameState.player.maxHp)
}
```
