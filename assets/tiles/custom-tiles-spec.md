# Custom Tile Specifications — sprite-artist commission brief

These tiles are required by Cloud Quest but are **not available** in the Kenney RPG Urban Pack.
Each entry below is a brief for the `sprite-artist` agent.

All tiles must be:
- **48×48 px** (final delivered size — matches the Cloud Quest tile grid)
- **Style:** GameBoy Color / early-2000s RPG pixel art — flat colours, dark outlines, 2–4 colour shading per object
- **View:** top-down or slight 3/4 top-down perspective, consistent with the Kenney urban pack aesthetic
- **Palette:** Stay close to the existing tech palette — dark backgrounds, cyan/teal accents for active hardware, amber/orange for older or degraded hardware
- Delivered as individual 48×48 RGBA PNGs, then composited into `kenney_tech_office.png` at the correct grid position

---

## Tile 1 — `tech_floor`

**Grid position:** row 0, column 0

Dark slate floor tile for generic tech indoor areas.
- Base colour: `#282C34` (very dark grey-blue)
- Subtle 1-pixel grid lines: `#1E2127`
- No objects — pure floor
- Tile should tile seamlessly

---

## Tile 2 — `server_room_floor`

**Grid position:** row 0, column 1

Anti-static steel-blue floor typical of server rooms.
- Base: `#344E5E`
- Grid / grout lines: `#263A4A` (1 px every 24 px, making 4 sub-tiles)
- Slight reflective sheen suggestion along top-left pixel border

---

## Tile 4 — `raised_floor`

**Grid position:** row 0, column 3

Dark blue raised-access floor tile used in data centres.
- Square tile with visible bolted corner connectors (2×2 px dots in `#8888CC`)
- Base: `#1C2852`
- Seam lines between raised panels in `#141E3C`

---

## Tile 5 — `corridor`

**Grid position:** row 0, column 4

Medium grey corridor connecting tech areas.
- Clean, minimal — slightly lighter horizontal stripe in the centre (10 px wide) to suggest a guiding line
- Base: `#5F626C`
- Guide stripe: `#777A85`

---

## Tile 6 — `server_room_wall`

**Grid position:** row 1, column 0

Very dark panel wall for server room perimeter.
- Vertical panel seams every 16 px in `#151618`
- Base: `#161619`
- 2 px top edge in `#333338` to suggest ceiling bracket

---

## Tile 8 — `datacenter_wall`

**Grid position:** row 1, column 2

Charcoal data-centre wall — slightly lighter than server room wall.
- Brushed metal look: horizontal highlight lines every 8 px at 1 px, colour `#525262`
- Base: `#2D2D3A`

---

## Tile 10 — `tech_building_exterior`

**Grid position:** row 1, column 4

Outside wall of a modern tech company office.
- Dark glass-and-steel finish
- Base: `#3C4148`
- Vertical glass panel dividers in `#242830`
- Small reflective glint in top-right corner: 2×2 px `#9ABFCC`

---

## Tile 11 — `server_rack`

**Grid position:** row 2, column 0

Standard 42U rack-mounted server cabinet, viewed from front at 3/4 angle.
- Dark grey cabinet (`#192244`) with lighter front bezel (`#1E2850`)
- 6 rows of 1U server blades visible (4 px tall each): base `#2A3060`
- Small power LEDs on each blade: 1×1 px, alternating green (`#00C853`) and amber (`#FF8F00`)
- Rails and rack handles visible on sides

---

## Tile 12 — `server_rack_leds`

**Grid position:** row 2, column 1

Same as `server_rack` but with more LED activity visible (active server).
- All blade LEDs green (`#00E676`) and blinking pattern suggested by 2 amber LEDs
- Activity indicator bar across top: 4 px tall, `#005500` background with 3 bright green `#00FF00` segments

---

## Tile 13 — `cable_bundle`

**Grid position:** row 2, column 2

Dense cable run on the floor along a wall.
- Multiple cables (4–5) in different colours: Cat5 grey, fibre yellow, power black, patch blue, red
- Cables rendered as parallel 2–3 px wide sinuous lines bundled together
- Slight shadow below bundle

---

## Tile 14 — `patch_panel`

**Grid position:** row 2, column 3

1U 24-port patch panel mounted in rack position.
- Row of 12 RJ45 ports (each 3×3 px), two rows
- Port frames in `#555560`, empty ports dark `#111118`
- Occupied ports shown with coloured cables: grey, blue, green, yellow
- Bezel base: `#4E5458`

---

## Tile 15 — `network_switch`

**Grid position:** row 2, column 4

Managed 24-port gigabit switch.
- Black anodised chassis (`#0F0F12`)
- Front panel: row of 24 tiny ports (2×2 px each), activity LEDs above in `#0088FF`
- Blue power LED (top-right): 2×2 px `#0044FF`

---

## Tile 21 — `cooling_unit`

**Grid position:** row 4, column 0

Precision CRAC (Computer Room Air Conditioning) unit — tall white-and-teal appliance.
- Base: `#00B4B8` fronted panel
- Air vent louvres: horizontal dark lines every 4 px
- Brand badge area (blank rect) at centre
- Status LED: green 2×2 px

---

## Tile 22 — `ups_battery`

**Grid position:** row 4, column 1

Tower UPS unit.
- Tall grey box (`#828290`) with power button circle in centre
- Battery indicator: 4-segment vertical bar on right side (`#00BB00`)
- Model tag at top

---

## Tile 24 — `emergency_light`

**Grid position:** row 4, column 3

Wall-mounted emergency strobe / exit light.
- Red rectangular housing (`#D21C1C`)
- White glare on lens (`#FFE0E0` 4×4 px ellipse centre)
- Mounting bracket visible at base

---

## Tile 25 — `cable_tray`

**Grid position:** row 4, column 4

Overhead cable tray viewed from below (top-down: dark bar with visible cables).
- Dark metal tray (`#232018`)
- 3–4 cables (grey, yellow, blue) running lengthwise through the tray

---

## Tile 26 — `crt_monitor`

**Grid position:** row 5, column 0

Old CRT monitor with green phosphor text.
- Off-white/cream plastic body (`#CCC8B8`)
- Screen: dark `#001200` with 2–3 lines of tiny green text characters (`#00B800`)
- Screen curvature suggested by 1 px lighter border inside screen
- Blinking cursor: 2×4 px bright green `#00FF00`

---

## Tile 27 — `command_prompt`

**Grid position:** row 5, column 1

Terminal emulator window shown on a modern flat monitor.
- Dark monitor body
- Screen: `#0D0D0D` with 3–4 lines of green text and a blinking cursor
- Active scroll indicator on right side

---

## Tile 28 — `error_screen`

**Grid position:** row 5, column 2

Monitor showing a critical error or BSOD.
- Screen: `#B00000` full-bleed with white error text suggestion (2 lines of tiny white pixels)
- Monitor body same as `monitor` (tile 17)

---

## Tile 29 — `monitoring_dashboard`

**Grid position:** row 5, column 3

Widescreen dashboard monitor with metrics.
- Screen: `#0B0B50` with visible graph lines in green (`#00E000`) and amber (`#FF9900`)
- Multiple tiny chart areas divided by 1 px dark lines

---

## Tile 30 — `terminal_server`

**Grid position:** row 5, column 4

Late-1990s beige terminal server box.
- Off-white beige chassis (`#C3BEA8`)
- Front panel with 8 serial port icons
- Model label sticker on top
- Activity LED row: 3×1 px green and red dots

---

## Tile 33 — `noc_building`

**Grid position:** row 6, column 2

Network Operations Centre exterior — imposing dark building.
- Very dark blue-grey (`#1C1C2D`)
- No windows, or only narrow slit-windows with red tint
- Bold "NOC" sign (pixel letters) above door
- Security camera icon on corner (4×4 px)

---

## Tile 34 — `datacenter_entrance`

**Grid position:** row 6, column 3

Secure data-centre entry — card-reader airlock.
- Grey walls with brushed metal door (`#888890`)
- Red access-denied light (`#CC0000`) above frame
- Keycard reader panel on right: 4×8 px dark with green ready light

---

## Tile 38 — `decommissioned_server`

**Grid position:** row 7, column 2

Rusty, dust-covered old server (Server Graveyard region).
- Rust streaks on chassis: amber-brown lines over base `#764E26`
- Screen/port holes taped over with grey masking tape (diagonal stripe)
- Dusty haze: sparse white 1 px dots on surface

---

## Tile 39 — `dusty_rack`

**Grid position:** row 7, column 3

Old server rack covered in grey dust.
- Same structure as `server_rack` (tile 11) but:
- Desaturated palette — base `#8A847A`
- Dust layer: uniform 1 px noise overlay in `#AAA49A`
- Dead LEDs (all dark)

---

## Tile 40 — `blinking_led`

**Grid position:** row 7, column 4

Bright green blinking LED indicator (floor-level or panel-level decoration).
- Small dark housing (`#181818`) 20×20 px centred in tile
- Central LED lens: bright `#00FF3C` with small white specular
- Glow halo: 1 px ring in `#00882A`

---

## Tile 41 — `server_rack_interact`

**Grid position:** row 8, column 0

Interactable version of `server_rack` — highlighted yellow border for player interaction.
- Same art as tile 11
- Outer 2 px border replaced with `#FFD700` (gold)

---

## Tile 42 — `terminal_interact`

**Grid position:** row 8, column 1

Interactable terminal — highlighted for player interaction.
- Same art as tile 27 (command_prompt)
- Outer 2 px border in `#00E5FF` (cyan) to indicate interactability

---

## Tile 43 — `control_panel`

**Grid position:** row 8, column 2

Wall-mounted control panel with buttons and indicators.
- Dark chassis (`#222235`)
- Grid of 9 buttons (3×3): mixture of red, green, grey states
- Two vertical meter bars on right: 3×16 px fill gauges
- Single LED row at bottom: 5 LEDs (green, green, amber, red, grey)

---

## Tile 44 — `server_tombstone`

**Grid position:** row 8, column 3

A broken server standing upright like a tombstone (Server Graveyard lore).
- Cracked and split chassis leaning slightly
- Epitaph scratched into front: "R.I.P." in 2×2 px pixel font
- Rubble / debris pixels at the base
- Screen cracked: black with single jagged white crack line

---

## Notes for sprite-artist

- Deliver files individually named `tile_NNN_name.png` (e.g. `tile_001_tech_floor.png`)
- After delivery, run `scripts/compose-tech-tileset.js` to stitch them into `kenney_tech_office.png`
- Magenta tiles (`#C800C8`) in the current placeholder are the ones awaiting your art
