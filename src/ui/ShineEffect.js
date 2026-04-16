import Phaser from 'phaser'

// ShineEffect — pure rendering component for polished emblems.
// Reads shine/grime values; never writes them.
// Shows a grime overlay (semi-transparent rect) and sparkle particles when shine >= 3.
export class ShineEffect {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x  — centre x of the emblem
   * @param {number} y  — centre y of the emblem
   * @param {number} size — width/height of the emblem area in pixels
   */
  constructor(scene, x, y, size = 32) {
    this.scene = scene
    this.x     = x
    this.y     = y
    this.size  = size

    // Grime overlay — semi-transparent brown rectangle
    this._grimeOverlay = scene.add.rectangle(x, y, size, size, 0x5a3a1a)
    this._grimeOverlay.setAlpha(0)
    this._grimeOverlay.setDepth(10)

    // Sparkle particles (star-shaped dots, white/yellow)
    this._emitter = null
    this._createEmitter()

  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Update the visual state whenever grime or shine changes.
   * @param {number} grime  0–5 (5 = dirtiest)
   * @param {number} shine  0–3 (3 = fully polished)
   */
  update(grime, shine) {
    // Grime overlay — opacity proportional to grime level (0–5 range)
    const grimeAlpha = Phaser.Math.Clamp(grime / 5, 0, 0.9)
    this._grimeOverlay.setAlpha(grimeAlpha)

    // Show sparkle emitter only at full shine (3) with no grime
    if (shine >= 3 && grime === 0) {
      if (this._emitter && !this._emitter.active) {
        this._emitter.start()
      }
    } else {
      if (this._emitter && this._emitter.active) {
        this._emitter.stop()
      }
    }
  }

  /**
   * Fire a one-shot burst sparkle animation (called once when shine first reaches 3).
   */
  play() {
    if (!this._emitter) return
    this._emitter.explode(12)

    // Also flash the grime overlay white briefly
    this._grimeOverlay.setFillStyle(0xffffff)
    this._grimeOverlay.setAlpha(0.6)
    this.scene.tweens.add({
      targets:  this._grimeOverlay,
      alpha:    0,
      duration: 400,
      ease:     'Linear',
      onComplete: () => {
        this._grimeOverlay.setFillStyle(0x5a3a1a)
        this._grimeOverlay.setAlpha(0)
      },
    })
  }

  /**
   * Remove all Phaser objects created by this effect.
   */
  destroy() {
    this._grimeOverlay?.destroy()
    this._emitter?.destroy()
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  _createEmitter() {
    // Build a tiny star-dot texture procedurally so we don't need an asset file
    const texKey = '__shine_star__'
    if (!this.scene.textures.exists(texKey)) {
      const g = this.scene.make.graphics({ x: 0, y: 0, add: false })
      g.fillStyle(0xffffff, 1)
      g.fillRect(1, 0, 2, 4)  // vertical bar
      g.fillRect(0, 1, 4, 2)  // horizontal bar
      g.generateTexture(texKey, 4, 4)
      g.destroy()
    }

    // Phaser 3.60+ particle API (ParticleEmitter directly on add.particles)
    const particles = this.scene.add.particles(this.x, this.y, texKey, {
      speed:      { min: 20, max: 60 },
      scale:      { start: 1, end: 0 },
      alpha:      { start: 1, end: 0 },
      lifespan:   500,
      quantity:   1,
      frequency:  200,
      tint:       [0xffffff, 0xffe066, 0xffd84f],
      angle:      { min: 0, max: 360 },
      emitting:   false,
    })

    particles.setDepth(20)
    this._emitter = particles
  }
}
