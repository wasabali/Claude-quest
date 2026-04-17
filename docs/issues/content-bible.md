# [Content] Game Content Bible — Story, World, Characters, Items & Names

A single reference issue consolidating all content decisions scattered across #33–#50 and the existing data files. This is the **pick-and-choose menu** — nothing here is final until checked off. Items marked with ✅ are already in the codebase or confirmed in previous issues; everything else is a proposal.

---

## 1 · Story — Acts & Narrative Beats

### Act Structure (5 acts + prologue/epilogue)

| Act | Title Proposal | Summary | Status |
|-----|----------------|---------|--------|
| **Prologue** | "Hello World" | Professor Pedersen's lab. Pick a name, choose a starter deck (3 domains to pick from), learn basic commands. First battle: a `404 Not Found` incident on the campus Wi-Fi. | Partially defined |
| **Act 1** | "Push to Production" | Explore Localhost Town → Pipeline Pass → first gym. Deploy Old Margaret's bakery site. Learn CI/CD basics. End trigger: first successful prod deploy. | Partially defined |
| **Act 2** | "It Works on My Machine" | App goes viral. Cross into Staging Valley and Production Plains. THROTTLEMASTER's first interference (sabotages a pipeline). The 3:17am crisis moment. Second and third gyms. | Outlined in #34 |
| **Act 3** | "Legacy Migration" | OldCorp contracts NorCloud to migrate legacy services. Enter Jira Dungeon and the Kubernetes Colosseum. Discover `DO_NOT_TOUCH.exe`. Fourth and fifth gyms. Kristoffer starts acting suspicious. | Outlined in #34/#37 |
| **Act 4** | "Root Cause Analysis" | THROTTLEMASTER unmasked as Kristoffer's bitter ex-colleague. Sixth and seventh gyms. Architecture District and Security Vault. Reputation gates tighten. | Outlined in #34/#47 |
| **Finale** | "The Post-Mortem" | Eighth gym (The CTO, three-phase fight). Promoted to Principal Engineer. Credits roll over chiptune Azure theme. Post-credits: Azure Monitor pager buzz. | Outlined in #38 |
| **Evil Ending** | "Fork the Company" | At Shame ≥ 15, join THROTTLEMASTER. Run a rival consultancy. Post-credits: enormous Azure bill. | Outlined in #47 |

### Open story questions to resolve

- [x] What triggers act transitions — quest completion, gym count, or story flags? → **Story flag combinations** (quest complete + gym beaten). Automatic, no manual step. See `docs/resolutions/issue-34-act-transitions.md`.
- [x] Are there cutscenes between acts or just dialogue + world changes? → **Title card + 3-line narration** (DialogBox reuse, no new scene). NPC dialog pools keyed by `dialogByAct`. New NPCs appear per act.
- [ ] Does the player get a "point of no return" warning before the finale?
- [x] Is there post-game content after beating The CTO? → **Full post-game**: save preserved, gym rematches (+10 levels), Principal Engineer Mode encounter pools, missed quests available. See `docs/resolutions/issue-38-ending-postgame.md`.

### Resolved story decisions

- ✅ **Act transitions (#34):** Flag-triggered. `story.act` advances when `completedQuest` + gym flags match. Title card + 3-line narration. World changes via `dialogByAct`. Scripted viral encounter wave in Act 2. 3:17am forced sequence. See `docs/resolutions/issue-34-act-transitions.md`.
- ✅ **Endings (#38):** Three endings — *The Post-Mortem* (Shame < 10), *The Shadow Post-Mortem* (Shame 10–14, audit findings, minor-key credits), *Fork the Company* (Shame ≥ 15, join THROTTLEMASTER, "Principal Villain"). Post-credits interactive pager: "47 more alerts pending." See `docs/resolutions/issue-38-ending-postgame.md`.

---

## 2 · World — Regions & Locations

### Region Map (proposal — 12 main regions + 7 hidden)

| # | Region | Domain | Act | Gym? | Vibe | Status |
|---|--------|--------|-----|------|------|--------|
| 1 | **Localhost Town** | — | Prologue/1 | — | Starting village. Professor Pedersen's lab, Old Margaret's bakery, your apartment. Safe zone, no random encounters. | ✅ In data |
| 2 | **Pipeline Pass** | IaC | 1 | 1st gym | Mountain trail with CI/CD terminals. Failed builds spark as random encounters. | ✅ In data |
| 3 | **Staging Valley** | Cloud | 2 | — | A mirror of production that's slightly broken. Environment tokens required to enter. | Referenced |
| 4 | **Production Plains** | Cloud | 2 | 2nd gym | Wide open grassland with real traffic. High CPU and disk full encounters. | ✅ In data |
| 5 | **Jira Dungeon** | Observability | 3 | 3rd gym | Underground maze of tickets and sprint boards. Stale tickets attack you. | ✅ In data |
| 6 | **Shell Cavern** | Linux | 3 | — | Dark cave illuminated by terminal glow. Tux the Terminal Wizard's domain. | Referenced |
| 7 | **The Helm Repository** | Kubernetes | 3 | 4th gym | A library of charts and releases. Helm Hansen guards the stacks. | Referenced |
| 8 | **Kubernetes Colosseum** | Kubernetes | 3 | 5th gym | Amphitheatre where pods battle for resources. CrashLoopBackOff is the house champion. | ✅ In data |
| 9 | **Security Vault** | Security | 4 | 6th gym | Locked-down fortress. IAM checks at every door. | Referenced |
| 10 | **Architecture District** | Observability | 4 | 7th gym | City of whiteboards and UML diagrams. The Solutions Oracle sits at the centre. | Referenced |
| 11 | **Azure Town** | Cloud | 4 | — | Cloud portal come to life. Shops, certificate vendors, budget management. | Referenced |
| 12 | **The Cloud Console** | Cloud | Finale | 8th gym | Final area. The CTO's office at the top. | Referenced |

### Proposed additional locations (pick & choose)

| Location | Domain | Idea |
|----------|--------|------|
| **The Log Stream** | Observability | A river of scrolling logs. Fish for error messages. Side quest: find the one ERROR in 10,000 INFO lines. |
| **npm Registry Market** | Containers | Bazaar where you trade packages. Some vendors sell deprecated modules. Risk of supply-chain attack encounters. |
| **The Standby Zone** | Serverless | Everything is frozen until you interact with it. Cold start delays on every action. |
| **OldCorp Basement** | — | Act 3 dungeon. Legacy VB6 systems. `DO_NOT_TOUCH.exe` lives here. Flickering fluorescent lights. Smells of 2003. |
| **The War Room** | — | End-game area that opens during SEV1 incidents. Timer on screen. Multiple engineers NPC allies appear. |
| **Certificate Authority Island** | Security | Optional area. Solve crypto puzzles to earn credentials. |
| **DNS Swamp** | Linux | Everything resolves to the wrong address. Navigation is reversed/randomised. |
| **The Backlog Graveyard** | Observability | Side area off Jira Dungeon. Closed tickets come back as ghosts (re-opened bugs). |

### Hidden areas (from #48 — confirmed design)

| # | Area | Discovery Method | Outcast Trainer | Teaches |
|---|------|-----------------|-----------------|---------|
| H1 | The Server Graveyard | SSH into a "dead" terminal | Deprecated Dagfinn | `terraform destroy` |
| H2 | The node_modules Maze | Use the junk item instead of discarding | Privileged Petra | `docker run --privileged` |
| H3 | The /dev/null Void | Pipe to `/dev/null` 3× in one battle | The Null Pointer | `history -c` |
| H4 | The 3am Tavern | Real clock 02:57–03:05 | Rotating (Shame-gated) | Multiple |
| H5 | Deprecated Azure Region (West-EU-2) | Select greyed-out region from terminal | West-EU-2 Wilhelm | `az feature register --namespace Microsoft.Legacy` |
| H6 | DO_NOT_TOUCH.exe | Open it despite every NPC saying not to | — (notes only) | `EXEC xp_cmdshell` |
| H7 | THROTTLEMASTER's Workstation | Find all 6 above | — | Full backstory |

### Open world questions to resolve

- [x] How many maps total for MVP? → **3 maps for MVP** (Localhost Town, Pipeline Pass, Jira Dungeon Room 1). 22 total maps full game. See `docs/resolutions/issue-15-world-scope.md`.
- [x] Region transitions: edge-scroll, world map, or fast-travel terminals? → **Edge-scroll** + **Azure Terminal fast travel** (unlocked by visiting). See `docs/resolutions/issue-15-world-scope.md`.
- [x] Does the world change between acts? → **NPC `dialogByAct` pools** + new NPCs appear per act. No tile redraws for MVP. See `docs/resolutions/issue-34-act-transitions.md`.
- [ ] Are there day/night cycles or just the real-clock 3am Tavern trick? → **No day/night cycle**. Only the real-clock 3am Tavern trick.

### Resolved world decisions

- ✅ **DO_NOT_TOUCH.exe (#37):** Two-path quest (open = +1 shame + VB6 Billing Horror battle + `EXEC xp_cmdshell` learned; migrate = quiz + `legacy_migration_badge` from Dagny). OldCorp CTO closing line: "Can you also fix my home Wi-Fi?" — joke only, no mechanic. 7 environmental storytelling moments defined. See `docs/resolutions/issue-37-do-not-touch.md`.

---

## 3 · Gym Bosses — The Eight Leaders

### Proposed gym leader roster

| # | Gym Name | Leader Name (proposals) | Domain | Act | Signature Skill | Personality / Gimmick |
|---|----------|------------------------|--------|-----|-----------------|----------------------|
| 1 | **The Pipeline Dojo** | **Bjørn the Build Breaker** | IaC | 1 | `az pipelines run` | Breaks things on purpose to teach you to fix them. Pipeline Pass area. Apprentices: 2 junior DevOps. ✅ Exists |
| 2 | **The Uptime Arena** | **Captain Nines** (new) _or_ **The On-Call Champion** | Cloud | 2 | `blue-green deploy` | Obsessed with 99.999% uptime. Timer runs during the fight — must win within SLA. Production Plains area. |
| 3 | **The Sprint Sanctum** | **Scrum Siri** (new) _or_ **The Gantt Guardian** | Observability | 2 | `az monitor alert` | Tracks your moves on a kanban board. Gains power for each turn you "waste." Jira Dungeon area. |
| 4 | **The Container Yard** | **Docker Dag** (new) _or_ **The Image Inspector** | Containers | 3 | `docker build` | Fights using layered defences (like image layers). Each layer must be stripped. Helm Repository area. |
| 5 | **The Cluster Ring** | **The Kube-rnetes Master** | Kubernetes | 3 | `kubectl apply -f` | Pod respawns 3× before final defeat. Kubernetes Colosseum area. ✅ Exists |
| 6 | **The Vault Chamber** | **Ingrid the IAM Inspector** _or_ **The Zero-Trust Zealot** (new) | Security | 4 | `ssh-keygen` | You must authenticate before every attack (mini-challenge each turn). Security Vault area. ✅ Exists as trainer |
| 7 | **The Whiteboard Summit** | **The Solutions Oracle** _or_ **Architect Aleksander** (new) | Observability | 4 | `az monitor alert` | Multi-phase design review. You propose, they challenge. Architecture District area. ✅ Exists as trainer |
| 8 | **The Executive Suite** | **The CTO** | — (all domains) | Finale | Phase-dependent | Three phases: "Why is the site down?" (Cloud) / "Why does this cost so much?" (FinOps) / "Why didn't we just use Excel?" (Legacy). Adapts to your shame level. The Cloud Console area. |

### Gym mechanics (pick & choose per gym)

| Mechanic | Description | Proposed gym |
|----------|-------------|-------------|
| **SLA Timer** | Must win within X turns or reputation penalty | Uptime Arena |
| **Layered Defence** | Boss has multiple HP bars (like container image layers) | Container Yard |
| **Respawn** | Boss respawns X times with reduced HP | Cluster Ring |
| **Auth Challenge** | Mini-puzzle before each attack turn | Vault Chamber |
| **Kanban Tracker** | Boss gains +10% ATK for each turn you don't deal damage | Sprint Sanctum |
| **Review Board** | Must answer a design question correctly before damage applies | Whiteboard Summit |
| **Build Queue** | Boss queues 3 moves ahead — you see them and must counter | Pipeline Dojo |
| **Budget Burn** | Every turn costs budget; run out and you auto-lose | Executive Suite |

### Open gym questions to resolve

- [x] Resolve the Function Witch conflict → **Fatima is field trainer only.** "Developer Gym" is a stale reference — removed. The current 8-gym layout (Captain Nines leads Gym 2) supersedes it. See `docs/resolutions/issue-35-gym-leaders.md`.
- [x] How many apprentice fights before each leader? → **2 generic apprentices + 1 named sub-leader + boss.** Sub-leaders teach a skill on defeat. See `docs/resolutions/issue-17-gym-system.md`.
- [x] Can gyms be re-challenged after beating them? → **Post-game only.** All gym leaders offer harder rematches after the finale (+10 level equivalent). See `docs/resolutions/issue-38-ending-postgame.md`.
- [x] Do gym leaders have dialogue that changes based on reputation/shame? → **Yes.** Shame ≥ 5: wary pre-battle line. Shame ≥ 10: leader refuses to teach signature skill on defeat. See `docs/resolutions/issue-35-gym-leaders.md`.

### Resolved gym decisions

- ✅ **Gym leaders (#35):** All 8 now have personality, pre/post-battle dialog, sub-leaders, and mechanic configs. Legacy Monolith is a literal 1994 server rack (special incident boss in OldCorp Basement, communicates via BSOD, immune to Cloud/IaC/K8s). See `docs/resolutions/issue-35-gym-leaders.md`.

| # | Gym | Leader | Domain | Sub-leader |
|---|-----|--------|--------|------------|
| 1 | Pipeline Dojo | Bjørn the Build Breaker | IaC | Pipeline Per |
| 2 | Uptime Arena | Captain Nines | Cloud | SLA Signe |
| 3 | Sprint Sanctum | Scrum Siri | Observability | Story Point Søren |
| 4 | Container Yard | Docker Dag | Containers | Layer Lars |
| 5 | Cluster Ring | The Kube-rnetes Master | Kubernetes | Replica Set Ragnhild |
| 6 | Vault Chamber | Ingrid the IAM Inspector | Security | Firewall Frida |
| 7 | Whiteboard Summit | The Solutions Oracle | Observability | Architect Aleksander |
| 8 | Executive Suite | The CTO | All | (On-Call Champion as sub-leader) |

---

## 4 · Trainers — Field Engineers

### Good trainers (the ones who teach you)

| ID | Name | Domain | Location | Difficulty | Signature Skill | Status |
|----|------|--------|----------|------------|-----------------|--------|
| `ola_ops` | Ola the Ops Guy | Linux | Localhost Town | 1 | `systemctl restart` | ✅ |
| `tux_wizard` | Tux the Terminal Wizard | Linux | Shell Cavern | 2 | `grep logs` | ✅ |
| `fatima_witch` | Fatima the Function Witch | Serverless | Pipeline Pass | 3 | `blue-green deploy` | ✅ |
| `bjorn_breaker` | Bjørn the Build Breaker | IaC | Jira Dungeon | 2 | `az pipelines run` | ✅ |
| `ingrid_iam` | Ingrid the IAM Inspector | Security | Security Vault | 3 | `chmod fix` | ✅ |
| `kube_master` | The Kube-rnetes Master | Kubernetes | Kubernetes Colosseum | 5 | `kubectl apply -f` | ✅ |
| `helm_hansen` | Helm Hansen | Kubernetes | Helm Repository | 4 | `helm install` | ✅ |
| `oracle_alice` | The Solutions Oracle | Observability | Architecture District | 4 | `az monitor alert` | ✅ |

### Proposed new field trainers (pick & choose)

| ID | Name | Domain | Location | Difficulty | Signature Skill | Bio |
|----|------|--------|----------|------------|-----------------|-----|
| `lambda_lars` | Lambda Lars | Serverless | The Standby Zone | 2 | `az functionapp create` | "My functions start in 0.3 seconds. Yours?" |
| `docker_diana` | Docker Diana | Containers | npm Registry Market | 2 | `docker compose up` | "I containerise everything. Even my lunch." |
| `terraform_tore` | Terraform Tore | IaC | Staging Valley | 3 | `terraform plan` | "I never apply without a plan. Unlike some people." |
| `firewall_frida` | Firewall Frida | Security | Security Vault entrance | 2 | `az network nsg rule create` | "Nothing gets past me. Nothing." |
| `grafana_gerd` | Grafana Gerd | Observability | The Log Stream | 3 | `az monitor metrics list` | "If it's not on a dashboard, did it really happen?" |
| `ci_carl` | CI Carl | IaC | Pipeline Pass | 1 | `git commit` | "Always. Commit. Small." |
| `cloud_costas` | Cloud Costas | Cloud | Azure Town | 3 | `az vm create` | "I spin up VMs like they're going out of fashion. They are." |
| `nfs_nora` | NFS Nora | Linux | Shell Cavern | 3 | `mount` | "Everything is a file. Even you." |
| `devops_dave` | DevOps Dave | IaC | Pipeline Pass | 2 | `az devops configure` | "I automate the automation of automations." |
| `scale_set_sven` | Scale Set Sven | Cloud | Production Plains | 4 | `scale out` | "More replicas solve everything. Don't @ me." |

### Cursed trainers (outcast network — confirmed design)

| ID | Name | Vibe | Domain | Cursed Skill | Status |
|----|------|------|--------|-------------|--------|
| `force_pusher` | The Force Pusher | "Rules are for people who didn't write the code." | IaC | `git push --force` | ✅ |
| `hotfix_hakon` | Hotfix Håkon | "Sweating. 14 open tabs." | Cloud | `deploy directly to prod` | ✅ |
| `merge_magda` | Merge Magda | "Always rushing, never reviews PRs." | IaC | `merge without review` | ✅ |
| `root_whisperer` | The Root Whisperer | "Runs everything as root. Wears a cape." | Security | `sudo chmod 777 /` | ✅ |
| `kubectl_karen` | kubectl Karen | "I don't have time for manifests." | Kubernetes | `kubectl delete pod --all` | ✅ |
| `skip_sigrid` | Skip-Tests Sigrid | "Tests slow me down. Eyes twitch." | IaC | `--no-verify` | ✅ |
| `hardcode_henrik` | Hardcode Henrik | "Has API keys in commit history." | Security | `hardcode the secret` | ✅ |
| `rebase_reverend` | The Rebase Reverend | "Preaches rebase but uses it wrong." | IaC | `rebase -i HEAD~999` | ✅ |
| `rmrf_rune` | rm-rf Rune | "Smells of burnt servers." | Linux | `rm -rf /` | ✅ |
| `downtime_dealer` | The Downtime Dealer | "Maintenance windows are a myth." | Cloud | `restart prod without notice` | ✅ |

### Proposed new cursed trainers (pick & choose)

| ID | Name | Vibe | Domain | Cursed Skill Idea |
|----|------|------|--------|-------------------|
| `yolo_yaml` | YOLO Yaml Ylva | "Indentation? I use tabs AND spaces." | Kubernetes | `kubectl apply` with malformed YAML — hits everything randomly |
| `sudo_su_saga` | sudo su Saga | "I AM the admin." | Linux | `sudo su -` — gain full power for 1 turn but lose all defence |
| `env_var_erik` | .env Erik | "I commit .env files. Fight me." | Security | `git add .env` — instant credential leak, massive damage but triggers audit |
| `cron_catastrophe` | Cron Kristina | "*/1 * * * *" | Linux | Schedules an attack that repeats every turn — can't be stopped |
| `legacy_leif` | Legacy Leif | "This code has been running since 2006. Don't touch it." | Cloud | Summons legacy dependencies that debuff modern skills |

---

## 5 · Named NPCs — Non-Combat Characters

### Story NPCs

| Name | Role | Location | Act | Key Moments | Status |
|------|------|----------|-----|-------------|--------|
| **Professor Pedersen** | Mentor / Tutorial guide | Localhost Town (lab) | Prologue, Finale | Gives starter deck. Studies AZ-900. Reacts to shame with "disappointed look." Shows THROTTLEMASTER's notes change ending if given before Act 4. | Confirmed |
| **Kristoffer** | Player's boss at NorCloud AS | Roaming / office | All acts | Assigns main quests. Acts suspicious in Act 3. Revealed to know THROTTLEMASTER. | Confirmed |
| **THROTTLEMASTER** | Primary villain | Hidden / Act 2+ | 2–Finale | Sabotages pipelines. Unmasked as Kristoffer's ex-colleague from OmniCloud Corp. Real name starts with "K." Contacts player at Shame 7. Recruits at Shame 15. | Confirmed |
| **The CTO** | Final boss | The Cloud Console | Finale | Three-phase fight. Promotes player on victory. | Confirmed |
| **Old Margaret** | Quest giver | Localhost Town (bakery) | 1 | Bakery website keeps going down. First real quest. Follow-up dialogue after completion. | ✅ In data |

### Proposed new story NPCs (pick & choose)

| Name | Role | Location | Idea |
|------|------|----------|------|
| **Compliance Carina** | Azure Compliance Team lead | Azure Town / Finale | Arrests THROTTLEMASTER. Appears earlier as a friendly NPC who asks about your audit logs. Foreshadowing. |
| **The Intern** (Intern Ivan) | Comic relief / roaming | Everywhere | Appears in every region asking increasingly absurd questions. "What is a container?" → "What is a Kubernetes?" → "What is the cloud?" → "What is a computer?" Final question: "What is infrastructure?" |
| **Dagny the DBA** | OldCorp NPC | OldCorp Basement | Warns you about `DO_NOT_TOUCH.exe`. If you open it anyway, she panics. If you fix it properly, she gives you a rare item. |
| **SLA Signe** | SRE on-call engineer | Production Plains | Always stressed. Gives you the On-Call Phone item. Appears during Act 2 crisis. "You're on-call now. Good luck." |
| **Budget Björn** | FinOps analyst | Azure Town | Warns about cloud spend. Offers budget optimisation quests. Dramatically faints when you waste Azure credits. |
| **Vendor Viggo** | Shop NPC | Azure Town | Sells consumables and tools. Different stock per act. Suspiciously pushes "premium" items. |
| **The Rubber Duck** | Debug companion | Player inventory | A literal rubber duck. "Use" it in the overworld for a hint. Counts how many times you've consulted it. |

### Side quest NPCs (from #32 — need dialogue/mechanics)

| Name | Location | Quest Theme | Status |
|------|----------|-------------|--------|
| **Dev Dave** | Pipeline Pass | Flaky tests need fixing | Outlined, no dialogue |
| **Startup Steve** | Staging Valley | Storage full, app crashing | Outlined, no dialogue |
| **Nervous Nancy** | Production Plains | Data breach — incident response | Outlined, no dialogue |
| **Budget Barry** | Azure Town | Azure bill tripled overnight | Outlined, no dialogue |
| **Intern Ivan** | Roaming | "What is a container?" tutorial chain | Outlined, no dialogue |
| **Architect Alice** | Architecture District | Multi-step system design review | Outlined, no dialogue |

### Open NPC questions to resolve

- [x] Do NPCs move between locations as the story progresses? → **Yes, key story NPCs.** Kristoffer roams to relevant regions per act. Professor Pedersen does one-off scripted appearances. See `docs/resolutions/issue-34-act-transitions.md`.
- [x] Do NPC dialogues change based on reputation/shame level? → **Yes.** Shame reactions from personal NPCs only (Pedersen, Kristoffer, Ola, beaten gym leaders, cursed trainers). Reputation affects shop prices. See `docs/resolutions/issue-36-npc-reactivity.md`.
- [x] Can NPCs be re-talked-to for hints? → **Yes.** `reminderDialog` field on all quest NPCs, shorter re-explanation. See `docs/resolutions/issue-29-quest-system.md`.
- [ ] Is Kristoffer ever fightable? → **Optional confrontation battle in Act 4** (Architecture District) if player asks "Was it worth it?" — resolved in #34 but fight mechanics TBD.

### Resolved NPC decisions

- ✅ **NPC reactivity (#36):** All NPCs support `dialogByAct`, `followUpDialog`, `shameDialog` (threshold-keyed, personal NPCs only), `rematchDeck` (post-game), `techniqueUsedDialog` (cursed trainers). Rep ≥ 80 = −15% shop prices; rep < 40 = +15%; rep < 20 = refused service. Post-finale: all completed side-quest NPCs have a one-liner callback. See `docs/resolutions/issue-36-npc-reactivity.md`.
- ✅ **THROTTLEMASTER (#33):** Real name Karsten Ottesen. Dark hoodie + OmniCloud Corp lanyard (plot clue). Act 2 phantom battle (3 turns, can't be won). Two reveal paths: workstation notes (high-shame) + Kristoffer confession (everyone). Act 4 boss 2-phase fight. Low shame: fight + Compliance Carina arrest (played for laughs). Shame ≥ 10: option to let him go or join him. Recruitment via phantom battle dialog + direct message at Shame 7. See `docs/resolutions/issue-33-throttlemaster.md`.
- ✅ **Side quests (#32):** All 6 quests designed with 3-choice format and domain-appropriate wrong-answer penalties. Intern Ivan roams 5 acts (escalating questions). Architect Alice is a 4-stage chain (Blueprints v1–v3 key items). See `docs/resolutions/issue-32-side-quests.md`.

---

## 6 · Consumables & Items

### Current items (✅ in codebase)

| Item | Tab | Effect | Status |
|------|-----|--------|--------|
| Red Bull | Tools | Heal 30 HP | ✅ |
| Rollback Potion | Tools | Heal 20 HP | ✅ |
| Azure Credit Voucher | Tools | Restore 50 Budget | ✅ |
| Skip Tests Scroll | Tools | Bypass one skill check | ✅ |
| On-Call Phone | Tools | Apply on_call status | ✅ |
| SSH Key (Staging) | Key Items | Unlocks staging doors | ✅ |
| Staging Env Token | Key Items | Required for Staging Valley | ✅ |
| Terraform State | Key Items | "Don't touch it. Don't move it." | ✅ |
| Azure SP Cert | Credentials | Auth for Azure battles | ✅ |
| Cloud Cert | Credentials | Validates access level | ✅ |
| Outdated Runbook | Docs | +5 XP on read | ✅ |
| Incident Postmortem | Docs | +20 XP if last battle lost | ✅ |
| Root Password (sticky note) | Junk | Horrifying flavour text | ✅ |
| Mystery node_modules | Junk | Can't delete. 47,000 files. | ✅ |
| Stale PR | Junk | Open since 2019. | ✅ |

### Proposed new consumables — Healing

| Item | Tab | Effect | Source | Flavour |
|------|-----|--------|--------|---------|
| **Coffee (Black)** | Tools | Heal 15 HP | Shops, drops | "Tastes like 6am." |
| **Energy Drink (Monster)** | Tools | Heal 50 HP, applies `jittery` status (−10% accuracy for 2 turns) | Rare drop | "Your hands are shaking." |
| **Hot Chocolate** | Tools | Heal 40 HP | 3am Tavern only | "Warm. Comforting. Briefly." |
| **Full English Breakfast** | Tools | Full heal (HP + status clear) | Quest reward | "Beans, toast, and a clean build." |
| **Protein Bar** | Tools | Heal 25 HP | Shops | "Expired 2 months ago. Probably fine." |

### Proposed new consumables — Battle

| Item | Tab | Effect | Source | Flavour |
|------|-----|--------|--------|---------|
| **Stack Overflow Printout** | Tools | Reveal enemy domain + weakness | Drops | "The answer was from 2014. It still works." |
| **Feature Flag Toggle** | Tools | Disable one enemy skill for 2 turns | Shops | "Flip it. Ship it. Pray." |
| **Canary Token** | Tools | Take 50% damage from next hit | Quest reward | "The canary died so you don't have to." |
| **Load Balancer Cookie** | Tools | Redirect next attack to miss | Rare drop | "Session affinity: OFF." |
| **CI Green Badge** | Tools | +25% damage for next 3 turns | Quest reward | "✅ All checks passed." |
| **Rubber Duck** | Tools | Reveal a hint about current enemy | Shop (1 per act) | "You explain the problem. It quacks." |

### Proposed new consumables — Budget/Economy

| Item | Tab | Effect | Source | Flavour |
|------|-----|--------|--------|---------|
| **Azure Coupon Code** | Tools | Restore 100 Budget | Rare quest reward | "AZFREE100. Expired. Still works somehow." |
| **Reserved Instance Contract** | Tools | Reduce budget cost of next 5 skills by 50% | Shops (expensive) | "Commitment issues? Not anymore." |
| **Spot Instance Ticket** | Tools | One skill costs 0 budget but has 20% chance to be interrupted | Drops | "Cheap. Unreliable. Perfect." |
| **Cost Alert Suppressor** | Tools | Ignore budget drain for 3 turns | Quest reward (Budget Barry) | "You'll deal with the bill later." |

### Proposed key items (story progression)

| Item | Tab | Effect | Source |
|------|-----|--------|--------|
| **Pipeline Pass Badge** | Key Items | Access beyond Localhost Town | Beat gym 1 |
| **Production Clearance** | Key Items | Access Production Plains | Complete staging deployment |
| **OldCorp Keycard** | Key Items | Enter OldCorp Basement | Kristoffer gives in Act 3 |
| **THROTTLEMASTER's Notes** | Key Items | Changes ending if shown to Professor Pedersen | Found in hidden area H7 |
| **The Pager** | Key Items | Triggers random incident encounters anywhere | SLA Signe gives in Act 2 |
| **Admin Kubeconfig** | Key Items | Access Kubernetes Colosseum inner ring | Complete Helm Repository |
| **Architecture Review Stamp** | Key Items | Access The Cloud Console | Complete Architecture District |

### Proposed docs (readable for XP/lore)

| Item | Tab | Effect | Flavour |
|------|-----|--------|---------|
| **Well-Architected Framework** | Docs | +15 XP, reveals all domain matchups permanently | "The sacred text." |
| **THROTTLEMASTER's Blog Post** | Docs | +10 XP, lore about villain's motivation | "10 Reasons Your Cloud Is Wrong" |
| **The Original Commit Message** | Docs | +5 XP | "initial commit" — that's it. |
| **Kristoffer's Performance Review** | Docs | +10 XP, hints at THROTTLEMASTER connection | "Shows improvement. Questionable judgement." |
| **Deprecated API Changelog** | Docs | +5 XP | "Breaking changes: yes. Migration guide: no." |

### Proposed junk items (flavour)

| Item | Tab | Flavour |
|------|-----|---------|
| **Broken Jenkins Plugin** | Junk | "Version 0.0.1-alpha-SNAPSHOT-RC2. No documentation." |
| **USB Stick Labelled 'BACKUP'** | Junk | "Contains a single README.md that says 'TODO'." |
| **Conference Lanyard** | Junk | "KubeCon 2024. Still wearing it." |
| **Printed Email Thread** | Junk | "17 pages. Subject: 'Re: Re: Re: Re: Quick question'." |
| **Expired SSL Certificate** | Junk | "Valid until: yesterday." |
| **A Single YAML Tab** | Junk | "It's a tab character in a YAML file. It broke everything." |
| **Floppy Disk** | Junk | "1.44MB. Contains the original cloud." |

### Open item questions to resolve

- [ ] Are items bought with Budget (cloud credits) or a separate currency?
- [ ] Do shops exist? Where? (proposal: Azure Town main shop, plus vending machines in each region)
- [ ] Max inventory size per tab?
- [ ] Can items be traded with NPCs?
- [ ] Do consumables stack? (proposal: yes, max 99 per type)

---

## 7 · Naming Conventions & Themes

### Character naming rules (observed patterns)

| Category | Pattern | Examples |
|----------|---------|----------|
| **Good trainers** | Scandinavian first name + tech title | Ola the Ops Guy, Ingrid the IAM Inspector, Helm Hansen |
| **Cursed trainers** | Alliterative Scandinavian name + bad practice | Hotfix Håkon, Skip-Tests Sigrid, Merge Magda, Hardcode Henrik |
| **Gym leaders** | "The [Title]" format | The Kube-rnetes Master, The CTO, The Solutions Oracle |
| **Side quest NPCs** | Alliterative English name + role hint | Dev Dave, Budget Barry, Nervous Nancy, Startup Steve |
| **Story NPCs** | Realistic Scandinavian names | Professor Pedersen, Kristoffer |
| **Outcast trainers** | Scandinavian name + deprecated/dark tech ref | Deprecated Dagfinn, West-EU-2 Wilhelm, rm-rf Rune |

### Proposed naming guidelines

- **Trainers:** Keep the Scandinavian flavour — the game is set at NorCloud AS (Norwegian cloud consultancy). Mix in tech puns.
- **Locations:** Cloud/DevOps terminology made physical — `Pipeline Pass`, `Security Vault`, `Production Plains`. Should sound like real places a hiker would visit.
- **Items:** Real tool names where possible (`SSH Key`, `Terraform State`). Consumables get punny names (`Rollback Potion`, `Azure Credit Voucher`).
- **Encounters:** Real error messages or ops jargon (`CrashLoopBackOff`, `503 Service Unavailable`, `OOM Kill`).
- **Skills:** Actual CLI commands verbatim (`kubectl apply -f`, `docker build`, `git push --force`).

### Reputation titles (confirmed in #46)

| Reputation | Title |
|------------|-------|
| 80–100 | Distinguished Engineer |
| 60–79 | Competent Engineer |
| 40–59 | Adequate Engineer |
| 20–39 | Liability |
| 0–19 | Walking Incident |

### Shame titles (proposal — pick & choose)

| Shame | Title | Effect |
|-------|-------|--------|
| 0 | Clean Record | — |
| 1–2 | "It Was Like That When I Got Here" | First cursed trainer visible |
| 3–4 | Cowboy Coder | Trainers fight harder |
| 5–6 | The Shortcutter | 3am Tavern populated, full cursed trainer access |
| 7–9 | Person of Interest | THROTTLEMASTER contacts you |
| 10–14 | Shadow Engineer | Alternate ending accessible, Helm Hansen refuses to teach |
| 15+ | The Other Principal | Can join THROTTLEMASTER at final boss |

---

## 8 · Encounters — Incident Names

### Current encounters (✅ in data)

`npm install hang`, `503 Service Unavailable`, `Failed Pipeline`, `Merge Conflict`, `Port Conflict`, `Stale Ticket`, `Missing Acceptance Criteria`, `Blocked by QA`, `Scope Creep`, `Infinite Sprint`, `The Gantt Chart`, `High CPU`, `Disk Full`, `Production Incident`, `Runaway Process`, `SEV1 at 3am`, `CrashLoopBackOff`, `OOM Kill`, `Pending Pod`, `Evicted Node`, `RBAC Denied`, `The YAML Labyrinth`, `Missing Semicolon`

### Proposed new encounters (pick & choose)

| Name | Domain | Difficulty | Symptom | Location |
|------|--------|------------|---------|----------|
| **404 Not Found** | Cloud | 1 | "Page doesn't exist. Or does it?" | Localhost Town (tutorial) |
| **SSL Certificate Expired** | Security | 2 | "Users see a scary red padlock." | Production Plains |
| **DNS Propagation** | Linux | 3 | "Changes made 48 hours ago still not visible." | DNS Swamp |
| **Zombie Process** | Linux | 3 | "Process is dead but won't release its PID." | Shell Cavern |
| **Config Drift** | IaC | 3 | "Infrastructure doesn't match the code." | Staging Valley |
| **Cold Start Timeout** | Serverless | 2 | "Function takes 30 seconds to wake up." | The Standby Zone |
| **Azure Bill Spike** | Cloud | 4 | "Someone left 200 VMs running over the weekend." | Azure Town |
| **Leaked Secret** | Security | 4 | "API key committed to public repo 3 hours ago." | Security Vault |
| **Flaky Test** | IaC | 2 | "Passes locally, fails in CI. Always." | Pipeline Pass |
| **Memory Leak** | Containers | 3 | "RAM usage grows 1% every hour." | Kubernetes Colosseum |
| **Dependency Hell** | Containers | 3 | "Version A needs B≥2.0, version C needs B<2.0." | npm Registry Market |
| **The Infinite Redirect** | Cloud | 2 | "Page redirects to itself. Forever." | Production Plains |
| **Terraform State Lock** | IaC | 4 | "Someone left a lock. No one knows who." | Staging Valley |
| **The Phantom Alert** | Observability | 2 | "Alert fires every 5 minutes. Nothing is wrong." | The Log Stream |
| **Docker Image 4GB** | Containers | 2 | "The image is 4GB. It's a Hello World app." | npm Registry Market |

---

## 9 · THROTTLEMASTER — Villain Design ✅ RESOLVED

> See full resolution: `docs/resolutions/issue-33-throttlemaster.md`

**Real Name:** ✅ **Karsten Ottesen** — "Karsten was your colleague once. Now he's everyone's problem."

**Appearance:** ✅ Dark hoodie + OmniCloud Corp lanyard (plot clue for sharp-eyed players). Backlit terminal glow on face. Post-reveal: hood removed, just a tired guy with a coffee. 2-frame idle: shoulder slump → slightly less slump.

**Motivation:** ✅ Was passed over for promotion at OmniCloud despite being the best engineer. Promoted Kristoffer instead. Became disillusioned. "If the cloud can't be fair, I'll throttle everyone to my level."

**World presence:** ✅
- `/* THROTTLEMASTER WAS HERE */` terminal comments from Act 1
- Rate-limited encounters in tampered regions (enemy gets extra turn)
- Mid-battle text popup in tampered areas: "Your latency has been increased. — T"
- Brief ghostly 2-tile flicker sprite at Act 2 crisis scene
- Act 2: scripted 3-turn phantom battle (CANNOT be won — he disconnects)

**Reveal:** ✅ Two paths — high-shame players find his workstation notes (H7); everyone else gets Kristoffer's confession in Act 4 Architecture District.

**Act 4 boss:** ✅ 2-phase fight. Low shame: fight + Compliance Carina arrest (played for laughs). Shame ≥ 10: option to let him go or join him.

**Key line:** "If the cloud can't be fair, I'll throttle everyone to my level."

---

## 10 · Starter Deck Proposals

The player picks their starting domain in the prologue. Each choice gives a different starting deck of 3 skills.

| Starter | Skills | Vibe |
|---------|--------|------|
| **Linux Starter** | `systemctl restart`, `grep logs`, `blame DNS` | "You chose the terminal. Bold." |
| **Cloud Starter** | `az webapp deploy`, `feature flag`, `blue-green deploy` | "The cloud calls. Your wallet weeps." |
| **IaC Starter** | `git revert`, `az pipelines run`, `bicep deploy` | "Infrastructure as Code. What could go wrong?" |

### Open starter questions

- [ ] Three starters or more? (proposal: 3, one per classic RPG archetype — defensive/offensive/balanced)
- [ ] Does your starter choice affect the early game difficulty curve?
- [ ] Are starter skills permanently in your deck or can they be swapped out?

---

## Summary of Conflicts — Resolved ✅

| Conflict | Resolution |
|----------|-----------|
| **Fatima the Function Witch** vs **Developer Gym Leader** | ✅ **"Developer Gym" is a stale entry — removed.** Fatima stays as field trainer in Pipeline Pass. Captain Nines leads Gym 2 (Uptime Arena). |
| **Bjørn's domain** | ✅ **`iac`** — confirmed. He's a DevOps/CI-CD character; IaC is the closest domain. |
| **The Solutions Oracle's domain** | ✅ **Observability** — the Architecture District gym (Gym 7) is an observability/cross-domain design review. The "Review Board" mechanic (design question trivia) reflects this. |
| **On-Call Champion vs The CTO** | ✅ **The CTO is the final boss (Gym 8). On-Call Champion is the sub-leader.** |
| **Budget = Azure Credits?** | ✅ **Yes** — single currency, displayed as "💰 Budget" in HUD. See `docs/resolutions/issue-14-economy.md`. |
| **Legacy Monolith** | ✅ **A literal 1994 server rack.** Special incident boss in OldCorp Basement. Communicates via BSOD. Immune to Cloud/IaC/K8s. Not a gym — special Act 3 encounter. |

---

## References

Related issues: #33 #34 #35 #36 #37 #38 #41 #42 #43 #44 #45 #46 #47 #48 #50

Data files: `src/data/trainers.js` · `src/data/skills.js` · `src/data/items.js` · `src/data/encounters.js` · `src/data/quests.js` · `src/data/emblems.js` · `src/data/story.js`
