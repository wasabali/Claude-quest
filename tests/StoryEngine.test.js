import { describe, it, expect } from 'vitest'
import {
  checkActTransition,
  getKristofferLocation,
  getKristofferShameDialog,
  shouldTriggerViralWave,
  shouldTriggerThreeAmScene,
  getVisibleNpcs,
  resolveDialogPool,
} from '../src/engine/StoryEngine.js'

// ---------------------------------------------------------------------------
// checkActTransition
// ---------------------------------------------------------------------------
describe('checkActTransition', () => {
  it('returns prologue_to_1 when all trigger flags are true and act is 1', () => {
    const flags = { starter_deck_chosen: true, first_battle_won: true }
    const result = checkActTransition(1, flags)
    expect(result).not.toBeNull()
    expect(result.id).toBe('prologue_to_1')
    expect(result.newAct).toBe(1)
    expect(result.titleCard).toBe('ACT 1')
  })

  it('returns null when not all trigger flags are true', () => {
    const flags = { starter_deck_chosen: true, first_battle_won: false }
    expect(checkActTransition(1, flags)).toBeNull()
  })

  it('returns null when a trigger flag is missing entirely', () => {
    const flags = { starter_deck_chosen: true }
    expect(checkActTransition(1, flags)).toBeNull()
  })

  it('returns null when fromAct does not match currentAct', () => {
    // prologue_to_1 requires fromAct 1, but we pass act 0
    const flags = { starter_deck_chosen: true, first_battle_won: true }
    expect(checkActTransition(0, flags)).toBeNull()
  })

  it('returns act1_to_2 when act is 1 and all flags are met', () => {
    const flags = { margaret_quest_complete: true, gym_1_beaten: true }
    const result = checkActTransition(1, flags)
    expect(result).not.toBeNull()
    expect(result.id).toBe('act1_to_2')
    expect(result.newAct).toBe(2)
    expect(result.titleCard).toBe('ACT 2')
  })

  it('returns act2_to_3 when act is 2 and all flags are met', () => {
    const flags = { gym_2_beaten: true, gym_3_beaten: true, staging_deployed: true }
    const result = checkActTransition(2, flags)
    expect(result).not.toBeNull()
    expect(result.id).toBe('act2_to_3')
    expect(result.newAct).toBe(3)
  })

  it('returns act3_to_4 when act is 3 and all flags are met', () => {
    const flags = { gym_4_beaten: true, gym_5_beaten: true, do_not_touch_resolved: true }
    const result = checkActTransition(3, flags)
    expect(result).not.toBeNull()
    expect(result.id).toBe('act3_to_4')
    expect(result.newAct).toBe(4)
  })

  it('returns act4_to_finale when act is 4 and all flags are met', () => {
    const flags = { gym_6_beaten: true, gym_7_beaten: true, throttlemaster_unmasked: true }
    const result = checkActTransition(4, flags)
    expect(result).not.toBeNull()
    expect(result.id).toBe('act4_to_finale')
    expect(result.newAct).toBe(5)
    expect(result.titleCard).toBe('FINALE')
  })

  it('returns null when act is 5 (no transition from finale)', () => {
    const flags = { everything: true }
    expect(checkActTransition(5, flags)).toBeNull()
  })

  it('returns null with empty flags object', () => {
    expect(checkActTransition(1, {})).toBeNull()
  })

  it('does not match a different acts transition even if flags overlap', () => {
    // act2_to_3 flags set, but currentAct is 1 — should not match
    const flags = { gym_2_beaten: true, gym_3_beaten: true, staging_deployed: true }
    expect(checkActTransition(1, flags)).toBeNull()
  })

  it('returns the transition object with narration array', () => {
    const flags = { starter_deck_chosen: true, first_battle_won: true }
    const result = checkActTransition(1, flags)
    expect(Array.isArray(result.narration)).toBe(true)
    expect(result.narration.length).toBeGreaterThan(0)
  })

  it('transition includes titleSub field', () => {
    const flags = { starter_deck_chosen: true, first_battle_won: true }
    const result = checkActTransition(1, flags)
    expect(result.titleSub).toBe('"Push to Production"')
  })
})

// ---------------------------------------------------------------------------
// getKristofferLocation
// ---------------------------------------------------------------------------
describe('getKristofferLocation', () => {
  it('returns localhost_town for act 1', () => {
    expect(getKristofferLocation(1)).toBe('localhost_town')
  })

  it('returns production_plains for act 2', () => {
    expect(getKristofferLocation(2)).toBe('production_plains')
  })

  it('returns oldcorp_basement for act 3', () => {
    expect(getKristofferLocation(3)).toBe('oldcorp_basement')
  })

  it('returns architecture_district for act 4', () => {
    expect(getKristofferLocation(4)).toBe('architecture_district')
  })

  it('returns null for act 5 (absent in finale)', () => {
    expect(getKristofferLocation(5)).toBeNull()
  })

  it('returns localhost_town for postgame', () => {
    expect(getKristofferLocation('postgame')).toBe('localhost_town')
  })

  it('returns undefined for unknown act number', () => {
    expect(getKristofferLocation(99)).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getKristofferShameDialog
// ---------------------------------------------------------------------------
describe('getKristofferShameDialog', () => {
  it('returns highest threshold pages when shame >= 15', () => {
    const pages = getKristofferShameDialog(15)
    expect(pages).toEqual(["You're going to join him, aren't you."])
  })

  it('returns shame 15 pages for shame well above 15', () => {
    const pages = getKristofferShameDialog(100)
    expect(pages).toEqual(["You're going to join him, aren't you."])
  })

  it('returns shame 10 pages when shame is 10-14', () => {
    const pages = getKristofferShameDialog(10)
    expect(pages).toEqual(["You're going down the same path\nKarsten did. Please stop."])
  })

  it('returns shame 10 pages for shame 14', () => {
    const pages = getKristofferShameDialog(14)
    expect(pages).toEqual(["You're going down the same path\nKarsten did. Please stop."])
  })

  it('returns shame 7 pages when shame is 7-9', () => {
    const pages = getKristofferShameDialog(7)
    expect(pages).toEqual(["THROTTLEMASTER contacted you,\ndidn't he. I can tell."])
  })

  it('returns shame 7 pages for shame 9', () => {
    const pages = getKristofferShameDialog(9)
    expect(pages).toEqual(["THROTTLEMASTER contacted you,\ndidn't he. I can tell."])
  })

  it('returns shame 3 pages when shame is 3-6', () => {
    const pages = getKristofferShameDialog(3)
    expect(pages).toEqual(["I've heard some… concerning things\nabout your methods."])
  })

  it('returns shame 3 pages for shame 6', () => {
    const pages = getKristofferShameDialog(6)
    expect(pages).toEqual(["I've heard some… concerning things\nabout your methods."])
  })

  it('returns null when shame is below all thresholds (shame 2)', () => {
    expect(getKristofferShameDialog(2)).toBeNull()
  })

  it('returns null when shame is 0', () => {
    expect(getKristofferShameDialog(0)).toBeNull()
  })

  it('returns null for negative shame', () => {
    expect(getKristofferShameDialog(-5)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// shouldTriggerViralWave
// ---------------------------------------------------------------------------
describe('shouldTriggerViralWave', () => {
  it('returns true when act=2, location=production_plains, wave not complete', () => {
    expect(shouldTriggerViralWave(2, 'production_plains', {})).toBe(true)
  })

  it('returns false when act is not 2', () => {
    expect(shouldTriggerViralWave(1, 'production_plains', {})).toBe(false)
    expect(shouldTriggerViralWave(3, 'production_plains', {})).toBe(false)
  })

  it('returns false when location is not production_plains', () => {
    expect(shouldTriggerViralWave(2, 'localhost_town', {})).toBe(false)
    expect(shouldTriggerViralWave(2, 'oldcorp_basement', {})).toBe(false)
  })

  it('returns false when viral_wave_complete is already true', () => {
    expect(shouldTriggerViralWave(2, 'production_plains', { viral_wave_complete: true })).toBe(false)
  })

  it('returns true when viral_wave_complete is explicitly false', () => {
    expect(shouldTriggerViralWave(2, 'production_plains', { viral_wave_complete: false })).toBe(true)
  })

  it('returns false when all conditions are wrong', () => {
    expect(shouldTriggerViralWave(1, 'localhost_town', { viral_wave_complete: true })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// shouldTriggerThreeAmScene
// ---------------------------------------------------------------------------
describe('shouldTriggerThreeAmScene', () => {
  it('returns true when viral_wave_complete is true and three_am_scene_complete is not set', () => {
    expect(shouldTriggerThreeAmScene({ viral_wave_complete: true })).toBe(true)
  })

  it('returns false when viral_wave_complete is not set', () => {
    expect(shouldTriggerThreeAmScene({})).toBe(false)
  })

  it('returns false when viral_wave_complete is false', () => {
    expect(shouldTriggerThreeAmScene({ viral_wave_complete: false })).toBe(false)
  })

  it('returns false when three_am_scene_complete is already true', () => {
    expect(shouldTriggerThreeAmScene({
      viral_wave_complete: true,
      three_am_scene_complete: true,
    })).toBe(false)
  })

  it('returns true when three_am_scene_complete is explicitly false', () => {
    expect(shouldTriggerThreeAmScene({
      viral_wave_complete: true,
      three_am_scene_complete: false,
    })).toBe(true)
  })

  it('returns false when both flags are missing', () => {
    expect(shouldTriggerThreeAmScene({})).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getVisibleNpcs
// ---------------------------------------------------------------------------
describe('getVisibleNpcs', () => {
  it('returns empty array for act 1 (NPCs start appearing from act 2 onwards)', () => {
    const npcs = getVisibleNpcs(1)
    expect(npcs).toEqual([])
  })

  it('returns sla_signe for act 2 (appearsInAct: 2)', () => {
    const npcs = getVisibleNpcs(2)
    expect(npcs).toContain('sla_signe')
    expect(npcs).not.toContain('dagny_the_dba')
    expect(npcs).not.toContain('compliance_carina')
    expect(npcs).not.toContain('pedersen_finale')
  })

  it('returns sla_signe and dagny_the_dba for act 3', () => {
    const npcs = getVisibleNpcs(3)
    expect(npcs).toContain('sla_signe')
    expect(npcs).toContain('dagny_the_dba')
    expect(npcs).not.toContain('compliance_carina')
    expect(npcs).not.toContain('pedersen_finale')
  })

  it('returns sla_signe, dagny_the_dba, and compliance_carina for act 4', () => {
    const npcs = getVisibleNpcs(4)
    expect(npcs).toContain('sla_signe')
    expect(npcs).toContain('dagny_the_dba')
    expect(npcs).toContain('compliance_carina')
    expect(npcs).not.toContain('pedersen_finale')
  })

  it('returns all NPCs for act 5', () => {
    const npcs = getVisibleNpcs(5)
    expect(npcs).toContain('sla_signe')
    expect(npcs).toContain('dagny_the_dba')
    expect(npcs).toContain('compliance_carina')
    expect(npcs).toContain('pedersen_finale')
    expect(npcs).toHaveLength(4)
  })

  it('returns an array (never null or undefined)', () => {
    const npcs = getVisibleNpcs(0)
    expect(Array.isArray(npcs)).toBe(true)
  })

  it('returns all NPCs for very high act number', () => {
    const npcs = getVisibleNpcs(99)
    expect(npcs).toHaveLength(4)
  })
})

// ---------------------------------------------------------------------------
// resolveDialogPool
// ---------------------------------------------------------------------------
describe('resolveDialogPool', () => {
  const makeCtx = ({ act = 1, shame = 0, flags = {}, name = 'TestUser' } = {}) => ({
    player: { shamePoints: shame, name },
    story:  { act, flags },
  })

  it('returns null for empty pools array', () => {
    expect(resolveDialogPool([], makeCtx())).toBeNull()
  })

  it('returns null for non-array pools', () => {
    expect(resolveDialogPool(null, makeCtx())).toBeNull()
    expect(resolveDialogPool(undefined, makeCtx())).toBeNull()
  })

  it('returns pages from first matching entry (no conditions = always matches)', () => {
    const pools = [{ key: 'default', condition: {}, pages: ['Hello'] }]
    expect(resolveDialogPool(pools, makeCtx())).toEqual(['Hello'])
  })

  it('matches flag condition when flag is true', () => {
    const pools = [{ key: 'k', condition: { flag: 'defeated' }, pages: ['Beaten'] }]
    expect(resolveDialogPool(pools, makeCtx({ flags: { defeated: true } }))).toEqual(['Beaten'])
  })

  it('skips entry when flag condition is false', () => {
    const pools = [{ key: 'k', condition: { flag: 'defeated' }, pages: ['Beaten'] }]
    expect(resolveDialogPool(pools, makeCtx({ flags: {} }))).toBeNull()
  })

  it('matches shameMin condition when shame meets threshold', () => {
    const pools = [{ key: 'k', condition: { shameMin: 7 }, pages: ['High shame'] }]
    expect(resolveDialogPool(pools, makeCtx({ shame: 7 }))).toEqual(['High shame'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 15 }))).toEqual(['High shame'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 6 }))).toBeNull()
  })

  it('matches shameMax condition when shame is at or below threshold', () => {
    const pools = [{ key: 'k', condition: { shameMax: 5 }, pages: ['Low shame'] }]
    expect(resolveDialogPool(pools, makeCtx({ shame: 0 }))).toEqual(['Low shame'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 5 }))).toEqual(['Low shame'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 6 }))).toBeNull()
  })

  it('matches act condition when act matches', () => {
    const pools = [{ key: 'k', condition: { act: 3 }, pages: ['Act 3 line'] }]
    expect(resolveDialogPool(pools, makeCtx({ act: 3 }))).toEqual(['Act 3 line'])
    expect(resolveDialogPool(pools, makeCtx({ act: 2 }))).toBeNull()
  })

  it('matches combined act + shameMin condition', () => {
    const pools = [{ key: 'k', condition: { act: 4, shameMin: 7 }, pages: ['Act 4 high shame'] }]
    expect(resolveDialogPool(pools, makeCtx({ act: 4, shame: 7 }))).toEqual(['Act 4 high shame'])
    expect(resolveDialogPool(pools, makeCtx({ act: 4, shame: 6 }))).toBeNull()
    expect(resolveDialogPool(pools, makeCtx({ act: 3, shame: 10 }))).toBeNull()
  })

  it('evaluates pools in order and returns first match', () => {
    const pools = [
      { key: 'specific', condition: { shameMin: 15 }, pages: ['Recruitment'] },
      { key: 'general',  condition: { shameMin: 7  }, pages: ['High shame'] },
    ]
    expect(resolveDialogPool(pools, makeCtx({ shame: 15 }))).toEqual(['Recruitment'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 10 }))).toEqual(['High shame'])
    expect(resolveDialogPool(pools, makeCtx({ shame: 3  }))).toBeNull()
  })

  it('picks a single random line from pool entries', () => {
    const pools = [{ key: 'k', condition: {}, pool: ['Line A', 'Line B', 'Line C'] }]
    const result = resolveDialogPool(pools, makeCtx())
    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(1)
    expect(['Line A', 'Line B', 'Line C']).toContain(result[0])
  })

  it('replaces [name] placeholder with player name', () => {
    const pools = [{ key: 'k', condition: {}, pages: ['Hello, [name].', 'Goodbye, [name].'] }]
    const result = resolveDialogPool(pools, makeCtx({ name: 'Alice' }))
    expect(result).toEqual(['Hello, Alice.', 'Goodbye, Alice.'])
  })

  it('replaces [name] in pool lines', () => {
    const pools = [{ key: 'k', condition: {}, pool: ['Hi [name]!'] }]
    const result = resolveDialogPool(pools, makeCtx({ name: 'Bob' }))
    expect(result[0]).toBe('Hi Bob!')
  })

  it('falls back to "engineer" when player.name is absent', () => {
    const pools = [{ key: 'k', condition: {}, pages: ['Hello, [name].'] }]
    const result = resolveDialogPool(pools, { player: { shamePoints: 0 }, story: { act: 1, flags: {} } })
    expect(result).toEqual(['Hello, engineer.'])
  })

  it('skips entries with empty pool/pages and continues', () => {
    const pools = [
      { key: 'empty', condition: {}, pool: [] },
      { key: 'valid', condition: {}, pages: ['Fallback'] },
    ]
    expect(resolveDialogPool(pools, makeCtx())).toEqual(['Fallback'])
  })

  it('uses finale key when game_complete flag is set', () => {
    const pools = [{ key: 'k', condition: { act: 'finale' }, pages: ['Finale line'] }]
    const ctx = { player: { shamePoints: 0, name: 'X' }, story: { act: 4, flags: { game_complete: true } } }
    expect(resolveDialogPool(pools, ctx)).toEqual(['Finale line'])
  })

  it('does not match numeric act condition when game_complete overrides act to "finale"', () => {
    const pools = [{ key: 'k', condition: { act: 4 }, pages: ['Act 4 line'] }]
    const ctx = { player: { shamePoints: 0, name: 'X' }, story: { act: 4, flags: { game_complete: true } } }
    expect(resolveDialogPool(pools, ctx)).toBeNull()
  })
})
