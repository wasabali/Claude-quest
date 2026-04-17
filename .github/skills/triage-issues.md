# Triage Issues

Find and file GitHub issues for contradictions, errors, and open questions in the Cloud Quest codebase and docs. Searches existing issues and the internal wiki before filing to avoid duplicates and provide context.

## When to use

- When you spot something that looks wrong, contradictory, or undefined
- When doing a review pass across docs, data files, or engine code
- When a developer reports a potential problem but isn't sure if it's already tracked
- When auditing consistency between the wiki and the actual game data

## Issue types

| Type | Title prefix | Labels | When to file |
|---|---|---|---|
| **Contradiction** | `Contradiction:` | `contradiction` + area | Two authoritative sources disagree |
| **Error** | `Error:` | `bug` + area | Something is objectively wrong |
| **Question** | `Question:` | `question` + area | Ambiguity, gap, or missing decision |

## Area labels

| Label | Scope |
|---|---|
| `data` | `src/data/` — skills, trainers, items, encounters, emblems |
| `engine` | `src/engine/` — BattleEngine, SkillEngine, StatusEngine |
| `docs` | `docs/` — design docs, content bible, session notes |
| `wiki` | `docs/wiki/` — player-facing wiki pages |
| `design` | Design decisions, specs, proposals |
| `scene` | `src/scenes/` or `src/ui/` |
| `config` | `src/config.js` — constants, matchups, multipliers |

## Step-by-step process

### Step 1 — Understand the report

Read the invocation. Determine:
1. What was found (the symptom)
2. Where it was found (file path, issue number, wiki page)
3. Which type it is (contradiction, error, or question)

If the invocation is vague, ask for clarification.

### Step 2 — Search existing issues

Before filing anything, search GitHub issues in this repo for related keywords. Check both open and closed issues. If a matching issue exists, comment on it instead of creating a duplicate.

### Step 3 — Search internal docs and wiki

Gather context from the project's knowledge base:

| Source | Path | Purpose |
|---|---|---|
| Wiki | `docs/wiki/*.md` | Player-facing facts |
| Design docs | `docs/sessions/*.md` | Design decisions |
| Content bible | `docs/issues/content-bible.md` | Canonical world/story/character reference |
| Config | `src/config.js` | Source of truth for game mechanics |
| Data files | `src/data/*.js` | Implemented game content |
| Engine files | `src/engine/*.js` | Implemented game logic |

For contradictions, find and quote both conflicting sources.
For errors, identify the correct value from authoritative sources.
For questions, note what the docs say (or don't say) about the topic.

### Step 4 — File the issue

Use the appropriate template:

#### Contradiction

```markdown
## Contradiction: [short description]

**Source A** — `[file path]` line [N]:
> [exact quote from source A]

**Source B** — `[file path]` line [N]:
> [exact quote from source B]

### Impact
[What breaks or confuses if unresolved]

### Suggested resolution
[Which source is authoritative]
```

#### Error

```markdown
## Error: [short description]

**Location** — `[file path]` line [N]:
```
[code or text that is wrong]
```

### Expected
[Correct value/behavior]

### Actual
[Current wrong value/behavior]

### Impact
[What breaks]
```

#### Question

```markdown
## Question: [short description]

### Context
[What you were looking at]

### The question
[The specific ambiguity or gap]

### What I found in the docs
[Relevant quotes or "nothing found"]

### Why it matters
[What can't proceed until this is answered]
```

### Step 5 — Verify before submitting

- [ ] Not a duplicate of an existing issue
- [ ] Wiki and docs searched for context
- [ ] Correct issue type (contradiction vs error vs question)
- [ ] Both sources quoted (contradictions only)
- [ ] Labels set: type label + area label(s)
- [ ] Title starts with type prefix: `Contradiction:`, `Error:`, or `Question:`
- [ ] Issue body is self-contained

## Cross-reference validation checks

When doing a full audit, check these systematically:

### Data integrity
- Every skill `domain` is valid (linux, containers, kubernetes, cloud, security, iac, serverless, observability, or `null` for cursed/nuclear techniques)
- Every skill `tier` is valid (optimal, standard, shortcut, cursed, nuclear)
- Cursed skills have `isCursed: true`, `domain: null`, `sideEffect` set, `warningText` set
- Trainer deck skill IDs exist in `skills.js`
- Trainer `signatureSkill` is in their `deck`
- SLA timers match severity (sev0=1, sev1=3, sev2=6, sev3=10)
- All data files export `getById`, `getAll`, `getBy`

### Doc/code consistency
- Domain matchups in `config.js` match wiki combat guide
- Skills in `skills.js` appear in wiki skills reference
- Trainers in `trainers.js` appear in wiki trainers page
- Region names in data files match wiki world map

### Architecture
- No Phaser imports in `src/engine/` or `src/data/`
- No game logic in `src/data/` files
- No direct GameState mutation in `src/scenes/`
