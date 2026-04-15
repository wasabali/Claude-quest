import Phaser from 'phaser'
import { CONFIG } from './config.js'
import { BootScene } from '#scenes/BootScene.js'
import { TitleScene } from '#scenes/TitleScene.js'
import { WorldScene } from '#scenes/WorldScene.js'

new Phaser.Game({
  type:   Phaser.AUTO,
  width:  CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  parent: 'app',
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ BootScene, TitleScene, WorldScene ],
})
