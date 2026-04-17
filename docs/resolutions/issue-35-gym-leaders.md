# Resolution: Issue #35 — Gym Leaders Characterisation

> Cross-reference: `docs/issues/content-bible.md §3`, `src/data/trainers.js`

---

## Context Gathered

- Content bible §3: 8 gym leaders proposed with names, domains, and mechanics. 6 have no personality.
- Confirmed: Fatima the Function Witch is already a field trainer in `trainers.js`. The content bible lists the conflict and proposes "same character" as Option A.
- Bjørn the Build Breaker is `iac` domain in `trainers.js`, confirmed as Gym 1 leader at Pipeline Dojo.
- Graph report: `EmblemScene` is the most connected node (32 edges) — gym rewards (emblems) ripple through many systems.
- The "Legacy Monolith" is ambiguous — name implies an object, not a person.

---

## Ideas Generated

**Q5 — The Function Witch Conflict**

1. **Option A: Fatima IS the gym leader** — field trainer encounter in Pipeline Pass foreshadows the gym fight. Players meet her, she teaches `blue-green deploy`, then later the gym door says "The Function Witch — Gym Leader." Surprise + satisfaction.
2. **Option B: Different characters, rename one** — creates confusion in a small cast.
3. **Option C: Remove the Developer Gym, Fatima stays field trainer** — loses a gym, weakens Act 1–2 progression.

**Winner: Option C.** Fatima is a field trainer only. The Developer Gym is removed from scope — it's been replaced by the current 8-gym layout. Fatima teaches `blue-green deploy` in Pipeline Pass; Captain Nines leads the Uptime Arena (Gym 2). The foreshadow-then-fight concept lives on: players meet Fatima, learn her technique, and later face Captain Nines who has adopted it.

**Q8 — What is the Legacy Monolith?**

1. **A literal server rack NPC** — sprite is a hulking beige tower from 1994. 2-frame animation: idle fan spin. Speaks only in error codes. "FATAL ERROR 0x0000007B. KERNEL_DATA_INPAGE_ERROR." It's terrifying. It's the funniest idea in this document.
2. **A human NPC named "Monty the Monolith"** — too on the nose, loses the horror.
3. **An incident-type encounter, not an NPC at all** — no personality, just a difficult fight.

**Winner: Option 1.** The Legacy Monolith is a server rack. It is a special incident boss — **not a gym leader and not in the gym progression**. It does not award an emblem. It cannot be reasoned with. It communicates exclusively in Windows XP error dialogs. Defeating it drops the `oldcorp_keycard` key item required to access `DO_NOT_TOUCH.exe`. This is peak Cloud Quest.

**Q1–Q4 — The six unnamed leaders**

The content bible already maps gym leaders to names/mechanics. The gap is personality. Here are the confirmed leaders with full characterisation:

---

## Full Gym Leader Roster (Final)

### Gym 1 — The Pipeline Dojo (IaC, Act 1, Pipeline Pass)
**Leader: Bjørn the Build Breaker**
- **Vibe:** Cheerful chaos agent. Breaks things to teach you to fix them. Has never merged to main without at least one broken test — it's his pedagogy.
- **Pre-battle:** "You want to learn? First I'll show you how badly things can fail."
- **Post-defeat:** "You fixed it in 3 tries. I usually need 7. You might be better than me."
- **Sub-leader:** **Pipeline Per** (junior DevOps, 2 apprentices before him)
- **Mechanic:** Build Queue — telegraphs 3 moves ahead (you see what he'll do)
- **Signature skill:** `az pipelines run`
- **Emblem reward:** Pipeline Emblem 🏗️

---

### Gym 2 — The Uptime Arena (Cloud, Act 2, Production Plains)
**Leader: Captain Nines**
- **Vibe:** Obsessive SLA devotee. Five nines is the floor, not the ceiling. Wears a pager like a medal. Actually enjoys being on-call.
- **Pre-battle:** "99.999% uptime. That's my religion. Can you match it?"
- **Post-defeat:** "…You actually won within SLA. I respect that."
- **Sub-leader:** **SLA Signe** *(same character who gives the On-Call Phone in Act 2 — she guards the gym)*
- **Mechanic:** SLA Timer — must win within 8 turns or −15 rep
- **Signature skill:** `blue-green deploy`
- **Emblem reward:** Cloud Emblem ☁️

---

### Gym 3 — The Sprint Sanctum (Observability, Act 2/3, Jira Dungeon)
**Leader: Scrum Siri**
- **Vibe:** Methodological fundamentalist. Tracks everything on a kanban board during the fight. Gains +5 ATK for every turn you don't deal damage ("Not delivering value?"). Considers standing up while you sit a power move.
- **Pre-battle:** "Let's time-box this fight to 14 minutes. That's the sprint."
- **Post-defeat:** "Fine. The velocity data supports your win. I'll update the board."
- **Sub-leader:** **Story Point Søren** (estimates every enemy HP before fighting it)
- **Mechanic:** Kanban Tracker — +5 ATK per idle turn
- **Signature skill:** `az monitor alert`
- **Emblem reward:** (sprint/jira themed, observability domain)

---

### Gym 4 — The Container Yard (Containers, Act 3, Helm Repository)
**Leader: Docker Dag**
- **Vibe:** Perfectionist image builder. Prides himself on minimal, efficient containers. Disgusted by bloat. Will tell you his image is 12MB — unprompted.
- **Pre-battle:** "My image is 12 megabytes. Scratch-based. Distroless. Perfect. Let's see yours."
- **Post-defeat:** "…Your build times are better than mine. I don't want to talk about it."
- **Sub-leader:** **Layer Lars** (fights with a 4GB ubuntu-based image — a cautionary tale)
- **Mechanic:** Layered Defence — 3 HP bars (like image layers), each strips an 'optimisation'
- **Signature skill:** `docker build`
- **Emblem reward:** Container Emblem 🐳

---

### Gym 5 — The Cluster Ring (Kubernetes, Act 3, Kubernetes Colosseum)
**Leader: The Kube-rnetes Master**
- **Vibe:** *(Already exists in data)* — Stoic. Speaks in YAML. Pod respawns 3 times.
- **Pre-battle:** "A pod is not dead until its restartPolicy says so."
- **Post-defeat:** "You have achieved desired state."
- **Sub-leader:** **Replica Set Ragnhild**
- **Mechanic:** Respawn — boss returns 3× at 50% HP, different domain each time
- **Signature skill:** `kubectl apply -f`
- **Emblem reward:** Helm Emblem ☸️

---

### Gym 6 — The Vault Chamber (Security, Act 4, Security Vault)
**Leader: Ingrid the IAM Inspector** *(already exists in trainers.js)*
- **Vibe:** Zero-trust zealot. Trusts nothing. Requires multi-factor auth before every single action. Has denied access to her own reflection.
- **Pre-battle:** "Authenticate first. I'll wait. I have time. I have logs."
- **Post-defeat:** "Access granted. Your policies are… acceptable. Barely."
- **Sub-leader:** **Firewall Frida** *(already proposed in content bible — field trainer at vault entrance becomes sub-leader)*
- **Mechanic:** Auth Challenge — before each attack, must pick the correct IAM action (3-choice, 1 wrong = turn wasted)
- **Signature skill:** `ssh-keygen`
- **Emblem reward:** Vault Emblem 🔒

---

### Gym 7 — The Whiteboard Summit (Observability/cross-domain, Act 4, Architecture District)
**Leader: The Solutions Oracle** *(already exists in trainers.js)*
- **Vibe:** Sees every system as a whiteboard problem. Never gives a direct answer — always asks a clarifying question back. Will draw a diagram mid-battle.
- **Pre-battle:** "Before we begin — what are your non-functional requirements?"
- **Post-defeat:** "Good. You knew the answer. You just needed to hear yourself say it."
- **Sub-leader:** **Architect Aleksander** *(alternative name from content bible)*
- **Mechanic:** Review Board — before damage applies, must answer a design trivia question correctly
- **Signature skill:** `az monitor alert`
- **Emblem reward:** SRE Emblem 📊

---

### Gym 8 — The Executive Suite (All domains, Finale, The Cloud Console)
**Leader: The CTO**
- *(Fully designed in Issue #38 resolution)*
- **Emblem reward:** FinOps Emblem 💰

---

### The Legacy Monolith — Special Encounter (Act 3, OldCorp Basement)
**Not a gym leader — a special incident boss.**
- A 1994 server rack. Windows XP error dialogs. Still running VB6.
- Communicates via BSOD error codes. Never talks. Just BSODs.
- Defeating it is required to access `DO_NOT_TOUCH.exe`.
- No emblem. Drops: `oldcorp_keycard` key item.
- Special mechanic: immune to Cloud, IaC, Kubernetes skills. Only responds to Linux and Security domain skills ("the old ways").

---

### Function Witch Conflict — Resolved ✅
**Final ruling:** Fatima is a field trainer only. The "Developer Gym" is removed from scope — it's been replaced by the current 8-gym layout. Fatima teaches `blue-green deploy` in Pipeline Pass; Captain Nines leads the Uptime Arena. The old reference to "The Function Witch" as gym leader is a stale entry. Close it.

---

### Gym apprentices — named or generic?
**Mix:** Each gym has 2 generic apprentice fights (short dialog, no name, "Apprentice Engineer A") and 1 named sub-leader (who does teach a skill on defeat). The named sub-leaders are listed above. They don't recur in the story — they're gym-specific characters.

### Gym leaders change dialog based on shame?
**Yes**, at two thresholds:
- Shame ≥ 5: leader adds a wary line before battle ("I've heard about you…")
- Shame ≥ 10: leader refuses to teach their signature skill on defeat ("You win. But I won't teach someone like you.")

---

## Data Shape

```js
// src/data/trainers.js — gym leader entry pattern
captain_nines: {
  id: 'captain_nines',
  name: 'Captain Nines',
  domain: 'cloud',
  role: 'gym_leader',
  gym: 'uptime_arena',
  gymNumber: 2,
  difficulty: 4,
  signatureSkill: 'blue_green_deploy',
  emblemReward: 'cloud',
  mechanic: 'sla_timer',
  mechanicConfig: { turnLimit: 8, repPenalty: 15 },
  preBattleDialog: ["99.999% uptime.", "That's my religion.", "Can you match it?"],
  postDefeatDialog: ["You actually won within SLA.", "I respect that."],
  postDefeatDialog_highShame: ["You win.", "But I won't teach a cursed engineer.", "Leave."],
  preBattleDialog_highShame: ["I've heard about you…", "Keep it clean in my arena."],
  subLeader: 'sla_signe',
  apprenticeCount: 2,
},
```

## Files Affected

- `src/data/trainers.js` — add gym leader entries for Bjørn (update role), Captain Nines, Scrum Siri, Docker Dag, sub-leaders
- `src/data/story.js` — Legacy Monolith as special scripted encounter
- `src/data/encounters.js` — Legacy Monolith encounter entry
- `src/config.js` — add `GYM_SHAME_THRESHOLDS` for teach-refusal behaviour

## Follow-ups

- Architect Alice's domain needs a final ruling (observability vs cross-domain)
- The Solutions Oracle vs Architect Aleksander: pick one name for Gym 7 leader
- Legacy Monolith battle mechanic details (immune domains, special BSOD attack)

## Content Bible Update

> ✅ **Gym leaders (#35):**
> - Function Witch conflict resolved: Fatima is field trainer only; "Developer Gym" is a stale entry, removed.
> - Legacy Monolith: a literal 1994 server rack. Special incident boss in OldCorp Basement. Communicates via BSOD. Immune to Cloud/IaC/K8s, vulnerable to Linux/Security only.
> - All 8 gym leaders now have personality, pre/post-battle dialog, sub-leaders, and mechanic configs.
> - Gym apprentices: 2 generic + 1 named sub-leader per gym. Sub-leaders teach a skill on defeat.
> - Shame ≥ 5: leaders add wary pre-battle line. Shame ≥ 10: leaders refuse to teach signature skill.
