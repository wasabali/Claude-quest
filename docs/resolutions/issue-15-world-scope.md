## Resolution — World Scope: Maps, Transitions, and MVP Boundaries

Time to draw the map. Every good RPG starts with someone squinting at graph paper at midnight muttering "does this cave connect to that forest?" Here's our answer. Spoiler: the cave connects to a Jira board.

---

### Q1 — Total Map Count

**8 main maps + 6 hidden maps + gym/dungeon sub-rooms = ~22 total Tiled maps.**

Here's the full breakdown:

#### Main Regions (6 maps)

| Map ID | Name | Domain Focus | Act Available | Connected To |
|---|---|---|---|---|
| `localhost_town` | Localhost Town | Tutorial / mixed | 1 | pipeline_pass (east), azure_town (south) |
| `pipeline_pass` | Pipeline Pass | IaC | 1 | localhost_town (west), production_plains (east), jira_dungeon (north entrance) |
| `azure_town` | Azure Town | Cloud / shops | 1 | localhost_town (north), kubernetes_colosseum (east) |
| `production_plains` | Production Plains | Cloud / Linux | 2 | pipeline_pass (west), kubernetes_colosseum (south) |
| `kubernetes_colosseum` | Kubernetes Colosseum | Kubernetes / Containers | 2 | azure_town (west), production_plains (north) |
| `three_am_tavern` | The 3am Tavern | Cursed / mixed | 2 (time-gated) | production_plains (hidden exit), kubernetes_colosseum (back alley) |

#### Hidden / Outcast Regions (6 maps)

| Map ID | Name | Access Method | Outcast NPC |
|---|---|---|---|
| `server_graveyard` | The Server Graveyard | SSH to decommissioned terminal in Production Plains | Deprecated Dagfinn |
| `node_modules_maze` | The node_modules Maze | Use `mystery_node_modules` junk item | Privileged Petra |
| `dev_null_void` | The /dev/null Void | Pipe output 3 times in battle | The Null Pointer |
| `deprecated_azure_region` | Deprecated Azure Region (West-EU-2) | Select greyed-out region at Azure Terminal | West-EU-2 Wilhelm |
| `oldcorp_basement` | OldCorp Basement (DO_NOT_TOUCH.exe) | Open despite 3 warnings in Jira Dungeon | (notes only, no NPC) |
| `three_am_tavern` | 3am Tavern (reused) | Real clock 02:57-03:05 | Rotating outcasts |

Note: `three_am_tavern` doubles as both a main region (accessible via story in Act 2) and a hidden region (accessible early via real-time clock trick). If accessed via clock trick before Act 2, it has limited content but the Outcast NPCs are present.

#### Gyms (8 sub-rooms — inside parent regions)

Gyms are **rooms within their parent region's Tiled map**, not separate maps. Each gym is a single indoor room entered via a door tile. The Tiled map for the parent region includes the gym room as a separate layer/object group.

| Gym | Domain | Parent Region | Gym Leader |
|---|---|---|---|
| Terminal Gym | Linux | localhost_town | Ola the Ops Guy |
| Pipeline Gym | IaC | pipeline_pass | Bjorn the Build Breaker |
| Security Vault Gym | Security | azure_town | Ingrid the IAM Inspector |
| Cloud Console Gym | Cloud | azure_town | The Solutions Oracle |
| Container Harbor Gym | Containers | kubernetes_colosseum | Helm Hansen |
| Kube Arena Gym | Kubernetes | kubernetes_colosseum | The Kube-rnetes Master |
| Serverless Shrine | Serverless | production_plains | Fatima the Function Witch |
| SRE Command Center | Observability | production_plains | (Final gym — TBD leader) |

Each gym is a 10×8 tile room (160×128 pixels native) with:
- 1 trainer NPC (the gym leader)
- Optional pre-gym puzzle (command gating)
- Victory flag stored in `GameState.story.flags`

#### Dungeons (2 multi-room areas)

Dungeons are **linear 2-3 room layouts** using separate Tiled maps per room.

**Jira Dungeon** (3 rooms):
| Room | Map ID | Contents |
|---|---|---|
| Backlog Cavern | `jira_dungeon_1` | Entry room. Stale ticket encounters. NPC warns: "Turn back. There are story points ahead." |
| Sprint Corridor | `jira_dungeon_2` | Mid room. Harder encounters. Scope creep boss mid-room. |
| The Board Room | `jira_dungeon_3` | Boss room. "The Gantt Chart" cursed encounter. Completing it unlocks the Pipeline Emblem. |

**The Cloud Console** (2 rooms):
| Room | Map ID | Contents |
|---|---|---|
| Portal Lobby | `cloud_console_1` | Entry room. Azure Portal themed. Config drift encounters. |
| Resource Group Chamber | `cloud_console_2` | Boss room. Azure Bill Spike boss. Completing it unlocks the Cloud Emblem. |

---

### Q2 — MVP Scope

**MVP = 3 maps + 2 gym sub-rooms + 1 dungeon:**

1. `localhost_town` — starting area, tutorial, Terminal Gym
2. `pipeline_pass` — first exploration area, Pipeline Gym, Jira Dungeon entrance
3. `jira_dungeon_1` (room 1 only) — first dungeon room, first real challenge

**MVP covers Act 1 only.** The player:
- Starts in Localhost Town
- Completes the tutorial (learn movement, NPC interaction, first battle)
- Challenges the Terminal Gym (Ola the Ops Guy)
- Travels east to Pipeline Pass
- Explores, encounters wild incidents
- Challenges the Pipeline Gym (Bjorn the Build Breaker)
- Enters Jira Dungeon Room 1
- End of MVP content

**Everything else is gated** by an NPC who says: `"The path ahead is under construction. Come back in the next sprint."`

This gives us a **complete gameplay loop** (explore → battle → gym → dungeon) without needing all 22 maps.

---

### Q3 — Region Transitions

**Edge-scroll transitions** between adjacent regions. Walk to the map edge, screen fades to black (2-frame fade, GBC style), new map loads.

**Implementation:**
- Each map edge has a `transition_zone` object layer in Tiled
- When the player sprite overlaps the transition zone, `WorldScene` triggers:
  1. 4-frame fade to black (not smooth — stepped opacity: 100% → 66% → 33% → 0%)
  2. Load new map
  3. Place player at the corresponding entry point on the new map
  4. 4-frame fade in

**Connection data** (in `src/config.js` or a new `src/data/regions.js`):
```js
export const REGION_CONNECTIONS = {
  localhost_town: {
    east:  { target: 'pipeline_pass',       entry: 'west'  },
    south: { target: 'azure_town',          entry: 'north' },
  },
  pipeline_pass: {
    west:  { target: 'localhost_town',      entry: 'east'  },
    east:  { target: 'production_plains',   entry: 'west',  requires: { act: 2 } },
    north: { target: 'jira_dungeon_1',      entry: 'south' },
  },
  azure_town: {
    north: { target: 'localhost_town',      entry: 'south' },
    east:  { target: 'kubernetes_colosseum', entry: 'west', requires: { act: 2 } },
  },
  production_plains: {
    west:  { target: 'pipeline_pass',       entry: 'east'  },
    south: { target: 'kubernetes_colosseum', entry: 'north' },
  },
  kubernetes_colosseum: {
    west:  { target: 'azure_town',          entry: 'east'  },
    north: { target: 'production_plains',   entry: 'south' },
  },
}
```

**Fast travel: Azure Terminals.**
- Physical terminal objects placed in each main region
- First visit = unlocked. Terminal glows blue to indicate "discovered."
- After discovery, any Azure Terminal shows a menu of all discovered terminals
- Selecting a destination: instant transition (no walking, same fade effect)
- Stored in `GameState.story.flags` as `terminal_unlocked_<region_id>`
- Terminal UI is a simple `Menu` component listing discovered regions

```js
// Example flag check
const discoveredTerminals = Object.keys(GameState.story.flags)
  .filter(f => f.startsWith('terminal_unlocked_'))
  .map(f => f.replace('terminal_unlocked_', ''))
```

---

### Q4 — Story Gating

**NPC-blocked paths.** Physical NPCs standing in front of the transition zone, preventing passage.

Types of blocks:

| Block Type | Example | Resolution |
|---|---|---|
| Story gate | "The east path is closed until the Pipeline Gym is complete." | Complete required quest/gym |
| Skill gate | NPC demands you demonstrate a command: "Show me `kubectl apply`" | Have the skill in your learned list |
| Item gate | "I need an SSH key to let you through." | Have the key item in inventory |
| Reputation gate | "Only Distinguished Engineers may enter the Architecture District." | Reach reputation threshold |
| Shame gate | "You look... interesting. Come in." (3am Tavern bouncer) | Reach shame threshold |

All gates check `GameState` — the NPC's dialogue variant system in `story.js` handles the conversation. When the condition is met, the NPC steps aside (sprite moves 1 tile, stored in `story.flags` so it persists).

**No invisible walls.** Every blocked path has a visible NPC or object explaining why it's blocked and what the player needs to do. No mystery roadblocks.

---

### Q5 — Gym Locations

**Gyms are rooms inside their parent region** (answered in Q1 table above).

Implementation: Each parent region's Tiled map has a door tile that triggers a scene transition to the gym room. The gym room is a small interior map (10×8 tiles). After defeating the gym leader, the player is returned to the parent region at the door tile.

**Gym progression is linear within each Act:**
- Act 1: Terminal Gym → Pipeline Gym (must complete in order)
- Act 2: Security Vault → Cloud Console → Container Harbor → Kube Arena (flexible order within pairs)
- Act 3: Serverless Shrine → SRE Command Center
- Act 4: Multi-Region Endgame (no gym — final boss chain)

---

### Q6 — Multi-Region Endgame

**Not new maps.** The "Multi-Region Endgame" is a **state change on existing maps.**

After completing all 8 gyms and reaching Act 4:
- All regions get harder encounter pools (existing encounters with +2 difficulty, new rare encounters)
- Each region spawns one "Endgame Incident" — a unique final-boss-tier encounter
- The Throttlemaster appears as a roaming NPC in Production Plains
- The final confrontation takes place in a special room within the Cloud Console dungeon: `cloud_console_final` (1 additional Tiled room)

**Why not new maps?** Because the player should feel the world they've already explored becoming more dangerous. The familiar becomes hostile. The intern who followed you around now has a Senior Engineer badge and a grudge. The vending machines cost twice as much. The encounters are sev-1s at scale.

This is cheaper to build AND more narratively interesting than a new continent.

---

### Q7 — Dungeon Structure

**Dungeons are 2-3 room linear layouts.** No branching paths. No puzzle-locked doors. Just harder encounters and a boss at the end.

Each room has:
- A distinct visual tileset (different from the parent region)
- 2-4 encounter zones (walk through them = chance of encounter)
- 1 NPC per room (gives lore or hints)
- Room boss or mini-boss in rooms 2+
- The final room has the dungeon boss + emblem reward

**Jira Dungeon** unique mechanic: `STORY_POINTS`
- Each encounter in the Jira Dungeon drops "story points" (a dungeon-local counter, not saved to GameState)
- You need 13 story points to open the door to the next room (one sprint's worth)
- This is a joke. The player will get it. The encounters are called things like "stale_ticket" and "scope_creep."

**Cloud Console** unique mechanic: `RESOURCE_LOCK`
- The boss room has the Azure Bill Spike
- Before the boss, the player must "unlock" 3 Azure resources by using specific commands at terminal objects in the lobby
- Each terminal requires a different domain skill (cloud, iac, security) — encouraging a balanced deck

---

### World Map (ASCII)

```
                    [Jira Dungeon]
                         |
                         N
                         |
[Localhost Town] ---E--- [Pipeline Pass] ---E--- [Production Plains]
        |                                               |
        S                                               S
        |                                               |
   [Azure Town] --------E---------- [Kubernetes Colosseum]

Hidden (not on map):
  - Server Graveyard (from Production Plains)
  - node_modules Maze (from any region, via item)
  - /dev/null Void (from any battle, via piping)
  - Deprecated Azure Region (from any Azure Terminal)
  - OldCorp Basement (from Jira Dungeon)
  - 3am Tavern (from Production Plains or real clock)
```

---

### Files Affected

| File | Changes |
|---|---|
| `src/config.js` | Add `REGION_CONNECTIONS` map or reference new data file |
| `src/data/regions.js` | **New file** — region definitions, connections, transition data |
| `src/data/encounters.js` | Add encounter pools for new regions (azure_town, cloud_console rooms) |
| `src/scenes/WorldScene.js` | Edge-scroll transition logic, Azure Terminal fast travel UI |
| `src/scenes/GymScene.js` | **New scene** (or sub-mode of WorldScene) — gym room rendering |
| `src/scenes/DungeonScene.js` | **New scene** (or sub-mode of WorldScene) — dungeon room rendering |
| `src/engine/EncounterEngine.js` | Support for dungeon-specific encounter rates and story-point mechanic |
| `src/data/story.js` | NPC gate dialogues, terminal discovery flags |
| Tiled maps (assets/maps/) | 6 main region maps, 8 gym rooms, 5 dungeon rooms, 6 hidden area maps |
| Content bible | Add world map section |

### Follow-ups

- [ ] New issue: Design Tiled map for Localhost Town (first map, MVP)
- [ ] New issue: Design Tiled map for Pipeline Pass (second map, MVP)
- [ ] New issue: Design Jira Dungeon Room 1 (first dungeon, MVP)
- [ ] New issue: Implement edge-scroll transition system in WorldScene
- [ ] New issue: Implement Azure Terminal fast travel
- [ ] New issue: Implement NPC gate system (check GameState, step aside)
- [ ] New issue: Jira Dungeon story-point mechanic
- [ ] New issue: Cloud Console resource-lock puzzle design
- [ ] New issue: Act 4 endgame state change system
- [ ] New issue: Hidden region access triggers (6 methods)

### Content Bible Update

Add section **"7.0 World Map & Regions"** with:
- Complete region table with connections
- ASCII world map
- Gym locations and progression order
- Dungeon room layouts
- Fast travel rules (Azure Terminals)
- Gate types (story, skill, item, reputation, shame)
- MVP scope definition (Act 1 = 3 maps)
- Endgame as state change, not new maps
- Hidden region access methods
