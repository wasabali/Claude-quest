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

### Localhost Town

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | 404 Not Found | ☁️ Cloud | 20 | 5 | ⭐ |
| Common | Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ |
| Common | Port Conflict | 🐧 Linux | 28 | 4 | ⭐⭐ |
| Rare | Failed Pipeline | 🏗️ IaC | 35 | 4 | ⭐⭐ |
| Rare | npm install hang | 🐳 Containers | 25 | 4 | ⭐ |

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

### Jira Dungeon 1

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ |
| Common | Missing Acceptance Criteria | 🏗️ IaC | 34 | 5 | ⭐⭐ |
| Common | Blocked by QA | 📊 Observability | 36 | 4 | ⭐⭐ |
| Rare | Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ |

### Jira Dungeon 2

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Flaky CI Pipeline | ☁️ Cloud | 36 | 4 | ⭐⭐ |
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ |
| Rare | Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ |
| Rare | Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ |

### Jira Dungeon 3

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Missing Acceptance Criteria | 🏗️ IaC | 34 | 5 | ⭐⭐ |
| Rare | Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ |
| Cursed | The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ |

### Azure Town

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |
| Common | The Infinite Redirect | ☁️ Cloud | 30 | 4 | ⭐⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Rare | Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ |
| Rare | Terraform State Lock | 🏗️ IaC | 45 | 3 | ⭐⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

### Cloud Console 1

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Flaky CI Pipeline | ☁️ Cloud | 36 | 4 | ⭐⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |

### Cloud Console 2

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |
| Rare | Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ |

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
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |
| Rare | Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

### Server Graveyard

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Zombie Process | 🐧 Linux | 28 | 4 | ⭐⭐⭐ |
| Common | Disk Full | 🐧 Linux | 34 | 4 | ⭐⭐ |
| Common | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Rare | Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ |
| Rare | Memory Leak | 🐳 Containers | 42 | 3 | ⭐⭐⭐ |

### Node Modules Maze

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Dependency Hell | 🐳 Containers | 38 | 4 | ⭐⭐⭐ |
| Common | npm install hang | 🐳 Containers | 25 | 4 | ⭐ |
| Common | Docker Image 4GB | 🐳 Containers | 35 | 4 | ⭐⭐ |
| Rare | Memory Leak | 🐳 Containers | 42 | 3 | ⭐⭐⭐ |
| Rare | Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ |
| Cursed | The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ |

### Dev Null Void

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | The Phantom Alert | 📊 Observability | 25 | 5 | ⭐⭐ |
| Common | NullPointerException | 🐧 Linux | 30 | 4 | ⭐⭐ |
| Common | Zombie Process | 🐧 Linux | 28 | 4 | ⭐⭐⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Rare | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |

### Deprecated Azure Region

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |
| Rare | Terraform State Lock | 🏗️ IaC | 45 | 3 | ⭐⭐⭐⭐ |
| Cursed | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |

### Staging Valley

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Terraform State Lock | 🏗️ IaC | 45 | 3 | ⭐⭐⭐⭐ |
| Common | Failed Pipeline | 🏗️ IaC | 35 | 4 | ⭐⭐ |
| Rare | Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |

### Oldcorp Basement

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Disk Full | 🐧 Linux | 34 | 4 | ⭐⭐ |
| Common | Zombie Process | 🐧 Linux | 28 | 4 | ⭐⭐⭐ |
| Rare | The Legacy Monolith | 🎲 Random | 200 | null | ⭐⭐⭐⭐⭐ |
| Cursed | The VB6 Billing Horror | 🐧 Linux | 80 | 5 | ⭐⭐⭐⭐ |

### Shell Cavern

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Zombie Process | 🐧 Linux | 28 | 4 | ⭐⭐⭐ |
| Common | DNS Propagation | 🐧 Linux | 30 | 4 | ⭐⭐⭐ |
| Common | Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Rare | NullPointerException | 🐧 Linux | 30 | 4 | ⭐⭐ |

### Helm Repository

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | Pending Pod | ☸️ Kubernetes | 37 | 4 | ⭐⭐⭐ |
| Common | CrashLoopBackOff | ☸️ Kubernetes | 38 | 4 | ⭐⭐⭐ |
| Common | OOM Kill | 🐳 Containers | 40 | 4 | ⭐⭐⭐ |
| Rare | The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ |
| Rare | RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ |

### Security Vault

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | SSL Certificate Expired | 🔒 Security | 32 | 4 | ⭐⭐ |
| Common | Leaked Secret | 🔒 Security | 35 | 3 | ⭐⭐⭐ |
| Common | RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ |
| Rare | The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ |
| Rare | Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ |

### Architecture District

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | The Phantom Alert | 📊 Observability | 25 | 5 | ⭐⭐ |
| Common | Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ |
| Common | Stale Ticket | 📊 Observability | 30 | 5 | ⭐⭐ |
| Rare | Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ |
| Rare | Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ |

### The Cloud Console

| Rarity | Encounter | Domain | HP | SLA | Difficulty |
|---|---|---|---|---|---|
| Common | High CPU | ☁️ Cloud | 35 | 4 | ⭐⭐ |
| Common | Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ |
| Common | 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ |
| Rare | SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ |
| Rare | Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ |
| Cursed | The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ |

---

## All Encounters

| Name | Domain | HP | SLA | Difficulty | Optimal Fix |
|---|---|---|---|---|---|
| THROTTLEMASTER | 🎲 Random | 9999 | 3 |  | — |
| npm install hang | 🐳 Containers | 25 | 4 | ⭐ | `kubectl rollout restart` |
| 503 Service Unavailable | ☁️ Cloud | 30 | 4 | ⭐ | `az webapp deploy` |
| Missing Semicolon | 🏗️ IaC | 26 | 5 | ⭐ | `az pipelines run` |
| 404 Not Found | ☁️ Cloud | 20 | 5 | ⭐ | `az webapp deploy` |
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
| SSL Certificate Expired | 🔒 Security | 32 | 4 | ⭐⭐ | `vault kv rotate` |
| Cold Start Timeout | ⚡ Serverless | 34 | 4 | ⭐⭐ | `az functionapp deploy` |
| The Infinite Redirect | ☁️ Cloud | 30 | 4 | ⭐⭐ | `az webapp deploy` |
| The Phantom Alert | 📊 Observability | 25 | 5 | ⭐⭐ | `grep "ERROR" /var/log/*` |
| Docker Image 4GB | 🐳 Containers | 35 | 4 | ⭐⭐ | `docker build` |
| Scope Creep | ☁️ Cloud | 40 | 4 | ⭐⭐⭐ | `feature flag` |
| Infinite Sprint | ⚡ Serverless | 42 | 4 | ⭐⭐⭐ | `az functionapp deploy` |
| Runaway Process | 🐧 Linux | 44 | 3 | ⭐⭐⭐ | `kill -9` |
| CrashLoopBackOff | ☸️ Kubernetes | 38 | 4 | ⭐⭐⭐ | `kubectl rollout restart` |
| OOM Kill | 🐳 Containers | 40 | 4 | ⭐⭐⭐ | `kubectl scale --replicas=10` |
| Pending Pod | ☸️ Kubernetes | 37 | 4 | ⭐⭐⭐ | `kubectl scale --replicas=10` |
| Config Drift | 🏗️ IaC | 44 | 4 | ⭐⭐⭐ | `terraform apply` |
| Cold Start Cascade | ⚡ Serverless | 38 | 3 | ⭐⭐⭐ | `az functionapp deploy` |
| Leaked Secret | 🔒 Security | 35 | 3 | ⭐⭐⭐ | `vault kv rotate` |
| DNS Propagation | 🐧 Linux | 30 | 4 | ⭐⭐⭐ | `grep "ERROR" /var/log/*` |
| Zombie Process | 🐧 Linux | 28 | 4 | ⭐⭐⭐ | `kill -9` |
| Memory Leak | 🐳 Containers | 42 | 3 | ⭐⭐⭐ | `kubectl scale --replicas=10` |
| Dependency Hell | 🐳 Containers | 38 | 4 | ⭐⭐⭐ | `docker build` |
| The Gantt Chart | 🏗️ IaC | 50 | 3 | ⭐⭐⭐⭐ | `terraform apply` |
| Production Incident | ☁️ Cloud | 45 | 3 | ⭐⭐⭐⭐ | `blue-green deploy` |
| Evicted Node | ☸️ Kubernetes | 48 | 3 | ⭐⭐⭐⭐ | `kubectl drain node` |
| RBAC Denied | 🔒 Security | 46 | 3 | ⭐⭐⭐⭐ | `chmod 644` |
| Azure Bill Spike | ☁️ Cloud | 100 | 8 | ⭐⭐⭐⭐ | `cost optimization` |
| The VB6 Billing Horror | 🐧 Linux | 80 | 5 | ⭐⭐⭐⭐ | `systemctl restart` |
| Terraform State Lock | 🏗️ IaC | 45 | 3 | ⭐⭐⭐⭐ | `terraform apply` |
| SEV1 at 3am | 📊 Observability | 55 | 2 | ⭐⭐⭐⭐⭐ | — |
| The YAML Labyrinth | ☸️ Kubernetes | 60 | 2 | ⭐⭐⭐⭐⭐ | `helm upgrade` |
| The Legacy Monolith | 🎲 Random | 200 | null | ⭐⭐⭐⭐⭐ | — |
| THROTTLEMASTER | 🎲 Random | 80 | 12 | ⭐⭐⭐⭐⭐ | — |

---

*Auto-generated from `src/data/encounters.js` by `scripts/generate-wiki.js`*
