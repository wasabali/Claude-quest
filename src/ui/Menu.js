// Menu.js — Reusable D-pad navigable list menu for Cloud Quest.
// No battle-specific logic. Scenes pass items and receive selection callbacks.
//
// Usage:
//   const menu = new Menu(scene, [
//     { label: 'kubectl rollout restart', value: 'kubectl_rollout_restart' },
//     { label: 'blame DNS',              value: 'blame_dns', disabled: true },
//   ], { x: 10, y: 400, width: 600, onSelect: (item) => { ... }, onCancel: () => { ... } })
//   menu.show()

import { CONFIG } from '../config.js'

const LINE_HEIGHT    = 40
const ARROW_CHAR     = '►'
const FONT_SIZE      = '22px'
const COLOR_NORMAL   = '#f8f8f8'
const COLOR_SELECTED = '#ffe066'
const COLOR_DISABLED = '#555555'
const PANEL_KEY      = 'menu_window_9slice'

export class Menu {
  constructor(scene, items, options = {}) {
    this.scene     = scene
    this._items    = items
    this._x        = options.x ?? 0
    this._y        = options.y ?? 0
    this._width    = options.width ?? CONFIG.WIDTH
    this._onSelect = options.onSelect ?? null
    this._onCancel = options.onCancel ?? null
    this._index    = this._findFirstEnabled(items)
    this._visible  = false

    this._ensureTexture()
    this._build()
    this.hide()
  }

  show() {
    this._visible = true
    this._container.setVisible(true)
    this._refreshAll()
  }

  hide() {
    this._visible = false
    this._container.setVisible(false)
  }

  destroy() {
    this._container.destroy()
  }

  get isVisible() {
    return this._visible
  }

  get selectedIndex() {
    return this._index
  }

  get selectedItem() {
    return this._items[this._index] ?? null
  }

  setItems(items) {
    this._items = items
    this._index = this._findFirstEnabled(items)
    this._rebuild()
    if (this._visible) this._refreshAll()
  }

  handleInput(key) {
    if (!this._visible) return

    if (key === 'up') {
      this._moveUp()
    } else if (key === 'down') {
      this._moveDown()
    } else if (key === 'confirm') {
      this._confirm()
    } else if (key === 'cancel') {
      if (this._onCancel) this._onCancel()
    }
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _ensureTexture() {
    if (this.scene.textures.exists(PANEL_KEY)) return

    const g = this.scene.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x0d1117, 1)
    g.fillRect(0, 0, 16, 16)
    g.fillStyle(0x334155, 1)
    g.fillRect(0, 0, 16, 2)
    g.fillRect(0, 14, 16, 2)
    g.fillRect(0, 0, 2, 16)
    g.fillRect(14, 0, 2, 16)
    g.generateTexture(PANEL_KEY, 16, 16)
    g.destroy()
  }

  _build() {
    this._container = this.scene.add.container(0, 0).setDepth(90)

    const totalHeight = this._items.length * LINE_HEIGHT + 20
    if (typeof this.scene.add.nineslice === 'function' && this.scene.textures.exists(PANEL_KEY)) {
      this._bg = this.scene.add.nineslice(
        this._x, this._y, PANEL_KEY, 0,
        this._width, totalHeight, 4, 4, 4, 4,
      ).setOrigin(0, 0)
    } else {
      this._bg = this.scene.add.rectangle(
        this._x, this._y, this._width, totalHeight, 0x0d1117,
      ).setOrigin(0, 0).setStrokeStyle(2, 0x334155)
    }
    this._container.add(this._bg)

    this._arrow = this.scene.add.text(
      this._x + 10,
      this._y + 10,
      ARROW_CHAR,
      { fontFamily: CONFIG.FONT, fontSize: FONT_SIZE, color: COLOR_SELECTED },
    )
    this._container.add(this._arrow)

    this._labels = []
    for (let i = 0; i < this._items.length; i++) {
      const item = this._items[i]
      const label = this.scene.add.text(
        this._x + 40,
        this._y + 10 + i * LINE_HEIGHT,
        item.label,
        { fontFamily: CONFIG.FONT, fontSize: FONT_SIZE, color: COLOR_NORMAL },
      )
      this._labels.push(label)
      this._container.add(label)
    }
  }

  _rebuild() {
    this._container.destroy()
    this._build()
    if (this._visible) this._container.setVisible(true)
  }

  _refreshAll() {
    this._arrow.setY(this._y + 10 + this._index * LINE_HEIGHT)
    for (let i = 0; i < this._labels.length; i++) {
      const item = this._items[i]
      const isSelected = i === this._index
      if (item.disabled) {
        this._labels[i].setColor(COLOR_DISABLED)
      } else {
        this._labels[i].setColor(isSelected ? COLOR_SELECTED : COLOR_NORMAL)
      }
    }
  }

  _moveUp() {
    let next = this._index - 1
    while (next >= 0 && this._items[next].disabled) next--
    if (next >= 0) {
      this._index = next
      this._refreshAll()
    }
  }

  _moveDown() {
    let next = this._index + 1
    while (next < this._items.length && this._items[next].disabled) next++
    if (next < this._items.length) {
      this._index = next
      this._refreshAll()
    }
  }

  _confirm() {
    const item = this._items[this._index]
    if (!item || item.disabled) return
    if (this._onSelect) this._onSelect(item)
  }

  _findFirstEnabled(items) {
    const idx = items.findIndex(item => !item.disabled)
    return idx === -1 ? 0 : idx
  }
}
