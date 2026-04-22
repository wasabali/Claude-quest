# Visual Assets Specification

Cloud Quest uses a pixel-art style based on the [Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) asset pack.
All sprites are scaled 3× from their source resolution for consistent clarity at 1920×1080.

---

## Source Resolution

| Source | Native size | In-game size | Scale |
|---|---|---|---|
| Ninja Adventure tiles | 16×16px | 48×48px | 3× |
| Ninja Adventure characters | 16×16px | 48×48px | 3× |
| Ninja Adventure facesets | 16×16px | 48×48px | 3× |
| PokeRogue battle backgrounds | native | native | 1× |
| PokeRogue UI chrome | native | native | 1× |

---

## Canvas & Tile Grid

- **Canvas:** 1920×1080px, `Phaser.Scale.FIT` — fills browser, preserves aspect ratio
- **Tile size:** 48×48px
- **Viewport:** 40 tiles wide × ~22 tiles tall

---

## Character Sprites

Character walk cycles are 3-frame animations (idle, step-left, step-right).

| Sprite type | Size | Animation frames |
|---|---|---|
| Player character | 48×48px | 3 frames (idle + 2 walk) |
| Trainer NPC | 48×48px | 3 frames (idle + 2 walk) |
| Overworld enemy | 48×48px | 2 frames (idle blink) |

Walk animation: swap between step frames at 8 fps. No sub-pixel movement.

---

## Battle Sprites

Battle sprites face the player from the right side of the screen.

| Sprite type | Size | Notes |
|---|---|---|
| Player back sprite | 48×48px | Back-facing, standing |
| Trainer front sprite | 48×48px | Front-facing, standing |
| Incident sprite | 48×48px | Symbolic icon for the incident type |

### Battle Portraits

Small static portraits shown next to HP bars during battle.

| Portrait type | Size | Source |
|---|---|---|
| Player portrait | 48×48px | Ninja Adventure faceset, 3× upscale |
| Trainer portrait | 48×48px | Ninja Adventure faceset, 3× upscale |

**Why 48×48px:** Ninja Adventure facesets are 16×16px native. A 3× upscale gives 48×48px, which matches
the tile grid and all other in-game sprites. A 6× upscale (96×96px) would make each source pixel a 6×6 block
and look too blocky at the game's resolution.

---

## Tile Sets

All tile sets use 48×48px tiles on a single-row sprite sheet.

| Tile set | Purpose | Sheet dimensions |
|---|---|---|
| `stub_tiles.png` | Dev placeholder (5 tiles) | 240×48px |
| *(production tiles TBD)* | Overworld terrain | TBD |

---

## UI Elements

| Element | Size | Notes |
|---|---|---|
| 9-slice panel corners | 8×8px | Scaled up via Phaser 9-slice |
| Dialog box | 640×80px | 2 lines of text, Press Start 2P |
| HP/Budget bars | variable×4px | Drawn programmatically |
| Menu cursor arrow | 8×8px | Blinking, from UI sprite sheet |

---

## Emblem Icons

| Size | Sheet layout | Notes |
|---|---|---|
| 48×48px each | 8 icons per sheet row | One icon per emblem ID |

---

## Battle Backgrounds

Battle backgrounds are sourced from **PokeRogue** (CC-BY-NC-SA-4.0) and used at their native resolution.
Each region maps to a PokeRogue arena ID via `BATTLE_BACKGROUNDS` in `src/config.js`.

---

## Font

**Press Start 2P** (Google Fonts, free/OFL) is the only font used. All text rendering goes through
`CONFIG.FONT` in `src/config.js`. No other fonts are permitted.

---

## Colour Palette

Core colours are defined in `COLORS` in `src/config.js`:

| Name | Hex | Used for |
|---|---|---|
| Background | `#0b1020` | Scene backgrounds |
| Title | `#f8f8f8` | Primary text |
| Subtitle | `#9bc5ff` | Secondary text, domain labels |
| Prompt | `#f8f8f8` | Input prompts |
| Menu arrow | `#ffe066` | Cursor / selection highlight |

HP bar colours are rendered programmatically: green (`#00cc44`) > 50%, yellow (`#ffe066`) > 25%, red (`#ff3300`) otherwise.

---

## Asset Credits

| Asset | Source | Licence |
|---|---|---|
| Tiles, characters, facesets | [Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) — Pixel-Boy & AAA | CC0 (public domain) |
| Battle backgrounds, UI chrome | [PokeRogue](https://github.com/pagefaultgames/pokerogue) — pagefaultgames | CC-BY-NC-SA-4.0 |
| Font | [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) — CodeMan38 | OFL-1.1 |

See `assets/arenas/CREDITS.md` and `assets/ui/CREDITS.md` for per-file attribution.
