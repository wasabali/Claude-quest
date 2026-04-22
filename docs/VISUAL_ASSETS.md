# Visual Assets Guide

How Cloud Quest sources, creates, and manages graphics, sprites, and visual elements.

---

## PokeRogue Asset Usage

Cloud Quest uses visual assets from the [PokeRogue](https://github.com/pagefaultgames/pokerogue) and [pokerogue-assets](https://github.com/pagefaultgames/pokerogue-assets) repositories under their respective licenses.

### What we can use

| Asset category | Source repo | License | Notes |
|---|---|---|---|
| Battle arena backgrounds | `pokerogue-assets` `/images/arenas/` | CC-BY-NC-SA-4.0 | Parallax layers (`_a`, `_b`) per arena |
| UI window panels (9-slice) | `pokerogue-assets` `/images/ui/` | CC-BY-NC-SA-4.0 | Dialog boxes, menu frames, HUD overlays |
| Cursor / selection indicators | `pokerogue-assets` `/images/ui/` | CC-BY-NC-SA-4.0 | Menu navigation cursors |
| Health/XP bar components | `pokerogue-assets` `/images/ui/` | CC-BY-NC-SA-4.0 | HP bar, XP bar, stat overlays |
| Battle stat overlays | `pokerogue-assets` `/images/ui/` | CC-BY-NC-SA-4.0 | Stat change indicators |
| Battle transition effects | `pokerogue-assets` `/images/` | CC-BY-NC-SA-4.0 | Screen wipes, flash effects |

### What we CANNOT use

| Asset category | Reason |
|---|---|
| Pokémon sprites / artwork | Copyrighted by The Pokémon Company / Nintendo — not covered by PokeRogue's license |
| Trainer character sprites | May contain derivative Pokémon IP |
| Pokémon-specific UI (type badges, move categories) | Derivative of Pokémon game design IP |
| Sound effects / music | Check individual file licenses via REUSE tooling — many have separate rights |
| Source code (TypeScript) | Licensed AGPL-3.0 — using code would require Cloud Quest to be AGPL |

### License obligations (CC-BY-NC-SA-4.0)

1. **Attribution** — Credit PokeRogue / pagefaultgames in CREDITS.md files and in the game footer
2. **Non-commercial** — Cloud Quest must remain non-commercial
3. **Share-alike** — Any derived visual assets must use CC-BY-NC-SA-4.0

### How to add a new PokeRogue asset

1. Identify the asset in `pokerogue-assets` (beta branch)
2. Check its license via `reuse spdx` or the nearest `REUSE.toml` — confirm it's CC-BY-NC-SA-4.0
3. Download and place in the appropriate `assets/` subfolder
4. Add an entry to the subfolder's `CREDITS.md` file
5. If creating a new subfolder, create a new `CREDITS.md` following the pattern in `assets/arenas/CREDITS.md`

---

## Asset Categories for Cloud Quest

### Arena backgrounds (`assets/arenas/`)

Parallax battle backgrounds mapped from PokeRogue arenas to Cloud Quest regions. See `assets/arenas/CREDITS.md` for the full mapping.

### UI chrome (`assets/ui/`)

9-slice window panels, cursors, bars, and overlays. See `assets/ui/CREDITS.md`.

### Sprites (`assets/sprites/`)

**These are NOT from PokeRogue.** Cloud Quest sprites are original or generated:

| Sprite | Description | Style |
|---|---|---|
| Player character | Junior → Principal engineer progression | 48×48px, 4 directional walk frames |
| NPC trainers | Engineers, managers, POs, scrum masters | 48×48px, 2–4 frame idle |
| Incident icons | Visual representation of incidents | 48×48px, 2-frame pulse animation |
| Items | Inventory item icons | 24×24px, static |
| Overworld tiles | Tiled-compatible tileset | 48×48px tiles |

### Maps (`assets/maps/`)

Tiled `.tmj` exports for overworld regions. Authored in Tiled Map Editor.

### Audio (`assets/audio/`)

BGM tracks with loop points defined in `bgm-loop-points.json`.

---

## Sprite Style Guide

All original Cloud Quest sprites must follow these rules:

### Resolution and dimensions

- **Tile size**: 48×48px (defined in `src/config.js` as `CONFIG.TILE_SIZE`)
- **Player sprite**: 48×48px spritesheet, 4 directions × 4 walk frames = 16 frames
- **NPC sprites**: 48×48px, minimum 2-frame idle animation
- **Item icons**: 24×24px, static (no animation)
- **Battle portraits**: 96×96px, static

### Color palette

- Use a limited palette (16–32 colors max per sprite)
- Match the GameBoy Color aesthetic — saturated but not neon
- Dark outlines (1px, near-black) on all character sprites
- Transparent backgrounds (PNG with alpha)

### Animation rules

- **2–4 frames only** — no smooth tweening
- Walk cycles: 4 frames (stand → step-left → stand → step-right)
- Idle animations: 2 frames (slight bob or blink)
- Attack animations: 2–3 frames (wind-up → strike → return)
- No sub-pixel movement — all positions snap to integer coordinates

### File naming

```
assets/sprites/{category}/{name}.png
```

Categories: `player/`, `trainers/`, `incidents/`, `items/`, `effects/`, `overworld/`

Spritesheets use a single PNG with uniform frame dimensions. Frame layout is defined in the Phaser `this.load.spritesheet()` call.

### File format

- PNG only (never JPEG, GIF, or SVG)
- No compression artifacts — use lossless PNG
- Transparent background for all sprites
- No embedded ICC profiles

---

## Generating New Visual Assets

When Cloud Quest needs new sprites, backgrounds, or visual elements, use the `visual-assets` skill or `sprite-artist` agent.

### What the agent can help with

1. **Sprite specification** — Define exact dimensions, frame count, palette, and animation frames for a new sprite
2. **Asset pipeline** — Convert raw artwork into game-ready spritesheets with correct dimensions
3. **Tileset authoring** — Specification for Tiled-compatible tilesets
4. **UI component design** — Specify new 9-slice panels, HUD elements, or menu components
5. **Animation frame planning** — Define frame sequences for character and effect animations
6. **PokeRogue asset extraction** — Identify and extract licensed assets from PokeRogue repos
7. **CREDITS.md maintenance** — Keep attribution files accurate when adding assets
8. **Style compliance** — Verify sprites match the pixel art style guide

### What the agent cannot do

- Generate actual pixel art (it produces specifications, not images)
- Create Pokémon-derived content
- Use assets from unlicensed sources
