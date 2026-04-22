import Phaser from 'phaser'
import { getAllBgm } from '#data/audio.js'
import { getAllSpriteKeys, PLAYER_SPRITE_KEY } from '#data/trainers.js'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload() {
    const bgmTracks = getAllBgm()
    const optionalBgmKeys = new Set(bgmTracks.map((bgm) => bgm.id))

    // All character sprite keys are optional — the game falls back to procedurally
    // generated stub textures when the Ninja Adventure sprite files are not present.
    const optionalSpriteKeys = new Set(getAllSpriteKeys())

    // Ignore missing optional BGM files, the loop-points JSON, and character sprites
    // — the game runs silently if audio or sprite assets are unavailable.
    // Surface all other failures.
    this.load.on('loaderror', (file) => {
      const isOptionalBgm    = file?.type === 'audio' && optionalBgmKeys.has(file.key)
      const isOptionalLoopJson = file?.type === 'json' && file.key === 'bgmLoopPoints'
      const isOptionalSprite = file?.type === 'image' && optionalSpriteKeys.has(file.key)
      if (isOptionalBgm || isOptionalLoopJson || isOptionalSprite) {
        console.warn(`[BootScene] Optional asset unavailable, continuing without it: ${file?.type}:${file?.key}`)
        return
      }
      throw new Error(`BootScene failed to load required asset: ${file?.type ?? 'unknown'}:${file?.key ?? 'unknown'}`)
    })

    // Load BGM tracks listed in the audio registry.
    // SFX are procedurally generated via jsfxr at runtime — no files to preload.
    for (const bgm of bgmTracks) {
      this.load.audio(bgm.id, bgm.file)
    }

    this.load.json('bgmLoopPoints', 'assets/audio/bgm-loop-points.json')

    // Load character sprite sheets (4-row × 3-col walk-cycle, 48×48 px per frame).
    // Files live in assets/sprites/characters/<key>.png and are optional — if absent
    // the game uses procedurally generated stub textures (coloured rectangles).
    for (const key of optionalSpriteKeys) {
      this.load.spritesheet(key, `assets/sprites/characters/${key}.png`, {
        frameWidth:  48,
        frameHeight: 48,
      })
    }
  }

  create() {
    this.registry.set('bgmLoopPoints', this.cache.json.get('bgmLoopPoints') ?? {})
    this.scene.start('TitleScene')
  }
}
