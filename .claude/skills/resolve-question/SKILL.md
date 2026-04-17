---
name: resolve-question
description: Iterate design ideas for a Cloud Quest [Design Question] issue and find the best fit. Uses the graphify knowledge graph and wiki for full context. Invoke with an issue number (e.g. /resolve-question 35).
---

You are resolving an open design question for Cloud Quest. Your job is to iterate multiple concrete ideas, stress-test each against the game's architecture, content bible, and fun factor, then recommend the best fit.

## Step 0 — Load context from the knowledge graph and wiki

Before reading the issue, build your mental model of the game:

1. **Read `graphify-out/GRAPH_REPORT.md`** — note god nodes, community structure, and surprising connections. This tells you which systems are tightly coupled and which are isolated.
2. **Read `docs/wiki/README.md`** then skim the relevant wiki pages for the topic area (e.g. `combat-guide.md` for battle questions, `world-map.md` for region questions, `reputation-and-shame.md` for shame/evil path questions).
3. **Read `docs/issues/content-bible.md`** — this is the canonical pick-and-choose menu. Check if the question's topic already has a confirmed or proposed answer there.
4. **Read `docs/sessions/2026-04-15-game-design.md`** — the original design session. Many questions were partially answered here.

This context is mandatory. Do not skip it — proposals without full context will contradict existing decisions.

---

## Step 1 — Understand the question

Fetch the issue. Read:
- The issue title and body
- All labels (design, battle, story, mechanics, etc.)
- Any referenced issues (e.g. "See #41", "Outlined in #34")
- All comments — other contributors may have already proposed solutions

Identify:
- **The core question** — what specific design decision needs to be made?
- **Constraints** — what has already been decided that limits the answer space?
- **Dependencies** — what other systems or issues does this connect to?

---

## Step 2 — Generate 3–5 candidate ideas

For each open question in the issue, brainstorm **3 to 5 distinct proposals**. Each proposal must:

1. **Be concrete** — not "we could do something with NPCs" but "NPCs swap their overworld dialog to reference the player's recent actions, drawn from a `postEvent` dialog array on each NPC entry in `story.js`"
2. **Be fun** — ask yourself: would a player enjoy this? Would it make them laugh, feel clever, or want to keep playing? If the answer is "it's technically correct but boring", discard it.
3. **Respect architecture** — no proposals that require Phaser in engine code, state outside GameState, or logic in data files
4. **Name its cost** — is this 10 lines of data, a new engine, or a new scene? Be honest about scope.

### Idea quality checklist

For each idea, verify:
- [ ] It doesn't contradict any confirmed decision in the content bible
- [ ] It doesn't break an existing implemented system (check `src/data/`, `src/engine/`, `src/scenes/`)
- [ ] It fits the GameBoy Color aesthetic (no complex UI, no smooth animations, dialog-box-driven interactions)
- [ ] It would be fun for the target audience (engineers who like CLI tools and RPGs)
- [ ] It has a clear implementation path using the existing layer architecture

---

## Step 3 — Stress-test each idea

For every candidate, run these checks:

### Fun test
- Does it create a moment the player would tell a friend about?
- Does it reward curiosity or mastery?
- Does it have replay value or is it one-and-done?
- Does it avoid "fetch quest" syndrome — i.e., does the player make meaningful choices?

### Consistency test
- Read the relevant `src/data/` files. Does this idea conflict with existing data?
- Read the relevant `src/engine/` files. Does this require changes to engine interfaces?
- Check the graph report — does this idea touch a god node (high-edge-count module)? If so, flag the risk.
- Check the domain matchup cycle — does this idea respect or intentionally subvert it?

### Scope test
- Can this be implemented with data changes only (cheapest)?
- Does it need a new engine function (medium)?
- Does it need a new scene or UI component (expensive)?
- Would it block or be blocked by other open design questions?

### Personality test
- Does it fit Cloud Quest's satirical, irreverent tone?
- Would it be funny to an actual cloud engineer?
- Does it avoid being preachy, tutorial-like, or overly gamey?

---

## Step 4 — Rank and recommend

After stress-testing, rank the ideas by **fun × feasibility**. Present them as:

### Recommended: [Idea Name]

One paragraph explaining why this is the best fit. Reference specific game systems it integrates with.

### Runner-up: [Idea Name]

One paragraph on why this is good but slightly worse than the recommendation.

### Honourable mention: [Idea Name]

One sentence on what's good about it, and one sentence on why it didn't win.

### Discarded: [Idea Name(s)]

One sentence each on why they were cut — too expensive, contradicts X, not funny enough, etc.

---

## Step 5 — Write the answer

Draft a comment on the issue with:

1. **The recommendation** — which idea won and why
2. **Proposed data shape** — if the answer involves new data fields, show the schema (matching existing patterns in `src/data/`)
3. **Proposed implementation** — which files change, in which order
4. **Open follow-ups** — any new questions this answer creates (to be filed as separate issues)
5. **Content bible update** — what line to add/change in `docs/issues/content-bible.md` to record this decision

Format the answer so it can be copy-pasted directly into the issue as a resolution comment.

---

## Step 6 — Update the content bible

If the recommendation is accepted (or if you're told to go ahead):

1. Open `docs/issues/content-bible.md`
2. Find the relevant section
3. Mark the resolved question with ✅ and add the decision summary
4. If the recommendation creates new data shapes, note them in the appropriate section

---

## Step 7 — Verify

Before posting:
- [ ] All proposals reference specific game systems (not vague hand-waving)
- [ ] The recommendation doesn't contradict any ✅ item in the content bible
- [ ] The recommendation respects the architecture rules (no Phaser in engines, no state outside GameState, no logic in data)
- [ ] The proposed data shapes match existing registry patterns
- [ ] The answer is written in Cloud Quest's voice — funny, direct, a little sarcastic
- [ ] Follow-up questions are identified (don't let the answer create silent gaps)
- [ ] The graph report was consulted for god nodes and coupling risks

---

## Example — resolving a question

**Issue:** *[Design Question] Battle actions — fleeing, items, and turn order rules*

### Context gathered
- Graph report shows `resolveTurn()` is a high-edge god node (8 edges) — changes here ripple
- Wiki combat guide describes the 5-phase turn system
- Content bible has turn menu partially defined but no flee rules

### Ideas generated
1. **Flee costs 1 Shame (incidents) / blocked (trainers)** — matches the shame system, no engine changes needed, just a flag check
2. **Flee triggers an SLA breach** — punishing but inconsistent with "you left before the timer ran out"
3. **Flee is always free** — no penalty, but feels wrong for a game that's about accountability
4. **Flee costs HP** — Pokémon-like, but Cloud Quest isn't about HP attrition

### Recommendation: Option 1
Flee from incidents costs +1 Shame. Flee from trainers is blocked. This is the cheapest implementation (flag check in `BattleEngine.resolveTurn()`), matches the shame/reputation system, and creates a meaningful choice: "Do I take the Shame hit or risk an SLA breach?"

### Data shape: none needed (engine flag check only)
### Files changed: `src/engine/BattleEngine.js` (add flee check to turn menu phase)
### Follow-ups: Should flee have a cooldown? Can you flee from cursed encounters?
