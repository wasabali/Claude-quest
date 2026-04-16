# Trainers

Trainers are engineer NPCs scattered across the world. Beat them in battle and they may teach you their **signature skill**.

---

## Good Trainers

These are the engineers who fight fair and teach you real skills.

| Name | Domain | Location | Difficulty | Signature Skill | Notes |
|---|---|---|---|---|---|
| **Ola the Ops Guy** | 🐧 Linux | Localhost Town | ⭐ | `systemctl restart` | Your first trainer. Friendly. Loves turning things off and on again. |
| **Tux the Terminal Wizard** | 🐧 Linux | Shell Cavern | ⭐⭐ | `grep "ERROR" /var/log/*` | Lives in the dark. Terminal glow is his only light source. |
| **Fatima the Function Witch** | ⚡ Serverless | Pipeline Pass | ⭐⭐⭐ | `blue-green deploy` | Functions are her magic. Cold starts are her curse. |
| **Bjørn the Build Breaker** | 🏗️ IaC | Jira Dungeon | ⭐⭐ | `az pipelines run` | Breaks things on purpose to teach you to fix them. Gym 1 leader. |
| **Ingrid the IAM Inspector** | 🔒 Security | Security Vault | ⭐⭐⭐ | `chmod 644` | Nothing gets past her without proper authentication. |
| **The Kube-rnetes Master** | ☸️ Kubernetes | Kubernetes Colosseum | ⭐⭐⭐⭐⭐ | `kubectl apply -f` | The ultimate Kubernetes authority. His pods respawn 3× before defeat. Gym 5 leader. |
| **Helm Hansen** | ☸️ Kubernetes | Helm Repository | ⭐⭐⭐⭐ | `helm install` | Guards the chart library. Speaks in release versions. |
| **The Solutions Oracle** | 📊 Observability | Architecture District | ⭐⭐⭐⭐ | `az monitor alert create` | Sees everything. Dashboards are her art form. |

### Beating Trainers

- **Win** → Trainer teaches you their **signature skill** + XP reward
- **Optimal win** → Full XP (×2 multiplier)
- **Standard win** → Normal XP (×1 multiplier)
- **Shortcut/Cursed/Nuclear win** → Reduced XP, reputation damage

**Tip:** Aim for Optimal solutions — they give double XP even if the signature skill is taught on any win.

---

## Cursed Trainers

These engineers have gone to the dark side. They hang out in shady corners of the world — mostly **The 3am Tavern** and the hidden **Outcast Network** areas. They teach cursed techniques that are powerful but accumulate **Shame**.

| Name | Vibe | Domain | Cursed Skill | What It Does |
|---|---|---|---|---|
| **The Force Pusher** | "Rules are for people who didn't write the code." | 🏗️ IaC | `git push --force` | Wipes enemy's recent buffs. |
| **Hotfix Håkon** | "Sweating. 14 open tabs." | ☁️ Cloud | `deploy directly to prod` | Instant win (40% outage risk). |
| **Merge Magda** | "Always rushing, never reviews PRs." | 🏗️ IaC | `merge without review` | Win the turn. Bug returns later. |
| **The Root Whisperer** | "Runs everything as root. Wears a cape." | 🔒 Security | `sudo chmod 777 /` | Removes all permission blocks. |
| **kubectl Karen** | "I don't have time for manifests." | ☸️ Kubernetes | `kubectl delete pod --all` | Nuclear wipe of all pods. |
| **Skip-Tests Sigrid** | "Tests slow me down. Eyes twitch." | 🏗️ IaC | `git commit --no-verify` | Bypass pre-commit hooks. |
| **Hardcode Henrik** | "Has API keys in commit history." | 🔒 Security | `hardcode the secret` | Instant auth solve. Permanent rep loss. |
| **The Rebase Reverend** | "Preaches rebase but uses it wrong." | 🏗️ IaC | `git rebase -i HEAD~999` | Undo 3 turns. May corrupt your deck. |
| **rm-rf Rune** | "Smells of burnt servers." | 🐧 Linux | `rm -rf /` | Total wipe. Both sides. No survivors. |
| **The Downtime Dealer** | "Maintenance windows are a myth." | ☁️ Cloud | `restart prod without notice` | Full heal. On-call forever. |

### About Cursed Trainers

- Cursed trainers often require **Shame Points** to access (usually Shame ≥ 2)
- Their techniques bypass domain matchups — they work on everything
- Every cursed technique costs Shame (+1) and Reputation loss
- Nuclear techniques are even worse: +2 Shame, massive rep loss, lasting side effects
- Shame is **permanent** — it never goes down. See [Reputation & Shame](reputation-and-shame.md)

---

## Gym Leaders *(Planned)*

Eight gym leaders are planned to guard the path to Principal Engineer. These are design proposals from the content bible — not all are implemented in the current game data yet.

| # | Gym | Leader | Domain | Gimmick | Status |
|---|---|---|---|---|---|
| 1 | The Pipeline Dojo | Bjørn the Build Breaker | 🏗️ IaC | Build queue — boss queues 3 moves ahead | ✅ In trainers.js |
| 2 | The Uptime Arena | Captain Nines | ☁️ Cloud | SLA timer — must win within turns | *Planned* |
| 3 | The Sprint Sanctum | Scrum Siri | 📊 Observability | Kanban tracker — boss gains power each idle turn | *Planned* |
| 4 | The Container Yard | Docker Dag | 🐳 Containers | Layered defence — strip image layers | *Planned* |
| 5 | The Cluster Ring | The Kube-rnetes Master | ☸️ Kubernetes | Respawn — pods come back 3× | ✅ In trainers.js |
| 6 | The Vault Chamber | Ingrid the IAM Inspector | 🔒 Security | Auth challenge — mini-puzzle each turn | ✅ In trainers.js |
| 7 | The Whiteboard Summit | The Solutions Oracle | 📊 Observability | Review board — answer design questions | ✅ In trainers.js |
| 8 | The Executive Suite | The CTO | All domains | Three phases, adapts to your Shame level | *Planned* |

---

*"I've been running this cluster since before you knew what a pod was. Let's see what you've got." — The Kube-rnetes Master*
