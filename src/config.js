export const CONFIG = {
  WIDTH:             1920,
  HEIGHT:            1080,
  TILE_SIZE:         48,
  PORTRAIT_SIZE:     48,   // battle portrait px — Ninja Adventure 16px faceset × 3 upscale
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

export const MOVEMENT = {
  STEP_DURATION_MS:         500,
  RUN_STEP_DURATION_MS:     250,
  INPUT_BUFFER_WINDOW_MS:   150,
  BUMP_DURATION_MS:         100,
  BUMP_DISTANCE_PX:         2,
  TRANSITION_STEP_DELAY_MS: 100,
  TRANSITION_FADE_STEPS:    [0.33, 0.66, 1.0],
}

export const ENCOUNTER_BASE_CHANCE    = 0.08
export const ENCOUNTER_RUN_MULTIPLIER = 1.5
export const ENCOUNTER_COOLDOWN_STEPS = 4

// Reputation thresholds — sorted highest first for threshold lookups.
// Range is -100 to 100. Starts at 50. Fully rebuildable.
// Use getReputationStatus() in SkillEngine to resolve the current label.
// shopMod: percentage price modifier applied by shops at this reputation level; added to 1.0 when calculating the final price.
// teachOnAnyWin: if true, trainers teach their signature skill on ANY win (not just optimal).
export const REPUTATION_THRESHOLDS = [
  { min:  90,  status: 'Distinguished Engineer',          shopMod: -0.20, teachOnAnyWin: true  },
  { min:  80,  status: 'Senior Engineer',                 shopMod: -0.10, teachOnAnyWin: true  },
  { min:  60,  status: 'Competent Engineer',              shopMod:  0,    teachOnAnyWin: false },
  { min:  40,  status: 'Adequate Engineer',               shopMod:  0,    teachOnAnyWin: false },
  { min:  20,  status: 'Liability',                       shopMod:  0.20, teachOnAnyWin: false },
  { min:   0,  status: 'Walking Incident',                shopMod:  0.50, teachOnAnyWin: false },
  { min: -25,  status: 'Known Incident',                  shopMod:  0.50, teachOnAnyWin: false },
  { min: -50,  status: 'Do Not Pair With',                shopMod:  0.50, teachOnAnyWin: false },
  { min: -100, status: 'The Reason We Have Runbooks',     shopMod:  0.50, teachOnAnyWin: false },
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
  { shame: 15, title: 'The Other Principal',              flag: 'secret_ending_accessible'                  },
  { shame: 10, title: 'Shadow Engineer',                  flag: 'shadow_engineer_title_unlocked'            },
  { shame:  7, title: 'Person of Interest',               flag: 'throttlemaster_contact'                    },
  { shame:  5, title: 'The Shortcutter',                  flag: 'cursed_network_full_three_am_active'       },
  { shame:  3, title: 'Cowboy Coder',                     flag: 'npc_oneliners_active'                      },
  { shame:  1, title: 'It Was Like That When I Got Here', flag: 'pedersen_sighs_cursed_location_visible'    },
]

// Shop reputation pricing — multiplied against base price.
// Rep ≥ 80: discount; 40–79: base; < 40: surcharge; < 20: refused.
export const SHOP_PRICING = {
  DISCOUNT_THRESHOLD:  80,
  DISCOUNT_MULTIPLIER: 0.85,
  SURCHARGE_THRESHOLD: 40,
  SURCHARGE_MULTIPLIER: 1.15,
  REFUSED_THRESHOLD:   20,
}

// Post-game rematch XP bonus multiplier (applied to base XP).
export const REMATCH_XP_MULTIPLIER = 1.5

// How much grime each shame point adds to all earned emblems.
export const GRIME_PER_SHAME = 0.05

// Gym leader shame reactions.
// wary: leader adds wary pre-battle line. teachRefusal: leader refuses to teach signature skill.
export const GYM_SHAME_THRESHOLDS = {
  wary: 5,
  teachRefusal: 10,
}

// Grime rate doubles at Shame 10+ (Shadow Engineer)
export const GRIME_PER_SHAME_SHADOW = 0.10

// Shadow Engineer passive constants (shame >= 10)
export const SHADOW_ENGINEER = {
  SHAME_THRESHOLD:          10,
  OPTIMAL_BUDGET_SURCHARGE: 10,   // Optimal-tier skills cost +10 budget
  CURSED_BUDGET_DISCOUNT:    5,   // Cursed-tier skills cost -5 budget
  HEAL_REDUCTION:            0.20, // Heal items restore 20% less
  COFFEE_SIP_HEAL:          15,   // ☕ Sip Coffee restores 15 HP
  AUTO_LEARN_SKILL:         'exec_xp_cmdshell', // auto-learned when reaching Shadow Engineer threshold; used by scene layer
}

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
  shadow_fatigue: { desc: 'Shadow Engineer passive — alters costs and healing', duration: -1 }, // permanent
}

// Battle background mapping — maps Cloud Quest regions to PokeRogue arena IDs.
// Each region can specify `a` and `b` layers for parallax.
export const BATTLE_BACKGROUNDS = {
  localhost_town:         { arena: 'plains'       },
  pipeline_pass:          { arena: 'construction' },
  jira_dungeon:           { arena: 'cave'         },
  production_plains:      { arena: 'factory'      },
  kubernetes_colosseum:   { arena: 'stadium'      },
  three_am_tavern:        { arena: 'abyss'        },
  server_graveyard:       { arena: 'ruins'        },
  node_modules_maze:      { arena: 'forest'       },
  dev_null_void:          { arena: 'space'        },
  deprecated_azure_region: { arena: 'wasteland'   },
}

export const DIALOG = {
  CHARS_PER_SEC:      40,
  LINE_WIDTH_CHARS:   18,    // chars per line at 160px with Press Start 2P
  MAX_LINES:          2,     // 2 lines per page
  BLINK_INTERVAL_MS:  500,   // ▼ cursor blink
  CHOICE_MAX_OPTIONS: 4,
}

// Cumulative XP required to reach each level (1-indexed; level 1 starts at 0 XP)
export const XP_TABLE = [
     0,  100,  250,  450,  700, 1000,  // levels 1–6
  1350, 1750, 2200, 2700, 3250,        // levels 7–11
  3850, 4500, 5200, 5950, 6750,        // levels 12–16
  7600, 8500, 9450, 10450,             // levels 17–20
]

// Ending conditions — shame thresholds + required story flags
export const ENDING_CONDITIONS = {
  shadow_post_mortem: { minShame: 10, maxShame: 14, requiredFlag: 'cto_defeated'         },
  fork_the_company:   { minShame: 15, requiredFlag: 'throttlemaster_recruitment_accepted' },
}

// Boss fight: Executive Mode multiplier and HP threshold
export const EXECUTIVE_MODE_THRESHOLD   = 0.25
export const EXECUTIVE_MODE_MULTIPLIER  = 1.5

// Gym mechanic default configs — used by BattleEngine as the fallback gymMechanicConfig
// when createBattleState is called without an explicit mechanicConfig. Gym definitions
// in src/data/gyms.js reference these same values via mechanicConfig on each gym entry.
export const GYM_MECHANICS = {
  legacy_only: {
    blockedActs: [3, 4],
    blockedDomains: ['cloud', 'serverless'],
  },
  sla_timer: {
    slaTimer:       6,
    breachHpPenalty: 30,
    breachRepPenalty: 15,
  },
  flaky_pipeline: {
    failChance:         0.30,
    replayFailChance:   0.40,
  },
  cold_start: {},
  respawn: {
    respawnCount:     3,
    respawnHpPercent: 0.50,
  },
  rbac_deny: {
    denyChance: 0.25,
  },
  cost_spiral: {
    hpPerTurn:        5,
    attackPerTurn:    3,
    spiralThreshold:  8,
  },
  all_domains: {
    switchInterval:          2,
    executiveModeHpPercent:  0.25,
    executiveDamageMultiplier: 1.5,
  },
}

// Post-game gym replay adjustments — reserved for GymReplayEngine (post-game feature).
// When a gym is replayed, apply these modifiers on top of the gym's base mechanicConfig.
export const GYM_REPLAY = {
  leaderLevelBonus: 5,
  xpMultiplier:     0.50,
  slaTimerReduction: 1,
  failChanceIncrease: 0.10,
}

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
