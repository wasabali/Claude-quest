# World Map

Cloud Quest's world is divided into regions, each themed around a different domain of cloud engineering. You progress through them as the story advances across 5 acts.

---

## Region Overview

| # | Region | Domain Focus | Act | Gym? | Description |
|---|---|---|---|---|---|
| 1 | **Localhost Town** | — | Prologue/1 | — | Starting village. Professor Pedersen's lab, Old Margaret's bakery, your apartment. Safe zone. |
| 2 | **Pipeline Pass** | IaC | 1 | 1st Gym | Mountain trail with CI/CD terminals. Failed builds spark as random encounters. |
| 3 | **Staging Valley** | Cloud | 2 | — | A mirror of production that's slightly broken. Requires Staging Env Token to enter. |
| 4 | **Production Plains** | Cloud | 2 | 2nd Gym | Wide open grassland with real traffic. High CPU and disk full encounters roam here. |
| 5 | **Jira Dungeon** | Observability | 3 | 3rd Gym | Underground maze of tickets and sprint boards. Stale tickets attack you. |
| 6 | **Shell Cavern** | Linux | 3 | — | Dark cave illuminated by terminal glow. Home of Tux the Terminal Wizard. |
| 7 | **The Helm Repository** | Kubernetes | 3 | 4th Gym | A library of charts and releases. Helm Hansen guards the stacks. |
| 8 | **Kubernetes Colosseum** | Kubernetes | 3 | 5th Gym | Amphitheatre where pods battle for resources. CrashLoopBackOff is the house champion. |
| 9 | **Security Vault** | Security | 4 | 6th Gym | Locked-down fortress. IAM checks at every door. |
| 10 | **Architecture District** | Observability | 4 | 7th Gym | City of whiteboards and UML diagrams. The Solutions Oracle sits at the centre. |
| 11 | **Azure Town** | Cloud | 4 | — | Cloud portal come to life. Shops, certificate vendors, budget management. |
| 12 | **The Cloud Console** | Cloud | Finale | 8th Gym | Final area. The CTO's office at the top. |

---

## Region Details

### Localhost Town
*"Home sweet `127.0.0.1`."*

The starting area. No random encounters — it's a safe zone. This is where you learn the basics.

**Key locations:**
- Professor Pedersen's Lab — get your starter deck
- Old Margaret's Bakery — first quest
- Your Apartment — save point
- Azure Terminal — manage your skill deck

**Available trainers:** Ola the Ops Guy (Linux, Difficulty 1)

---

### Pipeline Pass
*"Where code goes to be judged."*

Your first real challenge area. CI/CD encounters and build failures are common. The first gym is here.

**Encounter pool:**
| Rarity | Encounters |
|---|---|
| Common | npm install hang, 503 Service Unavailable, Failed Pipeline |
| Rare | Merge Conflict, Port Conflict |
| Cursed | *(none)* |

**Key trainers:** Fatima the Function Witch (Serverless)

---

### Production Plains
*"Welcome to the real world. Nothing works."*

Wide open and dangerous. High-traffic encounters. The second gym challenges your uptime discipline.

**Encounter pool:**
| Rarity | Encounters |
|---|---|
| Common | High CPU, Disk Full, 503 Service Unavailable |
| Rare | Production Incident, Runaway Process |
| Cursed | SEV1 at 3am |

---

### Jira Dungeon
*"Where tasks go to die."*

An underground maze themed around project management gone wrong. Tickets, sprints, and acceptance criteria are your enemies here.

**Key trainers:** Bjørn the Build Breaker (IaC, Gym 1)

**Encounter pool:**
| Rarity | Encounters |
|---|---|
| Common | Stale Ticket, Missing Acceptance Criteria, Blocked by QA |
| Rare | Scope Creep, Infinite Sprint |
| Cursed | The Gantt Chart |

---

### Shell Cavern
*"Dark, quiet, illuminated by terminal glow."*

A Linux-focused area. Home of Tux the Terminal Wizard. Great place to learn grep, tail, and awk.

**Key trainers:** Tux the Terminal Wizard (Linux, Difficulty 2)

---

### Kubernetes Colosseum
*"Where pods come to battle for CPU and memory."*

The Kubernetes arena. Pod crashes, OOM kills, and YAML nightmares everywhere.

**Encounter pool:**
| Rarity | Encounters |
|---|---|
| Common | CrashLoopBackOff, OOM Kill, Pending Pod |
| Rare | Evicted Node, RBAC Denied |
| Cursed | The YAML Labyrinth |

**Key trainers:** The Kube-rnetes Master (Kubernetes, Gym 5), Helm Hansen (Kubernetes)

---

### The 3am Tavern
*"Nothing good happens after 2am."*

A hidden area for the most chaotic encounters. This is where the cursed trainers hang out.

**Encounter pool:**
| Rarity | Encounters |
|---|---|
| Common | Merge Conflict, Missing Semicolon |
| Rare | Production Incident, Runaway Process |
| Cursed | SEV1 at 3am |

**Access:** This area has special requirements. See [Hidden Areas](hidden-areas.md) for more.

---

## Progression Flow

```
Prologue: Localhost Town
    ↓
Act 1: Pipeline Pass → Gym 1 (Pipeline Dojo)
    ↓
Act 2: Staging Valley → Production Plains → Gym 2 (Uptime Arena)
    ↓
Act 3: Jira Dungeon → Shell Cavern → Helm Repository → Kubernetes Colosseum
        → Gym 3 (Sprint Sanctum) → Gym 4 (Container Yard) → Gym 5 (Cluster Ring)
    ↓
Act 4: Security Vault → Architecture District → Azure Town
        → Gym 6 (Vault Chamber) → Gym 7 (Whiteboard Summit)
    ↓
Finale: The Cloud Console → Gym 8 (The Executive Suite / The CTO)
```

---

## Story Acts

| Act | Title | Summary |
|---|---|---|
| Prologue | "Hello World" | Professor Pedersen's lab. Pick a name, choose a starter deck. First battle: a 404 on campus Wi-Fi. |
| Act 1 | "Push to Production" | Deploy Margaret's bakery site. Learn CI/CD. First gym. |
| Act 2 | "It Works on My Machine" | App goes viral. THROTTLEMASTER's first interference. The 3:17am crisis. |
| Act 3 | "Legacy Migration" | OldCorp migration. Jira Dungeon. Kubernetes Colosseum. Discover `DO_NOT_TOUCH.exe`. |
| Act 4 | "Root Cause Analysis" | THROTTLEMASTER unmasked. Security Vault. Architecture District. |
| Finale | "The Post-Mortem" | The CTO fight (three phases). Promoted to Principal Engineer. |

---

*"Be careful in the tall grass — incidents love to ambush young engineers." — Old Margaret*
