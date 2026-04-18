import { describe, it, expect, beforeEach } from 'vitest'
import {
  applyStatus,
  removeStatus,
  tickStatuses,
  isStatusActive,
} from '../src/engine/StatusEngine.js'

// Helper: build a minimal battleState with statuses for a given target
function makeBattleState(playerStatuses = [], opponentStatuses = []) {
  return {
    player:   { statuses: playerStatuses },
    opponent: { statuses: opponentStatuses },
  }
}

// Helper: find status entry in battleState
function getStatus(battleState, target, statusId) {
  return battleState[target].statuses.find(s => s.id === statusId)
}

describe('isStatusActive', () => {
  it('returns false when target has no statuses', () => {
    const state = makeBattleState()
    expect(isStatusActive(state, 'player', 'throttled')).toBe(false)
  })

  it('returns true when status is present with remaining duration > 0', () => {
    const state = makeBattleState([{ id: 'throttled', remaining: 2 }])
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)
  })

  it('returns false when status remaining is 0', () => {
    const state = makeBattleState([{ id: 'throttled', remaining: 0 }])
    expect(isStatusActive(state, 'player', 'throttled')).toBe(false)
  })

  it('returns true for permanent (duration -1) statuses', () => {
    const state = makeBattleState([{ id: 'technical_debt', remaining: -1 }])
    expect(isStatusActive(state, 'player', 'technical_debt')).toBe(true)
  })

  it('checks per-target independently', () => {
    const state = makeBattleState(
      [{ id: 'throttled', remaining: 2 }],  // player has throttled
      [],                                    // opponent does not
    )
    expect(isStatusActive(state, 'player',   'throttled')).toBe(true)
    expect(isStatusActive(state, 'opponent', 'throttled')).toBe(false)
  })
})

describe('applyStatus', () => {
  it('returns an array of BattleEvent objects', () => {
    const state  = makeBattleState()
    const events = applyStatus(state, 'player', 'throttled')
    expect(Array.isArray(events)).toBe(true)
    expect(events.length).toBeGreaterThan(0)
  })

  it('emits a status_apply event with correct shape', () => {
    const state  = makeBattleState()
    const events = applyStatus(state, 'player', 'throttled')
    const applyEvt = events.find(e => e.type === 'status_apply')
    expect(applyEvt).toBeDefined()
    expect(applyEvt.target).toBe('player')
    expect(applyEvt.value).toBe('throttled')
  })

  it('adds the status to battleState.player.statuses', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)
  })

  it('adds status with correct duration for throttled (3)', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    const entry = getStatus(state, 'player', 'throttled')
    expect(entry.remaining).toBe(3)
  })

  it('adds status with correct duration for cold_start (1)', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'cold_start')
    const entry = getStatus(state, 'player', 'cold_start')
    expect(entry.remaining).toBe(1)
  })

  it('adds status with correct duration for deprecated (4)', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'deprecated')
    const entry = getStatus(state, 'player', 'deprecated')
    expect(entry.remaining).toBe(4)
  })

  it('adds technical_debt with permanent duration (-1)', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'technical_debt')
    const entry = getStatus(state, 'player', 'technical_debt')
    expect(entry.remaining).toBe(-1)
  })

  it('in_review receives a random duration between 1 and 3 inclusive', () => {
    // Run 50 times to get coverage of the range; values must all be 1–3
    for (let i = 0; i < 50; i++) {
      const state = makeBattleState()
      applyStatus(state, 'player', 'in_review')
      const entry = getStatus(state, 'player', 'in_review')
      expect(entry.remaining).toBeGreaterThanOrEqual(1)
      expect(entry.remaining).toBeLessThanOrEqual(3)
      expect(Number.isInteger(entry.remaining)).toBe(true)
    }
  })

  it('stacking technical_debt adds a new stack entry rather than resetting', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'technical_debt')
    applyStatus(state, 'player', 'technical_debt')
    const entries = state.player.statuses.filter(s => s.id === 'technical_debt')
    expect(entries.length).toBe(2)
  })

  it('applying throttled again resets duration (refreshes)', () => {
    const state = makeBattleState([{ id: 'throttled', remaining: 1 }])
    applyStatus(state, 'player', 'throttled')
    const entry = getStatus(state, 'player', 'throttled')
    expect(entry.remaining).toBe(3)
    // Only one entry — refreshed, not duplicated
    const entries = state.player.statuses.filter(s => s.id === 'throttled')
    expect(entries.length).toBe(1)
  })

  it('applies to opponent independently', () => {
    const state = makeBattleState()
    applyStatus(state, 'opponent', 'deprecated')
    expect(isStatusActive(state, 'opponent', 'deprecated')).toBe(true)
    expect(isStatusActive(state, 'player',   'deprecated')).toBe(false)
  })

  it('returns empty array for unknown statusId (no-op)', () => {
    const state  = makeBattleState()
    const events = applyStatus(state, 'player', 'nonexistent_status')
    expect(events).toEqual([])
  })
})

describe('removeStatus', () => {
  it('removes an active status', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)

    removeStatus(state, 'player', 'throttled')
    expect(isStatusActive(state, 'player', 'throttled')).toBe(false)
  })

  it('returns status_remove event with correct shape', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')

    const events = removeStatus(state, 'player', 'throttled')
    expect(events.length).toBe(1)
    expect(events[0]).toEqual({
      type:   'status_remove',
      target: 'player',
      value:  'throttled',
      reason: 'manual',
      text:   'throttled removed from player',
    })
  })

  it('returns empty array when status not present', () => {
    const state  = makeBattleState()
    const events = removeStatus(state, 'player', 'throttled')
    expect(events).toEqual([])
  })

  it('technical debt cannot be removed', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'technical_debt')
    expect(isStatusActive(state, 'player', 'technical_debt')).toBe(true)

    const events = removeStatus(state, 'player', 'technical_debt')
    expect(events).toEqual([])
    expect(isStatusActive(state, 'player', 'technical_debt')).toBe(true)
  })

  it('only removes from specified target', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    applyStatus(state, 'opponent', 'throttled')

    removeStatus(state, 'player', 'throttled')
    expect(isStatusActive(state, 'player',   'throttled')).toBe(false)
    expect(isStatusActive(state, 'opponent', 'throttled')).toBe(true)
  })

  it('status array is actually modified', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    expect(state.player.statuses.length).toBe(1)

    removeStatus(state, 'player', 'throttled')
    expect(state.player.statuses.length).toBe(0)
  })
})

describe('tickStatuses', () => {
  it('returns an array', () => {
    const state  = makeBattleState()
    const events = tickStatuses(state, 'player')
    expect(Array.isArray(events)).toBe(true)
  })

  it('decrements remaining by 1 each tick for finite statuses', () => {
    const state = makeBattleState([{ id: 'throttled', remaining: 3 }])
    tickStatuses(state, 'player')
    expect(getStatus(state, 'player', 'throttled').remaining).toBe(2)
  })

  it('emits status_tick events for active statuses', () => {
    const state  = makeBattleState([{ id: 'deprecated', remaining: 4 }])
    const events = tickStatuses(state, 'player')
    const tickEvt = events.find(e => e.type === 'status_tick')
    expect(tickEvt).toBeDefined()
    expect(tickEvt.target).toBe('player')
    expect(tickEvt.value).toBe('deprecated')
  })

  it('removes status when remaining reaches 0', () => {
    const state = makeBattleState([{ id: 'cold_start', remaining: 1 }])
    tickStatuses(state, 'player')
    expect(state.player.statuses.find(s => s.id === 'cold_start')).toBeUndefined()
  })

  it('emits status_remove event with reason expired when status expires', () => {
    const state  = makeBattleState([{ id: 'cold_start', remaining: 1 }])
    const events = tickStatuses(state, 'player')
    const expiredEvt = events.find(e => e.type === 'status_remove' && e.reason === 'expired')
    expect(expiredEvt).toBeDefined()
    expect(expiredEvt.target).toBe('player')
    expect(expiredEvt.value).toBe('cold_start')
  })

  it('does NOT decrement technical_debt (permanent, duration -1)', () => {
    const state = makeBattleState([{ id: 'technical_debt', remaining: -1 }])
    tickStatuses(state, 'player')
    const entry = getStatus(state, 'player', 'technical_debt')
    expect(entry).toBeDefined()
    expect(entry.remaining).toBe(-1)
  })

  it('technical_debt never expires', () => {
    const state = makeBattleState([{ id: 'technical_debt', remaining: -1 }])
    // Tick 10 times — should still be present
    for (let i = 0; i < 10; i++) tickStatuses(state, 'player')
    expect(isStatusActive(state, 'player', 'technical_debt')).toBe(true)
  })

  it('multiple statuses tick independently', () => {
    const state = makeBattleState([
      { id: 'throttled',  remaining: 3 },
      { id: 'deprecated', remaining: 2 },
    ])
    tickStatuses(state, 'player')
    expect(getStatus(state, 'player', 'throttled').remaining).toBe(2)
    expect(getStatus(state, 'player', 'deprecated').remaining).toBe(1)
  })

  it('only ticks target statuses — opponent unaffected when ticking player', () => {
    const state = makeBattleState(
      [{ id: 'throttled', remaining: 3 }],
      [{ id: 'throttled', remaining: 3 }],
    )
    tickStatuses(state, 'player')
    expect(getStatus(state, 'player',   'throttled').remaining).toBe(2)
    expect(getStatus(state, 'opponent', 'throttled').remaining).toBe(3)
  })

  it('after expiry the status is fully gone from statuses array', () => {
    const state = makeBattleState([{ id: 'throttled', remaining: 1 }])
    tickStatuses(state, 'player')
    expect(state.player.statuses.length).toBe(0)
  })

  it('emits no events when statuses list is empty', () => {
    const state  = makeBattleState()
    const events = tickStatuses(state, 'player')
    expect(events).toEqual([])
  })
})

describe('status full lifecycle — apply then tick to expiry', () => {
  it('throttled: apply → tick 3 times → expired', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'throttled')
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)

    tickStatuses(state, 'player') // remaining: 2
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)

    tickStatuses(state, 'player') // remaining: 1
    expect(isStatusActive(state, 'player', 'throttled')).toBe(true)

    const events = tickStatuses(state, 'player') // remaining: 0 → expired
    expect(isStatusActive(state, 'player', 'throttled')).toBe(false)
    expect(events.some(e => e.type === 'status_remove' && e.reason === 'expired')).toBe(true)
  })

  it('cold_start: apply → tick once → expired', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'cold_start')
    expect(isStatusActive(state, 'player', 'cold_start')).toBe(true)

    const events = tickStatuses(state, 'player')
    expect(isStatusActive(state, 'player', 'cold_start')).toBe(false)
    expect(events.some(e => e.type === 'status_remove' && e.reason === 'expired')).toBe(true)
  })

  it('technical_debt: apply → tick 100 times → still active', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'technical_debt')
    for (let i = 0; i < 100; i++) tickStatuses(state, 'player')
    expect(isStatusActive(state, 'player', 'technical_debt')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// shadow_fatigue status
// ---------------------------------------------------------------------------

describe('shadow_fatigue status', () => {
  it('can be applied as a permanent status', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'shadow_fatigue')
    expect(isStatusActive(state, 'player', 'shadow_fatigue')).toBe(true)
    const entry = getStatus(state, 'player', 'shadow_fatigue')
    expect(entry.remaining).toBe(-1) // permanent
  })

  it('never expires through ticking', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'shadow_fatigue')
    for (let i = 0; i < 100; i++) tickStatuses(state, 'player')
    expect(isStatusActive(state, 'player', 'shadow_fatigue')).toBe(true)
  })

  it('does not stack — refreshes instead', () => {
    const state = makeBattleState()
    applyStatus(state, 'player', 'shadow_fatigue')
    applyStatus(state, 'player', 'shadow_fatigue')
    const entries = state.player.statuses.filter(s => s.id === 'shadow_fatigue')
    expect(entries.length).toBe(1)
  })
})
