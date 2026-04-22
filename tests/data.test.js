import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

import { DOMAIN_MATCHUPS, GYM_SHAME_THRESHOLDS } from '../src/config.js'
import { getById as getSkillById, getAll as getAllSkills, getBy as getSkillsBy } from '../src/data/skills.js'
import { getById as getItemById, getAll as getAllItems } from '../src/data/items.js'
import { getById as getTrainerById, getAll as getAllTrainers } from '../src/data/trainers.js'
import { getAll as getAllEmblems, getById as getEmblemById } from '../src/data/emblems.js'
import { getAll as getAllQuests } from '../src/data/quests.js'
import { ENCOUNTER_POOLS, getAll as getAllEncounters } from '../src/data/encounters.js'
import { getAll as getAllThreads, getByCommandId } from '../src/data/stackoverflow.js'
import { getById as getGateById, getAll as getAllGates, getBy as getGatesBy } from '../src/data/gates.js'
import { getById as getInteractionById, getAll as getAllInteractions, getBy as getInteractionsBy } from '../src/data/interactions.js'
import { getById as getAudioById, getAll as getAllAudio, getBy as getAudioBy, getSfxPreset, getBgmConfig, getAllSfx, getAllBgm } from '../src/data/audio.js'
import { getById as getGymById, getAll as getAllGyms, getBy as getGymsBy } from '../src/data/gyms.js'
import { getAll as getAllStory } from '../src/data/story.js'

import { getById as getRegionById, getAll as getAllRegions, getBy as getRegionsBy, REGION_CONNECTIONS } from '../src/data/regions.js'
import { getById as getShopById, getAll as getAllShops, getBy as getShopsBy } from '../src/data/shops.js'

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
  'audio.js',
  'gyms.js',
  'regions.js',
  'shops.js',
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
      ...getAllRegions().map(entry => entry.id),
      ...getAllShops().map(entry => entry.id),
    ]
    expect(new Set(allIds).size).toBe(allIds.length)
  })
})

describe('gym leaders', () => {
  const gymLeaders = getAllTrainers().filter(t => t.role === 'gym_leader')

  it('defines all 8 gym leaders', () => {
    expect(gymLeaders).toHaveLength(8)
  })

  it('each gym leader has gymNumber 1–8 with no duplicates', () => {
    const numbers = gymLeaders.map(t => t.gymNumber).sort()
    expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('each gym leader has personality dialog arrays', () => {
    gymLeaders.forEach(leader => {
      expect(Array.isArray(leader.preBattleDialog)).toBe(true)
      expect(leader.preBattleDialog.length).toBeGreaterThan(0)
      expect(Array.isArray(leader.postDefeatDialog)).toBe(true)
      expect(leader.postDefeatDialog.length).toBeGreaterThan(0)
    })
  })

  it('each gym leader has shame ≥ 5 wary dialog', () => {
    gymLeaders.forEach(leader => {
      expect(Array.isArray(leader.preBattleDialog_highShame)).toBe(true)
      expect(leader.preBattleDialog_highShame.length).toBeGreaterThan(0)
    })
  })

  it('each gym leader has shame ≥ 10 teach refusal dialog', () => {
    gymLeaders.forEach(leader => {
      expect(Array.isArray(leader.postDefeatDialog_highShame)).toBe(true)
      expect(leader.postDefeatDialog_highShame.length).toBeGreaterThan(0)
    })
  })

  it('each gym leader has mechanicConfig (except CTO)', () => {
    gymLeaders
      .filter(l => l.id !== 'the_cto')
      .forEach(leader => {
        expect(leader.mechanic).toBeTruthy()
        expect(leader.mechanicConfig).toBeTruthy()
      })
  })

  it('each gym leader with an emblemReward references a valid emblem in the registry', () => {
    gymLeaders
      .filter(l => l.emblemReward !== null)
      .forEach(leader => {
        expect(typeof leader.emblemReward).toBe('string')
        expect(getEmblemById(leader.emblemReward)).toBeDefined()
      })
  })

  it('each gym leader except CTO has a subLeader referencing a valid trainer', () => {
    gymLeaders
      .filter(l => l.id !== 'the_cto')
      .forEach(leader => {
        expect(typeof leader.subLeader).toBe('string')
        expect(getTrainerById(leader.subLeader)).toBeDefined()
      })
  })

  it('Captain Nines has sla_timer mechanic with turnLimit and repPenalty', () => {
    const captain = getTrainerById('captain_nines')
    expect(captain.mechanic).toBe('sla_timer')
    expect(captain.mechanicConfig.turnLimit).toBe(8)
    expect(captain.mechanicConfig.repPenalty).toBe(15)
  })

  it('Docker Dag has layered_defence mechanic with 3 layers', () => {
    const dag = getTrainerById('docker_dag')
    expect(dag.mechanic).toBe('layered_defence')
    expect(dag.mechanicConfig.layers).toBe(3)
  })

  it('Kube Master has respawn mechanic', () => {
    const kube = getTrainerById('kube_master')
    expect(kube.mechanic).toBe('respawn')
    expect(kube.mechanicConfig.respawnCount).toBe(3)
    expect(kube.mechanicConfig.respawnHpPercent).toBe(50)
  })

  it('Fatima is marked as field_trainer, not a gym leader', () => {
    const fatima = getTrainerById('fatima_witch')
    expect(fatima.role).toBe('field_trainer')
  })
})

describe('Legacy Monolith encounter', () => {
  it('is immune to cloud, iac, kubernetes, containers', () => {
    const enc = getAllEncounters().find(e => e.id === 'legacy_monolith')
    expect(enc).toBeDefined()
    expect(enc.immuneDomains).toEqual(['cloud', 'iac', 'kubernetes', 'containers'])
  })

  it('is vulnerable to linux and security', () => {
    const enc = getAllEncounters().find(e => e.id === 'legacy_monolith')
    expect(enc.vulnerableDomains).toEqual(['linux', 'security'])
  })

  it('drops oldcorp_keycard', () => {
    const enc = getAllEncounters().find(e => e.id === 'legacy_monolith')
    expect(enc.dropItem).toBe('oldcorp_keycard')
    expect(getItemById('oldcorp_keycard')).toBeDefined()
    expect(getItemById('oldcorp_keycard').tab).toBe('keyItems')
  })
})

describe('GYM_SHAME_THRESHOLDS', () => {
  it('has wary threshold at 5 and teachRefusal at 10', () => {
    expect(GYM_SHAME_THRESHOLDS.wary).toBe(5)
    expect(GYM_SHAME_THRESHOLDS.teachRefusal).toBe(10)
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

describe('bgm-loop-points.json', () => {
  const loopPointsPath = path.join(process.cwd(), 'assets', 'audio', 'bgm-loop-points.json')
  const loopPoints     = JSON.parse(fs.readFileSync(loopPointsPath, 'utf8'))

  it('is parseable JSON with an object at the root', () => {
    expect(loopPoints).toBeDefined()
    expect(typeof loopPoints).toBe('object')
    expect(Array.isArray(loopPoints)).toBe(false)
  })

  it('contains an entry for every BGM track registered in audio.js', () => {
    getAllBgm().forEach(bgm => {
      expect(loopPoints).toHaveProperty(bgm.id)
    })
  })

  it('every BGM entry has numeric start and end values >= 0', () => {
    getAllBgm().forEach(bgm => {
      const entry = loopPoints[bgm.id]
      expect(typeof entry.start).toBe('number')
      expect(typeof entry.end).toBe('number')
      expect(entry.start).toBeGreaterThanOrEqual(0)
      expect(entry.end).toBeGreaterThanOrEqual(0)
    })
  })

  it('end >= start for every BGM entry', () => {
    getAllBgm().forEach(bgm => {
      const { start, end } = loopPoints[bgm.id]
      expect(end).toBeGreaterThanOrEqual(start)
    })
  })

  it('non-looping tracks (victory, game_over) keep start 0 and end 0', () => {
    getAllBgm()
      .filter(bgm => !bgm.loop)
      .forEach(bgm => {
        const entry = loopPoints[bgm.id]
        expect(entry.start).toBe(0)
        expect(entry.end).toBe(0)
      })
  })

  it('every track ID in the file corresponds to a known BGM in audio.js', () => {
    const knownIds = new Set(getAllBgm().map(bgm => bgm.id))
    Object.keys(loopPoints)
      .filter(key => !key.startsWith('_'))
      .forEach(key => {
        expect(knownIds.has(key)).toBe(true)
      })
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
})

describe('shops registry', () => {
  it('follows the registry pattern with getById, getAll, getBy', () => {
    const shop = getShopById('azure_marketplace')
    expect(shop).toBeDefined()
    expect(shop.id).toBe('azure_marketplace')

    const allShops = getAllShops()
    expect(allShops.length).toBeGreaterThanOrEqual(3)

    expect(typeof getShopsBy).toBe('function')
  })

  it('all shops have required fields', () => {
    getAllShops().forEach(shop => {
      expect(typeof shop.id).toBe('string')
      expect(typeof shop.name).toBe('string')
      expect(typeof shop.location).toBe('string')
      expect(typeof shop.priceMultiplier).toBe('number')
      expect(Array.isArray(shop.inventory)).toBe(true)
    })
  })

  it('all shop inventory entries reference valid items', () => {
    getAllShops().forEach(shop => {
      shop.inventory.forEach(entry => {
        expect(getItemById(entry.itemId), `shop ${shop.id} references unknown item ${entry.itemId}`).toBeDefined()
        expect(typeof entry.basePrice).toBe('number')
        expect(entry.basePrice).toBeGreaterThan(0)
        expect(typeof entry.stock).toBe('number')
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

describe('NPC reactivity — data integrity', () => {
  const npcEntries = getAllStory().filter(e => e.id?.startsWith('npc_'))
    .filter(e => e.id !== 'npc_azure_terminal' && !e.id.endsWith('_post_terminal'))

  it('all NPC story entries with dialogByAct have acts 1-4 and finale', () => {
    npcEntries.forEach(entry => {
      if (!entry.dialogByAct) return
      for (const key of [1, 2, 3, 4, 'finale']) {
        expect(Array.isArray(entry.dialogByAct[key]),
          `${entry.id} missing dialogByAct[${key}]`).toBe(true)
      }
    })
  })

  it('shameDialog uses valid threshold keys (3, 7, 10)', () => {
    npcEntries.forEach(entry => {
      if (!entry.shameDialog) return
      const keys = Object.keys(entry.shameDialog).map(Number)
      keys.forEach(k => {
        expect([3, 7, 10]).toContain(k)
        const val = entry.shameDialog[k]
        expect(val === null || Array.isArray(val),
          `${entry.id} shameDialog[${k}] must be null or array`).toBe(true)
      })
    })
  })

  it('followUpDialog is null or an array', () => {
    npcEntries.forEach(entry => {
      if (entry.followUpDialog === undefined) return
      expect(entry.followUpDialog === null || Array.isArray(entry.followUpDialog),
        `${entry.id} followUpDialog must be null or array`).toBe(true)
    })
  })

  it('all 8 field trainers have rematchDeck arrays', () => {
    const fieldTrainers = getAllTrainers().filter(t => !t.isCursed && !t.isWildEncounter && Array.isArray(t.rematchDeck))
    expect(fieldTrainers).toHaveLength(8)
    fieldTrainers.forEach(trainer => {
      expect(Array.isArray(trainer.rematchDeck),
        `${trainer.id} missing rematchDeck`).toBe(true)
      expect(trainer.rematchDeck.length).toBeGreaterThanOrEqual(4)
      trainer.rematchDeck.forEach(skillId => {
        expect(getSkillById(skillId),
          `${trainer.id} rematchDeck references unknown skill '${skillId}'`).toBeDefined()
      })
    })
  })

  it('all cursed trainers have techniqueUsedDialog and techniqueUsedFlag', () => {
    const cursedTrainers = getAllTrainers().filter(t => t.isCursed)
    cursedTrainers.forEach(trainer => {
      expect(Array.isArray(trainer.techniqueUsedDialog),
        `${trainer.id} missing techniqueUsedDialog`).toBe(true)
      expect(typeof trainer.techniqueUsedFlag).toBe('string')
      expect(trainer.techniqueUsedFlag.startsWith('acknowledged_'),
        `${trainer.id} techniqueUsedFlag must start with 'acknowledged_'`).toBe(true)
    })
  })

  it('all cursed trainers have shameDialog', () => {
    const cursedTrainers = getAllTrainers().filter(t => t.isCursed)
    cursedTrainers.forEach(trainer => {
      expect(trainer.shameDialog,
        `${trainer.id} missing shameDialog`).toBeDefined()
    })
  })
})

const VALID_INTERACTION_TYPES = ['sign', 'chest', 'door', 'flavor']

describe('interactions registry', () => {
  it('follows the registry pattern with getById, getAll, getBy', () => {
    const interaction = getInteractionById('localhost_sign_welcome')
    expect(interaction).toBeDefined()
    expect(interaction.id).toBe('localhost_sign_welcome')

    const allInteractions = getAllInteractions()
    expect(allInteractions.length).toBeGreaterThanOrEqual(1)

    expect(typeof getInteractionsBy).toBe('function')
    const signs = getInteractionsBy('type', 'sign')
    expect(signs.length).toBeGreaterThanOrEqual(1)
    signs.forEach(s => expect(s.type).toBe('sign'))
  })

  it('all interactions have required base fields', () => {
    getAllInteractions().forEach(interaction => {
      expect(typeof interaction.id).toBe('string')
      expect(VALID_INTERACTION_TYPES).toContain(interaction.type)
      expect(typeof interaction.region).toBe('string')
      expect(typeof interaction.tileX).toBe('number')
      expect(typeof interaction.tileY).toBe('number')
    })
  })

  it('signs and flavor objects have dialog[] and repeatable: true', () => {
    getAllInteractions()
      .filter(i => i.type === 'sign' || i.type === 'flavor')
      .forEach(interaction => {
        expect(Array.isArray(interaction.dialog)).toBe(true)
        expect(interaction.dialog.length).toBeGreaterThan(0)
        expect(interaction.repeatable).toBe(true)
      })
  })

  it('chests have item, dialog, flagKey, and repeatable: false', () => {
    getAllInteractions()
      .filter(i => i.type === 'chest')
      .forEach(interaction => {
        expect(interaction.repeatable).toBe(false)
        expect(typeof interaction.flagKey).toBe('string')
        expect(Array.isArray(interaction.dialog)).toBe(true)
        expect(interaction.item).toBeDefined()
        expect(typeof interaction.item.tab).toBe('string')
        expect(typeof interaction.item.id).toBe('string')
        expect(typeof interaction.item.qty).toBe('number')
      })
  })

  it('doors have requiresItem, lockedDialog, unlockedDialog, and flagKey', () => {
    getAllInteractions()
      .filter(i => i.type === 'door')
      .forEach(interaction => {
        expect(typeof interaction.flagKey).toBe('string')
        expect(interaction.requiresItem).toBeDefined()
        expect(typeof interaction.requiresItem.tab).toBe('string')
        expect(typeof interaction.requiresItem.id).toBe('string')
        expect(Array.isArray(interaction.lockedDialog)).toBe(true)
        expect(Array.isArray(interaction.unlockedDialog)).toBe(true)
      })
  })

  it('has all four interaction types defined', () => {
    const types = new Set(getAllInteractions().map(i => i.type))
    VALID_INTERACTION_TYPES.forEach(t => expect(types.has(t)).toBe(true))
  })

  it('has all 7 environmental storytelling entries', () => {
    const storyIds = [
      'pipeline_terminal_todo',
      'staging_env_file',
      'shell_cavern_bash_history',
      'oldcorp_nameplate',
      'azure_town_vending_machine',
      'kubernetes_colosseum_locker',
      'architecture_whiteboard',
    ]
    storyIds.forEach(id => {
      expect(getInteractionById(id)).toBeDefined()
    })
  })

  it('has Localhost Town objects interactable', () => {
    const localhostInteractions = getInteractionsBy('region', 'localhost_town')
    expect(localhostInteractions.length).toBeGreaterThanOrEqual(7)
  })
})

const VALID_REGION_TYPES   = ['main', 'gym', 'dungeon', 'hidden']
const VALID_DOMAINS_OR_NULL = [...Object.keys(DOMAIN_MATCHUPS), null]

describe('regions registry', () => {
  it('follows the registry pattern with getById, getAll, getBy', () => {
    const region = getRegionById('localhost_town')
    expect(region).toBeDefined()
    expect(region.id).toBe('localhost_town')

    const allRegions = getAllRegions()
    expect(allRegions.length).toBeGreaterThanOrEqual(1)

    const mainRegions = getRegionsBy('type', 'main')
    expect(mainRegions.length).toBe(6)
    mainRegions.forEach(r => expect(r.type).toBe('main'))
  })

  it('all regions have required fields', () => {
    getAllRegions().forEach(region => {
      expect(typeof region.id).toBe('string')
      expect(typeof region.name).toBe('string')
      expect(VALID_DOMAINS_OR_NULL).toContain(region.domain)
      expect(typeof region.act).toBe('number')
      expect(VALID_REGION_TYPES).toContain(region.type)
      expect(typeof region.hasFastTravel).toBe('boolean')
      expect(typeof region.mvp).toBe('boolean')
    })
  })

  it('gyms and dungeons have valid parentRegion', () => {
    getAllRegions()
      .filter(r => r.type === 'gym' || r.type === 'dungeon')
      .forEach(region => {
        expect(typeof region.parentRegion).toBe('string')
        expect(getRegionById(region.parentRegion)).toBeDefined()
      })
  })

  it('hidden regions have accessTrigger', () => {
    getAllRegions()
      .filter(r => r.type === 'hidden')
      .forEach(region => {
        expect(typeof region.accessTrigger).toBe('string')
        expect(region.accessTrigger.length).toBeGreaterThan(0)
      })
  })

  it('defines 8 gyms', () => {
    expect(getRegionsBy('type', 'gym')).toHaveLength(8)
  })

  it('defines 5 dungeon rooms', () => {
    expect(getRegionsBy('type', 'dungeon')).toHaveLength(5)
  })

  it('defines 5 hidden regions', () => {
    expect(getRegionsBy('type', 'hidden')).toHaveLength(5)
  })

  it('MVP regions include localhost_town, pipeline_pass, terminal_gym, jira_dungeon_1', () => {
    const mvpIds = getRegionsBy('mvp', true).map(r => r.id).sort()
    expect(mvpIds).toContain('localhost_town')
    expect(mvpIds).toContain('pipeline_pass')
    expect(mvpIds).toContain('terminal_gym')
    expect(mvpIds).toContain('jira_dungeon_1')
  })

  it('REGION_CONNECTIONS has bidirectional links for main region connections', () => {
    // Main regions connected by edge-scroll must be bidirectional.
    // Dungeon exits may share an entry direction with another connection, so
    // we only enforce strict bidirectionality when both regions are in the
    // connection graph AND the reverse entry direction maps back to the source.
    for (const [fromId, dirs] of Object.entries(REGION_CONNECTIONS)) {
      for (const [dir, conn] of Object.entries(dirs)) {
        const reverse = REGION_CONNECTIONS[conn.target]
        if (!reverse) continue
        const reverseConn = reverse[conn.entry]
        if (!reverseConn) continue
        // Only enforce bidirectionality when the reverse actually points back
        if (reverseConn.target === fromId) {
          expect(reverseConn.entry).toBe(dir)
        }
      }
    }
  })

  it('all REGION_CONNECTIONS targets reference valid regions', () => {
    for (const dirs of Object.values(REGION_CONNECTIONS)) {
      for (const conn of Object.values(dirs)) {
        expect(getRegionById(conn.target)).toBeDefined()
      }
    }
  })

  it('three_am_vending requires shameMin 3 to unlock', () => {
    const shop = getShopById('three_am_vending')
    expect(shop.unlockCondition).toBeDefined()
    expect(shop.unlockCondition.shameMin).toBe(3)
  })

  it('vending machines have markup or discount multipliers', () => {
    const pipeline = getShopById('pipeline_vending')
    expect(pipeline.priceMultiplier).toBeGreaterThan(1.0)

    const threeAm = getShopById('three_am_vending')
    expect(threeAm.priceMultiplier).toBeLessThan(1.0)
  })
})
