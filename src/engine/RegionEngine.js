// RegionEngine.js — region navigation, fast travel, and dungeon gate logic.
// Pure logic only — no Phaser imports. Fully unit-testable with plain Node.js.

import { getById, REGION_CONNECTIONS } from '#data/regions.js'

// ===========================================================================
// Denial reason IDs — returned by canTravel so the scene layer can resolve
// display text via the story registry. Keeps messaging out of the engine.
// ===========================================================================

export const DENIAL_REASONS = Object.freeze({
  ACT_GATE:           'act_gate',
  DUNGEON_POINTS:     'dungeon_points',
  RESOURCE_LOCKS:     'resource_locks',
})

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

/** @type {{ allowed: false, reasonId: null, reasonParams: null, target: null, entry: null }} */
const NO_CONNECTION = Object.freeze({ allowed: false, reasonId: null, reasonParams: null, target: null, entry: null })

/**
 * Checks whether the player can travel in a direction from a region.
 * Returns a reasonId (not display text) when travel is blocked — the scene
 * layer resolves the final message via the story registry.
 *
 * @param {string} regionId — current region
 * @param {string} direction — cardinal direction (north/south/east/west)
 * @param {Object} gameState — full game state with story.act and story.flags
 * @returns {{ allowed: boolean, reasonId: string|null, reasonParams: Object|null, target: string|null, entry: string|null }}
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
        reasonId: DENIAL_REASONS.ACT_GATE,
        reasonParams: { requiredAct: requires.act },
        target,
        entry,
      }
    }

    if (requires.dungeonPoints != null) {
      const pts = gameState.story.flags.jira_dungeon_story_points ?? 0
      if (pts < requires.dungeonPoints) {
        return {
          allowed: false,
          reasonId: DENIAL_REASONS.DUNGEON_POINTS,
          reasonParams: { required: requires.dungeonPoints, current: pts },
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
          reasonId: DENIAL_REASONS.RESOURCE_LOCKS,
          reasonParams: { required: requires.resourceLocks, current: locks },
          target,
          entry,
        }
      }
    }
  }

  return { allowed: true, reasonId: null, reasonParams: null, target, entry }
}

/**
 * Builds a stable token for a denied travel attempt.
 * Identical denied attempts produce the same token, allowing scenes to suppress
 * repeated denial dialogs while the player remains at the same blocked edge.
 *
 * @param {string} regionId
 * @param {string} direction
 * @param {{ allowed: boolean, reasonId: string|null, target: string|null }} travelResult
 * @returns {string|null}
 */
export function getTravelDenialToken(regionId, direction, travelResult) {
  if (!travelResult || travelResult.allowed || !travelResult.reasonId || !travelResult.target) {
    return null
  }
  return `${regionId}:${direction}:${travelResult.reasonId}:${travelResult.target}`
}

/**
 * Determines whether a denial dialog should be shown for the current attempt.
 * Returns the derived token so callers can persist it for subsequent checks.
 *
 * @param {string|null} previousToken
 * @param {string} regionId
 * @param {string} direction
 * @param {{ allowed: boolean, reasonId: string|null, target: string|null }} travelResult
 * @returns {{ shouldShow: boolean, token: string|null }}
 */
export function shouldShowTravelDenial(previousToken, regionId, direction, travelResult) {
  const token = getTravelDenialToken(regionId, direction, travelResult)
  return { shouldShow: token != null && token !== previousToken, token }
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

// Derive the required story-point threshold from the connection graph so the
// helper always matches the travel gate (single source of truth).
const JIRA_DOOR_THRESHOLD = (() => {
  const conn = REGION_CONNECTIONS.jira_dungeon_1?.north
  return conn?.requires?.dungeonPoints ?? 13
})()

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
 * Threshold is derived from REGION_CONNECTIONS to stay consistent with canTravel.
 * @param {Object} storyFlags
 * @returns {boolean}
 */
export function canOpenJiraDoor(storyFlags) {
  return getDungeonPoints(storyFlags) >= JIRA_DOOR_THRESHOLD
}

// ===========================================================================
// Cloud console resource locks
// ===========================================================================

// Derive the required resource-lock threshold from the connection graph.
const RESOURCE_LOCK_THRESHOLD = (() => {
  const conn = REGION_CONNECTIONS.cloud_console_1?.north
  return conn?.requires?.resourceLocks ?? 3
})()

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
 * Threshold is derived from REGION_CONNECTIONS to stay consistent with canTravel.
 * @param {Object} storyFlags
 * @returns {boolean}
 */
export function canOpenCloudConsoleDoor(storyFlags) {
  return getResourceLocks(storyFlags) >= RESOURCE_LOCK_THRESHOLD
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
