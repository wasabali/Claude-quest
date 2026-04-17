// BattleEngine.js — phase-based turn resolution, zero Phaser imports.
// Owns the battle state and phase queue. Returns BattleEvent[] arrays.
// Scenes delegate all logic here; they only render the returned events.

import { calculateDamage, calculateXP, assessQuality, applyShameAndReputation, applyShameGrime } from './SkillEngine.js'
import { REPUTATION_MIN, REPUTATION_MAX } from '../config.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BATTLE_MODES = {
  INCIDENT: 'INCIDENT', // Wild encounter — SLA timer, hidden domain
  ENGINEER: 'ENGINEER', // Trainer battle — enemy telegraphs next move
}

// Maximum stacks of technical debt a player can accumulate
const MAX_TECHNICAL_DEBT = 10

// Max HP penalty per technical debt stack
const TECHNICAL_DEBT_HP_PENALTY = 2

// Reputation deltas applied at win resolution, per solution quality tier.

// Incident attack type identifiers (matches attacks[] entries in encounter data)
export const INCIDENT_ATTACKS = {
  UPTIME_DRAIN:    'uptime_drain',    // Accelerate SLA timer by 1 extra per turn
  BUDGET_SPIKE:    'budget_spike',    // Drain player budget
  REPUTATION_LEAK: 'reputation_leak', // Drain player reputation
  SKILL_BLOCK:     'skill_block',     // Apply skill_block status for 1 turn
  CONFUSION:       'confusion',       // Apply confusion status for 1 turn
  ESCALATION:      'escalation',      // Add 1 technical debt stack
}

// Default SLA timer when none specified
const DEFAULT_SLA_TIMER = 10

// Penalty applied on SLA breach
const SLA_BREACH_HP_PENALTY  = 20
const SLA_BREACH_REP_PENALTY = 10

// Reputation change on engineer battle outcomes
const ENGINEER_WIN_REP_OPTIMAL = 8
const ENGINEER_LOSE_REP_PENALTY = 5

// Approximate enemy base attack power (used in enemyPhase)
const ENEMY_BASE_POWER = 15

// Incident attack magnitudes
const BUDGET_SPIKE_VALUE    = 15
const REPUTATION_LEAK_VALUE = 3
const UPTIME_DRAIN_EXTRA    = 1
const SKILL_BLOCK_DURATION  = 1
const CONFUSION_DURATION    = 1

// ---------------------------------------------------------------------------
// createBattleState
// Initialises a fresh battle state. This is the only mutable object in the
// engine — phases read and write it, then return events describing the delta.
// ---------------------------------------------------------------------------
export function createBattleState(mode, player, opponent, options = {}) {
  const initialTelegraph = options.telegraphedMove ?? opponent.deck?.[0] ?? null
  return {
    mode,
    turn:             1,
    player:           { ...player, technicalDebt: player.technicalDebt ?? 0 },
    opponent:         { ...opponent },
    playerStatuses:   [],
    opponentStatuses: [],
    domainRevealed:   mode === BATTLE_MODES.ENGINEER,
    slaTimer:         mode === BATTLE_MODES.INCIDENT
                        ? (options.slaTimer ?? DEFAULT_SLA_TIMER)
                        : null,
    telegraphedMove:  initialTelegraph,
    opponentDeckIndex: 0,
    slaBreach:        false,
    winningTier:      options.winningTier ?? null,
    layers:           opponent.layers ? [...opponent.layers] : [],
    emblems:          options.emblems ? { ...options.emblems } : {},
    log:              [],
  }
}

// ---------------------------------------------------------------------------
// Phase 1: StatusTickPhase
// Decrements duration of all active player and opponent statuses.
// Permanent statuses (duration === -1) are never decremented.
// Expired statuses are removed and emit status_remove events.
// ---------------------------------------------------------------------------
export function statusTickPhase(state) {
  const events = []

  const tickStatuses = (statuses, target) => {
    const toRemove = []
    for (const status of statuses) {
      if (status.duration === -1) continue // permanent
      status.duration -= 1
      events.push({ type: 'status_tick', target, value: status.duration, statusName: status.name })
      if (status.duration <= 0) {
        toRemove.push(status.name)
        events.push({ type: 'status_remove', target, statusName: status.name })
      }
    }
    // Remove expired
    for (const name of toRemove) {
      const idx = statuses.findIndex(s => s.name === name)
      if (idx !== -1) statuses.splice(idx, 1)
    }
  }

  tickStatuses(state.playerStatuses,   'player')
  tickStatuses(state.opponentStatuses, 'opponent')

  return events
}

// ---------------------------------------------------------------------------
// Phase 2: SkillPhase
// Resolves the player's chosen skill.
// Emits skill_used, damage/heal/domain_reveal, reputation, and
// technical_debt events. Also updates state.winningTier.
// ---------------------------------------------------------------------------
export function skillPhase(state, skill) {
  const events = []

  // Enforce shameRequired gate — skills that require a minimum shame level
  // (e.g. kubectl_delete_production) cannot be used below that threshold.
  if (skill.shameRequired !== undefined && state.player.shamePoints < skill.shameRequired) {
    events.push({ type: 'skill_blocked', target: 'player', skillId: skill.id, reason: 'shame_required' })
    return events
  }

  events.push({ type: 'skill_used', target: 'opponent', skillId: skill.id })

  const effect = skill.effect

  if (effect.type === 'damage') {
    const dmg = calculateDamage(skill, state.opponent.domain) // always use true domain for calculation
    state.opponent.hp = Math.max(0, state.opponent.hp - dmg)
    events.push({ type: 'damage', target: 'opponent', value: dmg })
  }

  if (effect.type === 'instant_win_vs_legacy') {
    if (state.opponent.isLegacy) {
      const originalHp = state.opponent.hp
      state.opponent.hp = 0
      events.push({ type: 'damage', target: 'opponent', value: originalHp })
    } else {
      const backfire = Math.abs(effect.fallbackDamage ?? 40)
      state.player.hp = Math.max(0, state.player.hp - backfire)
      events.push({ type: 'damage', target: 'player', value: backfire })
    }
  }

  if (effect.type === 'instant_win_vs_containers') {
    if (state.opponent.domain === 'containers') {
      const originalHp = state.opponent.hp
      state.opponent.hp = 0
      events.push({ type: 'damage', target: 'opponent', value: originalHp })
    } else {
      const fallbackDamage = Math.abs(effect.fallbackDamage ?? 40)
      state.opponent.hp = Math.max(0, state.opponent.hp - fallbackDamage)
      events.push({ type: 'damage', target: 'opponent', value: fallbackDamage })
    }
  }

  if (effect.type === 'heal') {
    const healed = Math.min(effect.value, state.player.maxHp - state.player.hp)
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.value)
    events.push({ type: 'heal', target: 'player', value: healed })
  }

  if (effect.type === 'reveal_domain' || effect.type === 'reveal_and_tag_weakness' || effect.type === 'reveal') {
    state.domainRevealed = true
    events.push({ type: 'domain_reveal', target: 'opponent', value: state.opponent.domain })
  }

  // Apply shame and reputation changes for this skill use (all tiers).
  // Non-cursed skills always have shameDelta=0; reputation delta varies by tier.
  const updated    = applyShameAndReputation(state.player, skill)
  const shameDelta = updated.shamePoints - state.player.shamePoints
  const repDelta   = updated.reputation  - state.player.reputation
  state.player.shamePoints = updated.shamePoints
  state.player.reputation  = updated.reputation

  // Apply grime to all earned emblems when shame is gained and emit an event
  // so BattleScene can sync GameState.emblems at battle end.
  if (shameDelta > 0) {
    const nextEmblems = applyShameGrime(state.emblems ?? {}, shameDelta)
    state.emblems = nextEmblems
    events.push({ type: 'emblems_updated', target: 'player', value: nextEmblems, shameDelta })
  }

  if (repDelta !== 0 || shameDelta !== 0) {
    events.push({ type: 'reputation', target: 'player', value: repDelta, shameDelta })
  }

  // Cursed/nuclear skills accumulate technical debt (capped at MAX_TECHNICAL_DEBT)
  if (skill.isCursed || skill.tier === 'cursed' || skill.tier === 'nuclear') {
    if (state.player.technicalDebt < MAX_TECHNICAL_DEBT) {
      state.player.technicalDebt += 1
      state.player.maxHp = Math.max(1, state.player.maxHp - TECHNICAL_DEBT_HP_PENALTY)
      state.player.hp = Math.min(state.player.hp, state.player.maxHp)
    }
    events.push({ type: 'technical_debt', target: 'player', value: state.player.technicalDebt })
  }

  // Update winning tier based on the outcome of this skill
  state.winningTier = assessQuality(skill, state.opponent, state.domainRevealed)

  return events
}

// ---------------------------------------------------------------------------
// Phase 3: SlaTickPhase
// Decrements the SLA timer by 1 (INCIDENT mode only).
// Fires sla_breach when the timer hits 0 and applies HP/rep penalties.
// ---------------------------------------------------------------------------
export function slaTickPhase(state) {
  if (state.slaTimer === null) return []

  const events = []

  if (state.slaTimer <= 0) {
    // Already breached — do not decrement further
    return []
  }

  state.slaTimer -= 1
  events.push({ type: 'sla_tick', value: state.slaTimer })

  if (state.slaTimer === 0) {
    state.slaBreach = true
    state.player.hp         = Math.max(0, state.player.hp - SLA_BREACH_HP_PENALTY)
    state.player.reputation = Math.max(REPUTATION_MIN, state.player.reputation - SLA_BREACH_REP_PENALTY)
    events.push({
      type:            'sla_breach',
      target:          'player',
      value:           SLA_BREACH_HP_PENALTY,
      reputationLoss:  SLA_BREACH_REP_PENALTY,
    })
  }

  return events
}

// ---------------------------------------------------------------------------
// Phase 4: EnemyPhase
// Resolves enemy move.
// - INCIDENT mode: no enemy turn (just environmental pressure via SLA).
// - ENGINEER mode: enemy attacks the player using their telegraphed move,
//   then advances to the next move in their deck and telegraphs it.
// ---------------------------------------------------------------------------
export function enemyPhase(state) {
  if (state.mode === BATTLE_MODES.INCIDENT) return []

  const events = []
  const moveId = state.telegraphedMove ?? 'basic_attack'

  events.push({ type: 'skill_used', target: 'player', skillId: moveId })

  // Enemy deals base power damage (domain matchup vs player not tracked since
  // the player has no fixed domain; difficulty scales enemy power).
  const dmg = ENEMY_BASE_POWER
  state.player.hp = Math.max(0, state.player.hp - dmg)
  events.push({ type: 'damage', target: 'player', value: dmg })

  // Advance to the next move in the opponent's deck and telegraph it.
  // Wild encounters do not telegraph — they attack unpredictably.
  const deck = state.opponent.deck
  if (deck && deck.length > 0 && !state.opponent.isWildEncounter) {
    state.opponentDeckIndex = (state.opponentDeckIndex + 1) % deck.length
    const nextMoveId = deck[state.opponentDeckIndex]
    state.telegraphedMove = nextMoveId
    events.push({ type: 'telegraph', target: 'player', value: nextMoveId })
  }

  return events
}

// ---------------------------------------------------------------------------
// Phase 4b: IncidentAttackPhase
// Incidents are passive on turn 1 (Phase 1 — symptom display only).
// From turn 2 onward the incident performs its cyclic attack pattern.
// Attack type is taken from opponent.attacks[] and cycled deterministically.
// Only runs in INCIDENT mode.
// ---------------------------------------------------------------------------
export function incidentAttackPhase(state) {
  if (state.mode !== BATTLE_MODES.INCIDENT) return []
  if (state.turn === 1) return [] // Phase 1 — no attack, just symptom display

  const attacks = state.opponent.attacks ?? []
  if (attacks.length === 0) return []

  const events = []
  const attack = attacks[(state.turn - 2) % attacks.length]

  switch (attack) {
    case INCIDENT_ATTACKS.UPTIME_DRAIN:
      if (state.slaTimer !== null && state.slaTimer > 0) {
        state.slaTimer = Math.max(0, state.slaTimer - UPTIME_DRAIN_EXTRA)
        events.push({ type: 'sla_tick', value: state.slaTimer, source: 'uptime_drain' })
        if (state.slaTimer === 0 && !state.slaBreach) {
          state.slaBreach = true
          state.player.hp         = Math.max(0, state.player.hp - SLA_BREACH_HP_PENALTY)
          state.player.reputation = Math.max(REPUTATION_MIN, state.player.reputation - SLA_BREACH_REP_PENALTY)
          events.push({
            type:           'sla_breach',
            target:         'player',
            value:          SLA_BREACH_HP_PENALTY,
            reputationLoss: SLA_BREACH_REP_PENALTY,
          })
        }
      }
      break

    case INCIDENT_ATTACKS.BUDGET_SPIKE: {
      const currentBudget = state.player.budget ?? 0
      const nextBudget = Math.max(0, currentBudget - BUDGET_SPIKE_VALUE)
      const drainedBudget = currentBudget - nextBudget
      state.player.budget = nextBudget
      if (drainedBudget > 0) {
        events.push({ type: 'budget_drain', target: 'player', value: drainedBudget })
      }
      break
    }

    case INCIDENT_ATTACKS.REPUTATION_LEAK: {
      const previousReputation = state.player.reputation ?? 0
      const nextReputation = Math.max(REPUTATION_MIN, previousReputation - REPUTATION_LEAK_VALUE)
      const reputationDelta = nextReputation - previousReputation
      state.player.reputation = nextReputation
      if (reputationDelta !== 0) {
        events.push({ type: 'reputation', target: 'player', value: reputationDelta })
      }
      break
    }

    case INCIDENT_ATTACKS.SKILL_BLOCK: {
      const alreadyBlocked = state.playerStatuses.find(s => s.name === 'skill_block')
      if (!alreadyBlocked) {
        state.playerStatuses.push({ name: 'skill_block', duration: SKILL_BLOCK_DURATION })
      }
      events.push({ type: 'status_apply', target: 'player', statusName: 'skill_block', duration: SKILL_BLOCK_DURATION })
      break
    }

    case INCIDENT_ATTACKS.CONFUSION: {
      const alreadyConfused = state.playerStatuses.find(s => s.name === 'confusion')
      if (!alreadyConfused) {
        state.playerStatuses.push({ name: 'confusion', duration: CONFUSION_DURATION })
      }
      events.push({ type: 'status_apply', target: 'player', statusName: 'confusion', duration: CONFUSION_DURATION })
      break
    }

    case INCIDENT_ATTACKS.ESCALATION: {
      const currentDebt = state.player.technicalDebt ?? 0
      const nextDebt = Math.min(10, currentDebt + 1)
      const debtDelta = nextDebt - currentDebt
      state.player.technicalDebt = nextDebt
      if (debtDelta > 0) {
        events.push({ type: 'escalation', target: 'player', value: debtDelta })
      }
      break
    }
  }

  return events
}

// ---------------------------------------------------------------------------
// Phase 5: TurnEndPhase
// Checks win/lose conditions and awards XP.
// Win:  opponent.hp === 0 (with layer transition if multi-layer incident)
// Lose: player.hp === 0 OR (slaBreach && opponent.hp > 0)
// Also increments turn counter when battle continues.
//
// Engineer win rewards are tier-gated:
//   optimal  → teach_skill (signature command)
//   standard → dialog hint about a related command
//   shortcut/cursed/nuclear → XP only (or XP penalty)
// ---------------------------------------------------------------------------
export function turnEndPhase(state) {
  const events = []

  const opponentDefeated = state.opponent.hp <= 0
  const playerDefeated   = state.player.hp <= 0
  const slaLoss          = state.slaBreach && !opponentDefeated

  if (opponentDefeated) {
    // Multi-layer incident: transition to next layer instead of ending the battle
    if (state.layers && state.layers.length > 0) {
      const nextLayer = state.layers.shift()
      Object.assign(state.opponent, nextLayer, { maxHp: nextLayer.hp })
      state.opponent.hp    = nextLayer.hp
      state.domainRevealed = false // New layer's domain is hidden until diagnosed
      events.push({ type: 'layer_transition', target: 'opponent', value: nextLayer })
      state.turn += 1
      return events
    }

    const tier = state.winningTier ?? 'standard'
    const xp   = calculateXP(state.opponent.difficulty ?? 1, tier)

    // ENGINEER mode only: apply reputation bonus for optimal win
    if (state.mode === BATTLE_MODES.ENGINEER && tier === 'optimal') {
      const newRep = Math.min(REPUTATION_MAX, state.player.reputation + ENGINEER_WIN_REP_OPTIMAL)
      const actualDelta = newRep - state.player.reputation
      state.player.reputation = newRep
      if (actualDelta !== 0) {
        events.push({ type: 'reputation', target: 'player', value: actualDelta })
      }
    }

    events.push({ type: 'xp_gain', target: 'player', value: xp })

    // ENGINEER mode: tier-based teacher reactions
    if (state.mode === BATTLE_MODES.ENGINEER) {
      if (tier === 'optimal' && state.opponent.teachSkillId) {
        events.push({ type: 'teach_skill', target: 'player', value: state.opponent.teachSkillId })
      } else if (tier === 'standard') {
        if (state.opponent.winDialog) {
          events.push({ type: 'dialog', target: 'player', text: state.opponent.winDialog })
        } else if (state.opponent.teachSkillId) {
          events.push({ type: 'teach_hint', target: 'player', value: state.opponent.teachSkillId })
        }
      } else if (tier === 'cursed') {
        events.push({ type: 'trainer_disgusted', target: 'player' })
      } else if (tier === 'nuclear') {
        events.push({ type: 'warn_npcs', target: 'player' })
      }
    }

    events.push({ type: 'battle_end', target: 'player', value: 'win' })
    return events
  }

  if (playerDefeated || slaLoss) {
    // Reputation penalty for losing an engineer battle (not SLA — that is penalised in slaTickPhase)
    if (playerDefeated && state.mode === BATTLE_MODES.ENGINEER) {
      state.player.reputation = Math.max(REPUTATION_MIN, state.player.reputation - ENGINEER_LOSE_REP_PENALTY)
      events.push({ type: 'reputation', target: 'player', value: -ENGINEER_LOSE_REP_PENALTY, shameDelta: 0 })
    }
    events.push({ type: 'battle_end', target: 'player', value: 'lose' })
    return events
  }

  // Battle continues — increment turn
  state.turn += 1
  return events
}

// ---------------------------------------------------------------------------
// resolveTurn
// Runs all phases in order and returns the concatenated BattleEvent[].
// Phase order: StatusTick → Skill → SlaTick → IncidentAttack → Enemy → TurnEnd
// ---------------------------------------------------------------------------
export function resolveTurn(state, skill) {
  const events = [
    ...statusTickPhase(state),
    ...skillPhase(state, skill),
    ...slaTickPhase(state),
    ...incidentAttackPhase(state),
    ...enemyPhase(state),
    ...turnEndPhase(state),
  ]

  // Append all events to the battle log
  state.log.push(...events)

  return events
}
