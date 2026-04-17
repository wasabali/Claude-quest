# Update Wiki

Update the Cloud Quest game wiki. Regenerates `docs/wiki/` pages from the current game data files and design docs. Run this after game content changes (e.g., new skills, trainers, encounters, items).

## When to run

- After adding new skills, trainers, items, incidents, or encounters
- After changing domain matchups, tiers, or game mechanics
- After adding new regions or hidden areas
- When any game data file in `src/data/` changes
- When asked to by the developer

## Data sources

Read these files to build the wiki. **Always read them fresh** — never use cached content.

| File | Contains |
|---|---|
| `src/data/skills.js` | All skill definitions — commands, domains, tiers, effects, learn locations |
| `src/data/trainers.js` | All trainer NPCs — good and cursed, domains, locations, signature skills |
| `src/data/items.js` | All items — tools, key items, credentials, docs, junk |
| `src/data/encounters.js` | Encounter pools per region + incident definitions |
| `src/data/emblems.js` | Certification emblems and passive bonuses |
| `src/data/quests.js` | Quest definitions |
| `src/data/story.js` | Story dialog and NPC text |
| `src/config.js` | Domain matchups, status effects, XP table, constants |
| `docs/sessions/2026-04-15-game-design.md` | Core design decisions |
| `docs/issues/content-bible.md` | Full content bible — world, characters, story |

## Wiki structure

The wiki lives in `docs/wiki/`. Maintain these files:

| File | Purpose |
|---|---|
| `README.md` | Wiki home — table of contents, quick links |
| `getting-started.md` | How to play, controls, first steps, tutorial walkthrough |
| `combat-guide.md` | Battle system, domains, matchup cycle, solution tiers, SLA timers |
| `skills-reference.md` | All skills grouped by domain with stats |
| `world-map.md` | Regions, what's in each, progression order |
| `trainers.md` | All trainers — location, domain, difficulty, signature skill |
| `items-and-inventory.md` | All items by tab with effects |
| `encounters.md` | Encounter pools, incident stats, how random encounters work |
| `emblems.md` | All emblems, domains, passive bonuses |
| `reputation-and-shame.md` | Rep/Shame mechanics, thresholds, evil path overview |
| `tips-and-tricks.md` | Hints for stuck players, general strategy, domain matchup cheatsheet |
| `hidden-areas.md` | Outcast network, discovery hints (spoiler-tagged) |

## Writing rules

1. **Tone**: Friendly, slightly irreverent, matches the game's satirical voice. Write like a fan wiki, not dry docs.
2. **Data-file accuracy**: Stats, names, effects, and values that exist in `src/data/*.js` or `src/config.js` must be reproduced exactly. Never invent or alter implemented data.
3. **Design-doc content**: Content sourced from design docs (`docs/sessions/`, `docs/issues/`) that is NOT yet in `src/data/` files must be clearly labelled as *"Planned"* or *"Design Proposal"* so readers know it's not yet playable.
4. **Spoiler discipline**: Hidden areas and cursed techniques should be behind spoiler tags or in a clearly marked spoilers section. Don't ruin discovery.
5. **Tables over prose**: Use markdown tables for stats, lists, and references. Players scan, they don't read essays.
6. **Cross-links**: Link between wiki pages using relative markdown links (e.g., `[Combat Guide](combat-guide.md)`).
7. **Keep it current**: If a data file has an entry, it must appear in the wiki.
8. **No code snippets**: This is a player wiki, not a dev reference. Don't show JS objects or internal field names.
9. **Skill descriptions**: Use the `description` field from skills.js — it's already written in player-friendly flavour text.
10. **Domain matchup diagram**: Always include the full cycle in the combat guide: `Linux → Security → Serverless → Cloud → IaC → Containers → Kubernetes → Linux`.

## Step-by-step process

### Step 1 — Read all data files

Read every file listed in the data sources table above. Do this first, before writing anything.

### Step 2 — Generate each wiki page

For each page in the wiki structure table:
- If the file exists, overwrite it with updated content
- If it doesn't exist, create it
- Follow the writing rules exactly
- Clearly label any design-doc content not yet in `src/data/` as *Planned*

### Step 3 — Update the README

The `docs/wiki/README.md` must list all wiki pages with descriptions and links. Update it last so it reflects any new pages.

### Step 4 — GitHub Wiki publishing

The wiki pages in `docs/wiki/` are automatically published to the repository's GitHub Wiki by the `.github/workflows/wiki-sync.yml` workflow whenever a push to `main` touches `docs/wiki/**`. In the normal case, committing updated `docs/wiki/` files is sufficient and you do not need to trigger the workflow manually. However, for the first sync after introducing this workflow, if the merge to `main` does not include any `docs/wiki/**` changes, the publish will not run automatically — use `workflow_dispatch` once or make a follow-up commit that touches `docs/wiki/`.

- `docs/wiki/README.md` is renamed to `Home.md` in the GitHub Wiki (GitHub's required name for the landing page).
- All other `.md` files land at the current repository's GitHub Wiki URL pattern: `https://github.com/<owner>/<repo>/wiki/<filename-without-extension>`.

### Step 5 — Verify

- [ ] Every skill in `skills.js` appears in `skills-reference.md`
- [ ] Every trainer in `trainers.js` appears in `trainers.md`
- [ ] Every item in `items.js` appears in `items-and-inventory.md`
- [ ] Every emblem in `emblems.js` appears in `emblems.md`
- [ ] Every encounter pool in `encounters.js` appears in `encounters.md`
- [ ] Domain matchup cycle is correct and matches `config.js`
- [ ] All wiki pages are linked from `README.md`
- [ ] No broken relative links between wiki pages
- [ ] Spoiler content is properly marked
- [ ] Design/proposal content clearly labelled as not yet implemented
- [ ] Tone is consistent — friendly, funny, helpful
