import { describe, expect, it } from 'vitest'
import { getBy, getById } from '../src/data/items.js'

describe('items registry', () => {
  it('defines red bull as a battle-usable tool healing 30 HP', () => {
    const item = getById('red_bull')
    expect(item.tab).toBe('tools')
    expect(item.usableInBattle).toBe(true)
    expect(item.effect).toEqual({ type: 'heal_hp', value: 30 })
  })

  it('defines mystery_node_modules with non-droppable flavor text', () => {
    const item = getById('mystery_node_modules')
    expect(item.tab).toBe('junk')
    expect(item.cannotDropText).toBe("47,000 files. Does nothing. Can't delete.")
  })

  it('defines terraform_state examine text as immutable warning', () => {
    expect(getById('terraform_state').description).toBe("Don't touch it. Don't move it.")
  })

  it('defines incident_postmortem as a read action with conditional XP', () => {
    const item = getById('incident_postmortem')
    expect(item.tab).toBe('docs')
    expect(item.worldActions).toContain('read')
    expect(item.effect).toEqual({
      type: 'read_xp_if_last_battle_lost',
      value: 20,
      onceFlag: 'incidentPostmortemRead',
    })
  })

  it('can query items by tab', () => {
    const docs = getBy('tab', 'docs').map((item) => item.id)
    expect(docs).toContain('incident_postmortem')
  })

  it('defines cross_origin_opener_policy as a non-battle key item', () => {
    const item = getById('cross_origin_opener_policy')
    expect(item.tab).toBe('keyItems')
    expect(item.usableInBattle).toBe(false)
    expect(item.description).toBe('Value: same-origin. You found this in a config file. It looked important.')
  })

  it('defines cross_origin_embedder_policy as a non-battle key item', () => {
    const item = getById('cross_origin_embedder_policy')
    expect(item.tab).toBe('keyItems')
    expect(item.usableInBattle).toBe(false)
    expect(item.description).toBe("Value: require-corp. Nobody knows why this is needed. It just is.")
  })

  it('defines sudo_running_shoes as a passive key item for 2x movement speed', () => {
    const item = getById('sudo_running_shoes')
    expect(item.tab).toBe('keyItems')
    expect(item.usableInBattle).toBe(false)
    expect(item.effect).toBeNull()
    expect(item.description).toContain('2x movement speed')
    expect(item.description).toContain('Encounter rate +50%')
  })
})
