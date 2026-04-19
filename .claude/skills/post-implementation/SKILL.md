---
name: post-implementation
description: Mandatory post-implementation checks after every issue is completed. Runs stress tests and triages failures into GitHub issues, regenerates the wiki, and updates the graphify knowledge graph. Always invoke after implement-issue completes.
---

# Post-Implementation

Mandatory post-implementation checks that run after every issue is completed by Claude or Copilot. Replaces the old `game-health.yml` and `wiki-sync.yml` pipelines with agent-driven, always-on validation.

## When to run

**Always** — after completing any issue implementation. This is not optional. The `implement-issue` skill invokes this as its final step.

## What it does

Three tasks, run in order:

### 1. Stress tests + game health triage

Run the stress/balance test suite and triage any failures into actionable GitHub issues.

1. Run `npm run test:stress` (the process may exit non-zero when tests fail — this is expected and does not mean the skill failed; capture stdout/stderr for triage).
2. Review the test output. For each failing test:
   - Check if an open GitHub issue already exists with labels `balance` + `automated` whose title matches the test name.
   - If **no issue exists**: create one with title `[Balance] <category> — <test name>`, labels `balance`, `automated`, and the category label (e.g. `data-integrity`, `skill-balance`, `battle-balance`, `economy`, `encounters`, `exploit`, `quest-integrity`, `story`, `emblem-balance`, `playthrough`). Include the failure message in the body.
   - If **an issue already exists**: update the issue body with the latest failure message and timestamp.
3. For any open `balance` + `automated` issue whose test **now passes**, close it with a comment: "🎉 This finding has been fixed (test now passes)."
4. Post a summary comment on the current PR or issue with:
   - Total tests: passed / failed / total
   - New failures (tests that were passing before)
   - Fixed failures (tests that were failing before and now pass)
   - Top 3 highest-impact failures (by category severity)

### 2. Wiki regeneration

Regenerate the game wiki from current data files.

1. Read all data files directly from disk (use `import()` or file reads — do not rely on cached module state): `src/data/skills.js`, `src/data/trainers.js`, `src/data/items.js`, `src/data/encounters.js`, `src/data/emblems.js`, `src/data/quests.js`, `src/data/story.js`, `src/config.js`.
2. Regenerate every wiki page in `docs/wiki/` following the rules in the `update-wiki` skill.
3. If new data domains or modules were introduced, scaffold new wiki pages for them.
4. Update `docs/wiki/README.md` to link all pages.
5. Commit wiki changes if any files changed.

### 3. Graphify update

Update the knowledge graph to reflect code changes.

1. Run `graphify update .` (AST-only, no API cost).
2. Commit `graphify-out/` changes if any files changed.

## Category labels

These labels are used for balance issues. Before creating issues, ensure the labels exist — create any missing ones using `gh label create <name>` or the GitHub API.

| Category | Label |
|---|---|
| Data Integrity | `data-integrity` |
| Skill Balance | `skill-balance` |
| Battle Simulations | `battle-balance` |
| Progression & Economy | `economy` |
| Encounter Distribution | `encounters` |
| Exploit Detection | `exploit` |
| Gate & Quest Integrity | `quest-integrity` |
| Story & NPC Consistency | `story` |
| Emblem Balance | `emblem-balance` |
| Full Playthrough Sim | `playthrough` |

## Error handling

- **Never swallow errors silently.** If issue creation/update fails, report the error clearly.
- If `npm run test:stress` itself crashes (not test failures — process crash), report it and skip triage.
- If wiki generation fails, report it and continue with the graphify step.
- Each step is independent — a failure in one does not skip the others.

## Output

After running all three steps, report a summary:

```
## Post-Implementation Summary

### Stress Tests
- Total: X | Passed: Y | Failed: Z
- New failures: N | Fixed: M
- Issues created: A | Issues updated: B | Issues closed: C

### Wiki
- Pages updated: N
- New pages created: N

### Graphify
- Knowledge graph updated: yes/no
```
