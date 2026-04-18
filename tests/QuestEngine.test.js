import { describe, it, expect } from 'vitest'
import { resolveChoice, isQuestCompleted, getCompletedDialog } from '../src/engine/QuestEngine.js'

describe('QuestEngine', () => {
  describe('resolveChoice', () => {
    it('returns correct outcome with XP, items, and dialog for the right answer', () => {
      // Choice index 1 is "You need Azure App Service." (correct)
      const result = resolveChoice('margaret_website', 1)
      expect(result.correct).toBe(true)
      expect(result.xp).toBe(50)
      expect(result.hpLoss).toBe(0)
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('azure_credit_voucher')
      expect(result.items[0].tab).toBe('tools')
      expect(result.items[0].qty).toBe(1)
      expect(result.dialog).toEqual(["You're a lifesaver! Here, take this."])
    })

    it('returns wrong outcome with HP loss for an incorrect answer', () => {
      // Choice index 0 is "Have you tried restarting it?" (wrong, hpLoss: 10)
      const result = resolveChoice('margaret_website', 0)
      expect(result.correct).toBe(false)
      expect(result.xp).toBe(0)
      expect(result.hpLoss).toBe(10)
      expect(result.items).toEqual([])
      expect(result.dialog).toEqual(["That didn't help..."])
    })

    it('returns wrong outcome for third wrong answer', () => {
      // Choice index 2 is "Buy more RAM." (wrong, hpLoss: 10)
      const result = resolveChoice('margaret_website', 2)
      expect(result.correct).toBe(false)
      expect(result.hpLoss).toBe(10)
    })

    it('looks up item tab from items registry', () => {
      const result = resolveChoice('margaret_website', 1)
      // azure_credit_voucher is defined as tab: 'tools' in items.js
      expect(result.items[0].tab).toBe('tools')
    })
  })

  describe('isQuestCompleted', () => {
    it('returns true when quest ID is in completed list', () => {
      expect(isQuestCompleted('margaret_website', ['margaret_website'])).toBe(true)
    })

    it('returns false when quest ID is not in completed list', () => {
      expect(isQuestCompleted('margaret_website', [])).toBe(false)
    })
  })

  describe('getCompletedDialog', () => {
    it('returns the completedDialog array for a known quest', () => {
      const dialog = getCompletedDialog('margaret_website')
      expect(dialog).toEqual(["The website's been running for 3 days! Best week ever."])
    })

    it('returns fallback for unknown quest', () => {
      const dialog = getCompletedDialog('nonexistent_quest')
      expect(dialog).toEqual(['...'])
    })
  })
})
