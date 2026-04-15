// Display and rendering constants
export const CONFIG = {
  WIDTH:     160,
  HEIGHT:    144,
  SCALE:     4,
  TILE_SIZE: 16,
  FONT:      '"Press Start 2P"',
}

// Domain matchup cycle: linux → security → serverless → cloud → iac → containers → kubernetes → linux
// Each domain deals ×2 to the domain it beats, ×0.5 to the domain that beats it.
export const DOMAIN_MATCHUPS = {
  linux:        { strong: 'security',   weak: 'kubernetes'  },
  security:     { strong: 'serverless', weak: 'linux'       },
  serverless:   { strong: 'cloud',      weak: 'security'    },
  cloud:        { strong: 'iac',        weak: 'serverless'  },
  iac:          { strong: 'containers', weak: 'cloud'       },
  containers:   { strong: 'kubernetes', weak: 'iac'         },
  kubernetes:   { strong: 'linux',      weak: 'containers'  },
  observability: { strong: null,        weak: null          }, // support domain — no damage
}

export const STRONG_MULTIPLIER = 2.0
export const WEAK_MULTIPLIER   = 0.5

// Status effects applied during battle
export const STATUSES = {
  throttled:      { desc: 'Only 1 skill every 2 turns',          duration: 3         },
  cold_start:     { desc: 'Skip first turn of battle',           duration: 1         },
  deprecated:     { desc: 'Skills 50% effectiveness',            duration: 4         },
  on_call:        { desc: 'Random encounters after each battle', duration: 5         },
  cost_alert:     { desc: 'Budget drains 2× faster',             duration: 3         },
  technical_debt: { desc: 'Max HP reduced by 2 per stack',       duration: -1        }, // permanent
  in_review:      { desc: 'Cannot act for 1–3 turns',            duration: 'random'  },
}

// Cumulative XP required to reach each level (1-indexed; level 1 starts at 0 XP)
export const XP_TABLE = [
     0,  100,  250,  450,  700, 1000,  // levels 1–6
  1350, 1750, 2200, 2700, 3250,        // levels 7–11
  3850, 4500, 5200, 5950, 6750,        // levels 12–16
  7600, 8500, 9450, 10450,             // levels 17–20
]
