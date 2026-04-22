# Visual Assets

This document covers the art pipeline for Cloud Quest — how raw source art is
acquired, processed, and organised under `assets/`.

---

## Source Art: Ninja Adventure Asset Pack

Cloud Quest uses the free [Ninja Adventure Asset Pack](https://pixel-boy.itch.io/ninja-adventure-asset-pack)
by Pixel-Boy and AAA, released under CC0 (public domain).

Raw assets ship at **16×16 px** per tile/frame. Cloud Quest renders at
`CONFIG.TILE_SIZE = 48 px`, so every source image must be upscaled by **3×**
before use.

---

## Upscale Pipeline

The script `scripts/upscale_assets.py` performs a lossless 3× nearest-neighbor
upscale of the entire asset pack in one pass.

### Requirements

- Python 3.8+
- [Pillow](https://pypi.org/project/Pillow/) — `pip install Pillow`

### Usage

```bash
python scripts/upscale_assets.py \
    --input  ./ninja-adventure-raw/ \
    --output ./assets/ \
    --scale  3
```

| Flag | Default | Description |
|------|---------|-------------|
| `--input DIR` | *(required)* | Root directory of the raw Ninja Adventure download |
| `--output DIR` | *(required)* | Root output directory (`assets/` subfolders are created automatically) |
| `--scale N` | `3` | Integer scale factor — `3` maps 16 px → 48 px |

### What the script does

1. Walks `--input` recursively and collects every `.png` file.
2. Converts each image to **RGBA** (preserves full transparency).
3. Strips any embedded ICC profile from the source file.
4. Upscales with **`Image.NEAREST`** (nearest-neighbor) — no anti-aliasing,
   no bilinear smoothing, no compression artifacts.
5. Saves lossless PNG to a mirrored path under `--output`.
6. Prints a manifest of processed files, grouped by asset category.

### Interpolation requirement

Only nearest-neighbor scaling is permitted. Using any other algorithm
(bilinear, bicubic, Lanczos) will introduce sub-pixel blurring that destroys
the pixel-art look at 48 px.

The Pillow constant for nearest-neighbor is `Image.NEAREST` (also aliased as
`Image.NEAREST` / the integer constant `0` in older Pillow versions). The equivalent ImageMagick flag is
`-filter point`.

### Example manifest output

```
── Manifest ──────────────────────────────
  characters        42 file(s)
  effects           18 file(s)
  items             35 file(s)
  monsters          60 file(s)
  other              3 file(s)
  tiles            120 file(s)
  ui                24 file(s)
  TOTAL            302 file(s)
──────────────────────────────────────────

Done — 302 PNG(s) upscaled 3× → written to /path/to/assets
```

---

## Asset Directory Structure

After running the pipeline the `assets/` tree mirrors the Ninja Adventure pack
layout:

```
assets/
├── arenas/          # Battle background art (panoramic, already 1920×1080)
├── audio/           # BGM and SFX (not processed by this script)
├── maps/            # Tiled .tmj exports
├── sprites/
│   ├── characters/  # Player and NPC sprite sheets
│   ├── effects/     # Spell, particle, and UI effects
│   ├── items/       # Item icons
│   ├── monsters/    # Enemy sprite sheets
│   ├── tiles/       # World tiles and tilesets
│   └── ui/          # HUD panels, cursors, button frames
└── ui/              # Full-screen UI backgrounds
```

---

## Spritesheets

The upscale pipeline scales the **entire sheet image** without any knowledge of
the frame grid. Because `16 × 3 = 48` is an exact integer multiple, every
frame boundary aligns perfectly after upscaling — no sub-pixel drift, no torn
frames.

Phaser is configured to load sheets with `frameWidth: 48, frameHeight: 48`
(or multiples thereof for larger frames). Never hardcode 16 px frame sizes in
scene or engine code.

---

## Alternative: ImageMagick one-liner

For a quick ad-hoc conversion of a single directory:

```bash
for f in *.png; do
  convert "$f" -filter point -resize 300% "out/$f"
done
```

The `-filter point` flag selects nearest-neighbor. This is equivalent to the
Python script for single-directory runs but does not handle subdirectories,
category manifests, or automatic ICC profile stripping.

---

## ICC Profiles

Some Ninja Adventure PNGs ship with embedded sRGB ICC profiles. Pillow emits
a warning for these and some renderers apply unintended colour correction.
The upscale script strips ICC profiles automatically — output PNGs are
profile-free.

If you process files with ImageMagick and want to strip profiles:

```bash
convert input.png -strip output.png
```

---

## Re-running the Pipeline

The script is idempotent — re-running it overwrites existing output files with
freshly upscaled copies. Output files are never merged or appended.

If the Ninja Adventure pack is updated, delete the relevant subdirectories
under `assets/sprites/` and re-run the script.
