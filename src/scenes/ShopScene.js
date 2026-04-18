import Phaser from 'phaser'
import { CONFIG } from '../config.js'
import { BaseScene } from '#scenes/BaseScene.js'
import { GameState, markDirty, addItem } from '#state/GameState.js'
import { getById as getShopById } from '#data/shops.js'
import { getById as getItemById } from '#data/items.js'
import { getPrice, isShopUnlocked, purchaseItem } from '#engine/EconomyEngine.js'

const TOP_PANEL_HEIGHT    = 24
const LIST_PANEL_HEIGHT   = 96
const DETAIL_PANEL_Y      = TOP_PANEL_HEIGHT + LIST_PANEL_HEIGHT
const MAX_VISIBLE_ITEMS   = 4
const FONT_SIZE           = '8px'

export class ShopScene extends BaseScene {
  constructor() {
    super({ key: 'ShopScene' })
    this.shopId       = null
    this.selectedItem = 0
    this.scrollOffset = 0
  }

  create(data = {}) {
    this.shopId       = data.shopId ?? null
    this.selectedItem = 0
    this.scrollOffset = 0
    this.returnSceneKey = data.returnSceneKey ?? 'WorldScene'

    this.createChrome()
    this.registerInputs()
    this.refresh()
  }

  createChrome() {
    this.createPanel(0, 0, CONFIG.WIDTH, TOP_PANEL_HEIGHT)
    this.createPanel(0, TOP_PANEL_HEIGHT, CONFIG.WIDTH, LIST_PANEL_HEIGHT)
    this.createPanel(0, DETAIL_PANEL_Y, CONFIG.WIDTH, CONFIG.HEIGHT - DETAIL_PANEL_Y)

    this.headerText = this.add.text(4, 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   FONT_SIZE,
      color:      '#ffffff',
    })

    this.itemListText = this.add.text(4, TOP_PANEL_HEIGHT + 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   FONT_SIZE,
      color:      '#ffffff',
      lineSpacing: 8,
    })

    this.detailText = this.add.text(4, DETAIL_PANEL_Y + 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   FONT_SIZE,
      color:      '#aaaaaa',
      wordWrap:   { width: CONFIG.WIDTH - 8, useAdvancedWrap: true },
      lineSpacing: 4,
    })

    this.budgetText = this.add.text(CONFIG.WIDTH - 4, 6, '', {
      fontFamily: CONFIG.FONT,
      fontSize:   FONT_SIZE,
      color:      '#ffe066',
    }).setOrigin(1, 0)
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
      up:   Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      z:    Phaser.Input.Keyboard.KeyCodes.Z,
      x:    Phaser.Input.Keyboard.KeyCodes.X,
    })
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.up))   this.moveCursor(-1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) this.moveCursor(1)
    if (Phaser.Input.Keyboard.JustDown(this.keys.z))    this.confirmPurchase()
    if (Phaser.Input.Keyboard.JustDown(this.keys.x))    this.exitShop()
  }

  moveCursor(delta) {
    const shop = getShopById(this.shopId)
    if (!shop) return
    const count = shop.inventory.length
    this.selectedItem = Math.max(0, Math.min(count - 1, this.selectedItem + delta))
    if (this.selectedItem < this.scrollOffset) this.scrollOffset = this.selectedItem
    if (this.selectedItem >= this.scrollOffset + MAX_VISIBLE_ITEMS) this.scrollOffset = this.selectedItem - MAX_VISIBLE_ITEMS + 1
    this.refresh()
  }

  confirmPurchase() {
    const shop = getShopById(this.shopId)
    if (!shop) return
    if (!isShopUnlocked(shop, GameState.player)) return

    const entry = shop.inventory[this.selectedItem]
    if (!entry) return

    const stock = this._getStock(this.shopId, entry.itemId, entry.stock)
    if (stock === 0) return

    const events = purchaseItem(shop, entry.itemId, GameState.player.budget, GameState.player.reputation)
    const purchase = events.find(e => e.type === 'shop_purchase')
    if (!purchase) return

    const item = getItemById(entry.itemId)
    if (!item) return

    GameState.player.budget -= purchase.price
    addItem(item.tab, entry.itemId, 1)
    if (stock > 0) this._setStock(this.shopId, entry.itemId, stock - 1)
    markDirty()
    this.refresh()
  }

  _getStock(shopId, itemId, defaultStock) {
    const key = `shop_stock_${shopId}_${itemId}`
    return GameState.story.flags[key] ?? defaultStock
  }

  _setStock(shopId, itemId, value) {
    const key = `shop_stock_${shopId}_${itemId}`
    GameState.story.flags[key] = value
  }

  exitShop() {
    this.fadeToScene(this.returnSceneKey)
  }

  refresh() {
    const shop = getShopById(this.shopId)
    if (!shop) {
      this.headerText.setText('SHOP NOT FOUND')
      return
    }

    if (!isShopUnlocked(shop, GameState.player)) {
      this.headerText.setText('LOCKED')
      this.detailText.setText('You lack the required shame\nto shop here.')
      return
    }

    this.headerText.setText(shop.name.toUpperCase())
    this.budgetText.setText(`${GameState.player.budget}`)

    const visible = shop.inventory.slice(this.scrollOffset, this.scrollOffset + MAX_VISIBLE_ITEMS)
    const lines = visible.map((entry, i) => {
      const idx    = this.scrollOffset + i
      const item   = getItemById(entry.itemId)
      const name   = item?.displayName ?? entry.itemId
      const price  = getPrice(shop, entry.itemId, GameState.player.reputation)
      const currentStock = this._getStock(this.shopId, entry.itemId, entry.stock)
      const stockLabel   = currentStock === -1 ? '' : ` [${currentStock}]`
      const arrow  = idx === this.selectedItem ? '>' : ' '
      return `${arrow} ${name}${stockLabel}  $${price}`
    })
    this.itemListText.setText(lines.join('\n'))

    const selectedEntry = shop.inventory[this.selectedItem]
    if (selectedEntry) {
      const item  = getItemById(selectedEntry.itemId)
      const price = getPrice(shop, selectedEntry.itemId, GameState.player.reputation)
      const desc  = item?.description ?? ''
      const currentStock = this._getStock(this.shopId, selectedEntry.itemId, selectedEntry.stock)
      const stockLabel   = currentStock === -1 ? 'Unlimited' : `Stock: ${currentStock}`
      this.detailText.setText(`${desc}\n${stockLabel}  $${price}`)
    }
  }
}
