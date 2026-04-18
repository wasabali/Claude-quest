// EncounterEngine.js — Pool-based random encounter selection.
// Pure logic only — no Phaser imports. Fully unit-testable with plain Node.js.

import { ENCOUNTER_POOLS, ENCOUNTER_RATES, getById as getEncounterById } from '#data/encounters.js'
import { seedRandom, randInt } from '#utils/random.js'

// Base pool weights
const BASE_COMMON_WEIGHT  = 70
const BASE_RARE_WEIGHT    = 25
const BASE_CURSED_WEIGHT  = 5

// Select an encounter from the pool for the given regionId.
// Uses seeded RNG — never Math.random() — so same args always return same result.
//
// options.isOnCallHours — when true, restricts all pools to encounters flagged
//   onCall: true (real clock 02:00–04:00 rule from the design spec).
//
// Returns { encounterType, enemyId, domain } or null when:
//  - the regionId does not exist in ENCOUNTER_POOLS
//  - all pools for the region are empty (or empty after on-call filter)
export function selectFromPool(regionId, seed, stepCount, options = {}) {
  const pool = ENCOUNTER_POOLS[regionId]
  if (!pool) return null

  let common = pool.common
  let rare   = pool.rare
  let cursed = pool.cursed

  // On-call hours: restrict all pools to encounters flagged onCall: true
  if (options.isOnCallHours) {
    const isOnCall = (id) => getEncounterById(id)?.onCall === true
    common = common.filter(isOnCall)
    rare   = rare.filter(isOnCall)
    cursed = cursed.filter(isOnCall)
  }

  const allEmpty = common.length === 0 && rare.length === 0 && cursed.length === 0
  if (allEmpty) return null

  const rand = seedRandom(seed ^ (stepCount * 0x9e3779b9))

  // Compute effective weights based on non-empty pools
  const hasCursed = cursed.length > 0
  const hasRare   = rare.length   > 0
  const hasCommon = common.length > 0

  let commonWeight = hasCommon ? BASE_COMMON_WEIGHT  : 0
  let rareWeight   = hasRare   ? BASE_RARE_WEIGHT    : 0
  let cursedWeight = hasCursed ? BASE_CURSED_WEIGHT  : 0

  // Redistribute weight from empty pools proportionally
  // If cursed pool is empty: split its weight proportionally to common and rare
  if (!hasCursed) {
    const totalRemaining = commonWeight + rareWeight
    if (totalRemaining > 0) {
      // redistribute BASE_CURSED_WEIGHT proportionally
      commonWeight += hasCommon ? Math.round(BASE_CURSED_WEIGHT * (BASE_COMMON_WEIGHT / (BASE_COMMON_WEIGHT + BASE_RARE_WEIGHT))) : 0
      rareWeight   += hasRare   ? Math.round(BASE_CURSED_WEIGHT * (BASE_RARE_WEIGHT   / (BASE_COMMON_WEIGHT + BASE_RARE_WEIGHT))) : 0
    }
    cursedWeight = 0
  }

  // If rare pool is also empty: all weight goes to common
  if (!hasRare) {
    commonWeight += rareWeight
    rareWeight    = 0
  }

  if (!hasCommon) {
    rareWeight += commonWeight
    commonWeight = 0
  }

  const totalWeight = commonWeight + rareWeight + cursedWeight
  const roll        = rand() * totalWeight

  let selectedPool
  if (roll < commonWeight) {
    selectedPool = common
  } else if (roll < commonWeight + rareWeight) {
    selectedPool = rare
  } else {
    selectedPool = cursed
  }

  if (selectedPool.length === 0) return null

  const idx     = randInt(rand, 0, selectedPool.length)
  const enemyId = selectedPool[idx]

  const encounter = getEncounterById(enemyId)
  if (!encounter) return null

  return {
    encounterType: encounter.type,
    enemyId:       encounter.id,
    domain:        encounter.domain,
  }
}

// Returns the probability (0–1) of triggering an encounter on the current step.
// Starts low, increases with stepCount, caps at a maximum.
// Pure function — same inputs always return same value.
// Returns 0 on step 0 (no encounter immediately on entering a region).
//
// modifiers:
//   cursedRecentlyUsed — player used a cursed technique recently (+30% additive)
//   hasMonitorSkill    — player has Azure Monitor skill equipped (−20% additive)
export function encounterChance(stepCount, seed, modifiers = {}) {
  if (stepCount === 0) return 0

  // Simple ramp: base 5% + 1% per step, cap at 25%
  const BASE_CHANCE   = 0.05
  const STEP_INCREASE = 0.01
  const MAX_CHANCE    = 0.25

  const rawChance = BASE_CHANCE + STEP_INCREASE * (stepCount - 1)
  let chance = Math.min(rawChance, MAX_CHANCE)

  if (modifiers.cursedRecentlyUsed) chance += 0.30
  if (modifiers.hasMonitorSkill)    chance -= 0.20

  return Math.min(1, Math.max(0, chance))
}

// Returns null (no encounter) or an encounter object from selectFromPool.
// Uses region-specific encounter rates from ENCOUNTER_RATES.
// Only rolls every N steps (based on stepsPerRoll for the region).
// Returns null on step 0 — no encounter before the player has moved.
// Uses seeded RNG for deterministic results.
export function roll(regionId, stepCount, seed) {
  if (stepCount === 0) return null
  const rate = ENCOUNTER_RATES[regionId] ?? { baseRate: 0, stepsPerRoll: 4 }
  if (stepCount % rate.stepsPerRoll !== 0) return null
  const rng = seedRandom(seed + stepCount)
  if (rng() >= rate.baseRate) return null
  return selectFromPool(regionId, seed, stepCount)
}
