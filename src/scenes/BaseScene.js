import Phaser from 'phaser'

// Abstract base class for all Cloud Quest scenes.
// Provides shared utilities: transitions, BGM, dialog delegation.
// Never instantiate directly — always extend.
export class BaseScene extends Phaser.Scene {
  constructor(config) {
    super(config)
    this._currentBgm = null
  }

  // Transition to another scene with a black fade-out.
  // Use this for all gameplay transitions — never call this.scene.start() directly.
  fadeToScene(key, data = {}) {
    this.cameras.main.fadeOut(200, 0, 0, 0)
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(key, data)
    })
  }

  // Play a BGM track by ID, using loop points from bgm-loop-points.json.
  // BootScene loads the JSON and stores it on the registry as 'bgmLoopPoints'.
  // If start/end loop points are set, uses Phaser markers for seamless looping.
  playBgm(trackId) {
    if (this._currentBgm) {
      this._currentBgm.stop()
      this._currentBgm = null
    }
    if (!this.cache.audio.exists(trackId)) return

    const loopPoints    = this.registry.get('bgmLoopPoints') ?? {}
    const loop          = loopPoints[trackId] ?? { start: 0, end: 0 }
    const hasLoopPoints = typeof loop.start === 'number'
      && typeof loop.end === 'number'
      && loop.end > loop.start

    if (hasLoopPoints) {
      const markerName = `${trackId}__loop`
      this._currentBgm = this.sound.add(trackId)
      this._currentBgm.addMarker({
        name:     markerName,
        start:    loop.start,
        duration: loop.end - loop.start,
      })
      this._currentBgm.play(markerName, { loop: true })
    } else {
      this._currentBgm = this.sound.add(trackId, { loop: true })
      this._currentBgm.play()
    }
  }

  // Delegate to the scene's DialogBox instance.
  // Scenes must set this.dialog = new DialogBox(this) in create().
  showDialog(text, callback = null) {
    if (this.dialog) this.dialog.show(text, callback)
  }

  // 9-slice window factory — shared panel builder for all UI chrome.
  // Uses a 9-slice texture when available (PokeRogue-style window assets),
  // falls back to a stroked rectangle otherwise.
  // Following PokeRogue's ui-theme.ts pattern: thin border, dark fill.
  // Returns a game object with origin (0, 0) — top-left positioning.
  createPanel(x, y, width, height, { slice = 4 } = {}) {
    const FILL   = 0x1a1a2a
    const BORDER = 0x334155
    const key = '__base_window_9slice__'
    if (!this.textures.exists(key)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(FILL, 1)
      g.fillRect(0, 0, 24, 24)
      g.lineStyle(2, BORDER, 1)
      g.strokeRect(1, 1, 22, 22)
      g.generateTexture(key, 24, 24)
      g.destroy()
    }

    if (typeof this.add.nineslice === 'function') {
      const panel = this.add.nineslice(x, y, key, undefined, width, height, slice, slice, slice, slice)
      panel.setOrigin(0, 0)
      return panel
    }

    const panel = this.add.rectangle(x, y, width, height, FILL)
    panel.setOrigin(0, 0)
    panel.setStrokeStyle(2, BORDER)
    return panel
  }

  shutdown() {
    if (this._currentBgm) {
      this._currentBgm.stop()
      this._currentBgm = null
    }
  }
}
