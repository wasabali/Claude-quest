/**
 * scripts/compose-tech-tileset.js
 *
 * Stitches individual 48×48 PNG tiles delivered by the sprite-artist into
 * assets/tiles/kenney_tech_office.png (5 columns × 10 rows = 50 tiles).
 *
 * Usage:
 *   node scripts/compose-tech-tileset.js
 *
 * Input:  assets/tiles/sprites/tile_NNN_name.png  (48×48 RGBA PNGs)
 * Output: assets/tiles/kenney_tech_office.png      (240×480 RGBA PNG)
 *
 * Tiles NOT found in the sprites/ folder are left as the existing pixel from
 * the current kenney_tech_office.png (placeholder colour is preserved).
 *
 * Requires the `canvas` npm package for PNG compositing:
 *   npm install --save-dev canvas
 *
 * Tile ID → grid mapping:
 *   ID 1 = row 0 col 0,  ID 2 = row 0 col 1, …  ID 5 = row 0 col 4
 *   ID 6 = row 1 col 0, …
 *   (formula: row = Math.floor((id-1)/COLS), col = (id-1) % COLS)
 */

import { createCanvas, loadImage } from 'canvas'
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')
const TILES_DIR = path.join(ROOT, 'assets', 'tiles')
const OUT_PNG   = path.join(TILES_DIR, 'kenney_tech_office.png')
const SPRITE_DIR = path.join(TILES_DIR, 'sprites')

const COLS = 5
const ROWS = 10
const TILE = 48
const W    = COLS * TILE  // 240
const H    = ROWS * TILE  // 480

async function main() {
  // Load existing tileset (placeholder) as the base canvas
  const base = await loadImage(OUT_PNG)
  const canvas = createCanvas(W, H)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(base, 0, 0)

  if (!existsSync(SPRITE_DIR)) {
    console.log('No sprites/ directory found — nothing to compose.')
    console.log(`Create ${SPRITE_DIR} and place tile_NNN_name.png files there.`)
    process.exit(0)
  }

  const files = readdirSync(SPRITE_DIR).filter(f => /^tile_\d{3}_/.test(f) && f.endsWith('.png'))
  if (files.length === 0) {
    console.log('No tile_NNN_*.png files found in sprites/ — nothing to compose.')
    process.exit(0)
  }

  let replaced = 0
  for (const file of files.sort()) {
    const match = file.match(/^tile_(\d{3})_/)
    if (!match) continue
    const id  = parseInt(match[1], 10)   // 1-based
    const row = Math.floor((id - 1) / COLS)
    const col = (id - 1) % COLS

    if (id < 1 || id > COLS * ROWS) {
      console.warn(`  skip  ${file}  (ID ${id} out of range 1–${COLS * ROWS})`)
      continue
    }

    const img = await loadImage(path.join(SPRITE_DIR, file))
    if (img.width !== TILE || img.height !== TILE) {
      console.warn(`  skip  ${file}  (expected ${TILE}×${TILE}, got ${img.width}×${img.height})`)
      continue
    }

    ctx.drawImage(img, col * TILE, row * TILE)
    console.log(`  place ${file}  → row ${row} col ${col}  (GID offset ${id})`)
    replaced++
  }

  if (replaced === 0) {
    console.log('No valid tiles found to compose — output unchanged.')
    process.exit(0)
  }

  const buf = canvas.toBuffer('image/png')
  writeFileSync(OUT_PNG, buf)
  console.log(`\nComposed ${replaced} tile(s) → ${OUT_PNG}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
