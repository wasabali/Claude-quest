# Cloud Quest — Asset Credits

Cloud Quest is a browser-based RPG by wasabali. The following third-party asset packs are used. All assets are either public domain (CC0) or used in accordance with their respective licenses.

---

## Ninja Adventure (CC0)

**Primary asset source** for characters, monsters, world tiles, VFX, items, music, and SFX.

| Field | Value |
|---|---|
| Author | pixel-boy and AAA |
| Source | https://pixel-boy.itch.io/ninja-adventure-asset-pack |
| License | [CC0 1.0 Universal — Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) |
| Modifications | All sprites upscaled 3× (16px → 48px) using nearest-neighbor interpolation |

CC0 means no attribution is legally required. We credit the author here as good practice.

### Ninja Adventure assets used

| Category | Cloud Quest location |
|---|---|
| Character sprites (walk/idle/attack) | `assets/sprites/player/`, `assets/sprites/trainers/` |
| Character facesets (battle portraits, 48×48px) | `assets/sprites/portraits/` |
| Monster sprites | `assets/sprites/incidents/` |
| World tilesets | `assets/tilesets/` |
| VFX sprites | `assets/sprites/effects/` |
| Item icons | `assets/sprites/items/` |
| BGM tracks (37 tracks) | `assets/audio/bgm/` |
| SFX (100+ sounds) | `assets/audio/sfx/` |

---

## PokeRogue (CC-BY-NC-SA-4.0)

**Battle arena backgrounds** and **battle UI chrome** (9-slice panels, HUD elements).

| Field | Value |
|---|---|
| Author | pagefaultgames |
| Source | https://github.com/pagefaultgames/pokerogue |
| License | [CC-BY-NC-SA-4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) |
| Modifications | Recoloured / reframed for Cloud Quest regions and tech theme |

**CC-BY-NC-SA-4.0 requirements:**
- **Attribution** — Credit PokeRogue / pagefaultgames (done here and in `assets/arenas/CREDITS.md`, `assets/ui/CREDITS.md`)
- **Non-commercial** — Cloud Quest must remain non-commercial while these assets are included
- **Share-alike** — Assets derived from PokeRogue must be released under the same license

### PokeRogue assets used

| Asset | Cloud Quest location |
|---|---|
| Arena backgrounds (`plains`, `cave`, `forest`, `factory`, `stadium`, `abyss`, `ruins`, `space`, `wasteland`, `construction`) | `assets/arenas/` |
| 9-slice UI panels (`window_1`–`window_5`) | `assets/ui/` |
| Cursor / selection indicators | `assets/ui/` |
| HP / XP bars, battle stat overlays | `assets/ui/` |

---

## Press Start 2P (SIL Open Font License)

**Game font** — used for all in-game text.

| Field | Value |
|---|---|
| Author | Cody "CodeMan38" Boisclair |
| Source | https://fonts.google.com/specimen/Press+Start+2P |
| License | [SIL Open Font License 1.1](https://openfontlicense.org/) |
| Modifications | None — loaded from Google Fonts CDN |

---

## Kenney RPG Urban Pack (CC0)

**Supplemental tiles** for tech/office/server-room regions not covered by Ninja Adventure.

| Field | Value |
|---|---|
| Author | Kenney (kenney.nl) |
| Source | https://kenney.nl/assets/rpg-urban-pack |
| License | [CC0 1.0 Universal — Public Domain](https://creativecommons.org/publicdomain/zero/1.0/) |
| Modifications | Upscaled to match 48×48px tile grid (if sourced from a 16px base) |

CC0 — no attribution required; credited here as good practice.

---

## Procedural SFX (jsfxr)

All in-game sound effects are procedurally generated at runtime using [jsfxr](https://github.com/grumdrig/jsfxr) from deterministic seeds defined in `src/data/audio.js`. No audio files are required for SFX.

| Field | Value |
|---|---|
| Library | jsfxr |
| License | MIT |

---

*See `docs/VISUAL_ASSETS.md` for the full asset source matrix, upscale pipeline instructions, and gap analysis.*
