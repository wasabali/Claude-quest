# Encounters

Random encounters happen as you explore the world. Each region has its own **encounter pool** divided by rarity. You'll face incidents — technical problems that need solving before the SLA timer runs out.

---

## How Encounters Work

1. As you move through a region, there's a chance of triggering a random encounter
2. The encounter is drawn from the region's pool based on rarity weights:
   - **Common:** 70% chance
   - **Rare:** 25% chance
   - **Cursed:** 5% chance (only if the pool has cursed encounters)
3. You enter battle against the incident
4. The incident shows **symptoms** — you see what's wrong but not the root cause
5. Use an Observability skill to reveal the **domain** — then attack with a matching domain for ×2 damage
6. Resolve it before the **SLA timer** hits 0

---

## Encounter Pools by Region

### Pipeline Pass

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | npm install hang | 🐳 Containers | 25 | 4 | ⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Common | Failed Pipeline | 🏗️ IaC | 35 | 4 | ⭐⭐ |
| Rare | Merge Conflict | 🏗️ IaC | 32 | 4 | ⭐⭐ |
| Rare | Port Conflict | 🐧 Linux | 28 | 4 | ⭐⭐ |

### Jira Dungeon

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ |
| Common | Missing Acceptance Criteria | 🏗️ IaC | 34 | 5 | ⭐⭐ |
| Common | Blocked by QA | 📊 Observability | 36 | 4 | ⭐⭐ |
| Rare | Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ |
| Rare | Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ |
| Cursed | The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ |

### Production Plains

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | High CPU | ☁️ Cloud | 35 | 4 | ⭐⭐ |
| Common | Disk Full | 🐧 Linux | 34 | 4 | ⭐⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Rare | Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

### Kubernetes Colosseum

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | CrashLoopBackOff | ☸️ Kubernetes | 38 | 4 | ⭐⭐⭐ |
| Common | OOM Kill | 🐳 Containers | 40 | 4 | ⭐⭐⭐ |
| Common | Pending Pod | ☸️ Kubernetes | 37 | 4 | ⭐⭐⭐ |
| Rare | Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ |
| Rare | RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ |
| Cursed | The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ |

### The 3am Tavern

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Merge Conflict | 🏗️ IaC | 32 | 4 | ⭐⭐ |
| Common | Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ |
| Rare | Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

### Localhost Town

No random encounters — Localhost Town is a safe zone. Enjoy it while it lasts.

---

## All Incidents

| Incident | Domain | HP | SLA Turns | Difficulty | Symptom |
|---|---|---|---|---|---|
| npm install hang | 🐳 Containers | 25 | 4 | ⭐ | Install stuck at idealTree forever. |
| 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ | The app is returning 503 errors. |
| Failed Pipeline | 🏗️ IaC | 35 | 4 | ⭐⭐ | CI pipeline fails on deployment step. |
| Merge Conflict | 🏗️ IaC | 32 | 4 | ⭐⭐ | Branches conflict during release merge. |
| Port Conflict | 🐧 Linux | 28 | 4 | ⭐⭐ | Service cannot bind to required port. |
| Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ | Build fails on a tiny syntax typo. |
| Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ | A critical ticket has no owner for weeks. |
| Missing Acceptance Criteria | 🏗️ IaC | 34 | 5 | ⭐⭐ | Requirements are ambiguous and untestable. |
| Blocked by QA | 📊 Observability | 36 | 4 | ⭐⭐ | Release is blocked on flaky test evidence. |
| High CPU | ☁️ Cloud | 35 | 4 | ⭐⭐ | CPU usage pinned near 100% in production. |
| Disk Full | 🐧 Linux | 34 | 4 | ⭐⭐ | Node storage is exhausted by logs. |
| Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ | A small fix became a full rewrite. |
| Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ | Deadlines move but tasks never finish. |
| CrashLoopBackOff | ☸️ Kubernetes | 38 | 4 | ⭐⭐⭐ | Pods repeatedly crash after startup. |
| OOM Kill | 🐳 Containers | 40 | 4 | ⭐⭐⭐ | Containers terminated for memory overuse. |
| Pending Pod | ☸️ Kubernetes | 37 | 4 | ⭐⭐⭐ | Pods pending with no schedulable nodes. |
| Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ | A process spawns uncontrollably. |
| Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ | Users report broad outage after deploy. |
| Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ | Critical workloads evicted from node pressure. |
| RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ | Service account lacks cluster permission. |
| The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ | A cursed project plan absorbs all progress. |
| SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ | Pager explodes with a critical outage. |
| The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ | Nested manifests create an impossible maze. |

---

## SLA Timer Tips

- **SLA 5:** Plenty of time. Diagnose, plan, execute.
- **SLA 4:** Comfortable. One turn to diagnose, three to resolve.
- **SLA 3:** Tight. Diagnose fast or guess the domain.
- **SLA 2:** Dangerous. You basically need to know the domain already.

Use `PagerDuty acknowledge` to pause the SLA timer for 2 turns — it can save you in tight situations.

---

*"Pager explodes with a critical outage." — SEV1 at 3am symptom text*
