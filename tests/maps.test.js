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

  it('declares village as the second tileset for Ninja Adventure integration', () => {
    const map = loadMap('localhost_town')
    const village = map.tilesets.find(set => set.name === 'village')

    expect(village).toBeDefined()
    expect(village.columns).toBe(8)
    expect(village.image).toBe('tilesets/village.png')
    expect(village.imagewidth).toBe(384)
    expect(village.imageheight).toBe(192)
    expect(village.tilewidth).toBe(48)
    expect(village.tileheight).toBe(48)
    expect(village.tilecount).toBe(32)
    // stub_tiles must remain first so existing maps are unaffected
    expect(map.tilesets[0].name).toBe('stub_tiles')
  })

  it('village tileset declares solid collision properties on wall tiles', () => {
    const map = loadMap('localhost_town')
    const village = map.tilesets.find(set => set.name === 'village')
    expect(village.tiles).toBeDefined()
    const solidIds = village.tiles
      .filter(t => t.properties?.some(p => p.name === 'solid' && p.value === true))
      .map(t => t.id)

    expect(solidIds.length).toBeGreaterThan(0)
    // Wall tiles (row 1: ids 8-15) must all be solid
    expect(solidIds).toContain(8)   // wall_stone
    expect(solidIds).toContain(9)   // wall_wood
    expect(solidIds).toContain(10)  // wall_brick
    expect(solidIds).toContain(11)  // fence
  })

  it('village tileset PNG is a valid PNG at 384×192px', () => {
    const pngPath = path.join(MAPS_DIR, 'tilesets', 'village.png')
    expect(fs.existsSync(pngPath)).toBe(true)
    const buf = fs.readFileSync(pngPath)
    // PNG signature
    expect(buf[0]).toBe(137)
    expect(buf[1]).toBe(80)   // P
    expect(buf[2]).toBe(78)   // N
    expect(buf[3]).toBe(71)   // G
    // IHDR width and height are big-endian uint32 at bytes 16-23
    const width  = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    expect(width).toBe(384)
    expect(height).toBe(192)
  })

  it('localhost_town ground layer uses village tile IDs', () => {
    const map = loadMap('localhost_town')
    const ground = map.layers.find(l => l.name === 'Ground')
    const village = map.tilesets.find(ts => ts.name === 'village')
    const minGid = village.firstgid
    const maxGid = village.firstgid + village.tilecount - 1

    const usesVillageTiles = ground.data.some(id => id >= minGid && id <= maxGid)
    expect(usesVillageTiles).toBe(true)
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

describe('Ninja Adventure tileset pipeline files', () => {
  const TILESET_NAMES = ['village', 'dungeon', 'nature', 'interior']

  it.each(TILESET_NAMES)('%s.png is a valid 384×192px PNG', (name) => {
    const buf = fs.readFileSync(path.join(MAPS_DIR, 'tilesets', `${name}.png`))
    expect(buf[0]).toBe(137) // PNG signature byte
    expect(buf.readUInt32BE(16)).toBe(384)  // IHDR width
    expect(buf.readUInt32BE(20)).toBe(192)  // IHDR height
  })

  it.each(TILESET_NAMES)('%s.tsx exists in assets/maps/tilesets/', (name) => {
    expect(fs.existsSync(path.join(MAPS_DIR, 'tilesets', `${name}.tsx`))).toBe(true)
  })

  it.each(TILESET_NAMES)('%s.tsx references the matching PNG', (name) => {
    const tsx = fs.readFileSync(path.join(MAPS_DIR, 'tilesets', `${name}.tsx`), 'utf8')
    expect(tsx).toContain(`source="${name}.png"`)
  })

  it.each(TILESET_NAMES)('%s.tsx declares tilewidth and tileheight of 48', (name) => {
    const tsx = fs.readFileSync(path.join(MAPS_DIR, 'tilesets', `${name}.tsx`), 'utf8')
    expect(tsx).toContain('tilewidth="48"')
    expect(tsx).toContain('tileheight="48"')
  })

  it.each(TILESET_NAMES)('%s.tsx marks at least one tile as solid', (name) => {
    const tsx = fs.readFileSync(path.join(MAPS_DIR, 'tilesets', `${name}.tsx`), 'utf8')
    expect(tsx).toContain('name="solid"')
    expect(tsx).toContain('value="true"')
  })

  it('village.tsx defines Wang autotile terrain sets', () => {
    const tsx = fs.readFileSync(path.join(MAPS_DIR, 'tilesets', 'village.tsx'), 'utf8')
    expect(tsx).toContain('<wangsets>')
    expect(tsx).toContain('<wangset ')
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
