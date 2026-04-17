## ✅ Resolution — Gym System

> *"Eight gyms, eight emblems, eight unique ways for your CI pipeline to ruin your day."*

---

### 1. Apprentice Count: 2 per gym (standard), exceptions noted

Every gym has **2 apprentice battles** and **1 sub-leader** before the leader. This is the GBC Pokémon cadence and it works. Three fights is the sweet spot — enough to drain resources, not enough to make the player Alt+F4.

**Exception:** The CTO gym (final) has **3 apprentices + 2 sub-leaders** because it is the Final Boss Gym and you should *suffer*.

---

### 2. Sub-Leaders: Named, alliterative, skill-teaching

Sub-leaders are **named characters** following the alliterative naming convention. Each teaches **one skill on defeat** (same as regular named trainers — `teachSkillId` field). They function as mini-bosses that gate the leader fight.

| Gym | Domain | Sub-Leader | Teaches |
|---|---|---|---|
| Fundamentals Gym | linux | **Logging Lena** | `tail_f` |
| Admin Gym | cloud | **Alert Anders** | `az_monitor_alert` |
| DevOps Gym | iac | **Pipeline Per** | `az_pipelines_run` |
| Developer Gym | serverless | **Trigger Trude** | `event_trigger` |
| Kubernetes Gym | kubernetes | **Manifest Magnus** | `kubectl_apply` |
| Security Gym | security | **Policy Pål** | `az_role_assignment_create` |
| Architecture Gym | observability | **Metrics Maja** | `az_monitor_metrics` |
| The CTO Office | all | **Deploy Diana** + **Incident Ivan** | `blue_green_deploy` / `canary_release` |

Sub-leaders use the standard trainer data shape — just trainers with a `gymRole: 'sub_leader'` field. No new engine code needed.

---

### 3. Per-Gym Mechanics — Concrete Numbers

Each gym has a unique `gymMechanic` that the `BattleEngine` reads from the encounter/gym config. Here are the specifics:

#### 🐧 Fundamentals Gym — "The Legacy Monolith"
- **Leader:** Tux the Terminal Wizard (promoted from field trainer)
- **Mechanic:** `legacy_only` — Skills with `availableInAct >= 3` are **disabled**. Only Act 1–2 skills work. The boss is immune to cloud-specific skills (`domain: 'cloud'` deals 0 damage).
- **"Modern" skills:** Any skill with `availableInAct >= 3` or `domain === 'cloud'` or `domain === 'serverless'`
- **"Basic" skills:** Everything else. `grep`, `kill -9`, `systemctl restart` — the classics.
- **Flavor:** *"This monolith was deployed before Kubernetes was a twinkle in Google's eye."*

#### ☁️ Admin Gym — "3am Incident Response"
- **Leader:** Captain Nines (Cloud)
- **Mechanic:** `sla_timer` — Battle starts with an SLA timer of **6 turns** (tighter than normal incidents). Every turn the timer ticks. If it hits 0, you take **30 HP penalty** and **-15 reputation** (worse than standard SLA breach). Captain Nines' attacks include `uptime_drain` which ticks the SLA an extra turn.
- **Timer:** 6 turns (vs normal incident default of 10)
- **Breach penalty:** 30 HP + 15 rep (vs normal 20 HP + 10 rep)

#### 🔧 DevOps Gym — "The Broken Pipeline"
- **Leader:** Bjørn the Build Breaker (promoted from field trainer)
- **Mechanic:** `flaky_pipeline` — Every skill has a **30% chance to fail** and waste the turn. **Applies to BOTH sides.** This is fair and funny — watching the boss's `terraform_plan` fail mid-fight is chef's kiss. Displayed as "Pipeline failed — retrying..." with a 1-second delay.
- **Fail chance:** 30% per skill use, both player and opponent
- **Mitigation:** The item `skip_tests_scroll` bypasses the fail check for one use.

#### ⚡ Developer Gym — "Cold Start Gauntlet"
- **Leader:** Fatima the Function Witch (see Q5 below)
- **Mechanic:** `cold_start` — Player's first skill each battle has **doubled cast time** (skip first action turn). After the first skill fires, everything is warm. Opponent does NOT suffer cold starts because they are "always-on" (pre-provisioned, the lucky bastards).
- **Cold start penalty:** Player skips first action turn (status `cold_start` applied at battle start)
- **Counterplay:** The `read_the_docs` skill (observability) can be used as a "warm-up" on turn 1 with no penalty since it is a reveal, not an action.

#### 🚢 Kubernetes Gym — "Pod Crasher"
- **Leader:** The Kube-rnetes Master
- **Mechanic:** `respawn` — The leader respawns **3 times** at **50% HP** each time (not full HP — that would be genuinely evil). Each respawn changes the leader's active deck slightly (rotates in a new skill). Apprentices and sub-leader do NOT respawn.
- **Respawn HP:** 50% of maxHp per respawn (so 60 HP on a 120 maxHp boss)
- **Respawn count:** 3 (total of 4 phases to defeat the boss)
- **Deck rotation:** Swaps one skill per respawn from a reserve pool

#### 🔒 Security Gym — "Entra Misconfiguration"
- **Leader:** Ingrid the IAM Inspector
- **Mechanic:** `rbac_deny` — Each turn, there is a **25% chance** one of your skills gets randomly "denied" (greyed out, unusable that turn). If denied, the turn is **not wasted** — you can pick another skill. The denial is shown as "403 Forbidden: insufficient permissions" in the battle log.
- **Deny chance:** 25% per turn, affects one random skill in your active deck
- **Turn wasted?** No — you get to re-pick. Denial is annoying, not devastating.
- **Applies to opponent?** No. Ingrid has proper RBAC. Obviously.

#### 🏗️ Architecture Gym — "Azure Bill Spiral"
- **Leader:** The Solutions Oracle (promoted from field trainer)
- **Mechanic:** `cost_spiral` — The leader gains **+5 HP** and **+3 attack power** each turn. A ticking clock that rewards aggressive play. After turn 8, the boss also starts draining player budget (2x `budget_spike`).
- **HP growth:** +5 per turn
- **Attack growth:** +3 per turn
- **Budget drain:** Starts at turn 8, 2x budget_spike per turn
- **Counterplay:** Use `cost_optimization` skill to reset the growth counter. Or just be fast.

#### 👔 The CTO Office — Final Boss
- **Leader:** The CTO
- **Mechanic:** `all_domains` — The CTO switches domain every 2 turns, cycling through all 7 domains. The player must read telegraphs (or use observability skills) to anticipate the switch. At 25% HP, the CTO enters "Executive Mode" — all skills hit for 1.5x and the domain switches every turn.
- **Domain switch:** Every 2 turns (every 1 turn below 25% HP)
- **Cycle order:** Randomised per fight (seeded RNG)
- **Phase 2 threshold:** 25% HP remaining

---

### 4. Gym Replayability

**Yes, gyms are replayable post-game** with the following rules:

- Unlocked after the player beats the final boss (CTO) — `story.flags.postgame_unlocked`
- All gym leaders are **+5 levels** above their original stats
- Gym mechanics are the same but with tighter numbers (e.g., SLA timer -1, fail chance +10%)
- **No skill teaching on replay** — you already learned it
- **XP reward:** 50% of original (diminishing returns, like re-reading a runbook)
- Tracked in `stats.gymReplays: { [gymId]: number }`

---

### 5. Fatima the Function Witch — Field Trainer AND Gym Leader

**Fatima IS the Developer Gym leader.** No conflict. She is encountered as a field trainer in Pipeline Pass first, which serves as **foreshadowing**:

- **Pipeline Pass (field):** Fatima at difficulty 3, teaches `az_func_deploy` on defeat
- **Developer Gym (leader):** Fatima at difficulty 5, with upgraded deck, gym mechanic active, awards the Serverless Emblem

When the player enters the Developer Gym and sees her:

> *"You again. Last time was a warm-up. A cold start, if you will. This time, no pre-provisioned instances."*

This is the only gym leader you fight before the gym. It is intentional and good storytelling.

---

### 6. Gym Entry: Walk Through the Door

- Player walks to the gym building and presses A at the door
- If the player has the **required badge count**, the door opens (e.g., Gym 3 requires 2 badges)
- If not: *"The door has an electronic lock. It reads: REQUIRED CLEARANCE: [N] EMBLEMS."*
- No "registration" — just enter and fight
- Badge requirement is stored in the gym data: `requiredBadges: 2`

---

### Data Shape — `src/data/gyms.js` (new file)



### Trainer data additions

Sub-leaders and apprentices use the existing trainer shape with new fields:



---

### Files Affected

| File | Change |
|---|---|
| `src/data/gyms.js` | **New file** — gym definitions |
| `src/data/trainers.js` | Add sub-leaders, apprentices, `gymRole`/`gymId` fields |
| `src/engine/BattleEngine.js` | Read `gymMechanic` from gym config, apply per-mechanic rules |
| `src/config.js` | Add `GYM_MECHANICS` constants (fail chance %, timer values, etc.) |
| `src/state/GameState.js` | Add `stats.gymReplays` |
| `src/scenes/BattleScene.js` | Render gym mechanic UI (timer overlay, fail animation, RBAC deny) |

---

### Follow-ups

- [ ] **New issue:** Define all apprentice trainer entries (16 apprentices across 8 gyms)
- [ ] **New issue:** Define sub-leader trainer entries (9 sub-leaders, including 2 for CTO gym)
- [ ] **New issue:** Serverless emblem needed — Fatima's gym should award one. Currently `emblems.js` has no serverless emblem. We have 8 emblem slots in GameState but only map to 7 domains + observability. Serverless is missing.
- [ ] **New issue:** `GymEngine.js` — new engine file to orchestrate the apprentice → sub-leader → leader flow, or extend BattleEngine with gym phase support?
- [ ] **New issue:** Gym puzzle maps — each gym needs a Tiled map with the mechanic visually represented

---

### Content Bible Update

Add to design doc under **Gyms**:
- Standard structure: 2 apprentices → 1 sub-leader → 1 leader
- CTO exception: 3 apprentices → 2 sub-leaders → 1 leader
- Each gym mechanic with exact numbers as specified above
- Gym replayability rules (postgame, +5 levels, 50% XP)
- Fatima dual-role clarification
- Door entry with badge gate mechanic
