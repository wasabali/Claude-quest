# Tile Specifications — Missing Biomes

This document specifies the overworld tiles required for two Cloud Quest regions that currently
use the placeholder `stub_tiles.png`. All tiles must be **48 × 48 px** (or 16 × 16 px with
3× nearest-neighbor upscale), delivered as a single tileset PNG strip or grid compatible with
the Tiled Map Editor.

---

## 1 · `/dev/null Void` (`dev_null_void`)

**Theme:** Space / Void — a corrupted digital dimension where deleted data drifts in the dark.  
**Battle background:** PokeRogue `space` arena (already wired).  
**Tone:** Unsettling, glitchy, empty. Think corrupted ROM, deep space, floating debris.

### Color palette

| Role | Hex | Notes |
|------|-----|-------|
| Background void | `#050510` | Near-black with blue tint |
| Deep space | `#0a0a1a` | Main ground tile |
| Star field | `#1a1a2e` | Subtle star cluster pattern |
| Corrupted data | `#4a0080` | Purple glitch highlight |
| Glitch accent | `#00ffcc` | Cyan/teal glitch lines |
| Floating platform | `#1e1e3f` | Dark slate |
| Platform edge | `#6600cc` | Neon purple border |
| Debris / rubble | `#2a1a3e` | Dark purplish grey |
| Digital dissolution | `#ff00ff` | Magenta pixel scatter |

### Required tile types

| Tile ID (proposed) | Name | Description |
|--------------------|------|-------------|
| 1 | `void_ground` | Deep space base tile — scattered tiny stars on near-black |
| 2 | `void_ground_corrupted` | Ground tile with magenta/cyan glitch lines across it |
| 3 | `void_platform` | Floating island tile — mid-section, dark slate with neon edge |
| 4 | `void_platform_edge_l` | Platform left-edge tile |
| 5 | `void_platform_edge_r` | Platform right-edge tile |
| 6 | `void_star_dense` | Star cluster tile — brighter star field, used for accents |
| 7 | `void_debris` | Floating bit-debris — scattered pixel fragments |
| 8 | `void_glitch_h` | Horizontal glitch streak — decorative overlay tile |
| 9 | `void_glitch_v` | Vertical glitch streak — decorative overlay tile |
| 10 | `void_dissolution` | Dissolving ground edge — ground fading into void |
| 11 | `void_portal_glow` | Soft circular glow tile — marks the exit portal |
| 12 | `void_wall` | Solid collision tile — invisible/transparent (same as other maps) |

### Tileset layout (12-tile strip, 576 × 48 px or 48 × 576 px column)

```
[ void_ground | void_ground_corrupted | void_platform | void_platform_edge_l | void_platform_edge_r
  void_star_dense | void_debris | void_glitch_h | void_glitch_v | void_dissolution
  void_portal_glow | void_wall ]
```

### Tiled layer mapping

| Layer | Tile(s) |
|-------|---------|
| Ground | `void_ground`, `void_star_dense` |
| Objects | `void_platform`, `void_platform_edge_l/r`, `void_debris`, `void_portal_glow` |
| Overlay | `void_ground_corrupted`, `void_glitch_h`, `void_glitch_v`, `void_dissolution` |
| Collision | `void_wall` |

### Recommended source packs (CC0)

| Pack | URL | Relevant tiles |
|------|-----|----------------|
| **Kenney — Pixel Platformer** | https://kenney.nl/assets/pixel-platformer | Background tiles, floating platforms |
| **Kenney — Space Shooter Redux** | https://kenney.nl/assets/space-shooter-redux | Star fields, space backgrounds |
| **Kenney — Sci-Fi Tiles** | https://kenney.nl/assets/sci-fi-tiles | Corrupted/tech ground, platforms |

If adapting from the above: extract relevant 16 × 16 tiles, apply 3× nearest-neighbor upscale
to reach 48 × 48 px, then recolour to the void palette using a pixel editor (Aseprite, GIMP, etc.).

---

## 2 · `Deprecated Azure Region` (`deprecated_azure_region`)

**Theme:** Wasteland — a decommissioned cloud region left to decay. Rusted infrastructure,
cracked earth, warning signs nobody heeds.  
**Battle background:** PokeRogue `wasteland` arena (already wired).  
**Tone:** Melancholy, industrial ruin. Think abandoned data centre, Arizona desert, legacy support ticket.

### Color palette

| Role | Hex | Notes |
|------|-----|-------|
| Cracked earth | `#8b6914` | Warm brown base |
| Dry ground | `#a07820` | Tan/ochre ground |
| Crack line | `#5a3a00` | Dark brown crack detail |
| Rusted metal | `#8b3a1a` | Rust orange-red |
| Concrete | `#9a9a8a` | Weathered grey |
| Dead vegetation | `#4a5a20` | Desaturated olive |
| Warning yellow | `#ffcc00` | Caution tape, hazard stripe |
| Warning black | `#1a1a1a` | Caution tape contrast stripe |
| Azure blue (faded) | `#2060a0` | Faded Microsoft branding colour |
| Sky (dust haze) | `#c8a060` | Hazy warm sky background |

### Required tile types

| Tile ID (proposed) | Name | Description |
|--------------------|------|-------------|
| 1 | `waste_ground` | Base cracked-earth tile — warm brown with subtle crack pattern |
| 2 | `waste_ground_heavy` | Heavily cracked ground — large crack network |
| 3 | `waste_concrete` | Broken concrete slab — weathered grey with crack |
| 4 | `waste_rubble` | Pile of rubble/debris — mixed brown and grey fragments |
| 5 | `waste_dead_grass` | Dead/dry grass tuft — thin, yellowed blades |
| 6 | `waste_rusted_pipe` | Rusted horizontal pipe section |
| 7 | `waste_server_rack` | Abandoned server rack silhouette (1 × 2 tile) |
| 8 | `waste_caution_tape` | Horizontal caution tape strip — yellow/black stripe |
| 9 | `waste_warning_sign` | Small warning sign icon tile — ⚠ on faded yellow |
| 10 | `waste_azure_logo` | Faded Azure logo on concrete — decorative flavour tile |
| 11 | `waste_wire_fence` | Chain-link fence section (overlay tile, semi-transparent) |
| 12 | `waste_wall` | Solid collision tile — invisible/transparent |

### Tileset layout (12-tile strip, 576 × 48 px or 48 × 576 px column)

```
[ waste_ground | waste_ground_heavy | waste_concrete | waste_rubble | waste_dead_grass
  waste_rusted_pipe | waste_server_rack | waste_caution_tape | waste_warning_sign | waste_azure_logo
  waste_wire_fence | waste_wall ]
```

### Tiled layer mapping

| Layer | Tile(s) |
|-------|---------|
| Ground | `waste_ground`, `waste_ground_heavy`, `waste_concrete` |
| Objects | `waste_rubble`, `waste_dead_grass`, `waste_rusted_pipe`, `waste_server_rack`, `waste_caution_tape`, `waste_warning_sign`, `waste_azure_logo` |
| Overlay | `waste_wire_fence` |
| Collision | `waste_wall` |

### Recommended source packs (CC0)

| Pack | URL | Relevant tiles |
|------|-----|----------------|
| **Kenney — Roguelike/RPG Pack** | https://kenney.nl/assets/roguelike-rpg-pack | Desert ground, rubble, crates |
| **Kenney — RPG Urban Pack** | https://kenney.nl/assets/rpg-urban-pack | Concrete, fences, urban decay |
| **Kenney — Tiny Town** | https://kenney.nl/assets/tiny-town | Road markings adaptable for caution tape |

If adapting from the above: extract desert/wasteland 16 × 16 tiles, apply 3× nearest-neighbor
upscale, then recolour pipes/structures to the rust palette and add Azure branding details.

---

## General notes for tile artists

- **Canvas size:** 48 × 48 px per tile, transparent PNG.
- **Style:** GameBoy Color-era pixel art. Limited palette per tile (≤ 8 colours per tile).
- **Anti-aliasing:** None. All edges are hard pixel boundaries.
- **Transparency:** All non-opaque tiles (overlay, fence, glitch) must use alpha channel.
- **Delivery format:** Single tileset PNG (all tiles in a row or grid). If imported through
  Tiled, keep tileset metadata embedded in the consuming `.tmj` map to match the current repo
  workflow; a standalone `.tsx` is optional, not required.
- **Naming:** `void_tiles.png` and `wasteland_tiles.png`.
