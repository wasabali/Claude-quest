import Phaser from 'phaser'
import { BaseScene } from '#scenes/BaseScene.js'
import { DialogBox } from '#ui/DialogBox.js'
import { CONFIG } from '../config.js'
import { GameState, hasItem, markDirty } from '#state/GameState.js'
import { getById as getStoryById } from '#data/story.js'
import { getById as getRegionById } from '#data/regions.js'
import { canTravel, getDiscoveredTerminals, canFastTravel } from '#engine/RegionEngine.js'

const TILESET_KEY = 'stub_tiles'
const TILE_SIZE   = CONFIG.TILE_SIZE   // 48px

const WALK_SPEED  = TILE_SIZE * 2     // 96 px/sec
const RUN_SPEED   = TILE_SIZE * 4     // 192 px/sec

// 4-frame stepped fade for region transitions (no smooth tweening)
const FADE_STEPS     = [1.0, 0.66, 0.33, 0.0]
const FADE_STEP_MS   = 50

// Map edge detection margin (in pixels)
const EDGE_MARGIN = TILE_SIZE / 2

export class WorldScene extends BaseScene {
  constructor() {
    super({ key: 'WorldScene' })
  }

  preload() {
    const regionId = GameState.player.location || 'localhost_town'
    this._regionId = regionId

    if (!this.cache.tilemap.exists(regionId)) {
      this.load.tilemapTiledJSON(regionId, `assets/maps/${regionId}.tmj`)
    }

    if (!this.textures.exists(TILESET_KEY)) {
      const g = this.make.graphics({ add: false })
      const TILE_COLORS = [
        0x2d4a1e, // id 1 — grass
        0x5c4033, // id 2 — building A
        0x4a3a5c, // id 3 — building B
        0x1a2a3a, // id 4 — building C
        0x0d1117, // id 5 — wall/impassable
      ]
      TILE_COLORS.forEach((color, i) => {
        g.fillStyle(color)
        g.fillRect(i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE)
        g.lineStyle(1, 0x000000, 0.3)
        g.strokeRect(i * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE)
      })
      g.generateTexture(TILESET_KEY, TILE_SIZE * TILE_COLORS.length, TILE_SIZE)
      g.destroy()
    }

    if (!this.textures.exists('player')) {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x5599ff)
      g.fillRect(8, 8, 16, 22)
      g.fillStyle(0xffcc88)
      g.fillRect(8, 0, 16, 14)
      g.generateTexture('player', 32, 32)
      g.destroy()
    }

    if (!this.textures.exists('npc_default')) {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0xff9944)
      g.fillRect(8, 8, 16, 22)
      g.fillStyle(0xffcc88)
      g.fillRect(8, 0, 16, 14)
      g.generateTexture('npc_default', 32, 32)
      g.destroy()
    }

    if (!this.textures.exists('azure_terminal')) {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x0078d4)
      g.fillRect(4, 4, 40, 40)
      g.fillStyle(0x50c8ff)
      g.fillRect(8, 8, 32, 8)
      g.fillRect(8, 20, 20, 4)
      g.generateTexture('azure_terminal', 48, 48)
      g.destroy()
    }
  }

  create(data = {}) {
    this.dialog       = new DialogBox(this)
    this._interacting = false
    this._transitioning = false
    this._facing      = 'down'
    this._stepCount   = 0
    this._lastTileX   = -1
    this._lastTileY   = -1
    this._entryDir    = data.entryDirection || null

    const regionId = this._regionId || GameState.player.location || 'localhost_town'

    this._setupMap(regionId)
    this._setupNpcSprites()
    this._setupPlayer()
    this._setupInput()
    this._setupCamera()

    GameState.player.location = regionId
    markDirty()

    // Unlock fast travel terminal on first visit
    const region = getRegionById(regionId)
    if (region?.hasFastTravel) {
      const terminalFlag = `terminal_unlocked_${regionId}`
      if (!GameState.story.flags[terminalFlag]) {
        GameState.story.flags[terminalFlag] = true
        markDirty()
      }
    }

    this.playBgm('town')
  }

  _setupMap(regionId) {
    this._map = this.make.tilemap({ key: regionId })
    const tileset = this._map.addTilesetImage('stub_tiles', TILESET_KEY, TILE_SIZE, TILE_SIZE, 0, 0)

    this._groundLayer  = this._map.createLayer('Ground',  tileset, 0, 0)
    this._objectsLayer = this._map.createLayer('Objects', tileset, 0, 0)

    this._collisionLayer = this._map.createLayer('Collision', tileset, 0, 0)
    this._collisionLayer.setVisible(false)
    this._collisionLayer.setCollisionByExclusion([0])

    this._overlayLayer = this._map.createLayer('Overlay', tileset, 0, 0)
    this._overlayLayer.setDepth(10)

    const npcLayer = this._map.getObjectLayer('NPCs')
    this._npcDefs  = npcLayer ? npcLayer.objects : []
  }

  _setupNpcSprites() {
    this._npcSprites = []
    for (const def of this._npcDefs) {
      const cx     = def.x + def.width / 2
      const cy     = def.y + def.height / 2
      const key    = def.name === 'azure_terminal' ? 'azure_terminal' : 'npc_default'
      const sprite = this.add.image(cx, cy, key).setDepth(5)
      this.add.text(cx, cy - def.height / 2 - 8, def.name, {
        fontFamily: CONFIG.FONT,
        fontSize:   '10px',
        color:      '#ffe066',
      }).setOrigin(0.5, 1).setDepth(6)
      this._npcSprites.push({ def, sprite })
    }
  }

  _setupPlayer() {
    const mapW = this._map.widthInPixels
    const mapH = this._map.heightInPixels

    // Default spawn: center of map
    let startX = 5 * TILE_SIZE + TILE_SIZE / 2
    let startY = 10 * TILE_SIZE + TILE_SIZE / 2

    // Entry direction: place player at the edge they entered from
    if (this._entryDir === 'west')  { startX = TILE_SIZE + TILE_SIZE / 2; startY = mapH / 2 }
    if (this._entryDir === 'east')  { startX = mapW - TILE_SIZE - TILE_SIZE / 2; startY = mapH / 2 }
    if (this._entryDir === 'north') { startX = mapW / 2; startY = TILE_SIZE + TILE_SIZE / 2 }
    if (this._entryDir === 'south') { startX = mapW / 2; startY = mapH - TILE_SIZE - TILE_SIZE / 2 }

    this._player = this.physics.add.sprite(startX, startY, 'player')
    this._player.setDepth(5)
    this._player.setCollideWorldBounds(true)
    this._player.body.setSize(28, 28).setOffset(2, 4)

    this.physics.add.collider(this._player, this._collisionLayer)
    this.physics.world.setBounds(0, 0, mapW, mapH)
  }

  _setupInput() {
    this._cursors  = this.input.keyboard.createCursorKeys()
    this._keyZ     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z)
    this._keyX     = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X)
    this._keyEnter = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER)
  }

  _setupCamera() {
    this.cameras.main.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels)
    this.cameras.main.startFollow(this._player, true, 0.15, 0.15)
  }

  update() {
    if (this._transitioning) return
    if (this._interacting || this.dialog.isActive) {
      this._player.setVelocity(0, 0)
      this._handleDialogInput()
      return
    }
    this._handleMovement()
    this._checkEdgeTransition()
    this._checkEncounterStep()
  }

  _handleMovement() {
    const running = this._keyZ.isDown
    const speed   = running ? RUN_SPEED : WALK_SPEED
    let vx = 0
    let vy = 0

    if (this._cursors.left.isDown)  { vx = -speed; this._facing = 'left'  }
    if (this._cursors.right.isDown) { vx =  speed; this._facing = 'right' }
    if (this._cursors.up.isDown)    { vy = -speed; this._facing = 'up'    }
    if (this._cursors.down.isDown)  { vy =  speed; this._facing = 'down'  }

    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707 }

    this._player.setVelocity(vx, vy)

    if (vx !== 0 || vy !== 0) {
      const tx = Math.floor(this._player.x / TILE_SIZE)
      const ty = Math.floor(this._player.y / TILE_SIZE)
      if (tx !== this._lastTileX || ty !== this._lastTileY) {
        this._lastTileX = tx
        this._lastTileY = ty
        this._stepCount++
      }
    }

    if (Phaser.Input.Keyboard.JustDown(this._keyZ) && vx === 0 && vy === 0) {
      this._tryInteract()
    }
  }

  _handleDialogInput() {
    const confirm = Phaser.Input.Keyboard.JustDown(this._keyZ)
      || Phaser.Input.Keyboard.JustDown(this._keyEnter)
    if (confirm)                                         this.dialog.advance()
    else if (Phaser.Input.Keyboard.JustDown(this._keyX)) this.dialog.skip()
  }

  _tryInteract() {
    const reach = TILE_SIZE * 1.5
    const OFFSETS = {
      up:    [  0,     -reach ],
      down:  [  0,      reach ],
      left:  [ -reach,  0     ],
      right: [  reach,  0     ],
    }
    const [dx, dy] = OFFSETS[this._facing]
    const checkX   = this._player.x + dx
    const checkY   = this._player.y + dy

    for (const { def } of this._npcSprites) {
      const cx   = def.x + def.width  / 2
      const cy   = def.y + def.height / 2
      if (Math.hypot(checkX - cx, checkY - cy) < TILE_SIZE * 1.8) {
        this._interactWithNpc(def.name)
        return
      }
    }
  }

  _interactWithNpc(npcName) {
    this._interacting = true

    if (npcName === 'azure_terminal') {
      // Unlock terminal flag on interaction
      const terminalFlag = `terminal_unlocked_${this._regionId}`
      if (!GameState.story.flags[terminalFlag]) {
        GameState.story.flags[terminalFlag] = true
        markDirty()
      }

      const terminals = getDiscoveredTerminals(GameState.story.flags)
      const hasOtherTerminals = terminals.filter(id => id !== this._regionId).length > 0

      if (hasOtherTerminals) {
        const pages = getStoryById('npc_azure_terminal')?.pages ?? ['> AZURE TERMINAL v2.0']
        this.dialog.show(pages, () => {
          this._openFastTravelMenu()
        })
      } else {
        const pages = getStoryById('npc_azure_terminal')?.pages ?? ['> AZURE TERMINAL v2.0']
        this.dialog.show(pages, () => {
          this._interacting = false
          this.scene.pause()
          this.scene.launch('SkillManagementScene', { returnScene: 'WorldScene' })
        })
      }
      return
    }

    if (npcName === 'hosting_terminal') {
      const hasCoop = hasItem('keyItems', 'cross_origin_opener_policy')
      const hasCoep = hasItem('keyItems', 'cross_origin_embedder_policy')
      if (!hasCoop || !hasCoep) {
        this.dialog.show(['The terminal is behind a locked door.\nYou need the right credentials.'], () => {
          this._interacting = false
        })
        return
      }
      if (!GameState.story.flags.found_hosting_terminal) {
        const pages = getStoryById('terminal_hosting')?.pages ?? ['> ...']
        this.dialog.show(pages, () => {
          GameState.story.flags.found_hosting_terminal = true
          markDirty()
          this._interacting = false
        })
      } else {
        const pages = getStoryById('terminal_hosting_pipeline')?.pages ?? ['> ...']
        this.dialog.show(pages, () => {
          GameState.story.flags.saw_deployment_pipeline = true
          markDirty()
          this._interacting = false
        })
      }
      return
    }

    if (npcName === 'west_eu_2_wilhelm') {
      const storyId = GameState.story.flags.found_hosting_terminal
        ? 'npc_west_eu_2_wilhelm_post_terminal'
        : 'npc_west_eu_2_wilhelm'
      const entry = getStoryById(storyId)
      const lines = entry?.pages ?? ['???']
      this.dialog.show(lines, () => { this._interacting = false })
      return
    }

    const entry = getStoryById(`npc_${npcName}`)
    const lines = this._resolveNpcPages(entry)
    this.dialog.show(lines, () => { this._interacting = false })
  }

  // Evaluates NPC dialogue variants top-to-bottom against the current player
  // reputation and shamePoints, returning the first matching variant's pages.
  // Falls back to entry.pages when no variant matches.
  _resolveNpcPages(entry) {
    const { reputation, shamePoints } = GameState.player
    if (Array.isArray(entry?.variants)) {
      for (const variant of entry.variants) {
        const c = variant.condition ?? {}
        if (c.reputationMin !== undefined && reputation < c.reputationMin) continue
        if (c.reputationMax !== undefined && reputation > c.reputationMax) continue
        if (c.shameMin      !== undefined && shamePoints < c.shameMin)     continue
        if (c.shameMax      !== undefined && shamePoints > c.shameMax)     continue
        if (Array.isArray(variant.pool)) {
          // NPC one-liner pools are intentionally non-deterministic — different
          // line each visit. No seeded RNG needed; this is presentation-layer only.
          if (variant.pool.length > 0) {
            const idx = Math.floor(Math.random() * variant.pool.length)
            return variant.pool[idx]
          }
          return variant.pages ?? entry?.pages ?? ['???']
        }
        return variant.pages
      }
    }
    return entry?.pages ?? ['???']
  }

  _checkEdgeTransition() {
    const px = this._player.x
    const py = this._player.y
    const mapW = this._map.widthInPixels
    const mapH = this._map.heightInPixels

    let direction = null
    if (px <= EDGE_MARGIN)          direction = 'west'
    else if (px >= mapW - EDGE_MARGIN) direction = 'east'
    else if (py <= EDGE_MARGIN)          direction = 'north'
    else if (py >= mapH - EDGE_MARGIN) direction = 'south'

    if (!direction) return

    const result = canTravel(this._regionId, direction, GameState)
    if (!result.target) return

    if (!result.allowed) {
      this._player.setVelocity(0, 0)
      this._interacting = true
      this.dialog.show([result.reason], () => { this._interacting = false })
      // Push player back from edge so they don't re-trigger
      const pushback = TILE_SIZE
      if (direction === 'west')  this._player.x += pushback
      if (direction === 'east')  this._player.x -= pushback
      if (direction === 'north') this._player.y += pushback
      if (direction === 'south') this._player.y -= pushback
      return
    }

    this._transitionToRegion(result.target, result.entry)
  }

  // 4-frame stepped fade (100% → 66% → 33% → 0%), not smooth
  _transitionToRegion(targetRegionId, entryDirection) {
    this._transitioning = true
    this._player.setVelocity(0, 0)

    const overlay = this.add.rectangle(
      this.cameras.main.scrollX + CONFIG.WIDTH / 2,
      this.cameras.main.scrollY + CONFIG.HEIGHT / 2,
      CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000, 0,
    ).setDepth(100).setScrollFactor(0)

    let step = 0
    const fade = this.time.addEvent({
      delay: FADE_STEP_MS,
      repeat: FADE_STEPS.length - 1,
      callback: () => {
        overlay.setAlpha(1 - FADE_STEPS[step])
        step++
        if (step >= FADE_STEPS.length) {
          GameState.player.location = targetRegionId
          markDirty()
          this.scene.restart({ entryDirection })
        }
      },
    })
  }

  _openFastTravelMenu() {
    const terminals = getDiscoveredTerminals(GameState.story.flags)
    const currentRegion = this._regionId

    // Filter out current region
    const destinations = terminals.filter(id => id !== currentRegion)
    if (destinations.length === 0) {
      this.dialog.show(['No other terminals discovered yet.'], () => {
        this._interacting = false
      })
      return
    }

    const menuItems = destinations.map(id => {
      const region = getRegionById(id)
      return region ? region.name : id
    })

    // Show terminal names as dialog pages, then travel to selected
    // For now, travel to the first discovered terminal (Menu component
    // integration will replace this once the Menu UI is wired up)
    const pages = [
      '> AZURE TERMINAL — FAST TRAVEL',
      ...menuItems.map((name, i) => `  ${i + 1}. ${name}`),
      `Traveling to ${menuItems[0]}...`,
    ]
    this.dialog.show(pages, () => {
      this._interacting = false
      if (canFastTravel(destinations[0], GameState.story.flags)) {
        this._transitionToRegion(destinations[0], null)
      }
    })
  }

  _checkEncounterStep() {
    // Wired to EncounterEngine once issue #9 is merged — stub prevents crash.
  }

  shutdown() {
    super.shutdown()
    if (this.dialog) this.dialog.destroy()
  }
}
