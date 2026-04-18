// QuestEngine.js — pure quest evaluation logic, zero Phaser imports.
// Evaluates quest availability, resolves choices, advances stages,
// and provides Ivan/Alice-specific helpers.
//
// Quest types:
//   quiz        — single-stage NPC quiz
//   branch      — single-stage with branching outcomes
//   multi_stage — multiple sequential stages (Ivan, Alice)

import { getById } from '#data/quests.js'

// ---------------------------------------------------------------------------
// normalizeStory
// Ensures storyState.flags and storyState.activeQuests exist, so old save
// files that predate these fields don't cause runtime errors.
// ---------------------------------------------------------------------------
function normalizeStory(storyState) {
  if (!storyState.flags) storyState.flags = {}
  if (!storyState.activeQuests) storyState.activeQuests = {}
}

// ---------------------------------------------------------------------------
// isQuestAvailable
// Returns { available: boolean, reason: string | null } describing whether
// the player can start or interact with this quest.
// ---------------------------------------------------------------------------
export function isQuestAvailable(questId, storyState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return { available: false, reason: `Quest "${questId}" not found.` }

  // Already complete (completionFlag is set in flags)
  if (quest.completionFlag && storyState.flags[quest.completionFlag]) {
    return { available: false, reason: 'Quest is already complete.' }
  }

  // Already active and completed
  const active = storyState.activeQuests[questId]
  if (active && active.complete) {
    return { available: false, reason: 'Quest is already complete.' }
  }

  // Act check — quest requires a minimum act
  if (quest.act != null && storyState.act < quest.act) {
    return { available: false, reason: `Requires act ${quest.act}, currently in act ${storyState.act}.` }
  }

  // Required flags check
  if (quest.requiresFlags && !quest.requiresFlags.every(flag => storyState.flags[flag])) {
    const missing = quest.requiresFlags.find(flag => !storyState.flags[flag])
    return { available: false, reason: `Missing required flag: ${missing}.` }
  }

  // Exclude flags check
  if (quest.excludeFlags) {
    const blocking = quest.excludeFlags.find(flag => storyState.flags[flag])
    if (blocking) {
      return { available: false, reason: `Excluded by flag: ${blocking}.` }
    }
  }

  return { available: true, reason: null }
}

// ---------------------------------------------------------------------------
// getQuestStatus
// Returns 'available' | 'active' | 'complete' | 'followed_up' | 'unavailable'
// ---------------------------------------------------------------------------
export function getQuestStatus(questId, storyState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return 'unavailable'

  // Check followed_up first (more specific than complete)
  if (quest.completionFlag && storyState.flags[quest.completionFlag]) {
    if (storyState.flags[`quest_${questId}_followed_up`]) {
      return 'followed_up'
    }
    return 'complete'
  }

  // Check if active
  if (storyState.activeQuests[questId]) {
    return 'active'
  }

  // Check if available
  const { available } = isQuestAvailable(questId, storyState)
  if (available) return 'available'

  return 'unavailable'
}

// ---------------------------------------------------------------------------
// startQuest
// Adds quest to storyState.activeQuests with { stage: 0, attempts: 1 }.
// Returns { started: boolean, questData: object | null }
// ---------------------------------------------------------------------------
export function startQuest(questId, storyState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return { started: false, questData: null }

  // Already active
  if (storyState.activeQuests[questId]) {
    return { started: false, questData: quest }
  }

  // Already complete
  if (quest.completionFlag && storyState.flags[quest.completionFlag]) {
    return { started: false, questData: quest }
  }

  storyState.activeQuests[questId] = { stage: 0, attempts: 1 }
  return { started: true, questData: quest }
}

// ---------------------------------------------------------------------------
// getCurrentStage
// Returns the current stage data from the quest's stages array, or null.
// ---------------------------------------------------------------------------
export function getCurrentStage(questId, storyState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return null

  const active = storyState.activeQuests[questId]
  if (!active) return null

  const stage = quest.stages[active.stage]
  return stage || null
}

// ---------------------------------------------------------------------------
// resolveChoice
// Takes the quest ID, chosen answer index, story state, and player state.
// Returns a QuestEvent object or null if the quest/choice is invalid.
// ---------------------------------------------------------------------------
export function resolveChoice(questId, choiceIndex, storyState, playerState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return null

  const active = storyState.activeQuests[questId]
  if (!active) return null

  const stageIndex = active.stage
  const stage = quest.stages[stageIndex]
  if (!stage) return null

  const choice = stage.choices[choiceIndex]
  if (!choice) return null

  const isLastStage = stageIndex >= quest.stages.length - 1
  const isCorrect = choice.correct !== false
  const questComplete = isCorrect && isLastStage

  // Build penalty — handle both new-style { type, value } and legacy hpLoss
  // (margaret_website uses hpLoss; newer quests use { type, value })
  let penalty = choice.penalty || null
  if (!penalty && choice.hpLoss) {
    penalty = { type: 'hp', value: -choice.hpLoss }
  }

  // HP floor at 1: clamp HP penalty so player can't die from wrong answers.
  // Only HP penalties are clamped — budget/reputation have no floor by design.
  if (penalty && penalty.type === 'hp' && penalty.value < 0) {
    const currentHp = playerState.hp ?? 100
    const maxLoss = Math.max(0, currentHp - 1)
    if (-penalty.value > maxLoss) {
      penalty = { ...penalty, value: maxLoss === 0 ? 0 : -maxLoss }
    }
  }

  // stage_reset penalty: the scene resets the player to redo the current
  // stage. The engine flags it here; the scene applies it via startQuest
  // or by resetting activeQuests[questId].stage to the current value.
  const stageReset = penalty != null && penalty.type === 'stage_reset'

  return {
    questId,
    stageIndex,
    choiceIndex,
    correct:          choice.correct ?? false,
    xp:               choice.xp ?? 0,
    repDelta:         choice.repDelta ?? 0,
    shameDelta:       choice.shameDelta ?? 0,
    penalty,
    itemReward:       choice.itemReward || null,
    flag:             choice.flag || null,
    triggerEncounter: choice.triggerEncounter || null,
    responseDialog:   choice.responseDialog || [],
    stageReset,
    questComplete:    stageReset ? false : questComplete,
    completionFlag:   (stageReset ? false : questComplete) ? (quest.completionFlag || null) : null,
  }
}

// ---------------------------------------------------------------------------
// advanceStage
// Increments storyState.activeQuests[questId].stage.
// If stage >= quest stages length, marks quest complete.
// Returns { advanced: boolean, newStage: number, questComplete: boolean }
// ---------------------------------------------------------------------------
export function advanceStage(questId, storyState) {
  normalizeStory(storyState)
  const quest = getById(questId)
  if (!quest) return { advanced: false, newStage: 0, questComplete: false }

  const active = storyState.activeQuests[questId]
  if (!active) return { advanced: false, newStage: 0, questComplete: false }

  active.stage += 1
  const newStage = active.stage
  const questComplete = newStage >= quest.stages.length

  if (questComplete && quest.completionFlag) {
    storyState.flags[quest.completionFlag] = true
  }

  return { advanced: true, newStage, questComplete }
}

// ---------------------------------------------------------------------------
// getIvanLocation
// Returns the location where Ivan should appear for the given act.
// Uses the ivanLocations map from the intern_ivan_roaming quest.
// Returns null if act is out of range.
// ---------------------------------------------------------------------------
export function getIvanLocation(act) {
  const ivanQuest = getById('intern_ivan_roaming')
  if (!ivanQuest || !ivanQuest.ivanLocations) return null
  return ivanQuest.ivanLocations[act] || null
}

// ---------------------------------------------------------------------------
// canAdvanceAliceStage
// Checks if Alice's current stage's requiresFlags are all met.
// Returns boolean.
// ---------------------------------------------------------------------------
export function canAdvanceAliceStage(stageIndex, storyFlags) {
  const aliceQuest = getById('architect_alice_design')
  if (!aliceQuest) return false

  if (stageIndex < 0 || stageIndex >= aliceQuest.stages.length) return false

  const stage = aliceQuest.stages[stageIndex]
  if (!stage.requiresFlags) return true

  return stage.requiresFlags.every(flag => !!storyFlags[flag])
}
