import { describe, it, expect, beforeEach } from 'vitest'
import {
  DIR_OFFSETS, lerp, canRun, resolveDirection, isTileWalkable,
  updateBump, updateStep, commitStep, onStepComplete,
  shouldTriggerEncounter, checkTransition, applyTransition,
  getStepDuration,
} from '../src/engine/MovementEngine.js'
import { GameState, markDirty } from '../src/state/GameState.js'
import { MOVEMENT, ENCOUNTER_COOLDOWN_STEPS } from '../src/config.js'

// Reset GameState between tests
beforeEach(() => {
  GameState.player.tileX = 5
  GameState.player.tileY = 10
  GameState.player.location = 'localhost_town'
  GameState.stats.stepsTaken = 0
  GameState.inventory.keyItems = []
  GameState.story.flags = {}
  GameState._session.isDirty = false
})

// ── DIR_OFFSETS ──────────────────────────────────────────────────────────────

describe('DIR_OFFSETS', () => {
  it('defines 4 cardinal directions', () => {
    expect(DIR_OFFSETS.up).toEqual({ dx: 0, dy: -1 })
    expect(DIR_OFFSETS.down).toEqual({ dx: 0, dy: 1 })
    expect(DIR_OFFSETS.left).toEqual({ dx: -1, dy: 0 })
    expect(DIR_OFFSETS.right).toEqual({ dx: 1, dy: 0 })
  })
})

// ── lerp ─────────────────────────────────────────────────────────────────────

describe('lerp', () => {
  it('returns start at t=0', () => {
    expect(lerp(10, 20, 0)).toBe(10)
  })

  it('returns end at t=1', () => {
    expect(lerp(10, 20, 1)).toBe(20)
  })

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50)
  })
})

// ── resolveDirection ─────────────────────────────────────────────────────────

describe('resolveDirection', () => {
  it('returns null when no keys pressed', () => {
    expect(resolveDirection(false, false, false, false)).toBeNull()
  })

  it('returns up when up is pressed', () => {
    expect(resolveDirection(true, false, false, false)).toBe('up')
  })

  it('returns down when down is pressed', () => {
    expect(resolveDirection(false, true, false, false)).toBe('down')
  })

  it('returns left when left is pressed', () => {
    expect(resolveDirection(false, false, true, false)).toBe('left')
  })

  it('returns right when right is pressed', () => {
    expect(resolveDirection(false, false, false, true)).toBe('right')
  })

  it('vertical wins when up+right pressed simultaneously', () => {
    expect(resolveDirection(true, false, false, true)).toBe('up')
  })

  it('vertical wins when down+left pressed simultaneously', () => {
    expect(resolveDirection(false, true, true, false)).toBe('down')
  })
})

// ── isTileWalkable ───────────────────────────────────────────────────────────

describe('isTileWalkable', () => {
  const noCollision = () => null

  it('returns false for negative coordinates', () => {
    expect(isTileWalkable(-1, 5, 20, 20, noCollision)).toBe(false)
    expect(isTileWalkable(5, -1, 20, 20, noCollision)).toBe(false)
  })

  it('returns false for out-of-bounds coordinates', () => {
    expect(isTileWalkable(20, 5, 20, 20, noCollision)).toBe(false)
    expect(isTileWalkable(5, 20, 20, 20, noCollision)).toBe(false)
  })

  it('returns true for empty tile', () => {
    expect(isTileWalkable(5, 5, 20, 20, noCollision)).toBe(true)
  })

  it('returns false for tile with non-zero collision index', () => {
    const lookup = () => ({ index: 5 })
    expect(isTileWalkable(5, 5, 20, 20, lookup)).toBe(false)
  })

  it('returns true for tile with collision index 0', () => {
    const lookup = () => ({ index: 0 })
    expect(isTileWalkable(5, 5, 20, 20, lookup)).toBe(true)
  })
})

// ── getStepDuration ──────────────────────────────────────────────────────────

describe('getStepDuration', () => {
  it('returns STEP_DURATION_MS when not running', () => {
    expect(getStepDuration(false)).toBe(MOVEMENT.STEP_DURATION_MS)
  })

  it('returns RUN_STEP_DURATION_MS when running', () => {
    expect(getStepDuration(true)).toBe(MOVEMENT.RUN_STEP_DURATION_MS)
  })
})

// ── updateBump ───────────────────────────────────────────────────────────────

describe('updateBump', () => {
  it('returns non-complete for partial progress', () => {
    const result = updateBump(0, 10, 100, 200, 104, 200)
    expect(result.complete).toBe(false)
    expect(result.progress).toBe(10)
  })

  it('returns complete when progress exceeds bump duration', () => {
    const result = updateBump(0, MOVEMENT.BUMP_DURATION_MS + 1, 100, 200, 104, 200)
    expect(result.complete).toBe(true)
    expect(result.snapX).toBe(100)
    expect(result.snapY).toBe(200)
  })

  it('returns integer pixel positions', () => {
    const result = updateBump(0, MOVEMENT.BUMP_DURATION_MS / 4, 100, 200, 102, 200)
    expect(Number.isInteger(result.x)).toBe(true)
    expect(Number.isInteger(result.y)).toBe(true)
  })
})

// ── updateStep ───────────────────────────────────────────────────────────────

describe('updateStep', () => {
  it('returns non-complete for partial progress', () => {
    const result = updateStep(0, 100, 0, 0, 48, 0, false)
    expect(result.complete).toBe(false)
  })

  it('returns complete when duration exceeded', () => {
    const result = updateStep(0, MOVEMENT.STEP_DURATION_MS + 1, 0, 0, 48, 0, false)
    expect(result.complete).toBe(true)
    expect(result.x).toBe(48)
    expect(result.y).toBe(0)
  })

  it('completes faster when running', () => {
    const walkResult = updateStep(0, MOVEMENT.RUN_STEP_DURATION_MS, 0, 0, 48, 0, false)
    const runResult = updateStep(0, MOVEMENT.RUN_STEP_DURATION_MS, 0, 0, 48, 0, true)
    expect(walkResult.complete).toBe(false)
    expect(runResult.complete).toBe(true)
  })

  it('returns integer pixel positions', () => {
    const result = updateStep(0, 123, 10, 15, 58, 15, false)
    expect(Number.isInteger(result.x)).toBe(true)
    expect(Number.isInteger(result.y)).toBe(true)
  })

  it('tracks remaining time correctly', () => {
    const result = updateStep(0, 100, 0, 0, 48, 0, false)
    expect(result.remaining).toBe(MOVEMENT.STEP_DURATION_MS - 100)
  })
})

// ── commitStep ───────────────────────────────────────────────────────────────

describe('commitStep', () => {
  it('updates GameState tile position', () => {
    commitStep(7, 12)
    expect(GameState.player.tileX).toBe(7)
    expect(GameState.player.tileY).toBe(12)
  })

  it('marks state as dirty', () => {
    GameState._session.isDirty = false
    commitStep(7, 12)
    expect(GameState._session.isDirty).toBe(true)
  })
})

// ── onStepComplete ───────────────────────────────────────────────────────────

describe('onStepComplete', () => {
  it('increments stepsTaken', () => {
    GameState.stats.stepsTaken = 5
    onStepComplete()
    expect(GameState.stats.stepsTaken).toBe(6)
  })
})

// ── shouldTriggerEncounter ───────────────────────────────────────────────────

describe('shouldTriggerEncounter', () => {
  it('returns false when within cooldown period', () => {
    expect(shouldTriggerEncounter(ENCOUNTER_COOLDOWN_STEPS - 1, false)).toBe(false)
  })

  it('returns a boolean when past cooldown', () => {
    GameState.stats.stepsTaken = 42
    const result = shouldTriggerEncounter(ENCOUNTER_COOLDOWN_STEPS, false)
    expect(typeof result).toBe('boolean')
  })

  it('is deterministic for same step count', () => {
    GameState.stats.stepsTaken = 100
    const r1 = shouldTriggerEncounter(ENCOUNTER_COOLDOWN_STEPS, false)
    const r2 = shouldTriggerEncounter(ENCOUNTER_COOLDOWN_STEPS, false)
    expect(r1).toBe(r2)
  })
})

// ── checkTransition ──────────────────────────────────────────────────────────

describe('checkTransition', () => {
  const TILE_SIZE = 48

  it('returns null when no objects', () => {
    expect(checkTransition(5, 10, TILE_SIZE, null)).toBeNull()
  })

  it('returns null when no transition at position', () => {
    const objects = [{ type: 'transition', x: 0, y: 0, width: 48, height: 48, properties: [] }]
    expect(checkTransition(10, 10, TILE_SIZE, objects)).toBeNull()
  })

  it('returns transition result when player on transition tile', () => {
    const objects = [{
      type: 'transition',
      x: 5 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE,
      properties: [
        { name: 'targetRegion', value: 'staging_plains' },
        { name: 'targetSpawnX', value: 2 },
        { name: 'targetSpawnY', value: 3 },
      ],
    }]
    const result = checkTransition(5, 10, TILE_SIZE, objects)
    expect(result).toEqual({
      type: 'transition',
      targetRegion: 'staging_plains',
      spawnX: 2,
      spawnY: 3,
    })
  })

  it('returns blocked when requiredItem is missing', () => {
    const objects = [{
      type: 'transition',
      x: 5 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE,
      properties: [
        { name: 'requiredItem', value: 'pipeline_pass_badge' },
        { name: 'targetRegion', value: 'staging_plains' },
      ],
    }]
    const result = checkTransition(5, 10, TILE_SIZE, objects)
    expect(result.type).toBe('blocked')
    expect(result.message).toContain('403 Forbidden')
  })

  it('returns blocked when requiredFlag is missing', () => {
    const objects = [{
      type: 'transition',
      x: 5 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE,
      properties: [
        { name: 'requiredFlag', value: 'some_flag' },
        { name: 'targetRegion', value: 'staging_plains' },
      ],
    }]
    const result = checkTransition(5, 10, TILE_SIZE, objects)
    expect(result.type).toBe('blocked')
  })

  it('skips non-transition objects', () => {
    const objects = [{
      type: 'spawn',
      x: 5 * TILE_SIZE, y: 10 * TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE,
    }]
    expect(checkTransition(5, 10, TILE_SIZE, objects)).toBeNull()
  })
})

// ── applyTransition ──────────────────────────────────────────────────────────

describe('applyTransition', () => {
  it('updates GameState with target region and spawn position', () => {
    applyTransition('staging_plains', 2, 3)
    expect(GameState.player.tileX).toBe(2)
    expect(GameState.player.tileY).toBe(3)
    expect(GameState.player.location).toBe('staging_plains')
  })

  it('marks state as dirty', () => {
    GameState._session.isDirty = false
    applyTransition('staging_plains', 2, 3)
    expect(GameState._session.isDirty).toBe(true)
  })
})
