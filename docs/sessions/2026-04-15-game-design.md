# Session Memory — Game Design Decisions
**Date:** 2026-04-15
**Branch:** claude/resolve-game-design-lFNI3
**Issues created:** #41–#48, #50
**Issues superseded and closed:** #51–#56 (Godot variants — engine decision reversed, see Tech Stack section)

---

## Context

This session resolved the core game design contradictions from issue #10 and designed the primary gameplay systems. The game design document (previously at `docs/GAME_DESIGN.md`, recoverable from commit `58e1d20`) was the source of truth.

---

## What the Game Is

**Cloud Quest** — a browser-based GameBoy Color-style RPG where you play as a junior cloud engineer progressing to Principal Engineer. Turn-based combat using real cloud CLI commands. Funny, educational, satirical. Built with Phaser 3, Vite, hosted on Azure Static Web Apps. No backend, file-based saves (`.cloudquest`).

---

## Key Design Decisions Made This Session

### 1. Cloudémon — Resolved as Non-Core

The Cloudémon companion mechanic (Dockertle, Functionchu, VMsaur) was identified as contradictory in issue #10. The session moved away from creature companions as the core mechanic. **Commands are the core mechanic.** Cloudémon may appear as cosmetic mascots only (Option C from the discussion), but this is not yet finalised. Issue #10 remains open.

---

### 2. Combat Core — Commands as Skills

The player uses real cloud CLI commands as battle skills. Commands have:
- A **domain type** (one of 7 domains)
- A **solution tier** (Optimal / Standard / Shortcut / Cursed / Nuclear)
- Real-world logic behind their effects

---

### 3. Domain Matchup System (Issue #41)

7 domains in a circular matchup chain. Each beats the next for a real-world reason:

```
Linux → Security → Serverless → Cloud → IaC → Containers → Kubernetes → Linux
```

An 8th domain — **Observability** — is a special support domain that reveals enemy types and debuffs rather than dealing damage.

Enemy domain types are hidden until diagnosed. This creates a core turn decision: spend a turn diagnosing (safe, costs a turn) or guess and attack (risky, wastes a turn on wrong domain).

---

### 4. Solution Quality Tiers (Issue #42)

Every problem accepts multiple solutions graded by quality:

| Tier | XP | Rep | Shame |
|---|---|---|---|
| Optimal | ×2 | +++ | 0 |
| Standard | ×1 | + | 0 |
| Shortcut | ×0.5 | − | 0 |
| Cursed | ×0.25 | −− | +1 |
| Nuclear | ×0 | −−− | +2 |

The game never blocks progress for a bad solution. It remembers. Better solutions gate skill teaching from engineers and build downstream quest outcomes.

**Technical Debt:** Cursed techniques stack a −2 max HP debuff (up to −20). Cleared via cleanup quests.

---

### 5. Two Encounter Types (Issues #43, #44)

**Incidents (wild encounters):** Technical problems placed visibly in the world. Symptom shown first, root cause hidden. SLA timer creates urgency. Multi-layer incidents reward full diagnosis.

**Engineer battles (trainer battles):** Two skill decks, domain counters apply. Engineers telegraph their next move one turn in advance. Win quality determines whether they teach you their signature command.

---

### 6. NPC Command Gating (Issue #45)

NPCs block paths until a specific command (or better) is used to help them. Multiple solutions accepted with different downstream consequences. Gates that the player can't yet solve point toward where the missing command can be learned — they function as progression signposts, not arbitrary locks.

---

### 7. Reputation & Shame (Issue #46)

Two independent stats:

- **Reputation** (0–100): Rebuildable. Controls NPC dialogue, trainer difficulty, and some gate access.
- **Shame Points** (0+): Permanent. Never decremented. Controls access to the evil path, cursed trainer network, and alternate ending.

High Reputation + High Shame is the most interesting character state — excellent engineer who crossed every line.

---

### 8. Evil Engineer Path (Issue #47)

Cursed techniques bypass domain matchups entirely. They are powerful and viable. They accumulate Shame and Technical Debt. At Shame 15, an alternate ending becomes accessible.

**THROTTLEMASTER** is revealed to be someone who went down this path. His full backstory is hidden content only accessible to high-Shame players. At Shame 7 he makes contact. At Shame 15 he offers recruitment.

Final boss (The CTO) adapts dialogue and phases based on Shame level.

---

### 9. Outcast Network & Hidden Areas (Issue #48)

Six hidden areas, each requiring a deliberate "wrong" action to find:

| Area | Discovery | Outcast | Teaches |
|---|---|---|---|
| The Server Graveyard | SSH into a "dead" terminal | Deprecated Dagfinn | `terraform destroy` |
| The node_modules Maze | Use the junk item instead of discarding it | Privileged Petra | `docker run --privileged` |
| The /dev/null Void | Pipe to `/dev/null` three times in one battle | The Null Pointer | `history -c` |
| The 3am Tavern | Real clock between 02:57–03:05 | Rotating (Shame-gated) | Multiple |
| Deprecated Azure Region | Select greyed-out `West-EU-2` from terminal | West-EU-2 Wilhelm | `az feature register --namespace Microsoft.Legacy` |
| DO_NOT_TOUCH.exe | Open it despite every NPC saying not to | (no outcast — notes only) | `EXEC xp_cmdshell` |

Finding all six unlocks **THROTTLEMASTER's old workstation** — a seventh location with his full backstory. Showing his notes to Professor Pedersen before Act 4 changes the ending.

---

## Open Design Questions (not yet resolved)

These appear as open questions in the relevant issues:

- Is there a neutral domain for commands that don't fit the cycle (`git revert`, `blame DNS`)?
- Can the Cloudémon starter choice be preserved as cosmetic-only, or should it be removed?
- Can a Shortcut-tier command ever be graded as Optimal in specific contexts?
- Is there a redemption arc for high-Shame players?
- Should there be a Shame-gated black market for cursed technique upgrades?
- Does THROTTLEMASTER's recruitment message arrive as dialogue, an item, or a fake system notification?

---

## Finalised Tech Stack

| Tool | Purpose |
|---|---|
| **Phaser 3** | Game engine — HTML5 Canvas/WebGL, browser-native, no export step |
| **Vite** | Dev server + bundler |
| **Vanilla JavaScript (ES modules)** | No framework |
| **Azure Static Web Apps** | Hosting — free tier, COOP/COEP headers via `staticwebapp.config.json` |
| **GitHub Actions** | CI/CD — build and deploy to Azure |
| **Tiled Map Editor** | Tile map authoring |

**Engine decision note:** Godot 4 was evaluated and rejected. Phaser 3 was retained as the original choice. Reasons: browser-native (no export step), lighter weight, existing architecture in the GDD already designed for it, JavaScript familiarity. Godot issues #51–#56 were created briefly then closed as not_planned.

**Hosting decision:** GitHub Pages → Azure Static Web Apps. Azure supports COOP/COEP headers natively (needed for some browser APIs and good security practice). `staticwebapp.config.json` added to repo root.

---

## Issues Created This Session

| Issue | Title |
|---|---|
| #41 | [Design] Core Combat — Domain Matchup System |
| #42 | [Design] Core Combat — Solution Quality & Reward Tiers |
| #43 | [Design] Encounter — Incident Battles (Wild Encounters) |
| #44 | [Design] Encounter — Engineer Battles (Trainer Battles) |
| #45 | [Design] World — NPC Command Gating |
| #46 | [Design] Character — Reputation & Shame System |
| #47 | [Design] Character — Evil Engineer Path & Cursed Techniques |
| #48 | [Design] World — Outcast Network & Hidden Areas |

Previously open design question issues (#10–#38) are partially answered by the above. Issue #10 (Cloudémon) remains open pending a final call on the mascot-only approach.

---

## Existing Issues to Revisit

These pre-existing issues should be updated to align with decisions made in this session:

- **#6** (Battle Engine) — now needs to account for domain matchup system, solution tier evaluation, and two-deck engineer battle mode
- **#9** (Random Encounters) — now superseded in detail by #43; should reference #43 for the incident battle spec
- **#5** (Data Layer) — `skills.js` needs `domain` and `tier` fields per the new combat design

---

## Session Continuation — Development Tooling & Foundation (same date, later session)

### Project Foundation Scaffold (PR #62, merged to main)

Full scaffold created and merged. Files added:

| File | Purpose |
|---|---|
| `package.json` | `phaser ^3.88`, `vite ^5.4`, `vitest ^2.1`, npm scripts |
| `vite.config.js` | Path aliases (`#engine`, `#data`, `#scenes`, `#state`, `#ui`, `#utils`), COOP/COEP headers, Vitest config |
| `index.html` | GameBoy Color shell, Press Start 2P font, `image-rendering: pixelated` |
| `src/main.js` | Phaser game init — `antialias: false`, `pixelArt: true`, FIT scale |
| `src/config.js` | `CONFIG` (160×144, 4× scale), `DOMAIN_MATCHUPS`, `STRONG/WEAK_MULTIPLIER`, `STATUSES`, `XP_TABLE` |
| `src/overrides.js` | Dev-only test overrides (all commented out); applied by GameState at startup in dev mode |
| `src/state/GameState.js` | Single mutable state: player, skills, inventory, emblems, story, stats, `_session` |
| `src/state/SaveManager.js` | `.cloudquest` save format — UTF-8-safe base64 + SHA-256 checksum |
| `src/utils/random.js` | Mulberry32 seeded PRNG: `seedRandom`, `randInt`, `randChoice` |
| `src/utils/crypto.js` | `sha256()` via Web Crypto API |
| `src/utils/fileIO.js` | `download()` and `openFilePicker()` |
| `src/scenes/BaseScene.js` | Abstract base: `showDialog()`, `fadeToScene()`, `playBgm()` with loop-point support |
| `src/data/*.js` | Empty registry stubs (skills, items, trainers, quests, emblems, story, encounters) |
| `assets/audio/bgm-loop-points.json` | BGM loop registry `{trackId: {start, end}}` — fill when audio finalised |
| `tests/config.test.js` | 15 tests covering CONFIG dimensions, domain matchup cycle, multipliers, XP table |

**Key implementation decisions:**
- `playBgm()` uses `cache.audio.exists()` (not `sound.get()`) to check for audio; uses Phaser `addMarker()` for seamless loops
- `SaveManager` uses TextEncoder/TextDecoder for UTF-8-safe base64 (not raw `btoa`/`atob`)
- Status `on_call: duration: 5` (battles), `in_review: duration: 'random'` (1–3 turns) — intentional design, not a bug

---

### Claude Code Agents Created

| Agent | Purpose |
|---|---|
| `battle-engine-tdd` | TDD specialist for `src/engine/` — writes tests first, zero Phaser dependency |
| `game-data-author` | Creates/validates `src/data/` definitions — knows all valid field values |
| `phaser-reviewer` | Reviews Phaser scenes/UI for engine separation, GameState usage, pixel compliance |
| `content-contributor` | Game world expert — world map, domain cycle, trainer archetypes, data rules |

---

### Claude Code Skills Created

| Skill | Slash command | Purpose |
|---|---|---|
| `cloud-quest-battle` | reference only | Full battle system reference for BattleEngine/SkillEngine work |
| `game-data-registry` | reference only | Registry pattern, all valid field values, cursed technique structure |
| `phaser-scene-patterns` | reference only | Scene lifecycle, engine delegation, GameState, DialogBox, pixel compliance |
| `implement-issue` | `/implement-issue <n>` | Implement any GitHub issue following project architecture |
| `add-skill` | `/add-skill "<cmd>"` | Scaffold a skill definition in `src/data/skills.js` |
| `add-trainer` | `/add-trainer "<concept>"` | Scaffold a trainer in `src/data/trainers.js` |
| `add-yourself` | `/add-yourself "<desc>"` | Add yourself as a trainer NPC with your real CLI commands as skills |
| `add-incident` | `/add-incident "<desc>"` | Convert a real work incident into a wild encounter |

---

### Contributor Onboarding (PR #63, merged to main)

`docs/CONTRIBUTING.md` — human-readable onboarding guide covering:
- What you can contribute (trainer NPC, skills, incidents)
- How to add yourself: slash command path and manual path
- How to add an incident: slash command path and manual path
- Domain matchup cheat sheet
- Pre-PR checklist

---

### Key Architecture Clarifications (from Copilot review fixes)

Issues caught and corrected during PR #63 review:

1. **BattleEvent union** — `reputation_damage` added as a valid type; `dialog` events documented as a separate shape (no `target`/`value` — only `text`)
2. **Naming convention** — PascalCase for class-exporting files (`BattleEngine.js`, `BaseScene.js`); camelCase for data/utils (`skills.js`, `random.js`)
3. **`observability` domain** — valid for skills and trainers (support/reveal, 0 damage); **not valid** for incidents. Docs now consistent across all files.
4. **Registry pattern** — 3 exports only (`getById`, `getAll`, `getBy`), no per-entry exports
5. **Hidden areas** — 3 documented hidden regions (`three_am_tavern`, `legacy_codebase`, `outcast_network`); original design doc mentions 6 but only 3 are specified. Docs updated to reflect documented count.
6. **Overrides** — applied by `GameState.js` at startup, not by the engine. Engine never reads `overrides.js`.
7. **Scene imports** — always use path aliases (`#engine/`, `#state/`, `#ui/`), never relative paths
8. **Scene transitions** — always use `fadeToScene()`, never `this.scene.start()` in gameplay code

---

### PRs This Session

| PR | Title | Status |
|---|---|---|
| #62 | Project foundation scaffold | Merged to main |
| #63 | Contributor tooling, onboarding, and foundation docs | Merged to main (Copilot resolved merge conflicts in `845ff57`) |

---

### Issues Closed This Session

- **#10** (Cloudémon companions) — Closed as `not_planned`. Pivoted to commands-as-skills; creature companions removed from design.
- **#39** (Pause Menu) — Updated: "Cloudémon" slot replaced with "Engineer Profile" (Reputation, Shame, Technical Debt, Level/XP).
- **#61** (Foundation scaffold) — Created and implemented in PR #62.
