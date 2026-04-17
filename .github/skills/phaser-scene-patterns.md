# Phaser Scene Patterns

Reference for correctly structuring Phaser 3 scenes in Cloud Quest. Use when implementing a new scene or modifying an existing one. Covers scene lifecycle, engine delegation, GameState access, DialogBox usage, and pixel art compliance.

## Scene Lifecycle

Every scene in Cloud Quest follows this structure:

```js
import { BaseScene } from '#scenes/BaseScene.js'
import { BattleEngine } from '#engine/BattleEngine.js'
import { GameState } from '#state/GameState.js'

export class BattleScene extends BaseScene {
  constructor() {
    super({ key: 'BattleScene' })
  }

  preload() {
    // Load assets here only. Nothing else.
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 16, frameHeight: 24 })
  }

  create(data) {
    // Receive data passed from previous scene
    // Set up engine instances
    // Create all display objects
    // Register input handlers
    this.engine = new BattleEngine(GameState.player, data.opponent)
    this.engine.on('event', this.onBattleEvent, this)
  }

  update(time, delta) {
    // Per-frame logic only: input polling, movement, animation ticks
    // Never create objects here
  }

  shutdown() {
    // Clean up event listeners
    this.engine.off('event', this.onBattleEvent, this)
  }
}
```

## Delegating to Engines (Critical)

Scenes receive player input and pass it to the engine. The engine returns events. The scene renders those events. No game logic in scenes.

```js
// Correct
onSkillSelected(skillId) {
  const events = this.engine.useSkill(skillId)
  this.renderEvents(events)
}

renderEvents(events) {
  events.forEach(event => {
    switch (event.type) {
      case 'damage':   this.showDamageNumber(event.target, event.value); break
      case 'dialog':   this.dialogBox.show(event.text); break
      case 'win':      this.fadeToScene('WorldScene'); break
    }
  })
}

// Wrong — game logic in scene
onSkillSelected(skillId) {
  const skill = getById(skillId)
  if (skill.domain === this.opponent.domain) {  // ← logic belongs in SkillEngine
    this.opponent.hp -= skill.effect.value * 2
  }
}
```

## Using DialogBox

Never create raw Phaser text objects for in-game dialogue. Always use `DialogBox`:

```js
import { DialogBox } from '#ui/DialogBox.js'

create() {
  this.dialog = new DialogBox(this)  // pass scene reference

  // Show a line of text
  this.dialog.show('Professor Pedersen: "Choose wisely."')

  // Show text with a callback when dismissed
  this.dialog.show('Are you sure?', () => this.confirmAction())

  // Show a choice menu
  this.dialog.showChoices([
    { label: 'az webapp deploy', action: () => this.useSkill('az_webapp_deploy') },
    { label: 'rm -rf /', action: () => this.useSkill('rm_rf') },
  ])
}
```

## Reading GameState

Read directly. Do not cache across frames.

```js
// Correct — read fresh each time
update() {
  this.hud.setHp(GameState.player.hp, GameState.player.maxHp)
}

// Wrong — stale reference if GameState changes mid-battle
create() {
  this.playerHp = GameState.player.hp  // cached, won't update
}
```

## Scene Transitions

Use `BaseScene.fadeToScene()` for all transitions. Never call `this.scene.start()` directly in gameplay code — it skips the fade.

```js
// Correct
this.fadeToScene('WorldScene', { location: 'pipeline_pass' })

// Only acceptable for immediate hard cuts (title screen, loading)
this.scene.start('TitleScene')
```

## Pixel Art Compliance Checklist

Before committing any scene:

- [ ] No `tween` that interpolates `x`, `y`, `scaleX`, or `scaleY` — use frame swaps
- [ ] No non-integer scale values (`setScale(1.5)` is forbidden)
- [ ] No `setAlpha()` transitions — hide/show is instant
- [ ] All text uses `{ fontFamily: CONFIG.FONT }` — no other font
- [ ] All sprites have texture filter set to nearest (set globally in Phaser config, verify it wasn't overridden)

## Passing Data Between Scenes

```js
// Launching a battle from WorldScene
this.scene.launch('BattleScene', {
  opponent: Registry.getTrainer('kube_master'),
  mode: 'engineer',
  returnScene: 'WorldScene',
})
this.scene.sleep('WorldScene')  // pause world, don't destroy it

// In BattleScene — receive the data
create(data) {
  this.opponent = data.opponent
  this.returnScene = data.returnScene
}

// After battle ends
onBattleEnd(result) {
  this.scene.stop('BattleScene')
  this.scene.wake(this.returnScene)
}
```
