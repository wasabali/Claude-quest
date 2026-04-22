/**
 * scripts/upscale-assets.js
 *
 * Batch 3× nearest-neighbor upscale for Ninja Adventure assets (16→48px).
 *
 * Ninja Adventure uses 16×16px tiles. Cloud Quest uses CONFIG.TILE_SIZE = 48px.
 * 16 × 3 = 48 — clean integer scale, zero fractional artifacts.
 *
 * Requires ImageMagick 6 (`convert`) or ImageMagick 7 (`magick`) to be installed.
 *
 * Usage:
 *   node scripts/upscale-assets.js --input <path> --output <path> [--scale 3]
 *
 * Example — upscale the full Ninja Adventure pack into the assets folder:
 *   node scripts/upscale-assets.js \
 *     --input /tmp/NinjaAdventure \
 *     --output assets/ninja-adventure-upscaled
 *
 * The output directory tree mirrors the input tree.
 * Only .png files are processed; all other files are copied verbatim.
 * Existing output files are skipped unless --force is passed.
 *
 * Exit codes:
 *   0  — success
 *   1  — ImageMagick not found or fatal error
 */

import { execSync }              from 'node:child_process'
import { fileURLToPath }         from 'node:url'
import path                      from 'node:path'
import fs                        from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT      = path.resolve(__dirname, '..')

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { input: null, output: null, scale: 3, force: false }
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input'  && argv[i + 1]) { args.input  = argv[++i]; continue }
    if (argv[i] === '--output' && argv[i + 1]) { args.output = argv[++i]; continue }
    if (argv[i] === '--scale'  && argv[i + 1]) { args.scale  = Number(argv[++i]); continue }
    if (argv[i] === '--force') { args.force = true; continue }
  }
  return args
}

const args = parseArgs(process.argv)

if (!args.input || !args.output) {
  console.error('Usage: node scripts/upscale-assets.js --input <src> --output <dest> [--scale 3] [--force]')
  process.exit(1)
}

const INPUT  = path.resolve(ROOT, args.input)
const OUTPUT = path.resolve(ROOT, args.output)
const SCALE  = args.scale

if (!fs.existsSync(INPUT)) {
  console.error(`Input directory not found: ${INPUT}`)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Detect ImageMagick
// ---------------------------------------------------------------------------

function detectImageMagick() {
  // Prefer ImageMagick 7 (`magick`), fall back to ImageMagick 6 (`convert`).
  for (const cmd of ['magick', 'convert']) {
    try {
      execSync(`${cmd} --version`, { stdio: 'pipe' })
      return cmd
    } catch {
      // not available, try next
    }
  }
  return null
}

const MAGICK = detectImageMagick()
if (!MAGICK) {
  console.error(
    'ImageMagick not found.\n' +
    '  Install on Ubuntu/Debian: sudo apt install imagemagick\n' +
    '  Install on macOS:          brew install imagemagick\n' +
    '  Install on Windows:        https://imagemagick.org/script/download.php#windows'
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// Walk + process
// ---------------------------------------------------------------------------

let processed = 0
let skipped   = 0
let copied    = 0
let errors    = 0

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const srcPath = path.join(dir, entry.name)
    const relPath = path.relative(INPUT, srcPath)
    const dstPath = path.join(OUTPUT, relPath)

    if (entry.isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true })
      walk(srcPath)
      continue
    }

    if (!entry.isFile()) continue

    const ext = path.extname(entry.name).toLowerCase()

    if (ext === '.png') {
      upscalePng(srcPath, dstPath, relPath)
    } else {
      copyFile(srcPath, dstPath, relPath)
    }
  }
}

function upscalePng(src, dst, rel) {
  if (!args.force && fs.existsSync(dst)) {
    console.log(`  skip  ${rel}`)
    skipped++
    return
  }

  fs.mkdirSync(path.dirname(dst), { recursive: true })

  try {
    // -filter Point        — nearest-neighbor resampling
    // -resize ${SCALE*100}%  — scale by SCALE×
    // +profile '*'         — strip colour profiles to keep file size small
    execSync(
      `${MAGICK} "${src}" -filter Point -resize ${SCALE * 100}% +profile '*' "${dst}"`,
      { stdio: 'pipe' }
    )
    console.log(`  up${SCALE}×  ${rel}`)
    processed++
  } catch (err) {
    console.error(`  ERROR ${rel}: ${err.stderr?.toString().trim() ?? err.message}`)
    errors++
  }
}

function copyFile(src, dst, rel) {
  if (!args.force && fs.existsSync(dst)) {
    skipped++
    return
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true })
  fs.copyFileSync(src, dst)
  console.log(`  copy  ${rel}`)
  copied++
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log(`Upscaling Ninja Adventure assets ${SCALE}× (${16 * SCALE}px output)`)
console.log(`  Input:  ${INPUT}`)
console.log(`  Output: ${OUTPUT}`)
console.log(`  Tool:   ${MAGICK}`)
console.log()

fs.mkdirSync(OUTPUT, { recursive: true })
walk(INPUT)

console.log()
console.log(`Done — ${processed} upscaled, ${copied} copied, ${skipped} skipped, ${errors} errors`)

if (errors > 0) process.exit(1)
