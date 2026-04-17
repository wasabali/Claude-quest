# Skills Reference

Every skill in Cloud Quest is a real CLI command. This page lists them all, organized by domain.

**Active skill deck limit:** 6 skills. Choose wisely.

> **Note:** Some skill effects described below (e.g., damage-over-time, reveal next moves, confuse, immunity, traps, reflection) are defined in the game data but **not yet fully resolved in battle**. The current BattleEngine processes `damage`, `heal`, and domain reveal effects. Other effect types will be implemented in future updates — for now, treat their descriptions as design intent.

---

## 🐧 Linux — "If you can't grep, you can't debug."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `systemctl restart` | Standard | Heals 20 HP | Have you tried turning it off and on again? Heals 20 HP. Works 60% of the time, every time. | Ola the Ops Guy, Localhost Town |
| `grep "ERROR" /var/log/*` | Standard | Reveals enemy domain | Scroll through 10,000 lines of INFO to find the one ERROR. Reveals enemy domain. | Tux the Terminal Wizard, Shell Cavern |
| `tail -f /var/log/syslog` | Optimal | Reveals enemy's next 2 moves | Watch logs scroll like the Matrix. You understand none of it, but it reveals enemy plans. | Tux the Terminal Wizard, Shell Cavern |
| `kill -9` | Standard | 35 damage | No SIGTERM. No negotiation. Just execution. 35 damage, no questions asked. | Ola the Ops Guy, Localhost Town |
| `awk '{print $NF}'` | Optimal | 50 damage | A regex so dense it bends spacetime. Write-once, read-never. 50 damage. | Quest: The Log Stream Fishing Challenge, Shell Cavern |
| `crontab -e` | Standard | 10 damage/turn for 4 turns | Set it and forget it. Until it fires at 3am. 10 damage every turn for 4 turns. | Ola the Ops Guy, Production Plains |
| `blame DNS` | Shortcut | 50% chance to confuse | It's always DNS. Confuse everyone, including yourself, half the time. | Starter Deck, Localhost Town |
| `open a ticket` | Shortcut | Freezes battle for 1 turn | Escalate to someone else's problem. Freezes battle for 1 turn while you sip coffee. | Any NPC after losing a battle, Localhost Town |

### 💀 Linux — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `:(){ :|:& };:` | Cursed | 25 damage/turn for 3 turns | +1 Shame, -10 Rep | Hidden: DNS Swamp bash history puzzle, Shell Cavern |
| `rm -rf /` | Nuclear | Wipes all statuses and buffs (both sides) | +2 Shame, -18 Rep | rm-rf Rune, Three Am Tavern |

---

## 🔒 Security — "Lock it down or watch it burn."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `chmod 644` | Standard | Clears "denied" status | Fix permissions the proper way. Clears "denied" status. Your sysadmin would be proud. | Ingrid the IAM Inspector, Security Vault |
| `ssh-keygen` | Standard | +10 defence for 2 turns | Generate a fresh key pair. +10 defence for 2 turns. Pray you remember the passphrase. | Ingrid the IAM Inspector, Security Vault |
| `vault kv rotate` | Optimal | Cleanse all debuffs + 15 defence for 3 turns | Rotate all secrets before the auditor arrives. Cleanse all debuffs and +15 defence. | Quest: The Vault Audit, Security Vault |
| `nmap -sV` | Standard | Reveals all enemy stats | Port scan everything. See all enemy stats. Report nothing. Ethical hacking, right? | Certificate Authority Island puzzle, Security Vault |
| `ufw deny incoming` | Optimal | Immune to damage for 2 turns | Block everything. Sleep soundly. Immune to damage for 2 turns. | Quest: Zero Trust Initiative, Security Vault |
| `certbot renew` | Standard | Heal 15 HP, prevent expired for 3 turns | Renew before Chrome shows the skull icon. Heal 15 HP and prevent expiry status. | Certificate Authority Island puzzle, Security Vault |
| `az role assignment create` | Optimal | 40 damage | Grant access with principle of least privilege. Lock down the attack surface for 40 damage. | Ingrid the IAM Inspector, Security Vault |

### 💀 Security — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `sudo chmod 777 /` | Cursed | Removes all permission statuses | +1 Shame, -12 Rep | The Root Whisperer, Three Am Tavern |
| `hardcode the secret` | Cursed | Solves auth challenge instantly | +1 Shame, -20 Rep | Hardcode Henrik, Three Am Tavern |
| `ufw disable` | Nuclear | 80 damage | +2 Shame, -20 Rep | The Root Whisperer (after 3 shame), Three Am Tavern |
| `curl example.com | sudo bash` | Cursed | Instant win vs containers | +1 Shame, -12 Rep | Hidden: Privileged Petra in the node_modules Maze, Node Modules Maze |

---

## ⚡ Serverless — "Pay per invocation. Die per timeout."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `aws lambda invoke` | Standard | 25 damage | Call a function. First use is slow (cold start penalty). 25 damage. Billed per millisecond. Budget cost: 5. | Fatima the Function Witch, Pipeline Pass |
| `az functionapp deploy` | Optimal | 20+ damage (scales with enemy buffs) | Ship serverless code. Damage scales with enemy buff count. More buffs, more pain. Budget cost: 15. | Fatima the Function Witch, Pipeline Pass |
| `set trigger` | Standard | 30 damage trap on enemy action | Plant an event-driven trap. Enemy takes 30 damage on their next action. Surprise! Budget cost: 5. | Quest: Event-Driven Architecture 101, Pipeline Pass |
| `configure APIM` | Optimal | Reflect 50% damage for 2 turns | Route enemy damage back at them. 50% damage reflection for 2 turns. Budget cost: 10. | Quest: The API Gateway Gauntlet, Architecture District |
| `start execution` | Standard | 15 damage × 3 hits | Orchestrate a multi-step workflow. 15 damage per turn for 3 turns. Like a slow, painful standup. Budget cost: 10. | Fatima the Function Witch, Pipeline Pass |
| `invoke from cold` | Shortcut | 40 damage | Surprise attack from cold state. 40 damage but 50% chance of timeout. Just like Monday morning. | Random encounter in The Standby Zone, Pipeline Pass |

### 💀 Serverless — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `while(true) invoke()` | Cursed | 30 damage/turn for 4 turns | +1 Shame, -8 Rep | Hidden: The Standby Zone infinite loop puzzle, Pipeline Pass |
| `set timeout 0ms` | Nuclear | Wipes all statuses and buffs (both sides) | +2 Shame, -15 Rep | Hidden: Complete The Standby Zone without using any skills, Pipeline Pass |

---

## ☁️ Cloud — "Scale up. Bill up. Freak out."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `blue-green deploy` | Optimal | Prevent status effects for 1 turn | Swap traffic like a DJ switches decks. Zero downtime. Prevents next status effect. | Captain Nines (Gym 2), Production Plains |
| `feature flag` | Standard | Hide enemy skill for 2 turns | Toggle off the broken thing. Ship it anyway. Hide one enemy skill for 2 turns. | Quest: Deploy Old Margaret's Bakery, Localhost Town |
| `az webapp deploy` | Standard | 30 damage | Push to Azure App Service. 30 damage. Pray the connection string is right. | Starter Deck, Localhost Town |
| `az webapp restart` | Standard | 20 damage | The IT classic. Turn it off and on again — Azure edition. 20 damage. | Old Margaret (quest reward), Localhost Town |
| `az scale out` | Standard | +20 max HP for 3 turns | Throw money at the problem. +20 max HP for 3 turns. Your finance team weeps quietly. Budget cost: 30. | Captain Nines (Gym 2), Production Plains |
| `cost optimization` | Standard | Drain 10 budget/turn for 3 turns | Right-size everything. Drain 10 enemy budget per turn for 3 turns. FinOps approves. | Azure Town shop tutorial, Production Plains |
| `disaster recovery` | Optimal | Full heal after 2 turn delay | Failover to backup region. Full heal after 2 turns. Costs nothing because you actually planned ahead. | Quest: The DR Drill, Production Plains |
| `az lock create` | Optimal | Lock buffs for 3 turns | Lock it down. Nobody touches your buffs. Not even the intern with Owner role. Budget cost: 10. | Azure Town governance NPC, Production Plains |
| `canary release` | Standard | 15 damage | Deploy to 10% of traffic. 15 damage but safe. The canary lives another day. | Captain Nines (Gym 2), Production Plains |
| `az feature register --namespace Microsoft.Legacy` | Shortcut | 30 damage | Unlock a deprecated Azure feature. Still waiting on approval since 2019. Wilhelm filed the ticket. | Hidden: West-EU-2 Wilhelm in the Deprecated Azure Region, Deprecated Azure Region |

### 💀 Cloud — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `deploy directly to prod` | Nuclear | Instant win | +2 Shame, -15 Rep | Hotfix Håkon, Three Am Tavern |
| `restart prod without notice` | Nuclear | Full heal | +2 Shame, -16 Rep | The Downtime Dealer, Three Am Tavern |
| `az group delete --yes --force-deletion-types` | Nuclear | Instant win vs legacy systems | +2 Shame, -15 Rep | Hidden: Deprecated Dagfinn in the Server Graveyard, Server Graveyard |

---

## 🏗️ IaC — "Infrastructure as Code. Bugs as YAML."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `git revert` | Standard | Undo 20 damage | Undo your last mistake without rewriting history. +20 HP. If only life had git revert. | Bjørn the Build Breaker, Pipeline Pass |
| `az pipelines run` | Standard | 30 damage | Trigger the pipeline. 30 damage. 30% chance it fails because someone edited YAML with tabs. | Bjørn the Build Breaker (Gym 1), Pipeline Pass |
| `az deployment create` | Optimal | 60 damage after 1 turn delay | Bicep template go brrr. Plan first, then land a heavy 60-damage infrastructure hit. | Quest: Migrate the Legacy Stack, Pipeline Pass |
| `terraform apply` | Optimal | 50 damage (scales with enemy buffs) | Type 'yes' to confirm. Damages all enemy buffs for 50. Don't touch the state file. | Hidden: Server Graveyard, Pipeline Pass |
| `ansible-playbook` | Standard | 12 damage × 3 hits | Automate everything. 12 damage per turn for 3 turns. Idempotent, unless it isn't. | Quest: Automate the Fleet, Production Plains |
| `terraform plan` | Standard | Reveals enemy defenses | Preview before you wreck. Reveals enemy defence values. No changes applied (yet). | Bjørn the Build Breaker, Pipeline Pass |
| `az network vnet create` | Optimal | Heals 40 HP | Provision a private network. Route traffic safely and restore 40 HP. Budget cost: 10. | The Solutions Oracle, Architecture District |

### 💀 IaC — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `git push --force` | Cursed | Wipe enemy buffs (last 3 turns) | +1 Shame, -8 Rep | The Force Pusher, Three Am Tavern |
| `merge without review` | Cursed | Win the turn | +1 Shame, -10 Rep | Merge Magda, Three Am Tavern |
| `git commit --no-verify` | Cursed | Bypass pre-commit hooks | +1 Shame, -9 Rep | Skip-Tests Sigrid, Three Am Tavern |
| `git rebase -i HEAD~999` | Nuclear | Undo 3 turns | +2 Shame, -13 Rep | The Rebase Reverend, Three Am Tavern |
| `terraform destroy` | Nuclear | Instant win vs legacy systems | +2 Shame, -15 Rep | Hidden: Deprecated Dagfinn in the Server Graveyard, Server Graveyard |
| `EXEC xp_cmdshell` | Nuclear | 999 damage | +3 Shame, -20 Rep | Hidden: DO_NOT_TOUCH.exe terminal in OldCorp basement, Oldcorp Basement |

---

## 🐳 Containers — "Ship it in a box. Hope it fits."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `docker build` | Standard | ×1.5 next damage | Build the image. Cache miss on every layer. +50% damage on your next skill. | Docker Dag (Gym 4), Pipeline Pass |
| `docker compose up` | Optimal | ×1.2 buff all skills for 2 turns | 27 services. 1 command. 0 chance they all work. Buff all stats for 2 turns anyway. Budget cost: 10. | Docker Dag (Gym 4), Pipeline Pass |
| `trivy image scan` | Standard | Reveal weaknesses + -10 defence debuff for 2 turns | Find vulnerabilities before Twitter does. Reveal enemy weaknesses and apply -10 defence debuff. | Quest: Supply Chain Security, Pipeline Pass |
| `multi-stage build` | Optimal | 45 damage | Strip the bloat. Ship only what matters. 45 damage, minimal budget cost. DevOps poetry. Budget cost: 5. | Docker Dag (Gym 4), Pipeline Pass |
| `docker stop` | Standard | Remove one enemy buff | Graceful shutdown. SIGTERM, wait 10 seconds, give up. Remove one enemy buff. | Docker Dag (Gym 4), Pipeline Pass |
| `docker system prune -a` | Standard | Heal 15 HP + 10 Budget | Clean up dangling images, stopped containers, and your will to live. Heal 15 HP, restore 10 budget. | npm Registry Market vendor, Pipeline Pass |
| `docker run --privileged` | Shortcut | Bypass encounter check for 1 turn | Run with all capabilities because who needs isolation? Bypass one encounter gate. | Hidden: node_modules Maze, Pipeline Pass |
| `helm upgrade --install` | Optimal | 40 damage | Install or upgrade a chart atomically. 40 damage. Rolls back automatically on failure. Budget cost: 5. | Helm Hansen, Helm Repository |

### 💀 Containers — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `container escape` | Cursed | 70 damage | +1 Shame, -12 Rep | Hidden: Privileged Petra in node_modules Maze, Pipeline Pass |

---

## ☸️ Kubernetes — "It's not complicated. You just don't understand it."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `helm upgrade` | Optimal | ×1.25 buff for 3 turns | Rolling upgrade with zero downtime. ×1.25 damage buff for 3 turns. Helm Hansen would be proud. | Helm Hansen, Helm Repository |
| `kubectl rollout restart` | Standard | Removes all enemy buffs | Restart all the pods. Clear all enemy buffs. The Kubernetes equivalent of turning it off and on again. | Starter Deck, Localhost Town |
| `kubectl apply -f` | Optimal | Charge 1 turn, then ×2 damage | Apply the manifest. Charge for 1 turn, then execute ×2 damage. Declarative violence. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `helm install` | Standard | Shield for 2 turns | Install a chart. Deploy a shield for 2 turns. Hope the values.yaml is right. | Helm Hansen, Helm Repository |
| `kubectl exec -it` | Standard | Reveals enemy's next move | SSH into a pod (but not really). Reveals enemy's next move. Don't edit anything in there. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `kubectl scale --replicas=10` | Standard | ×1.3 buff for 3 turns | More pods. More problems. More power. +30% damage output for 3 turns. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `kubectl drain node` | Standard | Skips enemy turn | Evict all workloads from a node. Politely. The British approach to ops. Skip enemy turn. | Quest: Node Maintenance Window, Kubernetes Colosseum |
| `kubectl logs -f` | Standard | Reveals enemy statuses and plan | Follow the breadcrumbs through a forest of JSON. Reveals enemy status effects and plan. | Helm Hansen, Helm Repository |

### 💀 Kubernetes — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `kubectl delete ns prod` | Cursed | 80 damage | +1 Shame, -14 Rep | kubectl Karen, Three Am Tavern |
| `kubectl delete pod --all` | Nuclear | Clears all enemy buffs and statuses | +2 Shame, -14 Rep | kubectl Karen, Three Am Tavern |
| `kubectl delete ns production --grace-period=0 --force` | Nuclear | 999 damage | +3 Shame, -50 Rep | Shadow Engineer title — unlocked at 10 Shame Points, Shadow Realm |

---

## 📊 Observability — "You can't fix what you can't see."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `az monitor alert create` | Standard | Reveals and tags enemy weakness | Set an alert. Tag a weakness. Reveal enemy domain. Get paged at dinner. | The Solutions Oracle, Architecture District |
| `read the docs` | Standard | Reveals enemy weaknesses | The bravest move in engineering. Actually read the documentation. Reveals enemy weaknesses. | Starter Deck, Localhost Town |
| `build Grafana dashboard` | Optimal | Reveals all enemy stats (permanent) | Spend an hour making it pretty. All enemy stats visible for rest of battle. Worth it. Budget cost: 15. | The Solutions Oracle, Architecture District |
| `PagerDuty acknowledge` | Standard | Pause SLA for 2 turns | Acknowledge the pain. Do not resolve it. Pause SLA timer for 2 turns. | Quest: On-Call Survival Training, Production Plains |
| `KQL query` | Standard | Reveals enemy's next 3 moves | Write a KQL query. Get 47 results. None of them helpful. Reveals enemy attack pattern anyway. | Azure Town diagnostic NPC, Production Plains |
| `define SLIs` | Optimal | 10+ damage (scales with observations) | Measure what matters. Damage scales with turns observed. The longer you watch, the harder you hit. | Quest: Define Your SLOs, Architecture District |
| `follow the runbook` | Standard | Heals 25 HP | Step 1: Don't panic. Step 2: Follow the runbook. Reliable 25 HP heal. No drama. | Quest: Write Your First Runbook, Production Plains |

### 💀 Observability — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `ignore all alerts` | Cursed | Blind both sides for 3 turns | +1 Shame, -10 Rep | Hidden: The Backlog Graveyard ghost encounter, Jira Dungeon |
| `history -c` | Cursed | Reveals enemy info | -5 Rep | Hidden: The Null Pointer in the /dev/null Void, Dev Null Void |

---

## 📊 Stats

- **Total skills:** 84
- **By domain:** Linux (10), Security (11), Serverless (8), Cloud (13), IaC (13), Containers (9), Kubernetes (11), Observability (9)
- **Cursed/Nuclear:** 23

---

*Auto-generated from `src/data/skills.js` by `scripts/generate-wiki.js`*
