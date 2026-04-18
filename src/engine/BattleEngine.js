// BattleEngine.js — phase-based turn resolution, zero Phaser imports.
// Owns the battle state and phase queue. Returns BattleEvent[] arrays.
// Scenes delegate all logic here; they only render the returned events.

import { calculateDamage, calculateXP, assessQuality, applyShameAndReputation, applyShameGrime, shouldTeachOnAnyWin } from './SkillEngine.js'
import { REPUTATION_MIN, REPUTATION_MAX, EXECUTIVE_MODE_THRESHOLD, EXECUTIVE_MODE_MULTIPLIER, DOMAIN_MATCHUPS, GYM_MECHANICS, GYM_SHAME_THRESHOLDS, SHADOW_ENGINEER, ECONOMY } from '../config.js'
import { calculateBattleReward, calculateBudgetRestore, calculateCostSpiralSurcharge, calculateCostSpiralHpGain, calculateDebtPenalty } from './EconomyEngine.js'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const BATTLE_MODES = {
  INCIDENT: 'INCIDENT', // Wild encounter — SLA timer, hidden domain
  ENGINEER: 'ENGINEER', // Trainer battle — enemy telegraphs next move
  SCRIPTED: 'SCRIPTED', // Scripted encounter — cannot be won, auto-escape on SLA expiry
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
  THROTTLE:        'throttle',        // Apply throttle status — reduces player damage output
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
const THROTTLE_DURATION     = 2

// Calculates boss outcome based on shame thresholds (arrest / choice / recruitment)
function bossOutcome(shame, thresholds) {
  if (shame >= (thresholds.recruitment ?? Infinity)) return 'recruitment'
  if (shame >= (thresholds.arrest ?? Infinity))      return 'choice'
  return 'arrest'
}

// ---------------------------------------------------------------------------
// createBattleState
// Initialises a fresh battle state. This is the only mutable object in the
// engine — phases read and write it, then return events describing the delta.
// ---------------------------------------------------------------------------
export function createBattleState(mode, player, opponent, options = {}) {
  const initialTelegraph = options.telegraphedMove ?? opponent.deck?.[0] ?? null
  const gymMechanic       = options.gymMechanic ?? null
  // Fall back to GYM_MECHANICS defaults so callers don't have to re-specify config
  const gymMechanicConfig = options.gymMechanicConfig ?? (gymMechanic ? (GYM_MECHANICS[gymMechanic] ?? null) : null)

  // sla_timer gym mechanic overrides the default SLA timer
  let slaTimer = null
  if (mode === BATTLE_MODES.INCIDENT || mode === BATTLE_MODES.SCRIPTED) {
    if (gymMechanic === 'sla_timer' && gymMechanicConfig?.slaTimer != null) {
      slaTimer = gymMechanicConfig.slaTimer
    } else {
      slaTimer = options.slaTimer ?? DEFAULT_SLA_TIMER
    }
  }

  const opponentCopy = { ...opponent }

  // all_domains gym mechanic: shuffle domain order, set initial domain
  let gymDomainOrder  = null
  let gymDomainIndex  = 0
  let gymExecutiveMode = false
  if (gymMechanic === 'all_domains') {
    const domains = Object.keys(DOMAIN_MATCHUPS).filter(d => d !== 'observability')
    // Fisher-Yates shuffle
    for (let i = domains.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[domains[i], domains[j]] = [domains[j], domains[i]]
    }
    gymDomainOrder = domains
    opponentCopy.domain = domains[0]
  }

  // Shame 5+: trainers mirror cursed skills — add 1 random cursed skill to their deck
  const shamePts = player.shamePoints ?? 0
  if (mode === BATTLE_MODES.ENGINEER && shamePts >= 5 && !opponent.isWildEncounter) {
    const cursedPool = options.cursedSkillPool ?? []
    if (cursedPool.length > 0) {
      const randomValue = (options.randomFn ?? Math.random)()
      const pickIndex = Math.min(cursedPool.length - 1, Math.floor(randomValue * cursedPool.length))
      const pick = cursedPool[pickIndex]
      opponentCopy.deck = [...(opponentCopy.deck ?? []), pick]
      opponentCopy.cursedMirrorSkill = pick
    }
  }

  const state = {
    mode,
    turn:             1,
    player:           {
                        ...player,
                        technicalDebt: player.technicalDebt ?? 0,
                        maxBudget: Math.max(0, player.maxBudget ?? player.budget ?? 500),
                      },
    opponent:         opponentCopy,
    playerStatuses:   [],
    opponentStatuses: [],
    domainRevealed:   mode === BATTLE_MODES.ENGINEER,
    slaTimer,
    telegraphedMove:  initialTelegraph,
    opponentDeckIndex: 0,
    slaBreach:        false,
    winningTier:      options.winningTier ?? null,
    layers:           opponent.layers ? [...opponent.layers] : [],
    // Phase 0 is the initial opponent state; remaining phases are queued for transitions
    bossPhases:       opponent.phases && opponent.phases.length > 0
                        ? [...opponent.phases.slice(1)]
                        : [],
    emblems:          options.emblems ? { ...options.emblems } : {},
    log:              [],
    gymMechanic,
    gymMechanicConfig,
  }

  // cold_start: player's first non-observability skill is blocked (flag-based)
  if (gymMechanic === 'cold_start') {
    state.gymColdStartActive = true
  }

  // respawn: store respawn count and revival HP
  if (gymMechanic === 'respawn' && gymMechanicConfig) {
    state.gymRespawnsLeft = gymMechanicConfig.respawnCount
    state.gymRespawnHp    = Math.floor(opponentCopy.maxHp * gymMechanicConfig.respawnHpPercent)
  }

  // cost_spiral: initialise spiral turn counter
  if (gymMechanic === 'cost_spiral') {
    state.gymSpiralTurns = 0
  }

  // all_domains: store shuffled domain state
  if (gymMechanic === 'all_domains') {
    state.gymDomainOrder   = gymDomainOrder
    state.gymDomainIndex   = gymDomainIndex
    state.gymExecutiveMode = gymExecutiveMode
  }

  return state
}

// ---------------------------------------------------------------------------
// getPreBattleEvents
// Returns dialog events to show before the first turn of an ENGINEER battle.
// Gym leaders use shame-aware dialog: high-shame players get wary lines.
// Non-gym trainers use introDialog.
// ---------------------------------------------------------------------------
export function getPreBattleEvents(state) {
  const events = []
  const opponent = state.opponent

  if (state.mode !== BATTLE_MODES.ENGINEER) return events

  const shame = state.player.shamePoints ?? 0
  const isGymLeader = opponent.role === 'gym_leader'

  if (isGymLeader && shame >= GYM_SHAME_THRESHOLDS.wary && opponent.preBattleDialog_highShame) {
    for (const line of opponent.preBattleDialog_highShame) {
      events.push({ type: 'dialog', target: 'player', text: line })
    }
  } else if (isGymLeader && opponent.preBattleDialog) {
    for (const line of opponent.preBattleDialog) {
      events.push({ type: 'dialog', target: 'player', text: line })
    }
  } else if (opponent.introDialog) {
    events.push({ type: 'dialog', target: 'player', text: opponent.introDialog })
  }

  return events
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

  // ☕ Sip Coffee — Shadow Engineer special action (shame 10+)
  // Skips the turn, restores COFFEE_SIP_HEAL HP. No skill resolution.
  if (skill.id === 'coffee_sip') {
    const shamePts = state.player.shamePoints ?? 0
    if (shamePts < SHADOW_ENGINEER.SHAME_THRESHOLD) {
      events.push({ type: 'skill_blocked', target: 'player', skillId: 'coffee_sip', reason: 'shadow_engineer_required' })
      return events
    }
    const healAmount = SHADOW_ENGINEER.COFFEE_SIP_HEAL
    const healed = Math.min(healAmount, state.player.maxHp - state.player.hp)
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + healAmount)
    events.push({ type: 'skill_used', target: 'player', skillId: 'coffee_sip' })
    events.push({ type: 'heal', target: 'player', value: healed })
    events.push({ type: 'dialog', target: 'player', text: '☕ *sips coffee*' })
    return events
  }

  // Enforce shameRequired gate — skills that require a minimum shame level
  // (e.g. kubectl_delete_production) cannot be used below that threshold.
  if (skill.shameRequired !== undefined && state.player.shamePoints < skill.shameRequired) {
    events.push({ type: 'skill_blocked', target: 'player', skillId: skill.id, reason: 'shame_required' })
    return events
  }

  // Shadow Engineer budget modifications (shame 10+)
  const isShadow = (state.player.shamePoints ?? 0) >= SHADOW_ENGINEER.SHAME_THRESHOLD
  if (isShadow && skill.budgetCost !== undefined && skill.budgetCost > 0) {
    let budgetMod = 0
    if (skill.tier === 'optimal') {
      budgetMod = SHADOW_ENGINEER.OPTIMAL_BUDGET_SURCHARGE
    } else if (skill.tier === 'cursed' || skill.tier === 'nuclear') {
      budgetMod = -SHADOW_ENGINEER.CURSED_BUDGET_DISCOUNT
    }
    if (budgetMod !== 0) {
      const adjustedCost = Math.max(0, skill.budgetCost + budgetMod)
      const budgetDelta = adjustedCost - skill.budgetCost
      if (budgetDelta > 0) {
        state.player.budget = Math.max(0, (state.player.budget ?? 0) - budgetDelta)
        events.push({ type: 'budget_drain', target: 'player', value: budgetDelta, source: 'shadow_fatigue' })
      } else if (budgetDelta < 0) {
        const refundAmount = Math.abs(budgetDelta)
        state.player.budget = (state.player.budget ?? 0) + refundAmount
        events.push({ type: 'budget_refund', target: 'player', value: refundAmount, source: 'shadow_fatigue' })
      }
    }
  }

  // --- Gym mechanic: legacy_only — block skills from blocked acts ---
  if (state.gymMechanic === 'legacy_only' && state.gymMechanicConfig) {
    const cfg = state.gymMechanicConfig
    if (skill.availableInAct != null && cfg.blockedActs && cfg.blockedActs.includes(skill.availableInAct)) {
      events.push({ type: 'skill_blocked', target: 'player', skillId: skill.id, reason: 'legacy_only' })
      return events
    }
  }

  // --- Gym mechanic: cold_start — block first non-observability skill ---
  if (state.gymColdStartActive && skill.domain !== 'observability') {
    state.gymColdStartActive = false
    events.push({ type: 'skill_blocked', target: 'player', skillId: skill.id, reason: 'cold_start' })
    return events
  }
  if (state.gymColdStartActive && skill.domain === 'observability') {
    // Observability skills bypass cold start — clear the flag without blocking
    state.gymColdStartActive = false
  }

  // --- Gym mechanic: flaky_pipeline — random skill failure for player ---
  if (state.gymMechanic === 'flaky_pipeline' && state.gymMechanicConfig) {
    if (Math.random() < state.gymMechanicConfig.failChance) {
      events.push({ type: 'skill_failed', target: 'player', skillId: skill.id, reason: 'flaky_pipeline' })
      return events
    }
  }

  // --- Gym mechanic: rbac_deny — IAM randomly blocks skill execution ---
  if (state.gymMechanic === 'rbac_deny' && state.gymMechanicConfig) {
    if (Math.random() < state.gymMechanicConfig.denyChance) {
      events.push({ type: 'skill_blocked', target: 'player', skillId: skill.id, reason: 'rbac_deny' })
      return events
    }
  }

  events.push({ type: 'skill_used', target: 'opponent', skillId: skill.id })

  const effect = skill.effect

  if (effect.type === 'damage') {
    // Check immuneDomains — opponent takes 0 damage from immune domains
    const immuneDomains = state.opponent.immuneDomains ?? []
    if (immuneDomains.includes(skill.domain)) {
      events.push({ type: 'damage', target: 'opponent', value: 0, immune: true, isImmune: true, domain: skill.domain })
    } else {
      // --- Gym mechanic: legacy_only — blocked domains deal 0 damage ---
      let dmg
      if (state.gymMechanic === 'legacy_only' && state.gymMechanicConfig
          && state.gymMechanicConfig.blockedDomains && state.gymMechanicConfig.blockedDomains.includes(skill.domain)) {
        dmg = 0
      } else {
        dmg = calculateDamage(skill, state.opponent.domain)
      }
      // Throttle status halves outgoing damage while preserving legitimate zero-damage results
      if (state.playerStatuses.find(s => s.name === 'throttle')) {
        dmg = Math.max(0, Math.floor(dmg * 0.5))
      }
      state.opponent.hp = Math.max(0, state.opponent.hp - dmg)
      events.push({ type: 'damage', target: 'opponent', value: dmg, isImmune: false, domain: skill.domain })
    }
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
    let healValue = effect.value
    // Shadow Engineer: healing effects restore 20% less
    if (isShadow) {
      healValue = Math.floor(healValue * (1 - SHADOW_ENGINEER.HEAL_REDUCTION))
    }
    const healed = Math.min(healValue, state.player.maxHp - state.player.hp)
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + healValue)
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
  // Pass current shame to applyShameGrime for doubled rate at Shadow Engineer.
  if (shameDelta > 0) {
    const nextEmblems = applyShameGrime(state.emblems ?? {}, shameDelta, state.player.shamePoints)
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
    // SCRIPTED encounters: no penalty on breach — escape handled in turnEndPhase
    if (state.mode !== BATTLE_MODES.SCRIPTED) {
      // Use gym-specific breach penalties if sla_timer mechanic is active
      const hpPenalty  = (state.gymMechanic === 'sla_timer' && state.gymMechanicConfig?.breachHpPenalty != null)
        ? state.gymMechanicConfig.breachHpPenalty
        : SLA_BREACH_HP_PENALTY
      const repPenalty = (state.gymMechanic === 'sla_timer' && state.gymMechanicConfig?.breachRepPenalty != null)
        ? state.gymMechanicConfig.breachRepPenalty
        : SLA_BREACH_REP_PENALTY
      state.player.hp         = Math.max(0, state.player.hp - hpPenalty)
      state.player.reputation = Math.max(REPUTATION_MIN, state.player.reputation - repPenalty)
      events.push({
        type:            'sla_breach',
        target:          'player',
        value:           hpPenalty,
        reputationLoss:  repPenalty,
      })
    }
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
  if (state.mode === BATTLE_MODES.INCIDENT || state.mode === BATTLE_MODES.SCRIPTED) return []
  if (state.opponent.hp <= 0) return []

  const events = []

  // Shame 5+: announce cursed mirror on first enemy turn
  if (state.turn === 1 && state.opponent.cursedMirrorSkill) {
    events.push({ type: 'dialog', target: 'opponent', text: 'You taught me something. Watch this.' })
  }

  // --- Gym mechanic: flaky_pipeline — random skill failure for enemy ---
  if (state.gymMechanic === 'flaky_pipeline' && state.gymMechanicConfig) {
    if (Math.random() < state.gymMechanicConfig.failChance) {
      const moveId = state.telegraphedMove ?? 'basic_attack'
      events.push({ type: 'skill_failed', target: 'opponent', skillId: moveId, reason: 'flaky_pipeline' })
      return events
    }
  }

  const moveId = state.telegraphedMove ?? 'basic_attack'

  events.push({ type: 'skill_used', target: 'player', skillId: moveId })

  // Executive Mode activation — boss-only mechanic
  if (state.opponent.isBoss && state.opponent.hp > 0 && state.opponent.hp / state.opponent.maxHp <= EXECUTIVE_MODE_THRESHOLD) {
    if (!state.executiveMode) {
      state.executiveMode = true
      events.push({ type: 'executive_mode', target: 'opponent' })
    }
  }

  // Enemy deals base power damage (domain matchup vs player not tracked since
  // the player has no fixed domain; difficulty scales enemy power).
  const baseDmg = ENEMY_BASE_POWER
  const dmg = state.executiveMode ? Math.floor(baseDmg * EXECUTIVE_MODE_MULTIPLIER) : baseDmg
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
  if (state.mode !== BATTLE_MODES.INCIDENT && state.mode !== BATTLE_MODES.SCRIPTED) return []
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
          // SCRIPTED encounters: no penalty on breach — escape handled in turnEndPhase
          if (state.mode !== BATTLE_MODES.SCRIPTED) {
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

    case INCIDENT_ATTACKS.THROTTLE: {
      const alreadyThrottled = state.playerStatuses.find(s => s.name === 'throttle')
      if (!alreadyThrottled) {
        state.playerStatuses.push({ name: 'throttle', duration: THROTTLE_DURATION })
      }
      events.push({ type: 'status_apply', target: 'player', statusName: 'throttle', duration: THROTTLE_DURATION })
      break
    }
  }

  return events
}

// ---------------------------------------------------------------------------
// Phase 4c: CostSpiralPhase
// Only runs when opponent has bossFlag === 'cost_spiral_active' (Azure Bill).
// Each turn: boss gains +20 HP, and a budget drain of (5×N) is applied.
// Boss deals budget damage (not HP). At 0 budget player can still use 0-cost skills.
// ---------------------------------------------------------------------------
export function costSpiralPhase(state) {
  if (state.opponent.bossFlag !== 'cost_spiral_active') return []

  const events = []
  const turn = state.turn

  // Boss gains HP each turn
  const hpGain = calculateCostSpiralHpGain()
  const currentHp = state.opponent.hp
  const currentMaxHp = state.opponent.maxHp ?? currentHp
  state.opponent.hp = currentHp + hpGain
  state.opponent.maxHp = currentMaxHp + hpGain
  events.push({ type: 'heal', target: 'opponent', value: hpGain, text: `Cost spiral: boss gains ${hpGain} HP` })

  // Budget drain escalation — boss deals budget damage
  const surcharge = calculateCostSpiralSurcharge(turn)
  const currentBudget = state.player.budget ?? 0
  state.player.budget = currentBudget - surcharge
  if (surcharge > 0) {
    events.push({ type: 'budget_drain', target: 'player', value: surcharge, text: `Cost spiral: -${surcharge} budget` })
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
    // Boss phase transition: takes priority over layer transitions
    if (state.bossPhases && state.bossPhases.length > 0) {
      const nextPhase = state.bossPhases.shift()
      state.opponent.hp     = nextPhase.hp
      state.opponent.maxHp  = nextPhase.maxHp
      state.opponent.domain = nextPhase.domain
      state.opponent.deck   = nextPhase.deck
      state.opponent.name   = nextPhase.name
      if (nextPhase.isLegacy !== undefined) {
        state.opponent.isLegacy = nextPhase.isLegacy
      }
      events.push({ type: 'boss_phase_transition', target: 'opponent', value: nextPhase })
      if (nextPhase.transitionDialog) {
        events.push({ type: 'dialog', target: 'player', text: nextPhase.transitionDialog })
      }
      // Reset deck index and telegraph to the new phase's first move
      state.opponentDeckIndex = 0
      const newDeck = nextPhase.deck
      if (newDeck && newDeck.length > 0) {
        state.telegraphedMove = newDeck[0]
        events.push({ type: 'telegraph', target: 'player', value: newDeck[0] })
      }
      state.turn += 1
      return events
    }

    // --- Gym mechanic: respawn — opponent comes back instead of dying ---
    if (state.gymMechanic === 'respawn' && state.gymRespawnsLeft > 0) {
      state.gymRespawnsLeft -= 1
      state.opponent.hp = state.gymRespawnHp
      events.push({ type: 'respawn', target: 'opponent', value: state.gymRespawnsLeft })
      state.turn += 1
      return events
    }

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

    // Boss encounters: shame-based outcome branching on win
    if (state.opponent.type === 'boss' && state.opponent.shameThresholds) {
      const shame = state.player.shamePoints ?? 0
      events.push({ type: 'boss_outcome', target: 'player', value: bossOutcome(shame, state.opponent.shameThresholds), shame })
    }

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

    // Drop item on win (e.g. Legacy Monolith drops oldcorp_keycard)
    if (state.opponent.dropItem) {
      events.push({ type: 'item_drop', target: 'player', value: state.opponent.dropItem })
    }

    // ENGINEER mode: tier-based teacher reactions with shame awareness
    // At high reputation (80+), trainers teach on ANY win tier (not just optimal).
    // Budget rewards: flat credit based on mode/tier + percentage restore
    const mode = state.mode === BATTLE_MODES.INCIDENT ? 'incident' : 'trainer'
    const rewardKey = state.mode === BATTLE_MODES.INCIDENT ? tier : 'win'
    const rewardCredits = calculateBattleReward(mode, rewardKey)
    const restore       = calculateBudgetRestore(true, state.player.maxBudget ?? state.player.budget ?? 500)
    const budgetGain    = rewardCredits + restore
    if (budgetGain > 0) {
      state.player.budget = (state.player.budget ?? 0) + budgetGain
      events.push({ type: 'budget_gain', target: 'player', value: budgetGain })
    }

    // Optimal win bonus (flat +25 on top of tier reward)
    if (tier === 'optimal') {
      state.player.budget = (state.player.budget ?? 0) + ECONOMY.OPTIMAL_WIN_BONUS
      events.push({ type: 'budget_gain', target: 'player', value: ECONOMY.OPTIMAL_WIN_BONUS, text: 'Optimal solution bonus!' })
    }

    // Debt penalty at battle end: accumulate technical_debt stacks when in budget debt
    const winDebtPenalty = calculateDebtPenalty(state.player.budget ?? 0)
    if (winDebtPenalty > 0) {
      state.player.technicalDebt = Math.min(MAX_TECHNICAL_DEBT, (state.player.technicalDebt ?? 0) + winDebtPenalty)
      events.push({ type: 'technical_debt', target: 'player', value: state.player.technicalDebt })
    }

    // ENGINEER mode: tier-based teacher reactions
    if (state.mode === BATTLE_MODES.ENGINEER) {
      const shame = state.player.shamePoints ?? 0
      const isGymLeader = state.opponent.role === 'gym_leader'
      const teachAny = shouldTeachOnAnyWin(state.player.reputation)

      // Gym leader shame-aware dialog: use high-shame post-defeat dialog when shame ≥ teachRefusal
      if (isGymLeader && shame >= GYM_SHAME_THRESHOLDS.teachRefusal && state.opponent.postDefeatDialog_highShame) {
        for (const line of state.opponent.postDefeatDialog_highShame) {
          events.push({ type: 'dialog', target: 'player', text: line })
        }
      } else if (isGymLeader && state.opponent.postDefeatDialog) {
        for (const line of state.opponent.postDefeatDialog) {
          events.push({ type: 'dialog', target: 'player', text: line })
        }
      }

      // Teach refusal: gym leaders refuse to teach at shame ≥ teachRefusal
      if (isGymLeader && shame >= GYM_SHAME_THRESHOLDS.teachRefusal) {
        events.push({ type: 'teach_refused', target: 'player', reason: 'shame' })
      } else if ((tier === 'optimal' || teachAny) && state.opponent.teachSkillId) {
        events.push({ type: 'teach_skill', target: 'player', value: state.opponent.teachSkillId })
      } else if (tier === 'standard') {
        if (!isGymLeader && state.opponent.winDialog) {
          events.push({ type: 'dialog', target: 'player', text: state.opponent.winDialog })
        } else if (state.opponent.teachSkillId) {
          events.push({ type: 'teach_hint', target: 'player', value: state.opponent.teachSkillId })
        }
      } else if (tier === 'cursed') {
        events.push({ type: 'trainer_disgusted', target: 'player' })
      } else if (tier === 'nuclear') {
        events.push({ type: 'warn_npcs', target: 'player' })
      }

      // Announce cursed mirror if the opponent has one
      if (state.opponent.cursedMirrorSkill) {
        events.push({ type: 'dialog', target: 'opponent', text: "Don't look at me like that. You started it." })
      }
    }

    events.push({ type: 'battle_end', target: 'player', value: 'win' })
    return events
  }

  if (playerDefeated || slaLoss) {
    // SCRIPTED encounters: SLA breach triggers escape, not a loss
    if (slaLoss && state.mode === BATTLE_MODES.SCRIPTED) {
      events.push({
        type:   'scripted_escape',
        target: 'opponent',
        value:  state.opponent.escapeLine ?? 'The enemy disconnected.',
      })
      events.push({ type: 'battle_end', target: 'player', value: 'escape' })
      return events
    }

    // Boss encounters: shame-based outcome branching
    if (state.opponent.type === 'boss' && state.opponent.shameThresholds) {
      const shame = state.player.shamePoints ?? 0
      events.push({ type: 'boss_outcome', target: 'player', value: bossOutcome(shame, state.opponent.shameThresholds), shame })
    }

    // Reputation penalty for losing an engineer battle (not SLA — that is penalised in slaTickPhase)
    if (playerDefeated && state.mode === BATTLE_MODES.ENGINEER) {
      state.player.reputation = Math.max(REPUTATION_MIN, state.player.reputation - ENGINEER_LOSE_REP_PENALTY)
      events.push({ type: 'reputation', target: 'player', value: -ENGINEER_LOSE_REP_PENALTY, shameDelta: 0 })
    }

    // Budget restore on loss (smaller percentage)
    const loseRestore = calculateBudgetRestore(false, state.player.maxBudget ?? state.player.budget ?? 500)
    if (loseRestore > 0) {
      state.player.budget = (state.player.budget ?? 0) + loseRestore
      events.push({ type: 'budget_gain', target: 'player', value: loseRestore })
    }

    // Debt penalty: accumulate technical_debt stacks when budget is negative
    const debtPenalty = calculateDebtPenalty(state.player.budget ?? 0)
    if (debtPenalty > 0) {
      state.player.technicalDebt = Math.min(MAX_TECHNICAL_DEBT, (state.player.technicalDebt ?? 0) + debtPenalty)
      events.push({ type: 'technical_debt', target: 'player', value: state.player.technicalDebt })
    }

    events.push({ type: 'battle_end', target: 'player', value: 'lose' })
    return events
  }

  // Battle continues — increment turn
  state.turn += 1

  // --- Gym mechanic: cost_spiral — opponent regen + budget drain after threshold ---
  if (state.gymMechanic === 'cost_spiral' && state.gymMechanicConfig) {
    state.gymSpiralTurns = (state.gymSpiralTurns ?? 0) + 1
    const cfg = state.gymMechanicConfig
    state.opponent.hp = Math.min(state.opponent.maxHp, state.opponent.hp + cfg.hpPerTurn)
    if (state.gymSpiralTurns >= cfg.spiralThreshold) {
      const drainAmount = cfg.attackPerTurn ?? 0
      const appliedDrain = Math.min(state.player.budget, drainAmount)
      state.player.budget -= appliedDrain
      events.push({ type: 'budget_drain', target: 'player', value: appliedDrain })
    }
  }

  // --- Gym mechanic: all_domains — periodic domain switching ---
  if (state.gymMechanic === 'all_domains' && state.gymMechanicConfig && state.gymDomainOrder) {
    const cfg = state.gymMechanicConfig
    if (!state.gymExecutiveMode && state.opponent.hp <= state.opponent.maxHp * cfg.executiveModeHpPercent) {
      state.gymExecutiveMode = true
    }
    const shouldSwitch = state.gymExecutiveMode
      || ((state.turn - 1) % cfg.switchInterval === 0)
    if (shouldSwitch) {
      const previousDomain = state.opponent.domain
      state.gymDomainIndex  = (state.gymDomainIndex + 1) % state.gymDomainOrder.length
      state.opponent.domain = state.gymDomainOrder[state.gymDomainIndex]
      if (state.opponent.domain !== previousDomain) {
        events.push({ type: 'domain_reveal', target: 'opponent', value: state.opponent.domain })
      }
    }
  }

  return events
}

// ---------------------------------------------------------------------------
// resolveTurn
// Runs all phases in order and returns the concatenated BattleEvent[].
// Phase order: StatusTick → Skill → SlaTick → IncidentAttack → CostSpiral → Enemy → TurnEnd
// ---------------------------------------------------------------------------
export function resolveTurn(state, skill) {
  const events = [
    ...statusTickPhase(state),
    ...skillPhase(state, skill),
    ...slaTickPhase(state),
    ...incidentAttackPhase(state),
    ...costSpiralPhase(state),
    ...enemyPhase(state),
    ...turnEndPhase(state),
  ]

  // Append all events to the battle log
  state.log.push(...events)

  return events
}
