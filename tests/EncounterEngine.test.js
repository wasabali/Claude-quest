import { describe, it, expect } from 'vitest'
import {
  selectFromPool,
  encounterChance,
} from '../src/engine/EncounterEngine.js'

// Stable seeds used across tests — values chosen to hit different pool buckets.
// These are just integer seeds for the PRNG; we verify reproducibility not the
// exact encounter ID (the PRNG output is deterministic, so the same seed will
// always resolve to the same encounter — we just check the shape is correct).

const VALID_ENCOUNTER_TYPES = ['incident', 'engineer']

describe('selectFromPool', () => {
  it('returns a valid encounter object shape', () => {
    const result = selectFromPool('pipeline_pass', 42, 10)
    expect(result).not.toBeNull()
    expect(typeof result.enemyId).toBe('string')
    expect(typeof result.encounterType).toBe('string')
    expect(typeof result.domain).toBe('string')
    expect(VALID_ENCOUNTER_TYPES).toContain(result.encounterType)
  })

  it('is deterministic — same seed + region + stepCount always returns same encounter', () => {
    const r1 = selectFromPool('production_plains', 9999, 15)
    const r2 = selectFromPool('production_plains', 9999, 15)
    expect(r1).toEqual(r2)
  })

  it('different seeds return different (statistically varied) results', () => {
    // Run 20 different seeds and check we get more than one unique enemy
    const results = new Set()
    for (let seed = 1; seed <= 20; seed++) {
      const r = selectFromPool('production_plains', seed, 5)
      results.add(r.enemyId)
    }
    expect(results.size).toBeGreaterThan(1)
  })

  it('returns null for unknown / empty region', () => {
    expect(selectFromPool('nonexistent_region', 42, 5)).toBeNull()
  })

  it('returns null for localhost_town (all pools empty)', () => {
    expect(selectFromPool('localhost_town', 42, 5)).toBeNull()
  })

  it('handles region with no cursed pool — redistributes weight to common/rare', () => {
    // pipeline_pass has empty cursed pool; should still return valid encounter
    const result = selectFromPool('pipeline_pass', 12, 5)
    expect(result).not.toBeNull()
    // Enemy should be from common or rare pool only
    const commonIds = ['npm_install_hang', '503_error', 'failed_pipeline']
    const rareIds   = ['merge_conflict', 'port_conflict']
    const allowed   = [...commonIds, ...rareIds]
    expect(allowed).toContain(result.enemyId)
  })

  it('can return a cursed encounter for regions with a cursed pool', () => {
    // jira_dungeon has cursed: ['the_gantt_chart']
    // Run many seeds to give cursed pool a chance to be selected
    const results = new Set()
    for (let seed = 1; seed <= 500; seed++) {
      const r = selectFromPool('jira_dungeon', seed, 5)
      if (r) results.add(r.enemyId)
    }
    expect(results).toContain('the_gantt_chart')
  })

  it('common pool is selected more often than rare (approximately 70:25 ratio)', () => {
    // production_plains: common=['high_cpu','disk_full','503_error'], rare=['prod_incident','runaway_process'], cursed=['sev1_at_3am']
    let commonCount = 0
    let rareCount   = 0
    let cursedCount = 0

    const commonIds = new Set(['high_cpu', 'disk_full', '503_error'])
    const rareIds   = new Set(['prod_incident', 'runaway_process'])
    const cursedIds = new Set(['sev1_at_3am'])

    for (let seed = 1; seed <= 1000; seed++) {
      const r = selectFromPool('production_plains', seed, 5)
      if (!r) continue
      if (commonIds.has(r.enemyId)) commonCount++
      else if (rareIds.has(r.enemyId)) rareCount++
      else if (cursedIds.has(r.enemyId)) cursedCount++
    }

    const total = commonCount + rareCount + cursedCount
    const commonRatio  = commonCount / total
    const rareRatio    = rareCount   / total
    const cursedRatio  = cursedCount / total

    // Allow generous tolerance due to small sample size; just ensure ordering
    expect(commonRatio).toBeGreaterThan(rareRatio)
    expect(rareRatio).toBeGreaterThan(cursedRatio)

    // Rough bounds — common ~70%, rare ~25%, cursed ~5%
    expect(commonRatio).toBeGreaterThan(0.60)
    expect(rareRatio).toBeGreaterThan(0.15)
    expect(cursedRatio).toBeGreaterThan(0.01)
  })

  it('when cursed pool empty, common and rare cover 100% of weight', () => {
    // pipeline_pass: cursed pool is empty
    let commonCount = 0
    let rareCount   = 0
    const commonIds = new Set(['npm_install_hang', '503_error', 'failed_pipeline'])
    const rareIds   = new Set(['merge_conflict', 'port_conflict'])

    for (let seed = 1; seed <= 500; seed++) {
      const r = selectFromPool('pipeline_pass', seed, 5)
      if (!r) continue
      if (commonIds.has(r.enemyId)) commonCount++
      else if (rareIds.has(r.enemyId)) rareCount++
    }

    const total = commonCount + rareCount
    // Expect ratio ~74:26 (70/95 ~ 0.737, 25/95 ~ 0.263)
    const commonRatio = commonCount / total
    expect(commonRatio).toBeGreaterThan(0.65)
    expect(commonRatio).toBeLessThan(0.85)
  })
})

describe('encounterChance', () => {
  it('returns a number between 0 and 1', () => {
    const chance = encounterChance(10, 42)
    expect(chance).toBeGreaterThanOrEqual(0)
    expect(chance).toBeLessThanOrEqual(1)
  })

  it('is deterministic — same stepCount + seed returns same value', () => {
    expect(encounterChance(7, 100)).toBe(encounterChance(7, 100))
  })

  it('probability increases with stepCount (up to a cap)', () => {
    // After more steps, should be more likely to encounter — check trend
    const lowSteps  = encounterChance(1,  1)
    const midSteps  = encounterChance(20, 1)
    const highSteps = encounterChance(50, 1)
    expect(highSteps).toBeGreaterThanOrEqual(midSteps)
    expect(midSteps).toBeGreaterThanOrEqual(lowSteps)
  })

  it('returns 0 on step 0', () => {
    expect(encounterChance(0, 1)).toBe(0)
  })
})
