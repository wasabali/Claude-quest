## ✅ Resolution — Movement System

> *"Four directions. One grid. Zero diagonal energy. Just like the real GBC, except your character is an engineer who can't run until Act 2 because HR hasn't approved the 'sudo' running shoes yet."*

---

### 1. Smooth Slide Between Tiles (not instant snap)

**Smooth slide**, exactly like GBC Pokemon. The sprite visually slides between tile positions over a fixed duration. The player is always logically on a tile, but visually interpolates between the previous tile and the target tile.

**Current implementation status:** WorldScene already uses Arcade Physics velocity (`this._player.setVelocity(vx, vy)`) which gives smooth movement, but it's **free-form** — not tile-locked. This needs to change to a **tile-step** system.

**Target behavior:**
- Player presses a direction key
- Movement system checks if the target tile is walkable
- If yes: sprite slides to the target tile center over `STEP_DURATION` ms
- If no: sprite does a tiny "bump" animation (2px towards wall, bounce back) — 100ms
- Player position updates to the new tile only after the slide completes
- `GameState.player.tileX` / `GameState.player.tileY` track logical position

**Timing:**
- Base walk speed: **2 tiles/second** = 500ms per tile step
- Run speed (Act 2+): **4 tiles/second** = 250ms per tile step
- These match the existing `WALK_SPEED = TILE_SIZE * 2` (96 px/sec at 48px tiles = 2 tiles/sec) ✓

**Implementation:** Replace the current velocity-based movement with a **tile stepper** — a state machine that tracks `{ state: 'idle' | 'stepping', targetTile, progress }`. This runs in `WorldScene.update()` and lerps the sprite position. No Phaser tweens (rule: no smooth tweening) — use manual `lerp(from, to, t)` with frame-counted progress in whole pixel increments.

```js
// Movement state machine (lives in WorldScene, reads from GameState)
// NOT an engine file — this is rendering/input logic, belongs in the scene.
const STEP_DURATION_MS = 500  // base walk
const RUN_DURATION_MS  = 250  // with sudo shoes

_updateMovement(delta) {
  if (this._moveState === 'stepping') {
    this._moveProgress += delta
    const duration = this._isRunning ? RUN_DURATION_MS : STEP_DURATION_MS
    const t = Math.min(this._moveProgress / duration, 1)
    // Lerp position in whole pixels only (pixelArt compliance)
    this._player.x = Math.round(lerp(this._fromX, this._toX, t))
    this._player.y = Math.round(lerp(this._fromY, this._toY, t))
    if (t >= 1) {
      this._moveState = 'idle'
      this._onStepComplete()
    }
    return
  }
  // 'idle' — check for new input
  const dir = this._getInputDirection()
  if (!dir) return
  this._facing = dir
  const target = this._getTileInDirection(dir)
  if (!this._isTileWalkable(target)) {
    this._playBumpAnimation()
    return
  }
  this._startStep(target)
}
```

---

### 2. Cannot Change Direction Mid-Step

**No.** Once a step begins, it completes fully. The player cannot change direction, cancel, or reverse mid-slide. Input during a step is **buffered** — if the player presses a new direction during the last 30% of a step, that direction is queued and fires immediately when the step completes.

This matches GBC Pokemon exactly and feels snappy:
- Press Right → sprite starts sliding right
- Press Up during the slide → buffered
- Step completes → immediately starts sliding up
- No "stuck" feeling because of the input buffer

**Input buffer window:** Last 150ms of a step (30% of 500ms walk, 60% of 250ms run). This is tunable in `src/config.js`.

---

### 3. Run Mechanic: Unlocked at Act 2 via "sudo Running Shoes"

**No running at game start.** Running is gated behind a key item:

- **Item:** `sudo_running_shoes` — *"sudo chmod +x legs.sh. Your movement speed has been elevated. Side effects include increased encounter rate and the disapproval of your sysadmin."*
- **Unlocked:** Act 2, reward from a quest (probably the first quest in Pipeline Pass)
- **Activation:** Hold Z key while moving (same key as interact when standing still)
- **Speed:** 2x walk speed (4 tiles/second, 250ms per step)
- **Visual:** Player sprite uses a 2-frame "fast walk" animation (legs blur) instead of the normal 4-frame walk cycle

**Item definition:**
```js
sudo_running_shoes: {
  id: 'sudo_running_shoes',
  displayName: 'sudo Running Shoes',
  tab: 'keyItems',
  description: 'sudo chmod +x legs.sh. 2x movement speed while holding Z. Encounter rate +50%.',
  usableInBattle: false,
  battleAction: 'examine',
  worldActions: ['examine'],
  effect: null,  // passive — checked by movement system
}
```

**Check:** `hasItem('keyItems', 'sudo_running_shoes') && zKeyDown`

---

### 4. Running Increases Encounter Rate by 50%

**Yes.** When running, the encounter check gets a 1.5x multiplier.

Current `EncounterEngine.selectFromPool()` takes a seed and stepCount. The running modifier should be applied at the **encounter trigger check** level (in WorldScene), not inside EncounterEngine itself:

```js
// In WorldScene._onStepComplete()
_onStepComplete() {
  this._stepCount++
  const baseChance = ENCOUNTER_BASE_CHANCE        // e.g. 0.08 (8% per step)
  const runMultiplier = this._isRunning ? 1.5 : 1.0
  const chance = baseChance * runMultiplier
  if (seededRandom(seed ^ this._stepCount) < chance) {
    // trigger encounter via EncounterEngine.selectFromPool()
  }
}
```

**Constants** (add to `src/config.js`):
```js
export const ENCOUNTER_BASE_CHANCE   = 0.08   // 8% per step while walking
export const ENCOUNTER_RUN_MULTIPLIER = 1.5   // +50% when running
export const ENCOUNTER_COOLDOWN_STEPS = 4     // minimum steps between encounters
```

The cooldown prevents the "two encounters in two steps" frustration.

---

### 5. Map Edges: Invisible walls + transition triggers

Two types of map edge behavior:

**A. Boundary edges (no exit):** Invisible collision wall. The player's bump animation plays. No visible wall tile needed — the collision layer's edge tiles handle this. This is already partially implemented via `this._player.setCollideWorldBounds(true)` and the Collision tilemap layer.

**B. Region connection edges (exits):** Transition trigger tiles on the map edge. When the player steps onto one, a scene transition fires:
- Screen fades to black (200ms — using existing `BaseScene.fadeToScene()`)
- New WorldScene loads with the target region
- Player spawns at the corresponding entry point on the new map
- New region BGM crossfades in

**Transition tile data** (in the Tiled map, Objects layer):
```json
{
  "name": "exit_east",
  "type": "transition",
  "properties": {
    "targetRegion": "pipeline_pass",
    "targetSpawnX": 1,
    "targetSpawnY": 8,
    "requiredItem": null,
    "requiredFlag": null
  }
}
```

Some transitions require items/flags (e.g., `staging_env_token` to enter Staging Valley). If blocked: *"You need [item] to proceed. The path is blocked by a 403 Forbidden."*

---

### 6. Strictly 4-Direction, No Diagonal

**Absolutely no diagonal movement.** This is a GBC game and we are committed to the bit.

**Current bug:** The existing WorldScene allows diagonal movement! Lines 172-173:
```js
if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }
```

This normalizes diagonal velocity instead of preventing it. The tile-step refactor fixes this automatically because the direction input function must return exactly one of `'up' | 'down' | 'left' | 'right' | null`.

**Priority when multiple keys pressed:** Vertical wins (up/down takes precedence over left/right). This matches GBC Pokemon and feels natural for grid movement.

---

### 7. No Ledges (MVP)

**No ledges for MVP.** They require:
- Custom tile collision logic (one-way passability)
- Jump animation (a separate sprite state)
- Map design constraints that are hard to retrofit

**Post-MVP candidate:** Add ledges as a map feature type when overworld content expands. Design note: ledges in Cloud Quest would be "deprecated API endpoints" — you can fall down to the old version but can't climb back up to the modern one.

---

### 8. No Slippery Tiles (MVP)

**No slippery tiles for MVP.** But they're a *perfect* gym puzzle mechanic for the Kubernetes Gym ("ice floor" = "frictionless container orchestration where pods slide until they hit something").

**Post-MVP spec (for when we add it):**
- Player steps onto a slippery tile → slides in current facing direction until hitting a non-slippery tile or wall
- No encounters trigger during slides
- Slide speed: 2x run speed (8 tiles/second)
- Use case: gym puzzles where you must navigate a grid by strategically bouncing off walls

---

### 9. Interact Facing: Yes, A Button

**Yes.** The player presses the A button (mapped to Z key) while standing still and facing an object/NPC. The interaction targets the tile directly in front of the player.

**Already implemented** in WorldScene `_tryInteract()`:
```js
const OFFSETS = {
  up:    [  0,     -reach ],
  down:  [  0,      reach ],
  left:  [ -reach,  0     ],
  right: [  reach,  0     ],
}
```

This works but needs a minor fix: the reach calculation uses pixel distance (`TILE_SIZE * 1.5`) which is approximate. After the tile-step refactor, interaction should check the **exact adjacent tile** in the facing direction:

```js
_tryInteract() {
  const OFFSETS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
  const [dx, dy] = OFFSETS[this._facing]
  const targetTileX = this._tileX + dx
  const targetTileY = this._tileY + dy
  // Check NPC/object at (targetTileX, targetTileY)
}
```

This is more precise and eliminates edge cases where the player could interact with NPCs diagonally or at odd angles.

---

### Data Shape Changes

**New fields in `src/config.js`:**

```js
// Movement constants
export const MOVEMENT = {
  STEP_DURATION_MS:          500,   // base walk: 2 tiles/sec
  RUN_STEP_DURATION_MS:      250,   // run: 4 tiles/sec
  INPUT_BUFFER_WINDOW_MS:    150,   // buffer input in last 150ms of step
  BUMP_DURATION_MS:          100,   // wall bump animation
  BUMP_DISTANCE_PX:          2,     // pixels to bump towards wall
}

export const ENCOUNTER_BASE_CHANCE    = 0.08
export const ENCOUNTER_RUN_MULTIPLIER = 1.5
export const ENCOUNTER_COOLDOWN_STEPS = 4
```

**New fields in `GameState.player`:**

```js
player: {
  // ...existing fields...
  tileX: 5,    // logical tile position (replaces pixel-based tracking)
  tileY: 10,
}
```

**New item in `src/data/items.js`:**

```js
sudo_running_shoes: {
  id: 'sudo_running_shoes',
  displayName: 'sudo Running Shoes',
  tab: 'keyItems',
  description: 'sudo chmod +x legs.sh. 2x movement speed while holding Z. Encounter rate +50%.',
  usableInBattle: false,
  battleAction: 'examine',
  worldActions: ['examine'],
  effect: null,
}
```

---

### Files Affected

| File | Change |
|---|---|
| `src/scenes/WorldScene.js` | **Major refactor** — replace velocity movement with tile-step state machine. Remove diagonal. Add input buffer. Add run check. Fix interaction to use tile coords. |
| `src/config.js` | Add `MOVEMENT` constants, encounter rate constants |
| `src/state/GameState.js` | Add `tileX`/`tileY` to player, add to `initNewGame()` |
| `src/data/items.js` | Add `sudo_running_shoes` |
| `src/engine/EncounterEngine.js` | No changes — encounter rate multiplier is applied in WorldScene before calling selectFromPool |
| `src/overrides.js` | Add `RUN_OVERRIDE: null` for testing running without the item |

---

### Follow-ups

- [ ] **New issue:** Implement tile-step movement state machine in WorldScene (this is the big one)
- [ ] **New issue:** Define map transition trigger format for Tiled maps
- [ ] **New issue:** Create `sudo_running_shoes` quest in Pipeline Pass (Act 2 reward)
- [ ] **New issue:** Player sprite walk cycle — need 4-frame animation per direction (16 frames total) plus 2-frame run cycle per direction (8 frames)
- [ ] **New issue:** Slippery tile system for post-MVP gym puzzles (spec is above, ready to implement later)
- [ ] **Bug:** Current WorldScene allows diagonal movement (line 172) — fix is included in the tile-step refactor

---

### Content Bible Update

Add to design doc under **Movement**:
- Smooth tile-step movement (not instant, not free-form)
- 500ms per step walk, 250ms per step run
- No direction change mid-step; input buffer in last 150ms
- `sudo_running_shoes` key item unlocks running at Act 2
- Running increases encounter rate by 50%
- 4-direction only, no diagonal (existing diagonal code is a bug)
- Map edges: collision walls for boundaries, transition triggers for region connections
- No ledges or slippery tiles for MVP (both have post-MVP specs ready)
- Interaction: A button while facing, checks exact adjacent tile
- New config constants: `MOVEMENT.*`, `ENCOUNTER_*`
