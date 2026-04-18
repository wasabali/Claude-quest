import { describe, it, expect } from 'vitest'
import {
  selectFromPool,
  encounterChance,
  roll,
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

describe('encounterChance — modifiers', () => {
  it('cursedRecentlyUsed adds 0.30 to the capped chance', () => {
    const base     = encounterChance(50, 1)                                   // hits MAX_CHANCE = 0.25
    const modified = encounterChance(50, 1, { cursedRecentlyUsed: true })
    expect(modified).toBeCloseTo(base + 0.30, 5)
  })

  it('hasMonitorSkill subtracts 0.20 from the capped chance', () => {
    const base     = encounterChance(50, 1)                                   // hits MAX_CHANCE = 0.25
    const modified = encounterChance(50, 1, { hasMonitorSkill: true })
    expect(modified).toBeCloseTo(base - 0.20, 5)
  })

  it('both modifiers can be active simultaneously', () => {
    const base     = encounterChance(50, 1)
    const modified = encounterChance(50, 1, { cursedRecentlyUsed: true, hasMonitorSkill: true })
    expect(modified).toBeCloseTo(base + 0.10, 5)
  })

  it('chance never exceeds 1.0', () => {
    const chance = encounterChance(50, 1, { cursedRecentlyUsed: true })
    expect(chance).toBeLessThanOrEqual(1)
  })

  it('chance never goes below 0', () => {
    const chance = encounterChance(1, 1, { hasMonitorSkill: true })
    expect(chance).toBeGreaterThanOrEqual(0)
  })

  it('empty modifiers object does not change the result', () => {
    expect(encounterChance(10, 42, {})).toBe(encounterChance(10, 42))
  })

  it('is deterministic — same inputs always give same result', () => {
    const a = encounterChance(15, 99, { cursedRecentlyUsed: true })
    const b = encounterChance(15, 99, { cursedRecentlyUsed: true })
    expect(a).toBe(b)
  })
})

describe('selectFromPool — on-call hours', () => {
  it('only returns on-call incidents (prod_incident, sev1_at_3am) from production_plains', () => {
    // production_plains common: high_cpu, disk_full, 503_error — none onCall
    // rare: prod_incident (onCall), runaway_process (not onCall)
    // cursed: sev1_at_3am (onCall)
    // With 500 seeds we guarantee at least some on-call entries are returned.
    const onCallIds = new Set(['prod_incident', 'sev1_at_3am'])
    let gotAtLeastOne = false
    for (let seed = 1; seed <= 500; seed++) {
      const r = selectFromPool('production_plains', seed, 5, { isOnCallHours: true })
      if (r !== null) {
        gotAtLeastOne = true
        expect(onCallIds).toContain(r.enemyId)
      }
    }
    expect(gotAtLeastOne).toBe(true)
  })

  it('never returns a non-on-call encounter when isOnCallHours is true', () => {
    const nonOnCallIds = ['high_cpu', 'disk_full', '503_error', 'runaway_process']
    for (let seed = 1; seed <= 500; seed++) {
      const r = selectFromPool('production_plains', seed, 5, { isOnCallHours: true })
      if (r) {
        expect(nonOnCallIds).not.toContain(r.enemyId)
      }
    }
  })

  it('returns null for localhost_town regardless of isOnCallHours (all pools empty)', () => {
    expect(selectFromPool('localhost_town', 42, 5, { isOnCallHours: true })).toBeNull()
  })

  it('isOnCallHours: false behaves identically to omitting the option', () => {
    const r1 = selectFromPool('production_plains', 77, 10, { isOnCallHours: false })
    const r2 = selectFromPool('production_plains', 77, 10)
    expect(r1).toEqual(r2)
  })
})

describe('roll', () => {
  it('is deterministic — same args always return identical results', () => {
    const r1 = roll('pipeline_pass', 4, 42)
    const r2 = roll('pipeline_pass', 4, 42)
    expect(r1).toEqual(r2)
  })

  it('localhost_town always returns null (baseRate = 0)', () => {
    for (let step = 0; step < 20; step++) {
      for (let seed = 0; seed < 10; seed++) {
        expect(roll('localhost_town', step, seed)).toBeNull()
      }
    }
  })

  it('unknown region returns null (fallback has baseRate 0)', () => {
    expect(roll('nonexistent_region', 4, 42)).toBeNull()
    expect(roll('nonexistent_region', 8, 99)).toBeNull()
    expect(roll('nonexistent_region', 0, 1)).toBeNull()
  })

  it('only rolls on stepsPerRoll multiples — pipeline_pass (stepsPerRoll=4)', () => {
    // Steps not divisible by 4 must always return null regardless of seed
    const nonMultiples = [1, 2, 3, 5, 6, 7]
    for (const step of nonMultiples) {
      for (let seed = 0; seed < 50; seed++) {
        expect(roll('pipeline_pass', step, seed)).toBeNull()
      }
    }
  })

  it('step 0 always returns null — no encounter before the player moves', () => {
    for (let seed = 0; seed < 100; seed++) {
      expect(roll('pipeline_pass', 0, seed)).toBeNull()
      expect(roll('three_am_tavern', 0, seed)).toBeNull()
    }
  })

  it('statistical rate check — pipeline_pass triggers ~15% of the time', () => {
    let triggered = 0
    const trials = 1000
    for (let seed = 0; seed < trials; seed++) {
      if (roll('pipeline_pass', 4, seed) !== null) triggered++
    }
    const rate = triggered / trials
    expect(rate).toBeGreaterThan(0.05)
    expect(rate).toBeLessThan(0.30)
  })

  it('returns valid encounter shape when triggered', () => {
    // Find a seed that triggers an encounter at step 4 for pipeline_pass
    let encounter = null
    for (let seed = 0; seed < 10000; seed++) {
      encounter = roll('pipeline_pass', 4, seed)
      if (encounter !== null) break
    }
    expect(encounter).not.toBeNull()
    expect(typeof encounter.encounterType).toBe('string')
    expect(typeof encounter.enemyId).toBe('string')
    expect(typeof encounter.domain).toBe('string')
  })

  it('three_am_tavern has a higher trigger rate than pipeline_pass', () => {
    const trials = 1000
    let pipelineCount = 0
    let tavernCount = 0

    // Use step multiples that work for both regions
    // pipeline_pass: stepsPerRoll=4, three_am_tavern: stepsPerRoll=2
    // Use step 4 which is a multiple of both 4 and 2
    for (let seed = 0; seed < trials; seed++) {
      if (roll('pipeline_pass', 4, seed) !== null) pipelineCount++
      if (roll('three_am_tavern', 4, seed) !== null) tavernCount++
    }

    expect(tavernCount).toBeGreaterThan(pipelineCount)
  })
})
