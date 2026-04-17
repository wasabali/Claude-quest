import Phaser from 'phaser'
import { CONFIG } from '../config.js'
import { getById } from '#data/items.js'
import { BaseScene } from '#scenes/BaseScene.js'
import {
  GameState,
  markDirty,
  normalizeInventoryEntry,
  removeItem,
} from '#state/GameState.js'
import { reduceShame } from '#engine/SkillEngine.js'

const TABS = [
  { key: 'tools',       label: 'TOOLS', allowInBattle: true  },
  { key: 'keyItems',    label: 'KEY',   allowInBattle: false },
  { key: 'credentials', label: 'CRED',  allowInBattle: false },
  { key: 'docs',        label: 'DOCS',  allowInBattle: false },
  { key: 'junk',        label: 'JUNK',  allowInBattle: false },
]

const MAX_VISIBLE_ITEMS = 4
const TOP_PANEL_HEIGHT = 20
const LIST_PANEL_HEIGHT = 92
const DESCRIPTION_PANEL_Y = TOP_PANEL_HEIGHT + LIST_PANEL_HEIGHT

export class InventoryScene extends BaseScene {
  constructor() {
    super({ key: 'InventoryScene' })
    this.mode           = 'overworld'
    this.returnSceneKey = null
    this.selectedTab    = 0
    this.selectedItem   = 0
    this.scrollOffset   = 0
  }

  create(data = {}) {
    this.mode           = data.mode === 'battle' ? 'battle' : 'overworld'
    this.returnSceneKey = data.returnSceneKey ?? null
    this.selectedTab    = this.mode === 'battle' ? 0 : (data.selectedTab ?? 0)
    this.selectedItem   = 0
    this.scrollOffset   = 0

    this.createChrome()
    this.registerInputs()
    this.refresh()
  }

  createChrome() {
    this.createPanel(0, 0, CONFIG.WIDTH, TOP_PANEL_HEIGHT)
    this.createPanel(0, TOP_PANEL_HEIGHT, CONFIG.WIDTH, LIST_PANEL_HEIGHT)
    this.createPanel(0, DESCRIPTION_PANEL_Y, CONFIG.WIDTH, CONFIG.HEIGHT - DESCRIPTION_PANEL_Y)

    this.tabText = this.add.text(4, 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   '8px',
      color:      '#ffffff',
    })

    this.itemText = this.add.text(4, 26, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   '8px',
      color:      '#ffffff',
      lineSpacing: 4,
    })

    this.descriptionText = this.add.text(4, DESCRIPTION_PANEL_Y + 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   '8px',
      color:      '#ffffff',
      wordWrap:   { width: CONFIG.WIDTH - 8 },
    })
  }

  createPanel(x, y, width, height) {
    if (typeof this.add.nineslice === 'function' && this.textures.exists('ui_window_9slice')) {
      return this.add.nineslice(x, y, width, height, 'ui_window_9slice', 4, 4, 4, 4).setOrigin(0, 0)
    }

    const panel = this.add.rectangle(x, y, width, height, 0x1a1a2a).setOrigin(0, 0)
    panel.setStrokeStyle(1, 0xffffff)
    return panel
  }

  registerInputs() {
    this.keys = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      x:     Phaser.Input.Keyboard.KeyCodes.X,
    })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.left)) this.changeTab(-1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.right)) this.changeTab(1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) this.moveCursor(-1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) this.moveCursor(1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.z)) this.confirm()
    if (Phaser.Input.Keyboard.JustDown(this.keys.x)) this.close()
  }

  changeTab(step) {
    if (this.mode === 'battle') return
    this.selectedTab = (this.selectedTab + step + TABS.length) % TABS.length
    this.selectedItem = 0
    this.scrollOffset = 0
    this.refresh()
  }

  moveCursor(step) {
    const items = this.getVisibleItems()
    if (items.length === 0) return

    this.selectedItem = Phaser.Math.Wrap(this.selectedItem + step, 0, items.length)
    if (this.selectedItem < this.scrollOffset) this.scrollOffset = this.selectedItem
    if (this.selectedItem >= this.scrollOffset + MAX_VISIBLE_ITEMS) {
      this.scrollOffset = this.selectedItem - MAX_VISIBLE_ITEMS + 1
    }
    this.refresh()
  }

  confirm() {
    const item = this.getSelectedItem()
    if (!item) return

    const action = this.getPrimaryAction(item)
    this.performAction(action, item)
  }

  getPrimaryAction(item) {
    if (this.mode === 'battle') return item.usableInBattle ? 'use' : 'examine'

    const actions = item.worldActions ?? []
    if (actions.includes('use'))  return 'use'
    if (actions.includes('read')) return 'read'
    return 'examine'
  }

  performAction(action, item) {
    if (action === 'drop') {
      if (item.cannotDropText) {
        this.descriptionText.setText(item.cannotDropText)
        return
      }
      removeItem(this.getActiveTab().key, item.id, 1)
      this.selectedItem = 0
      this.scrollOffset = 0
      this.refresh()
      return
    }

    if (action === 'examine') {
      this.descriptionText.setText(item.description)
      return
    }

    if (action === 'read' || action === 'use') {
      const result = this.applyEffect(item, action)
      this.descriptionText.setText(result.message)

      if (result.consume) {
        removeItem(this.getActiveTab().key, item.id, 1)
        this.selectedItem = Math.min(this.selectedItem, Math.max(0, this.getVisibleItems().length - 1))
      }

      if (this.mode === 'battle' && action === 'use') {
        this.events.emit('bag:itemUsed', {
          itemId: item.id,
          effect: item.effect,
        })
        this.close({ consumedTurn: true })
      } else {
        this.refresh()
      }
    }
  }

  applyEffect(item, action) {
    const effect = item.effect
    if (!effect) return { message: item.description, consume: false }

    if (effect.type === 'heal_hp') {
      const nextHp = GameState.player.hp + effect.value
      GameState.player.hp = Math.max(0, Math.min(GameState.player.maxHp, nextHp))
      markDirty()
      return { message: `${item.displayName} restored ${effect.value} HP.`, consume: true }
    }

    if (effect.type === 'status_apply') {
      GameState.story.flags.onCallActive = true
      markDirty()
      return { message: 'On-Call status enabled.', consume: action === 'use' }
    }

    if (effect.type === 'read_xp_if_last_battle_lost') {
      const alreadyRead   = GameState.story.flags[effect.onceFlag]
      const hasLostBattle = GameState.story.flags.lastBattleResult === 'loss'

      if (!alreadyRead && hasLostBattle) {
        GameState.player.xp += effect.value
        GameState.story.flags[effect.onceFlag] = true
        markDirty()
        return { message: `You learned from failure. +${effect.value} XP.`, consume: false }
      }
      return { message: 'Nothing new to learn right now.', consume: false }
    }

    if (effect.type === 'reduce_shame') {
      const previousShame = GameState.player.shamePoints
      const updated = reduceShame(GameState.player, effect.value)
      const actualReduction = previousShame - updated.shamePoints

      if (actualReduction <= 0) {
        return { message: 'Your conscience is already clear.\n(Relatively speaking.)', consume: false }
      }

      GameState.player.shamePoints = updated.shamePoints
      markDirty()
      return { message: `You feel slightly less terrible about yourself.\nShame: −${actualReduction}.`, consume: true }
    }

    if (effect.type === 'enter_hidden_area') {
      if (!GameState.story.flags[effect.discoveryFlag]) {
        GameState.story.flags[effect.discoveryFlag] = true
        markDirty()
      }
      this.events.emit('inventory:enterHiddenArea', { areaId: effect.areaId })
      return { message: 'You fall in.', consume: false }
    }

    return { message: item.description, consume: false }
  }

  getActiveTab() {
    return TABS[this.selectedTab]
  }

  getVisibleItems() {
    const tab = this.getActiveTab()
    const raw = GameState.inventory[tab.key] ?? []

    const normalized = raw.map((entry) => normalizeInventoryEntry(entry))

    return normalized
      .map(({ id, qty }) => ({ ...getById(id), qty }))
      .filter(Boolean)
      .filter((item) => this.mode !== 'battle' || item.usableInBattle)
  }

  getSelectedItem() {
    return this.getVisibleItems()[this.selectedItem] ?? null
  }

  refresh() {
    const tabsLine = TABS.map((tab, index) => {
      const isSelected = index === this.selectedTab
      const isDisabled = this.mode === 'battle' && !tab.allowInBattle
      const text       = isDisabled ? `[${tab.label}]` : tab.label
      return isSelected ? `>${text}<` : text
    }).join(' ')

    this.tabText.setText(tabsLine)

    const items = this.getVisibleItems()
    const rows  = items.slice(this.scrollOffset, this.scrollOffset + MAX_VISIBLE_ITEMS)
      .map((item, index) => {
        const globalIndex = this.scrollOffset + index
        const cursor      = globalIndex === this.selectedItem ? '►' : ' '
        return `${cursor} ${item.displayName} x${item.qty}`
      })

    this.itemText.setText(rows.length > 0 ? rows.join('\n') : '  (empty)')
    this.descriptionText.setText(this.getSelectedItem()?.description ?? 'No items.')
  }

  close(payload = {}) {
    if (this.returnSceneKey && this.scene.isPaused(this.returnSceneKey)) {
      this.scene.resume(this.returnSceneKey, payload)
    }
    this.scene.stop(this.scene.key)
  }
}
