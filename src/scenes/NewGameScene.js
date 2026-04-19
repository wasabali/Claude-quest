import { CONFIG } from '../config.js'
import { BaseScene } from '#scenes/BaseScene.js'
import { initNewGame } from '#state/GameState.js'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const NAME_MAX_LENGTH = 8
const DEFAULT_NAME = 'ENGINEER'
const PROLOGUE = [
  "Congratulations. You've been hired as a Junior Cloud Engineer.",
  'Your first day starts now. The infrastructure is already on fire.',
  'Professor Pedersen: Ah, a fresh one. Before you touch anything —',
  '— pick your mascot.',
]
const STARTERS = ['DOCKERTLE', 'FUNCTIONCHU', 'VMSAUR']

// Palette shared across all three render stages (name, prologue, starter).
const COLOR_HEADER   = '#9bc5ff'
const COLOR_SELECTED = '#ffe066'
const COLOR_TEXT     = '#ffffff'
const COLOR_HINT     = '#888888'

// Grid dimensions shared by handleNameInput (navigation) and renderNameEntry (layout).
const GRID_COLUMNS = 9
const GRID_CELL_W  = 120
const GRID_CELL_H  = 80

export class NewGameScene extends BaseScene {
  constructor() {
    super({ key: 'NewGameScene' })
    this.stage = 'name'
    this.playerName = DEFAULT_NAME
    this.cursorIndex = 0
    this.prologueIndex = 0
    this.starterIndex = 0
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000')
    this.render()
    this.registerInput()
  }

  registerInput() {
    this.input.keyboard.on('keydown', (event) => {
      if (event.repeat) return

      if (this.stage === 'name') this.handleNameInput(event.code)
      if (this.stage === 'prologue') this.handlePrologueInput(event.code)
      if (this.stage === 'starter') this.handleStarterInput(event.code)
    })
  }

  handleNameInput(code) {
    const totalCells = LETTERS.length + 1

    if (code === 'ArrowRight') this.cursorIndex = (this.cursorIndex + 1) % totalCells
    if (code === 'ArrowLeft') this.cursorIndex = (this.cursorIndex - 1 + totalCells) % totalCells
    if (code === 'ArrowDown') this.cursorIndex = (this.cursorIndex + GRID_COLUMNS) % totalCells
    if (code === 'ArrowUp') this.cursorIndex = (this.cursorIndex - GRID_COLUMNS + totalCells) % totalCells

    if (code === 'KeyX' || code === 'Backspace') this.playerName = this.playerName.slice(0, -1)

    if (code === 'Enter') {
      this.confirmNameAndAdvance()
    } else if (code === 'KeyZ') {
      if (this.cursorIndex === LETTERS.length) {
        this.confirmNameAndAdvance()
      } else if (this.playerName.length < NAME_MAX_LENGTH) {
        this.playerName += LETTERS[this.cursorIndex]
      }
    }

    this.render()
  }

  confirmNameAndAdvance() {
    this.playerName = this.playerName || DEFAULT_NAME
    this.stage = 'prologue'
  }

  handlePrologueInput(code) {
    if (code !== 'KeyZ' && code !== 'Enter') return
    this.prologueIndex += 1
    if (this.prologueIndex >= PROLOGUE.length) {
      this.stage = 'starter'
      this.prologueIndex = PROLOGUE.length - 1
    }
    this.render()
  }

  handleStarterInput(code) {
    if (code === 'ArrowDown') this.starterIndex = (this.starterIndex + 1) % STARTERS.length
    if (code === 'ArrowUp') this.starterIndex = (this.starterIndex - 1 + STARTERS.length) % STARTERS.length
    if (code === 'KeyZ' || code === 'Enter') {
      initNewGame(this.playerName, STARTERS[this.starterIndex])
      this.fadeToScene('WorldScene')
      return
    }
    this.render()
  }

  render() {
    this.children.removeAll()

    if (this.stage === 'name') this.renderNameEntry()
    if (this.stage === 'prologue') this.renderPrologue()
    if (this.stage === 'starter') this.renderStarterChoice()
  }

  renderNameEntry() {
    const cx             = CONFIG.WIDTH / 2

    const headerStyle = { fontFamily: CONFIG.FONT, fontSize: '48px', color: COLOR_HEADER }
    const nameStyle   = { fontFamily: CONFIG.FONT, fontSize: '72px', color: COLOR_SELECTED }
    const letterStyle = { fontFamily: CONFIG.FONT, fontSize: '32px', color: COLOR_TEXT }
    const hintStyle   = { fontFamily: CONFIG.FONT, fontSize: '24px', color: COLOR_HINT }

    this.add.text(cx, 80,  'WHAT IS YOUR NAME?', headerStyle).setOrigin(0.5, 0)
    this.add.text(cx, 180, this.playerName || '_', nameStyle).setOrigin(0.5, 0)

    const gridW      = GRID_COLUMNS * GRID_CELL_W
    const gridStartX = cx - gridW / 2 + GRID_CELL_W / 2
    const gridStartY = 360

    LETTERS.forEach((letter, index) => {
      const col = index % GRID_COLUMNS
      const row = Math.floor(index / GRID_COLUMNS)
      const x = gridStartX + col * GRID_CELL_W
      const y = gridStartY + row * GRID_CELL_H
      const selected = index === this.cursorIndex
      const color = selected ? COLOR_SELECTED : COLOR_TEXT
      const prefix = selected ? '> ' : '  '
      this.add.text(x, y, `${prefix}${letter}`, { ...letterStyle, color }).setOrigin(0.5, 0)
    })

    const endX       = gridStartX + (LETTERS.length % GRID_COLUMNS) * GRID_CELL_W
    const endY       = gridStartY + Math.floor(LETTERS.length / GRID_COLUMNS) * GRID_CELL_H
    const endSelected = this.cursorIndex === LETTERS.length
    const endColor   = endSelected ? COLOR_SELECTED : COLOR_TEXT
    this.add.text(endX, endY, `${endSelected ? '> ' : '  '}END`, { ...letterStyle, color: endColor }).setOrigin(0.5, 0)

    this.add.text(cx, 900, 'Z:SELECT  X/BACKSPACE:DELETE  ENTER:CONFIRM', hintStyle).setOrigin(0.5, 0)
  }

  renderPrologue() {
    const cx        = CONFIG.WIDTH / 2
    const textStyle = { fontFamily: CONFIG.FONT, fontSize: '36px', color: COLOR_TEXT, wordWrap: { width: CONFIG.WIDTH * 0.7 }, align: 'center' }
    const hintStyle = { fontFamily: CONFIG.FONT, fontSize: '28px', color: COLOR_HINT }
    this.add.text(cx, CONFIG.HEIGHT * 0.35, PROLOGUE[this.prologueIndex], textStyle).setOrigin(0.5, 0)
    this.add.text(cx, CONFIG.HEIGHT * 0.82, 'Z / ENTER — NEXT', hintStyle).setOrigin(0.5, 0)
  }

  renderStarterChoice() {
    const cx          = CONFIG.WIDTH / 2
    const headerStyle = { fontFamily: CONFIG.FONT, fontSize: '48px', color: COLOR_HEADER }
    const itemStyle   = { fontFamily: CONFIG.FONT, fontSize: '40px', color: COLOR_TEXT }
    const hintStyle   = { fontFamily: CONFIG.FONT, fontSize: '28px', color: COLOR_HINT }

    this.add.text(cx, 200, 'PICK YOUR MASCOT', headerStyle).setOrigin(0.5, 0)

    STARTERS.forEach((starter, index) => {
      const selected = index === this.starterIndex
      const prefix   = selected ? '▶ ' : '  '
      const color    = selected ? COLOR_SELECTED : COLOR_TEXT
      this.add.text(cx, 420 + index * 100, `${prefix}${starter}`, { ...itemStyle, color }).setOrigin(0.5, 0)
    })

    this.add.text(cx, 820, 'Z / ENTER — CONFIRM', hintStyle).setOrigin(0.5, 0)
  }
}
