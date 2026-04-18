import { Overrides } from '../overrides.js'
import { checkLevelUp } from '#engine/ProgressionEngine.js'

// Canonical stats schema — used in both the default GameState and initNewGame().
// All fields must be present in both places to avoid undefined reads after save/load.
export const DEFAULT_STATS = {
  battlesWon:            0,
  battlesLost:           0,
  incidentsResolved:     0,
  slaBreaches:           0,
  cursedTechniquesUsed:  0,
  nuclearTechniquesUsed: 0,
  optimalSolutions:      0,
  totalDeployments:      0,
  longestUptime:         0,
  clockManipulated:      false,
  devNullUseCount:       0,
  skillUseCounts:        {},
  stepsTaken:            0,
  gymReplays:            {},
}

// The single mutable state object for the entire game.
// Engines and scenes read/write this directly. Nothing else is mutable.
// _session is never written to the save file.
export const GameState = {
  player: {
    name:          '',
    mascot:        null,
    title:         'Intern',
    level:         1,
    xp:            0,
    hp:            100,
    maxHp:         100,
    budget:        500,
    reputation:    50,    // 0–100, rebuildable
    shamePoints:   0,     // 0+, permanent, never decremented
    technicalDebt: 0,     // 0–10 stacks; each stack reduces maxHp by 2
    title:         'Intern',
    location:      'localhost_town',
    tileX:         5,
    tileY:         10,
    activeSlots:   4,
    playtime:      0,     // seconds elapsed
  },
  skills: {
    active:  [],  // max 6 skill IDs — player's current battle deck
    learned: [],  // all skill IDs the player has learned
    cursed:  [],  // unlocked cursed technique IDs (subset of learned)
  },
  inventory: {
    tools:       [],
    keyItems:    [],
    credentials: [],
    docs:        [],
    junk:        [],
  },
  emblems: {
    tux:        { earned: false, shine: 0, grime: 0 },
    pipeline:   { earned: false, shine: 0, grime: 0 },
    container:  { earned: false, shine: 0, grime: 0 },
    cloud:      { earned: false, shine: 0, grime: 0 },
    vault:      { earned: false, shine: 0, grime: 0 },
    helm:       { earned: false, shine: 0, grime: 0 },
    finops:     { earned: false, shine: 0, grime: 0 },
    sre:        { earned: false, shine: 0, grime: 0 },
    serverless: { earned: false, shine: 0, grime: 0 },
  },
  story: {
    act:             1,
    completedQuests: [],
    flags:           {},
  },
  stats: { ...DEFAULT_STATS },
  _session: {
    isDirty:      false,  // true when there are unsaved changes
    lastSavedAt:  null,   // ISO timestamp of last save
    dialogActive: false,  // true while dialog or choice menu is open
  },
}

export const markDirty = () => {
  GameState._session.isDirty = true
}

// Award XP once per flagKey. Resolves level-up events and mutates GameState.
// Call from scenes instead of inlining progression logic there.
export const grantXpOnce = (flagKey, amount) => {
  if (GameState.story.flags[flagKey]) return
  GameState.story.flags[flagKey] = true
  GameState.player.xp += amount
  const events = checkLevelUp(GameState.player)
  for (const event of events) {
    if (event.type === 'level_up')    GameState.player.level        = event.payload.newLevel
    if (event.type === 'stat_gain') {
      GameState.player.maxHp  = event.payload.maxHp
      GameState.player.budget = event.payload.budget
    }
    if (event.type === 'slot_unlock') GameState.player.activeSlots  = event.payload.activeSlots
  }
  markDirty()
}

export const normalizeInventoryEntry = (entry) => (
  typeof entry === 'string'
    ? { id: entry, qty: 1 }
    : { id: entry.id, qty: entry.qty ?? 1 }
)

const getTabItems = (tab) => GameState.inventory[tab]

export const addItem = (tab, id, qty = 1) => {
  const items = getTabItems(tab)
  const index = items.findIndex((entry) => normalizeInventoryEntry(entry).id === id)

  if (index === -1) {
    items.push({ id, qty })
  } else {
    const existing = normalizeInventoryEntry(items[index])
    items[index] = { id: existing.id, qty: existing.qty + qty }
  }

  markDirty()
}

export const removeItem = (tab, id, qty = 1) => {
  const items = getTabItems(tab)
  const index = items.findIndex((entry) => normalizeInventoryEntry(entry).id === id)
  if (index === -1) return false

  const existing = normalizeInventoryEntry(items[index])
  const nextQty  = existing.qty - qty

  if (nextQty > 0) {
    items[index] = { id: existing.id, qty: nextQty }
  } else {
    items.splice(index, 1)
  }

  markDirty()
  return true
}

export const hasItem = (tab, id) => {
  const items = getTabItems(tab)
  const item = items.find((entry) => normalizeInventoryEntry(entry).id === id)
  if (!item) return false
  return normalizeInventoryEntry(item).qty > 0
}

export const STARTING_ACTIVE_SKILLS = [
  'kubectl_rollout_restart',
  'read_the_docs',
  'blame_dns',
  'az_webapp_deploy',
]

export function initNewGame(name, mascot) {
  GameState.player = {
    name,
    mascot,
    level:         1,
    xp:            0,
    hp:            100,
    maxHp:         100,
    budget:        500,
    reputation:    50,
    shamePoints:   0,
    technicalDebt: 0,
    title:         'Intern',
    location:      'localhost_town',
    tileX:         5,
    tileY:         10,
    activeSlots:   4,
    playtime:      0,
  }
  GameState.skills = {
    active:  [...STARTING_ACTIVE_SKILLS],
    learned: [...STARTING_ACTIVE_SKILLS],
    cursed:  [],
  }
  GameState.inventory = {
    tools:       [],
    keyItems:    [],
    credentials: [],
    docs:        [],
    junk:        [],
  }
  GameState.emblems = {
    tux:        { earned: false, shine: 0, grime: 0 },
    pipeline:   { earned: false, shine: 0, grime: 0 },
    container:  { earned: false, shine: 0, grime: 0 },
    cloud:      { earned: false, shine: 0, grime: 0 },
    vault:      { earned: false, shine: 0, grime: 0 },
    helm:       { earned: false, shine: 0, grime: 0 },
    finops:     { earned: false, shine: 0, grime: 0 },
    sre:        { earned: false, shine: 0, grime: 0 },
    serverless: { earned: false, shine: 0, grime: 0 },
  }
  GameState.story = {
    act:             1,
    completedQuests: [],
    flags:           {},
  }
  GameState.stats = { ...DEFAULT_STATS }
  GameState._session = {
    isDirty:      true,
    lastSavedAt:  null,
    dialogActive: false,
  }
}

// Apply dev overrides at startup (dev mode only)
if (import.meta.env?.DEV) {
  if (Overrides.SHAME_OVERRIDE != null)         GameState.player.shamePoints   = Overrides.SHAME_OVERRIDE
  if (Overrides.REPUTATION_OVERRIDE != null)    GameState.player.reputation    = Overrides.REPUTATION_OVERRIDE
  if (Overrides.TECHNICAL_DEBT_OVERRIDE != null) GameState.player.technicalDebt = Overrides.TECHNICAL_DEBT_OVERRIDE
  if (Overrides.HP_OVERRIDE != null)            GameState.player.hp            = Overrides.HP_OVERRIDE
  if (Overrides.LEVEL_OVERRIDE != null)         GameState.player.level         = Overrides.LEVEL_OVERRIDE
  if (Overrides.LOCATION_OVERRIDE != null)      GameState.player.location      = Overrides.LOCATION_OVERRIDE
  if (Overrides.ACT_OVERRIDE != null)           GameState.story.act            = Overrides.ACT_OVERRIDE
  if (Overrides.FLAGS_OVERRIDE != null)         Object.assign(GameState.story.flags, Overrides.FLAGS_OVERRIDE)
  if (Overrides.STARTER_DECK != null)           GameState.skills.active        = [...Overrides.STARTER_DECK]
  if (Overrides.STARTER_ITEMS != null)          GameState.inventory.tools      = [...Overrides.STARTER_ITEMS]
}
