# Visual Assets

This document describes every external asset source used in Cloud Quest, how each is licensed, and how assets are mapped into the project's folder structure.

---

## Asset Strategy

Cloud Quest uses a **multi-source asset strategy**:

| Source | Role | License |
|--------|------|---------|
| **Ninja Adventure** | Primary — characters, monsters, tiles, VFX, items, UI, BGM, SFX | CC0 1.0 (Public Domain) |
| **PokeRogue** | Battle backgrounds and UI chrome | CC-BY-NC-SA-4.0 |
| **Kenney RPG Urban** | Supplemental tech/urban tiles | CC0 1.0 (Public Domain) |

---

## Ninja Adventure Asset Pack

### Overview

[Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) by **pixel-boy (AAA)** is the primary visual source for Cloud Quest. It is released under the **CC0 1.0 Universal** license — no restrictions, no attribution required — but we attribute anyway.

```
## Ninja Adventure Asset Pack
- Author:        pixel-boy (AAA)
- Source:        https://pixel-boy.itch.io/ninja-adventure-asset-pack
- License:       CC0 1.0 Universal (Public Domain Dedication)
- Usage:         Characters, monsters, world tiles, VFX, items, UI elements, BGM, SFX
- Modifications: 3× nearest-neighbor upscale from 16×16 to 48×48px
```

### What's Included

| Category | Ninja Adventure folder | Cloud Quest folder |
|----------|------------------------|-------------------|
| Player & NPC characters | `Actor/Characters/` | `assets/sprites/characters/` |
| Monster sprites | `Actor/Monsters/` | `assets/sprites/monsters/` |
| World / overworld tiles | `TileSet/` | `assets/maps/tilesets/` |
| VFX (magic, explosions) | `FX/` | `assets/sprites/vfx/` |
| Item icons | `Items/` | `assets/sprites/items/` |
| UI elements | `HUD/` | `assets/ui/` |
| Background music | `BGM/` | `assets/audio/bgm/` |
| Sound effects | `SFX/` | `assets/audio/sfx/` |

### License

CC0 1.0 Universal — these assets are dedicated to the public domain. No attribution is legally required.

We attribute anyway because it's the right thing to do.

### Integration Notes

All Ninja Adventure source sprites are **16×16px**. Cloud Quest uses a **3× nearest-neighbor upscale** to reach the 48×48px tile size. See [Asset Pipeline](#asset-pipeline) below for the upscale script.

---

## PokeRogue Assets

### Overview

Battle backgrounds and UI chrome (9-slice window panels, cursor, HP/XP bars, stat overlays) are adapted from [PokeRogue](https://github.com/pagefaultgames/pokerogue) by [pagefaultgames](https://github.com/pagefaultgames).

Source: `https://github.com/pagefaultgames/pokerogue-assets`

### License

CC-BY-NC-SA-4.0 — **this license propagates to any derived assets and restricts Cloud Quest to non-commercial use**.

- **Attribution** — Credit PokeRogue / pagefaultgames
- **Non-commercial** — Cloud Quest must remain non-commercial
- **Share-alike** — Derived assets must use the same license

### Asset Categories

#### Battle Backgrounds (`assets/arenas/`)

Each arena has `_a` and `_b` layers for parallax depth.

| Cloud Quest region | PokeRogue arena |
|--------------------|----------------|
| Localhost Town | `plains` |
| Pipeline Pass | `construction` |
| Jira Dungeon | `cave` |
| Production Plains | `factory` |
| Kubernetes Colosseum | `stadium` |
| 3am Tavern | `abyss` |
| Server Graveyard | `ruins` |
| node_modules Maze | `forest` |
| /dev/null Void | `space` |
| Deprecated Azure Region | `wasteland` |

#### UI Chrome (`assets/ui/`)

| Asset | Used for |
|-------|---------|
| `window_1` – `window_5` (normal/thin/xthin) | Dialog boxes, menu frames, battle info panels, HUD overlays |
| Cursor / selection indicator | Menu cursor in all scenes |
| Ability bars, health/exp labels | Battle HUD, HP bar, XP bar |
| Battle stat overlays | Stat change indicators in battle |

---

## Kenney RPG Urban

### Overview

[Kenney RPG Urban Pack](https://kenney.nl/assets/rpg-urban-pack) by [Kenney](https://kenney.nl) provides supplemental tiles for technology-themed environments (server rooms, data centres, office corridors).

```
## Kenney RPG Urban
- Author:  Kenney (kenney.nl)
- Source:  https://kenney.nl/assets/rpg-urban-pack
- License: CC0 1.0 Universal (Public Domain Dedication)
- Usage:   Supplemental tech/urban tiles for indoor maps
```

### Usage

Kenney tiles supplement Ninja Adventure tiles where tech-flavoured interiors are needed. They are placed in `assets/maps/tilesets/kenney/` and referenced from Tiled map files.

### License

CC0 1.0 Universal — public domain. No attribution required; credited anyway.

---

## Asset Categories

### Sprites (`assets/sprites/`)

| Subfolder | Source | Notes |
|-----------|--------|-------|
| `characters/` | Ninja Adventure | Player and NPC sprites; 3× upscaled from 16×16 |
| `monsters/` | Ninja Adventure | Enemy sprites; 3× upscaled from 16×16 |
| `items/` | Ninja Adventure | Item icons; 3× upscaled from 16×16 |
| `vfx/` | Ninja Adventure | Hit sparks, magic rings, explosions; 3× upscaled |

### Maps & Tilesets (`assets/maps/`)

| Subfolder | Source | Notes |
|-----------|--------|-------|
| `tilesets/ninja/` | Ninja Adventure | Primary overworld + dungeon tiles |
| `tilesets/kenney/` | Kenney RPG Urban | Supplemental tech/urban indoor tiles |

### UI (`assets/ui/`)

| Source | Assets |
|--------|--------|
| PokeRogue | 9-slice window panels, cursor, HP/XP/stat bars |
| Ninja Adventure | Additional HUD icons and status indicators |

### Audio (`assets/audio/`)

| Subfolder | Source | Notes |
|-----------|--------|-------|
| `bgm/` | Ninja Adventure | Background music tracks |
| `sfx/` | Ninja Adventure | Sound effects (attacks, UI, ambient) |

### Battle Backgrounds (`assets/arenas/`)

| Source | Assets |
|--------|--------|
| PokeRogue | All arena backgrounds (`_a` / `_b` parallax layers) |

---

## Sprite Style Guide

### Origin

Most character, monster, item, and VFX sprites originate from Ninja Adventure at **16×16px native resolution** and have been upscaled **3× to 48×48px** using nearest-neighbor interpolation to match Cloud Quest's tile size.

### Rules

- All sprites must be **48×48px** (or a power-of-two multiple for larger multi-tile objects).
- Use **nearest-neighbor scaling only** — no bilinear or bicubic filtering.
- No sub-pixel movement. All animations are 2–4 frame sprite flips.
- Press Start 2P is the only font; no anti-aliasing on text.
- Phaser config: no `pixelArt: true`, no `antialias: false` — rendering at full canvas resolution, not upscaling at draw time.

---

## Asset Pipeline

### 3× Upscale Script

Ninja Adventure sprites ship at 16×16px. If you need to batch-upscale a directory locally, you can save the following example Node.js snippet as a script and run it with nearest-neighbor scaling:

```js
// Example script: save as scripts/upscale.js locally if needed
// Example usage after saving this snippet locally: node scripts/upscale.js <inputDir> <outputDir>
// Requires: npm install sharp

import sharp from 'sharp'
import { readdirSync, mkdirSync } from 'fs'
import { join, extname, basename } from 'path'

const [,, inputDir, outputDir] = process.argv
mkdirSync(outputDir, { recursive: true })

for (const file of readdirSync(inputDir)) {
  if (extname(file) !== '.png') continue
  await sharp(join(inputDir, file))
    .resize({ width: null, height: null, kernel: 'nearest' })
    .resize({ factor: 3, kernel: 'nearest' })
    .toFile(join(outputDir, basename(file)))
}
```

> **Note:** Replace the double `resize` with a single call using `sharp`'s `factor` option once the API stabilises, or use ImageMagick: `magick mogrify -scale 300% *.png`.

### Folder Conventions

After upscaling, drop files into the matching Cloud Quest folder according to the [Ninja Adventure folder mapping](#whats-included).

---

## Adding New Assets

1. Prefer CC0 sources to avoid license conflicts with the existing PokeRogue CC-BY-NC-SA-4.0 assets.
2. Document the source and license in the nearest `CREDITS.md` (subfolder or root).
3. Run the upscale pipeline if the source is 16×16px.
4. Update this file with the new source entry.
