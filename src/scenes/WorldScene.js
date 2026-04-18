import Phaser from 'phaser'
import { BaseScene } from '#scenes/BaseScene.js'
import { DialogBox } from '#ui/DialogBox.js'
import { CONFIG, MOVEMENT } from '../config.js'
import { GameState, hasItem, addItem, markDirty, grantXpOnce } from '#state/GameState.js'
import { getById as getStoryById } from '#data/story.js'
import { getById as getQuestById } from '#data/quests.js'
import { resolveChoice, isQuestCompleted, getCompletedDialog } from '#engine/QuestEngine.js'
import {
  DIR_OFFSETS, lerp, canRun, resolveDirection, isTileWalkable,
  updateBump, updateStep, commitStep, onStepComplete,
  shouldTriggerEncounter, checkTransition, applyTransition,
} from '#engine/MovementEngine.js'
import { getById as getTrainerById } from '#data/trainers.js'
import { resolveNpcDialog, resolveNpcPages } from '#engine/StoryEngine.js'
import { getBy as getInteractionsBy, getById as getInteractionById } from '#data/interactions.js'
import { getById as getRegionById } from '#data/regions.js'
import { Menu } from '#ui/Menu.js'
import { canTravel, getDiscoveredTerminals, canFastTravel, DENIAL_REASONS } from '#engine/RegionEngine.js'

const TILESET_KEY = 'stub_tiles'
const TILE_SIZE   = CONFIG.TILE_SIZE

// 4-frame stepped fade for region transitions (overlay alpha per step)
const FADE_STEPS     = [0, 0.33, 0.67, 1.0]
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
      g.generateTexture('azure_terminal', TILE_SIZE, TILE_SIZE)
      g.destroy()
    }

    if (!this.textures.exists('throttlemaster_hooded')) {
      const g = this.make.graphics({ add: false })
      g.fillStyle(0x1a1a2e)
      g.fillRect(8, 8, 16, 22)
      g.fillStyle(0x16213e)
      g.fillRect(8, 0, 16, 14)
      g.fillStyle(0x00ff88, 0.6)
      g.fillRect(10, 4, 12, 4)
      g.generateTexture('throttlemaster_hooded', 32, 32)
      g.destroy()
    }
  }

  create(data = {}) {
    this.dialog       = new DialogBox(this)
    this.choiceMenu   = new Menu(this)
    this._menu        = new Menu(this)
    this._interacting = false
    this._transitioning = false
    this._facing      = 'down'
    this._stepsSinceEncounter = 0

    // Tile-step state machine
    this._moveState    = 'idle'  // 'idle' | 'stepping' | 'bumping'
    this._moveProgress = 0
    this._fromX        = 0
    this._fromY        = 0
    this._toX          = 0
    this._toY          = 0
    this._bufferedDir  = null

    // Bump state
    this._bumpProgress = 0
    this._bumpFromX    = 0
    this._bumpFromY    = 0
    this._bumpToX      = 0
    this._bumpToY      = 0

    // Transition state
    this._transitioning = false
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
    this.setupPauseKey()
    this._buildInteractionLookup()

    GameState.player.location = 'localhost_town'
    this.playBgm(GameState.player.location)

    this._setupThrottlemasterGhost()
  }

  // -------------------------------------------------------------------------
  // THROTTLEMASTER ghostly sprite — Act 2 crisis flicker appearance
  // Shows a 2-tile hooded figure that vanishes on player approach.
  // -------------------------------------------------------------------------
  _setupThrottlemasterGhost() {
    const act = GameState.story?.act ?? 1
    const alreadySeen = GameState.story?.flags?.throttlemaster_act2_seen
    if (act !== 2 || alreadySeen) {
      this._ghostSprite = null
      return
    }

    const ghostX = 8 * TILE_SIZE + TILE_SIZE / 2
    const ghostY = 3 * TILE_SIZE + TILE_SIZE / 2
    this._ghostSprite = this.add.image(ghostX, ghostY, 'throttlemaster_hooded').setDepth(5)
    this._ghostSprite.setVisible(false)
    this._ghostFlickerTimer = 0
    this._ghostVisible = false
  }

  _updateThrottlemasterGhost() {
    if (!this._ghostSprite) return

    this._ghostFlickerTimer++

    // Appear briefly every 180 frames (~3 seconds at 60fps)
    if (!this._ghostVisible && this._ghostFlickerTimer >= 180) {
      this._ghostSprite.setVisible(true)
      this._ghostVisible = true
      this._ghostFlickerTimer = 0
    }

    // Disappear after 30 frames (~0.5 seconds)
    if (this._ghostVisible && this._ghostFlickerTimer >= 30) {
      this._ghostSprite.setVisible(false)
      this._ghostVisible = false
      this._ghostFlickerTimer = 0
    }

    // Vanish permanently if player gets close
    if (this._ghostVisible && this._player) {
      const dist = Math.hypot(
        this._player.x - this._ghostSprite.x,
        this._player.y - this._ghostSprite.y,
      )
      if (dist < TILE_SIZE * 3) {
        this._ghostSprite.setVisible(false)
        this._ghostSprite.destroy()
        this._ghostSprite = null
        if (!GameState.story.flags) GameState.story.flags = {}
        GameState.story.flags.throttlemaster_act2_seen = true
        markDirty()
      }
    }
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
    const tileX  = GameState.player.tileX
    const tileY  = GameState.player.tileY
    const mapW = this._map.widthInPixels
    const mapH = this._map.heightInPixels

    // Default spawn: use saved position or center of map
    let startX = tileX != null ? tileX * TILE_SIZE + TILE_SIZE / 2 : 5 * TILE_SIZE + TILE_SIZE / 2
    let startY = tileY != null ? tileY * TILE_SIZE + TILE_SIZE / 2 : 10 * TILE_SIZE + TILE_SIZE / 2

    // Entry direction: place player at the edge they entered from
    if (this._entryDir === 'west')       { startX = TILE_SIZE + TILE_SIZE / 2; startY = mapH / 2 }
    else if (this._entryDir === 'east')  { startX = mapW - TILE_SIZE - TILE_SIZE / 2; startY = mapH / 2 }
    else if (this._entryDir === 'north') { startX = mapW / 2; startY = TILE_SIZE + TILE_SIZE / 2 }
    else if (this._entryDir === 'south') { startX = mapW / 2; startY = mapH - TILE_SIZE - TILE_SIZE / 2 }

    this._player = this.add.sprite(startX, startY, 'player')
    this._player.setDepth(5)

    this._tileX = tileX ?? 5
    this._tileY = tileY ?? 10
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
    this.cameras.main.startFollow(this._player, true)
  }

  update(time, delta) {
    if (this._transitioning) return
    const dialogOrMenu = this._menu.isActive || this._interacting || this.dialog.isActive
    GameState._session.dialogActive = dialogOrMenu
    if (this._menu.isActive) {
      this._handleMenuInput()
      return
    }
    if (dialogOrMenu) {
      this._handleDialogInput()
      return
    }
    this._updateMovement(delta)
    this._updateThrottlemasterGhost()
  }

  get _isRunning() {
    return this._keyZ.isDown && canRun()
  }

  _getInputDirection() {
    return resolveDirection(
      this._cursors.up.isDown,
      this._cursors.down.isDown,
      this._cursors.left.isDown,
      this._cursors.right.isDown,
    )
  }

  _isTileWalkable(tileX, tileY) {
    return isTileWalkable(tileX, tileY, this._map.width, this._map.height,
      (tx, ty) => this._collisionLayer.getTileAt(tx, ty))
  }

  _startStep(targetTileX, targetTileY) {
    this._moveState    = 'stepping'
    this._moveProgress = 0
    this._fromX        = this._player.x
    this._fromY        = this._player.y
    this._toX          = targetTileX * TILE_SIZE + TILE_SIZE / 2
    this._toY          = targetTileY * TILE_SIZE + TILE_SIZE / 2
    this._tileX        = targetTileX
    this._tileY        = targetTileY
    commitStep(targetTileX, targetTileY)
  }

  _updateMovement(delta) {
    if (this._moveState === 'bumping') {
      const result = updateBump(this._bumpProgress, delta,
        this._bumpFromX, this._bumpFromY, this._bumpToX, this._bumpToY)
      this._bumpProgress = result.progress
      this._player.x = result.complete ? result.snapX : result.x
      this._player.y = result.complete ? result.snapY : result.y
      if (result.complete) this._moveState = 'idle'
      return
    }

    const tx = Math.floor(this._player.x / TILE_SIZE)
    const ty = Math.floor(this._player.y / TILE_SIZE)
    if (tx !== this._lastTileX || ty !== this._lastTileY) {
      this._lastTileX = tx
      this._lastTileY = ty
      this._stepCount++
      this._checkDoorInteraction()
    }

    if (this._moveState === 'stepping') {
      const result = updateStep(this._moveProgress, delta,
        this._fromX, this._fromY, this._toX, this._toY, this._isRunning)
      this._moveProgress = result.progress
      this._player.x = result.x
      this._player.y = result.y

      if (result.remaining <= MOVEMENT.INPUT_BUFFER_WINDOW_MS) {
        const dir = this._getInputDirection()
        if (dir) this._bufferedDir = dir
      }

      if (result.complete) {
        this._moveState = 'idle'
        this._onStepComplete()
        if (this._transitioning) return
        if (this._bufferedDir) {
          const dir = this._bufferedDir
          this._bufferedDir = null
          this._facing = dir
          const { dx, dy } = DIR_OFFSETS[dir]
          const targetX = this._tileX + dx
          const targetY = this._tileY + dy
          if (this._isTileWalkable(targetX, targetY)) {
            this._startStep(targetX, targetY)
          } else {
            this._playBumpAnimation(dir)
          }
        }
      }
      return
    }

    // 'idle' — check for new input
    const dir = this._getInputDirection()
    if (dir) {
      this._facing = dir
      const { dx, dy } = DIR_OFFSETS[dir]
      const targetX = this._tileX + dx
      const targetY = this._tileY + dy
      if (this._isTileWalkable(targetX, targetY)) {
        this._startStep(targetX, targetY)
      } else {
        this._playBumpAnimation(dir)
      }
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this._keyZ)) {
      this._tryInteract()
    }
  }

  _playBumpAnimation(dir) {
    const { dx, dy } = DIR_OFFSETS[dir]
    this._moveState    = 'bumping'
    this._bumpProgress = 0
    this._bumpFromX    = this._player.x
    this._bumpFromY    = this._player.y
    this._bumpToX      = this._player.x + dx * MOVEMENT.BUMP_DISTANCE_PX
    this._bumpToY      = this._player.y + dy * MOVEMENT.BUMP_DISTANCE_PX
  }

  _onStepComplete() {
    onStepComplete()
    this._stepsSinceEncounter++
    this._checkEncounterStep()
    this._checkTransitionTile()
  }

  _handleDialogInput() {
    if (this.dialog.isChoiceMode) {
      if (Phaser.Input.Keyboard.JustDown(this._cursors.up))   this.dialog.moveChoice(-1)
      if (Phaser.Input.Keyboard.JustDown(this._cursors.down)) this.dialog.moveChoice(1)
      const confirm = Phaser.Input.Keyboard.JustDown(this._keyZ)
        || Phaser.Input.Keyboard.JustDown(this._keyEnter)
      if (confirm) this.dialog.confirmChoice()
      return
    }
    const confirm = Phaser.Input.Keyboard.JustDown(this._keyZ)
      || Phaser.Input.Keyboard.JustDown(this._keyEnter)

    // Choice menu is open — D-pad navigates, A confirms, no B-cancel.
    if (this.choiceMenu.isActive) {
      if (Phaser.Input.Keyboard.JustDown(this._cursors.up))   this.choiceMenu.moveUp()
      if (Phaser.Input.Keyboard.JustDown(this._cursors.down)) this.choiceMenu.moveDown()
      if (confirm) this.choiceMenu.confirm()
      return
    }

    if (confirm)                                         this.dialog.advance()
    else if (Phaser.Input.Keyboard.JustDown(this._keyX)) this.dialog.skip()
  }

  _handleMenuInput() {
    this._player.setVelocity(0, 0)
    if (Phaser.Input.Keyboard.JustDown(this._cursors.up))        this._menu.moveUp()
    else if (Phaser.Input.Keyboard.JustDown(this._cursors.down)) this._menu.moveDown()
    else if (Phaser.Input.Keyboard.JustDown(this._keyZ)
          || Phaser.Input.Keyboard.JustDown(this._keyEnter))     this._menu.confirm()
    else if (Phaser.Input.Keyboard.JustDown(this._keyX))         this._menu.cancel()
  }

  _tryInteract() {
    const { dx, dy } = DIR_OFFSETS[this._facing]
    const targetTileX  = this._tileX + dx
    const targetTileY  = this._tileY + dy
    const targetWorldX = targetTileX * TILE_SIZE + TILE_SIZE / 2
    const targetWorldY = targetTileY * TILE_SIZE + TILE_SIZE / 2

    for (const { def } of this._npcSprites) {
      const cx = def.x + def.width  / 2
      const cy = def.y + def.height / 2
      if (Math.abs(targetWorldX - cx) < TILE_SIZE && Math.abs(targetWorldY - cy) < TILE_SIZE) {
        this._interactWithNpc(def.name)
        return
      }
    }

    const TILE_OFFSETS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }
    const playerTileX = Math.floor(this._player.x / TILE_SIZE)
    const playerTileY = Math.floor(this._player.y / TILE_SIZE)
    const [tdx, tdy]  = TILE_OFFSETS[this._facing]
    const tileX = playerTileX + tdx
    const tileY = playerTileY + tdy
    const interaction = this._interactionLookup?.get(`${tileX},${tileY}`)
    if (interaction && interaction.type !== 'door') {
      this._resolveInteraction(interaction)
    }
  }

  _buildInteractionLookup() {
    this._interactionLookup = new Map()
    const region = GameState.player.location
    const regionInteractions = getInteractionsBy('region', region)
    for (const interaction of regionInteractions) {
      this._interactionLookup.set(`${interaction.tileX},${interaction.tileY}`, interaction)
    }
  }

  _resolveInteraction(interaction) {
    const { type } = interaction

    if (type === 'sign' || type === 'flavor') {
      this._interacting = true
      this.dialog.show(interaction.dialog, () => { this._interacting = false })
      return
    }

    if (type === 'chest') {
      if (GameState.story.flags[interaction.flagKey]) return
      this._interacting = true
      GameState.story.flags[interaction.flagKey] = true
      addItem(interaction.item.tab, interaction.item.id, interaction.item.qty)
      this.dialog.show(interaction.dialog, () => { this._interacting = false })
      return
    }

    if (type === 'door') {
      const { requiresItem, flagKey, lockedDialog, unlockedDialog } = interaction
      if (GameState.story.flags[flagKey]) return
      this._interacting = true
      if (hasItem(requiresItem.tab, requiresItem.id)) {
        GameState.story.flags[flagKey] = true
        markDirty()
        this.dialog.show(unlockedDialog, () => { this._interacting = false })
      } else {
        this.dialog.show(lockedDialog, () => { this._interacting = false })
      }
    }
  }

  _checkDoorInteraction() {
    const tileX = Math.floor(this._player.x / TILE_SIZE)
    const tileY = Math.floor(this._player.y / TILE_SIZE)
    const interaction = this._interactionLookup?.get(`${tileX},${tileY}`)
    if (interaction && interaction.type === 'door') {
      this._resolveInteraction(interaction)
    }
  }

  _interactWithNpc(npcName) {
    this._interacting = true

    if (npcName === 'margaret') {
      this._interactMargaret()
      return
    }

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
      const entry   = getStoryById(storyId)
      const trainer = getTrainerById(npcName)
      const lines   = this._resolveNpcDialog(entry, trainer)
      this.dialog.show(lines, () => { this._interacting = false })
      return
    }

    const entry   = getStoryById(`npc_${npcName}`)
    const trainer = getTrainerById(npcName)
    const lines   = this._resolveNpcDialog(entry, trainer)
    this.dialog.show(lines, () => { this._interacting = false })
  }

  // Delegates to the pure StoryEngine resolver, then applies any state mutation
  // the engine flagged (technique acknowledgment flag). All decision logic lives
  // in StoryEngine — this method is rendering-layer glue only.
  _resolveNpcDialog(entry, trainer) {
    const { pages, setFlag } = resolveNpcDialog(entry, trainer, GameState)
    if (setFlag) {
      GameState.story.flags[setFlag] = true
      markDirty()
    }
    return pages
  }

  // Delegates variant/page selection to the pure StoryEngine helper.
  _resolveNpcPages(entry) {
    return resolveNpcPages(entry, GameState.player)
  }

  _checkEdgeTransition() {
    const px = this._player.x
    const py = this._player.y
    const mapW = this._map.widthInPixels
    const mapH = this._map.heightInPixels

    let direction = null
    if (px <= EDGE_MARGIN)               direction = 'west'
    else if (px >= mapW - EDGE_MARGIN)   direction = 'east'
    else if (py <= EDGE_MARGIN)          direction = 'north'
    else if (py >= mapH - EDGE_MARGIN)   direction = 'south'

    if (!direction) return

    const result = canTravel(this._regionId, direction, GameState)
    if (!result.target) return

    if (!result.allowed) {
      this._player.setVelocity(0, 0)
      this._interacting = true
      const denialText = this._resolveDenialText(result.reasonId, result.reasonParams)
      this.dialog.show([denialText], () => { this._interacting = false })
      // Push player back from edge so they don't re-trigger
      const pushback = TILE_SIZE
      if (direction === 'west')       this._player.x += pushback
      else if (direction === 'east')  this._player.x -= pushback
      else if (direction === 'north') this._player.y += pushback
      else if (direction === 'south') this._player.y -= pushback
      return
    }

    this._transitionToRegion(result.target, result.entry)
  }

  // Resolve a denial reasonId from the engine into display text via the story
  // registry. Falls back to a generic message if the story entry is missing.
  _resolveDenialText(reasonId, reasonParams) {
    const REASON_TO_STORY = {
      [DENIAL_REASONS.ACT_GATE]:       'region_under_construction',
      [DENIAL_REASONS.DUNGEON_POINTS]: 'dungeon_points_required',
      [DENIAL_REASONS.RESOURCE_LOCKS]: 'resource_locks_required',
    }
    const storyId = REASON_TO_STORY[reasonId]
    const entry   = storyId ? getStoryById(storyId) : null
    return entry?.pages?.[0] ?? 'You cannot go this way.'
  }

  // 4-frame stepped fade (0% → 34% → 67% → 100% black), not smooth
  _transitionToRegion(targetRegionId, entryDirection) {
    this._transitioning = true
    this._player.setVelocity(0, 0)

    const overlay = this.add.rectangle(
      CONFIG.WIDTH / 2,
      CONFIG.HEIGHT / 2,
      CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000, 0,
    ).setDepth(100).setScrollFactor(0)

    let step = 0
    this.time.addEvent({
      delay: FADE_STEP_MS,
      repeat: FADE_STEPS.length - 1,
      callback: () => {
        overlay.setAlpha(FADE_STEPS[step])
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

    // D-pad selectable fast travel menu via Menu component.
    this._menu.show(menuItems, {
      title: '> AZURE TERMINAL — FAST TRAVEL',
      onSelect: (index) => {
        this._interacting = false
        if (canFastTravel(destinations[index], GameState.story.flags)) {
          this._transitionToRegion(destinations[index], null)
        }
      },
      onCancel: () => {
        this._interacting = false
      },
    })
  }

  _checkEncounterStep() {
    if (shouldTriggerEncounter(this._stepsSinceEncounter, this._isRunning)) {
      this._stepsSinceEncounter = 0
      // Wired to EncounterEngine.selectFromPool() — triggers battle scene transition
    }
  }

  _checkTransitionTile() {
    const objectLayer = this._map.getObjectLayer('Transitions')
    if (!objectLayer) return

    const result = checkTransition(this._tileX, this._tileY, TILE_SIZE, objectLayer.objects)
    if (!result) return

    if (result.type === 'blocked') {
      this._interacting = true
      this.dialog.show([result.message], () => { this._interacting = false })
      return
    }

    this._startTransition(result.targetRegion, result.spawnX, result.spawnY)
  }

  _startTransition(targetRegion, spawnX, spawnY) {
    this._transitioning = true
    const overlay = this.add.rectangle(
      this.cameras.main.scrollX + CONFIG.WIDTH / 2,
      this.cameras.main.scrollY + CONFIG.HEIGHT / 2,
      CONFIG.WIDTH, CONFIG.HEIGHT, 0x000000
    ).setDepth(100).setScrollFactor(0).setAlpha(0)

    const steps = MOVEMENT.TRANSITION_FADE_STEPS
    let step = 0
    this.time.addEvent({
      delay:    MOVEMENT.TRANSITION_STEP_DELAY_MS,
      repeat:   steps.length - 1,
      callback: () => {
        overlay.setAlpha(steps[step])
        step++
        if (step >= steps.length) {
          applyTransition(targetRegion, spawnX, spawnY)
          this.scene.restart({ fromTransition: true })
        }
      },
    })
  }

  _interactMargaret() {
    if (isQuestCompleted('margaret_website', GameState.story.completedQuests)) {
      const lines = getCompletedDialog('margaret_website')
      this.dialog.show(lines, () => { this._interacting = false })
      return
    }

    const quest   = getQuestById('margaret_website')
    const stage   = quest.stages[0]
    const choices = stage.choices.map(c => c.text)

    this.dialog.show(stage.dialog, () => {
      this.dialog.showChoices('What do you suggest?', choices, (idx) => {
        const result = resolveChoice('margaret_website', idx)
        if (result.correct) {
          grantXpOnce('margaret_website_xp', result.xp)
          for (const reward of result.items) {
            addItem(reward.tab, reward.id, reward.qty)
          }
          GameState.story.completedQuests.push('margaret_website')
          markDirty()
        } else {
          GameState.player.hp = Math.max(1, GameState.player.hp - result.hpLoss)
          markDirty()
        }
        this.dialog.show(result.dialog, () => { this._interacting = false })
      })
    })
  }

  shutdown() {
    GameState._session.dialogActive = false
    super.shutdown()
    if (this.choiceMenu) this.choiceMenu.destroy()
    if (this._menu)   this._menu.destroy()
    if (this.dialog) this.dialog.destroy()
  }
}
