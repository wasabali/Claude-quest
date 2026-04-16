import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

import { DOMAIN_MATCHUPS } from '../src/config.js'
import { getById as getSkillById, getAll as getAllSkills, getBy as getSkillsBy } from '../src/data/skills.js'
import { getById as getItemById, getAll as getAllItems } from '../src/data/items.js'
import { getAll as getAllTrainers } from '../src/data/trainers.js'
import { getAll as getAllEmblems } from '../src/data/emblems.js'
import { getAll as getAllQuests } from '../src/data/quests.js'
import { ENCOUNTER_POOLS, getAll as getAllEncounters } from '../src/data/encounters.js'
import { getById as getGateById, getAll as getAllGates, getBy as getGatesBy } from '../src/data/gates.js'

const VALID_TIERS = ['optimal', 'standard', 'shortcut', 'cursed', 'nuclear']
const VALID_GATE_TYPES = ['hard', 'soft', 'knowledge', 'reputation', 'shame']
const DATA_FILES = [
  'skills.js',
  'items.js',
  'trainers.js',
  'emblems.js',
  'quests.js',
  'encounters.js',
  'gates.js',
].map(file => path.join(process.cwd(), 'src', 'data', file))

describe('skills registry', () => {
  it("getById('kubectl_rollout_restart') returns the correct skill", () => {
    const skill = getSkillById('kubectl_rollout_restart')
    expect(skill).toBeDefined()
    expect(skill.id).toBe('kubectl_rollout_restart')
    expect(skill.domain).toBe('kubernetes')
    expect(skill.tier).toBe('standard')
  })

  it("getBy('domain', 'kubernetes') returns all kubernetes skills", () => {
    const ids = getSkillsBy('domain', 'kubernetes').map(skill => skill.id).sort()
    expect(ids).toEqual([
      'delete_all_pods',
      'helm_install',
      'helm_upgrade',
      'kubectl_apply',
      'kubectl_delete_ns',
      'kubectl_drain',
      'kubectl_exec',
      'kubectl_logs',
      'kubectl_rollout_restart',
      'kubectl_scale',
    ].sort())
  })

  it('all skills use valid domain and tier values', () => {
    const validDomains = Object.keys(DOMAIN_MATCHUPS)
    getAllSkills().forEach(skill => {
      expect(validDomains).toContain(skill.domain)
      expect(VALID_TIERS).toContain(skill.tier)
    })
  })

  it('all cursed skills have sideEffect and warningText', () => {
    getAllSkills()
      .filter(skill => skill.isCursed)
      .forEach(skill => {
        expect(skill.sideEffect).toBeTruthy()
        expect(typeof skill.warningText).toBe('string')
        expect(skill.warningText.length).toBeGreaterThan(0)
      })
  })
})

describe('other data registries', () => {
  it('defines all 10 cursed trainers with isCursed: true', () => {
    const cursedTrainers = getAllTrainers().filter(trainer => trainer.isCursed)
    expect(cursedTrainers).toHaveLength(10)
    cursedTrainers.forEach(trainer => expect(trainer.isCursed).toBe(true))
  })

  it('defines all 8 emblems with grimeDescription and passiveBonus', () => {
    const emblems = getAllEmblems()
    expect(emblems).toHaveLength(8)
    emblems.forEach(emblem => {
      expect(typeof emblem.grimeDescription).toBe('string')
      expect(emblem.grimeDescription.length).toBeGreaterThan(0)
      expect(typeof emblem.passiveBonus).toBe('string')
      expect(emblem.passiveBonus.length).toBeGreaterThan(0)
    })
  })

  it('sets mystery_node_modules canDrop to false', () => {
    expect(getItemById('mystery_node_modules')?.canDrop).toBe(false)
  })

  it('encounter pools use common/rare/cursed array format', () => {
    Object.values(ENCOUNTER_POOLS).forEach(pool => {
      expect(Array.isArray(pool.common)).toBe(true)
      expect(Array.isArray(pool.rare)).toBe(true)
      expect(Array.isArray(pool.cursed)).toBe(true)
    })
  })

  it('has no duplicate IDs across data modules', () => {
    const allIds = [
      ...getAllSkills().map(entry => entry.id),
      ...getAllItems().map(entry => entry.id),
      ...getAllTrainers().map(entry => entry.id),
      ...getAllEmblems().map(entry => entry.id),
      ...getAllQuests().map(entry => entry.id),
      ...getAllEncounters().map(entry => entry.id),
    ]
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

describe('data module import boundaries', () => {
  it('data files do not import phaser, engine, or scenes', () => {
    DATA_FILES.forEach(file => {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toMatch(/from ['"]phaser['"]/)
      expect(content).not.toMatch(/from ['"]#engine\//)
      expect(content).not.toMatch(/from ['"]#scenes\//)
      expect(content).not.toMatch(/from ['"].*\/engine\//)
      expect(content).not.toMatch(/from ['"].*\/scenes\//)
    })
  })
})

describe('gates registry', () => {
  it('follows the registry pattern with getById, getAll, getBy', () => {
    const gate = getGateById('margaret_website_gate')
    expect(gate).toBeDefined()
    expect(gate.id).toBe('margaret_website_gate')

    const allGates = getAllGates()
    expect(allGates.length).toBeGreaterThanOrEqual(1)

    expect(typeof getGatesBy).toBe('function')
    const hardGates = getGatesBy('type', 'hard')
    expect(hardGates.length).toBeGreaterThanOrEqual(1)
    hardGates.forEach(g => expect(g.type).toBe('hard'))
  })

  it('all gates have required fields', () => {
    getAllGates().forEach(gate => {
      expect(typeof gate.id).toBe('string')
      expect(VALID_GATE_TYPES).toContain(gate.type)
      expect(typeof gate.fromRegion).toBe('string')
      expect(typeof gate.toRegion).toBe('string')
      expect(typeof gate.hardBlocks).toBe('boolean')
      expect(typeof gate.hintText).toBe('string')
      expect(gate.hintText.length).toBeGreaterThan(0)
      expect(typeof gate.flag).toBe('string')
      expect(Array.isArray(gate.solutions)).toBe(true)
    })
  })

  it('all gate solutions reference valid skills and tiers', () => {
    getAllGates().forEach(gate => {
      gate.solutions.forEach(sol => {
        expect(getSkillById(sol.commandId)).toBeDefined()
        expect(VALID_TIERS).toContain(sol.tier)
        expect(typeof sol.repDelta).toBe('number')
        expect(typeof sol.shameDelta).toBe('number')
      })
    })
  })

  it('hard gates have at least one solution', () => {
    getAllGates()
      .filter(g => g.type === 'hard')
      .forEach(gate => {
        expect(gate.solutions.length).toBeGreaterThanOrEqual(1)
      })
  })

  it('reputation gates have a reputationThreshold', () => {
    getAllGates()
      .filter(g => g.type === 'reputation')
      .forEach(gate => {
        expect(typeof gate.reputationThreshold).toBe('number')
        expect(gate.reputationThreshold).toBeGreaterThan(0)
      })
  })

  it('shame gates have a shameThreshold', () => {
    getAllGates()
      .filter(g => g.type === 'shame')
      .forEach(gate => {
        expect(typeof gate.shameThreshold).toBe('number')
        expect(gate.shameThreshold).toBeGreaterThan(0)
      })
  })

  it('multi-step gates have steps[] with valid commandIds', () => {
    getAllGates()
      .filter(g => g.steps && g.steps.length > 0)
      .forEach(gate => {
        gate.steps.forEach(step => {
          expect(getSkillById(step.commandId)).toBeDefined()
          expect(VALID_TIERS).toContain(step.tier)
        })
      })
  })
})
