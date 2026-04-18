// QuestEngine.js — pure quest outcome logic, zero Phaser imports.
// Resolves quest choice outcomes and returns events for scenes to render.

import { getById as getQuestById } from '#data/quests.js'
import { getById as getItemById } from '#data/items.js'

const DEFAULT_HP_LOSS = 10

// ---------------------------------------------------------------------------
// resolveChoice
// Given a quest ID and the player's chosen index, returns a QuestEvent
// describing what happened. The scene renders these; the engine never
// mutates GameState directly.
//
// Returns:
//   { correct, xp, items: [{ id, tab, qty }], hpLoss, questId, dialog }
// ---------------------------------------------------------------------------
export function resolveChoice(questId, choiceIndex) {
  const quest = getQuestById(questId)
  const stage = quest.stages[0]
  const chosen = stage.choices[choiceIndex]

  if (chosen.correct) {
    const items = (quest.rewards.items ?? []).map(reward => {
      const itemDef = getItemById(reward.id)
      return { id: reward.id, tab: itemDef?.tab ?? 'tools', qty: reward.qty }
    })
    return {
      correct:  true,
      xp:       quest.rewards.xp,
      items,
      hpLoss:   0,
      questId,
      dialog:   stage.correctDialog,
    }
  }

  return {
    correct:  false,
    xp:       0,
    items:    [],
    hpLoss:   chosen.hpLoss ?? DEFAULT_HP_LOSS,
    questId,
    dialog:   stage.wrongDialog,
  }
}

// ---------------------------------------------------------------------------
// isQuestCompleted
// Returns true if the quest ID is in the completed list.
// ---------------------------------------------------------------------------
export function isQuestCompleted(questId, completedQuests) {
  return completedQuests.includes(questId)
}

// ---------------------------------------------------------------------------
// getCompletedDialog
// Returns the revisit dialog for a completed quest.
// ---------------------------------------------------------------------------
export function getCompletedDialog(questId) {
  const quest = getQuestById(questId)
  return quest?.completedDialog ?? ['...']
}
