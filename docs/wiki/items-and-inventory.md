# Items & Inventory

Your inventory has five tabs: **Tools**, **Key Items**, **Credentials**, **Docs**, and **Junk**. Items are found in the world, given as quest rewards, dropped by encounters, or bought in shops.

---

## 🔧 Tools

Consumable items you can use in battle or the overworld.

| Item | Usable in Battle? | Effect | Description |
|---|---|---|---|
| **Red Bull** | ✅ | Heal 30 HP | 3am fuel. |
| **Rollback Potion** | ✅ | Heal 20 HP | Reverts the latest bad deploy. |
| **Azure Credit Voucher** | ✅ | Restore 50 Budget | No questions asked. |
| **Skip Tests Scroll** | ✅ | Bypass one skill check | Your karma takes the hit. |
| **On-Call Phone** | ❌ (overworld only) | Applies "on_call" status | Picks up the pager rotation immediately. |

---

## 🔑 Key Items

Important items that unlock areas or advance the story. These can't be dropped.

| Item | Effect | Description |
|---|---|---|
| **SSH Key (Staging)** | Unlocks staging server doors | Your gateway to Staging Valley. |
| **Staging Env Token** | Required to enter Staging Valley | Without this, the guards won't let you through. |
| **Terraform State** | *(none — key item)* | Don't touch it. Don't move it. Seriously. |

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
| **Outdated Runbook** | +5 XP on first read | Half the steps are wrong. Still educational. |
| **Incident Postmortem** | +20 XP (only if you lost your last battle) | Painful reading, but you learn the most from failure. |

**Tip:** Always read the Incident Postmortem after a loss. +20 XP is generous, and it only works if your last battle was a defeat.

---

## 🗑️ Junk

Items that seem useless but... are they?

| Item | Can Drop? | Description |
|---|---|---|
| **Root Password (sticky note)** | ✅ | Found in Margaret's house. Useless. Horrifying. |
| **Mystery node_modules** | ❌ | 47,000 files. Does nothing. Can't delete. "An inexplicable dependency forest." |
| **Stale PR** | ✅ | Open since 2019. Nobody will merge it. |

**Hint:** Don't be too quick to discard junk items. Some of them might be more useful than they look... 👀

---

## Item Sources

| Source | What You Get |
|---|---|
| **Quest rewards** | Key items, tools, credentials |
| **Trainer wins** | Occasionally drop tools |
| **World exploration** | Docs, junk items, hidden items |
| **Shops (Azure Town)** | Tools, healing items |
| **Incident resolves** | Budget, sometimes tools |

---

*"47,000 files. Does nothing. Can't delete." — Mystery node_modules tooltip*
