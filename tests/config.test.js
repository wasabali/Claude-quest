import { describe, it, expect } from 'vitest'
import {
  CONFIG,
  COLORS,
  DIALOG,
  DOMAIN_MATCHUPS,
  ENCOUNTER_BASE_CHANCE,
  ENCOUNTER_COOLDOWN_STEPS,
  ENCOUNTER_RUN_MULTIPLIER,
  MOVEMENT,
  STRONG_MULTIPLIER,
  TITLE_SCREEN,
  WEAK_MULTIPLIER,
  WORLD_SCENE,
  XP_TABLE,
  BATTLE_BACKGROUNDS,
} from '../src/config.js'

describe('CONFIG', () => {
  it('has 1920×1080 resolution', () => {
    expect(CONFIG.WIDTH).toBe(1920)
    expect(CONFIG.HEIGHT).toBe(1080)
  })

  it('has 48px tile size', () => {
    expect(CONFIG.TILE_SIZE).toBe(48)
  })

  it('limits active skills to 6', () => {
    expect(CONFIG.MAX_ACTIVE_SKILLS).toBe(6)
  })
})

describe('DOMAIN_MATCHUPS', () => {
  const CYCLE = ['linux', 'security', 'serverless', 'cloud', 'iac', 'containers', 'kubernetes']

  it('defines all 7 combat domains', () => {
    CYCLE.forEach(domain => expect(DOMAIN_MATCHUPS).toHaveProperty(domain))
  })

  it('defines observability as a support domain', () => {
    expect(DOMAIN_MATCHUPS).toHaveProperty('observability')
    expect(DOMAIN_MATCHUPS.observability.strong).toBeNull()
    expect(DOMAIN_MATCHUPS.observability.weak).toBeNull()
  })

  it('each domain is strong against the next in the cycle', () => {
    for (let i = 0; i < CYCLE.length; i++) {
      const domain = CYCLE[i]
      const next   = CYCLE[(i + 1) % CYCLE.length]
      expect(DOMAIN_MATCHUPS[domain].strong).toBe(next)
    }
  })

  it('each domain is weak against the previous in the cycle', () => {
    for (let i = 0; i < CYCLE.length; i++) {
      const domain = CYCLE[i]
      const prev   = CYCLE[(i - 1 + CYCLE.length) % CYCLE.length]
      expect(DOMAIN_MATCHUPS[domain].weak).toBe(prev)
    }
  })

  it('strong and weak are never the same domain', () => {
    CYCLE.forEach(domain => {
      expect(DOMAIN_MATCHUPS[domain].strong).not.toBe(DOMAIN_MATCHUPS[domain].weak)
    })
  })
})

describe('Damage multipliers', () => {
  it('STRONG_MULTIPLIER is 2.0', () => {
    expect(STRONG_MULTIPLIER).toBe(2.0)
  })

  it('WEAK_MULTIPLIER is 0.5', () => {
    expect(WEAK_MULTIPLIER).toBe(0.5)
  })

  it('strong × weak === 1 (symmetric)', () => {
    expect(STRONG_MULTIPLIER * WEAK_MULTIPLIER).toBe(1.0)
  })
})

describe('scene presentation constants', () => {
  it('defines core title screen copy and menu options', () => {
    expect(TITLE_SCREEN.MENU_ITEMS).toEqual(['NEW GAME', 'LOAD SAVE'])
    expect(TITLE_SCREEN.BLINK_INTERVAL_MS).toBe(500)
  })

  it('defines world scene placeholder message', () => {
    expect(WORLD_SCENE.MESSAGE).toBe('WORLD SCENE STUB')
  })

  it('defines title scene colors', () => {
    expect(COLORS.BACKGROUND).toBe('#0b1020')
    expect(COLORS.MENU_ARROW).toBe('#ffe066')
  })
})

describe('DIALOG', () => {
  it('has 40 chars/sec typewriter speed', () => {
    expect(DIALOG.CHARS_PER_SEC).toBe(40)
  })

  it('has 18 chars per line', () => {
    expect(DIALOG.LINE_WIDTH_CHARS).toBe(18)
  })

  it('has 2 lines per page', () => {
    expect(DIALOG.MAX_LINES).toBe(2)
  })

  it('has 500ms blink interval', () => {
    expect(DIALOG.BLINK_INTERVAL_MS).toBe(500)
  })

  it('allows up to 4 choice options', () => {
    expect(DIALOG.CHOICE_MAX_OPTIONS).toBe(4)
  })
})

describe('XP_TABLE', () => {
  it('starts at 0 XP for level 1', () => {
    expect(XP_TABLE[0]).toBe(0)
  })

  it('is strictly increasing', () => {
    for (let i = 1; i < XP_TABLE.length; i++) {
      expect(XP_TABLE[i]).toBeGreaterThan(XP_TABLE[i - 1])
    }
  })

  it('defines at least 20 levels', () => {
    expect(XP_TABLE.length).toBeGreaterThanOrEqual(20)
  })
})

describe('MOVEMENT', () => {
  it('defines walk step duration of 500ms', () => {
    expect(MOVEMENT.STEP_DURATION_MS).toBe(500)
  })

  it('defines run step duration of 250ms (2x walk speed)', () => {
    expect(MOVEMENT.RUN_STEP_DURATION_MS).toBe(250)
  })

  it('defines input buffer window of 150ms', () => {
    expect(MOVEMENT.INPUT_BUFFER_WINDOW_MS).toBe(150)
  })

  it('defines bump animation duration of 100ms', () => {
    expect(MOVEMENT.BUMP_DURATION_MS).toBe(100)
  })

  it('defines bump distance of 2px', () => {
    expect(MOVEMENT.BUMP_DISTANCE_PX).toBe(2)
  })
})

describe('Encounter constants', () => {
  it('defines base encounter chance of 8%', () => {
    expect(ENCOUNTER_BASE_CHANCE).toBe(0.08)
  })

  it('defines run multiplier of 1.5', () => {
    expect(ENCOUNTER_RUN_MULTIPLIER).toBe(1.5)
  })

  it('defines cooldown of 4 steps between encounters', () => {
    expect(ENCOUNTER_COOLDOWN_STEPS).toBe(4)
  })
})

describe('BATTLE_BACKGROUNDS', () => {
  const REGIONS = [
    'localhost_town', 'pipeline_pass', 'jira_dungeon',
    'production_plains', 'kubernetes_colosseum', 'three_am_tavern',
    'server_graveyard', 'node_modules_maze', 'dev_null_void',
    'deprecated_azure_region',
  ]

  it('maps all regions to an arena', () => {
    REGIONS.forEach(region => {
      expect(BATTLE_BACKGROUNDS).toHaveProperty(region)
      expect(BATTLE_BACKGROUNDS[region].arena).toBeTruthy()
    })
  })

  it('maps specific regions per design spec', () => {
    expect(BATTLE_BACKGROUNDS.localhost_town.arena).toBe('plains')
    expect(BATTLE_BACKGROUNDS.pipeline_pass.arena).toBe('construction')
    expect(BATTLE_BACKGROUNDS.jira_dungeon.arena).toBe('cave')
    expect(BATTLE_BACKGROUNDS.production_plains.arena).toBe('factory')
    expect(BATTLE_BACKGROUNDS.kubernetes_colosseum.arena).toBe('stadium')
    expect(BATTLE_BACKGROUNDS.three_am_tavern.arena).toBe('abyss')
  })
})
