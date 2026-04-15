const MAX_LEVEL = 30

const SLOT_UNLOCKS = {
  5:  5,
  10: 6,
}

// XP required to reach level N (cumulative from level 1).
export function xpForLevel(n) {
  return n * n * 50
}

// Call after writing new XP to GameState.player.xp.
// Returns progression events (may be empty). Does NOT mutate state.
export function checkLevelUp(playerSnapshot) {
  const events = []
  let { level, xp, maxHp, budget } = playerSnapshot

  while (level < MAX_LEVEL && xp >= xpForLevel(level + 1)) {
    level++
    maxHp  += 10
    budget += 25

    events.push({ type: 'level_up', payload: { newLevel: level } })
    events.push({ type: 'stat_gain', payload: { maxHp, budget } })

    const newSlot = SLOT_UNLOCKS[level]
    if (newSlot) {
      events.push({ type: 'slot_unlock', payload: { activeSlots: newSlot } })
    }
  }

  return events
}
