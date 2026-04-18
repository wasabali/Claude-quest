import Phaser from 'phaser'
import { CONFIG } from '../config.js'
import { GameState } from '#state/GameState.js'

const SLIDER_STEPS = 10
const STEP_SIZE    = 1 / SLIDER_STEPS  // 0.1 per step

const SLIDERS = [
  { key: 'masterVolume', label: 'MASTER' },
  { key: 'bgmVolume',    label: 'BGM' },
  { key: 'sfxVolume',    label: 'SFX' },
]

const MENU_ITEMS = [...SLIDERS.map(s => s.label), 'MUTE', 'RESUME']

const LABEL_X      = Math.floor(CONFIG.WIDTH * 0.1)
const VALUE_X      = Math.floor(CONFIG.WIDTH * 0.45)
const ARROW_X      = Math.floor(CONFIG.WIDTH * 0.07)
const TITLE_Y      = Math.floor(CONFIG.HEIGHT * 0.1)
const START_Y      = Math.floor(CONFIG.HEIGHT * 0.2)
const LINE_HEIGHT  = Math.floor(CONFIG.HEIGHT * 0.08)
const TITLE_SIZE   = '36px'
const MENU_SIZE    = '18px'

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' })
  }

  create(data = {}) {
    this._returnScene = data.returnScene ?? null
    this._selectedIndex = 0

    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.85)')

    this.add.text(CONFIG.WIDTH / 2, TITLE_Y, 'PAUSED', {
      fontFamily: CONFIG.FONT,
      fontSize: TITLE_SIZE,
      color: '#ffe066',
    }).setOrigin(0.5)

    const textStyle = { fontFamily: CONFIG.FONT, fontSize: MENU_SIZE, color: '#f8f8f8' }

    this._menuTexts = []
    this._valueTexts = []

    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const y = START_Y + i * LINE_HEIGHT

      const label = this.add.text(LABEL_X, y, MENU_ITEMS[i], textStyle)
      this._menuTexts.push(label)

      if (i < SLIDERS.length) {
        const valueText = this.add.text(VALUE_X, y, '', textStyle)
        this._valueTexts.push(valueText)
      } else if (MENU_ITEMS[i] === 'MUTE') {
        const valueText = this.add.text(VALUE_X, y, '', textStyle)
        this._valueTexts.push(valueText)
      }
    }

    this._arrow = this.add.text(ARROW_X, START_Y, '>', {
      fontFamily: CONFIG.FONT,
      fontSize: MENU_SIZE,
      color: '#ffe066',
    })

    this._refreshDisplay()

    this.input.keyboard.on('keydown-UP', () => {
      this._selectedIndex = (this._selectedIndex - 1 + MENU_ITEMS.length) % MENU_ITEMS.length
      this._refreshDisplay()
    })

    this.input.keyboard.on('keydown-DOWN', () => {
      this._selectedIndex = (this._selectedIndex + 1) % MENU_ITEMS.length
      this._refreshDisplay()
    })

    this.input.keyboard.on('keydown-LEFT', () => this._adjustValue(-1))
    this.input.keyboard.on('keydown-RIGHT', () => this._adjustValue(1))

    this.input.keyboard.on('keydown-Z', () => this._confirm())
    this.input.keyboard.on('keydown-ENTER', () => this._confirm())
    this.input.keyboard.on('keydown-ESC', () => this._resume())
    this.input.keyboard.on('keydown-M', () => this._toggleMute())
  }

  _adjustValue(direction) {
    const idx = this._selectedIndex
    if (idx < SLIDERS.length) {
      const slider = SLIDERS[idx]
      const current = GameState._session[slider.key]
      const next = Math.min(1, Math.max(0, Math.round((current + direction * STEP_SIZE) * SLIDER_STEPS) / SLIDER_STEPS))
      GameState._session[slider.key] = next
      this._applyVolumeToActiveScene()
      this._refreshDisplay()
    } else if (MENU_ITEMS[idx] === 'MUTE') {
      this._toggleMute()
    }
  }

  _confirm() {
    const item = MENU_ITEMS[this._selectedIndex]
    if (item === 'MUTE') this._toggleMute()
    else if (item === 'RESUME') this._resume()
  }

  _toggleMute() {
    GameState._session.userMuted = !GameState._session.userMuted
    if (this.sound) {
      this.sound.mute = GameState._session.userMuted
    }
    this._refreshDisplay()
  }

  _resume() {
    if (this._returnScene && this.scene.isPaused(this._returnScene)) {
      this.scene.resume(this._returnScene)
    }
    this.scene.stop('PauseScene')
  }

  _applyVolumeToActiveScene() {
    if (!this._returnScene) return
    const activeScene = this.scene.get(this._returnScene)
    if (activeScene?.refreshBgmVolume) activeScene.refreshBgmVolume()
  }

  _refreshDisplay() {
    this._arrow.setY(START_Y + this._selectedIndex * LINE_HEIGHT)

    for (let i = 0; i < SLIDERS.length; i++) {
      const slider = SLIDERS[i]
      const value = GameState._session[slider.key]
      const filled = Math.round(value * SLIDER_STEPS)
      const bar = '\u2593'.repeat(filled) + '\u2591'.repeat(SLIDER_STEPS - filled)
      this._valueTexts[i].setText(bar)
    }

    // Mute text
    if (this._valueTexts[SLIDERS.length]) {
      this._valueTexts[SLIDERS.length].setText(GameState._session.userMuted ? 'ON' : 'OFF')
    }

    // Highlight selected
    this._menuTexts.forEach((text, i) => {
      text.setColor(i === this._selectedIndex ? '#ffe066' : '#f8f8f8')
    })
  }
}
