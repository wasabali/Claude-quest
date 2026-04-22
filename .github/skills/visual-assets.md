# Visual Assets

Generate, specify, and manage graphics, sprites, and visual elements for Cloud Quest. Invoke when you need to add sprites, plan animations, extract PokeRogue assets, create tilesets, or maintain visual asset CREDITS files.

## When to use this skill

- Adding a new character sprite (player, trainer, NPC)
- Adding a new battle background or arena
- Creating item icons or effect animations
- Extracting an asset from PokeRogue / pokerogue-assets
- Planning a spritesheet layout or animation frame sequence
- Designing a new UI element (9-slice panel, HUD component)
- Verifying a sprite matches the pixel art style guide
- Updating CREDITS.md after adding visual assets

---

## Step 0 — Determine what kind of asset you need

| Asset type | Dimensions | Frames | Location |
|---|---|---|---|
| Player sprite | 48×48px | 16 (4 dir × 4 walk) | `assets/sprites/player/` |
| NPC / trainer sprite | 48×48px | 2–4 (idle) | `assets/sprites/trainers/` |
| Incident icon | 48×48px | 2 (pulse) | `assets/sprites/incidents/` |
| Item icon | 24×24px | 1 (static) | `assets/sprites/items/` |
| Battle portrait | 96×96px | 1 (static) | `assets/sprites/portraits/` |
| Battle effect | 48×48px | 2–4 (flash/burst) | `assets/sprites/effects/` |
| Arena background | 1920×1080px | 2 layers (_a, _b) | `assets/arenas/` |
| Overworld tileset | 48×48px tiles | 1 per tile | `assets/maps/` |
| UI panel (9-slice) | varies | 1 | `assets/ui/` |

---

## Step 1 — Check if PokeRogue has it

Before creating from scratch, check if the asset exists in [pokerogue-assets](https://github.com/pagefaultgames/pokerogue-assets):

### What you CAN take from PokeRogue (CC-BY-NC-SA-4.0)

- Arena backgrounds (`/images/arenas/`)
- UI window panels, 9-slice frames (`/images/ui/`)
- Cursor and selection indicators (`/images/ui/`)
- Health/XP bar graphics (`/images/ui/`)
- Battle stat overlays (`/images/ui/`)
- Battle transition effects

### What you CANNOT take

- Pokémon sprites or artwork (copyrighted IP)
- Trainer character sprites (may contain derivative Pokémon IP)
- Pokémon-specific UI (type badges, move categories)
- Source code (AGPL-3.0 — would force Cloud Quest to AGPL)

### Extraction steps

1. Find the asset in `pokerogue-assets` (use the `beta` branch)
2. Verify its license via the nearest `REUSE.toml` — must be CC-BY-NC-SA-4.0
3. Download and place in the correct `assets/` subfolder
4. Add to the subfolder's `CREDITS.md` (or create one following `assets/arenas/CREDITS.md`)

---

## Step 2 — Write the sprite specification

If creating a new asset, produce a specification document:

```markdown
### Sprite: [name]

- **Purpose**: What this sprite represents in the game
- **Dimensions**: [W]×[H]px per frame
- **Frame count**: [N] frames
- **Frame layout**: [cols]×[rows] in the spritesheet PNG
- **Animation**:
  - Frame 0: [description — e.g. "standing, facing down"]
  - Frame 1: [description — e.g. "left foot forward"]
  - ...
- **Palette**: [max colors] colors, [describe dominant colors]
- **Style notes**: [any specific requirements — dark outline, transparency, etc.]
- **File path**: `assets/sprites/[category]/[name].png`
```

### Style rules (non-negotiable)

- PNG only, transparent background, lossless
- Dark 1px outlines on character sprites
- 16–32 colors max per sprite
- No sub-pixel detail — every pixel must be intentional
- No smooth gradients — use dithering if shading is needed
- GameBoy Color aesthetic — saturated but not neon

---

## Step 3 — Define the Phaser loader call

Every new sprite needs a corresponding `this.load.spritesheet()` or `this.load.image()` in `BootScene.js`:

```js
// Spritesheet (animated)
this.load.spritesheet('sprite_key', 'assets/sprites/category/name.png', {
  frameWidth: 48,
  frameHeight: 48,
})

// Static image
this.load.image('image_key', 'assets/sprites/category/name.png')
```

Read `src/scenes/BootScene.js` before adding new entries. Append to the existing `preload()` method.

---

## Step 4 — Define animations (if animated)

Add animation definitions in `BootScene.js` or the scene that uses the sprite:

```js
this.anims.create({
  key: 'trainer_idle',
  frames: this.anims.generateFrameNumbers('trainer_sprite', { start: 0, end: 1 }),
  frameRate: 2,    // 2 FPS — GameBoy style
  repeat: -1,      // loop forever
})
```

### Frame rate guide

| Animation type | FPS | Frames |
|---|---|---|
| Idle bob/blink | 2 | 2 |
| Walk cycle | 4 | 4 |
| Attack | 6 | 2–3 |
| Effect flash | 8 | 2–4 |
| Damage shake | 8 | 2 (offset ±2px) |

---

## Step 5 — Update CREDITS.md

If the asset came from PokeRogue or any external source:

1. Open or create `CREDITS.md` in the asset's directory
2. Follow the format in `assets/arenas/CREDITS.md`:

```markdown
# [Category] Asset Credits

## PokeRogue (CC-BY-NC-SA-4.0)

[Description] adapted from [PokeRogue](https://github.com/pagefaultgames/pokerogue)
by [pagefaultgames](https://github.com/pagefaultgames).

Source: https://github.com/pagefaultgames/pokerogue-assets (`/path/`)

### Assets used

| Asset | Used for |
|-------|---------|
| `asset_name` | What it's used for in Cloud Quest |

### License

These assets are licensed under [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).

- **Attribution** — Credit PokeRogue / pagefaultgames
- **Non-commercial** — Cloud Quest must remain non-commercial
- **Share-alike** — Derived assets must use the same license
```

---

## Step 6 — Verify

After adding any visual asset:

- [ ] File is PNG, lossless, transparent background
- [ ] Dimensions match the spec (48×48, 24×24, 96×96, or 1920×1080)
- [ ] Frame count and layout are correct in the spritesheet
- [ ] `BootScene.js` has the loader call
- [ ] Animation definitions exist (if animated)
- [ ] CREDITS.md updated (if from external source)
- [ ] No Pokémon IP in any asset
- [ ] Colors match the limited palette style (16–32 colors)
- [ ] Dark outlines present on character sprites
- [ ] No smooth gradients or sub-pixel detail

---

## Arena Mapping Reference

Current PokeRogue → Cloud Quest arena mapping:

| Cloud Quest region | PokeRogue arena | Vibe |
|---|---|---|
| Localhost Town | `plains` | Friendly, beginner |
| Pipeline Pass | `construction` | CI/CD, building |
| Jira Dungeon | `cave` | Dark, process-heavy |
| Production Plains | `factory` | Mid-game, serious |
| Kubernetes Colosseum | `stadium` | Battle arena |
| 3am Tavern | `abyss` | Hidden, cursed |
| Server Graveyard | `ruins` | Deprecated infrastructure |
| node_modules Maze | `forest` | Dense, confusing |
| /dev/null Void | `space` | Void, emptiness |
| Deprecated Azure Region | `wasteland` | Abandoned, dusty |

To add a new region, pick an unmapped PokeRogue arena from the `pokerogue-assets` `/images/arenas/` directory.
