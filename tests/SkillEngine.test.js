import { describe, it, expect } from 'vitest'
import {
  calculateDamage,
  calculateXP,
  assessQuality,
  getDomainMultiplier,
  applyShameAndReputation,
  getReputationStatus,
  getShameTitle,
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

  it('reputation is clamped between 0 and 100', () => {
    const playerLow = { shamePoints: 0, reputation: 5 }
    const skill = { tier: 'nuclear', isCursed: true, sideEffect: { shame: 2, reputation: -20 } }
    const result = applyShameAndReputation(playerLow, skill)
    expect(result.reputation).toBeGreaterThanOrEqual(0)

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
  it('returns Distinguished Engineer for 80–100', () => {
    expect(getReputationStatus(80)).toBe('Distinguished Engineer')
    expect(getReputationStatus(100)).toBe('Distinguished Engineer')
    expect(getReputationStatus(99)).toBe('Distinguished Engineer')
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

  it('returns null for shame 1–4 (no title at those thresholds)', () => {
    expect(getShameTitle(1)).toBeNull()
    expect(getShameTitle(4)).toBeNull()
  })

  it('returns Person of Interest at shame 5', () => {
    expect(getShameTitle(5)).toBe('Person of Interest')
    expect(getShameTitle(6)).toBe('Person of Interest')
    expect(getShameTitle(9)).toBe('Person of Interest')
  })

  it('returns Shadow Engineer at shame 10', () => {
    expect(getShameTitle(10)).toBe('Shadow Engineer')
    // shame 15 has title:null — 'Shadow Engineer' (from shame 10) is still the active title
    expect(getShameTitle(15)).toBe('Shadow Engineer')
    expect(getShameTitle(100)).toBe('Shadow Engineer')
  })

  it('returns Person of Interest at shame 7 (no new title at 7, Person of Interest persists)', () => {
    expect(getShameTitle(7)).toBe('Person of Interest')
  })

  it('returns null at shame 3 (no title earned yet — shame 3 has no title, neither does 1)', () => {
    expect(getShameTitle(3)).toBeNull()
  })
})
