import Phaser from 'phaser'
import { GameState } from '#state/GameState.js'
import { getSfxPreset, getBgmConfig } from '#data/audio.js'

const MAX_CONCURRENT_SFX = 2

// Abstract base class for all Cloud Quest scenes.
// Provides shared utilities: transitions, BGM, SFX, dialog delegation.
// Never instantiate directly — always extend.
export class BaseScene extends Phaser.Scene {
  constructor(config) {
    super(config)
    this._currentBgm  = null
    this._activeSfx    = []  // currently playing SFX instances
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
  // Respects GameState._session volume settings.
  playBgm(trackId) {
    if (this._currentBgm) {
      this._currentBgm.stop()
      this._currentBgm = null
    }
    if (!this.cache.audio.exists(trackId)) return

    const bgmDef        = getBgmConfig(trackId)
    const baseVol       = bgmDef?.volume ?? 0.5
    const session       = GameState._session
    const effectiveVol  = baseVol * session.masterVolume * session.bgmVolume

    const loopPoints    = this.registry.get('bgmLoopPoints') ?? {}
    const loop          = loopPoints[trackId] ?? { start: 0, end: 0 }
    const hasLoopPoints = typeof loop.start === 'number'
      && typeof loop.end === 'number'
      && loop.end > loop.start

    const shouldLoop = bgmDef ? bgmDef.loop : true

    if (hasLoopPoints) {
      const markerName = `${trackId}__loop`
      this._currentBgm = this.sound.add(trackId, { volume: effectiveVol })
      this._currentBgm.addMarker({
        name:     markerName,
        start:    loop.start,
        duration: loop.end - loop.start,
      })
      this._currentBgm.play(markerName, { loop: shouldLoop })
    } else {
      this._currentBgm = this.sound.add(trackId, { loop: shouldLoop, volume: effectiveVol })
      this._currentBgm.play()
    }
  }

  // Play an SFX by ID with priority-based channel arbitration.
  // Priority 4 always plays and interrupts lower-priority SFX to make room.
  // Priority 3 can interrupt 1–2, but is dropped if both channels are occupied by equal/higher priority SFX.
  // Priority 1–2 are skipped if a higher-priority SFX is playing or no channel is available.
  // Max 2 concurrent SFX (GBC realism); excess SFX are dropped rather than queued.
  playSfx(id) {
    const preset = getSfxPreset(id)
    if (!preset) return

    const session      = GameState._session
    if (session.userMuted) return

    const effectiveVol = preset.volume * session.masterVolume * session.sfxVolume

    // Purge finished SFX from active list
    this._activeSfx = this._activeSfx.filter(entry => entry.sound.isPlaying)

    const incomingPriority = preset.priority

    // Priority 4 always plays — evict lowest priority to make room
    if (incomingPriority === 4) {
      while (this._activeSfx.length >= MAX_CONCURRENT_SFX) {
        const lowest = this._activeSfx.reduce(
          (min, e) => e.priority < min.priority ? e : min,
          this._activeSfx[0],
        )
        lowest.sound.stop()
        this._activeSfx = this._activeSfx.filter(e => e !== lowest)
      }
    }

    // Priority 3 interrupts 1–2 but not other 3+
    if (incomingPriority === 3) {
      const higherPlaying = this._activeSfx.some(e => e.priority >= incomingPriority)
      if (higherPlaying && this._activeSfx.length >= MAX_CONCURRENT_SFX) return

      while (this._activeSfx.length >= MAX_CONCURRENT_SFX) {
        const lower = this._activeSfx.find(e => e.priority < incomingPriority)
        if (!lower) return  // can't evict — all equal or higher
        lower.sound.stop()
        this._activeSfx = this._activeSfx.filter(e => e !== lower)
      }
    }

    // Priority 1–2 are skipped if higher-priority SFX is playing
    if (incomingPriority <= 2) {
      const higherPlaying = this._activeSfx.some(e => e.priority > incomingPriority)
      if (higherPlaying) return
      if (this._activeSfx.length >= MAX_CONCURRENT_SFX) return
    }

    if (!this.cache.audio.exists(id)) return

    const sound = this.sound.add(id, { volume: effectiveVol })
    sound.play()
    this._activeSfx.push({ sound, priority: incomingPriority })

    sound.once('complete', () => {
      this._activeSfx = this._activeSfx.filter(e => e.sound !== sound)
    })
  }

  // Delegate to the scene's DialogBox instance.
  // Scenes must set this.dialog = new DialogBox(this) in create().
  showDialog(text, callback = null) {
    if (this.dialog) this.dialog.show(text, callback)
  }

  // Register ESC key to pause the current scene and launch PauseScene.
  // Call in create() of any scene that should be pausable.
  setupPauseKey() {
    this.input.keyboard.on('keydown-ESC', () => {
      if (this.scene.isPaused(this.scene.key)) return
      this.scene.pause()
      this.scene.launch('PauseScene', { returnScene: this.scene.key })
    })
  }

  // Update currently-playing BGM volume to match latest session settings.
  // Called by PauseScene when sliders change.
  refreshBgmVolume() {
    if (!this._currentBgm || !this._currentBgm.isPlaying) return
    const session = GameState._session
    const bgmDef  = getBgmConfig(this._currentBgm.key)
    const baseVol = bgmDef?.volume ?? 0.5
    this._currentBgm.setVolume(baseVol * session.masterVolume * session.bgmVolume)
  }

  shutdown() {
    if (this._currentBgm) {
      this._currentBgm.stop()
      this._currentBgm = null
    }
    for (const entry of this._activeSfx) {
      if (entry.sound.isPlaying) entry.sound.stop()
    }
    this._activeSfx = []
  }
}
