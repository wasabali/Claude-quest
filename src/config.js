export const CONFIG = {
  WIDTH:             1920,
  HEIGHT:            1080,
  TILE_SIZE:         48,
  FONT:              '"Press Start 2P"',
  MAX_ACTIVE_SKILLS: 6,
}

export const DOMAIN_MATCHUPS = {
  linux:         { strong: 'security',   weak: 'kubernetes'  },
  security:      { strong: 'serverless', weak: 'linux'       },
  serverless:    { strong: 'cloud',      weak: 'security'    },
  cloud:         { strong: 'iac',        weak: 'serverless'  },
  iac:           { strong: 'containers', weak: 'cloud'       },
  containers:    { strong: 'kubernetes', weak: 'iac'         },
  kubernetes:    { strong: 'linux',      weak: 'containers'  },
  observability: { strong: null,         weak: null          },
}

export const STRONG_MULTIPLIER = 2.0
export const WEAK_MULTIPLIER   = 0.5

export const COLORS = {
  BACKGROUND: '#0b1020',
  TITLE:      '#f8f8f8',
  SUBTITLE:   '#9bc5ff',
  PROMPT:     '#f8f8f8',
  MENU_TEXT:  '#f8f8f8',
  MENU_ARROW: '#ffe066',
}

export const TITLE_SCREEN = {
  TITLE_Y:            300,
  SUBTITLE_Y:         410,
  PROMPT_Y:           560,
  MENU_START_Y:       700,
  MENU_LINE_HEIGHT:   86,
  ARROW_X_OFFSET:     320,
  BLINK_INTERVAL_MS:  500,
  TITLE_FONT_SIZE:    '108px',
  SUBTITLE_FONT_SIZE: '36px',
  PROMPT_FONT_SIZE:   '30px',
  MENU_FONT_SIZE:     '46px',
  MENU_ITEMS:         ['NEW GAME', 'LOAD SAVE'],
  CENTER_DIVISOR:     2,
  ORIGIN_CENTER:      0.5,
  MENU_UP_DELTA:      -1,
  MENU_DOWN_DELTA:    1,
  DEFAULT_SELECTION:  0,
}

export const WORLD_SCENE = {
  MESSAGE:           'WORLD SCENE STUB',
  MESSAGE_FONT_SIZE: '54px',
  CENTER_DIVISOR:    2,
  ORIGIN_CENTER:     0.5,
}

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
