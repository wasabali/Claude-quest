# Skills Reference

Every skill in Cloud Quest is a real CLI command. This page lists them all, organized by domain.

**Active skill deck limit:** 6 skills. Choose wisely.

> **Note:** Some skill effects described below (e.g., damage-over-time, reveal next moves, confuse, immunity, traps, reflection) are defined in the game data but **not yet fully resolved in battle**. The current BattleEngine processes `damage`, `heal`, and domain reveal effects. Other effect types will be implemented in future updates — for now, treat their descriptions as design intent.

---

## 🐧 Linux — "If you can't grep, you can't debug."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `systemctl restart` | Standard | Heals 20 HP | Have you tried turning it off and on again? Works 60% of the time, every time. | Ola the Ops Guy, Localhost Town |
| `grep "ERROR" /var/log/*` | Standard | Reveals enemy domain | Scroll through 10,000 lines of INFO to find the one ERROR. | Tux the Terminal Wizard, Shell Cavern |
| `tail -f /var/log/syslog` | Optimal | Reveals enemy's next 2 moves | Watch logs scroll like the Matrix. You understand none of it, but it reveals enemy plans. | Tux the Terminal Wizard, Shell Cavern |
| `kill -9` | Standard | 35 damage | No SIGTERM. No negotiation. Just execution. No questions asked. | Ola the Ops Guy, Localhost Town |
| `awk '{print $NF}'` | Optimal | 50 damage | A regex so dense it bends spacetime. Write-once, read-never. | Quest: The Log Stream Fishing Challenge, Shell Cavern |
| `crontab -e` | Standard | 10 damage/turn for 4 turns | Set it and forget it. Until it fires at 3am. | Ola the Ops Guy, Production Plains |
| `blame DNS` | Shortcut | 50% chance to confuse (including yourself) | It's always DNS. Confuse everyone, including yourself, half the time. | Starter Deck, Localhost Town |
| `open a ticket` | Shortcut | Freezes battle 1 turn | Escalate to someone else's problem. Sip coffee. | Any NPC after losing a battle, Localhost Town |

### 💀 Linux — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `:(){ :\|:& };:` (fork bomb) | Cursed | 25 damage/turn for 3 turns | +1 Shame, −10 Rep. System instability for 2 battles. | Hidden: DNS Swamp bash history puzzle |
| `rm -rf /` | Nuclear | Wipes all statuses and buffs (both sides) | +2 Shame, −18 Rep. Own statuses wiped too. | rm-rf Rune, The 3am Tavern |

---

## 🔒 Security — "Lock it down or watch it burn."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `chmod 644` | Standard | Clears "denied" status | Fix permissions the proper way. Your sysadmin would be proud. | Ingrid the IAM Inspector, Security Vault |
| `ssh-keygen` | Standard | +10 defence for 2 turns | Generate a fresh key pair. Pray you remember the passphrase. | Ingrid the IAM Inspector, Security Vault |
| `vault kv rotate` | Optimal | Cleanse all debuffs + 15 defence for 3 turns | Rotate all secrets before the auditor arrives. | Quest: The Vault Audit, Security Vault |
| `nmap -sV` | Standard | Reveals all enemy stats | Port scan everything. Ethical hacking, right? | Certificate Authority Island puzzle, Security Vault |
| `ufw deny incoming` | Optimal | Immune to damage for 2 turns | Block everything. Sleep soundly. | Quest: Zero Trust Initiative, Security Vault |
| `certbot renew` | Standard | Heal 15 HP, prevent expiry status for 3 turns | Renew before Chrome shows the skull icon. | Certificate Authority Island puzzle, Security Vault |

### 💀 Security — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `sudo chmod 777 /` | Cursed | Removes all permission statuses | +1 Shame, −12 Rep. Own defence drops to zero. | The Root Whisperer, The 3am Tavern |
| `hardcode the secret` | Cursed | Solves auth challenge | +1 Shame, −20 Rep. Permanent reputation loss. | Hardcode Henrik, The 3am Tavern |
| `ufw disable` | Nuclear | 80 damage | +2 Shame, −20 Rep. All defence removed for 5 battles. | The Root Whisperer (after 3 shame), The 3am Tavern |

---

## ⚡ Serverless — "Pay per invocation. Die per timeout."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `aws lambda invoke` | Standard | 25 damage (cold start penalty on first use) | Call a function. Billed per millisecond. Budget cost: 5. | Fatima the Function Witch, Pipeline Pass |
| `az functionapp deploy` | Optimal | Damage scales with enemy buff count | Ship serverless code. More buffs on the enemy = more pain. Budget cost: 15. | Fatima the Function Witch, Pipeline Pass |
| `set trigger` | Standard | 30 damage trap on enemy's next action | Plant an event-driven trap. Surprise! Budget cost: 5. | Quest: Event-Driven Architecture 101, Pipeline Pass |
| `configure APIM` | Optimal | 50% damage reflection for 2 turns | Route enemy damage back at them. Budget cost: 10. | Quest: The API Gateway Gauntlet, Architecture District |
| `start execution` | Standard | 15 damage/turn for 3 turns | Orchestrate a multi-step workflow. Like a slow, painful standup. Budget cost: 10. | Fatima the Function Witch, Pipeline Pass |
| `invoke from cold` | Shortcut | 40 damage, 50% fail chance | Surprise attack from cold state. Just like Monday morning. | Random encounter, Pipeline Pass |

### 💀 Serverless — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `while(true) invoke()` | Cursed | 30 damage/turn for 4 turns | +1 Shame, −8 Rep. Budget drain for 3 battles. Budget cost: 50. | Hidden: The Standby Zone infinite loop puzzle |
| `set timeout 0ms` | Nuclear | Wipes all statuses and buffs (both sides) | +2 Shame, −15 Rep. All active skills on 2-turn cooldown. | Hidden: Complete The Standby Zone without using any skills |

---

## ☁️ Cloud — "It's someone else's computer."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `blue-green deploy` | Optimal | Prevents next status effect | Swap traffic like a DJ switches decks. Zero downtime. | Captain Nines (Gym 2), Production Plains |
| `feature flag` | Standard | Hides one enemy skill for 2 turns | Toggle off the broken thing. Ship it anyway. | Quest: Deploy Old Margaret's Bakery, Localhost Town |
| `az webapp deploy` | Standard | 30 damage | Push to Azure App Service. Pray the connection string is right. | Starter Deck, Localhost Town |
| `az scale out` | Standard | +20 max HP for 3 turns | Throw money at the problem. Finance weeps quietly. Budget cost: 30. | Captain Nines (Gym 2), Production Plains |
| `cost optimization` | Standard | Drains 10 enemy budget/turn for 3 turns | Right-size everything. FinOps approves. | Azure Town shop tutorial, Production Plains |
| `disaster recovery` | Optimal | Full heal after 2-turn delay | Failover to backup. Costs nothing because you actually planned ahead. | Quest: The DR Drill, Production Plains |
| `az lock create` | Optimal | Locks your buffs for 3 turns | Nobody touches your buffs. Not even the intern with Owner role. Budget cost: 10. | Azure Town governance NPC, Production Plains |
| `canary release` | Standard | 15 damage (0% fail chance) | Deploy to 10% of traffic. The canary lives another day. | Captain Nines (Gym 2), Production Plains |

### 💀 Cloud — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `deploy directly to prod` | Nuclear | Instant win | +2 Shame, −15 Rep. 40% chance of outage for next 3 battles. | Hotfix Håkon, The 3am Tavern |
| `restart prod without notice` | Nuclear | Full heal | +2 Shame, −16 Rep. Forces On-Call status for 5 battles. | The Downtime Dealer, The 3am Tavern |

---

## 🏗️ IaC — "Infrastructure as Code. Or Infrastructure as Chaos."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `git revert` | Standard | Undo 20 damage | Undo your last mistake without rewriting history. If only life had git revert. | Bjørn the Build Breaker, Pipeline Pass |
| `az pipelines run` | Standard | 30 damage (30% fail chance) | Trigger the pipeline. 30% chance it fails because someone used tabs in YAML. | Bjørn the Build Breaker (Gym 1), Pipeline Pass |
| `az deployment create` | Optimal | 60 delayed damage (1 turn charge) | Bicep template go brrr. Plan first, then land a heavy infrastructure hit. | Quest: Migrate the Legacy Stack, Pipeline Pass |
| `terraform apply` | Optimal | 50 damage to enemy buffs | Type 'yes' to confirm. Don't touch the state file. | Hidden: Server Graveyard, Pipeline Pass |
| `ansible-playbook` | Standard | 12 damage/turn for 3 turns | Automate everything. Idempotent, unless it isn't. | Quest: Automate the Fleet, Production Plains |
| `terraform plan` | Standard | Reveals enemy defence values | Preview before you wreck. No changes applied (yet). | Bjørn the Build Breaker, Pipeline Pass |

### 💀 IaC — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `git push --force` | Cursed | Wipes enemy's recent buffs (3 turns) | +1 Shame, −8 Rep. Deletes a random teammate's work. | The Force Pusher, The 3am Tavern |
| `merge without review` | Cursed | Win the current turn | +1 Shame, −10 Rep. Bug returns in 3 battles. | Merge Magda, The 3am Tavern |
| `git commit --no-verify` | Cursed | Bypass pre-checks | +1 Shame, −9 Rep. 50% chance next skill fails silently. | Skip-Tests Sigrid, The 3am Tavern |
| `git rebase -i HEAD~999` | Nuclear | Undo 3 turns | +2 Shame, −13 Rep. 30% chance own deck corrupts. | The Rebase Reverend, The 3am Tavern |

---

## 🐳 Containers — "It works on my machine. Ship the machine."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `docker build` | Standard | +50% damage on next skill | Build the image. Cache miss on every layer. | Docker Dag (Gym 4), Pipeline Pass |
| `docker compose up` | Optimal | Buff all stats ×1.2 for 2 turns | 27 services. 1 command. 0 chance they all work. Budget cost: 10. | Docker Dag (Gym 4), Pipeline Pass |
| `trivy image scan` | Standard | Reveals weaknesses + 10 defence debuff for 2 turns | Find vulnerabilities before Twitter does. | Quest: Supply Chain Security, Pipeline Pass |
| `multi-stage build` | Optimal | 45 damage | Strip the bloat. Ship only what matters. DevOps poetry. Budget cost: 5. | Docker Dag (Gym 4), Pipeline Pass |
| `docker stop` | Standard | Remove one enemy buff | Graceful shutdown. SIGTERM, wait 10 seconds, give up. | Docker Dag (Gym 4), Pipeline Pass |
| `docker system prune -a` | Standard | Heal 15 HP + restore 10 budget | Clean up dangling images, stopped containers, and your will to live. | npm Registry Market vendor, Pipeline Pass |
| `docker run --privileged` | Shortcut | Bypass one encounter gate | Run with all capabilities. Who needs isolation? | Hidden: node_modules Maze, Pipeline Pass |

### 💀 Containers — Cursed

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `container escape` | Cursed | 70 damage | +1 Shame, −12 Rep. Random encounters increase for 3 battles. | Hidden: Privileged Petra, node_modules Maze |

---

## ☸️ Kubernetes — "YAML is a love language. A painful one."

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `helm upgrade` | Optimal | ×1.25 damage buff for 3 turns | Rolling upgrade with zero downtime. Helm Hansen would be proud. | Helm Hansen, Helm Repository |
| `kubectl rollout restart` | Standard | Removes all enemy buffs | The Kubernetes equivalent of turning it off and on again. | Starter Deck, Localhost Town |
| `kubectl apply -f` | Optimal | 1-turn charge, then ×2 damage | Apply the manifest. Declarative violence. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `helm install` | Standard | Shield for 2 turns | Install a chart. Hope the values.yaml is right. | Helm Hansen, Helm Repository |
| `kubectl exec -it` | Standard | Reveals enemy's next move | SSH into a pod (but not really). Don't edit anything in there. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `kubectl scale --replicas=10` | Standard | +30% damage for 3 turns | More pods. More problems. More power. | The Kube-rnetes Master (Gym 5), Kubernetes Colosseum |
| `kubectl drain node` | Standard | Skip enemy turn | Evict all workloads from a node. The British approach to ops. | Quest: Node Maintenance Window, Kubernetes Colosseum |
| `kubectl logs -f` | Standard | Reveals enemy statuses and plan | Follow the breadcrumbs through a forest of JSON. | Helm Hansen, Helm Repository |

### 💀 Kubernetes — Cursed & Nuclear

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `kubectl delete ns prod` | Cursed | 80 damage | +1 Shame, −14 Rep. All services disrupted, 2-turn recovery. | kubectl Karen, The 3am Tavern |
| `kubectl delete pod --all` | Nuclear | Clears all enemy buffs and statuses | +2 Shame, −14 Rep. Lose 1 turn while services restart. | kubectl Karen, The 3am Tavern |

---

## 📊 Observability — "If it's not on a dashboard, it didn't happen."

Observability is the **support domain**. It doesn't deal damage — it reveals enemy information. A smart player always has at least one Observability skill in their deck.

| Skill | Tier | Effect | Description | Where to Learn |
|---|---|---|---|---|
| `az monitor alert create` | Standard | Reveals domain + tags weakness | Set an alert. Get paged at dinner. | The Solutions Oracle, Architecture District |
| `read the docs` | Standard | Reveals enemy weaknesses | The bravest move in engineering. Actually read the documentation. | Starter Deck, Localhost Town |
| `build Grafana dashboard` | Optimal | All enemy stats visible for rest of battle | Spend an hour making it pretty. Worth it. Budget cost: 15. | The Solutions Oracle, Architecture District |
| `PagerDuty acknowledge` | Standard | Pause SLA timer for 2 turns | Acknowledge the pain. Do not resolve it. | Quest: On-Call Survival Training, Production Plains |
| `KQL query` | Standard | Reveals enemy's next 3 moves | Write a KQL query. 47 results. None helpful. Reveals attack pattern anyway. | Azure Town diagnostic NPC, Production Plains |
| `define SLIs` | Optimal | Damage scales with turns observed | Measure what matters. The longer you watch, the harder you hit. | Quest: Define Your SLOs, Architecture District |
| `follow the runbook` | Standard | Heal 25 HP | Step 1: Don't panic. Step 2: Follow the runbook. Reliable. No drama. | Quest: Write Your First Runbook, Production Plains |

### 💀 Observability — Cursed

| Skill | Tier | Effect | Side Effect | Where to Learn |
|---|---|---|---|---|
| `ignore all alerts` | Cursed | Blinds both sides for 3 turns | +1 Shame, −10 Rep. SLA timer hidden. Breach risk increases. | Hidden: Backlog Graveyard ghost encounter, Jira Dungeon |

---

*"Every skill in this game is a real command. If you learn it here, you can use it for real." — Professor Pedersen*
