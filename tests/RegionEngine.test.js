import { describe, it, expect, beforeEach } from 'vitest'
import {
  getConnections,
  canTravel,
  getDiscoveredTerminals,
  canFastTravel,
  addDungeonPoints,
  getDungeonPoints,
  canOpenJiraDoor,
  addResourceLock,
  getResourceLocks,
  canOpenCloudConsoleDoor,
  getEndgameModifier,
  isMvpRegion,
  DENIAL_REASONS,
  getTravelDenialToken,
  shouldShowTravelDenial,
} from '../src/engine/RegionEngine.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeGameState(overrides = {}) {
  return {
    story: {
      act: overrides.act ?? 1,
      flags: { ...(overrides.flags ?? {}) },
    },
  }
}

function makeStoryFlags(overrides = {}) {
  return { ...overrides }
}

// ===========================================================================
// DENIAL_REASONS
// ===========================================================================

describe('DENIAL_REASONS', () => {
  it('exports all three denial reason constants', () => {
    expect(DENIAL_REASONS.ACT_GATE).toBe('act_gate')
    expect(DENIAL_REASONS.DUNGEON_POINTS).toBe('dungeon_points')
    expect(DENIAL_REASONS.RESOURCE_LOCKS).toBe('resource_locks')
  })

  it('is frozen', () => {
    expect(Object.isFrozen(DENIAL_REASONS)).toBe(true)
  })
})

// ===========================================================================
// getConnections
// ===========================================================================

describe('getConnections', () => {
  it('returns connections object for a valid region', () => {
    const conns = getConnections('localhost_town')
    expect(conns).toBeTruthy()
    expect(conns.east).toBeDefined()
    expect(conns.east.target).toBe('pipeline_pass')
  })

  it('returns null for an invalid / nonexistent region', () => {
    expect(getConnections('nonexistent_region')).toBeNull()
  })

  it('returns correct directions for pipeline_pass', () => {
    const conns = getConnections('pipeline_pass')
    expect(conns.west.target).toBe('localhost_town')
    expect(conns.east.target).toBe('production_plains')
    expect(conns.north.target).toBe('jira_dungeon_1')
  })
})

// ===========================================================================
// canTravel
// ===========================================================================

describe('canTravel', () => {
  it('returns not-allowed with nulls when no connection exists for direction', () => {
    const gs = makeGameState()
    const result = canTravel('localhost_town', 'north', gs)
    expect(result).toEqual({
      allowed: false,
      reasonId: null,
      reasonParams: null,
      target: null,
      entry: null,
    })
  })

  it('allows travel when no requirements exist', () => {
    const gs = makeGameState()
    const result = canTravel('localhost_town', 'east', gs)
    expect(result).toEqual({
      allowed: true,
      reasonId: null,
      reasonParams: null,
      target: 'pipeline_pass',
      entry: 'west',
    })
  })

  // --- Act gate ---

  it('blocks travel when act requirement is not met', () => {
    const gs = makeGameState({ act: 1 })
    const result = canTravel('pipeline_pass', 'east', gs)
    expect(result.allowed).toBe(false)
    expect(result.reasonId).toBe(DENIAL_REASONS.ACT_GATE)
    expect(result.reasonParams).toEqual({ requiredAct: 2 })
    expect(result.target).toBe('production_plains')
    expect(result.entry).toBe('west')
  })

  it('allows travel when act requirement is met', () => {
    const gs = makeGameState({ act: 2 })
    const result = canTravel('pipeline_pass', 'east', gs)
    expect(result.allowed).toBe(true)
    expect(result.reasonId).toBeNull()
    expect(result.target).toBe('production_plains')
  })

  it('allows travel when act exceeds requirement', () => {
    const gs = makeGameState({ act: 3 })
    const result = canTravel('pipeline_pass', 'east', gs)
    expect(result.allowed).toBe(true)
  })

  // --- Dungeon points gate ---

  it('blocks travel when dungeon points requirement is not met', () => {
    const gs = makeGameState({ flags: { jira_dungeon_story_points: 5 } })
    const result = canTravel('jira_dungeon_1', 'north', gs)
    expect(result.allowed).toBe(false)
    expect(result.reasonId).toBe(DENIAL_REASONS.DUNGEON_POINTS)
    expect(result.reasonParams).toEqual({ required: 13, current: 5 })
    expect(result.target).toBe('jira_dungeon_2')
  })

  it('blocks travel when dungeon points flag is missing (zero)', () => {
    const gs = makeGameState()
    const result = canTravel('jira_dungeon_1', 'north', gs)
    expect(result.allowed).toBe(false)
    expect(result.reasonId).toBe(DENIAL_REASONS.DUNGEON_POINTS)
    expect(result.reasonParams).toEqual({ required: 13, current: 0 })
  })

  it('allows travel when dungeon points meet requirement', () => {
    const gs = makeGameState({ flags: { jira_dungeon_story_points: 13 } })
    const result = canTravel('jira_dungeon_1', 'north', gs)
    expect(result.allowed).toBe(true)
    expect(result.reasonId).toBeNull()
  })

  it('allows travel when dungeon points exceed requirement', () => {
    const gs = makeGameState({ flags: { jira_dungeon_story_points: 20 } })
    const result = canTravel('jira_dungeon_1', 'north', gs)
    expect(result.allowed).toBe(true)
  })

  // --- Resource locks gate ---

  it('blocks travel when resource locks requirement is not met', () => {
    const gs = makeGameState({ flags: { cloud_console_locks_opened: 1 } })
    const result = canTravel('cloud_console_1', 'north', gs)
    expect(result.allowed).toBe(false)
    expect(result.reasonId).toBe(DENIAL_REASONS.RESOURCE_LOCKS)
    expect(result.reasonParams).toEqual({ required: 3, current: 1 })
    expect(result.target).toBe('cloud_console_2')
  })

  it('blocks travel when resource locks flag is missing (zero)', () => {
    const gs = makeGameState()
    const result = canTravel('cloud_console_1', 'north', gs)
    expect(result.allowed).toBe(false)
    expect(result.reasonId).toBe(DENIAL_REASONS.RESOURCE_LOCKS)
    expect(result.reasonParams).toEqual({ required: 3, current: 0 })
  })

  it('allows travel when resource locks meet requirement', () => {
    const gs = makeGameState({ flags: { cloud_console_locks_opened: 3 } })
    const result = canTravel('cloud_console_1', 'north', gs)
    expect(result.allowed).toBe(true)
    expect(result.reasonId).toBeNull()
  })

  it('allows travel when resource locks exceed requirement', () => {
    const gs = makeGameState({ flags: { cloud_console_locks_opened: 5 } })
    const result = canTravel('cloud_console_1', 'north', gs)
    expect(result.allowed).toBe(true)
  })

  // --- Nonexistent region ---

  it('returns not-allowed with nulls for nonexistent region', () => {
    const gs = makeGameState()
    const result = canTravel('nonexistent', 'east', gs)
    expect(result).toEqual({
      allowed: false,
      reasonId: null,
      reasonParams: null,
      target: null,
      entry: null,
    })
  })
})

// ===========================================================================
// denial retrigger helpers
// ===========================================================================

describe('getTravelDenialToken', () => {
  it('returns null for allowed travel results', () => {
    const token = getTravelDenialToken('localhost_town', 'east', {
      allowed: true, reasonId: null, target: 'pipeline_pass',
    })
    expect(token).toBeNull()
  })

  it('returns null when travel result has no target', () => {
    const token = getTravelDenialToken('localhost_town', 'north', {
      allowed: false, reasonId: DENIAL_REASONS.ACT_GATE, target: null,
    })
    expect(token).toBeNull()
  })

  it('returns a stable token for the same denied attempt', () => {
    const result = {
      allowed: false,
      reasonId: DENIAL_REASONS.ACT_GATE,
      target: 'production_plains',
    }
    const tokenA = getTravelDenialToken('pipeline_pass', 'east', result)
    const tokenB = getTravelDenialToken('pipeline_pass', 'east', result)
    expect(tokenA).toBe('pipeline_pass:east:act_gate:production_plains')
    expect(tokenB).toBe(tokenA)
  })
})

describe('shouldShowTravelDenial', () => {
  it('shows the first denial, then suppresses identical repeats', () => {
    const denied = {
      allowed: false,
      reasonId: DENIAL_REASONS.ACT_GATE,
      target: 'production_plains',
    }
    const first = shouldShowTravelDenial(null, 'pipeline_pass', 'east', denied)
    expect(first.shouldShow).toBe(true)
    expect(first.token).toBe('pipeline_pass:east:act_gate:production_plains')

    const second = shouldShowTravelDenial(first.token, 'pipeline_pass', 'east', denied)
    expect(second.shouldShow).toBe(false)
    expect(second.token).toBe(first.token)
  })

  it('allows dialog again when denial context changes', () => {
    const deniedActGate = {
      allowed: false,
      reasonId: DENIAL_REASONS.ACT_GATE,
      target: 'production_plains',
    }
    const deniedResourceGate = {
      allowed: false,
      reasonId: DENIAL_REASONS.RESOURCE_LOCKS,
      target: 'cloud_console_2',
    }
    const first = shouldShowTravelDenial(null, 'pipeline_pass', 'east', deniedActGate)
    const second = shouldShowTravelDenial(first.token, 'cloud_console_1', 'north', deniedResourceGate)
    expect(second.shouldShow).toBe(true)
    expect(second.token).not.toBe(first.token)
  })
})

// ===========================================================================
// getDiscoveredTerminals
// ===========================================================================

describe('getDiscoveredTerminals', () => {
  it('returns empty array when no terminals are discovered', () => {
    const flags = makeStoryFlags()
    expect(getDiscoveredTerminals(flags)).toEqual([])
  })

  it('returns discovered terminal region IDs', () => {
    const flags = makeStoryFlags({
      terminal_unlocked_localhost_town: true,
      terminal_unlocked_pipeline_pass: true,
    })
    const result = getDiscoveredTerminals(flags)
    expect(result).toContain('localhost_town')
    expect(result).toContain('pipeline_pass')
    expect(result).toHaveLength(2)
  })

  it('filters out regions that do not have hasFastTravel: true', () => {
    const flags = makeStoryFlags({
      terminal_unlocked_localhost_town: true,      // hasFastTravel: true
      terminal_unlocked_terminal_gym: true,         // hasFastTravel: false
      terminal_unlocked_jira_dungeon_1: true,       // hasFastTravel: false
    })
    const result = getDiscoveredTerminals(flags)
    expect(result).toContain('localhost_town')
    expect(result).not.toContain('terminal_gym')
    expect(result).not.toContain('jira_dungeon_1')
    expect(result).toHaveLength(1)
  })

  it('filters out nonexistent region IDs', () => {
    const flags = makeStoryFlags({
      terminal_unlocked_localhost_town: true,
      terminal_unlocked_fake_region: true,
    })
    const result = getDiscoveredTerminals(flags)
    expect(result).toContain('localhost_town')
    expect(result).not.toContain('fake_region')
    expect(result).toHaveLength(1)
  })
})

// ===========================================================================
// canFastTravel
// ===========================================================================

describe('canFastTravel', () => {
  it('returns true when region exists, has fast travel, and terminal is unlocked', () => {
    const flags = makeStoryFlags({ terminal_unlocked_localhost_town: true })
    expect(canFastTravel('localhost_town', flags)).toBe(true)
  })

  it('returns false when region does not exist', () => {
    const flags = makeStoryFlags({ terminal_unlocked_fake: true })
    expect(canFastTravel('fake', flags)).toBe(false)
  })

  it('returns false when region has no fast travel', () => {
    const flags = makeStoryFlags({ terminal_unlocked_terminal_gym: true })
    expect(canFastTravel('terminal_gym', flags)).toBe(false)
  })

  it('returns false when terminal is not discovered', () => {
    const flags = makeStoryFlags()
    expect(canFastTravel('localhost_town', flags)).toBe(false)
  })

  it('returns false when terminal flag is falsy', () => {
    const flags = makeStoryFlags({ terminal_unlocked_localhost_town: false })
    expect(canFastTravel('localhost_town', flags)).toBe(false)
  })
})

// ===========================================================================
// addDungeonPoints / getDungeonPoints
// ===========================================================================

describe('getDungeonPoints', () => {
  it('returns 0 when flag is not set', () => {
    expect(getDungeonPoints(makeStoryFlags())).toBe(0)
  })

  it('returns current value when flag is set', () => {
    expect(getDungeonPoints(makeStoryFlags({ jira_dungeon_story_points: 7 }))).toBe(7)
  })
})

describe('addDungeonPoints', () => {
  it('initializes to amount when flag is not set', () => {
    const flags = makeStoryFlags()
    const total = addDungeonPoints(flags, 5)
    expect(total).toBe(5)
    expect(flags.jira_dungeon_story_points).toBe(5)
  })

  it('increments existing value', () => {
    const flags = makeStoryFlags({ jira_dungeon_story_points: 3 })
    const total = addDungeonPoints(flags, 4)
    expect(total).toBe(7)
    expect(flags.jira_dungeon_story_points).toBe(7)
  })

  it('handles multiple successive adds', () => {
    const flags = makeStoryFlags()
    addDungeonPoints(flags, 2)
    addDungeonPoints(flags, 3)
    const total = addDungeonPoints(flags, 8)
    expect(total).toBe(13)
    expect(getDungeonPoints(flags)).toBe(13)
  })
})

// ===========================================================================
// canOpenJiraDoor
// ===========================================================================

describe('canOpenJiraDoor', () => {
  it('returns false when below threshold (12)', () => {
    expect(canOpenJiraDoor(makeStoryFlags({ jira_dungeon_story_points: 12 }))).toBe(false)
  })

  it('returns false when points not set (0)', () => {
    expect(canOpenJiraDoor(makeStoryFlags())).toBe(false)
  })

  it('returns true when exactly at threshold (13)', () => {
    expect(canOpenJiraDoor(makeStoryFlags({ jira_dungeon_story_points: 13 }))).toBe(true)
  })

  it('returns true when above threshold (20)', () => {
    expect(canOpenJiraDoor(makeStoryFlags({ jira_dungeon_story_points: 20 }))).toBe(true)
  })
})

// ===========================================================================
// addResourceLock / getResourceLocks
// ===========================================================================

describe('getResourceLocks', () => {
  it('returns 0 when flag is not set', () => {
    expect(getResourceLocks(makeStoryFlags())).toBe(0)
  })

  it('returns current value when flag is set', () => {
    expect(getResourceLocks(makeStoryFlags({ cloud_console_locks_opened: 2 }))).toBe(2)
  })
})

describe('addResourceLock', () => {
  it('initializes to 1 when flag is not set', () => {
    const flags = makeStoryFlags()
    const total = addResourceLock(flags)
    expect(total).toBe(1)
    expect(flags.cloud_console_locks_opened).toBe(1)
  })

  it('increments existing value', () => {
    const flags = makeStoryFlags({ cloud_console_locks_opened: 2 })
    const total = addResourceLock(flags)
    expect(total).toBe(3)
    expect(flags.cloud_console_locks_opened).toBe(3)
  })
})

// ===========================================================================
// canOpenCloudConsoleDoor
// ===========================================================================

describe('canOpenCloudConsoleDoor', () => {
  it('returns false when below threshold (2)', () => {
    expect(canOpenCloudConsoleDoor(makeStoryFlags({ cloud_console_locks_opened: 2 }))).toBe(false)
  })

  it('returns false when locks not set (0)', () => {
    expect(canOpenCloudConsoleDoor(makeStoryFlags())).toBe(false)
  })

  it('returns true when exactly at threshold (3)', () => {
    expect(canOpenCloudConsoleDoor(makeStoryFlags({ cloud_console_locks_opened: 3 }))).toBe(true)
  })

  it('returns true when above threshold (5)', () => {
    expect(canOpenCloudConsoleDoor(makeStoryFlags({ cloud_console_locks_opened: 5 }))).toBe(true)
  })
})

// ===========================================================================
// getEndgameModifier
// ===========================================================================

describe('getEndgameModifier', () => {
  it('returns 0 for act 1', () => {
    expect(getEndgameModifier(1)).toBe(0)
  })

  it('returns 0 for act 2', () => {
    expect(getEndgameModifier(2)).toBe(0)
  })

  it('returns 0 for act 3', () => {
    expect(getEndgameModifier(3)).toBe(0)
  })

  it('returns 2 for act 4', () => {
    expect(getEndgameModifier(4)).toBe(2)
  })

  it('returns 2 for act 5 (above 4)', () => {
    expect(getEndgameModifier(5)).toBe(2)
  })
})

// ===========================================================================
// isMvpRegion
// ===========================================================================

describe('isMvpRegion', () => {
  it('returns true for a region with mvp: true', () => {
    // localhost_town has mvp: true
    expect(isMvpRegion('localhost_town')).toBe(true)
  })

  it('returns true for another mvp region', () => {
    // pipeline_pass has mvp: true
    expect(isMvpRegion('pipeline_pass')).toBe(true)
  })

  it('returns false for a region with mvp: false', () => {
    // azure_town has mvp: false
    expect(isMvpRegion('azure_town')).toBe(false)
  })

  it('returns false for a nonexistent region', () => {
    expect(isMvpRegion('nonexistent_region')).toBe(false)
  })
})
