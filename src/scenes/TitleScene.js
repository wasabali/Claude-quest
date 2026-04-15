import Phaser from 'phaser'
import { COLORS, CONFIG, TITLE_SCREEN } from '../config.js'

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene')
    this.selectedIndex = TITLE_SCREEN.DEFAULT_SELECTION
  }

  create() {
    const centerX = CONFIG.WIDTH / TITLE_SCREEN.CENTER_DIVISOR

    this.cameras.main.setBackgroundColor(COLORS.BACKGROUND)

    this.add.text(centerX, TITLE_SCREEN.TITLE_Y, 'CLOUD QUEST', {
      fontFamily: CONFIG.FONT,
      fontSize: TITLE_SCREEN.TITLE_FONT_SIZE,
      color: COLORS.TITLE,
    }).setOrigin(TITLE_SCREEN.ORIGIN_CENTER)

    this.add.text(centerX, TITLE_SCREEN.SUBTITLE_Y, "A Cloud Engineer's Journey", {
      fontFamily: CONFIG.FONT,
      fontSize: TITLE_SCREEN.SUBTITLE_FONT_SIZE,
      color: COLORS.SUBTITLE,
    }).setOrigin(TITLE_SCREEN.ORIGIN_CENTER)

    this.promptText = this.add.text(centerX, TITLE_SCREEN.PROMPT_Y, 'PRESS START', {
      fontFamily: CONFIG.FONT,
      fontSize: TITLE_SCREEN.PROMPT_FONT_SIZE,
      color: COLORS.PROMPT,
    }).setOrigin(TITLE_SCREEN.ORIGIN_CENTER)

    this.menuTexts = TITLE_SCREEN.MENU_ITEMS.map((item, index) => (
      this.add.text(
        centerX,
        TITLE_SCREEN.MENU_START_Y + (index * TITLE_SCREEN.MENU_LINE_HEIGHT),
        item,
        {
          fontFamily: CONFIG.FONT,
          fontSize: TITLE_SCREEN.MENU_FONT_SIZE,
          color: COLORS.MENU_TEXT,
        },
      ).setOrigin(TITLE_SCREEN.ORIGIN_CENTER)
    ))

    this.menuArrow = this.add.text(
      centerX - TITLE_SCREEN.ARROW_X_OFFSET,
      this.getMenuY(this.selectedIndex),
      '▶',
      {
        fontFamily: CONFIG.FONT,
        fontSize: TITLE_SCREEN.MENU_FONT_SIZE,
        color: COLORS.MENU_ARROW,
      },
    ).setOrigin(TITLE_SCREEN.ORIGIN_CENTER)

    this.time.addEvent({
      delay: TITLE_SCREEN.BLINK_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.promptText.setVisible(!this.promptText.visible)
      },
    })

    this.input.keyboard.on('keydown-UP', () => this.changeSelection(TITLE_SCREEN.MENU_UP_DELTA))
    this.input.keyboard.on('keydown-DOWN', () => this.changeSelection(TITLE_SCREEN.MENU_DOWN_DELTA))
    this.input.keyboard.on('keydown-Z', () => this.confirmSelection())
    this.input.keyboard.on('keydown-ENTER', () => this.confirmSelection())
  }

  changeSelection(direction) {
    const menuSize = TITLE_SCREEN.MENU_ITEMS.length
    this.selectedIndex = (this.selectedIndex + direction + menuSize) % menuSize
    this.menuArrow.setY(this.getMenuY(this.selectedIndex))
  }

  getMenuY(index) {
    return TITLE_SCREEN.MENU_START_Y + (index * TITLE_SCREEN.MENU_LINE_HEIGHT)
  }

  confirmSelection() {
    const selectedItem = TITLE_SCREEN.MENU_ITEMS[this.selectedIndex]
    if (selectedItem === 'NEW GAME') this.scene.start('WorldScene')
  }
}
