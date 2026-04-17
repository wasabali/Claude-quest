# Trainers

Trainers are engineer NPCs scattered across the world. Beat them in battle and they may teach you their **signature skill**.

---

## Good Trainers

These are the engineers who fight fair and teach you real skills.

| Name | Domain | Location | Difficulty | Signature Skill | Notes |
|---|---|---|---|---|---|
| **Ola the Ops Guy** | 🐧 Linux | Localhost Town | ⭐ | `systemctl restart` | You dare challenge the Ops Guy? I've been running Linux sinc… |
| **Tux the Terminal Wizard** | 🐧 Linux | Shell Cavern | ⭐⭐ | `grep "ERROR" /var/log/*` | You think GUIs are real engineering? Step into my terminal a… |
| **Fatima the Function Witch** | ⚡ Serverless | Pipeline Pass | ⭐⭐⭐ | `az functionapp deploy` | Functions everywhere. No servers. No limits. No mercy. |
| **Bjørn the Build Breaker** | 🏗️ IaC | Jira Dungeon | ⭐⭐ | `az pipelines run` | Every PR I touch breaks something. That's not a bug, that's … |
| **Ingrid the IAM Inspector** | 🔒 Security | Security Vault | ⭐⭐⭐ | `az role assignment create` | You have Owner role on a production subscription. We need to… |
| **The Kube-rnetes Master** | ☸️ Kubernetes | Kubernetes Colosseum | ⭐⭐⭐⭐⭐ | `kubectl apply -f` | You dare enter my colosseum? I've been running pods since be… |
| **Helm Hansen** | 🐳 Containers | Helm Repository | ⭐⭐⭐⭐ | `helm upgrade --install` | Charts, values, releases. If you can't helm upgrade, you can… |
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
| **The Force Pusher** | 🏗️ IaC | `git push --force` | 1 | Three Am Tavern |
| **Hotfix Håkon** | ☁️ Cloud | `deploy directly to prod` | 2 | Three Am Tavern |
| **Merge Magda** | 🏗️ IaC | `merge without review` | 1 | Three Am Tavern |
| **The Root Whisperer** | 🔒 Security | `sudo chmod 777 /` | 2 | Three Am Tavern |
| **kubectl Karen** | ☸️ Kubernetes | `kubectl delete pod --all` | 2 | Three Am Tavern |
| **Skip-Tests Sigrid** | 🏗️ IaC | `git commit --no-verify` | 4 | Three Am Tavern |
| **Hardcode Henrik** | 🔒 Security | `hardcode the secret` | 1 | Three Am Tavern |
| **The Rebase Reverend** | 🏗️ IaC | `git rebase -i HEAD~999` | 2 | Three Am Tavern |
| **rm-rf Rune** | 🐧 Linux | `rm -rf /` | 8 | Three Am Tavern |
| **The Downtime Dealer** | ☁️ Cloud | `restart prod without notice` | 6 | Three Am Tavern |
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
| **Rival Cloud Engineer** | 🎲 Random | ⭐⭐ | Any |
| **Sales Rep** | ☁️ Cloud | ⭐⭐ | Any |
| **Senior Engineer** | 🎲 Random | ⭐⭐⭐⭐ | Any |

---

*Auto-generated from `src/data/trainers.js` by `scripts/generate-wiki.js`*
