# Cloud Quest — Visual & Audio Asset Sources

This document records the primary asset source for every visual and audio layer in Cloud Quest, the upscale pipeline, identified gaps, and supplemental packs.

---

## Primary Source: Ninja Adventure (CC0)

**Pack:** [Ninja Adventure](https://pixel-boy.itch.io/ninja-adventure-asset-pack) by pixel-boy and AAA  
**License:** [CC0 1.0 Universal (Public Domain)](https://creativecommons.org/publicdomain/zero/1.0/)  
**Tile size:** 16×16px (upscaled to 48×48px for Cloud Quest — see below)

Ninja Adventure covers approximately 85% of Cloud Quest's visual and audio needs.

| Category | Contents |
|---|---|
| Characters | 50+ characters with walk/idle/attack animations and facesets (dialogue portraits) |
| Monsters | 30+ animated monsters, 9 animated bosses |
| World tiles | Exterior + interior tilesets with autotiling, buildings |
| VFX | 30+ visual effect sprites |
| Items | 60+ item icons |
| UI | Full UI element set + 2 pixel fonts (unused — Cloud Quest uses Press Start 2P) |
| Music | 37 BGM tracks |
| SFX | 100+ sound effects |

---

## Upscale Pipeline: 16→48px

Ninja Adventure uses **16×16px** tiles. Cloud Quest uses `CONFIG.TILE_SIZE = 48px`.

**Scale factor:** 3× (16 × 3 = 48 — clean integer, zero fractional artefacts)  
**Method:** Nearest-neighbor interpolation (preserves pixel art perfectly)  
**Script:** `scripts/upscale-assets.js`

### Usage

```bash
# Upscale the full pack into a staging directory
node scripts/upscale-assets.js \
  --input /path/to/NinjaAdventure \
  --output assets/ninja-adventure-upscaled

# Force re-process all files (skip cache)
node scripts/upscale-assets.js \
  --input /path/to/NinjaAdventure \
  --output assets/ninja-adventure-upscaled \
  --force
```

Requires **ImageMagick** (`sudo apt install imagemagick` / `brew install imagemagick`).

### Output folder mapping

After upscaling, copy assets from the staging directory to the locations below.

| Ninja Adventure subfolder | Cloud Quest destination |
|---|---|
| `Actor/Characters/` | `assets/sprites/player/` and `assets/sprites/trainers/` |
| `Actor/Monsters/` | `assets/sprites/incidents/` |
| `Items/Icons/` | `assets/sprites/items/` |
| `FX/` | `assets/sprites/effects/` |
| `Maps/Tiles/` | `assets/tilesets/` |
| `Audio/BGM/` | `assets/audio/bgm/` |
| `Audio/SFX/` | `assets/audio/sfx/` |

---

## Asset Source Matrix

| Layer | Primary Source | Supplement | Status |
|---|---|---|---|
| Characters (player + NPCs) | Ninja Adventure (3× upscale) | — | ⏳ Pending upscale |
| Monsters / Incidents | Ninja Adventure monsters (3× upscale) | Custom sprites (future) | ⏳ Pending upscale |
| World tiles + buildings | Ninja Adventure tilesets (3× upscale) | Kenney RPG Urban (tech/office regions) | ⏳ Pending upscale |
| Battle arena backgrounds | PokeRogue arenas (`assets/arenas/`) | — | ✅ Integrated |
| Battle UI (9-slice, bars) | PokeRogue UI (`assets/ui/`) | — | ✅ Integrated |
| Battle VFX / effects | Ninja Adventure effects (3× upscale) | — | ⏳ Pending upscale |
| Item icons | Ninja Adventure items (3× upscale) | — | ⏳ Pending upscale |
| Music | Ninja Adventure (37 tracks, BGM IDs in `src/data/audio.js`) | — | ⏳ Pending integration |
| Sound effects | Ninja Adventure (100+ SFX) | — | ⏳ Pending integration |
| Font | Press Start 2P (Google Fonts, keep current) | — | ✅ Integrated |
| Space/void/wasteland tiles | — | Kenney or custom | 🔴 Gap — see below |
| Battle portraits | Ninja Adventure facesets (3× upscale → 48×48px) | — | ⏳ Pending spec change |

---

## Region Tile Coverage

| Cloud Quest Region | Ninja Adventure Biome | Fit |
|---|---|---|
| `localhost_town` | Village tiles | ✅ Good |
| `pipeline_pass` | Path/bridge tiles | ✅ Good |
| `jira_dungeon` | Cave/dungeon tiles | ✅ Good |
| `node_modules_maze` | Forest tiles | ✅ Good |
| `three_am_tavern` | Interior building tiles | ✅ Good |
| `production_plains` | Outdoor tiles | ✅ Good |
| `server_graveyard` | Ruins/graveyard tiles | ⚠️ Partial |
| `kubernetes_colosseum` | Shrine/arena tiles | ⚠️ Partial |
| `dev_null_void` | No space/void tiles | 🔴 Needs supplement |
| `deprecated_azure_region` | No wasteland tiles | 🔴 Needs supplement |

---

## Identified Gaps

### Gap 1 — Tech/Office-Themed Tiles 🔴
Ninja Adventure is ninja/village/nature themed. Regions `dev_null_void` and `deprecated_azure_region` need space/void/wasteland tiles not present in the pack.

**Recommendation:** Kenney RPG Urban Pack (CC0) for office/server-room tiles. Custom tiles for void/wasteland.

### Gap 2 — Battle Portrait Spec Change ⚠️
The original spec called for 96×96px battle portraits. Ninja Adventure facesets are 16×16px.
- 6× upscale to 96px is too blocky.
- **Recommendation:** Change portrait spec to **48×48px** (3× upscale), consistent with all other assets.

### Gap 3 — Tech-Themed Incident Sprites 🔴
Cloud Quest incidents (`404_not_found`, `merge_conflict`, `npm_install_hang`, etc.) need tech-themed creature sprites. Ninja Adventure monsters work as placeholders, but custom sprites are needed for the game's identity.

### Gap 4 — BGM Loop Points ⚠️
Ninja Adventure's 37 BGM tracks need `start`/`end` loop points defined in `assets/audio/bgm-loop-points.json` after the tracks are assigned to Cloud Quest BGM IDs.

---

## Supplemental Packs

| Pack | License | Used for |
|---|---|---|
| [Kenney RPG Urban Pack](https://kenney.nl/assets/rpg-urban-pack) | CC0 | Tech/office/server-room tiles |
| [PokeRogue](https://github.com/pagefaultgames/pokerogue) | CC-BY-NC-SA-4.0 | Battle arena backgrounds (`assets/arenas/`), battle UI chrome (`assets/ui/`) |

---

## Follow-Up Issues

See the sub-issues filed against the parent integration issue:

- Asset upscale pipeline script
- Tech/office supplemental tiles
- Missing biome tiles (dev_null_void, deprecated_azure_region)
- Battle portrait spec change (96→48px)
- BGM loop point definition
- Custom incident sprite specifications
