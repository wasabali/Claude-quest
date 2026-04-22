# Audio Reference

Cloud Quest uses real sound effects and background music to make every CLI command feel satisfying. The audio system is split into two registries: **SFX** (sound effects) and **BGM** (background music).

---

## Background Music

Each region and battle type has a dedicated BGM track. Tracks loop seamlessly.

### Overworld Tracks

| Track ID | Where It Plays | Volume |
|---|---|---|
| `title` | Title screen / main menu | 0.6 |
| `localhost_town` | Localhost Town (starting area) | 0.4 |
| `pipeline_pass` | Pipeline Pass | 0.5 |
| `container_port` | Container Port area | 0.5 |
| `cloud_citadel` | Cloud Citadel / Azure Town | 0.5 |
| `kernel_caves` | Kernel Caves / Shell Cavern | 0.4 |
| `serverless_steppes` | Serverless Steppes region | 0.4 |
| `three_am_tavern` | Three AM Tavern (hidden area) | 0.5 |
| `legacy_codebase` | OldCorp Basement / Legacy areas | 0.4 |
| `outcast_network` | Outcast Network hidden areas | 0.5 |
| `shadow_registry` | Shadow Registry (deepest hidden area) | 0.3 |

### Battle Tracks

| Track ID | When It Plays | Volume |
|---|---|---|
| `battle_incident` | Random incident encounters | 0.7 |
| `battle_engineer` | Trainer / engineer battles | 0.7 |
| `battle_cursed` | Cursed technique encounters | 0.7 |
| `battle_throttlemaster` | THROTTLEMASTER boss fights | 0.8 |

### Result Jingles

| Track ID | When It Plays | Volume | Loops? |
|---|---|---|---|
| `victory` | Battle won | 0.7 | No |
| `game_over` | Player defeated | 0.6 | No |

---

## Sound Effects

SFX are organised into four categories and play at different priority levels (1 = ambient, 4 = critical).

### UI

| ID | Description | Volume | Priority |
|---|---|---|---|
| `sfx_cursor_move` | Short click/tick when navigating menus | 0.25 | 1 |
| `sfx_confirm` | Bright chirp on confirm | 0.45 | 2 |
| `sfx_cancel` | Low thud on cancel/back | 0.40 | 2 |
| `sfx_text_blip` | Tiny blip during dialog typewriter | 0.20 | 1 |
| `sfx_save` | Floppy disk write sound when saving | 0.45 | 2 |

### Battle

| ID | Description | Volume | Priority |
|---|---|---|---|
| `sfx_damage_hit` | Impact crunch on normal hit | 0.55 | 3 |
| `sfx_damage_critical` | Bigger crunch + flash for critical hits | 0.80 | 4 |
| `sfx_heal` | Rising arpeggio on HP restore | 0.45 | 2 |
| `sfx_status_apply` | Wobble/warble when status is applied | 0.50 | 2 |
| `sfx_status_expire` | Soft release when status expires | 0.30 | 1 |
| `sfx_skill_fail` | Descending sad trombone on miss | 0.60 | 3 |
| `sfx_shame` | Ominous chord when Shame increases | 0.75 | 4 |
| `sfx_encounter_start` | Alert jingle at battle start | 0.55 | 3 |
| `sfx_sla_tick` | Clock tick each turn SLA counts down | 0.40 | 2 |
| `sfx_sla_breach` | Alarm klaxon on SLA breach | 0.75 | 4 |
| `sfx_budget_drain` | Coin loss jingle on budget spend | 0.45 | 2 |
| `sfx_reputation_change` | Pitch up for rep gain, pitch down for loss | 0.50 | 2 |

### Overworld

| ID | Description | Volume | Priority |
|---|---|---|---|
| `sfx_emblem_earn` | Triumphant fanfare when earning an emblem | 0.80 | 4 |
| `sfx_emblem_sparkle` | Tiny sparkle during emblem polish | 0.25 | 1 |
| `sfx_door_locked` | Buzzer / denied beep on locked doors | 0.40 | 2 |
| `sfx_level_up` | Rising scale fanfare on level up | 0.70 | 4 |

---

## Notes

- **OGG format** is preferred; MP3 loads as a fallback if OGG isn't available.
- **Priority levels** control which sounds can be heard when multiple SFX fire simultaneously. Critical (4) sounds always play; ambient (1) sounds may be dropped.
- All audio assets are sourced from the **Ninja Adventure asset pack**.
- BGM tracks use `BaseScene.playBgm()` which handles seamless looping automatically.

---

*"Even the silence in the Shadow Registry is louder than production logs." — Unknown engineer*
