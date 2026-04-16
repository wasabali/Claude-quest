# Tips & Tricks

Stuck? Not sure what to do next? Here's a spoiler-light guide to help you through Cloud Quest.

---

## General Strategy

### 1. Always Diagnose First

In incident battles, spend your first turn using an Observability skill (`read the docs`, `grep "ERROR" /var/log/*`, `az monitor alert create`). Revealing the enemy domain lets you hit with ×2 damage — that one turn investment pays for itself immediately.

With the current encounter data, incident SLAs give you at least 2 turns, so diagnosing first is almost always the right call.

### 2. Build a Balanced Deck

You can hold 6 active skills. A good deck includes:
- **1 Observability skill** — for revealing domains (essential)
- **2–3 damage skills** from different domains — for matchup flexibility
- **1 heal/utility skill** — for staying alive
- **1–2 situational picks** — shields, buffs, or your strongest attack

### 3. Pay Attention to Telegraphs

In engineer battles, trainers telegraph their next move through dialog. If the trainer says something like *"This cluster hasn't been healthy since the last deploy..."* they're probably about to use a Kubernetes skill. Counter with a Linux skill (Linux beats Kubernetes in the matchup cycle).

### 4. Don't Ignore Budget

Skills with budget costs are often powerful, but budget doesn't regenerate quickly. Save expensive skills for when they'll make the biggest difference. `docker system prune -a` restores 10 budget and heals 15 HP — a great utility option.

### 5. Read Everything

- **Outdated Runbook** gives +5 XP on first read
- **Incident Postmortem** gives +20 XP (but only after a loss)
- NPC dialog often contains hints about domain matchups and hidden areas
- The in-game StackOverflow threads teach you which skills are effective where

---

## Domain Matchup Cheatsheet

Print this. Tape it to your monitor. You'll need it.

```
Linux     → beats → Security
Security  → beats → Serverless
Serverless→ beats → Cloud
Cloud     → beats → IaC
IaC       → beats → Containers
Containers→ beats → Kubernetes
Kubernetes→ beats → Linux
```

**Strong = ×2 damage. Weak = ×0.5 damage. Neutral = ×1.**

**Quick memory trick:** Think of it as a cycle of "what solves the problem at a lower level":
- Linux fundamentals beat Security misconfigs
- Security policies beat Serverless chaos
- Serverless simplicity beats Cloud complexity
- Cloud platforms beat IaC drift
- IaC automation beats Container sprawl
- Container isolation beats Kubernetes complexity
- Kubernetes orchestration beats Linux manual work

---

## When You're Stuck

### "I can't beat this trainer"

- Check the matchup cycle. What domain is the trainer? Bring skills from the domain that beats them.
- Level up a bit. Fight some common encounters in the area for XP.
- Bring a heal skill. `systemctl restart` (20 HP) or `follow the runbook` (25 HP) keep you alive.
- Equip your best Observability skill and study the trainer's pattern before going all-in.

### "I can't find the right skill for this area"

- Talk to every NPC. They often point you toward where to learn specific commands.
- Backtrack to previous areas. Some trainers teach skills that are useful later.
- Check your quest log. Quest rewards often include skill unlocks.

### "I keep running out of budget"

- Use budget-free skills as your staples
- `docker system prune -a` restores 10 budget
- The **FinOps Emblem** restores 10% budget after each battle
- Azure Credit Vouchers restore 50 budget — save them for tough fights
- `cost optimization` drains enemy budget instead of spending yours

### "The SLA timer keeps running out"

- Use `PagerDuty acknowledge` to pause the SLA timer for 2 turns
- Diagnose ASAP — knowing the domain means ×2 damage, which ends fights faster
- For short-SLA encounters (2–3 turns), memorize common encounter domains per region (see [Encounters](encounters.md))
- Bring high-damage skills. Sometimes raw power is better than being clever.

### "My HP is too low"

- Technical Debt reduces Max HP. Do cleanup quests to clear it.
- Healing skills: `systemctl restart` (20 HP), `follow the runbook` (25 HP), `certbot renew` (15 HP)
- Healing items: Red Bull (30 HP), Rollback Potion (20 HP)
- The **SRE Emblem** adds +10 Max HP permanently

### "I have too much Shame"

Shame is permanent — you can't reduce it. But you can:
- Embrace it. The evil path has great content.
- Lean into it — at Shame 7, THROTTLEMASTER makes contact and opens new storyline options.
- Focus on keeping Reputation high — a high-Rep, high-Shame character sees unique content.

---

## Region-Specific Tips

### Pipeline Pass (Act 1)
- Most encounters here are IaC or Containers domain
- `git revert` is your best friend — free heal for 20 HP
- Bjørn's gym queues 3 moves ahead — read his queue and counter each move

### Production Plains (Act 2)
- Cloud-domain encounters dominate. Bring Serverless skills (Serverless beats Cloud).
- The SEV1 at 3am encounter is brutal — SLA 2, difficulty 5. Avoid if you're underleveled.
- Captain Nines' gym has an SLA timer. Speed kills.

### Jira Dungeon (Act 3)
- Many Observability-domain encounters. These are tricky because Observability has no matchup weakness.
- The Gantt Chart is a cursed encounter with SLA 3 — bring your strongest skills.
- Stale Tickets can be surprisingly annoying. Don't underestimate them.

### Kubernetes Colosseum (Act 3)
- All Kubernetes, all the time. Bring Linux skills (Linux beats Kubernetes).
- The YAML Labyrinth is the hardest encounter here — SLA 2, 60 HP, difficulty 5.
- The Kube-rnetes Master's pods respawn 3× — you need sustained damage, not burst.

---

## Miscellaneous Tips

- **Save often.** Export your `.cloudquest` file regularly. There's no auto-save.
- **Try wrong answers.** The game never blocks you. Bad solutions lead to interesting consequences.
- **Check the time.** Something special happens between 2:57am and 3:05am.
- **Don't drop the node_modules.** Just trust me.
- **NPCs say "don't do this."** Sometimes that's exactly what you should do.
- **The Rubber Duck** is your debug companion. Use it in the overworld for hints.

---

*"It's always DNS." — The correct answer to approximately 40% of Cloud Quest encounters*
