# Resolution: Issue #31 — World Interaction System

## Decisions

### Interactable Objects

1. **Yes, signs and noticeboards.** Tech-themed signs throughout: "AZURE TERMINAL — Save your progress", "CAUTION: npm install in progress", "WELCOME TO PIPELINE PASS — Where code goes to be judged". Signs are tile objects with a `dialog` property. Face + A to read.

2. **Treasure chests: face + press A.** Chest sprite swaps from `chest_closed` to `chest_open`. Item added to inventory. Dialog box shows "Found [item name]!" with item description. Cannot re-open.

3. **Locked doors: auto-use key item.** Walk into locked door → game checks inventory for required key item → if present, auto-uses it with dialog ("Used SSH Key (Staging)! The door opened.") → if absent, dialog: "This door requires [item name]." No manual item selection needed.

4. **Localhost Town interactables:**
   - Signs: "Welcome to Localhost Town", "Professor Pedersen's Lab →", "Old Margaret's Bakery — Fresh 404s Daily"
   - Azure Terminal (apartment): save/load
   - PC in apartment: skill deck management
   - Professor's lab equipment: flavor text ("A server rack. It hums contentedly.")
   - Margaret's counter: quest interaction
   - Bookshelf in lab: "A dog-eared copy of 'The Phoenix Project'. Page 47 is highlighted."

### Interaction Feedback

5. **No visual cue for interactables.** GBC style — the player learns by trying. Signs look distinct enough (different tile sprite), chests are obviously chests, NPCs face the player. No hover icons, no "Press A" tooltips.

6. **Press A on non-interactable: nothing.** No sound, no "..." bubble. Silent. The player's brain does the error handling.

### Object State

7. **Object state stored in `GameState.story.flags`.** Format: `interacted_{region}_{objectId}`. Examples:
   - `interacted_pipeline_pass_chest_01: true`
   - `interacted_localhost_town_sign_lab: true` (for signs that only show once)
   - Chests read this flag to render open/closed sprite

8. **Items cannot be dropped.** Your inventory is append-only. Junk items stay forever. That `Mystery node_modules` folder? You're carrying 47,000 files now. Deal with it. This is both a joke and a game mechanic — junk items take up visual space in the Inventory screen, making the player feel the weight of technical debt.

## Data Shape

```js
// New data file: src/data/interactions.js
const INTERACTIONS = {
  localhost_sign_welcome: {
    id: 'localhost_sign_welcome',
    type: 'sign',             // 'sign' | 'chest' | 'terminal' | 'door' | 'npc' | 'flavor'
    region: 'localhost_town',
    tileX: 5,
    tileY: 3,
    dialog: ['Welcome to Localhost Town!', '"Home sweet 127.0.0.1"'],
    repeatable: true,         // signs can be re-read
  },
  pipeline_chest_01: {
    id: 'pipeline_chest_01',
    type: 'chest',
    region: 'pipeline_pass',
    tileX: 12,
    tileY: 8,
    item: { tab: 'tools', id: 'stack_overflow_printout', qty: 1 },
    dialog: ['Found Stack Overflow Printout!', '"The answer was from 2014."'],
    repeatable: false,
    flagKey: 'interacted_pipeline_chest_01',
  },
  security_vault_door: {
    id: 'security_vault_door',
    type: 'door',
    region: 'architecture_district',
    tileX: 15,
    tileY: 0,
    requiresItem: { tab: 'keyItems', id: 'ssh_key_staging' },
    lockedDialog: ['This door requires SSH Key', '(Staging) to open.'],
    unlockedDialog: ['Used SSH Key (Staging)!', 'The door opened.'],
    flagKey: 'unlocked_security_vault_door',
  },
}

export const getById = (id) => INTERACTIONS[id]
export const getAll = () => Object.values(INTERACTIONS)
export const getBy = (field, value) => getAll().filter(x => x[field] === value)
```

Tile objects in Tiled maps use custom property `interactionId` to link to this registry.

## Files Affected

- `src/data/interactions.js` — new file: interaction registry
- `src/scenes/WorldScene.js` — interaction handler (face direction + A → lookup tile → resolve)
- `src/state/GameState.js` — flags for object state (already supported)
- `src/ui/DialogBox.js` — no changes needed, already supports showing arbitrary text
- Tiled maps (`.tmj`) — add `interactionId` custom property to interactive tiles

## Follow-ups

- Define all interaction objects per region (signs, chests, flavor objects)
- Terminal interaction: does saving at Azure Terminal open SaveScene directly?
- PC interaction: does it open SkillManagementScene directly?

## Content Bible Update

Add to §World section:
> ✅ **Interaction system:** Face + A for everything. Signs (repeatable), chests (one-time, sprite swap), locked doors (auto-use key item). No visual cues — GBC style. Object state in GameState.story.flags. Items cannot be dropped. Interaction data in `src/data/interactions.js` registry.
