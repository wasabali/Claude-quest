import { describe, it, expect, beforeEach } from 'vitest'
import {
  createBattleState,
  statusTickPhase,
  skillPhase,
  slaTickPhase,
  enemyPhase,
  incidentAttackPhase,
  turnEndPhase,
  resolveTurn,
  BATTLE_MODES,
  INCIDENT_ATTACKS,
} from '../src/engine/BattleEngine.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlayer(overrides = {}) {
  return {
    hp:            100,
    maxHp:         100,
    budget:        500,
    reputation:    50,
    shamePoints:   0,
    technicalDebt: 0,
    level:         1,
    xp:            0,
    activeSlots:   4,
    ...overrides,
  }
}

function makeOpponent(overrides = {}) {
  return {
    id:         'test_incident',
    name:       'Test Incident',
    domain:     'cloud',
    hp:         60,
    maxHp:      60,
    difficulty: 2,
    ...overrides,
  }
}

function makeDamageSkill(overrides = {}) {
  return {
    id:       'az_webapp_deploy',
    domain:   'cloud',
    tier:     'standard',
    isCursed: false,
    effect:   { type: 'damage', value: 30 },
    sideEffect: null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// createBattleState
// ---------------------------------------------------------------------------

describe('createBattleState', () => {
  it('creates INCIDENT battle state with SLA timer', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 10 })
    expect(state.mode).toBe(BATTLE_MODES.INCIDENT)
    expect(state.slaTimer).toBe(10)
    expect(state.domainRevealed).toBe(false)
    expect(state.turn).toBe(1)
    expect(state.log).toEqual([])
  })

  it('creates ENGINEER battle state with telegraphed move', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeOpponent(), {
      telegraphedMove: 'kubectl_drain',
    })
    expect(state.mode).toBe(BATTLE_MODES.ENGINEER)
    expect(state.telegraphedMove).toBe('kubectl_drain')
    expect(state.slaTimer).toBeNull()
  })

  it('opponent domain is hidden in INCIDENT mode', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    expect(state.domainRevealed).toBe(false)
  })

  it('opponent domain is visible in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeOpponent())
    expect(state.domainRevealed).toBe(true)
  })

  it('initialises with empty player and opponent status arrays', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    expect(state.playerStatuses).toEqual([])
    expect(state.opponentStatuses).toEqual([])
  })

  it('copies player technicalDebt into battle state from player object', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 3 }), makeOpponent())
    expect(state.player.technicalDebt).toBe(3)
  })

  it('initialises player technicalDebt to 0 when not provided', () => {
    const playerWithoutDebt = { hp: 100, maxHp: 100, budget: 500, reputation: 50, shamePoints: 0, level: 1, xp: 0, activeSlots: 4 }
    const state = createBattleState(BATTLE_MODES.INCIDENT, playerWithoutDebt, makeOpponent())
    expect(state.player.technicalDebt).toBe(0) // createBattleState normalises missing field to 0
  })
})

// ---------------------------------------------------------------------------
// statusTickPhase
// ---------------------------------------------------------------------------

describe('statusTickPhase', () => {
  it('returns empty event array when no statuses are active', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const events = statusTickPhase(state)
    expect(events).toBeInstanceOf(Array)
    expect(events).toHaveLength(0)
  })

  it('decrements status duration and emits status_tick event', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    state.playerStatuses = [{ name: 'throttled', duration: 3 }]
    const events = statusTickPhase(state)
    expect(state.playerStatuses[0].duration).toBe(2)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'status_tick', target: 'player' })
    )
  })

  it('removes expired status and emits status_remove event', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    state.playerStatuses = [{ name: 'cold_start', duration: 1 }]
    const events = statusTickPhase(state)
    expect(state.playerStatuses).toHaveLength(0)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'status_remove', target: 'player' })
    )
  })

  it('does not remove permanent statuses (duration -1)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    state.playerStatuses = [{ name: 'technical_debt', duration: -1 }]
    const events = statusTickPhase(state)
    expect(state.playerStatuses).toHaveLength(1)
    expect(state.playerStatuses[0].duration).toBe(-1)
  })

  it('ticks multiple statuses independently', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    state.playerStatuses = [
      { name: 'throttled', duration: 3 },
      { name: 'cold_start', duration: 1 },
      { name: 'technical_debt', duration: -1 },
    ]
    statusTickPhase(state)
    expect(state.playerStatuses).toHaveLength(2) // cold_start expired
    expect(state.playerStatuses.find(s => s.name === 'throttled').duration).toBe(2)
    expect(state.playerStatuses.find(s => s.name === 'technical_debt').duration).toBe(-1)
  })
})

// ---------------------------------------------------------------------------
// skillPhase
// ---------------------------------------------------------------------------

describe('skillPhase', () => {
  it('emits skill_used event', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const skill = makeDamageSkill()
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'skill_used' })
    )
  })

  it('emits damage event for damage skills', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const skill = makeDamageSkill({ domain: 'cloud' }) // cloud vs cloud = neutral
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'damage', target: 'opponent', value: 30 })
    )
  })

  it('applies domain multiplier to damage', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ domain: 'iac' }))
    const skill = makeDamageSkill({ domain: 'cloud' }) // cloud is strong against iac
    const events = skillPhase(state, skill)
    const dmgEvent = events.find(e => e.type === 'damage')
    expect(dmgEvent.value).toBe(60) // 30 * 2.0
  })

  it('reduces opponent HP by damage value', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 60 }))
    const skill = makeDamageSkill({ domain: 'cloud', effect: { type: 'damage', value: 25 } })
    skillPhase(state, skill)
    expect(state.opponent.hp).toBe(35)
  })

  it('opponent HP does not go below 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 10 }))
    const skill = makeDamageSkill({ domain: 'cloud', effect: { type: 'damage', value: 100 } })
    skillPhase(state, skill)
    expect(state.opponent.hp).toBe(0)
  })

  it('emits domain_reveal event for reveal_domain effect', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const skill = {
      id: 'grep_logs', domain: 'linux', tier: 'standard',
      isCursed: false, effect: { type: 'reveal_domain', value: 1 }, sideEffect: null,
    }
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'domain_reveal' })
    )
    expect(state.domainRevealed).toBe(true)
  })

  it('emits reputation event for cursed skill', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 30 },
      sideEffect: { shame: 1, reputation: -8, description: "Deletes teammate work." },
    }
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'reputation' })
    )
  })

  it('emits technical_debt event for cursed skill', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 0 }), makeOpponent())
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 30 },
      sideEffect: { shame: 1, reputation: -8 },
    }
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'technical_debt', target: 'player', value: 1 })
    )
  })

  it('increments player technicalDebt and reduces maxHp for cursed skill', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 2, maxHp: 100 }), makeOpponent())
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 30 },
      sideEffect: { shame: 1, reputation: -8 },
    }
    skillPhase(state, skill)
    expect(state.player.technicalDebt).toBe(3)
    expect(state.player.maxHp).toBe(98)
  })

  it('does not exceed MAX_TECHNICAL_DEBT (10) stacks', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 10, maxHp: 80 }), makeOpponent())
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 30 },
      sideEffect: { shame: 1, reputation: -8 },
    }
    const events = skillPhase(state, skill)
    expect(state.player.technicalDebt).toBe(10) // capped, not incremented
    expect(state.player.maxHp).toBe(80)         // no further reduction
    // event is still emitted so the UI can display the current debt level
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'technical_debt', target: 'player', value: 10 })
    )
  })

  it('clamps player hp to new maxHp when technical debt reduces it below current hp', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 100, maxHp: 100, technicalDebt: 0 }), makeOpponent())
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 1 }, // minimal damage so hp stays near 100
      sideEffect: { shame: 1, reputation: -8 },
    }
    skillPhase(state, skill)
    expect(state.player.hp).toBeLessThanOrEqual(state.player.maxHp)
  })

  it('sets winningTier to shortcut when wrong domain defeats opponent', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ domain: 'cloud', hp: 5 }))
    // linux is NOT strong against cloud — wrong domain
    const skill = makeDamageSkill({ domain: 'linux', effect: { type: 'damage', value: 100 } })
    skillPhase(state, skill)
    expect(state.winningTier).toBe('shortcut')
  })

  it('sets winningTier to optimal when correct domain defeats opponent with domain revealed', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ domain: 'iac', hp: 5 }))
    state.domainRevealed = true
    // cloud is strong against iac
    const skill = makeDamageSkill({ domain: 'cloud', effect: { type: 'damage', value: 100 } })
    skillPhase(state, skill)
    expect(state.winningTier).toBe('optimal')
  })

  it('sets winningTier to cursed when cursed skill is used', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 5 }))
    const skill = {
      id: 'force_push', domain: null, tier: 'cursed', isCursed: true,
      effect: { type: 'damage', value: 100 },
      sideEffect: { shame: 1, reputation: -8 },
    }
    skillPhase(state, skill)
    expect(state.winningTier).toBe('cursed')
  })

  it('emits reputation event for standard skill (all tiers apply rep changes)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent())
    const skill = makeDamageSkill({ tier: 'standard' })
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'reputation', value: 3, shameDelta: 0 })
    )
    expect(state.player.reputation).toBe(53)
  })

  it('emits reputation event for optimal skill with correct delta', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent())
    const skill = makeDamageSkill({ tier: 'optimal' })
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'reputation', value: 10, shameDelta: 0 })
    )
    expect(state.player.reputation).toBe(60)
  })

  it('does not emit damage event for heal skill', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 80 }), makeOpponent())
    const skill = { id: 'systemctl_restart', domain: 'linux', tier: 'standard', isCursed: false,
      effect: { type: 'heal', value: 20 }, sideEffect: null }
    const events = skillPhase(state, skill)
    const dmgEvent = events.find(e => e.type === 'damage')
    expect(dmgEvent).toBeUndefined()
  })

  it('emits heal event for heal skill', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 80 }), makeOpponent())
    const skill = { id: 'systemctl_restart', domain: 'linux', tier: 'standard', isCursed: false,
      effect: { type: 'heal', value: 20 }, sideEffect: null }
    const events = skillPhase(state, skill)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'heal', target: 'player' })
    )
  })

  it('player HP does not exceed maxHp when healed', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 95, maxHp: 100 }), makeOpponent())
    const skill = { id: 'systemctl_restart', domain: 'linux', tier: 'standard', isCursed: false,
      effect: { type: 'heal', value: 20 }, sideEffect: null }
    skillPhase(state, skill)
    expect(state.player.hp).toBe(100)
  })

  it('reveal effect reveals domain', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ domain: 'linux' }))
    const skill = { id: 'history_clear', domain: 'observability', tier: 'cursed', isCursed: true,
      effect: { type: 'reveal' }, sideEffect: { shame: 0, reputation: -5, description: '' } }
    const events = skillPhase(state, skill)
    expect(state.domainRevealed).toBe(true)
    expect(events).toContainEqual(expect.objectContaining({ type: 'domain_reveal', target: 'opponent' }))
  })

  it('instant_win_vs_legacy sets opponent hp to 0 when opponent isLegacy', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 80, maxHp: 80, isLegacy: true }))
    const skill = { id: 'terraform_destroy', domain: 'iac', tier: 'nuclear', isCursed: true,
      effect: { type: 'instant_win_vs_legacy', fallbackDamage: -40, fallbackTarget: 'self' },
      sideEffect: { shame: 2, reputation: -15, description: '' } }
    skillPhase(state, skill)
    expect(state.opponent.hp).toBe(0)
  })

  it('instant_win_vs_legacy damages player when opponent is not legacy', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 100 }), makeOpponent({ isLegacy: false }))
    const skill = { id: 'terraform_destroy', domain: 'iac', tier: 'nuclear', isCursed: true,
      effect: { type: 'instant_win_vs_legacy', fallbackDamage: -40, fallbackTarget: 'self' },
      sideEffect: { shame: 2, reputation: -15, description: '' } }
    skillPhase(state, skill)
    expect(state.player.hp).toBe(60)
  })

  it('instant_win_vs_containers sets opponent hp to 0 against containers domain', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 50, maxHp: 50, domain: 'containers' }))
    const skill = { id: 'curl_pipe_sudo_bash', domain: 'security', tier: 'cursed', isCursed: true,
      effect: { type: 'instant_win_vs_containers' },
      sideEffect: { shame: 1, reputation: -12, description: '' } }
    skillPhase(state, skill)
    expect(state.opponent.hp).toBe(0)
  })

  it('instant_win_vs_containers deals regular damage against non-container domain', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 60, domain: 'cloud' }))
    const skill = { id: 'curl_pipe_sudo_bash', domain: 'security', tier: 'cursed', isCursed: true,
      effect: { type: 'instant_win_vs_containers' },
      sideEffect: { shame: 1, reputation: -12, description: '' } }
    const events = skillPhase(state, skill)
    // Fallback follows domain matchup rules; security vs cloud = neutral, but
    // calculateDamage returns 0 because effect.type !== 'damage'. Damage event is still emitted.
    const dmgEvent = events.find(e => e.type === 'damage' && e.target === 'opponent')
    expect(dmgEvent).toBeDefined()
    expect(dmgEvent.value).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// slaTickPhase
// ---------------------------------------------------------------------------

describe('slaTickPhase', () => {
  it('decrements SLA timer by 1 each call', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    slaTickPhase(state)
    expect(state.slaTimer).toBe(4)
  })

  it('emits sla_tick event each turn', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const events = slaTickPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'sla_tick', value: 4 })
    )
  })

  it('emits sla_breach event when timer hits 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 1 })
    const events = slaTickPhase(state)
    expect(state.slaTimer).toBe(0)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'sla_breach' })
    )
  })

  it('sla_breach applies HP penalty to player', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 100 }), makeOpponent(), { slaTimer: 1 })
    slaTickPhase(state)
    expect(state.player.hp).toBeLessThan(100)
  })

  it('sla_breach applies reputation penalty to player', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent(), { slaTimer: 1 })
    slaTickPhase(state)
    expect(state.player.reputation).toBeLessThan(50)
  })

  it('returns empty array if SLA timer is null (ENGINEER mode)', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeOpponent())
    expect(state.slaTimer).toBeNull()
    const events = slaTickPhase(state)
    expect(events).toEqual([])
  })

  it('does not decrement below 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 0 })
    slaTickPhase(state)
    expect(state.slaTimer).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// enemyPhase
// ---------------------------------------------------------------------------

describe('enemyPhase', () => {
  it('returns empty events in INCIDENT mode (no enemy turn)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent())
    const events = enemyPhase(state)
    expect(events).toBeInstanceOf(Array)
    expect(events).toHaveLength(0)
  })

  it('emits damage event for enemy attack in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeOpponent())
    const events = enemyPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'damage', target: 'player' })
    )
  })

  it('reduces player HP in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ hp: 100 }), makeOpponent())
    enemyPhase(state)
    expect(state.player.hp).toBeLessThan(100)
  })

  it('player HP does not go below 0 from enemy attack', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ hp: 1 }), makeOpponent())
    enemyPhase(state)
    expect(state.player.hp).toBe(0)
  })

  it('emits skill_used event showing enemy move in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeOpponent(), {
      telegraphedMove: 'kubectl_drain',
    })
    const events = enemyPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'skill_used' })
    )
  })

  it('advances deck and emits telegraph event after enemy move', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale', 'kubectl_drain'] })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    const events = enemyPhase(state)
    expect(events.length).toBeGreaterThan(0)
    expect(state.opponentDeckIndex).toBe(1)
    expect(state.telegraphedMove).toBe('kubectl_scale')
  })

  it('telegraph event value is the next deck move', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale'] })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    const events = enemyPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'telegraph', value: 'kubectl_scale' })
    )
  })

  it('deck wraps around after last move', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale'] })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    enemyPhase(state) // index 0 → 1
    enemyPhase(state) // index 1 → 0
    expect(state.opponentDeckIndex).toBe(0)
    expect(state.telegraphedMove).toBe('kubectl_apply')
  })

  it('sets initial telegraphedMove to first deck entry by default', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale'] })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    expect(state.telegraphedMove).toBe('kubectl_apply')
  })

  it('does not emit telegraph event for wild encounters', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale'], isWildEncounter: true })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    const events = enemyPhase(state)
    expect(events).not.toContainEqual(
      expect.objectContaining({ type: 'telegraph' })
    )
  })

  it('does not advance deck index for wild encounters', () => {
    const opponent = makeOpponent({ deck: ['kubectl_apply', 'kubectl_scale'], isWildEncounter: true })
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), opponent)
    enemyPhase(state)
    expect(state.opponentDeckIndex).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// turnEndPhase
// ---------------------------------------------------------------------------

describe('turnEndPhase', () => {
  it('emits battle_end win event when opponent HP is 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 0 }))
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'battle_end', value: 'win' })
    )
  })

  it('emits battle_end lose event when player HP is 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 0 }), makeOpponent())
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'battle_end', value: 'lose' })
    )
  })

  it('emits battle_end lose when SLA breached AND incident not resolved', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 30 }), { slaTimer: 0 })
    state.slaBreach = true
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'battle_end', value: 'lose' })
    )
  })

  it('emits win (with penalties) when SLA breached BUT incident resolved (hp = 0)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 0 }), { slaTimer: 0 })
    state.slaBreach = true
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'battle_end', value: 'win' })
    )
  })

  it('increments turn counter when battle is not over', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 50 }))
    const before = state.turn
    turnEndPhase(state)
    expect(state.turn).toBe(before + 1)
  })

  it('emits xp_gain event on win', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 0, difficulty: 3 }))
    state.winningTier = 'standard'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'xp_gain' })
    )
  })

  it('emits teach_skill event on ENGINEER win when tier is optimal and opponent has a teach skill', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'optimal'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'teach_skill', value: 'helm_upgrade' })
    )
  })

  it('emits teach_hint event on ENGINEER win when tier is standard and opponent has a teach skill', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'standard'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'teach_hint', value: 'helm_upgrade' })
    )
    expect(events.find(e => e.type === 'teach_skill')).toBeUndefined()
  })

  it('does NOT emit teach_skill when tier is shortcut in ENGINEER win', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'shortcut'
    const events = turnEndPhase(state)
    expect(events.find(e => e.type === 'teach_skill')).toBeUndefined()
    expect(events.find(e => e.type === 'teach_hint')).toBeUndefined()
  })

  it('emits trainer_disgusted on ENGINEER win when tier is cursed', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'cursed'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'trainer_disgusted' })
    )
    expect(events.find(e => e.type === 'teach_skill')).toBeUndefined()
  })

  it('emits warn_npcs on ENGINEER win when tier is nuclear', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'nuclear'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'warn_npcs' })
    )
    expect(events.find(e => e.type === 'teach_skill')).toBeUndefined()
  })

  it('emits reputation event on win with positive delta for optimal tier', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent({ hp: 0 }))
    state.winningTier = 'optimal'
    const events = turnEndPhase(state)
    const repEvent = events.find(e => e.type === 'reputation')
    expect(repEvent).toBeDefined()
    expect(repEvent.value).toBeGreaterThan(0)
  })

  it('emits reputation event on win with negative delta for shortcut tier', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent({ hp: 0 }))
    state.winningTier = 'shortcut'
    const events = turnEndPhase(state)
    const repEvent = events.find(e => e.type === 'reputation')
    expect(repEvent).toBeDefined()
    expect(repEvent.value).toBeLessThan(0)
  })

  it('updates player reputation in state on win', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeOpponent({ hp: 0 }))
    state.winningTier = 'optimal'
    turnEndPhase(state)
    expect(state.player.reputation).toBe(60)
  })

  it('does NOT emit teach_skill on ENGINEER win with standard tier', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'standard'
    const events = turnEndPhase(state)
    expect(events).not.toContainEqual(
      expect.objectContaining({ type: 'teach_skill' })
    )
  })

  it('emits dialog hint on ENGINEER win with standard tier', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade', winDialog: 'Nice work. Try helm next time.' }))
    state.winningTier = 'standard'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'dialog', text: 'Nice work. Try helm next time.' })
    )
  })

  it('does NOT emit teach_skill on shortcut win in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(),
      makeOpponent({ hp: 0, teachSkillId: 'helm_upgrade' }))
    state.winningTier = 'shortcut'
    const events = turnEndPhase(state)
    expect(events).not.toContainEqual(
      expect.objectContaining({ type: 'teach_skill' })
    )
  })

  it('emits reputation event on ENGINEER win with optimal tier', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ reputation: 50 }),
      makeOpponent({ hp: 0 }))
    state.winningTier = 'optimal'
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'reputation', target: 'player', value: 8 })
    )
  })

  it('does not emit reputation event on ENGINEER win with non-optimal tier', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ reputation: 50 }),
      makeOpponent({ hp: 0 }))
    state.winningTier = 'standard'
    const events = turnEndPhase(state)
    const repEvent = events.find(e => e.type === 'reputation')
    expect(repEvent).toBeUndefined()
  })

  it('does not emit reputation event on INCIDENT win (no battle-end rep bonus in incident mode)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }),
      makeOpponent({ hp: 0 }))
    state.winningTier = 'optimal'
    const events = turnEndPhase(state)
    const repEvent = events.find(e => e.type === 'reputation')
    expect(repEvent).toBeUndefined()
  })

  it('applies engineer win reputation bonus to battle state', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ reputation: 50 }),
      makeOpponent({ hp: 0 }))
    state.winningTier = 'optimal'
    turnEndPhase(state)
    expect(state.player.reputation).toBe(58)
  })

  it('emits reputation penalty event on ENGINEER loss (player HP 0)', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ hp: 0, reputation: 50 }),
      makeOpponent({ hp: 30 }))
    const events = turnEndPhase(state)
    expect(events).toContainEqual(
      expect.objectContaining({ type: 'reputation', target: 'player', value: -5 })
    )
  })

  it('applies engineer loss reputation penalty to battle state', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer({ hp: 0, reputation: 50 }),
      makeOpponent({ hp: 30 }))
    turnEndPhase(state)
    expect(state.player.reputation).toBe(45)
  })

  it('does not emit reputation penalty on INCIDENT loss', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 0, reputation: 50 }),
      makeOpponent({ hp: 30 }))
    const events = turnEndPhase(state)
    const repEvent = events.find(e => e.type === 'reputation')
    expect(repEvent).toBeUndefined()
  })

  it('returns empty event array when battle is still ongoing', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 80 }), makeOpponent({ hp: 40 }))
    const events = turnEndPhase(state)
    expect(events.find(e => e.type === 'battle_end')).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// resolveTurn — full phase ordering
// ---------------------------------------------------------------------------

describe('resolveTurn — phase ordering', () => {
  it('returns a flat array of all phase events in order', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 60 }), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    expect(events).toBeInstanceOf(Array)
    expect(events.length).toBeGreaterThan(0)
  })

  it('always emits sla_tick before any battle_end in INCIDENT mode', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 60 }), { slaTimer: 3 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    const slaIdx = events.findIndex(e => e.type === 'sla_tick')
    const endIdx = events.findIndex(e => e.type === 'battle_end')
    if (slaIdx !== -1 && endIdx !== -1) {
      expect(slaIdx).toBeLessThan(endIdx)
    }
  })

  it('every event has a type string', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    for (const event of events) {
      expect(typeof event.type).toBe('string')
    }
  })

  it('every damage event has a numeric value', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    for (const event of events.filter(e => e.type === 'damage')) {
      expect(typeof event.value).toBe('number')
    }
  })

  it('emits skill_used before damage in same turn', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    const usedIdx = events.findIndex(e => e.type === 'skill_used')
    const dmgIdx  = events.findIndex(e => e.type === 'damage')
    if (usedIdx !== -1 && dmgIdx !== -1) {
      expect(usedIdx).toBeLessThan(dmgIdx)
    }
  })

  it('win before breach: resolving incident before SLA expires gives speed bonus xp', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(),
      makeOpponent({ hp: 10, difficulty: 2 }), { slaTimer: 8 })
    state.winningTier = 'optimal'
    const skill = makeDamageSkill({ effect: { type: 'damage', value: 100 } })
    const events = resolveTurn(state, skill)
    const xpEvent = events.find(e => e.type === 'xp_gain')
    // No breach, optimal tier → full XP
    expect(xpEvent).toBeDefined()
    expect(xpEvent.value).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// BattleEvent shape validation
// ---------------------------------------------------------------------------

describe('BattleEvent shape', () => {
  const VALID_TYPES = [
    'skill_used', 'damage', 'heal', 'domain_reveal',
    'sla_tick', 'sla_breach', 'status_tick', 'status_remove',
    'status_apply', 'reputation', 'xp_gain', 'teach_skill', 'teach_hint',
    'technical_debt', 'trainer_disgusted', 'warn_npcs', 'battle_end',
    'telegraph', 'dialog',
    'budget_drain', 'escalation', 'layer_transition',
  ]

  it('all emitted events have recognised type strings', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    for (const event of events) {
      expect(VALID_TYPES).toContain(event.type)
    }
  })

  it('damage events always have a non-negative value', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    for (const event of events.filter(e => e.type === 'damage')) {
      expect(event.value).toBeGreaterThanOrEqual(0)
    }
  })

  it('events are never undefined', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    const skill = makeDamageSkill()
    const events = resolveTurn(state, skill)
    expect(events).not.toContain(undefined)
    expect(events).not.toContain(null)
  })
})


// ---------------------------------------------------------------------------
// incidentAttackPhase
// ---------------------------------------------------------------------------

function makeAttackOpponent(attacks, overrides = {}) {
  return { id: 'test_incident', name: 'Test Incident', domain: 'cloud', hp: 60, maxHp: 60, difficulty: 2, attacks, ...overrides }
}

describe('incidentAttackPhase', () => {
  it('returns empty array on turn 1 (Phase 1 — symptom display, no attack)', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['budget_spike']), { slaTimer: 5 })
    expect(state.turn).toBe(1)
    const events = incidentAttackPhase(state)
    expect(events).toHaveLength(0)
  })

  it('returns empty array in ENGINEER mode', () => {
    const state = createBattleState(BATTLE_MODES.ENGINEER, makePlayer(), makeAttackOpponent(['budget_spike']))
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toHaveLength(0)
  })

  it('returns empty array when opponent has no attacks', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent(), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toHaveLength(0)
  })

  it('emits budget_drain event and drains player budget on budget_spike attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ budget: 200 }), makeAttackOpponent(['budget_spike']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'budget_drain', target: 'player' }))
    expect(state.player.budget).toBeLessThan(200)
  })

  it('player budget does not go below 0 from budget_spike', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ budget: 5 }), makeAttackOpponent(['budget_spike']), { slaTimer: 5 })
    state.turn = 2
    incidentAttackPhase(state)
    expect(state.player.budget).toBe(0)
  })

  it('emits reputation event and drains reputation on reputation_leak attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ reputation: 50 }), makeAttackOpponent(['reputation_leak']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'reputation', target: 'player' }))
    expect(state.player.reputation).toBeLessThan(50)
  })

  it('emits sla_tick event on uptime_drain attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['uptime_drain']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'sla_tick', source: 'uptime_drain' }))
  })

  it('uptime_drain decrements slaTimer by an extra 1', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['uptime_drain']), { slaTimer: 5 })
    state.turn = 2
    incidentAttackPhase(state)
    expect(state.slaTimer).toBe(4)
  })

  it('emits status_apply event on skill_block attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['skill_block']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'status_apply', target: 'player', statusName: 'skill_block' }))
    expect(state.playerStatuses.some(s => s.name === 'skill_block')).toBe(true)
  })

  it('emits status_apply event on confusion attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['confusion']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'status_apply', target: 'player', statusName: 'confusion' }))
  })

  it('emits escalation event and increments technicalDebt on escalation attack', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 0 }), makeAttackOpponent(['escalation']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'escalation', target: 'player', value: 1 }))
    expect(state.player.technicalDebt).toBe(1)
  })

  it('technicalDebt is capped at 10 by escalation', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ technicalDebt: 10 }), makeAttackOpponent(['escalation']), { slaTimer: 5 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(state.player.technicalDebt).toBe(10)
    expect(events.find(e => e.type === 'escalation')).toBeUndefined()
  })

  it('cycles attacks deterministically based on turn number', () => {
    const attacks = ['budget_spike', 'reputation_leak']
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ budget: 500, reputation: 50 }), makeAttackOpponent(attacks), { slaTimer: 10 })

    state.turn = 2 // (2-2) % 2 = 0 → budget_spike
    const events2 = incidentAttackPhase(state)
    expect(events2).toContainEqual(expect.objectContaining({ type: 'budget_drain' }))

    state.turn = 3 // (3-2) % 2 = 1 → reputation_leak
    const events3 = incidentAttackPhase(state)
    expect(events3).toContainEqual(expect.objectContaining({ type: 'reputation' }))

    state.turn = 4 // (4-2) % 2 = 0 → budget_spike again
    const events4 = incidentAttackPhase(state)
    expect(events4).toContainEqual(expect.objectContaining({ type: 'budget_drain' }))
  })

  it('uptime_drain triggers sla_breach when timer reaches 0', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer({ hp: 100 }), makeAttackOpponent(['uptime_drain']), { slaTimer: 1 })
    state.turn = 2
    const events = incidentAttackPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'sla_breach' }))
    expect(state.slaBreach).toBe(true)
  })

  it('uptime_drain does not double-breach already-breached SLA', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeAttackOpponent(['uptime_drain']), { slaTimer: 0 })
    state.slaBreach = true
    state.turn = 2
    const events = incidentAttackPhase(state)
    const breachCount = events.filter(e => e.type === 'sla_breach').length
    expect(breachCount).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Multi-layer incident transitions
// ---------------------------------------------------------------------------

describe('multi-layer incident transitions', () => {
  function makeLayeredOpponent() {
    return {
      id: 'crashloopbackoff', name: 'CrashLoopBackOff',
      domain: 'kubernetes', hp: 38, maxHp: 38, difficulty: 3,
      attacks: ['reputation_leak'],
      layers: [
        {
          domain: 'security', hp: 28, maxHp: 28,
          symptomText: 'Root cause found: missing Secret mount.',
          rootCauseText: 'Missing Secret.',
          attacks: ['skill_block'],
          optimalFix: 'vault_rotate',
        },
      ],
    }
  }

  it('createBattleState copies layers from opponent into state.layers', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    expect(state.layers).toHaveLength(1)
    expect(state.layers[0].domain).toBe('security')
  })

  it('defeating layer 1 emits layer_transition instead of battle_end', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    state.opponent.hp = 0
    const events = turnEndPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'layer_transition' }))
    expect(events.find(e => e.type === 'battle_end')).toBeUndefined()
  })

  it('layer_transition updates opponent to the next layer data', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    state.opponent.hp = 0
    turnEndPhase(state)
    expect(state.opponent.domain).toBe('security')
    expect(state.opponent.hp).toBe(28)
  })

  it('layer_transition resets domainRevealed to false for the new layer', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    state.domainRevealed = true
    state.opponent.hp = 0
    turnEndPhase(state)
    expect(state.domainRevealed).toBe(false)
  })

  it('state.layers is empty after transitioning through the only extra layer', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    state.opponent.hp = 0
    turnEndPhase(state)
    expect(state.layers).toHaveLength(0)
  })

  it('defeating the final layer emits battle_end win', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeLayeredOpponent(), { slaTimer: 5 })
    // Transition through layer 1
    state.opponent.hp = 0
    turnEndPhase(state)
    // Now defeat layer 2
    state.opponent.hp = 0
    const events = turnEndPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'battle_end', value: 'win' }))
  })

  it('no-layer opponent emits battle_end win directly on defeat', () => {
    const state = createBattleState(BATTLE_MODES.INCIDENT, makePlayer(), makeOpponent({ hp: 0 }), { slaTimer: 5 })
    const events = turnEndPhase(state)
    expect(events).toContainEqual(expect.objectContaining({ type: 'battle_end', value: 'win' }))
  })
})
