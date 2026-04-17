# Graph Report - .  (2026-04-17)

## Corpus Check
- 92 files · 352 symbols · 297 relationships
- Verdict: corpus is large enough that graph structure adds value.
- Tool: graphify-ts (AST extraction via tree-sitter — 100% deterministic)

## Summary
- 352 nodes · 297 edges
- Built: 2026-04-17T17:29:24Z

## God Nodes (most connected — your core abstractions)

These are the highest-risk change targets. Modifying them ripples widely.

| Rank | Symbol | Edges | File |
|------|--------|-------|------|
| 1 | `EmblemScene` | 32 | `src/scenes/EmblemScene.js` |
| 2 | `SkillManagementScene` | 23 | `src/scenes/SkillManagementScene.js` |
| 3 | `InventoryScene` | 18 | `src/scenes/InventoryScene.js` |
| 4 | `BattleScene` | 18 | `src/scenes/BattleScene.js` |
| 5 | `WorldScene` | 17 | `src/scenes/WorldScene.js` |
| 6 | `StackOverflowScene` | 16 | `src/scenes/StackOverflowScene.js` |
| 7 | `DialogBox` | 14 | `src/ui/DialogBox.js` |
| 8 | `ServiceCatalogScene` | 14 | `src/scenes/ServiceCatalogScene.js` |
| 9 | `NewGameScene` | 11 | `src/scenes/NewGameScene.js` |
| 10 | `GateEngine.js` | 10 | `src/engine/GateEngine.js` |

## Community Structure

Communities represent tightly-coupled clusters of symbols. Changes within a community stay local; changes that cross community boundaries risk wider ripple effects.

### Community 0 — Battle Engine Core
Cohesion: 0.09
Nodes (17): `createBattleState()`, `enemyPhase()`, `incidentAttackPhase()`, `resolveTurn()`, `skillPhase()`, `slaTickPhase()`, `statusTickPhase()`, `turnEndPhase()` (+9 more)
**Risk:** `resolveTurn()` crosses this community — it's called from BattleScene.

### Community 3 — Skill Management
Cohesion: 0.17
Nodes (8): `assignSkillToSlot()`, `buildSkillStateAfterDeckCommit()`, `getActiveSlotCount()`, `isCursedSkillId()`, `normalizeActiveDeck()`, `removeSkillFromSlot()`, `swapActiveSlots()`, `SkillManagementScene`

### Community 7 — Gate / NPC Path Logic
Cohesion: 0.24
Nodes (5): `evaluateMultiStepGate()`, `evaluateSolution()`, `getGateBetween()`, `isGateResolved()`, `isPathBlocked()`

### Community 8 — Inventory / State Core
Cohesion: 0.54
Nodes (7): `addItem()`, `getTabItems()`, `hasItem()`, `initNewGame()`, `markDirty()`, `normalizeInventoryEntry()`, `removeItem()`
**Risk:** `markDirty()` (7 edges) bridges this community — every act transition and save operation flows through it.

### Community 9 — Random / Encounter Engine
Cohesion: 0.38
Nodes (4): `selectFromPool()`, `randChoice()`, `randInt()`, `seedRandom()`

### Community 24 — XP / Level-Up
Cohesion: 1.0
Nodes (2): `checkLevelUp()`, `xpForLevel()`

### Community 25 — Save / Restore
Cohesion: 1.0
Nodes (2): `clone()`, `restoreState()`

### Remaining communities (11+)
Single-node clusters: `TitleScene`, `SaveScene`, `BootScene`, `HUD` — isolated, low risk.
Data module clusters (17–22): repeated `getAll()`, `getBy()` patterns — isolated registries.

## Key Cross-Community Bridges

These connections cross community boundaries and carry the highest change-propagation risk:

- `resolveTurn()` → bridges Community 0 (engine) ↔ BattleScene (god node)
- `markDirty()` → bridges Community 8 (state) ↔ every scene that writes state
- `DialogBox` → bridges Community 2 ↔ WorldScene, BattleScene, and all UI
- `GateEngine.js` → bridges Community 7 (gates) ↔ WorldScene navigation

## Architecture Notes

- **No Phaser imports** detected in `src/engine/` (confirmed compliant)
- **Data modules** (`src/data/*.js`) all follow the registry pattern (`getById`/`getAll`/`getBy`)
- **`GameState.js`** is the single mutable state container — correctly not appearing as a god node (it has direct dependents but doesn't call back into them)
- New files since last graph: `src/engine/GateEngine.js`, `src/scenes/StackOverflowScene.js`, `src/scenes/SkillManagementScene.js`, `src/scenes/ServiceCatalogScene.js`, `src/scenes/NewGameScene.js` and additional scene/engine files
