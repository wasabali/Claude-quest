---
name: triage-issues
description: Find and file GitHub issues for contradictions, errors, and open questions in the codebase and docs. Searches existing issues and the internal wiki before filing. Invoke with a description of the problem (e.g. /triage-issues "domain matchup table in config.js disagrees with the wiki").
---

# Triage Issues

You are a quality gate for Cloud Quest. Your job is to detect contradictions, errors, and unanswered questions in the codebase, design docs, and wiki — then file well-labelled GitHub issues for each one.

**Do not fix the problems yourself.** File issues so the right person can address them.

---

## Issue Types

You create three kinds of issues. Each has a distinct label and template.

| Type | Label | When to file |
|---|---|---|
| **Contradiction** | `contradiction` | Two sources disagree — code vs docs, wiki vs design doc, data file vs config |
| **Error** | `bug` | Something is objectively wrong — broken reference, invalid value, missing export, bad data |
| **Question** | `question` | Ambiguity or gap — unclear spec, missing decision, undefined behavior |

---

## Step 1 — Understand the report

Read the invocation carefully. Determine:

1. **What was found?** (the symptom — what looks wrong)
2. **Where was it found?** (file path, issue number, wiki page)
3. **Which type is it?** (contradiction, error, or question)

If the invocation is vague, ask for clarification before proceeding.

---

## Step 2 — Search for existing issues

Before filing anything, check if the problem is already tracked.

1. Search GitHub issues in this repository for keywords related to the problem
2. Check closed issues too — the problem may have been resolved already

If an existing issue covers the same problem:
- Comment on it with the new information instead of filing a duplicate
- Stop here — do not create a new issue

---

## Step 3 — Search internal docs and wiki for context

Gather evidence from the project's own knowledge base to write a well-informed issue.

### Sources to search (in order)

| Source | Path | What it tells you |
|---|---|---|
| Wiki | `docs/wiki/*.md` | Player-facing facts — if something here contradicts code, that's a real problem |
| Design docs | `docs/sessions/*.md` | Design decisions — the intended behavior |
| Content bible | `docs/issues/content-bible.md` | Canonical world/story/character reference |
| Config | `src/config.js` | Domain matchups, constants, multipliers — the single source of truth for game mechanics |
| Data files | `src/data/*.js` | Skill, trainer, item, encounter definitions — what's actually implemented |
| Engine files | `src/engine/*.js` | Game logic — how mechanics actually work |
| Existing issues | GitHub issues | Prior decisions, open debates, known problems |

### What to look for

- **Contradictions**: Find both conflicting sources. Quote the exact lines that disagree.
- **Errors**: Identify the broken thing and what the correct value or behavior should be.
- **Questions**: Identify the gap — what's undefined, what decision is missing, what's ambiguous.

---

## Step 4 — File the issue

Create a GitHub issue using the appropriate template below.

### Contradiction issue

```markdown
## Contradiction: [short description]

**Source A** — `[file path or issue #]` line [N]:
> [exact quote from source A]

**Source B** — `[file path or issue #]` line [N]:
> [exact quote from source B]

### Impact
[What breaks or confuses if this isn't resolved]

### Suggested resolution
[Which source should be authoritative, or what the correct value should be]
```

**Labels:** `contradiction`, plus the relevant area label (`data`, `engine`, `docs`, `wiki`, `design`)

### Error issue

```markdown
## Error: [short description]

**Location** — `[file path]` line [N]:
```
[code or text that is wrong]
```

### Expected
[What the correct value/behavior should be]

### Actual
[What it currently does]

### Impact
[What breaks because of this]
```

**Labels:** `bug`, plus the relevant area label

### Question issue

```markdown
## Question: [short description]

### Context
[What you were looking at when the question arose]

### The question
[The specific ambiguity or gap]

### What I found in the docs
[Any relevant quotes from design docs, wiki, or existing issues — or "nothing found"]

### Why it matters
[What can't be implemented or verified until this is answered]
```

**Labels:** `question`, plus the relevant area label

---

## Step 5 — Verify before submitting

Before creating the issue:

- [ ] Searched existing issues — this is not a duplicate
- [ ] Searched the wiki and docs — context is included in the issue body
- [ ] Issue type is correct (contradiction vs error vs question)
- [ ] Both conflicting sources quoted (contradictions only)
- [ ] Labels are set correctly
- [ ] Title starts with the type: `Contradiction:`, `Error:`, or `Question:`
- [ ] Issue body is self-contained — a reader doesn't need to open other files to understand it

---

## Area labels

Use these to categorize which part of the project is affected:

| Label | When |
|---|---|
| `data` | `src/data/` files — skills, trainers, items, encounters, emblems |
| `engine` | `src/engine/` files — BattleEngine, SkillEngine, StatusEngine |
| `docs` | `docs/` files — design docs, content bible, session notes |
| `wiki` | `docs/wiki/` files — player-facing wiki pages |
| `design` | Design decisions — specs, proposals, unresolved questions |
| `scene` | `src/scenes/` or `src/ui/` files |
| `config` | `src/config.js` — constants, matchups, multipliers |

---

## Examples

### Example contradiction

**Invocation:** `/triage-issues "config.js says linux beats security but the wiki combat guide says linux beats containers"`

**Resulting issue:**

> **Title:** Contradiction: Domain matchup for Linux disagrees between config.js and wiki
>
> **Source A** — `src/config.js` line 12:
> > `linux: { strong: 'security', weak: 'kubernetes' }`
>
> **Source B** — `docs/wiki/combat-guide.md` line 34:
> > "Linux is strong against Containers"
>
> **Impact:** Players reading the wiki will use the wrong counter strategy in battle.
>
> **Suggested resolution:** `config.js` is the source of truth. Update the wiki.
>
> **Labels:** `contradiction`, `wiki`, `config`

### Example error

**Invocation:** `/triage-issues "kubectl_apply skill has domain 'k8s' which isn't a valid domain value"`

**Resulting issue:**

> **Title:** Error: Invalid domain value 'k8s' in kubectl_apply skill
>
> **Location** — `src/data/skills.js` line 45:
> ```js
> domain: 'k8s',
> ```
>
> **Expected:** `domain: 'kubernetes'` (valid domain values: linux, containers, kubernetes, cloud, security, iac, serverless, observability)
>
> **Actual:** `domain: 'k8s'` — not a valid domain value
>
> **Impact:** Domain matchup calculation will fail for this skill.
>
> **Labels:** `bug`, `data`

### Example question

**Invocation:** `/triage-issues "what happens when a player uses a cursed technique on an observability-domain trainer?"`

**Resulting issue:**

> **Title:** Question: Undefined behavior — cursed technique vs observability trainer
>
> **Context:** Cursed techniques have `domain: null` (bypass matchups) and observability trainers have `{ strong: null, weak: null }`.
>
> **The question:** When a cursed skill (domain: null) is used against an observability-domain opponent, what multiplier applies? The matchup table has no entry for `null → observability`.
>
> **What I found in the docs:** `docs/sessions/2026-04-15-game-design.md` says cursed techniques deal "flat damage, ignoring matchups" but doesn't specify the interaction with observability's special status.
>
> **Why it matters:** SkillEngine.calculateDamage() needs to handle this case explicitly or it will return undefined behavior.
>
> **Labels:** `question`, `engine`, `design`
