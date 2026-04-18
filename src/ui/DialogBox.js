// Typewriter-style dialog box for Cloud Quest.
// Renders at the bottom ~20% of the screen with a 9-slice window panel.
// Z/Enter advances; X skips to end of current page. Blinking ▼ on wait.
//
// Usage:
//   this.dialog = new DialogBox(this)
//   this.dialog.show(['Line one text.', 'Second page text.'], () => { /* done */ })

import { CONFIG } from '../config.js'

// Layout constants — positions derived from CONFIG.HEIGHT/WIDTH.
const BOX_HEIGHT      = 216  // ~20% of 1080
const BOX_Y           = CONFIG.HEIGHT - BOX_HEIGHT
const BOX_PADDING_X   = 24
const BOX_PADDING_Y   = 20
const FONT_SIZE       = '22px'
const CHARS_PER_SEC   = 40
const BLINK_MS        = 400
const PANEL_KEY       = 'dialog_window_9slice'
const CHOICE_OFFSET_Y   = 36
const CHOICE_LINE_HEIGHT = 32

export class DialogBox {
  /**
   * @param {Phaser.Scene} scene - The scene that owns this dialog box.
   */
  constructor(scene) {
    this.scene    = scene
    this._active  = false
    this._pages   = []
    this._pageIdx = 0
    this._onDone  = null
    this._charIdx = 0
    this._typing  = false

    this._ensureTexture()
    this._buildChrome()
    this.hide()
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Display a sequence of dialog pages with a typewriter effect.
   * @param {string|string[]} lines  - A single string or array of pages.
   * @param {Function|null}   onDone - Called when the last page is dismissed.
   */
  show(lines, onDone = null) {
    this._pages   = Array.isArray(lines) ? lines : [lines]
    this._pageIdx = 0
    this._onDone  = onDone
    this._active  = true

    this._container.setVisible(true)
    this._startPage(0)
  }

  /** Hide the dialog box immediately (use when scene ends). */
  hide() {
    this._active = false
    this._stopTyping()
    this._container.setVisible(false)
  }

  /** Advance — called on Z/Enter. Next page or dismiss. */
  advance() {
    if (!this._active) return

    // Still typing — skip to end of current page.
    if (this._typing) {
      this._skipToEnd()
      return
    }

    // At end of last page — dismiss.
    if (this._pageIdx >= this._pages.length - 1) {
      this.hide()
      if (this._onDone) {
        const cb = this._onDone
        this._onDone = null
        cb()
      }
      return
    }

    // Move to next page.
    this._pageIdx++
    this._startPage(this._pageIdx)
  }

  /** Skip to end of current page only (X button). */
  skip() {
    if (!this._active || !this._typing) return
    this._skipToEnd()
  }

  /**
   * Show a list of choices and invoke onSelect with the selected index.
   * @param {string}   prompt   - Text shown above the choices.
   * @param {string[]} choices  - Array of choice labels.
   * @param {Function} onSelect - Called with the 0-based index chosen.
   */
  showChoices(prompt, choices, onSelect) {
    this._choiceMode     = true
    this._choices        = choices
    this._choiceIndex    = 0
    this._onChoiceSelect = onSelect
    this._active         = true

    this._container.setVisible(true)
    this._prompt.setVisible(false)

    this._destroyChoiceTexts()

    this._text.setText(prompt)

    const startY = BOX_Y + BOX_PADDING_Y + CHOICE_OFFSET_Y
    this._choiceTexts = choices.map((label, i) => {
      const prefix = i === 0 ? '► ' : '  '
      return this.scene.add.text(
        BOX_PADDING_X,
        startY + i * CHOICE_LINE_HEIGHT,
        prefix + label,
        {
          fontFamily:  CONFIG.FONT,
          fontSize:    '18px',
          color:       '#f8f8f8',
          wordWrap:    { width: CONFIG.WIDTH - BOX_PADDING_X * 2 },
        },
      )
    })
    this._choiceTexts.forEach(t => this._container.add(t))
  }

  /** Move choice cursor. dir: -1 (up) or +1 (down). */
  moveChoice(dir) {
    if (!this._choiceMode || !this._choices) return
    this._choiceIndex = Math.max(0, Math.min(this._choices.length - 1, this._choiceIndex + dir))
    this._choiceTexts.forEach((t, i) => {
      t.setText((i === this._choiceIndex ? '► ' : '  ') + this._choices[i])
    })
  }

  /** Confirm the current choice selection. */
  confirmChoice() {
    if (!this._choiceMode) return
    const idx = this._choiceIndex
    this._endChoiceMode()
    if (this._onChoiceSelect) {
      const cb = this._onChoiceSelect
      this._onChoiceSelect = null
      cb(idx)
    }
  }

  /** True while the dialog box is visible. */
  get isActive() {
    return this._active
  }

  /** True when showing a choice menu. */
  get isChoiceMode() {
    return this._choiceMode === true
  }

  /** Clean up Phaser objects — call when scene shuts down. */
  destroy() {
    this._active = false
    this._stopTyping()
    this._destroyChoiceTexts()
    if (this._blinkTimer) {
      this._blinkTimer.remove()
      this._blinkTimer = null
    }
    this._container.destroy()
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  _ensureTexture() {
    if (this.scene.textures.exists(PANEL_KEY)) return

    // Procedural dark panel with a subtle light border.
    const g = this.scene.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0x0d1117, 1)
    g.fillRect(0, 0, 16, 16)
    g.fillStyle(0x334155, 1)
    g.fillRect(0, 0, 16, 2)    // top
    g.fillRect(0, 14, 16, 2)   // bottom
    g.fillRect(0, 0, 2, 16)    // left
    g.fillRect(14, 0, 2, 16)   // right
    g.generateTexture(PANEL_KEY, 16, 16)
    g.destroy()
  }

  _buildChrome() {
    this._container = this.scene.add.container(0, 0)
    this._container.setDepth(100)

    // Background panel.
    if (typeof this.scene.add.nineslice === 'function' && this.scene.textures.exists(PANEL_KEY)) {
      this._bg = this.scene.add.nineslice(0, BOX_Y, PANEL_KEY, 0, CONFIG.WIDTH, BOX_HEIGHT, 4, 4, 4, 4)
        .setOrigin(0, 0)
    } else {
      this._bg = this.scene.add.rectangle(0, BOX_Y, CONFIG.WIDTH, BOX_HEIGHT, 0x0d1117)
        .setOrigin(0, 0)
        .setStrokeStyle(2, 0x334155)
    }
    this._container.add(this._bg)

    // Text body.
    this._text = this.scene.add.text(
      BOX_PADDING_X,
      BOX_Y + BOX_PADDING_Y,
      '',
      {
        fontFamily:  CONFIG.FONT,
        fontSize:    FONT_SIZE,
        color:       '#f8f8f8',
        wordWrap:    { width: CONFIG.WIDTH - BOX_PADDING_X * 2 },
        lineSpacing: 8,
      },
    )
    this._container.add(this._text)

    // Blinking ▼ prompt at bottom-right.
    this._prompt = this.scene.add.text(
      CONFIG.WIDTH - BOX_PADDING_X,
      CONFIG.HEIGHT - BOX_PADDING_Y - 8,
      '▼',
      {
        fontFamily: CONFIG.FONT,
        fontSize:   FONT_SIZE,
        color:      '#ffe066',
      },
    ).setOrigin(1, 1).setVisible(false)
    this._container.add(this._prompt)

    // Blink timer — suppressed during choice mode so ▼ stays hidden.
    this._blinkTimer = this.scene.time.addEvent({
      delay:    BLINK_MS,
      loop:     true,
      callback: () => {
        if (!this._active || this._typing || this._choiceMode) return
        this._prompt.setVisible(!this._prompt.visible)
      },
    })
  }

  _startPage(index) {
    const fullText = this._pages[index] ?? ''
    this._text.setText('')
    this._prompt.setVisible(false)
    this._charIdx = 0
    this._typing  = true

    // ms per character — derived from CHARS_PER_SEC.
    const delay = Math.floor(1000 / CHARS_PER_SEC)

    this._typeTimer = this.scene.time.addEvent({
      delay,
      repeat: fullText.length - 1,
      callback: () => {
        this._charIdx++
        this._text.setText(fullText.slice(0, this._charIdx))
        if (this._charIdx >= fullText.length) {
          this._finishTyping()
        }
      },
    })
  }

  _finishTyping() {
    this._typing = false
    this._prompt.setVisible(true)
    if (this._typeTimer) {
      this._typeTimer.destroy()
      this._typeTimer = null
    }
  }

  _skipToEnd() {
    const fullText = this._pages[this._pageIdx] ?? ''
    this._stopTyping()
    this._text.setText(fullText)
    this._finishTyping()
  }

  _stopTyping() {
    this._typing = false
    if (this._typeTimer) {
      this._typeTimer.destroy()
      this._typeTimer = null
    }
  }

  _endChoiceMode() {
    this._choiceMode = false
    this._destroyChoiceTexts()
    this.hide()
  }

  _destroyChoiceTexts() {
    if (this._choiceTexts) {
      this._choiceTexts.forEach(t => t.destroy())
      this._choiceTexts = null
    }
  }
}
