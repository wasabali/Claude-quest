/**
 * generate-tilesets.js
 *
 * Generates 48×48px tileset PNG images and matching Tiled .tsx files for the
 * four Cloud Quest tile categories (village, dungeon, nature, interior).
 *
 * Usage:
 *   node scripts/generate-tilesets.js
 *
 * Output:
 *   assets/maps/tilesets/{village,dungeon,nature,interior}.{png,tsx}
 *
 * Design
 * ------
 * Each tileset is an 8-column × 4-row sprite sheet (32 tiles, 384×192px).
 * Tiles are 48×48px to match the game's TILE_SIZE constant.
 *
 * When real Ninja Adventure assets are available (CC0, pixel-boy/ninja-adventure
 * on GitHub), drop the upscaled PNGs into assets/maps/tilesets/ and the same .tsx
 * files will reference them automatically — no code changes required.
 *
 * PNG encoding is done with Node's built-in zlib; no extra dependencies.
 */

import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import zlib from 'node:zlib'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const TILESETS_DIR = path.join(ROOT, 'assets', 'maps', 'tilesets')

const TILE = 48
const COLS = 8
const ROWS = 4

// ---------------------------------------------------------------------------
// Minimal PNG encoder (RGB, no alpha) — no external dependencies
// ---------------------------------------------------------------------------

const CRC32_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC32_TABLE[(c ^ buf[i]) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const crcInput = Buffer.allocUnsafe(typeBuf.length + data.length)
  typeBuf.copy(crcInput)
  data.copy(crcInput, typeBuf.length)

  const out = Buffer.allocUnsafe(4 + typeBuf.length + data.length + 4)
  out.writeUInt32BE(data.length, 0)
  typeBuf.copy(out, 4)
  data.copy(out, 8)
  out.writeUInt32BE(crc32(crcInput), 8 + data.length)
  return out
}

function encodePng(width, height, pixels) {
  // pixels: Buffer of RGB triples, width*height*3 bytes, top-to-bottom
  const PNG_SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8; ihdr[9] = 2 // 8-bit RGB

  const rowBytes = width * 3
  const raw = Buffer.alloc(height * (rowBytes + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (rowBytes + 1)] = 0 // filter: None
    pixels.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes)
  }
  const idat = zlib.deflateSync(raw)

  return Buffer.concat([
    PNG_SIG,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------------------------------------------------------------------------
// Tile painter — fills a 48×48 tile with base color + subtle pixel detail
// ---------------------------------------------------------------------------

function paintTile(pixels, tileX, tileY, width, r, g, b, style = 'flat') {
  const px = tileX * TILE
  const py = tileY * TILE

  for (let dy = 0; dy < TILE; dy++) {
    for (let dx = 0; dx < TILE; dx++) {
      const x = px + dx
      const y = py + dy
      const off = (y * width + x) * 3

      let pr = r, pg = g, pb = b

      if (style === 'flat') {
        // Thin dark border around each tile
        if (dx === 0 || dy === 0 || dx === TILE - 1 || dy === TILE - 1) {
          pr = Math.max(0, r - 30); pg = Math.max(0, g - 30); pb = Math.max(0, b - 30)
        }
      } else if (style === 'stone') {
        // Rough stone texture: dark cracks on a grid
        const gx = dx % 12, gy = dy % 8
        if ((gx === 0 || gy === 0) && (dx !== 0 && dy !== 0 && dx !== TILE - 1 && dy !== TILE - 1)) {
          pr = Math.max(0, r - 25); pg = Math.max(0, g - 25); pb = Math.max(0, b - 25)
        } else if (dx === 0 || dy === 0 || dx === TILE - 1 || dy === TILE - 1) {
          pr = Math.max(0, r - 30); pg = Math.max(0, g - 30); pb = Math.max(0, b - 30)
        }
      } else if (style === 'wood') {
        // Horizontal plank lines
        const line = dy % 10
        if (line === 0) {
          pr = Math.max(0, r - 20); pg = Math.max(0, g - 20); pb = Math.max(0, b - 20)
        } else if (line === 1) {
          pr = Math.min(255, r + 15); pg = Math.min(255, g + 15); pb = Math.min(255, b + 15)
        }
        if (dx === 0 || dy === 0 || dx === TILE - 1 || dy === TILE - 1) {
          pr = Math.max(0, r - 35); pg = Math.max(0, g - 35); pb = Math.max(0, b - 35)
        }
      } else if (style === 'grass') {
        // Subtle noise for grass patches
        const noise = ((dx * 7 + dy * 13) % 5) - 2
        pr = Math.max(0, Math.min(255, r + noise))
        pg = Math.max(0, Math.min(255, g + noise * 2))
        pb = Math.max(0, Math.min(255, b))
        if (dx === 0 || dy === 0 || dx === TILE - 1 || dy === TILE - 1) {
          pr = Math.max(0, pr - 20); pg = Math.max(0, pg - 20); pb = Math.max(0, pb - 20)
        }
      } else if (style === 'water') {
        // Diagonal wave ripples
        const wave = ((dx + dy) % 8)
        if (wave < 2) {
          pr = Math.min(255, r + 20); pg = Math.min(255, g + 20); pb = Math.min(255, b + 20)
        } else if (wave > 6) {
          pr = Math.max(0, r - 15); pg = Math.max(0, g - 15); pb = Math.max(0, b - 15)
        }
      } else if (style === 'cross') {
        // Crosshatch pattern for decorative tiles
        if ((dx % 12 === 0) || (dy % 12 === 0)) {
          pr = Math.max(0, r - 20); pg = Math.max(0, g - 20); pb = Math.max(0, b - 20)
        } else if (dx === 0 || dy === 0 || dx === TILE - 1 || dy === TILE - 1) {
          pr = Math.max(0, r - 30); pg = Math.max(0, g - 30); pb = Math.max(0, b - 30)
        }
      }

      pixels[off] = pr; pixels[off + 1] = pg; pixels[off + 2] = pb
    }
  }
}

function generatePng(name, tileRows) {
  // tileRows: array of 4 arrays, each with 8 { r, g, b, style } entries
  const width  = COLS * TILE
  const height = ROWS * TILE
  const pixels = Buffer.alloc(width * height * 3, 0)

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const t = tileRows[row][col]
      paintTile(pixels, col, row, width, t.r, t.g, t.b, t.style || 'flat')
    }
  }

  const png = encodePng(width, height, pixels)
  fs.writeFileSync(path.join(TILESETS_DIR, `${name}.png`), png)
  console.log(`  wrote  ${name}.png (${COLS}×${ROWS} tiles, ${width}×${height}px)`)
}

// ---------------------------------------------------------------------------
// Tileset definitions
// Each row = 8 tiles.  Columns: 0-7 left to right.
// ---------------------------------------------------------------------------

// Shorthand for a tile color entry used in TILESETS definitions below.
const tile = (r, g, b, style = 'flat') => ({ r, g, b, style })

const TILESETS = {
  // ------------------------------------------------------------------
  // VILLAGE  (used for localhost_town, azure_town)
  // Row 0: ground/path tiles     (walkable)
  // Row 1: wall/structure tiles  (solid)
  // Row 2: object/decor tiles    (mixed)
  // Row 3: transition/misc tiles (mixed)
  // ------------------------------------------------------------------
  village: [
    // row 0 — ground
    [ tile(74,124, 62,'grass'),  tile(58,100, 48,'grass'),  tile(180,150,100,'cross'), tile(150,140,130,'stone'),
      tile(140,100, 60,'flat'),  tile(100,180,220,'water'), tile( 40,100,160,'water'), tile(220,200,140,'flat')  ],
    // row 1 — walls (all solid)
    [ tile(100,100,110,'stone'), tile(120, 90, 60,'wood'),  tile(160, 80, 60,'stone'), tile(180,140, 80,'wood'),
      tile( 80, 60, 40,'flat'),  tile(180,200,220,'flat'),  tile(140, 60, 60,'flat'),  tile(120,110,100,'stone') ],
    // row 2 — objects
    [ tile( 80, 60, 40,'wood'),  tile( 30, 80, 40,'grass'), tile( 50,120, 50,'grass'), tile(220,120,180,'flat'),
      tile(220,180, 60,'flat'),  tile(140,110, 70,'wood'),  tile(240,220,120,'flat'),  tile(130,120,110,'stone') ],
    // row 3 — transitions/misc
    [ tile(110, 90, 70,'stone'), tile(160,120, 80,'wood'),  tile(150,140,130,'stone'), tile( 60, 50, 40,'flat'),
      tile(120,110,100,'stone'), tile(200,180,140,'cross'), tile(160,200,140,'grass'), tile(180,160,200,'flat')  ],
  ],

  // ------------------------------------------------------------------
  // DUNGEON  (jira_dungeon floors/walls)
  // ------------------------------------------------------------------
  dungeon: [
    // row 0 — floor types
    [ tile( 50, 45, 60,'stone'), tile( 40, 38, 52,'stone'), tile( 60, 55, 70,'stone'), tile( 30, 28, 40,'flat'),
      tile( 70, 65, 80,'cross'), tile( 45, 40, 55,'stone'), tile( 80, 75, 90,'stone'), tile( 35, 32, 45,'flat')  ],
    // row 1 — walls/pillars (solid)
    [ tile( 25, 22, 35,'stone'), tile( 20, 18, 30,'stone'), tile( 35, 30, 45,'stone'), tile( 15, 12, 25,'flat'),
      tile( 40, 35, 50,'stone'), tile( 60, 55, 70,'stone'), tile( 30, 25, 40,'flat'),  tile( 50, 45, 60,'stone') ],
    // row 2 — hazards/items
    [ tile(180, 40, 40,'flat'),  tile(200, 60, 20,'flat'),  tile(100, 80,150,'flat'),  tile( 60,180, 60,'flat'),
      tile(220,180, 40,'flat'),  tile(140, 40,140,'flat'),  tile(200,200, 60,'flat'),  tile( 60,140,200,'flat')  ],
    // row 3 — doors/transitions
    [ tile( 90, 70, 50,'wood'),  tile( 80, 60, 40,'wood'),  tile(120,100, 70,'wood'),  tile( 60, 45, 30,'flat'),
      tile(140,120, 90,'stone'), tile( 70, 65, 80,'flat'),  tile( 50, 48, 60,'flat'),  tile(100, 95,110,'stone') ],
  ],

  // ------------------------------------------------------------------
  // NATURE  (node_modules_maze, forest paths)
  // ------------------------------------------------------------------
  nature: [
    // row 0 — ground variants
    [ tile( 58,100, 48,'grass'), tile( 74,124, 62,'grass'), tile( 90,148, 76,'grass'), tile(140,100, 60,'flat'),
      tile(120, 80, 40,'flat'),  tile(180,150,100,'flat'),  tile(100,180,220,'water'), tile( 40,100,160,'water') ],
    // row 1 — trees/plants (solid)
    [ tile( 30, 80, 40,'grass'), tile( 20, 60, 30,'grass'), tile( 40,100, 50,'grass'), tile( 50,120, 50,'grass'),
      tile( 80, 60, 40,'wood'),  tile( 60, 45, 30,'wood'),  tile(100, 75, 50,'wood'),  tile( 70, 55, 35,'wood')  ],
    // row 2 — water/mud
    [ tile(100,180,220,'water'), tile( 80,160,200,'water'), tile( 60,140,180,'water'), tile( 40,120,160,'water'),
      tile(120,100, 70,'flat'),  tile(100, 80, 55,'flat'),  tile(140,115, 80,'flat'),  tile( 90, 70, 48,'flat')  ],
    // row 3 — rocks/cliffs (mixed solid)
    [ tile(110, 90, 70,'stone'), tile(130,110, 85,'stone'), tile( 90, 75, 55,'stone'), tile(150,130,105,'stone'),
      tile(180,160,130,'flat'),  tile(200,180,150,'flat'),  tile(160,145,115,'flat'),  tile(210,195,165,'cross') ],
  ],

  // ------------------------------------------------------------------
  // INTERIOR  (three_am_tavern, shops, buildings)
  // ------------------------------------------------------------------
  interior: [
    // row 0 — floor types
    [ tile(180,155,120,'wood'),  tile(160,135,100,'wood'),  tile(140,115, 80,'wood'),  tile(200,175,140,'cross'),
      tile(150,140,130,'stone'), tile(130,120,110,'stone'), tile(170,160,150,'stone'), tile(110,100, 90,'flat')  ],
    // row 1 — walls/furniture (solid)
    [ tile(120, 90, 60,'wood'),  tile(100, 75, 48,'wood'),  tile(140,105, 70,'wood'),  tile( 80, 60, 40,'stone'),
      tile(160,140,120,'flat'),  tile(140,120,100,'flat'),  tile(180,160,140,'flat'),  tile(120,100, 80,'flat')  ],
    // row 2 — items/decor
    [ tile(220,180, 60,'flat'),  tile(180,200,220,'flat'),  tile(200,100, 60,'flat'),  tile(100,180,120,'flat'),
      tile(240,220,180,'flat'),  tile(180,160,200,'flat'),  tile(200,220,180,'flat'),  tile(160,140, 80,'flat')  ],
    // row 3 — doors/windows
    [ tile( 80, 60, 40,'wood'),  tile(100, 75, 48,'wood'),  tile(180,200,220,'flat'),  tile(160,180,200,'flat'),
      tile( 60, 50, 40,'flat'),  tile( 90, 70, 50,'flat'),  tile(200,195,180,'flat'),  tile(170,165,150,'flat')  ],
  ],
}

// ---------------------------------------------------------------------------
// Solid tile IDs per tileset (zero-indexed)
// These become collision properties in the .tsx files.
// ---------------------------------------------------------------------------

const SOLID_TILES = {
  village: [
    // row 1: wall_stone, wall_wood, wall_brick, fence, window, corner (skip door=4, roof=6)
    8, 9, 10, 11, 13, 15,
    // row 2: tree_trunk, bush, well
    16, 18, 23,
    // row 3: cliff, gate, ruins
    24, 27, 28,
    // row 0: water_deep
    6,
  ],
  dungeon: [
    // row 1: all wall/pillar tiles
    8, 9, 10, 11, 12, 13, 14, 15,
    // row 2: spikes, void
    24, 25,
  ],
  nature: [
    // row 1: trees (all 8)
    8, 9, 10, 11, 12, 13, 14, 15,
    // row 3: rocks/cliffs
    24, 25, 26, 27,
    // row 0: deep water
    6, 7,
  ],
  interior: [
    // row 1: walls/furniture
    8, 9, 10, 11,
    // row 3: door frames, closed doors
    24, 25,
  ],
}

// ---------------------------------------------------------------------------
// TSX generator — Tiled tileset XML format
// ---------------------------------------------------------------------------

// Terrain (Wang set) definition for village — demonstrates autotile setup
function villageWangSets() {
  return `
  <wangsets>
   <wangset name="Grass" type="corner" tile="0">
    <wangcolor name="Grass" color="#4a7c3e" tile="0" probability="1"/>
    <wangcolor name="Path"  color="#b49664" tile="2" probability="0.3"/>
    <wangtile tileid="0" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="1" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="2" wangid="0,2,0,2,0,2,0,2"/>
    <wangtile tileid="3" wangid="0,2,0,2,0,2,0,2"/>
   </wangset>
   <wangset name="Water" type="corner" tile="5">
    <wangcolor name="Shallow" color="#64b4dc" tile="5" probability="1"/>
    <wangcolor name="Deep"    color="#2864a0" tile="6" probability="0.5"/>
    <wangtile tileid="5" wangid="0,1,0,1,0,1,0,1"/>
    <wangtile tileid="6" wangid="0,2,0,2,0,2,0,2"/>
   </wangset>
  </wangsets>`
}

function tileProperties(name, solidIds) {
  const lines = []
  for (const id of solidIds) {
    lines.push(`  <tile id="${id}">`)
    lines.push(`   <properties>`)
    lines.push(`    <property name="solid" type="bool" value="true"/>`)
    lines.push(`   </properties>`)
    lines.push(`   <objectgroup draworder="index" id="2">`)
    lines.push(`    <object id="1" x="0" y="0" width="${TILE}" height="${TILE}"/>`)
    lines.push(`   </objectgroup>`)
    lines.push(`  </tile>`)
  }
  return lines.join('\n')
}

function generateTsx(name, solidIds) {
  const width  = COLS * TILE
  const height = ROWS * TILE
  const wangXml = name === 'village' ? villageWangSets() : ''

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<tileset version="1.10" tiledversion="1.10.0" name="${name}"`,
    `         tilewidth="${TILE}" tileheight="${TILE}"`,
    `         tilecount="${COLS * ROWS}" columns="${COLS}">`,
    ` <image source="${name}.png" width="${width}" height="${height}"/>`,
    tileProperties(name, solidIds),
    wangXml,
    `</tileset>`,
  ].join('\n')

  fs.writeFileSync(path.join(TILESETS_DIR, `${name}.tsx`), xml + '\n')
  console.log(`  wrote  ${name}.tsx (${COLS * ROWS} tiles, ${solidIds.length} solid)`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

fs.mkdirSync(TILESETS_DIR, { recursive: true })
console.log('Generating Cloud Quest tilesets…')
console.log(`  output → ${TILESETS_DIR}`)
console.log()

for (const [name, rows] of Object.entries(TILESETS)) {
  generatePng(name, rows)
  generateTsx(name, SOLID_TILES[name])
  console.log()
}

console.log('Done.')
