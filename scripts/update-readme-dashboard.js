#!/usr/bin/env node
// scripts/update-readme-dashboard.js
//
// Reads game-health/latest.json and splices a dashboard table into README.md
// between <!-- GAME-HEALTH-START --> and <!-- GAME-HEALTH-END --> sentinels.
//
// Usage: node scripts/update-readme-dashboard.js [--report game-health/latest.json] [--readme README.md]

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

const args = process.argv.slice(2)
function getArg(name, def) {
  const idx = args.indexOf(name)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def
}

const reportPath = resolve(ROOT, getArg('--report', 'game-health/latest.json'))
const readmePath = resolve(ROOT, getArg('--readme', 'README.md'))

// ─── Category display names and order ────────────────────────────────────────
const CATEGORY_DISPLAY = {
  'data-integrity':       { label: 'Data Integrity',       emoji: '🗄️' },
  'skill-balance':        { label: 'Skill Balance',        emoji: '⚔️' },
  'battle-simulations':   { label: 'Battle Simulations',   emoji: '🎮' },
  'progression-economy':  { label: 'Progression & Economy', emoji: '📈' },
  'encounter-distribution': { label: 'Encounter Distribution', emoji: '🎲' },
  'exploit-detection':    { label: 'Exploit Detection',    emoji: '🛡️' },
  'gate-quest-integrity': { label: 'Gate & Quest Integrity', emoji: '🚪' },
  'story-npc-consistency': { label: 'Story & NPC Consistency', emoji: '💬' },
  'emblem-balance':       { label: 'Emblem Balance',       emoji: '🏅' },
  'full-playthrough':     { label: 'Full Playthrough Sim', emoji: '🏁' },
}

const CATEGORY_ORDER = [
  'data-integrity', 'skill-balance', 'battle-simulations',
  'progression-economy', 'encounter-distribution', 'exploit-detection',
  'gate-quest-integrity', 'story-npc-consistency', 'emblem-balance',
  'full-playthrough',
]

// ─── Read report ─────────────────────────────────────────────────────────────
const report = JSON.parse(readFileSync(reportPath, 'utf-8'))

// ─── Generate dashboard markdown ─────────────────────────────────────────────
function generateDashboard() {
  let md = '\n## 🏥 Game Health Dashboard\n\n'
  md += '_Automated balance & integrity checks run on every push to `main`._\n\n'

  md += '| Metric | Status | Details |\n'
  md += '|---|---|---|\n'

  for (const catId of CATEGORY_ORDER) {
    const cat     = report.categories?.[catId]
    const display = CATEGORY_DISPLAY[catId]
    if (!cat && !display) continue

    const label  = display?.label || catId
    const emoji  = display?.emoji || '📊'
    const passed = cat?.passed ?? 0
    const total  = cat?.total ?? 0
    const failed = cat?.failed ?? 0
    const status = failed === 0 ? '✅' : '❌'
    const detail = `${passed}/${total} tests passing`

    md += `| ${emoji} ${label} | ${status} | ${detail} |\n`
  }

  // Summary row
  const totalPassed = report.summary?.passed ?? 0
  const totalTests  = report.summary?.totalTests ?? 0
  const totalFailed = report.summary?.failed ?? 0
  const overallStatus = totalFailed === 0 ? '✅' : '❌'
  md += `| **Overall** | ${overallStatus} | **${totalPassed}/${totalTests}** tests passing |\n`

  // Findings summary
  const newCount   = report.newFindings?.length ?? 0
  const fixedCount = report.fixedFindings?.length ?? 0
  if (newCount > 0 || fixedCount > 0) {
    md += '\n'
    if (newCount > 0) md += `> ⚠️ **${newCount} new issue(s)** found in this run\n`
    if (fixedCount > 0) md += `> 🎉 **${fixedCount} issue(s)** fixed since last run\n`
  }

  // Timestamp
  const ts = report.timestamp || new Date().toISOString()
  md += `\n_Last updated: ${ts}_\n`

  return md
}

// ─── Splice into README ──────────────────────────────────────────────────────
const START_SENTINEL = '<!-- GAME-HEALTH-START -->'
const END_SENTINEL   = '<!-- GAME-HEALTH-END -->'

let readme = readFileSync(readmePath, 'utf-8')

const startIdx = readme.indexOf(START_SENTINEL)
const endIdx   = readme.lastIndexOf(END_SENTINEL)

if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  console.error('❌ Sentinel comments not found in README.md or are out of order')
  console.error('   Ensure README.md contains these lines in this order:')
  console.error(`   ${START_SENTINEL}`)
  console.error('   ... dashboard content ...')
  console.error(`   ${END_SENTINEL}`)
  process.exit(1)
}

const dashboard = generateDashboard()
const before    = readme.slice(0, startIdx + START_SENTINEL.length)
const after     = readme.slice(endIdx)

readme = before + '\n' + dashboard + '\n' + after

writeFileSync(readmePath, readme)
console.log('✅ Dashboard updated in README.md')
