import { describe, it, expect } from 'vitest'
import {
  CONFIG,
  COLORS,
  DOMAIN_MATCHUPS,
  STRONG_MULTIPLIER,
  TITLE_SCREEN,
  WEAK_MULTIPLIER,
  WORLD_SCENE,
  XP_TABLE,
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
