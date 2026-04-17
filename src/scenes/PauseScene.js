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

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' })
  }

  create(data = {}) {
    this._returnScene = data.returnScene ?? null
    this._selectedIndex = 0

    this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.85)')

    const textStyle = { fontFamily: CONFIG.FONT, fontSize: '18px', color: '#f8f8f8' }
    const startY = 200

    this.add.text(CONFIG.WIDTH / 2, 100, 'PAUSED', {
      fontFamily: CONFIG.FONT,
      fontSize: '36px',
      color: '#ffe066',
    }).setOrigin(0.5)

    this._menuTexts = []
    this._valueTexts = []

    for (let i = 0; i < MENU_ITEMS.length; i++) {
      const y = startY + i * 80

      const label = this.add.text(200, y, MENU_ITEMS[i], textStyle)
      this._menuTexts.push(label)

      if (i < SLIDERS.length) {
        const valueText = this.add.text(800, y, '', textStyle)
        this._valueTexts.push(valueText)
      } else if (MENU_ITEMS[i] === 'MUTE') {
        const valueText = this.add.text(800, y, '', textStyle)
        this._valueTexts.push(valueText)
      }
    }

    this._arrow = this.add.text(140, startY, '>', {
      fontFamily: CONFIG.FONT,
      fontSize: '18px',
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

  _refreshDisplay() {
    const startY = 200

    this._arrow.setY(startY + this._selectedIndex * 80)

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
