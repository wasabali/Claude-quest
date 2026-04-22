// MovementEngine.js — Tile-step movement state machine, encounter rolls, and
// transition-tile decision logic. Pure JS — no Phaser imports. Fully unit-testable.
//
// WorldScene delegates all movement/encounter/transition decisions here and
// only applies the resulting position, animation, and scene-change events.

import { MOVEMENT, ENCOUNTER_BASE_CHANCE, ENCOUNTER_RUN_MULTIPLIER, ENCOUNTER_COOLDOWN_STEPS } from '../config.js'
import { GameState, hasItem, markDirty } from '#state/GameState.js'
import { Overrides } from '../overrides.js'
import { getById as getItemById } from '#data/items.js'
import { seedRandom } from '#utils/random.js'

// ── Constants ────────────────────────────────────────────────────────────────

export const DIR_OFFSETS = {
  up:    { dx:  0, dy: -1 },
  down:  { dx:  0, dy:  1 },
  left:  { dx: -1, dy:  0 },
  right: { dx:  1, dy:  0 },
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

// ── Running check ────────────────────────────────────────────────────────────

export function canRun() {
  if (Overrides.RUN_OVERRIDE != null) return Overrides.RUN_OVERRIDE
  return hasItem('keyItems', 'sudo_running_shoes')
}

export function getStepDuration(isRunning) {
  return isRunning ? MOVEMENT.RUN_STEP_DURATION_MS : MOVEMENT.STEP_DURATION_MS
}

// ── Tile walkability ─────────────────────────────────────────────────────────

// Returns true if the tile at (tileX, tileY) is walkable.
// collisionLookup(tileX, tileY) should return { exists, index } or null.
export function isTileWalkable(tileX, tileY, mapWidth, mapHeight, collisionLookup) {
  if (tileX < 0 || tileY < 0) return false
  if (tileX >= mapWidth || tileY >= mapHeight) return false
  const tile = collisionLookup(tileX, tileY)
  if (tile && tile.index !== 0) return false
  return true
}

// Clamp a tile coordinate into the map's interior (excluding the outer border).
export function clampTileToInterior(tileX, tileY, mapWidth, mapHeight) {
  const maxBoundX = Math.max(0, mapWidth - 1)
  const maxBoundY = Math.max(0, mapHeight - 1)
  const minTileX = mapWidth > 2 ? 1 : 0
  const minTileY = mapHeight > 2 ? 1 : 0
  const maxTileX = mapWidth > 2 ? mapWidth - 2 : maxBoundX
  const maxTileY = mapHeight > 2 ? mapHeight - 2 : maxBoundY
  return {
    tileX: Math.min(maxTileX, Math.max(minTileX, tileX)),
    tileY: Math.min(maxTileY, Math.max(minTileY, tileY)),
  }
}

// Perimeter search for nearest walkable tile around origin.
export function findNearestWalkableTile(originX, originY, mapWidth, mapHeight, isWalkable, maxRadius) {
  const searchRadius = maxRadius ?? Math.max(mapWidth, mapHeight)
  if (isWalkable(originX, originY)) return { tileX: originX, tileY: originY }

  for (let radius = 1; radius <= searchRadius; radius++) {
    const minX = originX - radius
    const maxX = originX + radius
    const minY = originY - radius
    const maxY = originY + radius

    for (let x = minX; x <= maxX; x++) {
      if (isWalkable(x, minY)) return { tileX: x, tileY: minY }
      if (isWalkable(x, maxY)) return { tileX: x, tileY: maxY }
    }
    for (let y = minY + 1; y <= maxY - 1; y++) {
      if (isWalkable(minX, y)) return { tileX: minX, tileY: y }
      if (isWalkable(maxX, y)) return { tileX: maxX, tileY: y }
    }
  }
  return null
}

// Persist player tile position and mark state dirty when coordinates changed.
export function persistPlayerTile(tileX, tileY) {
  const changed = GameState.player.tileX !== tileX || GameState.player.tileY !== tileY
  if (changed) {
    GameState.player.tileX = tileX
    GameState.player.tileY = tileY
    markDirty()
  }
  return { tileX, tileY, changed }
}

// Sync persisted tile coordinates from player pixel position.
export function syncPlayerTileFromPixels(playerX, playerY, tileSize, mapWidth, mapHeight) {
  const tileX = Math.min(mapWidth - 1, Math.max(0, Math.floor(playerX / tileSize)))
  const tileY = Math.min(mapHeight - 1, Math.max(0, Math.floor(playerY / tileSize)))
  return persistPlayerTile(tileX, tileY)
}

// ── Movement state machine ───────────────────────────────────────────────────

// Compute interpolated position for a bump animation.
// Returns { x, y, complete }.
export function updateBump(bumpProgress, delta, bumpFromX, bumpFromY, bumpToX, bumpToY) {
  const progress = bumpProgress + delta
  const t = Math.min(progress / MOVEMENT.BUMP_DURATION_MS, 1)
  const bumpT = t < 0.5 ? t * 2 : 2 - t * 2
  const x = Math.round(lerp(bumpFromX, bumpToX, bumpT))
  const y = Math.round(lerp(bumpFromY, bumpToY, bumpT))
  return {
    x,
    y,
    snapX: Math.round(bumpFromX),
    snapY: Math.round(bumpFromY),
    progress,
    complete: t >= 1,
  }
}

// Compute interpolated position for a tile step.
// Returns { x, y, complete, remaining, progress }.
export function updateStep(moveProgress, delta, fromX, fromY, toX, toY, isRunning) {
  const duration = getStepDuration(isRunning)
  const progress = moveProgress + delta
  const t = Math.min(progress / duration, 1)
  const x = Math.round(lerp(fromX, toX, t))
  const y = Math.round(lerp(fromY, toY, t))
  const remaining = duration - progress
  return { x, y, complete: t >= 1, remaining, progress }
}

// Commit a step: updates GameState tile position and marks dirty.
export function commitStep(targetTileX, targetTileY) {
  GameState.player.tileX = targetTileX
  GameState.player.tileY = targetTileY
  markDirty()
}

// Called when a step completes. Increments the persistent step counter.
export function onStepComplete() {
  GameState.stats.stepsTaken++
}

// ── Encounter roll ───────────────────────────────────────────────────────────

// Returns true if an encounter should trigger this step.
export function shouldTriggerEncounter(stepsSinceEncounter, isRunning) {
  if (stepsSinceEncounter < ENCOUNTER_COOLDOWN_STEPS) return false
  const runMultiplier = isRunning ? ENCOUNTER_RUN_MULTIPLIER : 1.0
  const chance = ENCOUNTER_BASE_CHANCE * runMultiplier
  const rng = seedRandom(GameState.stats.stepsTaken * 0x9e3779b9)
  return rng() < chance
}

// ── Transition check ─────────────────────────────────────────────────────────

// Given the player's current tile and a list of transition objects from the
// Tiled object layer, returns a transition result:
//   { type: 'blocked', message } — player lacks required item/flag
//   { type: 'transition', targetRegion, spawnX, spawnY } — proceed with transition
//   null — no transition tile at this position
export function checkTransition(tileX, tileY, tileSize, transitionObjects) {
  if (!transitionObjects) return null

  const px = tileX * tileSize
  const py = tileY * tileSize

  for (const obj of transitionObjects) {
    if (obj.type !== 'transition') continue
    if (px >= obj.x && px < obj.x + obj.width && py >= obj.y && py < obj.y + obj.height) {
      const props = {}
      for (const p of (obj.properties ?? [])) { props[p.name] = p.value }

      if (props.requiredItem && !hasItem('keyItems', props.requiredItem)) {
        const itemDef = getItemById(props.requiredItem)
        const itemName = itemDef?.displayName ?? props.requiredItem
        return {
          type: 'blocked',
          message: `You need ${itemName} to proceed.\nThe path is blocked by a 403 Forbidden.`,
        }
      }
      if (props.requiredFlag && !GameState.story.flags[props.requiredFlag]) {
        return {
          type: 'blocked',
          message: 'The path is blocked by a 403 Forbidden.',
        }
      }

      return {
        type: 'transition',
        targetRegion: props.targetRegion,
        spawnX: props.targetSpawnX,
        spawnY: props.targetSpawnY,
      }
    }
  }
  return null
}

// Apply a transition: writes spawn position and location to GameState.
export function applyTransition(targetRegion, spawnX, spawnY) {
  GameState.player.tileX    = spawnX
  GameState.player.tileY    = spawnY
  GameState.player.location = targetRegion
  markDirty()
}

// ── Input direction resolution ───────────────────────────────────────────────

// Given raw key-down states for up/down/left/right, returns exactly one
// direction string or null. Vertical wins on simultaneous press.
export function resolveDirection(upDown, downDown, leftDown, rightDown) {
  if (upDown)    return 'up'
  if (downDown)  return 'down'
  if (leftDown)  return 'left'
  if (rightDown) return 'right'
  return null
}
