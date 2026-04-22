import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const MAPS_DIR = path.join(ROOT, 'assets', 'maps')

const TILE = 48
const TILESET = {
  columns: 5,
  firstgid: 1,
  image: 'stub_tiles.png',
  imageheight: 48,
  imagewidth: 240,
  margin: 0,
  name: 'stub_tiles',
  spacing: 0,
  tilecount: 5,
  tileheight: TILE,
  tilewidth: TILE,
}

const SIZE = {
  main:    { w: 40, h: 22 },
  gym:     { w: 20, h: 15 },
  dungeon: { w: 30, h: 18 },
  hidden:  { w: 30, h: 18 },
}

const OPENING_WIDTH = 3

function hashSeed(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

function seededRng(seed) {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff
    return s / 0x7fffffff
  }
}

function makeTileLayer(id, name, w, h, fillValue, opts = {}) {
  return {
    data: new Array(w * h).fill(fillValue),
    height: h,
    id,
    name,
    opacity: opts.opacity ?? 1,
    type: 'tilelayer',
    visible: opts.visible ?? true,
    width: w,
    x: 0,
    y: 0,
  }
}

function makeObjectGroup(id, name, objects) {
  return {
    draworder: 'topdown',
    id,
    name,
    objects,
    opacity: 1,
    type: 'objectgroup',
    visible: true,
    x: 0,
    y: 0,
  }
}

function makeNpcObject(objId, npcName, tileX, tileY) {
  return {
    height: TILE,
    id: objId,
    name: npcName,
    properties: [{ name: 'npc', type: 'string', value: npcName }],
    type: 'npc',
    visible: true,
    width: TILE,
    x: tileX * TILE,
    y: tileY * TILE,
  }
}

function makeTransitionObject(objId, name, targetRegion, spawnX, spawnY, tileX, tileY) {
  return {
    height: TILE,
    id: objId,
    name,
    properties: [
      { name: 'targetRegion', type: 'string', value: targetRegion },
      { name: 'targetSpawnX', type: 'int', value: spawnX },
      { name: 'targetSpawnY', type: 'int', value: spawnY },
    ],
    type: 'transition',
    visible: true,
    width: TILE,
    x: tileX * TILE,
    y: tileY * TILE,
  }
}

function getOpeningTiles(w, h, connections) {
  const tiles = new Set()
  const midX = Math.floor(w / 2)
  const midY = Math.floor(h / 2)
  const half = Math.floor(OPENING_WIDTH / 2)

  if (connections.north) {
    for (let dx = -half; dx <= half; dx++) tiles.add(`${midX + dx},0`)
  }
  if (connections.south) {
    for (let dx = -half; dx <= half; dx++) tiles.add(`${midX + dx},${h - 1}`)
  }
  if (connections.west) {
    for (let dy = -half; dy <= half; dy++) tiles.add(`0,${midY + dy}`)
  }
  if (connections.east) {
    for (let dy = -half; dy <= half; dy++) tiles.add(`${w - 1},${midY + dy}`)
  }

  return tiles
}

function generateCollision(w, h, connections, occupiedTiles) {
  const layer = makeTileLayer(5, 'Collision', w, h, 0, { opacity: 0, visible: false })
  const openings = getOpeningTiles(w, h, connections)

  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      const isEdge = x === 0 || y === 0 || x === w - 1 || y === h - 1
      if (isEdge && !openings.has(`${x},${y}`)) {
        layer.data[y * w + x] = 5
      }
    }
  }

  for (const key of occupiedTiles) {
    const [bx, by] = key.split(',').map(Number)
    layer.data[by * w + bx] = 5
  }

  return layer
}

function generateObjects(w, h, regionType, openings, rng) {
  const layer = makeTileLayer(2, 'Objects', w, h, 0)
  const occupied = new Set()

  const safeZone = 2
  function canPlace(bx, by, bw, bh) {
    for (let dx = 0; dx < bw; dx++) {
      for (let dy = 0; dy < bh; dy++) {
        const tx = bx + dx
        const ty = by + dy
        if (tx < safeZone || ty < safeZone || tx >= w - safeZone || ty >= h - safeZone) return false
        if (occupied.has(`${tx},${ty}`)) return false
        if (openings.has(`${tx},${ty}`)) return false
      }
    }
    return true
  }

  function placeBuilding(bx, by, bw, bh, tileId) {
    for (let dx = 0; dx < bw; dx++) {
      for (let dy = 0; dy < bh; dy++) {
        const tx = bx + dx
        const ty = by + dy
        layer.data[ty * w + tx] = tileId
        occupied.add(`${tx},${ty}`)
      }
    }
  }

  let buildings
  if (regionType === 'main') {
    buildings = [
      { w: 4, h: 4, tile: 2 },
      { w: 4, h: 4, tile: 3 },
      { w: 4, h: 4, tile: 4 },
    ]
  } else if (regionType === 'gym') {
    buildings = [
      { w: 3, h: 3, tile: 3 },
    ]
  } else {
    buildings = [
      { w: 2, h: 2, tile: 4 },
      { w: 2, h: 2, tile: 4 },
      { w: 3, h: 2, tile: 4 },
    ]
  }

  for (const b of buildings) {
    for (let attempt = 0; attempt < 50; attempt++) {
      const bx = Math.floor(rng() * (w - b.w - safeZone * 2)) + safeZone
      const by = Math.floor(rng() * (h - b.h - safeZone * 2)) + safeZone
      if (canPlace(bx, by, b.w, b.h)) {
        placeBuilding(bx, by, b.w, b.h, b.tile)
        break
      }
    }
  }

  return { layer, occupied }
}

function findNpcSpot(w, h, occupied, usedSpots, openings, rng) {
  const safeZone = 3
  for (let attempt = 0; attempt < 100; attempt++) {
    const tx = Math.floor(rng() * (w - safeZone * 2)) + safeZone
    const ty = Math.floor(rng() * (h - safeZone * 2)) + safeZone
    const key = `${tx},${ty}`
    if (!occupied.has(key) && !usedSpots.has(key) && !openings.has(key)) {
      usedSpots.add(key)
      return { tileX: tx, tileY: ty }
    }
  }
  // Fallback: scan outward from center
  const cx = Math.floor(w / 2)
  const cy = Math.floor(h / 2)
  for (let r = 0; r < Math.max(w, h); r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        const tx = cx + dx
        const ty = cy + dy
        if (tx < safeZone || ty < safeZone || tx >= w - safeZone || ty >= h - safeZone) continue
        const key = `${tx},${ty}`
        if (!occupied.has(key) && !usedSpots.has(key) && !openings.has(key)) {
          usedSpots.add(key)
          return { tileX: tx, tileY: ty }
        }
      }
    }
  }
  return { tileX: Math.floor(w / 2), tileY: Math.floor(h / 2) }
}

function generateMap(regionId, region, connections, allRegions, trainers, interactions, childGyms, gymDoorPositions) {
  const type = region.type
  const { w, h } = SIZE[type] || SIZE.main
  const rng = seededRng(hashSeed(regionId))

  const openings = getOpeningTiles(w, h, connections)
  const { layer: objectsLayer, occupied } = generateObjects(w, h, type, openings, rng)

  const groundLayer = makeTileLayer(1, 'Ground', w, h, 1)
  const overlayLayer = makeTileLayer(4, 'Overlay', w, h, 0)

  const npcObjects = []
  const usedSpots = new Set([...occupied])
  let objId = 1

  // Trainers in this region
  const regionTrainers = trainers.filter(t => t.location === regionId)
  for (const t of regionTrainers) {
    const spot = findNpcSpot(w, h, occupied, usedSpots, openings, rng)
    npcObjects.push(makeNpcObject(objId++, t.id, spot.tileX, spot.tileY))
  }

  // Interactions in this region
  const regionInteractions = interactions.filter(i => i.region === regionId)
  for (const i of regionInteractions) {
    const tx = i.tileX >= 0 && i.tileX < w ? i.tileX : Math.floor(w / 2)
    const ty = i.tileY >= 0 && i.tileY < h ? i.tileY : Math.floor(h / 2)
    npcObjects.push(makeNpcObject(objId++, i.id, tx, ty))
    usedSpots.add(`${tx},${ty}`)
  }

  // Azure terminal for fast-travel regions
  if (region.hasFastTravel) {
    const spot = findNpcSpot(w, h, occupied, usedSpots, openings, rng)
    npcObjects.push(makeNpcObject(objId++, 'azure_terminal', spot.tileX, spot.tileY))
  }

  const npcLayer = makeObjectGroup(3, 'NPCs', npcObjects)
  const collisionLayer = generateCollision(w, h, connections, occupied)

  const layers = [groundLayer, objectsLayer, npcLayer, overlayLayer, collisionLayer]
  let nextLayerId = 6

  // Transitions layer
  const transitionObjects = []
  let transObjId = 100

  // Track gym_door placements so gym exit_doors can reference them
  const placedGymDoors = {}

  if (type === 'gym') {
    const exitX = Math.floor(w / 2)
    const exitY = h - 2
    // Look up the actual gym_door position in the parent map
    const parentDoorPos = gymDoorPositions[regionId]
    const spawnX = parentDoorPos ? parentDoorPos.tileX : Math.floor((SIZE[allRegions.find(r => r.id === region.parentRegion)?.type || 'main']?.w || SIZE.main.w) / 2)
    const spawnY = parentDoorPos ? parentDoorPos.tileY : Math.floor((SIZE[allRegions.find(r => r.id === region.parentRegion)?.type || 'main']?.h || SIZE.main.h) / 2)
    transitionObjects.push(
      makeTransitionObject(transObjId++, 'exit_door', region.parentRegion, spawnX, spawnY, exitX, exitY)
    )
  }

  if (type === 'main' && childGyms.length > 0) {
    for (const gym of childGyms) {
      const spot = findNpcSpot(w, h, occupied, usedSpots, openings, rng)
      const gymSize = SIZE.gym
      // Spawn player one tile above the exit_door inside the gym
      const gymSpawnX = Math.floor(gymSize.w / 2)
      const gymSpawnY = gymSize.h - 3
      transitionObjects.push(
        makeTransitionObject(transObjId++, 'gym_door', gym.id, gymSpawnX, gymSpawnY, spot.tileX, spot.tileY)
      )
      placedGymDoors[gym.id] = { tileX: spot.tileX, tileY: spot.tileY }
    }
  }

  if (transitionObjects.length > 0) {
    layers.push(makeObjectGroup(nextLayerId++, 'Transitions', transitionObjects))
  }

  const nextObjectId = Math.max(objId, transObjId)

  return {
    map: {
      compressionlevel: -1,
      height: h,
      infinite: false,
      layers,
      nextlayerid: nextLayerId,
      nextobjectid: nextObjectId,
      orientation: 'orthogonal',
      renderorder: 'right-down',
      tiledversion: '1.10.0',
      tileheight: TILE,
      tilesets: [TILESET],
      tilewidth: TILE,
      type: 'map',
      version: '1.10',
      width: w,
    },
    placedGymDoors,
  }
}

async function main() {
  const regions = await import(path.join(ROOT, 'src/data/regions.js'))
  const trainersModule = await import(path.join(ROOT, 'src/data/trainers.js'))
  const interactionsModule = await import(path.join(ROOT, 'src/data/interactions.js'))

  const allRegions = regions.getAll()
  const allTrainers = trainersModule.getAll()
  const allInteractions = interactionsModule.getAll()
  const connections = regions.REGION_CONNECTIONS

  // Index gyms by parent region
  const gymsByParent = {}
  for (const r of allRegions) {
    if (r.type === 'gym' && r.parentRegion) {
      if (!gymsByParent[r.parentRegion]) gymsByParent[r.parentRegion] = []
      gymsByParent[r.parentRegion].push(r)
    }
  }

  let generated = 0
  let skipped = 0

  // Accumulated gym_door positions from parent maps (gymId → {tileX, tileY})
  const gymDoorPositions = {}

  // Pass 1: Generate non-gym maps first (main, dungeon, hidden)
  // so we know where gym_doors land in parent maps
  for (const region of allRegions) {
    if (region.type === 'gym') continue

    const mapPath = path.join(MAPS_DIR, `${region.id}.tmj`)
    if (fs.existsSync(mapPath)) {
      console.log(`  skip  ${region.id} (hand-made map exists)`)
      skipped++
      continue
    }

    const conn = connections[region.id] || {}
    const childGyms = gymsByParent[region.id] || []
    const { map, placedGymDoors } = generateMap(region.id, region, conn, allRegions, allTrainers, allInteractions, childGyms, gymDoorPositions)

    Object.assign(gymDoorPositions, placedGymDoors)

    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n')
    console.log(`  gen   ${region.id} (${map.width}×${map.height})`)
    generated++
  }

  // Pass 2: Generate gym maps using accumulated gym_door positions
  for (const region of allRegions) {
    if (region.type !== 'gym') continue

    const mapPath = path.join(MAPS_DIR, `${region.id}.tmj`)
    if (fs.existsSync(mapPath)) {
      console.log(`  skip  ${region.id} (hand-made map exists)`)
      skipped++
      continue
    }

    const conn = connections[region.id] || {}
    const { map } = generateMap(region.id, region, conn, allRegions, allTrainers, allInteractions, [], gymDoorPositions)

    fs.writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n')
    console.log(`  gen   ${region.id} (${map.width}×${map.height})`)
    generated++
  }

  console.log(`\nDone — ${generated} generated, ${skipped} skipped`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
