import Phaser from 'phaser'
import { BaseScene } from '#scenes/BaseScene.js'
import { DialogBox } from '#ui/DialogBox.js'
import { CONFIG } from '../config.js'
import { GameState, hasItem, markDirty } from '#state/GameState.js'
import { getById as getStoryById } from '#data/story.js'

const MAP_KEY     = 'localhost_town'
const TILESET_KEY = 'stub_tiles'
const TILE_SIZE   = CONFIG.TILE_SIZE   // 48px

const WALK_SPEED  = TILE_SIZE * 2     // 96 px/sec
const RUN_SPEED   = TILE_SIZE * 4     // 192 px/sec

export class WorldScene extends BaseScene {
  constructor() {
    super({ key: 'WorldScene' })
  }

  preload() {
    this.load.tilemapTiledJSON(MAP_KEY, 'assets/maps/localhost_town.tmj')

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
    this._facing      = 'down'
    this._stepCount   = 0
    this._lastTileX   = -1
    this._lastTileY   = -1

    this._setupMap()
    this._setupNpcSprites()
    this._setupPlayer()
    this._setupInput()
    this._setupCamera()

    GameState.player.location = 'localhost_town'
    this.playBgm('town')
  }

  _setupMap() {
    this._map = this.make.tilemap({ key: MAP_KEY })
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
    const startX = 5 * TILE_SIZE + TILE_SIZE / 2
    const startY = 10 * TILE_SIZE + TILE_SIZE / 2

    this._player = this.physics.add.sprite(startX, startY, 'player')
    this._player.setDepth(5)
    this._player.setCollideWorldBounds(true)
    this._player.body.setSize(28, 28).setOffset(2, 4)

    this.physics.add.collider(this._player, this._collisionLayer)
    this.physics.world.setBounds(0, 0, this._map.widthInPixels, this._map.heightInPixels)
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
    if (this._interacting || this.dialog.isActive) {
      this._player.setVelocity(0, 0)
      this._handleDialogInput()
      return
    }
    this._handleMovement()
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
      const pages = getStoryById('npc_azure_terminal')?.pages ?? ['> AZURE TERMINAL v2.0']
      this.dialog.show(pages, () => {
        this._interacting = false
        this.scene.pause()
        this.scene.launch('SkillManagementScene', { returnScene: 'WorldScene' })
      })
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

  _checkEncounterStep() {
    // Wired to EncounterEngine once issue #9 is merged — stub prevents crash.
  }

  shutdown() {
    super.shutdown()
    if (this.dialog) this.dialog.destroy()
  }
}
