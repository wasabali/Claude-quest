# Resolution: Issue #29 — Quest System

## Decisions

### Quest Log

1. **No formal quest log screen.** Like GBC Pokémon, the game trusts the player to remember. NPCs re-explain their problem when re-visited. Key items in your inventory serve as physical reminders ("Oh right, I have Architect Alice's Blueprint v1…").

2. **NPCs have `reminderDialog`** — a shorter version of their quest intro that plays when you revisit them mid-quest. "Still working on that pipeline? The tests are still flaking out."

### Active Quest Indicator

3. **No HUD quest indicator.** The world itself communicates: ❓ on building doors = quest available inside. ✅ replaces it after completion. Both markers disappear after the follow-up dialog is seen. Clean, simple, GBC.

4. **Door markers stored in flags.** `quest_margaret_status: 'available' | 'active' | 'complete' | 'followed_up'`. WorldScene reads these to render the appropriate marker tile.

### Quest Failure

5. **HP floors at 1 during quests.** You cannot die from wrong quiz answers. You take the penalty (HP, reputation, budget), but you survive. The game wants you to learn, not to reload.

6. **Retry by re-entering.** Leave the building, walk back in. The NPC acknowledges your return ("Back for another try? Let's go."). Wrong-answer consequences already applied — no take-backs. This teaches: in the cloud, rollbacks don't undo the outage that already happened.

7. **Multi-stage quests use key items as stage markers.** Architect Alice gives you "Blueprint v1" → you complete a task → she upgrades it to "Blueprint v2" → etc. The item in your inventory IS your quest tracker. No separate quest state needed beyond flags.

### Flags

8. **Flags set by: story events, quest choices, combat outcomes, world interactions, shame thresholds.** Examples:
   - `met_professor_pedersen` — story event
   - `margaret_quest_optimal` — quest choice (answered correctly first try)
   - `first_sla_breach` — combat outcome
   - `opened_do_not_touch` — world interaction
   - `shame_reached_7` — shame threshold crossed

9. **Flags gate quest availability.** Each quest entry in `quests.js` has `requiresFlags` (must be true) and `excludeFlags` (must be absent). Example: Architect Alice's quest requires `visited_architecture_district` and excludes `alice_quest_complete`.

## Data Shape

```js
// Enhanced quest entry in src/data/quests.js
const QUESTS = {
  margaret_bakery: {
    id: 'margaret_bakery',
    npc: 'old_margaret',
    location: 'localhost_town',
    act: 1,
    type: 'quiz',           // 'quiz' | 'battle' | 'fetch' | 'multi_stage'
    requiresFlags: [],
    excludeFlags: ['margaret_quest_complete'],
    doorMarkerTile: 'quest_marker',  // tile ID for ❓ on door
    reminderDialog: ['Still having trouble with', 'the website? Come in!'],
    stages: [
      {
        prompt: ['My website is down!', 'Can you fix it?'],
        choices: [
          { text: 'Restart the server',    result: 'standard', xp: 50 },
          { text: 'Check the DNS records', result: 'optimal',  xp: 100 },
          { text: 'Delete and rebuild',    result: 'shortcut', xp: 25 },
        ],
        wrongPenalty: { hp: -10 },
      },
    ],
    completionFlag: 'margaret_quest_complete',
    followUpDialog: ["The website's been running", "for 3 days! Thank you!"],
    rewards: { xp: 0, items: [], reputation: 5 },  // XP from choices, not here
  },
}
```

```js
// New field in GameState.story
story: {
  act: 1,
  completedQuests: [],
  activeQuests: {},     // { questId: { stage: 0, attempts: 1 } }
  flags: {},
}
```

## Files Affected

- `src/data/quests.js` — add full quest schemas with stages, flags, reminder dialog
- `src/state/GameState.js` — add `activeQuests` to story
- `src/engine/QuestEngine.js` — new file: `isQuestAvailable()`, `resolveChoice()`, `advanceStage()`
- `src/scenes/WorldScene.js` — render door markers based on quest flags
- `src/config.js` — add `QUEST` constants (max wrong answers, etc.)

## Follow-ups

- Write full quest definitions for all 7 side quests (currently only Margaret is detailed)
- Define Architect Alice's multi-stage chain (4 stages across Act 4)
- Intern Ivan's roaming mechanic (appears in different locations per act)

## Content Bible Update

Add to §Quest section:
> ✅ **Quest system:** No quest log. NPCs re-explain via reminderDialog. Door markers (❓→✅→gone). HP floors at 1. Retry by re-entering. Key items as stage markers. Flags gate availability via requiresFlags/excludeFlags.
