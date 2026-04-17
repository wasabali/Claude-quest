// RegionEngine.js — region navigation, fast travel, and dungeon gate logic.
// Pure logic only — no Phaser imports. Fully unit-testable with plain Node.js.

import { getById, REGION_CONNECTIONS } from '#data/regions.js'

// ===========================================================================
// Region connections
// ===========================================================================

/**
 * Returns the connections object for a region from REGION_CONNECTIONS.
 * @param {string} regionId — region identifier
 * @returns {Object|null} connections map keyed by direction, or null
 */
export function getConnections(regionId) {
  return REGION_CONNECTIONS[regionId] ?? null
}

// ===========================================================================
// Travel gate checks
// ===========================================================================

/** @type {{ allowed: false, reason: null, target: null, entry: null }} */
const NO_CONNECTION = Object.freeze({ allowed: false, reason: null, target: null, entry: null })

/**
 * Checks whether the player can travel in a direction from a region.
 * @param {string} regionId — current region
 * @param {string} direction — cardinal direction (north/south/east/west)
 * @param {Object} gameState — full game state with story.act and story.flags
 * @returns {{ allowed: boolean, reason: string|null, target: string|null, entry: string|null }}
 */
export function canTravel(regionId, direction, gameState) {
  const conns = REGION_CONNECTIONS[regionId]
  if (!conns) return { ...NO_CONNECTION }

  const conn = conns[direction]
  if (!conn) return { ...NO_CONNECTION }

  const { target, entry, requires } = conn

  if (requires) {
    if (requires.act != null && gameState.story.act < requires.act) {
      return {
        allowed: false,
        reason: 'The path ahead is under construction. Come back in the next sprint.',
        target,
        entry,
      }
    }

    if (requires.dungeonPoints != null) {
      const pts = gameState.story.flags.jira_dungeon_story_points ?? 0
      if (pts < requires.dungeonPoints) {
        return {
          allowed: false,
          reason: `You need ${requires.dungeonPoints} story points to open this door.`,
          target,
          entry,
        }
      }
    }

    if (requires.resourceLocks != null) {
      const locks = gameState.story.flags.cloud_console_locks_opened ?? 0
      if (locks < requires.resourceLocks) {
        return {
          allowed: false,
          reason: `Unlock all ${requires.resourceLocks} resource terminals to proceed.`,
          target,
          entry,
        }
      }
    }
  }

  return { allowed: true, reason: null, target, entry }
}

// ===========================================================================
// Fast travel
// ===========================================================================

/**
 * Returns an array of region IDs where the player has discovered a fast travel terminal.
 * Only includes regions that actually have hasFastTravel: true.
 * @param {Object} storyFlags — gameState.story.flags
 * @returns {string[]}
 */
export function getDiscoveredTerminals(storyFlags) {
  return Object.keys(storyFlags)
    .filter(f => f.startsWith('terminal_unlocked_'))
    .map(f => f.replace('terminal_unlocked_', ''))
    .filter(regionId => {
      const region = getById(regionId)
      return region != null && region.hasFastTravel === true
    })
}

/**
 * Checks if the player can fast travel to a specific region.
 * @param {string} toRegionId — target region
 * @param {Object} storyFlags — gameState.story.flags
 * @returns {boolean}
 */
export function canFastTravel(toRegionId, storyFlags) {
  const region = getById(toRegionId)
  if (!region) return false
  if (!region.hasFastTravel) return false
  return storyFlags['terminal_unlocked_' + toRegionId] === true
}

// ===========================================================================
// Jira dungeon points
// ===========================================================================

/**
 * Returns the current dungeon story points from storyFlags.
 * @param {Object} storyFlags
 * @returns {number}
 */
export function getDungeonPoints(storyFlags) {
  return storyFlags.jira_dungeon_story_points ?? 0
}

/**
 * Adds dungeon story points and returns the new total.
 * @param {Object} storyFlags — mutated in place
 * @param {number} amount — points to add
 * @returns {number} new total
 */
export function addDungeonPoints(storyFlags, amount) {
  storyFlags.jira_dungeon_story_points = getDungeonPoints(storyFlags) + amount
  return storyFlags.jira_dungeon_story_points
}

/**
 * Returns true if the player has enough story points to open the Jira dungeon door.
 * @param {Object} storyFlags
 * @returns {boolean}
 */
export function canOpenJiraDoor(storyFlags) {
  return getDungeonPoints(storyFlags) >= 13
}

// ===========================================================================
// Cloud console resource locks
// ===========================================================================

/**
 * Returns the current resource lock count from storyFlags.
 * @param {Object} storyFlags
 * @returns {number}
 */
export function getResourceLocks(storyFlags) {
  return storyFlags.cloud_console_locks_opened ?? 0
}

/**
 * Increments the resource lock count and returns the new total.
 * @param {Object} storyFlags — mutated in place
 * @returns {number} new total
 */
export function addResourceLock(storyFlags) {
  storyFlags.cloud_console_locks_opened = getResourceLocks(storyFlags) + 1
  return storyFlags.cloud_console_locks_opened
}

/**
 * Returns true if the player has opened enough resource locks.
 * @param {Object} storyFlags
 * @returns {boolean}
 */
export function canOpenCloudConsoleDoor(storyFlags) {
  return getResourceLocks(storyFlags) >= 3
}

// ===========================================================================
// Endgame & region metadata
// ===========================================================================

/**
 * Returns the encounter difficulty modifier for the current act.
 * Act 4 (endgame) returns a +2 difficulty offset.
 * @param {number} act — current game act
 * @returns {number}
 */
export function getEndgameModifier(act) {
  return act >= 4 ? 2 : 0
}

/**
 * Returns true if the region is flagged as an MVP (Act 1 core path) region.
 * @param {string} regionId
 * @returns {boolean}
 */
export function isMvpRegion(regionId) {
  const region = getById(regionId)
  return region != null && region.mvp === true
}
