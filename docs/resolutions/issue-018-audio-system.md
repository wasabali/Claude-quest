## ✅ Resolution — Audio System

> *"If you can't hear the chiptune, did the deploy even happen?"*

---

### 1. BGM Per Region: Yes — one looping track each

Every region gets its own BGM track. The existing `bgm-loop-points.json` already defines the track IDs — this confirms they're all real and required:

| Track ID | Region | Vibe |
|---|---|---|
| `title` | Title screen | Upbeat 8-bit adventure fanfare, 15-second loop |
| `localhost_town` | Localhost Town | Chill lo-fi chiptune. Safe, cozy, tutorial energy |
| `pipeline_pass` | Pipeline Pass | Driving square-wave melody. Things are getting real |
| `container_port` | Container Port | Industrial bass-heavy. Docker horns (literally) |
| `cloud_citadel` | Cloud Citadel | Ethereal arpeggios. Head-in-the-clouds energy |
| `kernel_caves` | Kernel Caves | Dark, low register. Cave drip SFX layered in |
| `serverless_steppes` | Serverless Steppes | Sparse, minimalist. Notes appear and vanish (get it?) |
| `three_am_tavern` | 3am Tavern | Jazz-noir chiptune. Smoky, suspicious, 3/4 time |
| `legacy_codebase` | Legacy Codebase | Slow, ominous. Like booting Windows 95 |
| `outcast_network` | Outcast Network | Glitchy, detuned. Bit-crushed and unsettling |
| `shadow_registry` | Shadow Registry | Near-silent ambient drone. Barely there |

**Implementation:** `BaseScene.playBgm(trackId)` already handles this. Each scene calls `this.playBgm(regionId)` in `create()`. WorldScene already does this for `'town'` — just needs to read from `GameState.player.location` instead of hardcoding.

---

### 2. Battle Music: 3 themes + 1 special

Four battle music tracks, already defined in `bgm-loop-points.json`:

| Track ID | When It Plays | Tempo | Feel |
|---|---|---|---|
| `battle_incident` | Wild incident encounters | 140 BPM | Urgent, tense. The pager is going off |
| `battle_engineer` | Named trainer battles | 130 BPM | Competitive, confident. Two nerds sizing each other up |
| `battle_cursed` | Cursed trainer battles + gym bosses | 150 BPM | Menacing, chromatic. Something is very wrong |
| `battle_throttlemaster` | ThrottleMaster final fight only | 160 BPM | Epic boss music. All channels maxed. The CTO has entered the chat |

**Track selection logic** (in `BattleScene.create()`):
```
if (enemy.id === 'throttlemaster')  → 'battle_throttlemaster'
else if (enemy.isCursed || gymBattle) → 'battle_cursed'
else if (mode === 'ENGINEER')        → 'battle_engineer'
else                                 → 'battle_incident'
```

Also needed:
- `victory` — 5-second jingle, plays on battle win (does not loop)
- `game_over` — 3-second sad jingle, plays on defeat (does not loop)

---

### 3. Title Screen Theme: Yes

Track ID `title` — an upbeat 8-bit adventure theme. Think "you just pressed Start on a GameBoy Color in 2001 and your whole weekend disappeared."

**Behavior:**
- Loops on the title screen
- Fades out over 500ms when player selects New Game or Load Save
- Does NOT play during the "Cloud Quest" text animation — only starts after the logo is fully rendered

---

### 4. SFX List — Complete with Priority Levels

SFX use a priority system because the GBC could only play so many sounds at once. Higher priority interrupts lower. This is enforced in `BaseScene.playSfx()`.

| SFX ID | Trigger | Priority | Duration | Description |
|---|---|---|---|---|
| `sfx_cursor_move` | Menu navigation (D-pad) | 1 (low) | 30ms | Short click/tick |
| `sfx_confirm` | A button / Enter confirm | 2 | 50ms | Bright chirp |
| `sfx_cancel` | B button / Escape cancel | 2 | 40ms | Low thud |
| `sfx_text_blip` | Each character in typewriter dialog | 1 (low) | 15ms | Tiny blip (varies pitch by character) |
| `sfx_damage_hit` | Damage dealt to any target | 3 | 80ms | Impact crunch |
| `sfx_damage_critical` | Super-effective hit (2x multiplier) | 4 (high) | 120ms | Bigger crunch + flash |
| `sfx_heal` | HP restored | 2 | 100ms | Rising arpeggio |
| `sfx_status_apply` | Status effect applied | 2 | 80ms | Wobble/warble |
| `sfx_status_expire` | Status effect wears off | 1 | 60ms | Soft release |
| `sfx_skill_fail` | Skill fails (flaky pipeline gym, etc.) | 3 | 100ms | Descending sad trombone (3 notes) |
| `sfx_save` | Save file exported | 2 | 150ms | Floppy disk write sound. Yes really |
| `sfx_shame` | Shame Point gained | 4 (high) | 200ms | Ominous chord. The "what have you done" sound |
| `sfx_emblem_earn` | Emblem awarded | 4 (high) | 300ms | Triumphant fanfare (like getting a badge) |
| `sfx_emblem_sparkle` | Polishing emblem in Emblem Scene | 1 | 50ms | Tiny sparkle per polish stroke |
| `sfx_door_locked` | Trying to enter a locked gym | 2 | 80ms | Buzzer / denied beep |
| `sfx_encounter_start` | Wild encounter triggered | 3 | 150ms | Alert jingle (screen flash sync) |
| `sfx_level_up` | Player levels up | 4 (high) | 250ms | Rising scale fanfare |
| `sfx_sla_tick` | SLA timer decrements | 2 | 40ms | Clock tick |
| `sfx_sla_breach` | SLA timer hits 0 | 4 (high) | 200ms | Alarm klaxon |
| `sfx_budget_drain` | Budget decreases | 2 | 60ms | Coin loss jingle |
| `sfx_reputation_change` | Reputation changes (up or down) | 2 | 80ms | Pitch up for gain, pitch down for loss |

**Priority rules:**
- Priority 4 always plays, interrupts everything
- Priority 3 interrupts 1-2 but not other 3s (queue)
- Priority 1-2 are skipped if a higher-priority SFX is playing
- Max 2 concurrent SFX (GBC realism)

---

### 5. MVP Audio: Procedural + Placeholder

For MVP, **all audio is procedural/placeholder**:

- **SFX:** Generated with [jsfxr](https://sfxr.me/) (Web Audio API synth). Each SFX ID maps to a jsfxr preset seed stored in `src/data/audio.js`. Zero external audio files needed for SFX.
- **BGM:** Simple looping compositions made in [BeepBox](https://www.beepbox.co/) or [jummbox](https://jummbus.bitbucket.io/), exported as `.wav` or `.ogg`. Placeholder tracks are 8–16 bar loops.
- **Post-MVP:** Commission proper chiptune tracks from a composer. The `bgm-loop-points.json` system means we can drop in new files without changing any code.

**Data shape for jsfxr presets** — `src/data/audio.js` (new file):

```js
const SFX_PRESETS = {
  sfx_cursor_move:     { seed: 12345, volume: 0.3, priority: 1 },
  sfx_confirm:         { seed: 23456, volume: 0.5, priority: 2 },
  sfx_cancel:          { seed: 34567, volume: 0.4, priority: 2 },
  sfx_text_blip:       { seed: 45678, volume: 0.2, priority: 1 },
  sfx_damage_hit:      { seed: 56789, volume: 0.6, priority: 3 },
  sfx_damage_critical: { seed: 67890, volume: 0.8, priority: 4 },
  sfx_heal:            { seed: 78901, volume: 0.5, priority: 2 },
  sfx_shame:           { seed: 89012, volume: 0.7, priority: 4 },
  // ... all SFX from table above
}

const BGM_CONFIG = {
  title:                { file: 'assets/audio/bgm/title.ogg',             volume: 0.6 },
  localhost_town:       { file: 'assets/audio/bgm/localhost_town.ogg',     volume: 0.4 },
  battle_incident:      { file: 'assets/audio/bgm/battle_incident.ogg',   volume: 0.7 },
  // ... all BGM from table above
}

export const getSfxPreset = (id)  => SFX_PRESETS[id]
export const getBgmConfig = (id)  => BGM_CONFIG[id]
export const getAllSfx     = ()   => Object.values(SFX_PRESETS)
export const getAllBgm     = ()   => Object.values(BGM_CONFIG)
```

---

### 6. Tab Focus: Mute on blur, resume on focus

```js
// In main.js — after Phaser.Game creation
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.sound.mute = true
  } else {
    game.sound.mute = GameState._session.userMuted  // respect user mute setting
  }
})
```

- Tab loses focus → all audio mutes immediately
- Tab regains focus → audio resumes UNLESS user has manually muted
- This uses the browser `visibilitychange` event, not Phaser's built-in (more reliable across browsers)

---

### 7. Volume Controls: Settings menu with master volume

Add to `GameState._session` (not persisted — audio prefs reset each session, which is fine for MVP):

```js
_session: {
  isDirty: false,
  lastSavedAt: null,
  userMuted: false,     // NEW — user toggled mute
  masterVolume: 0.7,    // NEW — 0.0 to 1.0
  bgmVolume: 0.7,       // NEW — relative to master
  sfxVolume: 0.8,       // NEW — relative to master
}
```

**UI:** Accessible from the pause menu (press Start/Escape during gameplay). Three sliders:
- Master Volume (0–100%)
- BGM Volume (0–100%)
- SFX Volume (0–100%)
- Mute toggle (M key shortcut)

Since this is a GBC-style game, the "sliders" are actually 10-step selectors navigated with left/right arrows. Each step = 10%. Displayed as `▓▓▓▓▓▓▓░░░` style bars in Press Start 2P font. Maximum GBC aesthetic compliance.

---

### Files Affected

| File | Change |
|---|---|
| `src/data/audio.js` | **New file** — SFX presets, BGM config, registry pattern |
| `assets/audio/bgm-loop-points.json` | Already exists, fill in real loop points when tracks arrive |
| `assets/audio/bgm/` | **New directory** — placeholder `.ogg` files per track |
| `src/scenes/BaseScene.js` | Add `playSfx(id)` method with priority system |
| `src/main.js` | Add `visibilitychange` listener for tab blur muting |
| `src/state/GameState.js` | Add volume fields to `_session` |
| `src/scenes/BattleScene.js` | Call `playSfx()` for damage, heal, status, SLA events |
| `src/ui/DialogBox.js` | Call `playSfx('sfx_text_blip')` per character in typewriter |
| `src/ui/Menu.js` | Call `playSfx('sfx_cursor_move')` / `playSfx('sfx_confirm')` |

---

### Follow-ups

- [ ] **New issue:** Create jsfxr presets for all 20 SFX — needs someone with ears and taste (rare in engineering)
- [ ] **New issue:** Compose placeholder BGM loops in BeepBox — 11 region tracks + 4 battle tracks + 2 jingles = 17 audio files
- [ ] **New issue:** Implement `BaseScene.playSfx()` with priority queue and max-2-concurrent logic
- [ ] **New issue:** Pause menu / settings scene — needs to exist before volume controls can live anywhere
- [ ] **New issue:** `sfx_text_blip` pitch variation — should the blip pitch change per character (a=low, z=high) like Animal Crossing? Cute but maybe annoying

---

### Content Bible Update

Add to design doc under **Audio**:
- One BGM track per region (11 regions + title)
- Four battle themes by encounter type
- Victory/game_over jingles (non-looping)
- 20 SFX with priority levels 1–4
- MVP uses jsfxr for SFX, BeepBox for BGM
- Tab blur mutes all audio
- Volume: 3 sliders (master/BGM/SFX) in 10-step GBC-style selector
- Audio data in `src/data/audio.js` following registry pattern
