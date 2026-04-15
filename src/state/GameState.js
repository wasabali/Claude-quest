import { Overrides } from '../overrides.js'

// The single mutable state object for the entire game.
// Engines and scenes read/write this directly. Nothing else is mutable.
// _session is never written to the save file.
export const GameState = {
  player: {
    name:          'Player',
    level:         1,
    xp:            0,
    hp:            100,
    maxHp:         100,
    budget:        1000,
    reputation:    50,    // 0–100, rebuildable
    shamePoints:   0,     // 0+, permanent, never decremented
    technicalDebt: 0,     // 0–10 stacks; each stack reduces maxHp by 2
    location:      'localhost_town',
    playtime:      0,     // seconds elapsed
  },
  skills: {
    active:  [],  // up to 4 skill IDs equipped for battle
    learned: [],  // all skill IDs the player has learned
    cursed:  [],  // cursed/nuclear skill IDs (shown separately in UI)
  },
  inventory: {
    tools:       [],
    keyItems:    [],
    credentials: [],
    docs:        [],
    junk:        [],
  },
  emblems: {
    // Populated as the player earns them.
    // Shape per emblem: { earned: true, shine: 0–100 }
    // shine is a percentage: 0 = tarnished, 100 = fully polished
  },
  story: {
    act:             1,
    completedQuests: [],
    flags:           {},
  },
  stats: {
    battlesWon:            0,
    battlesLost:           0,
    incidentsResolved:     0,
    slaBreaches:           0,
    cursedTechniquesUsed:  0,
    nuclearTechniquesUsed: 0,
    optimalSolutions:      0,
  },
  _session: {
    isDirty:     false,  // true when there are unsaved changes
    lastSavedAt: null,   // ISO timestamp of last save
  },
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
