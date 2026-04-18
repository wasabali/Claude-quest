import { describe, it, expect } from 'vitest'
import {
  calculateDamage,
  calculateXP,
  assessQuality,
  getDomainMultiplier,
  applyShameAndReputation,
  getReputationStatus,
  getShameTitle,
  applyShameGrime,
  reduceShame,
  computeShameFlags,
  getShopMod,
  shouldTeachOnAnyWin,
  isShadowEngineer,
  getGrimeRate,
  resolveShopPrice,
  canUseShop,
  getRematchXp,
} from '../src/engine/SkillEngine.js'

// ---------------------------------------------------------------------------
// getDomainMultiplier
// ---------------------------------------------------------------------------

describe('getDomainMultiplier', () => {
  it('returns 2.0 when skill domain is strong against opponent domain', () => {
    // linux is strong against security
    expect(getDomainMultiplier('linux', 'security')).toBe(2.0)
    // kubernetes is strong against linux
    expect(getDomainMultiplier('kubernetes', 'linux')).toBe(2.0)
    // cloud is strong against iac
    expect(getDomainMultiplier('cloud', 'iac')).toBe(2.0)
  })

  it('returns 0.5 when skill domain is weak against opponent domain', () => {
    // linux is weak against kubernetes
    expect(getDomainMultiplier('linux', 'kubernetes')).toBe(0.5)
    // security is weak against linux
    expect(getDomainMultiplier('security', 'linux')).toBe(0.5)
    // containers is weak against iac
    expect(getDomainMultiplier('containers', 'iac')).toBe(0.5)
  })

  it('returns 1.0 for neutral matchups (neither strong nor weak)', () => {
    // linux vs cloud — no relationship
    expect(getDomainMultiplier('linux', 'cloud')).toBe(1.0)
    // kubernetes vs security — no relationship
    expect(getDomainMultiplier('kubernetes', 'security')).toBe(1.0)
    // iac vs serverless — no relationship
    expect(getDomainMultiplier('iac', 'serverless')).toBe(1.0)
  })

  it('returns 0 when skill domain is observability (support domain — no damage)', () => {
    expect(getDomainMultiplier('observability', 'linux')).toBe(0)
    expect(getDomainMultiplier('observability', 'cloud')).toBe(0)
    expect(getDomainMultiplier('observability', 'kubernetes')).toBe(0)
  })

  it('returns 1.0 when skill domain is null (cursed/nuclear bypass — flat damage)', () => {
    expect(getDomainMultiplier(null, 'linux')).toBe(1.0)
    expect(getDomainMultiplier(null, 'kubernetes')).toBe(1.0)
    expect(getDomainMultiplier(null, 'security')).toBe(1.0)
  })

  it('returns 1.0 when opponent domain is null (unknown domain)', () => {
    expect(getDomainMultiplier('linux', null)).toBe(1.0)
  })
})

// ---------------------------------------------------------------------------
// calculateDamage
// ---------------------------------------------------------------------------

describe('calculateDamage', () => {
  it('applies strong multiplier (2.0×) for advantageous matchup', () => {
    // linux is strong against security
    const skill = { domain: 'linux', tier: 'standard', effect: { type: 'damage', value: 30 } }
    expect(calculateDamage(skill, 'security')).toBe(60)
  })

  it('applies weak multiplier (0.5×) for disadvantageous matchup', () => {
    // linux is weak against kubernetes
    const skill = { domain: 'linux', tier: 'standard', effect: { type: 'damage', value: 30 } }
    expect(calculateDamage(skill, 'kubernetes')).toBe(15)
  })

  it('applies neutral multiplier (1.0×) for unrelated domains', () => {
    const skill = { domain: 'linux', tier: 'standard', effect: { type: 'damage', value: 30 } }
    expect(calculateDamage(skill, 'cloud')).toBe(30)
  })

  it('returns 0 for observability skills (support domain)', () => {
    const skill = { domain: 'observability', tier: 'standard', effect: { type: 'reveal_domain', value: 1 } }
    expect(calculateDamage(skill, 'linux')).toBe(0)
  })

  it('deals flat neutral damage for cursed skill (domain null bypasses matchups)', () => {
    const skill = { domain: null, tier: 'cursed', isCursed: true, effect: { type: 'damage', value: 40 } }
    expect(calculateDamage(skill, 'linux')).toBe(40)
    expect(calculateDamage(skill, 'kubernetes')).toBe(40)
  })

  it('deals flat neutral damage for nuclear skill (domain null bypasses matchups)', () => {
    const skill = { domain: null, tier: 'nuclear', isCursed: true, effect: { type: 'damage', value: 50 } }
    expect(calculateDamage(skill, 'security')).toBe(50)
    expect(calculateDamage(skill, 'iac')).toBe(50)
  })

  it('floors the result (no fractional damage)', () => {
    // 0.5 * 25 = 12.5 → should floor to 12
    const skill = { domain: 'linux', tier: 'standard', effect: { type: 'damage', value: 25 } }
    expect(calculateDamage(skill, 'kubernetes')).toBe(12)
  })

  it('returns 0 for skills without a damage effect', () => {
    const healSkill = { domain: 'linux', tier: 'standard', effect: { type: 'heal', value: 20 } }
    expect(calculateDamage(healSkill, 'security')).toBe(0)
  })

  it('returns 0 for skill with damage value 0', () => {
    const skill = { domain: 'cloud', tier: 'standard', effect: { type: 'damage', value: 0 } }
    expect(calculateDamage(skill, 'iac')).toBe(0)
  })

  it('handles all 7 combat domains in a full cycle: linux→security→serverless→cloud→iac→containers→kubernetes→linux', () => {
    const cycle = ['linux', 'security', 'serverless', 'cloud', 'iac', 'containers', 'kubernetes']
    for (let i = 0; i < cycle.length; i++) {
      const attacker = cycle[i]
      const defender = cycle[(i + 1) % cycle.length]
      const skill = { domain: attacker, tier: 'standard', effect: { type: 'damage', value: 10 } }
      expect(calculateDamage(skill, defender)).toBe(20) // strong matchup
    }
  })
})

// ---------------------------------------------------------------------------
// calculateXP
// ---------------------------------------------------------------------------

describe('calculateXP', () => {
  // Formula: Math.floor(difficulty * 30 * MULTIPLIERS[tier])
  // Multipliers: optimal=2, standard=1, shortcut=0.5, cursed=0.25, nuclear=0

  it('calculates optimal XP at 2× multiplier', () => {
    expect(calculateXP(5, 'optimal')).toBe(Math.floor(5 * 30 * 2))   // 300
    expect(calculateXP(1, 'optimal')).toBe(Math.floor(1 * 30 * 2))   // 60
    expect(calculateXP(10, 'optimal')).toBe(Math.floor(10 * 30 * 2)) // 600
  })

  it('calculates standard XP at 1× multiplier', () => {
    expect(calculateXP(5, 'standard')).toBe(Math.floor(5 * 30 * 1))  // 150
    expect(calculateXP(3, 'standard')).toBe(Math.floor(3 * 30 * 1))  // 90
  })

  it('calculates shortcut XP at 0.5× multiplier', () => {
    expect(calculateXP(5, 'shortcut')).toBe(Math.floor(5 * 30 * 0.5)) // 75
    expect(calculateXP(3, 'shortcut')).toBe(Math.floor(3 * 30 * 0.5)) // 45
  })

  it('calculates cursed XP at 0.25× multiplier', () => {
    expect(calculateXP(5, 'cursed')).toBe(Math.floor(5 * 30 * 0.25)) // 37
    expect(calculateXP(4, 'cursed')).toBe(Math.floor(4 * 30 * 0.25)) // 30
  })

  it('calculates nuclear XP at 0× multiplier (always 0)', () => {
    expect(calculateXP(5, 'nuclear')).toBe(0)
    expect(calculateXP(100, 'nuclear')).toBe(0)
  })

  it('returns 0 for unknown tier', () => {
    expect(calculateXP(5, 'unknown_tier')).toBe(0)
  })

  it('floors fractional results', () => {
    // 7 * 30 * 0.25 = 52.5 → 52
    expect(calculateXP(7, 'cursed')).toBe(52)
  })

  it('scales linearly with opponent difficulty', () => {
    const xp1 = calculateXP(2, 'standard')
    const xp2 = calculateXP(4, 'standard')
    expect(xp2).toBe(xp1 * 2)
  })
})

// ---------------------------------------------------------------------------
// assessQuality
// ---------------------------------------------------------------------------

describe('assessQuality', () => {
  it('returns optimal when correct domain used AND domain was revealed first', () => {
    const skill = { domain: 'cloud', tier: 'standard' }
    const opponent = { domain: 'iac' }  // cloud is strong against iac
    expect(assessQuality(skill, opponent, true)).toBe('optimal')
  })

  it('returns standard when correct domain used but domain was NOT revealed', () => {
    const skill = { domain: 'cloud', tier: 'standard' }
    const opponent = { domain: 'iac' }
    expect(assessQuality(skill, opponent, false)).toBe('standard')
  })

  it('returns shortcut when wrong domain but incident still resolved (opponent hp <= 0)', () => {
    const skill = { domain: 'linux', tier: 'standard' }
    const opponent = { domain: 'cloud', hp: 0 }  // resolved, but wrong domain
    expect(assessQuality(skill, opponent, false)).toBe('shortcut')
  })

  it('returns cursed when skill tier is cursed', () => {
    const skill = { domain: null, tier: 'cursed', isCursed: true }
    const opponent = { domain: 'cloud', hp: 0 }
    expect(assessQuality(skill, opponent, true)).toBe('cursed')
  })

  it('returns nuclear when skill tier is nuclear', () => {
    const skill = { domain: null, tier: 'nuclear', isCursed: true }
    const opponent = { domain: 'cloud', hp: 0 }
    expect(assessQuality(skill, opponent, true)).toBe('nuclear')
  })

  it('cursed tier takes precedence over correct domain', () => {
    const skill = { domain: 'cloud', tier: 'cursed', isCursed: true }
    const opponent = { domain: 'iac' }
    expect(assessQuality(skill, opponent, true)).toBe('cursed')
  })

  it('nuclear tier takes precedence over correct domain', () => {
    const skill = { domain: 'cloud', tier: 'nuclear', isCursed: true }
    const opponent = { domain: 'iac' }
    expect(assessQuality(skill, opponent, true)).toBe('nuclear')
  })
})

// ---------------------------------------------------------------------------
// applyShameAndReputation
// ---------------------------------------------------------------------------

describe('applyShameAndReputation', () => {
  it('cursed skill adds 1 shame and reduces reputation', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'cursed', isCursed: true, sideEffect: { shame: 1, reputation: -8 } }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(1)
    expect(result.reputation).toBe(42)
  })

  it('nuclear skill adds 2 shame and reduces reputation more', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'nuclear', isCursed: true, sideEffect: { shame: 2, reputation: -15 } }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(2)
    expect(result.reputation).toBe(35)
  })

  it('shortcut skill reduces reputation by 5 and does not add shame', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'shortcut', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(0)
    expect(result.reputation).toBe(45)
  })

  it('optimal skill does not add shame and increases reputation', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'optimal', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(0)
    expect(result.reputation).toBeGreaterThanOrEqual(50)
  })

  it('standard skill does not add shame and increases reputation', () => {
    const player = { shamePoints: 2, reputation: 40 }
    const skill = { tier: 'standard', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(2) // shame never decrements
    expect(result.reputation).toBeGreaterThanOrEqual(40)
  })

  it('reputation is clamped between -100 and 100', () => {
    const playerLow = { shamePoints: 0, reputation: -90 }
    const skill = { tier: 'nuclear', isCursed: true, sideEffect: { shame: 2, reputation: -20 } }
    const result = applyShameAndReputation(playerLow, skill)
    expect(result.reputation).toBeGreaterThanOrEqual(-100)

    const playerHigh = { shamePoints: 0, reputation: 95 }
    const optimalSkill = { tier: 'optimal', isCursed: false, sideEffect: null }
    const result2 = applyShameAndReputation(playerHigh, optimalSkill)
    expect(result2.reputation).toBeLessThanOrEqual(100)
  })

  it('shortcut skill reduces reputation by 5 and does not add shame', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'shortcut', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.shamePoints).toBe(0)
    expect(result.reputation).toBe(45)
  })

  it('optimal skill increases reputation by 10', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'optimal', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.reputation).toBe(60)
  })

  it('standard skill increases reputation by 3', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'standard', isCursed: false, sideEffect: null }
    const result = applyShameAndReputation(player, skill)
    expect(result.reputation).toBe(53)
  })

  it('does not mutate the original player object', () => {
    const player = { shamePoints: 0, reputation: 50 }
    const skill = { tier: 'cursed', isCursed: true, sideEffect: { shame: 1, reputation: -8 } }
    applyShameAndReputation(player, skill)
    expect(player.shamePoints).toBe(0)
    expect(player.reputation).toBe(50)
  })

})

// ---------------------------------------------------------------------------
// getReputationStatus
// ---------------------------------------------------------------------------

describe('getReputationStatus', () => {
  it('returns Distinguished Engineer for 90–100', () => {
    expect(getReputationStatus(90)).toBe('Distinguished Engineer')
    expect(getReputationStatus(100)).toBe('Distinguished Engineer')
    expect(getReputationStatus(99)).toBe('Distinguished Engineer')
  })

  it('returns Senior Engineer for 80–89', () => {
    expect(getReputationStatus(80)).toBe('Senior Engineer')
    expect(getReputationStatus(89)).toBe('Senior Engineer')
  })

  it('returns Competent Engineer for 60–79', () => {
    expect(getReputationStatus(60)).toBe('Competent Engineer')
    expect(getReputationStatus(79)).toBe('Competent Engineer')
  })

  it('returns Adequate Engineer for 40–59', () => {
    expect(getReputationStatus(50)).toBe('Adequate Engineer')
    expect(getReputationStatus(40)).toBe('Adequate Engineer')
    expect(getReputationStatus(59)).toBe('Adequate Engineer')
  })

  it('returns Liability for 20–39', () => {
    expect(getReputationStatus(20)).toBe('Liability')
    expect(getReputationStatus(39)).toBe('Liability')
  })

  it('returns Walking Incident for 0–19', () => {
    expect(getReputationStatus(0)).toBe('Walking Incident')
    expect(getReputationStatus(19)).toBe('Walking Incident')
  })

  it('starting reputation (50) is Adequate Engineer', () => {
    expect(getReputationStatus(50)).toBe('Adequate Engineer')
  })
})

// ---------------------------------------------------------------------------
// getShameTitle
// ---------------------------------------------------------------------------

describe('getShameTitle', () => {
  it('returns null for 0 shame (no title earned)', () => {
    expect(getShameTitle(0)).toBeNull()
  })

  it('returns It Was Like That When I Got Here for shame 1–2', () => {
    expect(getShameTitle(1)).toBe('It Was Like That When I Got Here')
    expect(getShameTitle(2)).toBe('It Was Like That When I Got Here')
  })

  it('returns Cowboy Coder for shame 3–4', () => {
    expect(getShameTitle(3)).toBe('Cowboy Coder')
    expect(getShameTitle(4)).toBe('Cowboy Coder')
  })

  it('returns The Shortcutter at shame 5', () => {
    expect(getShameTitle(5)).toBe('The Shortcutter')
    expect(getShameTitle(6)).toBe('The Shortcutter')
  })

  it('returns Shadow Engineer at shame 10', () => {
    expect(getShameTitle(10)).toBe('Shadow Engineer')
    // shame 15 now has title 'The Other Principal'
    expect(getShameTitle(15)).toBe('The Other Principal')
    expect(getShameTitle(100)).toBe('The Other Principal')
  })

  it('returns Person of Interest at shame 7', () => {
    expect(getShameTitle(7)).toBe('Person of Interest')
  })

  it('returns Cowboy Coder at shame 3', () => {
    expect(getShameTitle(3)).toBe('Cowboy Coder')
  })
})

// ---------------------------------------------------------------------------
// getReputationStatus — negative range
// ---------------------------------------------------------------------------

describe('getReputationStatus — negative reputation', () => {
  it('returns Known Incident for -1 to -25', () => {
    expect(getReputationStatus(-1)).toBe('Known Incident')
    expect(getReputationStatus(-25)).toBe('Known Incident')
  })

  it('returns Do Not Pair With for -26 to -50', () => {
    expect(getReputationStatus(-26)).toBe('Do Not Pair With')
    expect(getReputationStatus(-50)).toBe('Do Not Pair With')
  })

  it('returns The Reason We Have Runbooks for -51 and below', () => {
    expect(getReputationStatus(-51)).toBe('The Reason We Have Runbooks')
    expect(getReputationStatus(-100)).toBe('The Reason We Have Runbooks')
  })
})

// ---------------------------------------------------------------------------
// applyShameGrime
// ---------------------------------------------------------------------------

describe('applyShameGrime', () => {
  it('adds grime to all earned emblems proportional to shame gained', () => {
    const emblems = {
      tux:      { earned: true,  shine: 0, grime: 0 },
      pipeline: { earned: true,  shine: 0, grime: 0 },
      vault:    { earned: false, shine: 0, grime: 0 },
    }
    const result = applyShameGrime(emblems, 1)
    expect(result.tux.grime).toBeCloseTo(0.05)
    expect(result.pipeline.grime).toBeCloseTo(0.05)
    expect(result.vault.grime).toBe(0) // unearned — untouched
  })

  it('caps grime at 5', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 4.98 } }
    const result = applyShameGrime(emblems, 2)
    expect(result.tux.grime).toBe(5)
  })

  it('does not mutate the original emblems object', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 0 } }
    applyShameGrime(emblems, 1)
    expect(emblems.tux.grime).toBe(0)
  })

  it('returns unchanged emblems when shameGained is 0', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 1 } }
    const result = applyShameGrime(emblems, 0)
    expect(result.tux.grime).toBe(1)
  })

  it('skips unearnedEmblems and only affects earned ones', () => {
    const emblems = {
      container: { earned: false, shine: 0, grime: 0 },
      cloud:     { earned: true,  shine: 2, grime: 0.5 },
    }
    const result = applyShameGrime(emblems, 2)
    expect(result.container.grime).toBe(0)
    expect(result.cloud.grime).toBeCloseTo(0.6)
  })
})

// ---------------------------------------------------------------------------
// reduceShame
// ---------------------------------------------------------------------------

describe('reduceShame', () => {
  it('reduces shame by the given amount', () => {
    const player = { shamePoints: 5, reputation: 50 }
    const result = reduceShame(player, 1)
    expect(result.shamePoints).toBe(4)
  })

  it('never reduces shame below 0', () => {
    const player = { shamePoints: 1, reputation: 50 }
    const result = reduceShame(player, 5)
    expect(result.shamePoints).toBe(0)
  })

  it('does not mutate the original player object', () => {
    const player = { shamePoints: 3, reputation: 60 }
    reduceShame(player, 1)
    expect(player.shamePoints).toBe(3)
  })

  it('does not affect reputation', () => {
    const player = { shamePoints: 5, reputation: 42 }
    const result = reduceShame(player, 2)
    expect(result.reputation).toBe(42)
  })
})

// ---------------------------------------------------------------------------
// computeShameFlags
// ---------------------------------------------------------------------------

describe('computeShameFlags', () => {
  it('returns no flags when shame is 0', () => {
    expect(computeShameFlags(0)).toEqual({})
  })

  it('returns pedersen flag when shame is 1', () => {
    const flags = computeShameFlags(1)
    expect(flags).toHaveProperty('pedersen_sighs_cursed_location_visible', true)
  })

  it('returns oneliners flag when shame is 3', () => {
    const flags = computeShameFlags(3)
    expect(flags).toHaveProperty('npc_oneliners_active', true)
  })

  it('returns shadow engineer flag when shame is 10', () => {
    const flags = computeShameFlags(10)
    expect(flags).toHaveProperty('shadow_engineer_title_unlocked', true)
  })

  it('returns all flags at or below the current shame level', () => {
    const flags = computeShameFlags(10)
    expect(flags).toHaveProperty('pedersen_sighs_cursed_location_visible', true)
    expect(flags).toHaveProperty('npc_oneliners_active', true)
    expect(flags).toHaveProperty('cursed_network_full_three_am_active', true)
    expect(flags).toHaveProperty('shadow_engineer_title_unlocked', true)
  })

  it('does not return flags for thresholds not yet reached', () => {
    const flags = computeShameFlags(5)
    expect(flags).not.toHaveProperty('shadow_engineer_title_unlocked')
    expect(flags).not.toHaveProperty('secret_ending_accessible')
  })
})

// ---------------------------------------------------------------------------
// applyShameGrime — null safety
// ---------------------------------------------------------------------------

describe('applyShameGrime (null safety)', () => {
  it('handles emblems with missing grime field using ?? 0', () => {
    const emblems = { tux: { earned: true, shine: 0 } } // grime is undefined
    const result = applyShameGrime(emblems, 1)
    expect(result.tux.grime).toBeCloseTo(0.05)
  })

  it('returns empty object when emblems is null', () => {
    expect(applyShameGrime(null, 1)).toEqual({})
  })

  it('returns empty object when emblems is undefined', () => {
    expect(applyShameGrime(undefined, 1)).toEqual({})
  })
})

// ---------------------------------------------------------------------------
// applyShameGrime — Shadow Engineer doubled rate
// ---------------------------------------------------------------------------

describe('applyShameGrime (Shadow Engineer doubled rate)', () => {
  it('uses standard rate (0.05) when currentShame is below 10', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 0 } }
    const result = applyShameGrime(emblems, 1, 9)
    expect(result.tux.grime).toBeCloseTo(0.05)
  })

  it('uses doubled rate (0.10) when currentShame is 10 or more', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 0 } }
    const result = applyShameGrime(emblems, 1, 10)
    expect(result.tux.grime).toBeCloseTo(0.10)
  })

  it('uses doubled rate for shame well above 10', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 0 } }
    const result = applyShameGrime(emblems, 2, 15)
    expect(result.tux.grime).toBeCloseTo(0.20)
  })

  it('defaults to standard rate when currentShame is omitted', () => {
    const emblems = { tux: { earned: true, shine: 0, grime: 0 } }
    const result = applyShameGrime(emblems, 1)
    expect(result.tux.grime).toBeCloseTo(0.05)
  })
})

// ---------------------------------------------------------------------------
// resolveShopPrice
// ---------------------------------------------------------------------------

describe('resolveShopPrice', () => {
  it('applies −15% discount when reputation ≥ 80', () => {
    expect(resolveShopPrice(100, 80)).toBe(85)
    expect(resolveShopPrice(100, 90)).toBe(85)
    expect(resolveShopPrice(200, 100)).toBe(170)
  })

  it('returns base price when reputation is 60–79', () => {
    expect(resolveShopPrice(100, 60)).toBe(100)
    expect(resolveShopPrice(100, 79)).toBe(100)
  })

  it('returns base price when reputation is 40–59', () => {
    expect(resolveShopPrice(100, 40)).toBe(100)
    expect(resolveShopPrice(100, 50)).toBe(100)
  })

  it('applies +15% surcharge when reputation < 40', () => {
    expect(resolveShopPrice(100, 39)).toBe(115)
    expect(resolveShopPrice(100, 0)).toBe(115)
    expect(resolveShopPrice(200, 10)).toBe(230)
  })

  it('rounds to nearest integer', () => {
    expect(resolveShopPrice(33, 80)).toBe(28)   // 33 * 0.85 = 28.05 → 28
    expect(resolveShopPrice(33, 10)).toBe(38)   // 33 * 1.15 = 37.95 → 38
  })
})

// ---------------------------------------------------------------------------
// getShopMod
// ---------------------------------------------------------------------------

describe('getShopMod', () => {
  it('returns -0.20 for Distinguished Engineer (90+)', () => {
    expect(getShopMod(90)).toBe(-0.20)
    expect(getShopMod(100)).toBe(-0.20)
  })

  it('returns -0.10 for Senior Engineer (80-89)', () => {
    expect(getShopMod(80)).toBe(-0.10)
    expect(getShopMod(89)).toBe(-0.10)
  })

  it('returns 0 for Competent Engineer (60-79)', () => {
    expect(getShopMod(60)).toBe(0)
    expect(getShopMod(79)).toBe(0)
  })

  it('returns 0 for Adequate Engineer (40-59)', () => {
    expect(getShopMod(50)).toBe(0)
  })

  it('returns 0.20 for Liability (20-39)', () => {
    expect(getShopMod(20)).toBe(0.20)
    expect(getShopMod(39)).toBe(0.20)
  })

  it('returns 0.50 for Walking Incident (0-19)', () => {
    expect(getShopMod(0)).toBe(0.50)
    expect(getShopMod(19)).toBe(0.50)
  })
})

// ---------------------------------------------------------------------------
// canUseShop
// ---------------------------------------------------------------------------

describe('canUseShop', () => {
  it('returns true when reputation ≥ 20', () => {
    expect(canUseShop(20)).toBe(true)
    expect(canUseShop(50)).toBe(true)
    expect(canUseShop(100)).toBe(true)
  })

  it('returns false when reputation < 20', () => {
    expect(canUseShop(19)).toBe(false)
    expect(canUseShop(0)).toBe(false)
    expect(canUseShop(-10)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// shouldTeachOnAnyWin
// ---------------------------------------------------------------------------

describe('shouldTeachOnAnyWin', () => {
  it('returns true for Distinguished Engineer (90+)', () => {
    expect(shouldTeachOnAnyWin(90)).toBe(true)
    expect(shouldTeachOnAnyWin(100)).toBe(true)
  })

  it('returns true for Senior Engineer (80-89)', () => {
    expect(shouldTeachOnAnyWin(80)).toBe(true)
    expect(shouldTeachOnAnyWin(89)).toBe(true)
  })

  it('returns false for Competent Engineer (60-79)', () => {
    expect(shouldTeachOnAnyWin(60)).toBe(false)
    expect(shouldTeachOnAnyWin(79)).toBe(false)
  })

  it('returns false for Adequate Engineer (40-59)', () => {
    expect(shouldTeachOnAnyWin(50)).toBe(false)
  })

  it('returns false for Walking Incident (0-19)', () => {
    expect(shouldTeachOnAnyWin(0)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isShadowEngineer
// ---------------------------------------------------------------------------

describe('isShadowEngineer', () => {
  it('returns false below shame 10', () => {
    expect(isShadowEngineer(0)).toBe(false)
    expect(isShadowEngineer(9)).toBe(false)
  })

  it('returns true at shame 10', () => {
    expect(isShadowEngineer(10)).toBe(true)
  })

  it('returns true above shame 10', () => {
    expect(isShadowEngineer(15)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// getGrimeRate
// ---------------------------------------------------------------------------

describe('getGrimeRate', () => {
  it('returns 0.05 below shame 10', () => {
    expect(getGrimeRate(0)).toBe(0.05)
    expect(getGrimeRate(9)).toBe(0.05)
  })

  it('returns 0.10 at shame 10', () => {
    expect(getGrimeRate(10)).toBe(0.10)
  })

  it('returns 0.10 above shame 10', () => {
    expect(getGrimeRate(15)).toBe(0.10)
  })
})

// ---------------------------------------------------------------------------
// getRematchXp
// ---------------------------------------------------------------------------

describe('getRematchXp', () => {
  it('returns base XP × 1.5', () => {
    expect(getRematchXp(100)).toBe(150)
    expect(getRematchXp(200)).toBe(300)
  })

  it('rounds to nearest integer', () => {
    expect(getRematchXp(33)).toBe(50)   // 33 * 1.5 = 49.5 → 50
  })
})
