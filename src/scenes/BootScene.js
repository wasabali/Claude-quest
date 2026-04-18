import Phaser from 'phaser'
import { getAllBgm } from '#data/audio.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    // Load BGM tracks listed in the audio registry.
    // SFX are procedurally generated via jsfxr at runtime — no files to preload.
    for (const bgm of getAllBgm()) {
      this.load.audio(bgm.id, bgm.file)
    }

    this.load.json('bgmLoopPoints', 'assets/audio/bgm-loop-points.json')
  }

  create() {
    this.registry.set('bgmLoopPoints', this.cache.json.get('bgmLoopPoints') ?? {})
    this.scene.start('TitleScene')
  }
}
