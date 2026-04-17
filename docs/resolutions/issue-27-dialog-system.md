# Resolution: Issue #27 — Dialog System Mechanics

## Decisions

### Pacing Controls

1. **Press A mid-typewriter → instant reveal.** Standard RPG behavior. First A press fills the current page instantly. Second A press advances to the next page. No exceptions.

2. **No text speed setting.** One speed: 40 chars/sec. The A-to-fill mechanic handles impatient players. Fewer settings = fewer things to break. This is a GBC game, not VS Code.

3. **No hold-A auto-advance.** Each page requires a manual A press. This prevents accidental skipping of important story info (THROTTLEMASTER's reveal, Professor Pedersen's warnings). Players who mash A through dialog get what they deserve.

### Branching / Choices

4. **Choice prompts: popup menu above dialog box.** A small 2–4 option menu appears above the dialog box, like Pokémon's YES/NO. D-pad to navigate, A to confirm. The dialog box shows the question text beneath.

5. **No canceling out of choices.** Once a choice prompt appears, you must pick. No B-button escape. You walked into this conversation; now commit. (Just like a production deploy.)

6. **Wrong answer: consequences apply immediately, then retry allowed.** Wrong answer → HP penalty / reputation hit → NPC reacts ("That's... not right.") → player can re-enter the building to try again. The penalty already applied. This creates a cost for guessing without making quests permanently failsafe.

### Skipping

7. **No cutscene skip.** All dialog is mandatory. Dialog is kept short enough (~3-5 pages per NPC exchange) that skip isn't needed. Story moments like the THROTTLEMASTER reveal MUST be seen to land.

8. **Multi-page: A fills, A advances.** That's the only speedup. No skip-to-end. If you're reading Professor Pedersen's exposition, you're reading ALL of it.

### Technical

9. **Dialog freezes encounters.** While any dialog box or menu is open, the encounter system is paused. No ambush mid-conversation. `GameState._session.dialogActive` flag controls this.

## Data Shape

```js
// New constants in src/config.js
export const DIALOG = {
  CHARS_PER_SEC:      40,
  LINE_WIDTH_CHARS:   18,    // chars per line at 160px width with Press Start 2P
  MAX_LINES:          2,     // 2 lines visible per page
  BLINK_INTERVAL_MS:  500,   // ▼ cursor blink
  CHOICE_MAX_OPTIONS: 4,
}
```

No new data files needed. Dialog text lives in `src/data/story.js` as string arrays per NPC/event.

## Files Affected

- `src/config.js` — add `DIALOG` constants
- `src/ui/DialogBox.js` — implement A-to-fill, page advance, ▼ blink
- `src/ui/Menu.js` — choice popup positioning above dialog box
- `src/scenes/WorldScene.js` — set `dialogActive` flag during NPC interaction

## Follow-ups

- Define dialog text format in `story.js` (pages as string arrays vs single strings with `\n` breaks)
- Maximum dialog pages per NPC interaction (suggest cap at 8 pages)

## Content Bible Update

Add to §Dialog section:
> ✅ **Dialog pacing:** 40 chars/sec typewriter. A fills page, A advances. No speed setting, no auto-advance, no skip. Choices via popup menu (no cancel). Encounters frozen during dialog.
