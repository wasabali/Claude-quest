import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { REGION_CONNECTIONS, getAll as getAllRegions } from '../src/data/regions.js'

const MAPS_DIR = path.join(process.cwd(), 'assets', 'maps')

function loadMap(regionId) {
  return JSON.parse(fs.readFileSync(path.join(MAPS_DIR, `${regionId}.tmj`), 'utf8'))
}

const REQUIRED_LAYERS = ['Ground', 'Objects', 'NPCs', 'Overlay', 'Collision']
const connectedRegionIds = Object.keys(REGION_CONNECTIONS)
const allRegions = getAllRegions().filter(r => r.type !== 'hidden')

describe('localhost_town map tileset metadata', () => {
  it('declares stub_tiles as an image-based tileset', () => {
    const map = loadMap('localhost_town')
    const tileset = map.tilesets.find(set => set.name === 'stub_tiles')
    const tileEntries = tileset?.tiles ?? []

    expect(tileset).toBeDefined()
    expect(tileset.columns).toBe(5)
    expect(tileset.image).toBe('stub_tiles.png')
    expect(tileset.imagewidth).toBe(240)
    expect(tileset.imageheight).toBe(48)
    expect(Array.isArray(tileEntries)).toBe(true)
    expect(tileEntries.every(tile => tile.image === undefined)).toBe(true)
  })
})

describe('all connected regions have map files', () => {
  it.each(connectedRegionIds)('%s has a .tmj file', (regionId) => {
    const mapPath = path.join(MAPS_DIR, `${regionId}.tmj`)
    expect(fs.existsSync(mapPath)).toBe(true)
  })
})

describe('map layer structure', () => {
  it.each(allRegions.map(r => r.id))('%s has all required layers', (regionId) => {
    const mapPath = path.join(MAPS_DIR, `${regionId}.tmj`)
    expect(fs.existsSync(mapPath)).toBe(true)
    const map = loadMap(regionId)
    const layerNames = map.layers.map(l => l.name)
    for (const name of REQUIRED_LAYERS) {
      expect(layerNames).toContain(name)
    }
  })

  it.each(allRegions.map(r => r.id))('%s uses stub_tiles tileset', (regionId) => {
    const mapPath = path.join(MAPS_DIR, `${regionId}.tmj`)
    expect(fs.existsSync(mapPath)).toBe(true)
    const map = loadMap(regionId)
    expect(map.tilesets[0].name).toBe('stub_tiles')
    expect(map.tilesets[0].image).toBe('stub_tiles.png')
  })
})

describe('collision openings match REGION_CONNECTIONS', () => {
  for (const [regionId, connections] of Object.entries(REGION_CONNECTIONS)) {
    const directions = Object.keys(connections)
    it(`${regionId} has openings for ${directions.join(', ')}`, () => {
      const map = loadMap(regionId)
      const col = map.layers.find(l => l.name === 'Collision')
      expect(col).toBeDefined()
      const w = map.width
      const h = map.height
      const midX = Math.floor(w / 2)
      const midY = Math.floor(h / 2)

      for (const dir of directions) {
        if (dir === 'north') expect(col.data[0 * w + midX]).toBe(0)
        if (dir === 'south') expect(col.data[(h - 1) * w + midX]).toBe(0)
        if (dir === 'west')  expect(col.data[midY * w + 0]).toBe(0)
        if (dir === 'east')  expect(col.data[midY * w + (w - 1)]).toBe(0)
      }
    })
  }
})

describe('gym regions have exit transitions', () => {
  const gymRegions = allRegions.filter(r => r.type === 'gym')
  it.each(gymRegions.map(r => [r.id, r.parentRegion]))('%s has exit door to %s', (gymId, parentId) => {
    const mapPath = path.join(MAPS_DIR, `${gymId}.tmj`)
    expect(fs.existsSync(mapPath)).toBe(true)
    const map = loadMap(gymId)
    const trans = map.layers.find(l => l.name === 'Transitions')
    expect(trans).toBeDefined()
    const exitDoor = trans.objects.find(o => o.name === 'exit_door')
    expect(exitDoor).toBeDefined()
    const target = exitDoor.properties.find(p => p.name === 'targetRegion')
    expect(target.value).toBe(parentId)
  })
})

describe('fast travel regions have azure_terminal', () => {
  const ftRegions = allRegions.filter(r => r.hasFastTravel)
  it.each(ftRegions.map(r => r.id))('%s has azure_terminal NPC', (regionId) => {
    const map = loadMap(regionId)
    const npcLayer = map.layers.find(l => l.name === 'NPCs')
    expect(npcLayer).toBeDefined()
    const terminal = npcLayer.objects.find(o => o.name === 'azure_terminal')
    expect(terminal).toBeDefined()
  })
})

describe('transition spawn coordinates are in-bounds for target maps', () => {
  const gymRegions = allRegions.filter(r => r.type === 'gym')
  it.each(gymRegions.map(r => [r.id, r.parentRegion]))('%s exit_door spawns within %s bounds', (gymId, parentId) => {
    const gymMap = loadMap(gymId)
    const trans = gymMap.layers.find(l => l.name === 'Transitions')
    const exitDoor = trans.objects.find(o => o.name === 'exit_door')
    const spawnX = exitDoor.properties.find(p => p.name === 'targetSpawnX').value
    const spawnY = exitDoor.properties.find(p => p.name === 'targetSpawnY').value
    const parentMap = loadMap(parentId)
    expect(spawnX).toBeGreaterThanOrEqual(0)
    expect(spawnX).toBeLessThan(parentMap.width)
    expect(spawnY).toBeGreaterThanOrEqual(0)
    expect(spawnY).toBeLessThan(parentMap.height)
  })

  it('sibling gyms under same parent have distinct exit spawn coords', () => {
    const gymsByParent = {}
    for (const r of gymRegions) {
      if (!gymsByParent[r.parentRegion]) gymsByParent[r.parentRegion] = []
      gymsByParent[r.parentRegion].push(r.id)
    }
    for (const [parentId, gymIds] of Object.entries(gymsByParent)) {
      if (gymIds.length < 2) continue
      const spawns = gymIds.map(id => {
        const map = loadMap(id)
        const trans = map.layers.find(l => l.name === 'Transitions')
        const exitDoor = trans.objects.find(o => o.name === 'exit_door')
        const x = exitDoor.properties.find(p => p.name === 'targetSpawnX').value
        const y = exitDoor.properties.find(p => p.name === 'targetSpawnY').value
        return `${x},${y}`
      })
      const unique = new Set(spawns)
      expect(unique.size).toBe(spawns.length)
    }
  })
})

const TECH_REGION_IDS = [
  'production_plains',
  'kubernetes_colosseum',
  'server_graveyard',
  'azure_town',
  'cloud_console_1',
  'cloud_console_2',
  'cloud_console_gym',
  'sre_command_center',
  'oldcorp_basement',
]

describe('tech regions carry kenney_tech_office tileset', () => {
  it.each(TECH_REGION_IDS.filter(id => {
    const p = path.join(MAPS_DIR, `${id}.tmj`)
    return fs.existsSync(p)
  }))('%s includes kenney_tech_office as second tileset', (regionId) => {
    const map = loadMap(regionId)
    const techTs = map.tilesets.find(ts => ts.name === 'kenney_tech_office')
    expect(techTs).toBeDefined()
    expect(techTs.image).toBe('../tiles/kenney_tech_office.png')
    expect(techTs.tilewidth).toBe(48)
    expect(techTs.tileheight).toBe(48)
    expect(techTs.columns).toBe(5)
    expect(techTs.tilecount).toBe(50)
    expect(techTs.firstgid).toBe(6)
  })

  it('server_graveyard ground layer uses tech_floor (GID 6)', () => {
    const map = loadMap('server_graveyard')
    const ground = map.layers.find(l => l.name === 'Ground')
    expect(ground).toBeDefined()
    // All ground tiles should be the tech_floor GID (local ID 1 + firstgid - 1 = 1 + 5 = 6)
    expect(ground.data.every(gid => gid === 6)).toBe(true)
  })

  it('server_graveyard objects layer contains graveyard tech tiles', () => {
    const map = loadMap('server_graveyard')
    const objects = map.layers.find(l => l.name === 'Objects')
    expect(objects).toBeDefined()
    const nonZero = objects.data.filter(gid => gid !== 0)
    expect(nonZero.length).toBeGreaterThan(0)
    // All non-zero GIDs should be in range 6–55 (kenney_tech_office tiles)
    expect(nonZero.every(gid => gid >= 6 && gid <= 55)).toBe(true)
  })
})
