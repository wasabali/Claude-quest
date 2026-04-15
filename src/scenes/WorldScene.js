import Phaser from 'phaser'
import { COLORS, CONFIG, WORLD_SCENE } from '../config.js'

export class WorldScene extends Phaser.Scene {
  constructor() {
    super('WorldScene')
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)
    this.add.text(CONFIG.WIDTH / WORLD_SCENE.CENTER_DIVISOR, CONFIG.HEIGHT / WORLD_SCENE.CENTER_DIVISOR, WORLD_SCENE.MESSAGE, {
      fontFamily: CONFIG.FONT,
      fontSize: WORLD_SCENE.MESSAGE_FONT_SIZE,
      color: COLORS.TITLE,
    }).setOrigin(WORLD_SCENE.ORIGIN_CENTER)
  }
}
