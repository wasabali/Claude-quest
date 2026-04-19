import Phaser from 'phaser'
import { getAllBgm } from '#data/audio.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    const bgmTracks = getAllBgm()
    const optionalBgmKeys = new Set(bgmTracks.map((bgm) => bgm.id))

    // Ignore missing optional BGM files, but surface all other boot-time load failures.
    this.load.on('loaderror', (file) => {
      const isOptionalBgm = file?.type === 'audio' && optionalBgmKeys.has(file.key)
      if (isOptionalBgm) return
      throw new Error(`BootScene failed to load required asset: ${file?.type ?? 'unknown'}:${file?.key ?? 'unknown'}`)
    })

    // Load BGM tracks listed in the audio registry.
    // SFX are procedurally generated via jsfxr at runtime — no files to preload.
    for (const bgm of bgmTracks) {
      this.load.audio(bgm.id, bgm.file)
    }

    this.load.json('bgmLoopPoints', 'assets/audio/bgm-loop-points.json')
  }

  create() {
    this.registry.set('bgmLoopPoints', this.cache.json.get('bgmLoopPoints') ?? {})
    this.scene.start('TitleScene')
  }
}
