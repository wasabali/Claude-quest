import { describe, it, expect } from 'vitest'
import {
  isQuestAvailable,
  getQuestStatus,
  startQuest,
  getCurrentStage,
  resolveChoice,
  advanceStage,
  getIvanLocation,
  canAdvanceAliceStage,
} from '../src/engine/QuestEngine.js'

// ---------------------------------------------------------------------------
// Helper: creates a fresh story state for tests
// ---------------------------------------------------------------------------
function freshStory(overrides = {}) {
  return {
    act:             1,
    completedQuests: [],
    flags:           { act_1_started: true },
    activeQuests:    {},
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// isQuestAvailable
// ---------------------------------------------------------------------------
describe('isQuestAvailable', () => {
  it('returns available for a quest that exists and meets all criteria', () => {
    const story = freshStory()
    const result = isQuestAvailable('dev_dave_flaky', story)
    expect(result.available).toBe(true)
    expect(result.reason).toBeNull()
  })

  it('returns unavailable for a quest that does not exist', () => {
    const result = isQuestAvailable('nonexistent_quest', freshStory())
    expect(result.available).toBe(false)
    expect(result.reason).toContain('not found')
  })

  it('returns unavailable when act is too low', () => {
    const story = freshStory({ act: 1, flags: { act_2_started: true } })
    const result = isQuestAvailable('nervous_nancy_breach', story)
    expect(result.available).toBe(false)
    expect(result.reason).toContain('act')
  })

  it('returns available when act matches', () => {
    const story = freshStory({ act: 2, flags: { act_2_started: true } })
    const result = isQuestAvailable('nervous_nancy_breach', story)
    expect(result.available).toBe(true)
  })

  it('returns available when act exceeds quest act', () => {
    const story = freshStory({ act: 3, flags: { act_2_started: true } })
    const result = isQuestAvailable('nervous_nancy_breach', story)
    expect(result.available).toBe(true)
  })

  it('returns unavailable when required flags are missing', () => {
    const story = freshStory({ flags: {} })
    const result = isQuestAvailable('dev_dave_flaky', story)
    expect(result.available).toBe(false)
    expect(result.reason).toContain('flag')
  })

  it('returns unavailable when an exclude flag is set', () => {
    // dave_quest_complete is both in excludeFlags and is the completionFlag.
    // The completionFlag check fires first, which is correct.
    // We test the result is unavailable regardless of which check fires.
    const story = freshStory({ flags: { act_1_started: true, dave_quest_complete: true } })
    const result = isQuestAvailable('dev_dave_flaky', story)
    expect(result.available).toBe(false)
  })

  it('returns unavailable specifically from excludeFlags when completionFlag differs', () => {
    // nervous_nancy has excludeFlags: ['nancy_quest_complete'] and
    // completionFlag: 'nancy_quest_complete'. To isolate excludeFlags,
    // we test that setting the exclude flag blocks availability.
    // Since they're the same, the completionFlag check fires — still unavailable.
    const story = freshStory({
      act: 2,
      flags: { act_2_started: true, nancy_quest_complete: true },
    })
    const result = isQuestAvailable('nervous_nancy_breach', story)
    expect(result.available).toBe(false)
  })

  it('returns unavailable when quest completionFlag is already set', () => {
    const story = freshStory({ flags: { act_1_started: true, dave_quest_complete: true } })
    const result = isQuestAvailable('dev_dave_flaky', story)
    expect(result.available).toBe(false)
  })

  it('returns available for quest with no act requirement (margaret_website)', () => {
    const story = freshStory({ act: 1, flags: {} })
    const result = isQuestAvailable('margaret_website', story)
    expect(result.available).toBe(true)
  })

  it('returns available for quest with no requiresFlags (margaret_website)', () => {
    const story = freshStory({ act: 1, flags: {} })
    const result = isQuestAvailable('margaret_website', story)
    expect(result.available).toBe(true)
  })

  it('returns unavailable when quest is already active and completed', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 1, attempts: 1, complete: true } },
    })
    const result = isQuestAvailable('dev_dave_flaky', story)
    expect(result.available).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getQuestStatus
// ---------------------------------------------------------------------------
describe('getQuestStatus', () => {
  it('returns unavailable for nonexistent quest', () => {
    const result = getQuestStatus('nonexistent', freshStory())
    expect(result).toBe('unavailable')
  })

  it('returns complete when completionFlag is set', () => {
    const story = freshStory({ flags: { act_1_started: true, dave_quest_complete: true } })
    const result = getQuestStatus('dev_dave_flaky', story)
    expect(result).toBe('complete')
  })

  it('returns active when quest is in activeQuests and not complete', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const result = getQuestStatus('dev_dave_flaky', story)
    expect(result).toBe('active')
  })

  it('returns available when quest meets all criteria but is not started', () => {
    const story = freshStory()
    const result = getQuestStatus('dev_dave_flaky', story)
    expect(result).toBe('available')
  })

  it('returns unavailable when quest criteria are not met', () => {
    const story = freshStory({ act: 1, flags: {} })
    const result = getQuestStatus('nervous_nancy_breach', story)
    expect(result).toBe('unavailable')
  })

  it('returns followed_up when quest has follow-up flag set', () => {
    const story = freshStory({
      flags: {
        act_1_started: true,
        dave_quest_complete: true,
        quest_dev_dave_flaky_followed_up: true,
      },
    })
    const result = getQuestStatus('dev_dave_flaky', story)
    expect(result).toBe('followed_up')
  })
})

// ---------------------------------------------------------------------------
// startQuest
// ---------------------------------------------------------------------------
describe('startQuest', () => {
  it('adds quest to activeQuests with stage 0 and attempts 1', () => {
    const story = freshStory()
    const result = startQuest('dev_dave_flaky', story)
    expect(result.started).toBe(true)
    expect(result.questData).toBeDefined()
    expect(result.questData.id).toBe('dev_dave_flaky')
    expect(story.activeQuests.dev_dave_flaky).toEqual({ stage: 0, attempts: 1 })
  })

  it('returns started false for nonexistent quest', () => {
    const story = freshStory()
    const result = startQuest('nonexistent', story)
    expect(result.started).toBe(false)
    expect(result.questData).toBeNull()
  })

  it('returns started false if quest is already active', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const result = startQuest('dev_dave_flaky', story)
    expect(result.started).toBe(false)
  })

  it('returns started false if quest is already complete', () => {
    const story = freshStory({
      flags: { act_1_started: true, dave_quest_complete: true },
    })
    const result = startQuest('dev_dave_flaky', story)
    expect(result.started).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getCurrentStage
// ---------------------------------------------------------------------------
describe('getCurrentStage', () => {
  it('returns the first stage when stage index is 0', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 0, attempts: 1 } },
    })
    const stage = getCurrentStage('intern_ivan_roaming', story)
    expect(stage).toBeDefined()
    expect(stage.dialog).toContain("Hi! I'm Ivan, the new intern.")
  })

  it('returns the second stage when stage index is 1', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 1, attempts: 1 } },
    })
    const stage = getCurrentStage('intern_ivan_roaming', story)
    expect(stage).toBeDefined()
    expect(stage.dialog).toContain('Oh hey! I have another question.')
  })

  it('returns null when quest is not active', () => {
    const story = freshStory()
    const stage = getCurrentStage('intern_ivan_roaming', story)
    expect(stage).toBeNull()
  })

  it('returns null for nonexistent quest', () => {
    const story = freshStory({
      activeQuests: { nonexistent: { stage: 0, attempts: 1 } },
    })
    const stage = getCurrentStage('nonexistent', story)
    expect(stage).toBeNull()
  })

  it('returns null when stage index is out of bounds', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 99, attempts: 1 } },
    })
    const stage = getCurrentStage('dev_dave_flaky', story)
    expect(stage).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// resolveChoice
// ---------------------------------------------------------------------------
describe('resolveChoice', () => {
  it('returns correct=optimal for the optimal choice', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 2 is "Find the race condition and fix it" — optimal
    const event = resolveChoice('dev_dave_flaky', 2, story, player)
    expect(event.correct).toBe('optimal')
    expect(event.xp).toBe(120)
    expect(event.questId).toBe('dev_dave_flaky')
    expect(event.stageIndex).toBe(0)
    expect(event.choiceIndex).toBe(2)
    expect(event.itemReward).toEqual({ id: 'skip_tests_scroll', qty: 1 })
    expect(event.flag).toBe('dave_quest_optimal')
    expect(event.responseDialog).toEqual(['That was the actual problem. Genius.'])
  })

  it('returns correct=standard for the standard choice', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 1 is "Add retry logic" — standard
    const event = resolveChoice('dev_dave_flaky', 1, story, player)
    expect(event.correct).toBe('standard')
    expect(event.xp).toBe(75)
  })

  it('returns correct=false for a wrong choice', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 0 is "Delete the failing test" — false
    const event = resolveChoice('dev_dave_flaky', 0, story, player)
    expect(event.correct).toBe(false)
    expect(event.penalty).toEqual({ type: 'budget', value: -20 })
    expect(event.responseDialog).toEqual(["It's still flaky. Cheaper now I guess."])
  })

  it('returns correct=cursed for a cursed choice', () => {
    const story = freshStory({
      act: 2,
      flags: { act_2_started: true },
      activeQuests: { budget_barry_bill: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 2 is "Delete everything and start over" — cursed
    const event = resolveChoice('budget_barry_bill', 2, story, player)
    expect(event.correct).toBe('cursed')
    expect(event.shameDelta).toBe(1)
    expect(event.repDelta).toBe(-30)
  })

  it('returns correct=nuclear for a nuclear choice', () => {
    const story = freshStory({
      act: 2,
      flags: { act_2_started: true },
      activeQuests: { nervous_nancy_breach: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 2 is "Don't worry" — nuclear
    const event = resolveChoice('nervous_nancy_breach', 2, story, player)
    expect(event.correct).toBe('nuclear')
    expect(event.shameDelta).toBe(2)
    expect(event.triggerEncounter).toBe('leaked_secret')
  })

  it('includes responseDialog from the choice', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    const event = resolveChoice('dev_dave_flaky', 2, story, player)
    expect(event.responseDialog).toEqual(['That was the actual problem. Genius.'])
  })

  it('defaults xp, repDelta, shameDelta to 0 when not specified', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice index 0 — wrong, no xp/repDelta/shameDelta specified
    const event = resolveChoice('dev_dave_flaky', 0, story, player)
    expect(event.xp).toBe(0)
    expect(event.repDelta).toBe(0)
    expect(event.shameDelta).toBe(0)
  })

  it('returns null for nonexistent quest', () => {
    const story = freshStory({
      activeQuests: { nonexistent: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100 }
    const event = resolveChoice('nonexistent', 0, story, player)
    expect(event).toBeNull()
  })

  it('returns null when quest is not active', () => {
    const story = freshStory()
    const player = { hp: 100, maxHp: 100 }
    const event = resolveChoice('dev_dave_flaky', 0, story, player)
    expect(event).toBeNull()
  })

  it('returns null for out-of-bounds choice index', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100 }
    const event = resolveChoice('dev_dave_flaky', 99, story, player)
    expect(event).toBeNull()
  })

  it('sets questComplete true for single-stage quest resolved correctly', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    const event = resolveChoice('dev_dave_flaky', 2, story, player)
    // dev_dave_flaky has 1 stage, resolving the last one should mark complete
    expect(event.questComplete).toBe(true)
    expect(event.completionFlag).toBe('dave_quest_complete')
  })

  it('sets questComplete false for multi-stage quest not on last stage', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    const event = resolveChoice('intern_ivan_roaming', 1, story, player)
    expect(event.questComplete).toBe(false)
  })

  it('sets questComplete true for multi-stage quest on last stage', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 4, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // Ivan's stage 4, choice 0 is optimal
    const event = resolveChoice('intern_ivan_roaming', 0, story, player)
    expect(event.questComplete).toBe(true)
    expect(event.completionFlag).toBe('ivan_quest_complete')
  })

  it('does not mark questComplete for wrong answer on single-stage quest', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // wrong answer
    const event = resolveChoice('dev_dave_flaky', 0, story, player)
    expect(event.questComplete).toBe(false)
  })

  it('clamps HP penalty so HP never goes below 1', () => {
    // margaret_website has hpLoss: 10 on wrong choices
    const story = freshStory({
      activeQuests: { margaret_website: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 5, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice 0 is "Have you tried restarting it?" — wrong with hpLoss: 10
    const event = resolveChoice('margaret_website', 0, story, player)
    // HP floor: penalty should be clamped so player doesn't go below 1
    expect(event.penalty).toBeDefined()
    expect(event.penalty.type).toBe('hp')
    expect(event.penalty.value).toBe(-4) // 5 - 1 = 4, clamped
  })

  it('applies full HP penalty when HP is high enough', () => {
    const story = freshStory({
      activeQuests: { margaret_website: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    const event = resolveChoice('margaret_website', 0, story, player)
    expect(event.penalty.type).toBe('hp')
    expect(event.penalty.value).toBe(-10)
  })

  it('returns repDelta from shortcut choices', () => {
    const story = freshStory({
      activeQuests: { startup_steve_storage: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice 0 is "Delete the logs folder" — shortcut
    const event = resolveChoice('startup_steve_storage', 0, story, player)
    expect(event.correct).toBe('shortcut')
    expect(event.repDelta).toBe(-5)
    expect(event.xp).toBe(30)
  })

  it('includes itemReward when choice has one', () => {
    const story = freshStory({
      activeQuests: { startup_steve_storage: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice 1 is "Mount a bigger volume" — standard with item
    const event = resolveChoice('startup_steve_storage', 1, story, player)
    expect(event.itemReward).toEqual({ id: 'ssh_key_staging', qty: 1 })
  })

  it('returns null itemReward when choice has none', () => {
    const story = freshStory({
      activeQuests: { startup_steve_storage: { stage: 0, attempts: 1 } },
    })
    const player = { hp: 100, maxHp: 100, reputation: 50, shamePoints: 0 }
    // choice 0 — shortcut, no itemReward
    const event = resolveChoice('startup_steve_storage', 0, story, player)
    expect(event.itemReward).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// advanceStage
// ---------------------------------------------------------------------------
describe('advanceStage', () => {
  it('increments stage by 1', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 0, attempts: 1 } },
    })
    const result = advanceStage('intern_ivan_roaming', story)
    expect(result.advanced).toBe(true)
    expect(result.newStage).toBe(1)
    expect(result.questComplete).toBe(false)
    expect(story.activeQuests.intern_ivan_roaming.stage).toBe(1)
  })

  it('marks quest complete when advancing past last stage', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 4, attempts: 1 } },
    })
    const result = advanceStage('intern_ivan_roaming', story)
    expect(result.advanced).toBe(true)
    expect(result.questComplete).toBe(true)
    expect(result.newStage).toBe(5)
    expect(story.flags.ivan_quest_complete).toBe(true)
  })

  it('returns advanced false for nonexistent quest', () => {
    const story = freshStory({
      activeQuests: { nonexistent: { stage: 0, attempts: 1 } },
    })
    const result = advanceStage('nonexistent', story)
    expect(result.advanced).toBe(false)
  })

  it('returns advanced false when quest is not active', () => {
    const story = freshStory()
    const result = advanceStage('intern_ivan_roaming', story)
    expect(result.advanced).toBe(false)
  })

  it('marks single-stage quest complete on first advance', () => {
    const story = freshStory({
      activeQuests: { dev_dave_flaky: { stage: 0, attempts: 1 } },
    })
    const result = advanceStage('dev_dave_flaky', story)
    expect(result.advanced).toBe(true)
    expect(result.questComplete).toBe(true)
    expect(story.flags.dave_quest_complete).toBe(true)
  })

  it('does not mark quest complete when there are more stages', () => {
    const story = freshStory({
      activeQuests: { intern_ivan_roaming: { stage: 2, attempts: 1 } },
    })
    const result = advanceStage('intern_ivan_roaming', story)
    expect(result.questComplete).toBe(false)
    expect(story.flags.ivan_quest_complete).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// getIvanLocation
// ---------------------------------------------------------------------------
describe('getIvanLocation', () => {
  it('returns pipeline_pass for act 1', () => {
    expect(getIvanLocation(1)).toBe('pipeline_pass')
  })

  it('returns staging_valley for act 2', () => {
    expect(getIvanLocation(2)).toBe('staging_valley')
  })

  it('returns jira_dungeon for act 3', () => {
    expect(getIvanLocation(3)).toBe('jira_dungeon')
  })

  it('returns architecture_district for act 4', () => {
    expect(getIvanLocation(4)).toBe('architecture_district')
  })

  it('returns cloud_console for act 5', () => {
    expect(getIvanLocation(5)).toBe('cloud_console')
  })

  it('returns null for act 0 (out of range)', () => {
    expect(getIvanLocation(0)).toBeNull()
  })

  it('returns null for act 6 (out of range)', () => {
    expect(getIvanLocation(6)).toBeNull()
  })

  it('returns null for negative act', () => {
    expect(getIvanLocation(-1)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// canAdvanceAliceStage
// ---------------------------------------------------------------------------
describe('canAdvanceAliceStage', () => {
  it('returns true when all required flags are present for stage 0', () => {
    const flags = { architecture_district_entered: true }
    expect(canAdvanceAliceStage(0, flags)).toBe(true)
  })

  it('returns false when required flag is missing for stage 0', () => {
    expect(canAdvanceAliceStage(0, {})).toBe(false)
  })

  it('returns true when all required flags are present for stage 1', () => {
    const flags = { security_vault_cleared: true }
    expect(canAdvanceAliceStage(1, flags)).toBe(true)
  })

  it('returns false when required flag is missing for stage 1', () => {
    expect(canAdvanceAliceStage(1, {})).toBe(false)
  })

  it('returns true when all required flags are present for stage 3', () => {
    const flags = {
      blueprint_v1_acquired: true,
      blueprint_v2_acquired: true,
      blueprint_v3_acquired: true,
      gym_7_complete: true,
    }
    expect(canAdvanceAliceStage(3, flags)).toBe(true)
  })

  it('returns false when one of many required flags is missing for stage 3', () => {
    const flags = {
      blueprint_v1_acquired: true,
      blueprint_v2_acquired: true,
      blueprint_v3_acquired: true,
      // missing gym_7_complete
    }
    expect(canAdvanceAliceStage(3, flags)).toBe(false)
  })

  it('returns false for out-of-range stage index', () => {
    expect(canAdvanceAliceStage(99, {})).toBe(false)
  })

  it('returns false for negative stage index', () => {
    expect(canAdvanceAliceStage(-1, { architecture_district_entered: true })).toBe(false)
  })
})
