# Tile Asset Credits

## Kenney RPG Urban Pack (CC0)

Tech and office-themed world tiles are sourced from the
[Kenney RPG Urban Pack](https://kenney.nl/assets/rpg-urban-pack)
by [Kenney](https://kenney.nl).

- **License:** [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/)
  (no attribution required, but we credit them anyway)
- **Source:** https://kenney.nl/assets/rpg-urban-pack
- **Original tile size:** 16×16 px
- **Upscale applied:** 3× nearest-neighbour → 48×48 px (matches Cloud Quest tile grid)

### Tiles sourced from Kenney RPG Urban

| Tile ID | Name | Kenney source tile |
|---------|------|--------------------|
| 3  | office_floor         | `tilemap_packed.png` — light floor row |
| 7  | office_wall          | `tilemap_packed.png` — beige wall row |
| 9  | glass_wall           | `tilemap_packed.png` — glass/window tile |
| 16 | desk                 | `tilemap_packed.png` — desk object |
| 17 | monitor              | `tilemap_packed.png` — computer screen |
| 18 | keyboard             | `tilemap_packed.png` — keyboard object |
| 19 | whiteboard           | `tilemap_packed.png` — whiteboard/board |
| 20 | office_chair         | `tilemap_packed.png` — chair object |
| 23 | warning_sign         | `tilemap_packed.png` — sign/notice |
| 31 | cloud_office_exterior| `tilemap_packed.png` — modern building front |
| 32 | startup_garage       | `tilemap_packed.png` — garage / workshop |
| 35 | tech_park_path       | `tilemap_packed.png` — paved path |
| 36 | sticky_notes         | `tilemap_packed.png` — paper/note object |
| 37 | coffee_cup           | `tilemap_packed.png` — mug object |

### Upscale process

```bash
# Requires ImageMagick
convert kenney_tilemap_packed.png \
  -filter point -resize 300% \
  kenney_tech_office_raw.png
# Then slice and arrange into the Cloud Quest grid using scripts/slice-kenney-tiles.js
```

---

## Custom / Sprite-artist tiles (pending)

The following tile IDs are placeholders (magenta) until custom sprites are commissioned.
See `custom-tiles-spec.md` for full pixel-art briefs.

| Tile ID | Name | Status |
|---------|------|--------|
| 1  | tech_floor           | Placeholder — pending custom sprite |
| 2  | server_room_floor    | Placeholder — pending custom sprite |
| 4  | raised_floor         | Placeholder — pending custom sprite |
| 5  | corridor             | Placeholder — pending custom sprite |
| 6  | server_room_wall     | Placeholder — pending custom sprite |
| 8  | datacenter_wall      | Placeholder — pending custom sprite |
| 10 | tech_building_exterior | Placeholder — pending custom sprite |
| 11 | server_rack          | Placeholder — pending custom sprite |
| 12 | server_rack_leds     | Placeholder — pending custom sprite |
| 13 | cable_bundle         | Placeholder — pending custom sprite |
| 14 | patch_panel          | Placeholder — pending custom sprite |
| 15 | network_switch       | Placeholder — pending custom sprite |
| 21 | cooling_unit         | Placeholder — pending custom sprite |
| 22 | ups_battery          | Placeholder — pending custom sprite |
| 24 | emergency_light      | Placeholder — pending custom sprite |
| 25 | cable_tray           | Placeholder — pending custom sprite |
| 26 | crt_monitor          | Placeholder — pending custom sprite |
| 27 | command_prompt       | Placeholder — pending custom sprite |
| 28 | error_screen         | Placeholder — pending custom sprite |
| 29 | monitoring_dashboard | Placeholder — pending custom sprite |
| 30 | terminal_server      | Placeholder — pending custom sprite |
| 33 | noc_building         | Placeholder — pending custom sprite |
| 34 | datacenter_entrance  | Placeholder — pending custom sprite |
| 38 | decommissioned_server| Placeholder — pending custom sprite |
| 39 | dusty_rack           | Placeholder — pending custom sprite |
| 40 | blinking_led         | Placeholder — pending custom sprite |
| 41 | server_rack_interact | Placeholder — pending custom sprite |
| 42 | terminal_interact    | Placeholder — pending custom sprite |
| 43 | control_panel        | Placeholder — pending custom sprite |
| 44 | server_tombstone     | Placeholder — pending custom sprite |
| 46–50 | custom_slot_*   | Reserved — sprite-artist |

---

## Stub tileset

`stub_tiles.png` (5 tiles, same directory as maps) is the original placeholder
tileset used during early development. It is superseded by this tileset for
tech-themed regions.
