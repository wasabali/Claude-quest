import { beforeEach, describe, expect, it } from 'vitest'
import { GameState, initNewGame, STARTING_ACTIVE_SKILLS } from '../src/state/GameState.js'

function contaminateGameState() {
  GameState.player = {
    ...GameState.player,
    name: 'DIRTY',
    mascot: 'OLD',
    level: 99,
    xp: 123456,
    hp: 1,
    maxHp: 1,
    budget: 1,
    reputation: 1,
    shamePoints: 99,
    technicalDebt: 9,
    title: 'Principal',
    location: 'legacy_zone',
    activeSlots: 9,
    playtime: 9999,
  }
  GameState.skills = {
    active: ['legacy_active'],
    learned: ['legacy_learned'],
    cursed: ['legacy_cursed'],
  }
  GameState.inventory = {
    tools: ['tool'],
    keyItems: ['key'],
    credentials: ['cred'],
    docs: ['doc'],
    junk: ['junk'],
  }
  GameState.emblems = { old: { earned: true, shine: 100 } }
  GameState.story = { act: 9, completedQuests: ['q'], flags: { legacy: true } }
  GameState.stats = {
    battlesWon: 9,
    battlesLost: 9,
    incidentsResolved: 9,
    slaBreaches: 9,
    cursedTechniquesUsed: 9,
    nuclearTechniquesUsed: 9,
    optimalSolutions: 9,
  }
  GameState._session = { isDirty: false, lastSavedAt: 'legacy' }
}

describe('initNewGame', () => {
  beforeEach(() => {
    contaminateGameState()
  })

  it('sets required starting player fields', () => {
    initNewGame('ENGINEER', 'DOCKERTLE')

    expect(GameState.player).toMatchObject({
      name: 'ENGINEER',
      mascot: 'DOCKERTLE',
      level: 1,
      xp: 0,
      hp: 100,
      maxHp: 100,
      budget: 500,
      reputation: 50,
      shamePoints: 0,
      technicalDebt: 0,
      title: 'Intern',
      location: 'localhost_town',
      activeSlots: 4,
    })
  })

  it('sets the exact starting active and learned skills and marks session dirty', () => {
    initNewGame('ENGINEER', 'VMSAUR')

    expect(GameState.skills.active).toEqual(STARTING_ACTIVE_SKILLS)
    expect(GameState.skills.learned).toEqual(STARTING_ACTIVE_SKILLS)
    expect(GameState.skills.cursed).toEqual([])
    expect(GameState._session.isDirty).toBe(true)
    expect(GameState._session.lastSavedAt).toBe(null)
  })

  it('resets non-player sections from any previous save state', () => {
    initNewGame('ENGINEER', 'FUNCTIONCHU')

    expect(GameState.inventory).toEqual({
      tools: [],
      keyItems: [],
      credentials: [],
      docs: [],
      junk: [],
    })
    expect(GameState.emblems).toEqual({
      tux:       { earned: false, shine: 0, grime: 0 },
      pipeline:  { earned: false, shine: 0, grime: 0 },
      container: { earned: false, shine: 0, grime: 0 },
      cloud:     { earned: false, shine: 0, grime: 0 },
      vault:     { earned: false, shine: 0, grime: 0 },
      helm:      { earned: false, shine: 0, grime: 0 },
      finops:    { earned: false, shine: 0, grime: 0 },
      sre:       { earned: false, shine: 0, grime: 0 },
    })
    expect(GameState.story).toEqual({
      act: 1,
      completedQuests: [],
      flags: {},
    })
    expect(GameState.stats).toEqual({
      battlesWon: 0,
      battlesLost: 0,
      incidentsResolved: 0,
      slaBreaches: 0,
      cursedTechniquesUsed: 0,
      nuclearTechniquesUsed: 0,
      optimalSolutions: 0,
      skillUseCounts: {},
    })
  })
})
