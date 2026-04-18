// SkillEngine.js — pure skill resolution logic, zero Phaser imports.
// Handles domain matchups, damage calculation, XP, quality assessment,
// and shame/reputation side effects.

import { DOMAIN_MATCHUPS, STRONG_MULTIPLIER, WEAK_MULTIPLIER, REPUTATION_THRESHOLDS, SHAME_THRESHOLDS, REPUTATION_MIN, REPUTATION_MAX, GRIME_PER_SHAME, GRIME_PER_SHAME_SHADOW, SHADOW_ENGINEER } from '../config.js'

// XP multipliers per solution quality tier.
const XP_MULTIPLIERS = {
  optimal:  2,
  standard: 1,
  shortcut: 0.5,
  cursed:   0.25,
  nuclear:  0,
}

// Reputation delta per solution quality tier (non-cursed skill use per turn).
const REP_GAIN_OPTIMAL    =  10
const REP_GAIN_STANDARD   =   3
const REP_CHANGE_SHORTCUT =  -5

// ---------------------------------------------------------------------------
// getDomainMultiplier
// Returns the damage multiplier when a skill of `skillDomain` is used
// against an opponent with `opponentDomain`.
//
// Rules:
//   - observability always returns 0 (support domain, no damage)
//   - null opponentDomain → unknown/hidden domain → 1.0 (neutral)
//   - strong matchup → STRONG_MULTIPLIER (2.0)
//   - weak matchup   → WEAK_MULTIPLIER   (0.5)
//   - otherwise      → 1.0 (neutral)
//
// Note: cursed/nuclear bypass is handled in calculateDamage, not here.
// ---------------------------------------------------------------------------
export function getDomainMultiplier(skillDomain, opponentDomain) {
  if (skillDomain === 'observability') return 0
  if (skillDomain === null || skillDomain === undefined) return 1.0
  if (opponentDomain === null || opponentDomain === undefined) return 1.0

  const matchup = DOMAIN_MATCHUPS[skillDomain]
  if (!matchup) return 1.0

  if (matchup.strong === opponentDomain) return STRONG_MULTIPLIER
  if (matchup.weak   === opponentDomain) return WEAK_MULTIPLIER

  return 1.0
}

// ---------------------------------------------------------------------------
// calculateDamage
// Returns the final integer damage dealt by `skill` against an opponent
// whose domain is `opponentDomain`.
//
// Only skills with effect.type === 'damage' deal damage; all others return 0.
// ---------------------------------------------------------------------------
export function calculateDamage(skill, opponentDomain) {
  if (!skill?.effect || skill.effect.type !== 'damage') return 0
  const base = skill.effect.value ?? 0
  // Cursed/nuclear skills bypass domain matchups — always deal flat ×1.0 damage.
  const isBypass = skill.isCursed || skill.tier === 'cursed' || skill.tier === 'nuclear'
  const multiplier = isBypass ? 1.0 : getDomainMultiplier(skill.domain, opponentDomain)
  return Math.floor(base * multiplier)
}

// ---------------------------------------------------------------------------
// calculateXP
// Returns XP awarded after a battle win.
// Formula: Math.floor(difficulty * 30 * MULTIPLIERS[tier])
// Returns 0 for unknown tiers.
// ---------------------------------------------------------------------------
export function calculateXP(opponentDifficulty, winningTier) {
  const multiplier = XP_MULTIPLIERS[winningTier]
  if (multiplier === undefined) return 0
  return Math.floor(opponentDifficulty * 30 * multiplier)
}

// ---------------------------------------------------------------------------
// assessQuality
// Determines solution quality: 'optimal' | 'standard' | 'shortcut' | 'cursed' | 'nuclear'
//
// Priority order (highest first):
//   1. nuclear tier  → 'nuclear'
//   2. cursed tier   → 'cursed'
//   3. correct domain + domain was revealed first  → 'optimal'
//   4. correct domain, domain NOT revealed          → 'standard'
//   5. wrong domain, incident resolved (hp <= 0)   → 'shortcut'
//   6. otherwise → 'standard'
// ---------------------------------------------------------------------------
export function assessQuality(skill, opponent, domainRevealed) {
  if (skill.tier === 'nuclear') return 'nuclear'
  if (skill.tier === 'cursed')  return 'cursed'

  const multiplier = getDomainMultiplier(skill.domain, opponent.domain)
  const isCorrectDomain = multiplier >= STRONG_MULTIPLIER

  if (isCorrectDomain && domainRevealed) return 'optimal'
  if (isCorrectDomain && !domainRevealed) return 'standard'

  // Wrong domain but incident still resolved
  if (opponent.hp !== undefined && opponent.hp <= 0) return 'shortcut'

  return 'standard'
}

// ---------------------------------------------------------------------------
// applyShameAndReputation
// Returns a new player snapshot with updated shamePoints and reputation.
// Does NOT mutate the original player object.
//
// Rules:
//   - cursed/nuclear: apply sideEffect.shame and sideEffect.reputation
//   - optimal:   +REP_GAIN_OPTIMAL    (no shame)
//   - shortcut:  +REP_CHANGE_SHORTCUT (no shame, negative delta)
//   - standard:  +REP_GAIN_STANDARD   (no shame)
//   - reputation is clamped to [0, 100]
//   - shamePoints only increases, never decrements
// ---------------------------------------------------------------------------
export function applyShameAndReputation(player, skill) {
  let { shamePoints, reputation } = player

  if ((skill.tier === 'cursed' || skill.tier === 'nuclear') && skill.sideEffect) {
    shamePoints += skill.sideEffect.shame ?? 0
    reputation  += skill.sideEffect.reputation ?? 0
  } else if (skill.tier === 'optimal') {
    reputation += REP_GAIN_OPTIMAL
  } else if (skill.tier === 'shortcut') {
    reputation += REP_CHANGE_SHORTCUT
  } else {
    reputation += REP_GAIN_STANDARD
  }

  // Clamp reputation to [REPUTATION_MIN, REPUTATION_MAX]
  reputation = Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, reputation))

  return { ...player, shamePoints, reputation }
}

// ---------------------------------------------------------------------------
// getReputationStatus
// Returns the player's reputation status label based on the current score.
// Thresholds (descending): 80+ Distinguished Engineer, 60+ Competent Engineer,
// 40+ Adequate Engineer, 20+ Liability, 0+ Walking Incident.
// ---------------------------------------------------------------------------
export function getReputationStatus(reputation) {
  for (const threshold of REPUTATION_THRESHOLDS) {
    if (reputation >= threshold.min) return threshold.status
  }
  return REPUTATION_THRESHOLDS[REPUTATION_THRESHOLDS.length - 1].status
}

// ---------------------------------------------------------------------------
// getShameTitle
// Returns the title from the highest matching configured shame threshold,
// or null if no threshold with a non-null title has been reached.
// ---------------------------------------------------------------------------
export function getShameTitle(shamePoints) {
  for (const threshold of SHAME_THRESHOLDS) {
    if (shamePoints >= threshold.shame && threshold.title !== null) {
      return threshold.title
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// applyShameGrime
// Returns a new emblems object with grime added to every *earned* emblem.
// Grime is capped at 5 per emblem. Unearned emblems are untouched.
// Called after any shame gain (cursed/nuclear skill use).
// At Shame 10+ (Shadow Engineer), grime rate doubles from 0.05 to 0.10.
// ---------------------------------------------------------------------------
export function applyShameGrime(emblems, shameGained, currentShame = 0) {
  if (!shameGained || shameGained <= 0) return { ...(emblems ?? {}) }
  const rate = currentShame >= SHADOW_ENGINEER.SHAME_THRESHOLD ? GRIME_PER_SHAME_SHADOW : GRIME_PER_SHAME
  const result = {}
  for (const [id, entry] of Object.entries(emblems ?? {})) {
    if (entry.earned) {
      result[id] = { ...entry, grime: Math.min(5, (entry.grime ?? 0) + shameGained * rate) }
    } else {
      result[id] = { ...entry }
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// computeShameFlags
// Returns an object mapping flag keys to true for every SHAME_THRESHOLD that
// the player has reached or exceeded. Used to update GameState.story.flags
// after shame is gained.
// ---------------------------------------------------------------------------
export function computeShameFlags(shamePoints) {
  const flags = {}
  for (const threshold of SHAME_THRESHOLDS) {
    if (shamePoints >= threshold.shame) {
      flags[threshold.flag] = true
    }
  }
  return flags
}

// ---------------------------------------------------------------------------
// reduceShame
// Returns a new player snapshot with shamePoints reduced by `amount`.
// Shame never goes below 0. Reputation is not affected.
// Used by shame-redemption quests and items (e.g. Coffee and an Apology).
// ---------------------------------------------------------------------------
export function reduceShame(player, amount) {
  return { ...player, shamePoints: Math.max(0, player.shamePoints - amount) }
}

// ---------------------------------------------------------------------------
// getShopMod
// Returns the shop price modifier for the given reputation score.
// Positive values increase prices; negative values decrease them.
// ---------------------------------------------------------------------------
export function getShopMod(reputation) {
  for (const threshold of REPUTATION_THRESHOLDS) {
    if (reputation >= threshold.min) return threshold.shopMod
  }
  return REPUTATION_THRESHOLDS[REPUTATION_THRESHOLDS.length - 1].shopMod
}

// ---------------------------------------------------------------------------
// shouldTeachOnAnyWin
// Returns true if trainers should teach their signature skill on ANY win
// (not just optimal) based on the player's current reputation.
// ---------------------------------------------------------------------------
export function shouldTeachOnAnyWin(reputation) {
  for (const threshold of REPUTATION_THRESHOLDS) {
    if (reputation >= threshold.min) return threshold.teachOnAnyWin
  }
  return false
}

// ---------------------------------------------------------------------------
// isShadowEngineer
// Returns true if the player has reached the Shadow Engineer threshold.
// ---------------------------------------------------------------------------
export function isShadowEngineer(shamePoints) {
  return shamePoints >= SHADOW_ENGINEER.SHAME_THRESHOLD
}

// ---------------------------------------------------------------------------
// getGrimeRate
// Returns the grime rate based on current shame level.
// Doubles from 0.05 to 0.10 at Shadow Engineer threshold.
// ---------------------------------------------------------------------------
export function getGrimeRate(shamePoints) {
  return shamePoints >= SHADOW_ENGINEER.SHAME_THRESHOLD ? GRIME_PER_SHAME_SHADOW : GRIME_PER_SHAME
}
