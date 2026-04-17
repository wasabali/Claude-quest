# Spec Issue

Draft a well-specced GitHub development issue from a feature idea or task description. Reads codebase context, identifies affected layers, and writes an implementation-ready issue. Invoke with a description of what you want built (e.g. "add a flee action to the battle menu").

## How this differs from other skills

| Skill | Purpose |
|---|---|
| `triage-issues` | Finds existing problems (bugs, contradictions, gaps) and files issues for them |
| `spec-issue` | Takes a new feature idea and creates an implementation-ready development issue |
| `implement-issue` | Takes an existing issue and implements it in code |
| `resolve-question` | Resolves open design questions on existing `[Design Question]` issues |

`spec-issue` is the **authoring** step — it creates the issues that the other skills consume.

---

## Step 1 — Understand the request

Read the invocation. Identify:

1. **What the user wants built** — the feature, enhancement, or content
2. **Why they want it** — motivation, player benefit, or gap it fills
3. **Any constraints they mentioned** — specific layer, timeline, related issues

If the request is too vague to spec (e.g. "make battles better"), ask for clarification before proceeding.

---

## Step 2 — Gather context from the codebase

Before writing the issue, read the relevant sources to understand the current state.

### Mandatory reads

| Source | When to read | What to check |
|---|---|---|
| `graphify-out/GRAPH_REPORT.md` | Always | God nodes, community structure — which systems will be affected |
| `src/config.js` | Always | Constants, domain matchups, multipliers — source of truth for mechanics |
| `docs/issues/content-bible.md` | If feature touches story, content, or world | Canonical decisions — don't contradict confirmed items |
| `docs/sessions/2026-04-15-game-design.md` | If feature touches game design | Original design decisions and constraints |

### Conditional reads (based on what the feature touches)

| Feature area | Read these files |
|---|---|
| Battle mechanics | `src/engine/BattleEngine.js`, `src/engine/SkillEngine.js`, `src/engine/StatusEngine.js` |
| Skills / techniques | `src/data/skills.js` |
| Trainers / NPCs | `src/data/trainers.js`, `src/data/story.js` |
| Items | `src/data/items.js` |
| Encounters | `src/data/encounters.js`, `src/engine/EncounterEngine.js` |
| World / regions | `docs/wiki/world-map.md` |
| UI / scenes | `src/scenes/`, `src/ui/` |
| State / save | `src/state/GameState.js`, `src/state/SaveManager.js` |

---

## Step 3 — Check for duplicates and related issues

Before writing a new issue:

1. Search GitHub issues in this repository for related keywords
2. Check both open and closed issues
3. If an existing issue covers the same feature, tell the user and stop
4. If related issues exist, note them — the new issue should reference them

---

## Step 4 — Identify affected layers

Determine which architectural layers the feature touches. This is critical for a good spec.

| Layer | Path | Rules to note in the issue |
|---|---|---|
| **Engine** | `src/engine/` | Zero Phaser imports. Pure functions. Return `BattleEvent[]`. Unit tests required. |
| **Data** | `src/data/` | Pure object definitions. No logic. Registry exports (`getById`, `getAll`, `getBy`). |
| **Scene** | `src/scenes/` | Phaser only. Delegates logic to engines. No game logic. Pixel art compliance. |
| **UI** | `src/ui/` | Reusable Phaser components. No game state mutation. |
| **State** | `src/state/` | `GameState.js` only. Single mutable object. |
| **Config** | `src/config.js` | Constants, matchups, multipliers. Single source of truth. |

---

## Step 5 — Write the issue

Create a GitHub issue using this template:

```markdown
## Summary

[One paragraph: what this feature does and why it matters for the player experience.]

## Motivation

[Why this is needed. What's missing, broken, or incomplete without it. Reference design docs or content bible if applicable.]

## Acceptance criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]
- [ ] [...]

## Affected layers

| Layer | Files | What changes |
|---|---|---|
| [Engine/Data/Scene/UI/State/Config] | `src/path/to/file.js` | [Brief description of the change] |

## Architecture notes

[Any constraints, patterns, or gotchas the implementer should know. Reference specific project rules:]

- [ ] No Phaser imports in `src/engine/` or `src/data/`
- [ ] All state in `GameState.js` — no local caches
- [ ] Data files use registry pattern (`getById`, `getAll`, `getBy`)
- [ ] Engine functions return `BattleEvent[]`
- [ ] Scene pixel art compliance (no tweens, no sub-pixel, integer scale only)

[Only include the checkboxes that apply to this feature's layers.]

## Data shape (if applicable)

[If the feature adds new data entries, show the exact schema following existing patterns in `src/data/`.]

```js
// Example entry shape
new_entry_id: {
  id: 'new_entry_id',
  // ... fields matching the existing registry pattern
},
```

## Related issues

- #[number] — [relationship: blocks, blocked by, related to, extends]

## Out of scope

[Explicitly list what this issue does NOT cover, to prevent scope creep.]
```

### Title format

Use a clear, descriptive title. Prefix with the primary area:

| Prefix | When |
|---|---|
| `[Engine]` | Changes to `src/engine/` |
| `[Data]` | New content in `src/data/` |
| `[Scene]` | New or modified scene |
| `[UI]` | UI component changes |
| `[Mechanic]` | New game mechanic (crosses layers) |
| `[Content]` | New game content (trainers, skills, encounters) |
| `[QoL]` | Quality of life improvement |

### Labels

Apply these labels:

| Label | When |
|---|---|
| `enhancement` | New feature or improvement |
| `content` | New game content (skills, trainers, items, encounters) |
| `data` | Touches `src/data/` |
| `engine` | Touches `src/engine/` |
| `scene` | Touches `src/scenes/` or `src/ui/` |
| `design` | Needs design decisions |
| `good first issue` | Small, self-contained, well-specced — suitable for newcomers |

---

## Step 6 — Verify before submitting

Before creating the issue:

- [ ] Not a duplicate of an existing issue
- [ ] Summary is clear — a reader understands what to build without opening other files
- [ ] Acceptance criteria are specific and testable (not "make it good")
- [ ] Affected layers are identified with file paths
- [ ] Architecture constraints listed match the layers involved
- [ ] Data shape included if new data entries are needed
- [ ] Related issues referenced
- [ ] Out of scope section prevents scope creep
- [ ] Labels are set
- [ ] Title has area prefix

---

## Step 7 — Offer next steps

After filing the issue, tell the user:

1. **To implement it now:** use `implement-issue <number>`
2. **To add game content for it:** use `add-skill`, `add-trainer`, or `add-incident` as appropriate
3. **If design questions remain:** use `resolve-question <number>` on the new issue

---

## Examples

### Example 1 — Simple data feature

**Invocation:** `spec-issue "add a terraform plan skill for IaC domain"`

**Resulting issue:**

> **Title:** `[Content] Add terraform plan skill`
> **Labels:** `enhancement`, `content`, `data`
>
> **Summary:** Add `terraform plan` as an IaC-domain skill. Terraform is one of the most common IaC tools and players will expect it in their skill deck.
>
> **Acceptance criteria:**
> - [ ] New skill entry `terraform_plan` in `src/data/skills.js`
> - [ ] Domain: `iac`, Tier: `optimal`
> - [ ] Effect: `damage`, value: 35
> - [ ] Passes all existing tests (`npm test`)
>
> **Affected layers:**
> | Layer | Files | What changes |
> |---|---|---|
> | Data | `src/data/skills.js` | Add `terraform_plan` entry |
>
> **Out of scope:** Terraform destroy (separate skill), terraform-specific trainer.

### Example 2 — Cross-layer mechanic

**Invocation:** `spec-issue "add a flee action to the battle menu"`

**Resulting issue:**

> **Title:** `[Mechanic] Add flee action to battle menu`
> **Labels:** `enhancement`, `engine`, `scene`
>
> **Summary:** Players currently have no way to escape a battle. Add a flee action that costs +1 Shame for incidents and is blocked for trainer battles.
>
> **Acceptance criteria:**
> - [ ] Flee option appears in the battle action menu
> - [ ] Fleeing an incident battle: ends battle, +1 Shame
> - [ ] Fleeing a trainer battle: blocked with dialog "You can't run from an engineer battle!"
> - [ ] SLA timer does not tick on the flee turn
> - [ ] Unit tests for flee logic in BattleEngine
>
> **Affected layers:**
> | Layer | Files | What changes |
> |---|---|---|
> | Engine | `src/engine/BattleEngine.js` | Add `FleePhase` to phase queue, flee check logic |
> | Scene | `src/scenes/BattleScene.js` | Add "Flee" option to action menu, render flee events |
> | State | `src/state/GameState.js` | Increment `shamePoints` on flee |
>
> **Architecture notes:**
> - [ ] No Phaser imports in `src/engine/`
> - [ ] Engine returns `BattleEvent[]` — scene renders them
> - [ ] Scene pixel art compliance
>
> **Related issues:**
> - #46 — reputation/shame system (flee interacts with shame)
>
> **Out of scope:** Flee cooldown, flee from cursed encounters (file as follow-up).
