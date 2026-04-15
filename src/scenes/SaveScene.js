import { BaseScene } from '#scenes/BaseScene.js'
import { SaveManager } from '#state/SaveManager.js'
import { GameState } from '#state/GameState.js'

export class SaveScene extends BaseScene {
  constructor() {
    super({ key: 'SaveScene' })
    this.commitMessage = ''
    this.cursorVisible = true
  }

  create() {
    this.cameras.main.setBackgroundColor('#061b11')

    this.add.text(8, 12, 'Cloud Quest Save Terminal', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#78ff9d',
    })

    this.promptText = this.add.text(8, 32, '$ git commit -m "', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#58ff8a',
    })

    this.messageText = this.add.text(8, 48, '', {
      fontFamily: 'monospace',
      fontSize: '10px',
      color: '#58ff8a',
      wordWrap: { width: 144 },
    })

    this.input.keyboard.on('keydown', this.onKeyDown, this)
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible
        this.renderPrompt()
      },
    })
    this.renderPrompt()
  }

  renderPrompt() {
    const cursor = this.cursorVisible ? '_' : ' '
    this.promptText.setText(`$ git commit -m "${this.commitMessage}${cursor}"`)
  }

  async onKeyDown(event) {
    if (event.key === 'Backspace') {
      this.commitMessage = this.commitMessage.slice(0, -1)
      this.renderPrompt()
      return
    }

    if (event.key === 'Enter') {
      await SaveManager.export(GameState, this.commitMessage)
      this.messageText.setText("Progress committed. Don't forget to back it up.")
      this.commitMessage = ''
      this.renderPrompt()
      return
    }

    if (event.key.toLowerCase() === 'l') {
      await SaveManager.import()
      this.messageText.setText('Progress loaded.')
      this.renderPrompt()
      return
    }

    if (event.key.length === 1 && this.commitMessage.length < 72) {
      this.commitMessage += event.key
      this.renderPrompt()
    }
  }
}
