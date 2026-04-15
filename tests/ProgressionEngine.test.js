import { describe, it, expect } from 'vitest'
import { checkLevelUp, xpForLevel } from '../src/engine/ProgressionEngine.js'

describe('xpForLevel', () => {
  it('uses n*n*50 curve', () => {
    expect(xpForLevel(1)).toBe(50)
    expect(xpForLevel(5)).toBe(1250)
    expect(xpForLevel(30)).toBe(45000)
  })
})

describe('checkLevelUp', () => {
  it('returns single level-up and stat gain when crossing one threshold', () => {
    const player = {
      level: 1,
      xp: xpForLevel(2),
      maxHp: 100,
      budget: 1000,
    }

    const events = checkLevelUp(player)

    expect(events).toEqual([
      { type: 'level_up', payload: { newLevel: 2 } },
      { type: 'stat_gain', payload: { maxHp: 110, budget: 1025 } },
    ])
  })

  it('handles multi-level jumps in a single call', () => {
    const player = {
      level: 1,
      xp: xpForLevel(4),
      maxHp: 100,
      budget: 1000,
    }

    const events = checkLevelUp(player)

    expect(events).toEqual([
      { type: 'level_up', payload: { newLevel: 2 } },
      { type: 'stat_gain', payload: { maxHp: 110, budget: 1025 } },
      { type: 'level_up', payload: { newLevel: 3 } },
      { type: 'stat_gain', payload: { maxHp: 120, budget: 1050 } },
      { type: 'level_up', payload: { newLevel: 4 } },
      { type: 'stat_gain', payload: { maxHp: 130, budget: 1075 } },
    ])
  })

  it('emits slot unlock events at levels 5 and 10', () => {
    const levelFiveEvents = checkLevelUp({
      level: 4,
      xp: xpForLevel(5),
      maxHp: 140,
      budget: 1100,
    })

    const levelTenEvents = checkLevelUp({
      level: 9,
      xp: xpForLevel(10),
      maxHp: 190,
      budget: 1225,
    })

    expect(levelFiveEvents).toContainEqual({
      type: 'slot_unlock',
      payload: { activeSlots: 5 },
    })

    expect(levelTenEvents).toContainEqual({
      type: 'slot_unlock',
      payload: { activeSlots: 6 },
    })
  })

  it('emits no events at max level', () => {
    const events = checkLevelUp({
      level: 30,
      xp: xpForLevel(30) + 99999,
      maxHp: 390,
      budget: 1725,
    })

    expect(events).toEqual([])
  })

  it('does not mutate the player snapshot', () => {
    const player = {
      level: 1,
      xp: xpForLevel(3),
      maxHp: 100,
      budget: 1000,
    }

    const before = structuredClone(player)

    checkLevelUp(player)

    expect(player).toEqual(before)
  })
})
