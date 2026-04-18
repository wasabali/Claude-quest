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
import { getAll as getAllThreads, getByCommandId } from '../src/data/stackoverflow.js'
import { getById as getGateById, getAll as getAllGates, getBy as getGatesBy } from '../src/data/gates.js'
import { getAll as getAllInteractions } from '../src/data/interactions.js'
import { getById as getGymById, getAll as getAllGyms, getBy as getGymsBy } from '../src/data/gyms.js'

const VALID_TIERS = ['optimal', 'standard', 'shortcut', 'cursed', 'nuclear']
const VALID_GATE_TYPES = ['hard', 'soft', 'knowledge', 'reputation', 'shame']
const DATA_FILES = [
  'skills.js',
  'items.js',
  'trainers.js',
  'emblems.js',
  'quests.js',
  'encounters.js',
  'stackoverflow.js',
  'gates.js',
  'interactions.js',
  'gyms.js',
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
      'kubectl_apply_yolo',
      'kubectl_delete_ns',
      'kubectl_delete_production',
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
  it('defines all 19 cursed trainers with isCursed: true', () => {
    const cursedTrainers = getAllTrainers().filter(trainer => trainer.isCursed)
    expect(cursedTrainers).toHaveLength(19)
    cursedTrainers.forEach(trainer => expect(trainer.isCursed).toBe(true))
  })

  it('defines all 9 emblems with grimeDescription and passiveBonus', () => {
    const emblems = getAllEmblems()
    expect(emblems).toHaveLength(9)
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
      ...getAllThreads().map(entry => entry.id),
      ...getAllGates().map(entry => entry.id),
      ...getAllInteractions().map(entry => entry.id),
      ...getAllGyms().map(entry => entry.id),
    ]
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

describe('stackoverflow registry', () => {
  it('all threads have required fields', () => {
    getAllThreads().forEach(thread => {
      expect(typeof thread.id).toBe('string')
      expect(typeof thread.commandId).toBe('string')
      expect(typeof thread.questionTitle).toBe('string')
      expect(Array.isArray(thread.answers)).toBe(true)
      expect(Array.isArray(thread.comments)).toBe(true)
      thread.answers.forEach(a => {
        expect(typeof a.text).toBe('string')
        expect(typeof a.author).toBe('string')
        expect(typeof a.score).toBe('number')
        expect(typeof a.isAccepted).toBe('boolean')
      })
    })
  })

  it('getByCommandId returns correct thread via O(1) index', () => {
    const thread = getByCommandId('blame_dns')
    expect(thread).toBeDefined()
    expect(thread.id).toBe('so_blame_dns')
    expect(thread.commandId).toBe('blame_dns')
  })

  it('getByCommandId returns null for unknown commandId', () => {
    expect(getByCommandId('__nonexistent__')).toBeNull()
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

describe('interactions registry', () => {
  it('has 7 environmental storytelling entries', () => {
    expect(getAllInteractions()).toHaveLength(7)
  })

  it('all interactions have required fields', () => {
    getAllInteractions().forEach(interaction => {
      expect(typeof interaction.id).toBe('string')
      expect(typeof interaction.location).toBe('string')
      expect(typeof interaction.object).toBe('string')
      expect(Array.isArray(interaction.text)).toBe(true)
      expect(interaction.text.length).toBeGreaterThan(0)
    })
  })
})

describe('do_not_touch quest', () => {
  it('exists with branch type', () => {
    const quest = getAllQuests().find(q => q.id === 'do_not_touch')
    expect(quest).toBeDefined()
    expect(quest.type).toBe('branch')
    expect(quest.branches.open).toBeDefined()
    expect(quest.branches.migrate).toBeDefined()
  })

  it('open branch triggers vb6_billing_horror', () => {
    const quest = getAllQuests().find(q => q.id === 'do_not_touch')
    expect(quest.branches.open.triggerEncounter).toBe('vb6_billing_horror')
  })

  it('migrate branch has 3 quiz choices', () => {
    const quest = getAllQuests().find(q => q.id === 'do_not_touch')
    expect(quest.branches.migrate.quiz).toHaveLength(3)
  })
})

describe('vb6_billing_horror encounter', () => {
  it('exists with immuneDomains', () => {
    const enc = getAllEncounters().find(e => e.id === 'vb6_billing_horror')
    expect(enc).toBeDefined()
    expect(enc.type).toBe('incident')
    expect(enc.domain).toBe('linux')
    expect(enc.immuneDomains).toEqual(['cloud', 'iac', 'kubernetes', 'containers'])
    expect(enc.hp).toBe(80)
    expect(enc.sla).toBe(5)
  })
})

const VALID_GYM_MECHANICS = ['legacy_only', 'sla_timer', 'flaky_pipeline', 'cold_start', 'respawn', 'rbac_deny', 'cost_spiral', 'all_domains']
const VALID_GYM_ROLES = ['leader', 'sub_leader', 'apprentice']

describe('gyms registry', () => {
  it('follows the registry pattern with getById, getAll, getBy', () => {
    const gym = getGymById('fundamentals_gym')
    expect(gym).toBeDefined()
    expect(gym.id).toBe('fundamentals_gym')

    const allGyms = getAllGyms()
    expect(allGyms.length).toBe(8)

    const linuxGyms = getGymsBy('domain', 'linux')
    expect(linuxGyms.length).toBeGreaterThanOrEqual(1)
  })

  it('all gyms have required fields', () => {
    getAllGyms().forEach(gym => {
      expect(typeof gym.id).toBe('string')
      expect(typeof gym.name).toBe('string')
      expect(typeof gym.leader).toBe('string')
      expect(Array.isArray(gym.subLeaders)).toBe(true)
      expect(typeof gym.apprenticeCount).toBe('number')
      expect(typeof gym.requiredBadges).toBe('number')
      expect(VALID_GYM_MECHANICS).toContain(gym.mechanic)
      expect(typeof gym.mechanicConfig).toBe('object')
      expect(typeof gym.emblemReward).toBe('string')
      expect(typeof gym.region).toBe('string')
    })
  })

  it('all gym leaders exist in trainers registry with correct gymRole', () => {
    const trainerLookup = Object.fromEntries(getAllTrainers().map(t => [t.id, t]))
    getAllGyms().forEach(gym => {
      const leader = trainerLookup[gym.leader]
      expect(leader).toBeDefined()
      expect(leader.gymRole).toBe('leader')
      expect(leader.gymId).toBe(gym.id)
    })
  })

  it('all gym sub-leaders exist in trainers registry with teachSkillId', () => {
    const trainerLookup = Object.fromEntries(getAllTrainers().map(t => [t.id, t]))
    getAllGyms().forEach(gym => {
      gym.subLeaders.forEach(subId => {
        const sub = trainerLookup[subId]
        expect(sub).toBeDefined()
        expect(sub.gymRole).toBe('sub_leader')
        expect(sub.gymId).toBe(gym.id)
        expect(sub.teachSkillId).toBeTruthy()
      })
    })
  })

  it('all gym emblem rewards exist in emblems registry', () => {
    const emblemLookup = Object.fromEntries(getAllEmblems().map(e => [e.id, e]))
    getAllGyms().forEach(gym => {
      expect(emblemLookup[gym.emblemReward]).toBeDefined()
    })
  })

  it('gym trainers have valid gymRole values', () => {
    getAllTrainers()
      .filter(t => t.gymRole)
      .forEach(t => {
        expect(VALID_GYM_ROLES).toContain(t.gymRole)
        expect(typeof t.gymId).toBe('string')
      })
  })

  it('has 8 gym leaders, 9 sub-leaders, and 17 apprentices', () => {
    const gymTrainers = getAllTrainers().filter(t => t.gymRole)
    const leaders    = gymTrainers.filter(t => t.gymRole === 'leader')
    const subLeaders = gymTrainers.filter(t => t.gymRole === 'sub_leader')
    const apprentices = gymTrainers.filter(t => t.gymRole === 'apprentice')

    expect(leaders).toHaveLength(8)
    expect(subLeaders).toHaveLength(9)
    expect(apprentices).toHaveLength(17)
  })

  it('sub-leader teachSkillIds reference valid skills', () => {
    getAllTrainers()
      .filter(t => t.gymRole === 'sub_leader')
      .forEach(t => {
        expect(getSkillById(t.teachSkillId)).toBeDefined()
      })
  })
})
