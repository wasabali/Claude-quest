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

// Reputation thresholds — sorted highest first for threshold lookups.
// Range is -100 to 100. Starts at 50. Fully rebuildable.
// Use getReputationStatus() in SkillEngine to resolve the current label.
export const REPUTATION_THRESHOLDS = [
  { min:  90,  status: 'Distinguished Engineer',      shopMod: -0.20 },
  { min:  80,  status: 'Distinguished Engineer',      shopMod: -0.10 },
  { min:  60,  status: 'Competent Engineer',          shopMod:  0    },
  { min:  40,  status: 'Adequate Engineer',           shopMod:  0    },
  { min:  20,  status: 'Liability',                   shopMod:  0    },
  { min:   0,  status: 'Walking Incident',            shopMod:  0.50 },
  { min: -25,  status: 'Known Incident',              shopMod:  0.50 },
  { min: -50,  status: 'Do Not Pair With',            shopMod:  0.50 },
  { min: -100, status: 'The Reason We Have Runbooks', shopMod:  0.50 },
]

export const REPUTATION_MIN = -100
export const REPUTATION_MAX =  100

// Shame thresholds — sorted highest first.
// Each entry is the lowest shame value that activates the row.
// title: null means no new title is gained at that threshold.
export const SHAME_THRESHOLDS = [
  { shame: 15, title: null,                 flag: 'secret_ending_accessible'                  },
  { shame: 10, title: 'Shadow Engineer',    flag: 'shadow_engineer_title_unlocked'            },
  { shame:  7, title: null,                 flag: 'throttlemaster_contact'                    },
  { shame:  5, title: 'Person of Interest', flag: 'cursed_network_full_three_am_active'       },
  { shame:  3, title: null,                 flag: 'npc_oneliners_active'                      },
  { shame:  1, title: null,                 flag: 'pedersen_sighs_cursed_location_visible'    },
]

// How much grime each shame point adds to all earned emblems.
export const GRIME_PER_SHAME = 0.05

// Valid skill tiers — single source of truth for validation and data authoring.
export const SKILL_TIERS = Object.freeze(['optimal', 'standard', 'shortcut', 'cursed', 'nuclear'])

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

// Economy constants — budget is Azure Credits, the single currency.
export const ECONOMY = {
  STARTING_BUDGET:      500,
  BUDGET_PER_LEVEL:     25,
  WIN_RESTORE_PERCENT:  0.15,
  LOSE_RESTORE_PERCENT: 0.05,
  OPTIMAL_WIN_BONUS:    25,
  QUEST_MAIN_RESTORE:   1.0,
  QUEST_SIDE_RESTORE:   0.35,
}

// Budget debt thresholds — pushing budget negative accumulates penalties.
export const BUDGET_DEBT = {
  DEBT_LIMIT:              -300,
  COST_ALERT_THRESHOLD:    -100,
  PAYMENT_QUEST_THRESHOLD: -200,
  DEBT_PER_BATTLE_MOD:     0.1,
  SUSPENSION_THRESHOLD:    -300,
  SUSPENSION_ENCOUNTER:    'azure_subscription_suspended',
}

// Battle reward credits by outcome and solution quality tier.
export const BATTLE_REWARDS = {
  incident: {
    optimal:  40,
    standard: 25,
    shortcut: 15,
    cursed:    5,
    nuclear:   0,
  },
  trainer: {
    win:  30,
    lose:  0,
  },
}
