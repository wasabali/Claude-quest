import { GameState } from '#state/GameState.js'

export class HUD {
  constructor(scene) {
    this.scene = scene

    this.hpText = scene.add.text(4, 4, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#7CFC00',
    }).setScrollFactor(0)

    this.budgetText = scene.add.text(4, 14, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#7CFC00',
    }).setScrollFactor(0)

    this.saveIcon = scene.add.text(136, 4, '💾', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#7CFC00',
    }).setScrollFactor(0).setVisible(false)

    this.tooltip = scene.add.text(58, 18, 'You have uncommitted changes.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#7CFC00',
      backgroundColor: '#000000',
      padding: { left: 2, right: 2, top: 1, bottom: 1 },
    }).setScrollFactor(0).setVisible(false)

    this.saveIcon.setInteractive({ useHandCursor: true })
    this.saveIcon.on('pointerover', () => this.tooltip.setVisible(GameState._session.isDirty))
    this.saveIcon.on('pointerout', () => this.tooltip.setVisible(false))

    scene.time.addEvent({
      delay: 350,
      loop: true,
      callback: () => {
        if (!GameState._session.isDirty) {
          this.saveIcon.setVisible(false)
          this.tooltip.setVisible(false)
          return
        }
        this.saveIcon.setVisible(!this.saveIcon.visible)
      },
    })

    this.refresh()
  }

  refresh() {
    const hpRatio = GameState.player.maxHp > 0 ? GameState.player.hp / GameState.player.maxHp : 0
    const hpColor = hpRatio <= 0.25 ? '#ff4f4f' : hpRatio <= 0.5 ? '#ffd84f' : '#7CFC00'
    this.hpText.setText(`HP ${GameState.player.hp}/${GameState.player.maxHp}`)
    this.hpText.setColor(hpColor)
    this.budgetText.setText(`$${GameState.player.budget}`)
  }
}
