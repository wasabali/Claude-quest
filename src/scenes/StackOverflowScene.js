import { BaseScene } from '#scenes/BaseScene.js'
import { CONFIG } from '../config.js'
import { GameState, grantXpOnce } from '#state/GameState.js'
import { getById as getThreadById, getByCommandId } from '#data/stackoverflow.js'
import { getAll as getAllSkills } from '#data/skills.js'

// StackOverflowScene — in-game command wiki themed as Stack Overflow.
//
// Modes:
//   'list'   — scrollable list of all command threads (locked/unlocked)
//   'detail' — scrollable Q&A view for a selected thread
//
// Navigation:
//   UP/DOWN  — scroll list or detail
//   Z        — open selected thread (list mode)
//   X        — back (detail → list, list → return scene)

const PANEL_KEY = 'ui_so_panel_9slice'
const SO_DARK         = '#0f380f'
const SO_MID          = '#306230'
const SO_LIGHT        = '#8bac0f'
const SO_RED          = '#ff4d4d'
const VISIBLE_ROWS    = 12  // max rows shown in list view
const DETAIL_LINES_PER_PAGE = 12

export class StackOverflowScene extends BaseScene {
  constructor() {
    super({ key: 'StackOverflowScene' })
    this.mode = 'list'
    this.listIndex = 0
    this.listScroll = 0
    this.detailScroll = 0
    this.returnSceneKey = 'SkillManagementScene'
    this.returnSceneData = {}
    this.contentObjects = []
    this._rows = []
    this._detailLines = []
    this._currentThreadId = null
  }

  init(data = {}) {
    this.returnSceneKey = data.returnSceneKey ?? 'SkillManagementScene'
    this.returnSceneData = data.returnSceneData ?? {}
  }

  create() {
    this._ensurePanelTexture()

    this._bgPanel = this._addPanel(CONFIG.WIDTH / 2, CONFIG.HEIGHT / 2, CONFIG.WIDTH - 4, CONFIG.HEIGHT - 4)
    this._headerPanel = this._addPanel(CONFIG.WIDTH / 2, 8, CONFIG.WIDTH - 8, 12)
    this._footerPanel = this._addPanel(CONFIG.WIDTH / 2, CONFIG.HEIGHT - 8, CONFIG.WIDTH - 8, 12)

    this._headerText = this.add.text(6, 4, 'STACKOVERFLOW', {
      fontFamily: CONFIG.FONT,
      fontSize: '6px',
      color: SO_DARK,
    })

    this._footerText = this.add.text(6, CONFIG.HEIGHT - 12, '', {
      fontFamily: CONFIG.FONT,
      fontSize: '6px',
      color: SO_MID,
    })

    this._bindInput()
    this._buildRows()
    this._render()
  }

  _bindInput() {
    this.input.keyboard.on('keydown-UP', () => {
      if (this.mode === 'list') {
        if (this._rows.length === 0) return
        this.listIndex = Math.max(0, this.listIndex - 1)
        this._adjustListScroll()
        this._render()
      } else {
        this.detailScroll = Math.max(0, this.detailScroll - 1)
        this._render()
      }
    })

    this.input.keyboard.on('keydown-DOWN', () => {
      if (this.mode === 'list') {
        if (this._rows.length === 0) return
        this.listIndex = Math.min(this._rows.length - 1, this.listIndex + 1)
        this._adjustListScroll()
        this._render()
      } else {
        const maxScroll = Math.max(0, this._detailLines.length - DETAIL_LINES_PER_PAGE)
        this.detailScroll = Math.min(maxScroll, this.detailScroll + 1)
        this._render()
      }
    })

    this.input.keyboard.on('keydown-Z', () => {
      if (this.mode !== 'list') return
      const row = this._rows[this.listIndex]
      if (!row) return
      if (!row.unlocked) return
      this._openThread(row.threadId)
    })

    this.input.keyboard.on('keydown-X', () => {
      if (this.mode === 'detail') {
        this.mode = 'list'
        this.detailScroll = 0
        this._currentThreadId = null
        this._detailLines = []
        this._render()
        return
      }
      this._close()
    })
  }

  _close() {
    if (this.scene.isPaused(this.returnSceneKey)) {
      this.scene.stop('StackOverflowScene')
      this.scene.resume(this.returnSceneKey, this.returnSceneData)
    } else if (this.returnSceneKey) {
      this.fadeToScene(this.returnSceneKey, this.returnSceneData)
    } else {
      this.scene.stop('StackOverflowScene')
    }
  }

  _buildRows() {
    const learnedSet = new Set(GameState.skills.learned)
    const allSkills = getAllSkills()

    // Build ordered list: one row per skill that has a thread
    this._rows = allSkills
      .map(skill => {
        const thread = getByCommandId(skill.id)
        if (!thread) return null
        const unlocked = learnedSet.has(skill.id)
        // rm -rf gate: only visible at shame 5+
        if (skill.id === 'rm_rf' && GameState.player.shamePoints < 5) return null
        return {
          threadId: thread.id,
          commandId: skill.id,
          displayName: skill.displayName,
          unlocked,
          isCursed: skill.isCursed,
        }
      })
      .filter(Boolean)
  }

  _adjustListScroll() {
    if (this.listIndex < this.listScroll) this.listScroll = this.listIndex
    if (this.listIndex >= this.listScroll + VISIBLE_ROWS) {
      this.listScroll = this.listIndex - VISIBLE_ROWS + 1
    }
  }

  _openThread(threadId) {
    this._currentThreadId = threadId
    this.mode = 'detail'
    this.detailScroll = 0
    this._buildDetailLines(threadId)
    grantXpOnce(`so_read_${threadId}`, 5)
    this._render()
  }

  _buildDetailLines(threadId) {
    const thread = this._getThread(threadId)
    if (!thread) { this._detailLines = []; return }

    const lines = []
    const wrap = (text, maxLen) => {
      const words = text.split(' ')
      const result = []
      let line = ''
      for (const word of words) {
        if ((line + (line ? ' ' : '') + word).length > maxLen) {
          if (line) result.push(line)
          line = word
        } else {
          line = line ? `${line} ${word}` : word
        }
      }
      if (line) result.push(line)
      return result
    }

    const MAX_CHARS = 25

    // Question header
    lines.push({ text: `Q: ${thread.questionTitle}`, color: SO_DARK })
    lines.push({ text: `Asked by: ${thread.askedBy}`, color: SO_LIGHT })
    lines.push({ text: `Tags: ${thread.tags.join(' ')}`, color: SO_LIGHT })
    lines.push({ text: '────────────────────────', color: SO_MID })

    // Answers
    for (const answer of thread.answers) {
      const badge = answer.isAccepted ? '✓ ACCEPTED' : 'ANSWER'
      const scoreColor = answer.score < 0 ? SO_RED : (answer.isAccepted ? SO_DARK : SO_MID)
      lines.push({ text: `${badge} (Score: ${answer.score})`, color: scoreColor })
      for (const l of wrap(answer.text, MAX_CHARS)) {
        lines.push({ text: l, color: SO_MID })
      }
      lines.push({ text: `— ${answer.author}`, color: SO_LIGHT })
      if (answer.isCursedHint) {
        lines.push({ text: '💀 [CURSED TECHNIQUE HINT]', color: SO_RED })
      }
      lines.push({ text: '┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄', color: SO_MID })
    }

    // Comments
    if (thread.comments.length > 0) {
      lines.push({ text: `COMMENTS (${thread.comments.length})`, color: SO_DARK })
      for (const comment of thread.comments) {
        for (const l of wrap(`${comment.text} — ${comment.author}`, MAX_CHARS)) {
          lines.push({ text: `  ${l}`, color: SO_LIGHT })
        }
      }
    }

    this._detailLines = lines
  }

  _getThread(threadId) {
    return getThreadById(threadId)
  }

  _render() {
    this.contentObjects.forEach(o => o.destroy())
    this.contentObjects = []

    if (this.mode === 'list') {
      this._renderList()
    } else {
      this._renderDetail()
    }
  }

  _renderList() {
    if (this._rows.length === 0) {
      this.contentObjects.push(this.add.text(6, 18, 'No commands discovered yet.\nBeat trainers to learn skills.', {
        fontFamily: CONFIG.FONT,
        fontSize: '6px',
        color: SO_MID,
        lineSpacing: 2,
      }))
      this._footerText.setText('X: back')
      return
    }

    const visible = this._rows.slice(this.listScroll, this.listScroll + VISIBLE_ROWS)
    visible.forEach((row, i) => {
      const isSelected = this.listScroll + i === this.listIndex
      const prefix = isSelected ? '►' : ' '
      const lockIcon = row.unlocked ? ' ' : '🔒'
      const cursedMark = row.isCursed ? '[!]' : ''
      const label = row.unlocked
        ? `${prefix}${lockIcon}${row.displayName}${cursedMark}`
        : `${prefix}${lockIcon}[LOCKED]`
      const color = !row.unlocked ? SO_LIGHT
        : (row.isCursed ? SO_RED : (isSelected ? SO_DARK : SO_MID))

      this.contentObjects.push(this.add.text(4, 16 + i * 10, label, {
        fontFamily: CONFIG.FONT,
        fontSize: '6px',
        color,
      }))
    })

    const selected = this._rows[this.listIndex]
    const hint = selected && !selected.unlocked
      ? 'Defeat a trainer to unlock'
      : (selected ? 'Z: open  X: back' : 'X: back')
    this._footerText.setText(hint)
    this._headerText.setText('STACKOVERFLOW')
  }

  _renderDetail() {
    if (!this._detailLines.length) {
      this._footerText.setText('X: back')
      return
    }

    const visible = this._detailLines.slice(this.detailScroll, this.detailScroll + DETAIL_LINES_PER_PAGE)
    visible.forEach((line, i) => {
      const obj = this.add.text(4, 16 + i * 10, line.text, {
        fontFamily: CONFIG.FONT,
        fontSize: '6px',
        color: line.color,
        wordWrap: { width: CONFIG.WIDTH - 8 },
      })
      this.contentObjects.push(obj)
    })

    const total = this._detailLines.length
    const hasMore = this.detailScroll + DETAIL_LINES_PER_PAGE < total
    this._footerText.setText(hasMore ? '▼ more  X: back' : 'X: back')
    this._headerText.setText('STACKOVERFLOW')
  }

  _ensurePanelTexture() {
    if (this.textures.exists(PANEL_KEY)) return
    const g = this.make.graphics({ x: 0, y: 0, add: false })
    g.fillStyle(0xe0f8d0, 1)
    g.fillRect(0, 0, 24, 24)
    g.fillStyle(0x306230, 1)
    g.fillRect(0, 0, 24, 2)
    g.fillRect(0, 22, 24, 2)
    g.fillRect(0, 0, 2, 24)
    g.fillRect(22, 0, 2, 24)
    g.fillStyle(0x0f380f, 1)
    g.fillRect(0, 0, 24, 1)
    g.fillRect(0, 23, 24, 1)
    g.fillRect(0, 0, 1, 24)
    g.fillRect(23, 0, 1, 24)
    g.generateTexture(PANEL_KEY, 24, 24)
    g.destroy()
  }

  _addPanel(x, y, width, height) {
    if (typeof this.add.nineslice === 'function') {
      return this.add.nineslice(x, y, PANEL_KEY, undefined, width, height, 4, 4, 4, 4)
    }
    return this.add.rectangle(x, y, width, height, 0xe0f8d0).setStrokeStyle(1, 0x306230)
  }
}
