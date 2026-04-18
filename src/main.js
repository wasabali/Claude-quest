import Phaser from 'phaser'
import { CONFIG } from './config.js'
import { GameState } from '#state/GameState.js'
import { BootScene } from '#scenes/BootScene.js'
import { TitleScene } from '#scenes/TitleScene.js'
import { WorldScene } from '#scenes/WorldScene.js'
import { SaveScene } from '#scenes/SaveScene.js'
import { NewGameScene } from '#scenes/NewGameScene.js'
import { ServiceCatalogScene } from '#scenes/ServiceCatalogScene.js'
import { SkillManagementScene } from '#scenes/SkillManagementScene.js'
import { EmblemScene }          from '#scenes/EmblemScene.js'
import { StackOverflowScene }   from '#scenes/StackOverflowScene.js'
import { BattleScene }          from '#scenes/BattleScene.js'

new Phaser.Game({
  type:   Phaser.AUTO,
  width:  CONFIG.WIDTH,
  height: CONFIG.HEIGHT,
  parent: 'app',

  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },
  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ BootScene, TitleScene, NewGameScene, WorldScene, SaveScene, ServiceCatalogScene, SkillManagementScene, EmblemScene, StackOverflowScene, BattleScene ],
})

window.addEventListener('beforeunload', e => {
  if (GameState._session.isDirty) {
    e.preventDefault()
    e.returnValue = ''
  }
})
