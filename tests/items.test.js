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
})
