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
| Common | Flaky CI Pipeline | ☁️ Cloud | 36 | 4 | ⭐⭐ |
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
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
| Rare | Leaked Secret | 🔒 Security | 35 | 3 | ⭐⭐⭐ |
| Cursed | The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ |

### Three Am Tavern

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Merge Conflict | 🏗️ IaC | 32 | 4 | ⭐⭐ |
| Common | Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ |
| Common | NullPointerException | 🐧 Linux | 30 | 4 | ⭐⭐ |
| Rare | Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 42 | 3 | ⭐⭐⭐ |
| Rare | Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

---

## All Encounters

| Name | Domain | HP | SLA | Difficulty | Optimal Fix |
|---|---|---|---|---|---|
| npm install hang | 🐳 Containers | 25 | 4 | ⭐ | `kubectl rollout restart` |
| 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ | `az webapp deploy` |
| Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ | `az pipelines run` |
| Failed Pipeline | 🏗️ IaC | 35 | 4 | ⭐⭐ | `az pipelines run` |
| Merge Conflict | 🏗️ IaC | 32 | 4 | ⭐⭐ | `git revert` |
| Port Conflict | 🐧 Linux | 28 | 4 | ⭐⭐ | `kill -9` |
| Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ | `grep "ERROR" /var/log/*` |
| Missing Acceptance Criteria | 🏗️ IaC | 34 | 5 | ⭐⭐ | `terraform plan` |
| Blocked by QA | 📊 Observability | 36 | 4 | ⭐⭐ | `grep "ERROR" /var/log/*` |
| High CPU | ☁️ Cloud | 35 | 4 | ⭐⭐ | `az scale out` |
| Disk Full | 🐧 Linux | 34 | 4 | ⭐⭐ | `kill -9` |
| Flaky CI Pipeline | ☁️ Cloud | 36 | 4 | ⭐⭐ | `az pipelines run` |
| NullPointerException | 🐧 Linux | 30 | 4 | ⭐⭐ | `grep "ERROR" /var/log/*` |
| Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ | `feature flag` |
| Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ | `az functionapp deploy` |
| Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ | `kill -9` |
| CrashLoopBackOff | ☸️ Kubernetes | 38 | 4 | ⭐⭐⭐ | `kubectl rollout restart` |
| OOM Kill | 🐳 Containers | 40 | 4 | ⭐⭐⭐ | `kubectl scale --replicas=10` |
| Pending Pod | ☸️ Kubernetes | 37 | 4 | ⭐⭐⭐ | `kubectl scale --replicas=10` |
| Azure Bill Spike | ☁️ Cloud | 42 | 3 | ⭐⭐⭐ | `cost optimization` |
| Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ | `terraform apply` |
| Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ | `az functionapp deploy` |
| Leaked Secret | 🔒 Security | 35 | 3 | ⭐⭐⭐ | `vault kv rotate` |
| The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ | `terraform apply` |
| Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ | `blue-green deploy` |
| Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ | `kubectl drain node` |
| RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ | `chmod 644` |
| SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ | — |
| The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ | `helm upgrade` |

---

*Auto-generated from `src/data/encounters.js` by `scripts/generate-wiki.js`*
