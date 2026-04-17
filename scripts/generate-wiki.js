#!/usr/bin/env node
// scripts/generate-wiki.js
//
// Reads all src/data/*.js exports and regenerates docs/wiki/ pages.
// Run: node scripts/generate-wiki.js
// npm script: npm run wiki:generate

import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')
const WIKI_DIR  = resolve(ROOT, 'docs/wiki')

// ─── Data imports ────────────────────────────────────────────────────────────
import { getAll as getAllSkills }      from '../src/data/skills.js'
import { getAll as getAllTrainers }    from '../src/data/trainers.js'
import { getAll as getAllEncounters, ENCOUNTER_POOLS } from '../src/data/encounters.js'
import { getAll as getAllItems }       from '../src/data/items.js'
import { getAll as getAllEmblems }     from '../src/data/emblems.js'

// ─── Domain emoji mapping (matches existing wiki style) ──────────────────────
const DOMAIN_EMOJI = {
  linux:         '🐧',
  security:      '🔒',
  serverless:    '⚡',
  cloud:         '☁️',
  iac:           '🏗️',
  containers:    '🐳',
  kubernetes:    '☸️',
  observability: '📊',
}

const DOMAIN_LABELS = {
  linux:         'Linux',
  security:      'Security',
  serverless:    'Serverless',
  cloud:         'Cloud',
  iac:           'IaC',
  containers:    'Containers',
  kubernetes:    'Kubernetes',
  observability: 'Observability',
}

const DOMAIN_TAGLINES = {
  linux:         '"If you can\'t grep, you can\'t debug."',
  security:      '"Lock it down or watch it burn."',
  serverless:    '"Pay per invocation. Die per timeout."',
  cloud:         '"Scale up. Bill up. Freak out."',
  iac:           '"Infrastructure as Code. Bugs as YAML."',
  containers:    '"Ship it in a box. Hope it fits."',
  kubernetes:    '"It\'s not complicated. You just don\'t understand it."',
  observability: '"You can\'t fix what you can\'t see."',
}

function difficultyStars(n) {
  return '⭐'.repeat(Math.min(n, 5))
}

function formatLocation(loc) {
  if (!loc) return ''
  return loc.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function effectDescription(skill) {
  const e = skill.effect
  if (!e) return '—'
  switch (e.type) {
    case 'damage':                        return `${e.value} damage`
    case 'heal':                          return `Heals ${e.value} HP`
    case 'heal_and_budget':               return `Heal ${e.heal} HP + ${e.budget} Budget`
    case 'heal_and_prevent':              return `Heal ${e.heal} HP, prevent ${e.preventStatus} for ${e.turns} turns`
    case 'dot_damage':                    return `${e.value} damage/turn for ${e.turns} turns`
    case 'multi_hit':                     return `${e.value} damage × ${e.turns} hits`
    case 'delayed_damage':                return `${e.value} damage after ${e.turns} turn delay`
    case 'charge_attack':                 return `Charge 1 turn, then ×${e.multiplier} damage`
    case 'scale_damage':                  return `${e.baseValue}+ damage (scales with ${(e.scalesWith || '').replace(/_/g, ' ')})`
    case 'scale_with_observation':        return `${e.baseValue}+ damage (scales with observations)`
    case 'damage_enemy_buffs':            return `${e.value} damage (scales with enemy buffs)`
    case 'reveal_domain':                 return 'Reveals enemy domain'
    case 'reveal':                        return 'Reveals enemy info'
    case 'reveal_next_move':              return "Reveals enemy's next move"
    case 'reveal_next_moves':             return `Reveals enemy's next ${e.value} moves`
    case 'reveal_all_stats':              return 'Reveals all enemy stats'
    case 'reveal_all_permanent':          return 'Reveals all enemy stats (permanent)'
    case 'reveal_weaknesses':             return 'Reveals enemy weaknesses'
    case 'reveal_defenses':               return 'Reveals enemy defenses'
    case 'reveal_statuses_and_plan':      return 'Reveals enemy statuses and plan'
    case 'reveal_and_debuff':             return `Reveal weaknesses + ${e.value} defence debuff for ${e.turns} turns`
    case 'reveal_and_tag_weakness':       return 'Reveals and tags enemy weakness'
    case 'confuse':                       return `${Math.round((e.chance ?? 0.5) * 100)}% chance to confuse`
    case 'blind_both':                    return `Blind both sides for ${e.turns} turns`
    case 'freeze_turn':                   return `Freezes battle for ${e.turns ?? 1} turn`
    case 'skip_enemy_turn':               return 'Skips enemy turn'
    case 'defence_buff':                  return `+${e.value} defence for ${e.turns} turns`
    case 'buff':                          return `×${e.value} buff for ${e.turns} turns`
    case 'buff_all':                      return `×${e.value} buff all skills for ${e.turns} turns`
    case 'buff_next_damage':              return `×${e.multiplier} next damage`
    case 'shield':                        return `Shield for ${e.turns} turns`
    case 'immunity':                      return `Immune to damage for ${e.turns} turns`
    case 'reflect_damage':                return `Reflect ${e.percent}% damage for ${e.turns} turns`
    case 'lock_buffs':                    return `Lock buffs for ${e.turns} turns`
    case 'temp_max_hp_boost':             return `+${e.value} max HP for ${e.turns} turns`
    case 'cleanse_status':                return `Clears "${e.value}" status`
    case 'cleanse_and_buff':              return `Cleanse all debuffs + ${e.defence} defence for ${e.turns} turns`
    case 'prevent_status':                return `Prevent status effects for ${e.turns} turn`
    case 'trap':                          return `${e.value} damage trap on enemy action`
    case 'budget_drain':                  return `Drain ${e.value} budget/turn for ${e.turns} turns`
    case 'pause_sla':                     return `Pause SLA for ${e.turns} turns`
    case 'hide_enemy_skill':              return `Hide enemy skill for ${e.turns} turns`
    case 'undo_damage':                   return `Undo ${e.value} damage`
    case 'undo_turns':                    return `Undo ${e.turns} turns`
    case 'wipe_all_statuses_and_buffs':   return 'Wipes all statuses and buffs (both sides)'
    case 'wipe_enemy_recent_buffs':       return `Wipe enemy buffs (last ${e.turns} turns)`
    case 'remove_permission_status':      return 'Removes all permission statuses'
    case 'remove_enemy_buffs':            return 'Removes all enemy buffs'
    case 'remove_one_buff':               return `Remove one ${e.target} buff`
    case 'clear_enemy_buffs_and_statuses': return 'Clears all enemy buffs and statuses'
    case 'solve_auth_challenge':          return 'Solves auth challenge instantly'
    case 'bypass_prechecks':              return 'Bypass pre-commit hooks'
    case 'bypass_encounter_check':        return `Bypass encounter check for ${e.turns} turn`
    case 'instant_win':                   return 'Instant win'
    case 'instant_win_vs_containers':     return 'Instant win vs containers'
    case 'instant_win_vs_legacy':         return 'Instant win vs legacy systems'
    case 'win_turn':                      return 'Win the turn'
    case 'full_heal':                     return 'Full heal'
    case 'full_heal_after_delay':         return `Full heal after ${e.turns} turn delay`
    default: {
      // Readable fallback: replace underscores, include value if present
      const label = e.type.replace(/_/g, ' ')
      const val   = e.value !== undefined ? ` (${e.value})` : ''
      return `${label}${val}`
    }
  }
}

function sideEffectDescription(skill) {
  const se = skill.sideEffect
  if (!se) return '—'
  const parts = []
  if (se.shame)      parts.push(`+${se.shame} Shame`)
  if (se.reputation) parts.push(`${se.reputation} Rep`)
  if (se.extra)      parts.push(se.extra)
  return parts.join(', ') || '—'
}

// ─── Skills Reference ────────────────────────────────────────────────────────
function generateSkillsReference() {
  const allSkills = getAllSkills()
  const domains   = [...new Set(allSkills.map(s => s.domain))]

  // Use the matchup cycle order
  const domainOrder = ['linux', 'security', 'serverless', 'cloud', 'iac', 'containers', 'kubernetes', 'observability']
  domains.sort((a, b) => domainOrder.indexOf(a) - domainOrder.indexOf(b))

  let md = `# Skills Reference

Every skill in Cloud Quest is a real CLI command. This page lists them all, organized by domain.

**Active skill deck limit:** 6 skills. Choose wisely.

> **Note:** Some skill effects described below (e.g., damage-over-time, reveal next moves, confuse, immunity, traps, reflection) are defined in the game data but **not yet fully resolved in battle**. The current BattleEngine processes \`damage\`, \`heal\`, and domain reveal effects. Other effect types will be implemented in future updates — for now, treat their descriptions as design intent.

---
`

  for (const domain of domains) {
    const emoji    = DOMAIN_EMOJI[domain] || '❓'
    const label    = DOMAIN_LABELS[domain] || domain
    const tagline  = DOMAIN_TAGLINES[domain] || ''
    const skills   = allSkills.filter(s => s.domain === domain)
    const normal   = skills.filter(s => !s.isCursed)
    const cursed   = skills.filter(s => s.isCursed)

    md += `\n## ${emoji} ${label} — ${tagline}\n\n`

    if (normal.length > 0) {
      md += '| Skill | Tier | Effect | Description | Where to Learn |\n'
      md += '|---|---|---|---|---|\n'
      for (const s of normal) {
        const where = [s.learnedFrom, formatLocation(s.learnedAt)].filter(Boolean).join(', ')
        const budgetNote = s.budgetCost > 0 ? ` Budget cost: ${s.budgetCost}.` : ''
        md += `| \`${s.displayName}\` | ${s.tier.charAt(0).toUpperCase() + s.tier.slice(1)} | ${effectDescription(s)} | ${s.description}${budgetNote} | ${where} |\n`
      }
    }

    if (cursed.length > 0) {
      md += `\n### 💀 ${label} — Cursed & Nuclear\n\n`
      md += '| Skill | Tier | Effect | Side Effect | Where to Learn |\n'
      md += '|---|---|---|---|---|\n'
      for (const s of cursed) {
        const where = [s.learnedFrom, formatLocation(s.learnedAt)].filter(Boolean).join(', ')
        md += `| \`${s.displayName}\` | ${s.tier.charAt(0).toUpperCase() + s.tier.slice(1)} | ${effectDescription(s)} | ${sideEffectDescription(s)} | ${where} |\n`
      }
    }

    md += '\n---\n'
  }

  // Stats summary
  const byDomain = {}
  for (const s of allSkills) {
    byDomain[s.domain] = (byDomain[s.domain] || 0) + 1
  }
  md += `\n## 📊 Stats\n\n`
  md += `- **Total skills:** ${allSkills.length}\n`
  md += `- **By domain:** ${domains.map(d => `${DOMAIN_LABELS[d]} (${byDomain[d]})`).join(', ')}\n`
  md += `- **Cursed/Nuclear:** ${allSkills.filter(s => s.isCursed).length}\n`

  md += `\n---\n\n*Auto-generated from \`src/data/skills.js\` by \`scripts/generate-wiki.js\`*\n`
  return md
}

// ─── Trainers ────────────────────────────────────────────────────────────────
function generateTrainers() {
  const allTrainers = getAllTrainers()
  const good   = allTrainers.filter(t => !t.isCursed && !t.isWildEncounter)
  const cursed = allTrainers.filter(t => t.isCursed)
  const wild   = allTrainers.filter(t => t.isWildEncounter && !t.isCursed)

  let md = `# Trainers

Trainers are engineer NPCs scattered across the world. Beat them in battle and they may teach you their **signature skill**.

---

## Good Trainers

These are the engineers who fight fair and teach you real skills.

| Name | Domain | Location | Difficulty | Signature Skill | Notes |
|---|---|---|---|---|---|
`
  for (const t of good) {
    const emoji    = DOMAIN_EMOJI[t.domain] || '❓'
    const label    = DOMAIN_LABELS[t.domain] || t.domain
    const location = formatLocation(t.location || 'unknown')
    const sig      = t.signatureSkill ? `\`${t.signatureSkill.replace(/_/g, ' ')}\`` : '—'
    const intro    = t.introDialog ? t.introDialog.slice(0, 60) + (t.introDialog.length > 60 ? '…' : '') : ''
    md += `| **${t.name}** | ${emoji} ${label} | ${location} | ${difficultyStars(t.difficulty)} | ${sig} | ${intro} |\n`
  }

  md += `
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
`
  for (const t of cursed) {
    const emoji    = DOMAIN_EMOJI[t.domain] || '❓'
    const label    = DOMAIN_LABELS[t.domain] || t.domain
    const location = formatLocation(t.location || 'unknown')
    const teach    = t.teachSkillId ? `\`${t.teachSkillId.replace(/_/g, ' ')}\`` : '—'
    md += `| **${t.name}** | ${emoji} ${label} | ${teach} | ${t.shameRequired || 0} | ${location} |\n`
  }

  md += `
### About Cursed Trainers

- Cursed trainers often require **Shame Points** to access (usually Shame ≥ 2)
- Their techniques bypass domain matchups — they work on everything
- Every cursed technique costs Shame (+1) and Reputation loss
- Nuclear techniques are even worse: +2 Shame, massive rep loss, lasting side effects
- Shame is **permanent** — it never goes down. See [Reputation & Shame](reputation-and-shame.md)
`

  if (wild.length > 0) {
    md += `\n---\n\n## Wild Encounters\n\nThese trainers appear randomly in the world.\n\n`
    md += '| Name | Domain | Difficulty | Location |\n|---|---|---|---|\n'
    for (const t of wild) {
      const emoji    = DOMAIN_EMOJI[t.domain] || '❓'
      const label    = DOMAIN_LABELS[t.domain] || t.domain
      const location = formatLocation(t.location || 'any')
      md += `| **${t.name}** | ${emoji} ${label} | ${difficultyStars(t.difficulty)} | ${location} |\n`
    }
  }

  md += `\n---\n\n*Auto-generated from \`src/data/trainers.js\` by \`scripts/generate-wiki.js\`*\n`
  return md
}

// ─── Encounters ──────────────────────────────────────────────────────────────
function generateEncounters() {
  const allEncounters = getAllEncounters()

  let md = `# Encounters

Random encounters happen as you explore the world. Each region has its own **encounter pool** divided by rarity. You'll face incidents — technical problems that need solving before the SLA timer runs out.

---

## How Encounters Work

1. As you move through a region, there's a chance of triggering a random encounter
2. The encounter is drawn from the region's pool based on rarity weights:
   - **Common:** 70% chance
   - **Rare:** 25% chance
   - **Cursed:** 5% chance (only if the pool has cursed encounters)
3. You enter battle against the incident
4. The incident shows **symptoms** — you see what's wrong but not the root cause
5. Use an Observability skill to reveal the **domain** — then attack with a matching domain for ×2 damage
6. Resolve it before the **SLA timer** hits 0

---

## Encounter Pools by Region
`

  for (const [regionId, pool] of Object.entries(ENCOUNTER_POOLS)) {
    const hasEncounters = [...pool.common, ...pool.rare, ...pool.cursed].length > 0
    if (!hasEncounters) continue

    const regionName = formatLocation(regionId)
    md += `\n### ${regionName}\n\n`
    md += '| Rarity | Encounter | Domain | HP | SLA | Difficulty |\n'
    md += '|---|---|---|---|---|---|\n'

    for (const [rarity, ids] of [['Common', pool.common], ['Rare', pool.rare], ['Cursed', pool.cursed]]) {
      for (const encId of ids) {
        const enc = allEncounters.find(e => e.id === encId)
        if (!enc) continue
        const emoji = DOMAIN_EMOJI[enc.domain] || '❓'
        const label = DOMAIN_LABELS[enc.domain] || enc.domain
        md += `| ${rarity} | ${enc.name} | ${emoji} ${label} | ${enc.hp} | ${enc.sla} | ${difficultyStars(enc.difficulty)} |\n`
      }
    }
  }

  md += `\n---\n\n## All Encounters\n\n`
  md += '| Name | Domain | HP | SLA | Difficulty | Optimal Fix |\n'
  md += '|---|---|---|---|---|---|\n'
  for (const enc of allEncounters.sort((a, b) => a.difficulty - b.difficulty)) {
    const emoji = DOMAIN_EMOJI[enc.domain] || '❓'
    const label = DOMAIN_LABELS[enc.domain] || enc.domain
    const fix   = enc.optimalFix ? `\`${enc.optimalFix.replace(/_/g, ' ')}\`` : '—'
    md += `| ${enc.name} | ${emoji} ${label} | ${enc.hp} | ${enc.sla} | ${difficultyStars(enc.difficulty)} | ${fix} |\n`
  }

  md += `\n---\n\n*Auto-generated from \`src/data/encounters.js\` by \`scripts/generate-wiki.js\`*\n`
  return md
}

// ─── Items & Inventory ───────────────────────────────────────────────────────
function generateItems() {
  const allItems = getAllItems()

  const TAB_EMOJI = { tools: '🔧', keyItems: '🔑', credentials: '🎫', docs: '📄', junk: '🗑️' }
  const TAB_LABEL = { tools: 'Tools', keyItems: 'Key Items', credentials: 'Credentials', docs: 'Docs', junk: 'Junk' }
  const TAB_DESC  = {
    tools:       'Consumable items you can use in battle or the overworld.',
    keyItems:    "Important items that unlock areas or advance the story. These can't be dropped.",
    credentials: 'Authentication tokens and certificates. You need these for certain battles and areas.',
    docs:        'Readable items that grant XP or provide information.',
    junk:        'Worthless items. Or are they?',
  }

  let md = `# Items & Inventory

Your inventory has five tabs: **Tools**, **Key Items**, **Credentials**, **Docs**, and **Junk**. Items are found in the world, given as quest rewards, dropped by encounters, or bought in shops.

---
`

  const tabOrder = ['tools', 'keyItems', 'credentials', 'docs', 'junk']
  for (const tab of tabOrder) {
    const items = allItems.filter(i => i.tab === tab)
    if (items.length === 0) continue

    const emoji = TAB_EMOJI[tab]
    const label = TAB_LABEL[tab]
    const desc  = TAB_DESC[tab]

    md += `\n## ${emoji} ${label}\n\n${desc}\n\n`

    if (tab === 'tools') {
      md += '| Item | Usable in Battle? | Effect | Description |\n'
      md += '|---|---|---|---|\n'
      for (const item of items) {
        const battle = item.usableInBattle ? '✅' : '❌ (overworld only)'
        const effect = item.effect ? effectDescriptionForItem(item.effect) : '—'
        md += `| **${item.displayName}** | ${battle} | ${effect} | ${item.description} |\n`
      }
    } else if (tab === 'docs') {
      md += '| Item | Effect | Description |\n'
      md += '|---|---|---|\n'
      for (const item of items) {
        const effect = item.effect ? effectDescriptionForItem(item.effect) : '*(none)*'
        md += `| **${item.displayName}** | ${effect} | ${item.description} |\n`
      }
    } else {
      md += '| Item | Description |\n'
      md += '|---|---|\n'
      for (const item of items) {
        md += `| **${item.displayName}** | ${item.description} |\n`
      }
    }

    md += '\n---\n'
  }

  md += `\n*Auto-generated from \`src/data/items.js\` by \`scripts/generate-wiki.js\`*\n`
  return md
}

function effectDescriptionForItem(effect) {
  if (!effect) return '—'
  switch (effect.type) {
    case 'heal_hp':         return `Heal ${effect.value} HP`
    case 'restore_budget':  return `Restore ${effect.value} Budget`
    case 'bypass_skill_check': return 'Bypass one skill check'
    case 'status_apply':    return `Applies "${effect.status}" status`
    case 'read_xp':         return `+${effect.value} XP on first read`
    case 'reduce_shame':    return `Reduces ${effect.value} Shame Point`
    case 'reduce_debt':     return `Reduces ${effect.value} Technical Debt`
    default:                return `${effect.type}`
  }
}

// ─── Emblems ─────────────────────────────────────────────────────────────────
function generateEmblems() {
  const allEmblems = getAllEmblems()

  let md = `# Emblems

Emblems are certification badges earned by completing regions and defeating gym leaders. Each emblem provides a **passive bonus** that applies for the rest of the game.

Emblems can accumulate "grime" — visual dirt and wear from your adventures. You can polish them in the **Emblem Case** minigame for a satisfying shine effect.

---

## All Emblems

| Emblem | Domain | Passive Bonus | Grime Description |
|---|---|---|---|
`

  for (const emb of allEmblems) {
    const emoji = DOMAIN_EMOJI[emb.domain] || '❓'
    md += `| ${emoji} **${emb.name}** | ${DOMAIN_LABELS[emb.domain] || emb.domain} | ${emb.passiveBonus} | ${emb.grimeDescription} |\n`
  }

  md += `
---

## Emblem Polishing

Each emblem accumulates grime as you adventure — terminal residue, coffee stains, build failure ink. Open the **Emblem Case** to view your collection and polish them.

Polishing is a simple drag/swipe minigame that cleans the grime and triggers a satisfying **shine effect** ✨. It's purely cosmetic but deeply satisfying.

---

*Auto-generated from \`src/data/emblems.js\` by \`scripts/generate-wiki.js\`*
`
  return md
}

// ─── Main ────────────────────────────────────────────────────────────────────
const pages = [
  { file: 'skills-reference.md', generate: generateSkillsReference },
  { file: 'trainers.md',         generate: generateTrainers },
  { file: 'encounters.md',       generate: generateEncounters },
  { file: 'items-and-inventory.md', generate: generateItems },
  { file: 'emblems.md',          generate: generateEmblems },
]

let changed = 0
for (const { file, generate } of pages) {
  const path    = resolve(WIKI_DIR, file)
  const content = generate()
  writeFileSync(path, content)
  changed++
  console.log(`✅ Generated ${file}`)
}

console.log(`\nDone — ${changed} wiki pages regenerated.`)
