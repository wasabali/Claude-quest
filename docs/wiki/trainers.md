# Trainers

Trainers are engineer NPCs scattered across the world. Beat them in battle and they may teach you their **signature skill**.

---

## Good Trainers

These are the engineers who fight fair and teach you real skills.

| Name | Domain | Location | Difficulty | Signature Skill | Notes |
|---|---|---|---|---|---|
| **Ola the Ops Guy** | 🐧 Linux | Localhost Town | ⭐ | `systemctl restart` | You dare challenge the Ops Guy? I've been running Linux sinc… |
| **Tux the Terminal Wizard** | 🐧 Linux | Shell Cavern | ⭐⭐ | `grep logs` | You think GUIs are real engineering? Step into my terminal a… |
| **Fatima the Function Witch** | ⚡ Serverless | Pipeline Pass | ⭐⭐⭐ | `az func deploy` | Functions everywhere. No servers. No limits. No mercy. |
| **Bjørn the Build Breaker** | 🏗️ IaC | Jira Dungeon | ⭐⭐ | `az pipelines run` | Every PR I touch breaks something. That's not a bug, that's … |
| **Ingrid the IAM Inspector** | 🔒 Security | Security Vault | ⭐⭐⭐ | `az role assignment create` | You have Owner role on a production subscription. We need to… |
| **The Kube-rnetes Master** | ☸️ Kubernetes | Kubernetes Colosseum | ⭐⭐⭐⭐⭐ | `kubectl apply` | You dare enter my colosseum? I've been running pods since be… |
| **Helm Hansen** | 🐳 Containers | Helm Repository | ⭐⭐⭐⭐ | `helm upgrade install` | Charts, values, releases. If you can't helm upgrade, you can… |
| **The Solutions Oracle** | 🏗️ IaC | Architecture District | ⭐⭐⭐⭐ | `az network vnet create` | Every solution you have is technically correct but architect… |

### Beating Trainers

- **Win** → Trainer teaches you their **signature skill** + XP reward
- **Optimal win** → Full XP (×2 multiplier)
- **Standard win** → Normal XP (×1 multiplier)
- **Shortcut/Cursed/Nuclear win** → Reduced XP, reputation damage

**Tip:** Aim for Optimal solutions — they give double XP even if the signature skill is taught on any win.

---

## Cursed Trainers

These engineers have gone to the dark side. They hang out in shady corners of the world — mostly **The 3am Tavern** and the hidden **Outcast Network** areas. They teach cursed techniques that are powerful but accumulate **Shame**.

| Name | Domain | Cursed Skill | Shame Required | Location |
|---|---|---|---|---|
| **The Force Pusher** | 🏗️ IaC | `force push` | 1 | Three Am Tavern |
| **Hotfix Håkon** | ☁️ Cloud | `deploy to prod` | 2 | Three Am Tavern |
| **Merge Magda** | 🏗️ IaC | `merge no review` | 1 | Three Am Tavern |
| **The Root Whisperer** | 🔒 Security | `chmod 777` | 2 | Three Am Tavern |
| **kubectl Karen** | ☸️ Kubernetes | `delete all pods` | 2 | Three Am Tavern |
| **Skip-Tests Sigrid** | 🏗️ IaC | `no verify` | 4 | Three Am Tavern |
| **Hardcode Henrik** | 🔒 Security | `hardcode secret` | 1 | Three Am Tavern |
| **The Rebase Reverend** | 🏗️ IaC | `rebase 999` | 2 | Three Am Tavern |
| **rm-rf Rune** | 🐧 Linux | `rm rf` | 8 | Three Am Tavern |
| **The Downtime Dealer** | ☁️ Cloud | `restart no notice` | 6 | Three Am Tavern |
| **Deprecated Dagfinn** | 🐧 Linux | — | 0 | Server Graveyard |
| **Privileged Petra** | 🐳 Containers | — | 0 | Node Modules Maze |
| **The Null Pointer** | 📊 Observability | — | 0 | Dev Null Void |
| **West-EU-2 Wilhelm** | ☁️ Cloud | — | 0 | Deprecated Azure Region |

### About Cursed Trainers

- Cursed trainers often require **Shame Points** to access (usually Shame ≥ 2)
- Their techniques bypass domain matchups — they work on everything
- Every cursed technique costs Shame (+1) and Reputation loss
- Nuclear techniques are even worse: +2 Shame, massive rep loss, lasting side effects
- Shame is **permanent** — it never goes down. See [Reputation & Shame](reputation-and-shame.md)

---

## Wild Encounters

These trainers appear randomly in the world.

| Name | Domain | Difficulty | Location |
|---|---|---|---|
| **Lost Intern** | 🐧 Linux | ⭐ | Any |
| **Rival Cloud Engineer** | ❓ null | ⭐⭐ | Any |
| **Sales Rep** | ☁️ Cloud | ⭐⭐ | Any |
| **Senior Engineer** | ❓ null | ⭐⭐⭐⭐ | Any |
## Gym Leaders

Eight gym leaders guard the path to Principal Engineer. Each gym typically has **2 generic apprentices** + **1 named sub-leader** (who teaches a skill on defeat) + the boss. *(Exception: The Executive Suite — CTO gym — has 3 apprentices + 2 sub-leaders, reflecting the gauntlet nature of the final gym.)* Every leader has unique pre/post-battle dialog that changes based on your Shame level.

> **Shame ≥ 5:** Leaders add a wary pre-battle line ("I've heard about you…")
> **Shame ≥ 10:** Leaders **refuse to teach** their signature skill after defeat.

| # | Gym | Leader | Domain | Sub-leader | Gimmick |
|---|---|---|---|---|---|
| 1 | **The Pipeline Dojo** | Bjørn the Build Breaker | 🏗️ IaC | Pipeline Per | Build queue — telegraphs 3 moves ahead |
| 2 | **The Uptime Arena** | Captain Nines | ☁️ Cloud | SLA Signe | SLA timer — must win within 8 turns or −15 rep |
| 3 | **The Sprint Sanctum** | Scrum Siri | 📊 Observability | Story Point Søren | Kanban tracker — +5 ATK per turn you deal no damage |
| 4 | **The Container Yard** | Docker Dag | 🐳 Containers | Layer Lars | Layered defence — 3 HP bars (strip each image layer) |
| 5 | **The Cluster Ring** | The Kube-rnetes Master | ☸️ Kubernetes | Replica Set Ragnhild | Respawn — pods return 3× at 50% HP, different domain each time |
| 6 | **The Vault Chamber** | Ingrid the IAM Inspector | 🔒 Security | Firewall Frida | Auth challenge — wrong answer wastes your turn |
| 7 | **The Whiteboard Summit** | The Solutions Oracle | 📊 Observability | Architect Aleksander | Review board — must answer design trivia before damage applies |
| 8 | **The Executive Suite** | The CTO | All domains | The On-Call Champion | Three phases: Cloud → FinOps → Excel. Adapts to Shame level. |

### Gym Leader Quotes

| Leader | Pre-battle | Post-defeat |
|---|---|---|
| **Bjørn** | "You want to learn? First I'll show you how badly things can fail." | "You fixed it in 3 tries. I usually need 7. You might be better than me." |
| **Captain Nines** | "99.999% uptime. That's my religion. Can you match it?" | "You actually won within SLA. I respect that." |
| **Scrum Siri** | "Let's time-box this fight to 14 minutes. That's the sprint." | "The velocity data supports your win. I'll update the board." |
| **Docker Dag** | "My image is 12 megabytes. Scratch-based. Distroless. Perfect. Let's see yours." | "Your build times are better than mine. I don't want to talk about it." |
| **The Kube-rnetes Master** | "A pod is not dead until its restartPolicy says so." | "You have achieved desired state." |
| **Ingrid** | "Authenticate first. I'll wait. I have time. I have logs." | "Access granted. Your policies are… acceptable. Barely." |
| **The Solutions Oracle** | "Before we begin — what are your non-functional requirements?" | "Good. You knew the answer. You just needed to hear yourself say it." |
| **The CTO** | "Why is the site down?!" *(Phase 1)* | "You're actually good at this. I'm promoting you." |

### The Legacy Monolith *(Special)*

Found in the OldCorp Basement during Act 3. **Not a gym leader** — a special incident boss.

- A literal 1994 server rack. Communicates only via BSOD error codes.
- Immune to Cloud, IaC, Kubernetes, and Containers domain skills. Only Linux and Security work ("the old ways").
- Drops the `oldcorp_keycard` key item on defeat. Required to access `DO_NOT_TOUCH.exe`.
- "FATAL ERROR 0x0000007B. KERNEL_DATA_INPAGE_ERROR."

---

*Auto-generated from `src/data/trainers.js` by `scripts/generate-wiki.js`*
