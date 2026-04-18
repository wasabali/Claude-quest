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
import { getById as getAudioById, getAll as getAllAudio, getBy as getAudioBy, getSfxPreset, getBgmConfig, getAllSfx, getAllBgm } from '../src/data/audio.js'

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
  'audio.js',
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
  it('defines all 14 cursed trainers with isCursed: true', () => {
    const cursedTrainers = getAllTrainers().filter(trainer => trainer.isCursed)
    expect(cursedTrainers).toHaveLength(14)
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
      ...getAllThreads().map(entry => entry.id),
      ...getAllGates().map(entry => entry.id),
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

describe('audio registry', () => {
  it('defines exactly 21 SFX presets', () => {
    expect(getAllSfx()).toHaveLength(21)
  })

  it('defines exactly 17 BGM configs', () => {
    expect(getAllBgm()).toHaveLength(17)
  })

  it('getSfxPreset returns correct entry', () => {
    const preset = getSfxPreset('sfx_confirm')
    expect(preset).toBeDefined()
    expect(preset.id).toBe('sfx_confirm')
    expect(preset.priority).toBe(2)
  })

  it('getBgmConfig returns correct entry', () => {
    const config = getBgmConfig('battle_incident')
    expect(config).toBeDefined()
    expect(config.id).toBe('battle_incident')
    expect(config.loop).toBe(true)
  })

  it('all SFX entries have required fields with valid types', () => {
    getAllSfx().forEach(sfx => {
      expect(typeof sfx.id).toBe('string')
      expect(typeof sfx.seed).toBe('number')
      expect(sfx.volume).toBeGreaterThanOrEqual(0)
      expect(sfx.volume).toBeLessThanOrEqual(1)
      expect([1, 2, 3, 4]).toContain(sfx.priority)
      expect(typeof sfx.duration).toBe('number')
      expect(sfx.duration).toBeGreaterThan(0)
      expect(typeof sfx.description).toBe('string')
    })
  })

  it('all BGM entries have required fields with valid types', () => {
    getAllBgm().forEach(bgm => {
      expect(typeof bgm.id).toBe('string')
      expect(typeof bgm.file).toBe('string')
      expect(bgm.file).toMatch(/^assets\/audio\/bgm\/.+\.ogg$/)
      expect(bgm.volume).toBeGreaterThanOrEqual(0)
      expect(bgm.volume).toBeLessThanOrEqual(1)
      expect(typeof bgm.loop).toBe('boolean')
    })
  })

  it('all SFX IDs match their object keys', () => {
    getAllSfx().forEach(sfx => {
      expect(getSfxPreset(sfx.id)).toBe(sfx)
    })
  })

  it('all BGM IDs match their object keys', () => {
    getAllBgm().forEach(bgm => {
      expect(getBgmConfig(bgm.id)).toBe(bgm)
    })
  })

  it('all SFX seeds are unique', () => {
    const seeds = getAllSfx().map(sfx => sfx.seed)
    expect(new Set(seeds).size).toBe(seeds.length)
  })

  it('victory and game_over tracks do not loop', () => {
    expect(getBgmConfig('victory').loop).toBe(false)
    expect(getBgmConfig('game_over').loop).toBe(false)
  })

  it('follows the standard registry pattern with getById, getAll, getBy', () => {
    expect(getAudioById('sfx_confirm')).toBeDefined()
    expect(getAudioById('sfx_confirm').id).toBe('sfx_confirm')
    expect(getAudioById('battle_incident')).toBeDefined()
    expect(getAudioById('battle_incident').id).toBe('battle_incident')

    const all = getAllAudio()
    expect(all.length).toBe(21 + 17)

    const priority4 = getAudioBy('priority', 4)
    expect(priority4.length).toBeGreaterThan(0)
    priority4.forEach(sfx => expect(sfx.priority).toBe(4))
  })
})
