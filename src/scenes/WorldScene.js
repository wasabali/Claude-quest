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

const MAP_KEY     = 'localhost_town'
const TILESET_KEY = 'stub_tiles'
const TILE_SIZE   = CONFIG.TILE_SIZE

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
      g.generateTexture('azure_terminal', TILE_SIZE, TILE_SIZE)
      g.destroy()
    }
  }

  create(data = {}) {
    this.dialog       = new DialogBox(this)
    this._interacting = false
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

    this._setupMap()
    this._setupNpcSprites()
    this._setupPlayer()
    this._setupInput()
    this._setupCamera()

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
    const tileX  = GameState.player.tileX
    const tileY  = GameState.player.tileY
    const startX = tileX * TILE_SIZE + TILE_SIZE / 2
    const startY = tileY * TILE_SIZE + TILE_SIZE / 2

    this._player = this.add.sprite(startX, startY, 'player')
    this._player.setDepth(5)

    this._tileX = tileX
    this._tileY = tileY
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
    if (this._interacting || this.dialog.isActive) {
      this._handleDialogInput()
      return
    }
    this._updateMovement(delta)
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
    if (confirm)                                         this.dialog.advance()
    else if (Phaser.Input.Keyboard.JustDown(this._keyX)) this.dialog.skip()
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
  }

  _interactWithNpc(npcName) {
    this._interacting = true

    if (npcName === 'margaret') {
      this._interactMargaret()
      return
    }

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
  // reputation, shamePoints, budget, and story flags, returning the first
  // matching variant's pages. Falls back to entry.pages when no variant matches.
  _resolveNpcPages(entry) {
    const { reputation, shamePoints, budget } = GameState.player
    if (Array.isArray(entry?.variants)) {
      for (const variant of entry.variants) {
        const c = variant.condition ?? {}
        if (c.reputationMin !== undefined && reputation < c.reputationMin) continue
        if (c.reputationMax !== undefined && reputation > c.reputationMax) continue
        if (c.shameMin      !== undefined && shamePoints < c.shameMin)     continue
        if (c.shameMax      !== undefined && shamePoints > c.shameMax)     continue
        if (c.budgetMax     !== undefined && budget > c.budgetMax)         continue
        if (c.storyFlag     !== undefined && !GameState.story.flags[c.storyFlag]) continue
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
    super.shutdown()
    if (this.dialog) this.dialog.destroy()
  }
}
