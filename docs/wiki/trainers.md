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

## Gym Leaders

Eight gym leaders guard the path to Principal Engineer. Each gym has **2 generic apprentices** + **1 named sub-leader** (who teaches a skill on defeat) + the boss. Every leader has unique pre/post-battle dialog that changes based on your Shame level.

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

*"I've been running this cluster since before you knew what a pod was. Let's see what you've got." — The Kube-rnetes Master*
