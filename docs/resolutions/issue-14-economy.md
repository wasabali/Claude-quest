## Resolution — Economy: Budget, Shops, and Currency

Welcome to Azure FinOps 101. The course nobody signed up for but everyone needs. Buckle up — we're designing the economy for a game where "the cloud is someone else's computer" and the bill always comes due.

---

### Q1 — Are There Shops? Is Budget = Azure Credits?

**Decision**: **Budget IS Azure Credits.** One currency, one stat, one existential crisis when it hits zero.

There is no separate "world currency." When you spend 50 budget on a skill in battle, that's 50 Azure Credits gone. When you buy a Red Bull from the Azure Town shop, that's budget too. This creates real tension: do you stock up on heals, or save budget for expensive skills in the next fight?

**Shops exist in two forms:**

1. **Azure Marketplace** — the main shop in Azure Town. Full inventory. Run by an NPC called **"The Billing Dashboard"** (they speak exclusively in cost-per-hour).
2. **Vending Machines** — scattered across regions. Limited stock (3-5 items), slightly overpriced (+10-20% markup). Appear in Pipeline Pass, Production Plains, and Kubernetes Colosseum. The vending machine in the 3am Tavern only accepts budget if your `shamePoints >= 3` (it has... special stock).

**Shop data shape** (new file: `src/data/shops.js`):

```js
const SHOPS = {
  azure_marketplace: {
    id: 'azure_marketplace',
    name: 'Azure Marketplace',
    location: 'azure_town',
    npc: 'the_billing_dashboard',
    priceMultiplier: 1.0,
    inventory: [
      { itemId: 'red_bull',              basePrice: 30, stock: -1 },  // -1 = unlimited
      { itemId: 'rollback_potion',       basePrice: 20, stock: -1 },
      { itemId: 'azure_credit_voucher',  basePrice: 40, stock: 3  },
      { itemId: 'skip_tests_scroll',     basePrice: 60, stock: 1  },
      { itemId: 'on_call_phone',         basePrice: 50, stock: 1  },
      { itemId: 'incident_postmortem',   basePrice: 15, stock: -1 },
    ],
    unlockCondition: null,  // available from start
  },
  pipeline_vending: {
    id: 'pipeline_vending',
    name: 'CI/CD Vending Machine',
    location: 'pipeline_pass',
    npc: null,  // no NPC — just a machine
    priceMultiplier: 1.15,
    inventory: [
      { itemId: 'red_bull',         basePrice: 30, stock: 5 },
      { itemId: 'rollback_potion',  basePrice: 20, stock: 5 },
      { itemId: 'cold_coffee',      basePrice: 5,  stock: 3 },
    ],
    unlockCondition: null,
  },
  three_am_vending: {
    id: 'three_am_vending',
    name: 'Suspicious Vending Machine',
    location: 'three_am_tavern',
    npc: null,
    priceMultiplier: 0.80,  // cheaper — but at what cost?
    inventory: [
      { itemId: 'scorched_server',   basePrice: 25, stock: 2 },
      { itemId: 'cold_coffee',       basePrice: 3,  stock: -1 },
      { itemId: 'skip_tests_scroll', basePrice: 40, stock: 1 },
    ],
    unlockCondition: { shameMin: 3 },
  },
}

export const getById = (id)           => SHOPS[id]
export const getAll  = ()             => Object.values(SHOPS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
```

**Price calculation** in `SkillEngine` or a new `ShopEngine`:
```js
function getPrice(shop, itemId, playerReputation) {
  const entry = shop.inventory.find(i => i.itemId === itemId)
  const repThreshold = getReputationThreshold(playerReputation)
  const repMod = 1 + (repThreshold.shopMod ?? 0)
  return Math.ceil(entry.basePrice * shop.priceMultiplier * repMod)
}
```

At Distinguished reputation (90+): 20% discount. At Walking Incident (0-19): 50% markup. The market has opinions about you.

---

### Q2 — How Does Budget Replenish?

**Three sources of budget income**, creating a natural flow:

#### After Battle — Partial Recovery
- Win: restore `15% of maxBudget` (starts at 75 credits)
- Lose: restore `5% of maxBudget` (25 credits — pity money)
- Optimal win bonus: +25 flat
- This keeps the player topped up enough to fight, but never flush

#### Quest Rewards — Full Recovery + Bonus
- Completing main quests: **full budget restore** + bonus credits
- Side quests: partial restore (25-50% of max)
- This incentivizes quest progression over grinding

#### Items
- `Azure Credit Voucher` (+50 budget) — buyable, droppable, questable
- New item: `Spot Instance Coupon` (+100 budget, but 30% chance it gets revoked mid-battle — the item disappears from inventory with an `"Instance terminated"` message)

#### Level Up
- Each level grants `+25 to maxBudget` (starting 500, cap at ~975 at level 20)
- Full budget restore on level up

**Budget replenishment constants** (in `src/config.js`):
```js
export const ECONOMY = {
  STARTING_BUDGET:       500,
  BUDGET_PER_LEVEL:      25,
  WIN_RESTORE_PERCENT:   0.15,
  LOSE_RESTORE_PERCENT:  0.05,
  OPTIMAL_WIN_BONUS:     25,
  QUEST_MAIN_RESTORE:    1.0,   // full
  QUEST_SIDE_RESTORE:    0.35,
}
```

---

### Q3 — Starting Budget and Price Scaling

**500 starting budget is "scarce-then-comfortable."** Here's the intended arc:

**Act 1 (Levels 1-5, Budget 500-625):**
- Skills cost 0-10 budget each
- Red Bull costs 30. You can afford ~16 before you're broke
- One bad fight where you spam expensive skills = shopping trip needed
- Feeling: "I need to be careful"

**Act 2 (Levels 6-10, Budget 650-750):**
- Skills cost 10-25 budget
- You've learned budgeting. Quests pay well. Shops feel affordable.
- The `cost_alert` status effect starts appearing — a preview of Act 3's pain
- Feeling: "I'm comfortable but not rich"

**Act 3 (Levels 11-15, Budget 775-875):**
- Nuclear skills cost 50-100 budget
- Boss fights can drain your entire budget in 4 turns
- The `Azure Bill` boss literally eats your credits
- Feeling: "Money is a weapon and I'm being outgunned"

**Act 4 (Levels 16-20, Budget 900-975):**
- You're a principal engineer. Budget is abundant but enemies are expensive.
- The final boss costs 150 budget per optimal skill use
- Feeling: "I can afford anything, but everything costs too much"

**Baseline item prices:**

| Item | Base Price | Notes |
|---|---|---|
| Cold Coffee | 5 | Barely worth the inventory slot |
| Rollback Potion | 20 | Bread and butter heal |
| Red Bull | 30 | The good heal |
| Incident Postmortem | 15 | XP boost after a loss |
| Azure Credit Voucher | 40 | Budget refill (meta!) |
| Skip Tests Scroll | 60 | Expensive but saves a turn |
| On-Call Phone | 50 | Applies on_call — use wisely |
| Spot Instance Coupon | 80 | Big refill, 30% eviction risk |
| Scorched Server | 25 | Cursed heal — only at 3am Tavern |

---

### Q4 — What Do Shops Sell?

**Shops sell consumables and docs only.** Never key items, credentials, or skills.

- **Consumables**: Heals, budget restores, status cures, battle buffs
- **Docs**: Lore items that grant XP when "read" (used from inventory)
- **NOT sold**: Key items (quest rewards only), credentials (earned through battles/quests), skills (taught by trainers only)

**Skill teachers are NOT in shops.** Skills are taught by:
1. Named trainers (beat them optimally)
2. Cursed trainers (find them in hidden areas)
3. Quests (complete specific objectives)
4. Shadow Engineer auto-learn at shame 10 (for `exec_xp_cmdshell`)

**Vending machine inventory refreshes** at the start of each Act. Limited-stock items don't come back within an Act. Plan accordingly.

---

### Q5 — Battle Rewards

**Yes, battles give Azure Credits.** The economy needs a grind source.

| Battle Outcome | Budget Reward |
|---|---|
| Incident win (optimal) | +40 credits + 15% restore |
| Incident win (standard) | +25 credits + 15% restore |
| Incident win (shortcut) | +15 credits + 15% restore |
| Incident win (cursed) | +5 credits + 15% restore |
| Incident win (nuclear) | +0 credits + 15% restore |
| Trainer win | +30 credits + 15% restore |
| Trainer loss | +0 credits + 5% restore |
| Wild encounter win | +20 credits + 15% restore |

The worse your solution quality, the less you earn. Cursed wins barely cover the cost of the cursed skill you used. Nuclear wins give nothing — you blew the budget to win.

---

### Q6 — Azure Bill Boss Mechanic

The `Azure Bill` is a boss encounter in Act 3 (Production Plains region). It's a living, breathing cost spiral.

**Boss mechanic**: `COST_SPIRAL`
- Turn 1: Boss has 100 HP. Skills cost normal budget.
- Turn 2: Boss gains +20 HP. All YOUR skills cost +5 budget.
- Turn 3: Boss gains +20 HP. All YOUR skills cost +10 budget.
- Turn N: Boss gains +20 HP. All YOUR skills cost +(5×N) budget.

The boss doesn't deal HP damage — it deals **budget damage**. Every turn it exists, your skills get more expensive. At turn 6, even basic skills cost 30+ budget extra. At turn 10, you literally cannot afford to act.

**Optimal strategy**: End the fight fast. Use the `cost_optimization` skill (cloud domain, reduces budget cost by 50% for 2 turns). The boss is weak to the `finops` emblem's passive.

**If you run out of budget mid-fight**: You don't lose. You can still use skills that cost 0 budget (like `blame_dns`, `read_the_docs`). But your good skills become unavailable. The boss essentially throttles you into using suboptimal solutions — which feels exactly like a real Azure bill surprise.

```js
// In encounters.js — boss entry
azure_bill_spike: {
  id: 'azure_bill_spike',
  type: 'incident',
  name: 'Azure Bill Spike',
  symptomText: 'A cost alert has been triggered. The bill is... growing.',
  rootCauseText: 'Someone left 47 GPU instances running over the weekend.',
  domain: 'cloud',
  hp: 100,
  sla: 8,
  difficulty: 4,
  attacks: [
    { id: 'cost_spiral', effect: { type: 'budget_drain_escalating', baseValue: 5 } },
    { id: 'reserved_instance_trap', effect: { type: 'lock_skill', duration: 2 } },
  ],
  optimalFix: 'cost_optimization',
  bossFlag: 'cost_spiral_active',
  layers: [],
}
```

---

### Q7 — Budget Debt

**Decision**: **Yes, the player CAN go into budget debt.** But it hurts.

**When budget hits 0:**
- A `COST_ALERT` banner flashes on the HUD: `⚠ BUDGET EXCEEDED`
- Skills that cost budget are still usable, but they push budget negative
- Every point of negative budget adds +0.1 stacks of `technical_debt` (rounded per battle)
- At -100 budget: automatic `cost_alert` status effect (2× budget drain) — the spiral accelerates
- At -200 budget: `The Billing Dashboard` NPC appears in your next overworld step with a "payment plan" — a mandatory side quest to restore budget to 0

**Budget debt caps at -300.** At -300, the game triggers a forced encounter: `"AZURE SUBSCRIPTION SUSPENDED"` — a special incident that can only be resolved by using `cost_optimization` or completing the Billing Dashboard's payment quest.

**This never causes a game over.** The player always has 0-cost skills and can always fight their way out. But debt makes everything harder, which is... realistic.

**Data shape** (in `src/config.js`):
```js
export const BUDGET_DEBT = {
  DEBT_LIMIT:            -300,
  COST_ALERT_THRESHOLD:  -100,
  DEBT_PER_BATTLE_MOD:   0.1,   // technical_debt stacks per negative budget point
  SUSPENSION_THRESHOLD:  -300,
  SUSPENSION_ENCOUNTER:  'azure_subscription_suspended',
}
```

---

### Files Affected

| File | Changes |
|---|---|
| `src/config.js` | Add `ECONOMY` constants and `BUDGET_DEBT` thresholds |
| `src/data/shops.js` | **New file** — shop definitions following registry pattern |
| `src/data/items.js` | Add `Spot Instance Coupon` item |
| `src/data/encounters.js` | Flesh out `azure_bill_spike` boss with `cost_spiral` mechanic |
| `src/engine/BattleEngine.js` | Post-battle budget restore logic, cost spiral phase |
| `src/engine/SkillEngine.js` | Budget cost calculations, debt penalty application |
| `src/state/GameState.js` | No structural changes (budget field exists, can go negative) |
| `src/scenes/WorldScene.js` | Shop interaction UI trigger |
| `src/scenes/ShopScene.js` | **New scene** — shop UI with buy/sell, price display |
| Content bible | Add economy section |

### Follow-ups

- [ ] New issue: Implement ShopScene (buy/sell UI with reputation-based pricing)
- [ ] New issue: Azure Bill boss fight implementation (cost spiral phase)
- [ ] New issue: Budget debt system + subscription suspension encounter
- [ ] New issue: Vending machine interactions in overworld
- [ ] New issue: Design "Spot Instance Coupon" — the world's most stressful heal item
- [ ] New issue: The Billing Dashboard NPC — design, dialogue, payment quest chain

### Content Bible Update

Add section **"6.0 Economy"** with:
- Budget = Azure Credits (single currency)
- Replenishment rules (win/loss/quest/level-up percentages)
- Price table for all items
- Shop locations and inventory
- Budget debt mechanics and thresholds
- Azure Bill boss cost spiral spec
- Battle reward table by solution quality
- Vending machine markup and availability rules
