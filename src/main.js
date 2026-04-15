import Phaser from 'phaser'
import { CONFIG } from './config.js'

// Scenes are imported and added to the scene array as they are implemented.
// import { BootScene }            from '#scenes/BootScene.js'
// import { TitleScene }           from '#scenes/TitleScene.js'
// import { WorldScene }           from '#scenes/WorldScene.js'
// import { BattleScene }          from '#scenes/BattleScene.js'
// import { InventoryScene }       from '#scenes/InventoryScene.js'
// import { EmblemScene }          from '#scenes/EmblemScene.js'
// import { SaveScene }            from '#scenes/SaveScene.js'
// import { PauseMenuScene }       from '#scenes/PauseMenuScene.js'
// import { EngineerProfileScene } from '#scenes/EngineerProfileScene.js'

new Phaser.Game({
  type:            Phaser.AUTO,
  width:           CONFIG.WIDTH,
  height:          CONFIG.HEIGHT,
  antialias:       false,   // pixel-perfect — never remove
  pixelArt:        true,    // sets antialias: false + roundPixels: true
  backgroundColor: '#000000',
  parent:          'app',
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [
    // Add scene classes here in load order as they are implemented.
    // BootScene,
    // TitleScene,
    // WorldScene,
    // BattleScene,
  ],
})
