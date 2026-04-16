import Phaser from 'phaser'
import { BaseScene }           from '#scenes/BaseScene.js'
import { GameState, markDirty } from '#state/GameState.js'
import { getById }              from '#data/emblems.js'
import { ShineEffect }          from '#ui/ShineEffect.js'
import { CONFIG }               from '../config.js'

// ─── Layout constants ──────────────────────────────────────────────────────────

const HEADER_HEIGHT     = 20  // px — top title bar
const FOOTER_HEIGHT     = 18  // px — bottom hint bar
const GRID_COLS         = 4
const GRID_ROWS         = 2
const EMBLEM_COUNT      = 8
const EMBLEM_IDS        = ['tux', 'pipeline', 'container', 'cloud', 'vault', 'helm', 'finops', 'sre']

// Slot dimensions — dynamically sized to fit CONFIG.WIDTH/HEIGHT
const SLOT_W = Math.floor((CONFIG.WIDTH - 8) / GRID_COLS)   // e.g. 468px @ 1920
const SLOT_H = Math.floor((CONFIG.HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 8) / GRID_ROWS)
const EMBLEM_SIZE = Math.min(SLOT_W, SLOT_H) - 16           // inner emblem square

// Polish-view constants
const POLISH_EMBLEM_SIZE = Math.min(CONFIG.WIDTH, CONFIG.HEIGHT) * 0.25
const SHINE_BAR_W        = Math.floor(CONFIG.WIDTH * 0.4)
const SHINE_BAR_H        = 12
const MAX_SHINE          = 3   // shine 0–3
const MAX_GRIME          = 5   // grime 0–5
const DRAG_REDUCTION_PX  = 40  // px dragged per 1 grime reduction
const DRAG_SHINE_PX      = 60  // px dragged per 1 shine increment (while grime=0)

// Colours — GBC-style palette
const COLOR_BG           = 0x0b1020
const COLOR_PANEL_FILL   = 0x1a1a2a
const COLOR_PANEL_BORDER = 0x4488cc
const COLOR_EARNED       = 0x44cc88
const COLOR_UNEARNED     = 0x334455
const COLOR_CURSOR       = 0xffe066
const COLOR_TEXT         = '#f8f8f8'
const COLOR_DIM_TEXT     = '#556677'
const COLOR_SHINE_BAR    = '#ffe066'
const COLOR_GRIME_COLOR  = '#886644'

// ─── EmblemScene ───────────────────────────────────────────────────────────────

/**
 * EmblemScene — Emblem case display with drag-to-polish minigame.
 *
 * Modes:
 *   'grid'   — 4×2 grid of emblem slots, D-pad navigation
 *   'polish' — Zoom-in view for the selected emblem with drag-to-polish
 *
 * Navigation:
 *   Arrow keys  — move cursor (grid mode)
 *   Z           — select / enter polish mode (grid mode on earned emblem)
 *   X / Escape  — back to previous scene (grid) or back to grid (polish)
 */
export class EmblemScene extends BaseScene {
  constructor() {
    super({ key: 'EmblemScene' })

    this._mode            = 'grid'
    this._cursorIndex     = 0
    this._selectedId      = null
    this._returnSceneKey  = null

    // Rendering objects — cleared on mode switch
    this._gridObjects     = []
    this._polishObjects   = []

    // Shine effects keyed by emblem id
    this._shineEffects    = {}

    // Polish drag state
    this._dragActive      = false
    this._dragAccum       = 0     // accumulated px dragged since last tick
    this._lastPointerX    = 0
    this._lastPointerY    = 0
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────

  init(data = {}) {
    this._returnSceneKey = data.returnSceneKey ?? null
    this._mode           = 'grid'
    this._cursorIndex    = 0
    this._selectedId     = null
  }

  create() {
    this._createBackground()
    this._bindInput()
    this._renderGrid()
  }

  update() {
    // Polish mode: track pointer drag in update() for smooth accumulation
    if (this._mode === 'polish' && this._dragActive) {
      const ptr = this.input.activePointer
      const dx  = ptr.x - this._lastPointerX
      const dy  = ptr.y - this._lastPointerY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 0) {
        this._dragAccum  += dist
        this._lastPointerX = ptr.x
        this._lastPointerY = ptr.y
        this._applyPolishTick()
      }
    }
  }

  shutdown() {
    super.shutdown()
    this._destroyAllShineEffects()
  }

  // ─── Background ─────────────────────────────────────────────────────────────

  _createBackground() {
    this.add.rectangle(
      CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2,
      CONFIG.WIDTH, CONFIG.HEIGHT,
      COLOR_BG
    )
  }

  // ─── Input binding ──────────────────────────────────────────────────────────

  _bindInput() {
    const kb = this.input.keyboard

    kb.on('keydown-UP',     () => this._onUp())
    kb.on('keydown-DOWN',   () => this._onDown())
    kb.on('keydown-LEFT',   () => this._onLeft())
    kb.on('keydown-RIGHT',  () => this._onRight())
    kb.on('keydown-Z',      () => this._onConfirm())
    kb.on('keydown-X',      () => this._onBack())
    kb.on('keydown-ESC',    () => this._onBack())

    // Pointer drag — used in polish mode
    this.input.on('pointerdown', (ptr) => this._onPointerDown(ptr))
    this.input.on('pointerup',   ()    => this._onPointerUp())
  }

  // ─── Cursor navigation (grid mode) ──────────────────────────────────────────

  _onUp() {
    if (this._mode !== 'grid') return
    const row = Math.floor(this._cursorIndex / GRID_COLS)
    const col = this._cursorIndex % GRID_COLS
    const newRow = (row - 1 + GRID_ROWS) % GRID_ROWS
    const next   = newRow * GRID_COLS + col
    if (next < EMBLEM_COUNT) { this._cursorIndex = next; this._refreshGrid() }
  }

  _onDown() {
    if (this._mode !== 'grid') return
    const row = Math.floor(this._cursorIndex / GRID_COLS)
    const col = this._cursorIndex % GRID_COLS
    const newRow = (row + 1) % GRID_ROWS
    const next   = newRow * GRID_COLS + col
    if (next < EMBLEM_COUNT) { this._cursorIndex = next; this._refreshGrid() }
  }

  _onLeft() {
    if (this._mode !== 'grid') return
    const col    = this._cursorIndex % GRID_COLS
    const row    = Math.floor(this._cursorIndex / GRID_COLS)
    const newCol = (col - 1 + GRID_COLS) % GRID_COLS
    this._cursorIndex = row * GRID_COLS + newCol
    this._refreshGrid()
  }

  _onRight() {
    if (this._mode !== 'grid') return
    const col    = this._cursorIndex % GRID_COLS
    const row    = Math.floor(this._cursorIndex / GRID_COLS)
    const newCol = (col + 1) % GRID_COLS
    const next   = row * GRID_COLS + newCol
    if (next < EMBLEM_COUNT) { this._cursorIndex = next; this._refreshGrid() }
  }

  _onConfirm() {
    if (this._mode === 'grid') {
      const id    = EMBLEM_IDS[this._cursorIndex]
      const state = GameState.emblems[id]
      if (!state?.earned) return     // can only inspect earned emblems

      this._selectedId = id
      this._enterPolishMode()
    }
    // In polish mode, Z does nothing extra — drag is the interaction
  }

  _onBack() {
    if (this._mode === 'polish') {
      this._exitPolishMode()
      return
    }
    // In grid mode — return to caller
    this._close()
  }

  // ─── Pointer drag (polish mode) ─────────────────────────────────────────────

  _onPointerDown(ptr) {
    if (this._mode !== 'polish') return

    // Only start drag if pointer is over the emblem area
    const { ex, ey } = this._getPolishEmblemCenter()
    const half       = POLISH_EMBLEM_SIZE / 2
    if (
      ptr.x >= ex - half && ptr.x <= ex + half &&
      ptr.y >= ey - half && ptr.y <= ey + half
    ) {
      this._dragActive   = true
      this._lastPointerX = ptr.x
      this._lastPointerY = ptr.y
    }
  }

  _onPointerUp() {
    this._dragActive = false
  }

  /**
   * Called every update() frame while dragging.
   * Applies polishing incrementally: first reduces grime, then increases shine.
   */
  _applyPolishTick() {
    const id    = this._selectedId
    const entry = GameState.emblems[id]
    if (!entry) return

    let changed = false

    // Phase 1 — reduce grime (only consume px for ticks actually applied)
    if (entry.grime > 0 && this._dragAccum >= DRAG_REDUCTION_PX) {
      const ticks        = Math.floor(this._dragAccum / DRAG_REDUCTION_PX)
      const appliedTicks = Math.min(ticks, entry.grime)
      entry.grime       -= appliedTicks
      this._dragAccum   -= appliedTicks * DRAG_REDUCTION_PX
      changed = true
    }

    // Phase 2 — increase shine (only when grime == 0)
    if (entry.grime === 0 && entry.shine < MAX_SHINE && this._dragAccum >= DRAG_SHINE_PX) {
      const prevShine = entry.shine
      const ticks     = Math.floor(this._dragAccum / DRAG_SHINE_PX)
      entry.shine     = Math.min(MAX_SHINE, entry.shine + ticks)
      this._dragAccum %= DRAG_SHINE_PX

      const effect = this._shineEffects[id]
      if (effect) effect.update(entry.grime, entry.shine)

      // Play burst once when fully polished
      if (prevShine < MAX_SHINE && entry.shine >= MAX_SHINE) {
        if (effect) effect.play()
      }

      changed = true
    } else if (changed) {
      // Grime changed — update effect
      const effect = this._shineEffects[id]
      if (effect) effect.update(entry.grime, entry.shine)
    }

    if (changed) {
      markDirty()
      this._refreshPolishHud()
    }
  }

  // ─── Grid rendering ─────────────────────────────────────────────────────────

  _renderGrid() {

    const cw = CONFIG.WIDTH
    const ch = CONFIG.HEIGHT

    // Header panel
    const header = this._addPanel(cw / 2, HEADER_HEIGHT / 2, cw - 4, HEADER_HEIGHT - 2)
    this._gridObjects.push(header)

    const title = this.add.text(cw / 2, HEADER_HEIGHT / 2, 'CERTIFICATION EMBLEMS', {
      fontFamily: CONFIG.FONT,
      fontSize:   '8px',
      color:      COLOR_TEXT,
    }).setOrigin(0.5, 0.5)
    this._gridObjects.push(title)

    // Footer
    const footer = this._addPanel(cw / 2, ch - FOOTER_HEIGHT / 2, cw - 4, FOOTER_HEIGHT - 2)
    this._gridObjects.push(footer)

    const hint = this.add.text(cw / 2, ch - FOOTER_HEIGHT / 2, 'Z: inspect   X: back', {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      COLOR_TEXT,
    }).setOrigin(0.5, 0.5)
    this._gridObjects.push(hint)

    // Emblem grid
    const gridTop  = HEADER_HEIGHT + 4
    const gridLeft = 4

    for (let i = 0; i < EMBLEM_COUNT; i++) {
      const col = i % GRID_COLS
      const row = Math.floor(i / GRID_COLS)
      const sx  = gridLeft + col * SLOT_W + SLOT_W / 2
      const sy  = gridTop  + row * SLOT_H + SLOT_H / 2

      this._gridObjects.push(...this._renderSlot(i, sx, sy))
    }
  }

  _renderSlot(index, cx, cy) {
    const id      = EMBLEM_IDS[index]
    const meta    = getById(id)
    const state   = GameState.emblems[id]
    const earned  = state?.earned ?? false
    const isSel   = index === this._cursorIndex
    const objects = []

    // Slot background
    const slotBg = this.add.rectangle(cx, cy, SLOT_W - 4, SLOT_H - 4, COLOR_PANEL_FILL)
    slotBg.setStrokeStyle(isSel ? 2 : 1, isSel ? COLOR_CURSOR : COLOR_PANEL_BORDER)
    objects.push(slotBg)

    // Emblem placeholder (coloured square for now — sprites plugged in later)
    const embColor = earned ? COLOR_EARNED : COLOR_UNEARNED
    const embBox   = this.add.rectangle(cx, cy - 6, EMBLEM_SIZE, EMBLEM_SIZE, embColor)
    objects.push(embBox)

    if (!earned) {
      // Lock icon text
      const lock = this.add.text(cx, cy - 6, '?', {
        fontFamily: CONFIG.FONT,
        fontSize:   '12px',
        color:      COLOR_DIM_TEXT,
      }).setOrigin(0.5, 0.5)
      objects.push(lock)
    } else {
      // Grime overlay on earned emblem
      const grime  = state.grime ?? 0
      const alpha  = Phaser.Math.Clamp(grime / MAX_GRIME, 0, 0.85)
      if (alpha > 0) {
        const grimePatch = this.add.rectangle(cx, cy - 6, EMBLEM_SIZE, EMBLEM_SIZE, 0x5a3a1a)
        grimePatch.setAlpha(alpha)
        objects.push(grimePatch)
      }

      // Shine sparkle for fully-polished emblems
      if (state.shine >= MAX_SHINE && grime === 0) {
        const effect = new ShineEffect(this, cx, cy - 6, EMBLEM_SIZE)
        effect.update(grime, state.shine)
        this._shineEffects[id] = effect
      }
    }

    // Emblem name label (abbreviated)
    const label = earned ? (meta?.name ?? id) : '???'
    const nameText = this.add.text(cx, cy + EMBLEM_SIZE / 2 - 2, label, {
      fontFamily: CONFIG.FONT,
      fontSize:   '5px',
      color:      earned ? COLOR_TEXT : COLOR_DIM_TEXT,
      wordWrap:   { width: SLOT_W - 6 },
      align:      'center',
    }).setOrigin(0.5, 0)
    objects.push(nameText)

    // Cursor arrow
    if (isSel) {
      const arrow = this.add.text(cx, cy - SLOT_H / 2 + 2, '▼', {
        fontFamily: CONFIG.FONT,
        fontSize:   '8px',
        color:      `#${COLOR_CURSOR.toString(16).padStart(6, '0')}`,
      }).setOrigin(0.5, 0)
      objects.push(arrow)
    }

    return objects
  }

  _refreshGrid() {
    this._clearGridObjects()
    this._destroyAllShineEffects()
    this._renderGrid()
  }

  _clearGridObjects() {
    this._gridObjects.forEach((o) => o?.destroy())
    this._gridObjects = []
  }

  // ─── Polish mode rendering ───────────────────────────────────────────────────

  _enterPolishMode() {
    this._mode = 'polish'
    this._dragAccum  = 0
    this._dragActive = false

    this._clearGridObjects()
    this._destroyAllShineEffects()
    this._renderPolishView()
  }

  _exitPolishMode() {
    this._dragActive = false
    this._mode = 'grid'

    this._clearPolishObjects()
    this._destroyAllShineEffects()
    this._renderGrid()
  }

  _renderPolishView() {
    this._clearPolishObjects()

    const id    = this._selectedId
    const meta  = getById(id)
    const state = GameState.emblems[id]
    const cw    = CONFIG.WIDTH
    const ch    = CONFIG.HEIGHT
    const { ex, ey } = this._getPolishEmblemCenter()

    // Background panel
    const bg = this._addPanel(cw / 2, ch / 2, cw - 4, ch - 4)
    this._polishObjects.push(bg)

    // Title
    const title = this.add.text(cw / 2, HEADER_HEIGHT / 2 + 2, meta?.name ?? id, {
      fontFamily: CONFIG.FONT,
      fontSize:   '8px',
      color:      COLOR_TEXT,
    }).setOrigin(0.5, 0.5)
    this._polishObjects.push(title)

    // Large emblem placeholder
    const earned = state?.earned ?? false
    const embColor = earned ? COLOR_EARNED : COLOR_UNEARNED
    const embBox   = this.add.rectangle(ex, ey, POLISH_EMBLEM_SIZE, POLISH_EMBLEM_SIZE, embColor)
    this._polishObjects.push(embBox)

    // ShineEffect for this emblem in polish view
    const effect = new ShineEffect(this, ex, ey, POLISH_EMBLEM_SIZE)
    effect.update(state?.grime ?? 0, state?.shine ?? 0)
    this._shineEffects[id] = effect

    // Shine bar + label — rendered separately so we can refresh cheaply
    this._polishHudY = ey + POLISH_EMBLEM_SIZE / 2 + 12
    this._renderPolishHudStatic(id, meta, state, cw)
    this._renderPolishHudDynamic(id, state, cw)

    // Footer hint
    const footer = this._addPanel(cw / 2, ch - FOOTER_HEIGHT / 2, cw - 4, FOOTER_HEIGHT - 2)
    this._polishObjects.push(footer)

    const hint = this.add.text(cw / 2, ch - FOOTER_HEIGHT / 2, 'DRAG to polish   X: back', {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      COLOR_TEXT,
    }).setOrigin(0.5, 0.5)
    this._polishObjects.push(hint)
  }

  _renderPolishHudStatic(id, meta, state, cw) {
    const hudY   = this._polishHudY
    const grime  = state?.grime ?? 0
    const domain = meta?.domain ?? ''

    // Grime description
    const grimeLabel = grime > 0
      ? (meta?.grimeDescription ?? 'Some grime')
      : 'Clean!'
    const grimeText = this.add.text(cw / 2, hudY, grimeLabel, {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      grime > 0 ? COLOR_GRIME_COLOR : COLOR_TEXT,
      wordWrap:   { width: cw - 16 },
      align:      'center',
    }).setOrigin(0.5, 0)
    this._polishObjects.push(grimeText)

    // Domain label
    const domainText = this.add.text(cw / 2, hudY + 16, `Domain: ${domain}`, {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      COLOR_DIM_TEXT,
    }).setOrigin(0.5, 0)
    this._polishObjects.push(domainText)

    // Passive bonus
    const bonus = meta?.passiveBonus ?? ''
    const bonusText = this.add.text(cw / 2, hudY + 28, bonus, {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      '#88ff88',
      wordWrap:   { width: cw - 16 },
      align:      'center',
    }).setOrigin(0.5, 0)
    this._polishObjects.push(bonusText)
  }

  _renderPolishHudDynamic(id, state, cw) {
    // Remove old dynamic HUD objects
    this._polishHudDynamic?.forEach((o) => o?.destroy())
    this._polishHudDynamic = []

    const hudY  = this._polishHudY + 44
    const shine  = state?.shine ?? 0
    const grime  = state?.grime ?? 0

    // Shine label
    const shineLabel = this.add.text(cw / 2 - SHINE_BAR_W / 2, hudY, 'SHINE', {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      COLOR_TEXT,
    })
    this._polishHudDynamic.push(shineLabel)
    this._polishObjects.push(shineLabel)

    // Shine bar background
    const barBg = this.add.rectangle(cw / 2, hudY + 10, SHINE_BAR_W, SHINE_BAR_H, 0x334455)
    barBg.setOrigin(0.5, 0)
    this._polishHudDynamic.push(barBg)
    this._polishObjects.push(barBg)

    // Shine bar fill
    const fillW = Math.floor((shine / MAX_SHINE) * SHINE_BAR_W)
    if (fillW > 0) {
      const barFill = this.add.rectangle(
        cw / 2 - SHINE_BAR_W / 2,
        hudY + 10,
        fillW,
        SHINE_BAR_H,
        shine >= MAX_SHINE ? 0xffd700 : 0xffe066
      )
      barFill.setOrigin(0, 0)
      this._polishHudDynamic.push(barFill)
      this._polishObjects.push(barFill)
    }

    // Shine bar border
    const barBorder = this.add.rectangle(cw / 2, hudY + 10, SHINE_BAR_W, SHINE_BAR_H)
    barBorder.setOrigin(0.5, 0)
    barBorder.setStrokeStyle(1, 0x4488cc)
    barBorder.setFillStyle()
    this._polishHudDynamic.push(barBorder)
    this._polishObjects.push(barBorder)

    // Grime dots
    const grimeY = hudY + 28
    const grimeBarLabel = this.add.text(cw / 2 - SHINE_BAR_W / 2, grimeY, `GRIME: ${'█'.repeat(grime)}${'░'.repeat(MAX_GRIME - grime)}`, {
      fontFamily: CONFIG.FONT,
      fontSize:   '6px',
      color:      grime > 0 ? COLOR_GRIME_COLOR : '#44cc88',
    })
    this._polishHudDynamic.push(grimeBarLabel)
    this._polishObjects.push(grimeBarLabel)

    // Full shine message
    if (shine >= MAX_SHINE && grime === 0) {
      const fullMsg = this.add.text(cw / 2, grimeY + 16, '✦ FULLY POLISHED ✦', {
        fontFamily: CONFIG.FONT,
        fontSize:   '7px',
        color:      '#ffd700',
      }).setOrigin(0.5, 0)
      this._polishHudDynamic.push(fullMsg)
      this._polishObjects.push(fullMsg)
    }
  }

  /**
   * Lightweight refresh of just the dynamic HUD parts (shine bar, grime dots)
   * without destroying the whole polish view.
   */
  _refreshPolishHud() {
    const id    = this._selectedId
    const state = GameState.emblems[id]
    const cw    = CONFIG.WIDTH

    this._polishHudDynamic?.forEach((o) => o?.destroy())
    this._polishHudDynamic = []

    this._renderPolishHudDynamic(id, state, cw)
  }

  _clearPolishObjects() {
    this._polishHudDynamic?.forEach((o) => o?.destroy())
    this._polishHudDynamic = []
    this._polishObjects.forEach((o) => o?.destroy())
    this._polishObjects = []
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _getPolishEmblemCenter() {
    return {
      ex: CONFIG.WIDTH  / 2,
      ey: HEADER_HEIGHT + POLISH_EMBLEM_SIZE / 2 + 8,
    }
  }

  _addPanel(x, y, width, height) {
    const key = '__emblem_scene_panel__'
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(COLOR_PANEL_FILL, 1)
      g.fillRect(0, 0, 24, 24)
      g.lineStyle(2, COLOR_PANEL_BORDER, 1)
      g.strokeRect(1, 1, 22, 22)
      g.generateTexture(key, 24, 24)
      g.destroy()
    }

    if (typeof this.add.nineslice === 'function') {
      return this.add.nineslice(x, y, key, undefined, width, height, 4, 4, 4, 4)
    }

    const panel = this.add.rectangle(x, y, width, height, COLOR_PANEL_FILL)
    panel.setStrokeStyle(1, COLOR_PANEL_BORDER)
    return panel
  }

  _destroyAllShineEffects() {
    Object.values(this._shineEffects).forEach((e) => e?.destroy())
    this._shineEffects = {}
  }

  _close() {
    if (this._returnSceneKey && this.scene.isPaused(this._returnSceneKey)) {
      this.scene.resume(this._returnSceneKey)
      this.scene.stop('EmblemScene')
    } else if (this._returnSceneKey) {
      this.fadeToScene(this._returnSceneKey)
    } else {
      this.scene.stop('EmblemScene')
    }
  }
}
