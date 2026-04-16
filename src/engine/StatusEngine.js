// StatusEngine.js — Status effect application and decay per turn.
// Pure logic only — no Phaser imports. Fully unit-testable with plain Node.js.

import { STATUSES } from '../config.js'

// Returns true if the given statusId is currently active on the target.
// A status with remaining === -1 is permanent and always active.
// A status with remaining <= 0 is not active.
export function isStatusActive(battleState, target, statusId) {
  const entry = battleState[target].statuses.find(s => s.id === statusId)
  if (!entry) return false
  return entry.remaining === -1 || entry.remaining > 0
}

// Apply a status effect to target.
// Returns BattleEvent[].
// - For technical_debt: always stacks (adds a new entry).
// - For all other statuses: refreshes duration if already present.
// - Unknown statusId: no-op, returns [].
// - randomFn: optional seeded random function (defaults to Math.random).
//   Pass a seeded function (e.g. from utils/random.js) for reproducible replays.
export function applyStatus(battleState, target, statusId, randomFn = Math.random) {
  const definition = STATUSES[statusId]
  if (!definition) return []

  const { duration } = definition
  const remaining = _resolveInitialDuration(duration, randomFn)

  const statuses = battleState[target].statuses

  if (statusId === 'technical_debt') {
    // technical_debt stacks — always push a new entry
    statuses.push({ id: statusId, remaining })
  } else {
    // Refresh (or add) single entry
    const existing = statuses.find(s => s.id === statusId)
    if (existing) {
      existing.remaining = remaining
    } else {
      statuses.push({ id: statusId, remaining })
    }
  }

  return [
    {
      type:   'status_apply',
      target,
      value:  statusId,
      text:   `${target} is now ${statusId}`,
    },
  ]
}

// Tick all statuses on target by one turn.
// - Decrements remaining for finite statuses.
// - Removes entries when remaining reaches 0 and emits status_expired.
// - Never modifies permanent (remaining === -1) entries.
// Returns BattleEvent[].
export function tickStatuses(battleState, target) {
  const events   = []
  const statuses = battleState[target].statuses
  const expired  = []

  for (const entry of statuses) {
    if (entry.remaining === -1) {
      // Permanent — skip
      continue
    }

    entry.remaining -= 1
    events.push({ type: 'status_tick', target, value: entry.id, text: `${entry.id} ticked` })

    if (entry.remaining <= 0) {
      expired.push(entry.id)
    }
  }

  // Remove expired entries and emit events
  for (const statusId of expired) {
    const idx = battleState[target].statuses.findIndex(s => s.id === statusId && s.remaining <= 0)
    if (idx !== -1) battleState[target].statuses.splice(idx, 1)
    events.push({ type: 'status_expired', target, value: statusId, text: `${statusId} expired` })
  }

  return events
}

// --- internal helpers ---

function _resolveInitialDuration(duration, randomFn = Math.random) {
  if (duration === 'random') {
    // in_review: 1–3 turns — uses randomFn for reproducibility with seeded RNG
    return Math.floor(randomFn() * 3) + 1
  }
  return duration
}
