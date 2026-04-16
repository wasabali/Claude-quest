import { describe, it, expect, beforeEach } from 'vitest'
import {
  createBattleState,
  statusTickPhase,
  skillPhase,
  slaTickPhase,
  enemyPhase,
  turnEndPhase,
  resolveTurn,
  BATTLE_MODES,
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
