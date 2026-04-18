import Phaser from 'phaser'
import { BaseScene } from '#scenes/BaseScene.js'
import { CONFIG } from '../config.js'
import { GameState, markDirty } from '#state/GameState.js'
import { getById as getStoryById } from '#data/story.js'

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const TEXT_STYLE = { fontFamily: CONFIG.FONT, fontSize: '8px', color: '#f8f8f8' }
const TITLE_STYLE = { fontFamily: CONFIG.FONT, fontSize: '10px', color: '#ffe066' }
const CONFLUENCE_STYLE = { fontFamily: CONFIG.FONT, fontSize: '7px', color: '#9bc5ff' }
const SCROLL_SPEED = 16 // px per second
const CONFLUENCE_DISPLAY_MS = 3000
const PAGER_PROMPT_MS = 1500

// Phases the scene progresses through
const PHASE = {
  CONFLUENCE:   'confluence',
  CREDITS:      'credits',
  POST_CREDITS: 'post_credits',
  PAGER:        'pager',
  DONE:         'done',
}

// ---------------------------------------------------------------------------
// CreditsScene
// Shows ending title card → confluence page → scrolling NPC credits →
// post-credits pager → returns to WorldScene for post-game.
// ---------------------------------------------------------------------------
export class CreditsScene extends BaseScene {
  constructor() {
    super({ key: 'CreditsScene' })
  }

  create(data = {}) {
    this._endingId = data.ending ?? 'ending_post_mortem'
    this._ending   = getStoryById(this._endingId)
    this._phase    = PHASE.CONFLUENCE
    this._creditTexts = []

    this.cameras.main.fadeIn(300, 0, 0, 0)

    this._showConfluencePage()
  }

  // -------------------------------------------------------------------------
  // Phase 1: Confluence page — faux browser dialog, 3 seconds
  // -------------------------------------------------------------------------
  _showConfluencePage() {
    const cx = Math.floor(CONFIG.WIDTH / 2)
    const cy = Math.floor(CONFIG.HEIGHT / 2)

    // Browser chrome border
    this.add.rectangle(cx, cy, CONFIG.WIDTH - 16, CONFIG.HEIGHT - 24, 0x1a1a2e)
      .setStrokeStyle(1, 0x9bc5ff)

    // Title bar
    this.add.rectangle(cx, cy - Math.floor(CONFIG.HEIGHT / 2) + 20, CONFIG.WIDTH - 16, 16, 0x2a2a4a)
    this.add.text(12, cy - Math.floor(CONFIG.HEIGHT / 2) + 14, 'Confluence', {
      ...CONFLUENCE_STYLE, color: '#ffe066',
    })

    // Page content
    const playerName = GameState.player.name || 'ENGINEER'
    this.add.text(cx, cy - 12, 'New Page Created:', {
      ...CONFLUENCE_STYLE,
    }).setOrigin(0.5)

    this.add.text(cx, cy + 2, `"${playerName}'s Promotion\nto Principal Engineer"`, {
      ...CONFLUENCE_STYLE,
      align: 'center',
    }).setOrigin(0.5)

    const confluenceLine = this._ending?.confluenceLine ?? 'Page views: 0.'
    this.add.text(cx, cy + 24, confluenceLine, {
      ...CONFLUENCE_STYLE, color: '#666688',
    }).setOrigin(0.5)

    this.time.delayedCall(CONFLUENCE_DISPLAY_MS, () => {
      this._phase = PHASE.CREDITS
      // Clear confluence page
      this.children.removeAll(true)
      this._startCredits()
    })
  }

  // -------------------------------------------------------------------------
  // Phase 2: Scrolling NPC credits
  // -------------------------------------------------------------------------
  _startCredits() {
    const ending = this._ending
    if (ending?.creditsMusic) {
      this.playBgm(ending.creditsMusic)
    }

    // Title card
    const titleCard = ending?.titleCard ?? '"The Post-Mortem"'
    const promotionLine = ending?.promotionLine ?? ''

    const cx = Math.floor(CONFIG.WIDTH / 2)
    let y = CONFIG.HEIGHT + 8

    // Ending title
    const titleText = this.add.text(cx, y, titleCard, TITLE_STYLE).setOrigin(0.5)
    this._creditTexts.push(titleText)
    y += 24

    // Promotion line
    if (promotionLine) {
      const promoText = this.add.text(cx, y, promotionLine, TEXT_STYLE).setOrigin(0.5)
      this._creditTexts.push(promoText)
      y += 20
    }

    // Divider
    y += 12

    // NPC credits list
    const creditsList = getStoryById('credits_npc_list')
    const entries = creditsList?.entries ?? []
    for (const entry of entries) {
      const nameText = this.add.text(cx, y, entry.name, {
        ...TEXT_STYLE, color: '#ffe066',
      }).setOrigin(0.5)
      this._creditTexts.push(nameText)
      y += 12

      const roleText = this.add.text(cx, y, entry.role, {
        ...TEXT_STYLE, color: '#9bc5ff',
      }).setOrigin(0.5)
      this._creditTexts.push(roleText)
      y += 18
    }

    // Player name last
    y += 12
    const playerName = GameState.player.name || 'ENGINEER'
    const playerText = this.add.text(cx, y, playerName, {
      ...TITLE_STYLE, color: '#ffe066',
    }).setOrigin(0.5)
    this._creditTexts.push(playerText)
    y += 14

    const playerRole = this.add.text(cx, y, 'Principal Engineer', TEXT_STYLE).setOrigin(0.5)
    this._creditTexts.push(playerRole)
  }

  update(time, delta) {
    if (this._phase === PHASE.CREDITS && this._creditTexts.length > 0) {
      const scrollDelta = SCROLL_SPEED * (delta / 1000)

      for (const text of this._creditTexts) {
        text.y -= scrollDelta
      }

      // Credits done when the last text has scrolled past top
      const lastText = this._creditTexts[this._creditTexts.length - 1]
      if (lastText && lastText.y < -20) {
        this._phase = PHASE.POST_CREDITS
        this._creditTexts = []
        this.children.removeAll(true)
        this._showPostCredits()
      }
    }
  }

  // -------------------------------------------------------------------------
  // Phase 3: Post-credits text
  // -------------------------------------------------------------------------
  _showPostCredits() {
    const cx = Math.floor(CONFIG.WIDTH / 2)
    const cy = Math.floor(CONFIG.HEIGHT / 2)

    const ending = this._ending
    const postText = ending?.postCreditsText ?? ''
    const followUp = ending?.postCreditsFollowUp ?? ''

    this.add.text(cx, cy - 8, postText, TEXT_STYLE).setOrigin(0.5)

    this.time.delayedCall(PAGER_PROMPT_MS, () => {
      this.add.text(cx, cy + 12, followUp, {
        ...TEXT_STYLE, color: '#ff6666',
      }).setOrigin(0.5)

      this.time.delayedCall(PAGER_PROMPT_MS, () => {
        this._phase = PHASE.PAGER
        this.children.removeAll(true)
        this._showPager()
      })
    })
  }

  // -------------------------------------------------------------------------
  // Phase 4: Interactive pager
  // -------------------------------------------------------------------------
  _showPager() {
    const cx = Math.floor(CONFIG.WIDTH / 2)
    const cy = Math.floor(CONFIG.HEIGHT / 2)

    this.add.text(cx, cy - 16, '❗ PAGER', {
      ...TITLE_STYLE, color: '#ff6666',
    }).setOrigin(0.5)

    const alertText = getStoryById('pager_alert')
    this.add.text(cx, cy + 4, alertText?.pages[0] ?? 'ALERT: High CPU.', {
      ...TEXT_STYLE, align: 'center',
    }).setOrigin(0.5)

    this.add.text(cx, cy + 28, 'Press Z to acknowledge', {
      ...TEXT_STYLE, color: '#ffe066', fontSize: '6px',
    }).setOrigin(0.5)

    const confirmKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    confirmKey.once('down', () => {
      this.children.removeAll(true)

      const ackText = getStoryById('pager_acknowledged')
      this.add.text(cx, cy, ackText?.pages[0] ?? '47 more alerts pending.', {
        ...TEXT_STYLE, align: 'center',
      }).setOrigin(0.5)

      // Set post-game flags
      GameState.story.flags.game_complete = true
      GameState.story.flags.principal_engineer_mode = true
      GameState.player.title = 'Principal Engineer'
      markDirty()

      this.time.delayedCall(2000, () => {
        this._phase = PHASE.DONE
        this.fadeToScene('WorldScene')
      })
    })
  }
}
