// EconomyEngine.js — pure economy logic, zero Phaser imports.
// Handles shop pricing, budget restoration, battle rewards, and budget debt.

import {
  ECONOMY,
  BUDGET_DEBT,
  BATTLE_REWARDS,
  REPUTATION_THRESHOLDS,
} from '../config.js'

// ---------------------------------------------------------------------------
// getReputationThreshold
// Returns the matching reputation threshold entry for the given reputation.
// ---------------------------------------------------------------------------
export function getReputationThreshold(reputation) {
  for (const threshold of REPUTATION_THRESHOLDS) {
    if (reputation >= threshold.min) return threshold
  }
  return REPUTATION_THRESHOLDS[REPUTATION_THRESHOLDS.length - 1]
}

// ---------------------------------------------------------------------------
// getPrice
// Returns the final price of an item in a shop, factoring in the shop's
// multiplier and the player's reputation modifier.
// ---------------------------------------------------------------------------
export function getPrice(shop, itemId, playerReputation) {
  const entry = shop.inventory.find(i => i.itemId === itemId)
  if (!entry) return null
  const repThreshold = getReputationThreshold(playerReputation)
  const repMod = 1 + (repThreshold.shopMod ?? 0)
  return Math.ceil(entry.basePrice * shop.priceMultiplier * repMod)
}

// ---------------------------------------------------------------------------
// canAfford
// Returns whether the player can afford the item. Budget may go negative
// up to debt limit; purchase is allowed when resulting budget >= DEBT_LIMIT.
// ---------------------------------------------------------------------------
export function canAfford(playerBudget, price) {
  return (playerBudget - price) >= BUDGET_DEBT.DEBT_LIMIT
}

// ---------------------------------------------------------------------------
// calculateBattleReward
// Returns the flat credit reward for a battle outcome.
// mode: 'incident' or 'trainer'
// tier: solution quality tier (for incidents) or 'win'/'lose' (for trainers)
// ---------------------------------------------------------------------------
export function calculateBattleReward(mode, tier) {
  if (mode === 'incident') {
    return BATTLE_REWARDS.incident[tier] ?? 0
  }
  if (mode === 'trainer') {
    return BATTLE_REWARDS.trainer[tier] ?? 0
  }
  return 0
}

// ---------------------------------------------------------------------------
// calculateBudgetRestore
// Returns the amount of budget to restore after a battle.
// isWin: whether the player won
// maxBudget: the player's current max budget
// ---------------------------------------------------------------------------
export function calculateBudgetRestore(isWin, maxBudget) {
  const percent = isWin ? ECONOMY.WIN_RESTORE_PERCENT : ECONOMY.LOSE_RESTORE_PERCENT
  return Math.floor(maxBudget * percent)
}

// ---------------------------------------------------------------------------
// calculatePostBattleBudget
// Returns the new budget after applying battle rewards + restore.
// Does NOT clamp to maxBudget (player may be in debt).
// ---------------------------------------------------------------------------
export function calculatePostBattleBudget(currentBudget, maxBudget, isWin, mode, tier) {
  const reward  = calculateBattleReward(mode, isWin ? tier : 'lose')
  const restore = calculateBudgetRestore(isWin, maxBudget)
  return currentBudget + reward + restore
}

// ---------------------------------------------------------------------------
// getBudgetDebtStatus
// Returns the debt status for the current budget value.
// Returns an object describing the player's debt state.
// ---------------------------------------------------------------------------
export function getBudgetDebtStatus(budget) {
  if (budget >= 0) return { inDebt: false, level: 'ok' }
  if (budget > BUDGET_DEBT.COST_ALERT_THRESHOLD) return { inDebt: true, level: 'warning' }
  if (budget > BUDGET_DEBT.PAYMENT_QUEST_THRESHOLD) return { inDebt: true, level: 'cost_alert' }
  if (budget > BUDGET_DEBT.SUSPENSION_THRESHOLD) return { inDebt: true, level: 'payment_quest' }
  return { inDebt: true, level: 'suspended' }
}

// ---------------------------------------------------------------------------
// calculateDebtPenalty
// Returns the technical_debt stacks to add per battle when in budget debt.
// Each negative budget point adds DEBT_PER_BATTLE_MOD stacks.
// ---------------------------------------------------------------------------
export function calculateDebtPenalty(budget) {
  if (budget >= 0) return 0
  return Math.floor(Math.abs(budget) * BUDGET_DEBT.DEBT_PER_BATTLE_MOD)
}

// ---------------------------------------------------------------------------
// calculateCostSpiralSurcharge
// Returns the extra budget cost for skills during the Azure Bill boss fight.
// Turn N: all skills cost +(5×N) extra budget.
// ---------------------------------------------------------------------------
export function calculateCostSpiralSurcharge(turn) {
  return 5 * turn
}

// ---------------------------------------------------------------------------
// calculateCostSpiralHpGain
// Returns the HP the Azure Bill boss gains per turn.
// Turn N: boss gains +20 HP.
// ---------------------------------------------------------------------------
export function calculateCostSpiralHpGain() {
  return 20
}

// ---------------------------------------------------------------------------
// isShopUnlocked
// Checks if a shop is accessible to the player based on unlock conditions.
// ---------------------------------------------------------------------------
export function isShopUnlocked(shop, player) {
  if (!shop.unlockCondition) return true
  if (shop.unlockCondition.shameMin !== undefined) {
    return player.shamePoints >= shop.unlockCondition.shameMin
  }
  return true
}

// ---------------------------------------------------------------------------
// purchaseItem
// Returns events describing a purchase attempt.
// Does NOT mutate state — caller applies changes.
// ---------------------------------------------------------------------------
export function purchaseItem(shop, itemId, playerBudget, playerReputation) {
  const entry = shop.inventory.find(i => i.itemId === itemId)
  if (!entry) return [{ type: 'shop_error', text: 'Item not found.' }]

  if (entry.stock === 0) return [{ type: 'shop_error', text: 'Out of stock.' }]

  const price = getPrice(shop, itemId, playerReputation)
  if (!canAfford(playerBudget, price)) {
    return [{ type: 'shop_error', text: 'Cannot afford this item.' }]
  }

  const events = [{ type: 'shop_purchase', itemId, price }]

  const newBudget = playerBudget - price
  if (newBudget < 0) {
    events.push({ type: 'budget_warning', text: '⚠ BUDGET EXCEEDED', budget: newBudget })
  }

  return events
}

// ---------------------------------------------------------------------------
// calculateQuestBudgetRestore
// Returns the budget restore amount for completing a quest.
// questType: 'main' or 'side'
// maxBudget: the player's current max budget
// ---------------------------------------------------------------------------
export function calculateQuestBudgetRestore(questType, maxBudget) {
  const percent = questType === 'main' ? ECONOMY.QUEST_MAIN_RESTORE : ECONOMY.QUEST_SIDE_RESTORE
  return Math.floor(maxBudget * percent)
}
