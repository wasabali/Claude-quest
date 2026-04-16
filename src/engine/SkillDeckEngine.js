import { getById as getSkillById } from '#data/skills.js'

const MIN_ACTIVE_SLOTS = 4
const MAX_ACTIVE_SLOTS = 6

export function getActiveSlotCount(activeSlots) {
  const slots = Number(activeSlots ?? MIN_ACTIVE_SLOTS)
  return Math.min(MAX_ACTIVE_SLOTS, Math.max(MIN_ACTIVE_SLOTS, slots))
}

export function normalizeActiveDeck(activeSkills = [], slotCount = MIN_ACTIVE_SLOTS) {
  const size = getActiveSlotCount(slotCount)
  const deck = Array(size).fill(null)
  for (let i = 0; i < size; i++) {
    deck[i] = activeSkills[i] ?? null
  }
  return deck
}

export function swapActiveSlots(activeSkills = [], slotA, slotB, slotCount = MIN_ACTIVE_SLOTS) {
  const deck = normalizeActiveDeck(activeSkills, slotCount)
  if (slotA === slotB) return deck
  if (slotA < 0 || slotA >= deck.length || slotB < 0 || slotB >= deck.length) return deck
  const temp = deck[slotA]
  deck[slotA] = deck[slotB]
  deck[slotB] = temp
  return deck
}

export function removeSkillFromSlot(activeSkills = [], slotIndex, slotCount = MIN_ACTIVE_SLOTS) {
  const deck = normalizeActiveDeck(activeSkills, slotCount)
  if (slotIndex < 0 || slotIndex >= deck.length) return deck
  deck[slotIndex] = null
  return deck
}

export function assignSkillToSlot(activeSkills = [], slotIndex, skillId, slotCount = MIN_ACTIVE_SLOTS) {
  const deck = normalizeActiveDeck(activeSkills, slotCount)
  if (!skillId || slotIndex < 0 || slotIndex >= deck.length) return deck

  const sourceIndex = deck.findIndex(id => id === skillId)
  const displaced = deck[slotIndex]

  if (sourceIndex >= 0 && sourceIndex !== slotIndex) {
    deck[sourceIndex] = displaced
  }

  deck[slotIndex] = skillId
  return deck
}

export function isCursedSkillId(skillId, cursedSkillIds = []) {
  if (!skillId) return false
  const skill = getSkillById(skillId)
  return Boolean(skill?.isCursed || cursedSkillIds.includes(skillId))
}

export function buildSkillStateAfterDeckCommit(skillsState, nextDeck) {
  const learned = [...skillsState.learned]
  const cursed = [...skillsState.cursed]
  const active = [...nextDeck]

  active.forEach((skillId) => {
    if (!skillId) return
    if (!learned.includes(skillId)) learned.push(skillId)
    if (isCursedSkillId(skillId, cursed) && !cursed.includes(skillId)) cursed.push(skillId)
  })

  return { active, learned, cursed }
}
