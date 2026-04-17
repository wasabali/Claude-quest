import Phaser from 'phaser'
import { BaseScene } from '#scenes/BaseScene.js'
import { CONFIG } from '../config.js'
import { GameState, markDirty } from '#state/GameState.js'
import { getById as getSkillById } from '#data/skills.js'
import {
  BATTLE_MODES,
  createBattleState,
  resolveTurn,
} from '#engine/BattleEngine.js'
import { calculateXP, computeShameFlags } from '#engine/SkillEngine.js'

// ---------------------------------------------------------------------------
// Layout constants — positions derived from CONFIG.WIDTH/HEIGHT (160×144 native)
// ---------------------------------------------------------------------------
const ENEMY_HP_BAR_X   = Math.floor(CONFIG.WIDTH / 2)
const ENEMY_HP_BAR_Y   = 10
const PLAYER_HP_BAR_X  = 4
const PLAYER_HP_BAR_Y  = CONFIG.HEIGHT - 44
const BUDGET_METER_X   = 4
const BUDGET_METER_Y   = CONFIG.HEIGHT - 32
const SLA_TIMER_X      = CONFIG.WIDTH - 40
const SLA_TIMER_Y      = 6
const SKILL_MENU_X     = 4
const SKILL_MENU_Y     = CONFIG.HEIGHT - 62
const SKILL_MENU_H     = 14
const HP_BAR_W         = Math.floor(CONFIG.WIDTH * 0.475)
const HP_BAR_H         = 4
const BUDGET_BAR_W     = Math.floor(CONFIG.WIDTH * 0.375)
const BUDGET_BAR_H     = 4
const LOG_X            = 4
const LOG_Y            = CONFIG.HEIGHT - 76

// ---------------------------------------------------------------------------
// BattleScene
// Phaser rendering layer for all battle encounters.
// Delegates ALL logic to BattleEngine and SkillEngine — no damage math here.
// ---------------------------------------------------------------------------
export class BattleScene extends BaseScene {
  constructor() {
    super({ key: 'BattleScene' })
    this._battleState  = null
    this._skillIndex   = 0
    this._eventQueue   = []
    this._animating    = false
    this._activeSkills = []
  }

  // -------------------------------------------------------------------------
  // create(data)
  // data shape:
  //   mode:            BATTLE_MODES.INCIDENT | BATTLE_MODES.ENGINEER
  //   opponent:        { id, name, domain, hp, maxHp, difficulty, teachSkillId? }
  //   slaTimer:        number (INCIDENT only)
  //   telegraphedMove: string (ENGINEER only)
  //   returnScene:     scene key to resume after battle
  // -------------------------------------------------------------------------
  create(data = {}) {
    const mode     = data.mode ?? BATTLE_MODES.INCIDENT
    const opponent = data.opponent ?? {
      id: 'stub_incident', name: 'Stub Incident',
      domain: 'cloud', hp: 60, maxHp: 60, difficulty: 2,
    }
    this._returnScene  = data.returnScene ?? 'WorldScene'
    this._activeSkills = GameState.skills.active
      .filter(Boolean)
      .map(id => getSkillById(id))
      .filter(Boolean)

    // Build engine-side state (pure logic, no Phaser)
    this._battleState = createBattleState(mode, { ...GameState.player }, opponent, {
      slaTimer:        data.slaTimer ?? 10,
      telegraphedMove: data.telegraphedMove ?? null,
      emblems:         GameState.emblems ?? {},
    })

    this._skillIndex = 0
    this._animating  = false
    this._eventQueue = []

    this._buildHUD(mode, opponent)
    this._buildSkillMenu()
    this._buildLogBox()
    this._setupInput()

    if (mode === BATTLE_MODES.INCIDENT) {
      this.playBgm('bgm_battle_incident')
    } else {
      this.playBgm('bgm_battle_engineer')
    }
  }

  // -------------------------------------------------------------------------
  // HUD — player HP, enemy HP, budget meter, SLA timer
  // -------------------------------------------------------------------------
  _buildHUD(mode, opponent) {
    const textStyle = { fontFamily: CONFIG.FONT, fontSize: '6px', color: '#ffffff' }

    // Enemy name + HP
    this._enemyNameText = this.add.text(ENEMY_HP_BAR_X, ENEMY_HP_BAR_Y - 2, opponent.name ?? '???', textStyle)
    this._enemyHpBarBg  = this.add.rectangle(ENEMY_HP_BAR_X, ENEMY_HP_BAR_Y + 6, HP_BAR_W, HP_BAR_H, 0x440000).setOrigin(0, 0)
    this._enemyHpBar    = this.add.rectangle(ENEMY_HP_BAR_X, ENEMY_HP_BAR_Y + 6, HP_BAR_W, HP_BAR_H, 0x00cc44).setOrigin(0, 0)

    // In ENGINEER mode, show domain; in INCIDENT mode show '???'
    const domainLabel = mode === BATTLE_MODES.ENGINEER ? opponent.domain : '???'
    this._enemyDomainText = this.add.text(ENEMY_HP_BAR_X, ENEMY_HP_BAR_Y + 12, `[${domainLabel}]`, {
      ...textStyle, color: '#9bc5ff',
    })

    // In ENGINEER mode, show telegraphed move (stored as instance var for live updates)
    if (mode === BATTLE_MODES.ENGINEER) {
      const telegraphLabel = this._battleState.telegraphedMove
        ? `Preparing: ${this._battleState.telegraphedMove}`
        : ''
      this._telegraphText = this.add.text(4, 22, telegraphLabel, {
        ...textStyle, color: '#ffe066',
      })
    } else {
      this._telegraphText = null
    }

    // Player HP
    this.add.text(PLAYER_HP_BAR_X, PLAYER_HP_BAR_Y - 2, 'HP', textStyle)
    this._playerHpBarBg = this.add.rectangle(PLAYER_HP_BAR_X + 12, PLAYER_HP_BAR_Y + 2, HP_BAR_W, HP_BAR_H, 0x440000).setOrigin(0, 0)
    this._playerHpBar   = this.add.rectangle(PLAYER_HP_BAR_X + 12, PLAYER_HP_BAR_Y + 2, HP_BAR_W, HP_BAR_H, 0x00cc44).setOrigin(0, 0)
    this._playerHpText  = this.add.text(PLAYER_HP_BAR_X + HP_BAR_W + 14, PLAYER_HP_BAR_Y - 2, this._hpLabel(), textStyle)

    // Budget meter
    this.add.text(BUDGET_METER_X, BUDGET_METER_Y - 2, '$', textStyle)
    this._budgetBarBg = this.add.rectangle(BUDGET_METER_X + 8, BUDGET_METER_Y + 2, BUDGET_BAR_W, BUDGET_BAR_H, 0x333300).setOrigin(0, 0)
    this._budgetBar   = this.add.rectangle(BUDGET_METER_X + 8, BUDGET_METER_Y + 2, BUDGET_BAR_W, BUDGET_BAR_H, 0xffe066).setOrigin(0, 0)

    // SLA timer (INCIDENT only)
    if (mode === BATTLE_MODES.INCIDENT) {
      this._slaText = this.add.text(SLA_TIMER_X, SLA_TIMER_Y, this._slaLabel(), {
        ...textStyle, color: '#ff6666',
      })
    }
  }

  _hpLabel() {
    const { hp, maxHp } = this._battleState.player
    return `${hp}/${maxHp}`
  }

  _slaLabel() {
    const timer = this._battleState.slaTimer
    return `SLA:${timer ?? '-'}`
  }

  // -------------------------------------------------------------------------
  // Skill menu — navigable list of active skills
  // -------------------------------------------------------------------------
  _buildSkillMenu() {
    this._skillMenuItems = []
    const style = { fontFamily: CONFIG.FONT, fontSize: '6px', color: '#ffffff' }

    for (let i = 0; i < this._activeSkills.length; i++) {
      const skill = this._activeSkills[i]
      const text  = this.add.text(
        SKILL_MENU_X + 8,
        SKILL_MENU_Y + i * SKILL_MENU_H,
        skill.displayName ?? skill.id,
        style,
      )
      this._skillMenuItems.push(text)
    }

    // Arrow cursor
    this._menuArrow = this.add.text(SKILL_MENU_X, SKILL_MENU_Y, '>', {
      fontFamily: CONFIG.FONT, fontSize: '6px', color: '#ffe066',
    })

    this._refreshMenuCursor()
  }

  _refreshMenuCursor() {
    if (!this._menuArrow) return
    this._menuArrow.setY(SKILL_MENU_Y + this._skillIndex * SKILL_MENU_H)
  }

  _refreshMenuHighlight() {
    this._skillMenuItems.forEach((item, i) => {
      item.setColor(i === this._skillIndex ? '#ffe066' : '#ffffff')
    })
  }

  // -------------------------------------------------------------------------
  // Log box — displays last event dialog
  // -------------------------------------------------------------------------
  _buildLogBox() {
    this._logText = this.add.text(LOG_X, LOG_Y, '', {
      fontFamily:  CONFIG.FONT,
      fontSize:    '6px',
      color:       '#f8f8f8',
      wordWrap:    { width: CONFIG.WIDTH - 8 },
    })
  }

  _showLog(text) {
    if (this._logText) this._logText.setText(text)
  }

  // -------------------------------------------------------------------------
  // Input — arrow keys to navigate, Z to confirm, X to cancel
  // -------------------------------------------------------------------------
  _setupInput() {
    const keys = this.input.keyboard.addKeys({
      up:      Phaser.Input.Keyboard.KeyCodes.UP,
      down:    Phaser.Input.Keyboard.KeyCodes.DOWN,
      confirm: Phaser.Input.Keyboard.KeyCodes.Z,
      cancel:  Phaser.Input.Keyboard.KeyCodes.X,
    })

    this._keys = keys
  }

  update() {
    if (this._animating) return

    const keys = this._keys
    if (!keys) return

    if (Phaser.Input.Keyboard.JustDown(keys.up)) {
      this._skillIndex = Math.max(0, this._skillIndex - 1)
      this._refreshMenuCursor()
      this._refreshMenuHighlight()
    }
    if (Phaser.Input.Keyboard.JustDown(keys.down)) {
      const lastIndex  = Math.max(0, this._activeSkills.length - 1)
      this._skillIndex = Math.min(lastIndex, this._skillIndex + 1)
      this._refreshMenuCursor()
      this._refreshMenuHighlight()
    }
    if (Phaser.Input.Keyboard.JustDown(keys.confirm)) {
      this._useSkill(this._activeSkills[this._skillIndex])
    }
  }

  // -------------------------------------------------------------------------
  // _useSkill — delegate to engine, then animate events
  // -------------------------------------------------------------------------
  _useSkill(skill) {
    if (!skill || this._animating) return

    const events = resolveTurn(this._battleState, skill)

    // winningTier is now set inside skillPhase via assessQuality in the engine
    this._animateEvents(events)
  }

  // -------------------------------------------------------------------------
  // _animateEvents — render each BattleEvent in sequence
  // The engine never renders; this function is the only place that touches
  // Phaser objects as a result of engine output.
  // -------------------------------------------------------------------------
  _animateEvents(events) {
    this._animating = true
    let index = 0

    const next = () => {
      if (index >= events.length) {
        this._animating = false
        this._refreshHUD()
        return
      }

      const event = events[index++]
      this._renderEvent(event, next)
    }

    next()
  }

  _renderEvent(event, callback) {
    switch (event.type) {
      case 'skill_used':
        this._showLog(`Used: ${event.skillId}`)
        this.time.delayedCall(300, callback)
        break

      case 'damage':
        if (event.target === 'opponent') {
          this._showLog(`Dealt ${event.value} damage!`)
        } else {
          this._showLog(`Took ${event.value} damage!`)
        }
        this._refreshHUD()
        this.time.delayedCall(400, callback)
        break

      case 'heal':
        this._showLog(`Restored ${event.value} HP!`)
        this._refreshHUD()
        this.time.delayedCall(400, callback)
        break

      case 'domain_reveal':
        this._showLog(`Domain revealed: ${event.value}!`)
        this._enemyDomainText?.setText(`[${event.value}]`)
        this.time.delayedCall(500, callback)
        break

      case 'sla_tick':
        if (this._slaText) this._slaText.setText(this._slaLabel())
        callback()
        break

      case 'sla_breach':
        this._showLog('SLA BREACH! Penalty applied.')
        if (this._slaText) this._slaText.setColor('#ff0000')
        this.time.delayedCall(600, callback)
        break

      case 'status_tick':
      case 'status_remove':
        callback()
        break

      case 'reputation':
        this._showLog(event.value < 0
          ? `Reputation -${Math.abs(event.value)}. Shame +${event.shameDelta ?? 0}.`
          : `Reputation +${event.value}.`)
        this.time.delayedCall(400, callback)
        break

      case 'xp_gain':
        this._showLog(`+${event.value} XP`)
        this.time.delayedCall(500, callback)
        break

      case 'teach_skill':
        this._showLog(`Learned: ${event.value}!`)
        this.time.delayedCall(800, callback)
        break

      case 'teach_hint':
        this._showLog(`Hint: study ${event.value} next.`)
        this.time.delayedCall(600, callback)
        break

      case 'technical_debt':
        this._showLog(`Technical debt: ${event.value} stack${event.value !== 1 ? 's' : ''}.`)
        this._refreshHUD()
        this.time.delayedCall(500, callback)
        break

      case 'trainer_disgusted':
        this._showLog('Trainer leaves in disgust. No teaching.')
        this.time.delayedCall(600, callback)
        break

      case 'warn_npcs':
        this._showLog('Trainer warns all NPCs about you.')
        this.time.delayedCall(600, callback)
        break


      case 'budget_drain':
        this._showLog(`Budget drained by ${event.value}!`)
        this._refreshHUD()
        this.time.delayedCall(400, callback)
        break

      case 'escalation':
        this._showLog('Technical debt increased! The incident is escalating.')
        this.time.delayedCall(500, callback)
        break

      case 'layer_transition':
        this._showLog('Root cause revealed! A deeper layer emerges...')
        this._enemyDomainText?.setText('[???]')
        this.time.delayedCall(800, callback)
        break

      case 'battle_end':
        this._onBattleEnd(event.value)
        break

      case 'telegraph':
        if (this._battleState.mode === BATTLE_MODES.ENGINEER) {
          if (this._telegraphText) {
            this._telegraphText.setText(`Preparing: ${event.value}`)
          }
        }
        this.time.delayedCall(400, callback)
        break

      case 'dialog':
        this._showLog(event.text ?? '')
        this.time.delayedCall(800, callback)
        break

      default:
        callback()
    }
  }

  // -------------------------------------------------------------------------
  // _onBattleEnd — sync GameState then return to world
  // -------------------------------------------------------------------------
  _onBattleEnd(result) {
    const { player, opponent } = this._battleState

    // Write engine state back to GameState
    GameState.player.hp            = player.hp
    GameState.player.maxHp         = player.maxHp
    GameState.player.reputation    = player.reputation
    GameState.player.shamePoints   = player.shamePoints
    GameState.player.technicalDebt = player.technicalDebt ?? GameState.player.technicalDebt
    GameState.player.budget        = player.budget !== undefined ? player.budget : GameState.player.budget

    // Sync emblem grime accumulated during the battle
    if (this._battleState.emblems && Object.keys(this._battleState.emblems).length > 0) {
      GameState.emblems = { ...GameState.emblems, ...this._battleState.emblems }
    }

    // Set any shame threshold flags that were crossed during the battle
    const shameFlags = computeShameFlags(player.shamePoints)
    Object.assign(GameState.story.flags, shameFlags)

    // Track SLA breach in persistent stats
    if (this._battleState.slaBreach) {
      GameState.stats.slaBreaches = (GameState.stats.slaBreaches ?? 0) + 1
    }

    if (result === 'win') {
      GameState.stats.battlesWon++

      if (this._battleState.mode === BATTLE_MODES.INCIDENT) {
        GameState.stats.incidentsResolved = (GameState.stats.incidentsResolved ?? 0) + 1
      }

      // Apply XP using the post-turn quality tier
      const xp = calculateXP(opponent.difficulty ?? 1, this._battleState.winningTier ?? 'standard')
      GameState.player.xp = (GameState.player.xp ?? 0) + xp

      // Apply any skill taught by an engineer opponent
      const teachEvent = this._battleState.log.slice().reverse().find(e => e.type === 'teach_skill')
      if (teachEvent?.value && !GameState.skills.learned.includes(teachEvent.value)) {
        GameState.skills.learned.push(teachEvent.value)
      }
    } else {
      GameState.stats.battlesLost++
    }

    markDirty()
    this._showLog(result === 'win' ? 'Victory!' : 'Defeated...')
    this.time.delayedCall(1200, () => {
      this.fadeToScene(this._returnScene ?? 'WorldScene')
    })
  }

  // -------------------------------------------------------------------------
  // _refreshHUD — redraw all HUD bars from current engine state
  // -------------------------------------------------------------------------
  _refreshHUD() {
    const { player, opponent } = this._battleState
    if (!player || !opponent) return

    // Player HP bar
    const playerRatio = Math.max(0, player.hp / player.maxHp)
    this._playerHpBar?.setDisplaySize(HP_BAR_W * playerRatio, HP_BAR_H)
    this._playerHpText?.setText(this._hpLabel())

    // Player HP bar colour: green > 50%, yellow > 25%, red otherwise
    const hpColour = playerRatio > 0.5 ? 0x00cc44 : playerRatio > 0.25 ? 0xffe066 : 0xff3300
    this._playerHpBar?.setFillStyle(hpColour)

    // Enemy HP bar
    const enemyRatio = Math.max(0, opponent.hp / opponent.maxHp)
    this._enemyHpBar?.setDisplaySize(HP_BAR_W * enemyRatio, HP_BAR_H)

    // Budget bar
    const maxBudget  = GameState.player.budget ?? 500
    const budgetRatio = Math.min(1, player.budget / maxBudget)
    this._budgetBar?.setDisplaySize(BUDGET_BAR_W * budgetRatio, BUDGET_BAR_H)

    // SLA timer text
    if (this._slaText) this._slaText.setText(this._slaLabel())
  }
}
