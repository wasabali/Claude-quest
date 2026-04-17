# Items & Inventory

Your inventory has five tabs: **Tools**, **Key Items**, **Credentials**, **Docs**, and **Junk**. Items are found in the world, given as quest rewards, dropped by encounters, or bought in shops.

---

## 🔧 Tools

Consumable items you can use in battle or the overworld.

| Item | Usable in Battle? | Effect | Description |
|---|---|---|---|
| **Red Bull** | ✅ | Heal 30 HP | 3am fuel. Restores 30 HP. |
| **Rollback Potion** | ✅ | Heal 20 HP | Reverts the latest bad deploy. |
| **Azure Credit Voucher** | ✅ | Restore 50 Budget | Restore 50 Budget. No questions asked. |
| **Skip Tests Scroll** | ✅ | Bypass one skill check | Bypass one skill check. Your karma takes the hit. |
| **On-Call Phone** | ❌ (overworld only) | Applies "on_call" status | Picks up the pager rotation immediately. |
| **Coffee and an Apology** | ❌ (overworld only) | Reduces 1 Shame Point | A lukewarm coffee and a sticky note that says 'sorry about the deploy.' Reduces 1 Shame Point. The coffee is bad. The apology is genuine. Mostly. |

---

## 🔑 Key Items

Important items that unlock areas or advance the story. These can't be dropped.

| Item | Description |
|---|---|
| **SSH Key (Staging)** | Unlocks staging server doors. |
| **Staging Env Token** | Required to enter Staging Valley. |
| **Terraform State** | Don't touch it. Don't move it. |
| **Cross-Origin-Opener-Policy** | Value: same-origin. You found this in a config file. It looked important. |
| **Cross-Origin-Embedder-Policy** | Value: require-corp. Nobody knows why this is needed. It just is. |

---

## 🎫 Credentials

Authentication tokens and certificates. You need these for certain battles and areas.

| Item | Description |
|---|---|
| **Azure Service Principal Cert** | Auth token for Azure battles. |
| **Cloud Cert** | Validates your access level. |

---

## 📄 Docs

Readable items that grant XP or provide information.

| Item | Effect | Description |
|---|---|---|
| **Outdated Runbook** | +5 XP on first read | Half the steps are wrong. Still +5 XP. |
| **Incident Postmortem** | +20 XP if your last battle was lost | Painful reading, but educational. |
| **Published Post-Mortem** | Reduces 1 Shame Point | You wrote a blameless post-mortem. You named your mistakes. People read it. Reduces 1 Shame Point. The damage is done, but at least you owned it. |

---

## 🗑️ Junk

Worthless items. Or are they?

| Item | Description |
|---|---|
| **Root Password (sticky note)** | Found in Margaret's house. Useless. Horrifying. |
| **Mystery node_modules** | An inexplicable dependency forest. |
| **Stale PR** | Open since 2019. Nobody will merge it. |
| **Cold Coffee** | Margaret's thanks. It was warm when she made it. You took too long. |
| **Scorched Server** | Still smoking. A monument to your choices. A cursed salvage that restores 20 HP. |

---

*Auto-generated from `src/data/items.js` by `scripts/generate-wiki.js`*
