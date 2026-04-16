// BattleEngine.js — phase-based turn resolution, zero Phaser imports.
// Owns the battle state and phase queue. Returns BattleEvent[] arrays.
// Scenes delegate all logic here; they only render the returned events.

import { calculateDamage, calculateXP, assessQuality, applyShameAndReputation } from './SkillEngine.js'

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
const QUALITY_REP_DELTAS = {
  optimal:  10,
  standard: 3,
  shortcut: -5,
  cursed:   -15,
  nuclear:  -30,
}

const DEFAULT_SLA_TIMER = 10

// Penalty applied on SLA breach
const SLA_BREACH_HP_PENALTY  = 20
const SLA_BREACH_REP_PENALTY = 15

// Approximate enemy base attack power (used in enemyPhase)
const ENEMY_BASE_POWER = 15

// ---------------------------------------------------------------------------
// createBattleState
// Initialises a fresh battle state. This is the only mutable object in the
// engine — phases read and write it, then return events describing the delta.
// ---------------------------------------------------------------------------
export function createBattleState(mode, player, opponent, options = {}) {
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
    telegraphedMove:  options.telegraphedMove ?? null,
    slaBreach:        false,
    winningTier:      options.winningTier ?? null,
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

  events.push({ type: 'skill_used', target: 'opponent', skillId: skill.id })

  const effect = skill.effect

  if (effect.type === 'damage') {
    const dmg = calculateDamage(skill, state.opponent.domain) // always use true domain for calculation
    state.opponent.hp = Math.max(0, state.opponent.hp - dmg)
    events.push({ type: 'damage', target: 'opponent', value: dmg })
  }

  if (effect.type === 'heal') {
    const healed = Math.min(effect.value, state.player.maxHp - state.player.hp)
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.value)
    events.push({ type: 'heal', target: 'player', value: healed })
  }

  if (effect.type === 'reveal_domain' || effect.type === 'reveal_and_tag_weakness') {
    state.domainRevealed = true
    events.push({ type: 'domain_reveal', target: 'opponent', value: state.opponent.domain })
  }

  // Cursed/nuclear side effects — shame, reputation, and technical debt
  if (skill.isCursed || skill.tier === 'cursed' || skill.tier === 'nuclear') {
    const updated = applyShameAndReputation(state.player, skill)
    const shameDelta = updated.shamePoints - state.player.shamePoints
    const repDelta   = updated.reputation  - state.player.reputation
    state.player.shamePoints = updated.shamePoints
    state.player.reputation  = updated.reputation
    events.push({ type: 'reputation', target: 'player', value: repDelta, shameDelta })

    // Accumulate technical debt (capped at MAX_TECHNICAL_DEBT)
    if (state.player.technicalDebt < MAX_TECHNICAL_DEBT) {
      state.player.technicalDebt += 1
      state.player.maxHp = Math.max(1, state.player.maxHp - TECHNICAL_DEBT_HP_PENALTY)
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
    state.player.reputation = Math.max(0, state.player.reputation - SLA_BREACH_REP_PENALTY)
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
// - ENGINEER mode: enemy attacks the player.
// ---------------------------------------------------------------------------
export function enemyPhase(state) {
  if (state.mode === BATTLE_MODES.INCIDENT) return []

  const events = []
  const moveId = state.telegraphedMove ?? 'basic_attack'

  events.push({ type: 'skill_used', target: 'player', skillId: moveId })

  // Enemy deals base power damage (simplified — domain matchup not applied here
  // since enemy domain vs player is resolved by difficulty in full implementation)
  const dmg = ENEMY_BASE_POWER
  state.player.hp = Math.max(0, state.player.hp - dmg)
  events.push({ type: 'damage', target: 'player', value: dmg })

  return events
}

// ---------------------------------------------------------------------------
// Phase 5: TurnEndPhase
// Checks win/lose conditions and awards XP.
// Win:  opponent.hp === 0
// Lose: player.hp === 0 OR (slaBreach && opponent.hp > 0)
// Also increments turn counter when battle continues.
// ---------------------------------------------------------------------------
export function turnEndPhase(state) {
  const events = []

  const opponentDefeated = state.opponent.hp <= 0
  const playerDefeated   = state.player.hp <= 0
  const slaLoss          = state.slaBreach && !opponentDefeated

  if (opponentDefeated) {
    const tier = state.winningTier ?? 'standard'
    const xp   = calculateXP(state.opponent.difficulty ?? 1, tier)
    events.push({ type: 'xp_gain', target: 'player', value: xp })

    // Apply quality-based reputation delta at win resolution
    const repDelta    = QUALITY_REP_DELTAS[tier] ?? 0
    const newRep      = Math.max(0, Math.min(100, state.player.reputation + repDelta))
    const actualDelta = newRep - state.player.reputation
    state.player.reputation = newRep
    if (actualDelta !== 0) {
      events.push({ type: 'reputation', target: 'player', value: actualDelta })
    }

    // ENGINEER mode: tier-based teacher reactions
    if (state.mode === BATTLE_MODES.ENGINEER) {
      if (tier === 'optimal' && state.opponent.teachSkillId) {
        events.push({ type: 'teach_skill', target: 'player', value: state.opponent.teachSkillId })
      } else if (tier === 'standard' && state.opponent.teachSkillId) {
        events.push({ type: 'teach_hint', target: 'player', value: state.opponent.teachSkillId })
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
    events.push({ type: 'battle_end', target: 'player', value: 'lose' })
    return events
  }

  // Battle continues — increment turn
  state.turn += 1
  return events
}

// ---------------------------------------------------------------------------
// resolveTurn
// Runs all 5 phases in order and returns the concatenated BattleEvent[].
// Phase order: StatusTick → Skill → SlaTick → Enemy → TurnEnd
// ---------------------------------------------------------------------------
export function resolveTurn(state, skill) {
  const events = [
    ...statusTickPhase(state),
    ...skillPhase(state, skill),
    ...slaTickPhase(state),
    ...enemyPhase(state),
    ...turnEndPhase(state),
  ]

  // Append all events to the battle log
  state.log.push(...events)

  return events
}
