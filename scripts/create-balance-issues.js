#!/usr/bin/env node
// scripts/create-balance-issues.js
//
// Creates GitHub issues for new stress-test failures and closes issues for fixed ones.
// Uses `gh` CLI for GitHub API access.
//
// Usage: node scripts/create-balance-issues.js [--report game-health/latest.json] [--dry-run]

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'fs'
import { execSync } from 'child_process'
import { resolve, dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

const args = process.argv.slice(2)
function hasFlag(name)   { return args.includes(name) }
function getArg(name, def) {
  const idx = args.indexOf(name)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : def
}

const reportPath = resolve(ROOT, getArg('--report', 'game-health/latest.json'))
const dryRun     = hasFlag('--dry-run')

// ─── Read report ─────────────────────────────────────────────────────────────
const report = JSON.parse(readFileSync(reportPath, 'utf-8'))

// ─── Category → label mapping ────────────────────────────────────────────────
const CATEGORY_LABELS = {
  'data-integrity':       'data-integrity',
  'skill-balance':        'skill-balance',
  'battle-simulations':   'battle-balance',
  'progression-economy':  'economy',
  'encounter-distribution': 'encounters',
  'exploit-detection':    'exploit',
  'gate-quest-integrity': 'quest-integrity',
  'story-npc-consistency': 'story',
  'emblem-balance':       'emblem-balance',
  'full-playthrough':     'playthrough',
}

function gh(argsStr) {
  if (dryRun) {
    console.log(`  [DRY RUN] gh ${argsStr}`)
    return ''
  }
  try {
    return execSync(`gh ${argsStr}`, { cwd: ROOT, encoding: 'utf-8', timeout: 30000 })
  } catch (err) {
    console.error(`  ⚠️  gh command failed: ${err.message}`)
    return ''
  }
}

// ─── Search for existing issues by title prefix ──────────────────────────────
function findExistingIssue(titlePrefix) {
  const result = gh(`issue list --state open --label balance,automated --search "${titlePrefix}" --json number,title --limit 10`)
  if (!result) return null
  try {
    const issues = JSON.parse(result)
    return issues.find(i => i.title.startsWith(titlePrefix)) || null
  } catch {
    return null
  }
}

// ─── Create new issues for new findings ──────────────────────────────────────
const newFindings = (report.findings || []).filter(f => (report.newFindings || []).includes(f.id))

console.log(`\n📋 Issue management: ${newFindings.length} new findings, ${(report.fixedFindings || []).length} fixed findings\n`)

// Create a temp dir for issue body files
const tmpDir = mkdtempSync(join(tmpdir(), 'balance-issues-'))

for (const finding of newFindings) {
  const titlePrefix = `[Balance] ${finding.group} — ${finding.title}`
  const existing    = findExistingIssue(titlePrefix)

  if (existing) {
    console.log(`  ⏭️  Skip (duplicate #${existing.number}): ${titlePrefix}`)
    continue
  }

  const categoryLabel = CATEGORY_LABELS[finding.category] || 'balance'
  const labels        = ['balance', 'automated', categoryLabel].join(',')

  const body = [
    `## Automated Balance Finding`,
    '',
    `**Category:** ${finding.group}`,
    finding.subGroup ? `**Sub-group:** ${finding.subGroup}` : '',
    `**Test:** ${finding.fullName}`,
    '',
    '### Failure Details',
    '',
    '```',
    finding.message || '(no details)',
    '```',
    '',
    `---`,
    `_Auto-created by game-health pipeline on ${report.timestamp}_`,
  ].filter(Boolean).join('\n')

  // Write body to a temp file to avoid shell injection
  const bodyFile = join(tmpDir, `issue-${Date.now()}.md`)
  writeFileSync(bodyFile, body)

  console.log(`  📝 Creating issue: ${titlePrefix}`)
  const safeTitle = titlePrefix.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  gh(`issue create --title "${safeTitle}" --body-file "${bodyFile}" --label "${labels}"`)
}

// Clean up temp dir
try { rmSync(tmpDir, { recursive: true }) } catch { /* ignore */ }

// ─── Close issues for fixed findings ─────────────────────────────────────────
for (const fixedId of report.fixedFindings || []) {
  // fixedId format: "category::test title"
  const parts       = fixedId.split('::')
  const category    = parts[0] || ''
  const testTitle   = parts.slice(1).join('::') || ''
  const titlePrefix = `[Balance]`

  // Search for matching open issue
  const result = gh(`issue list --state open --label balance,automated --search "${testTitle}" --json number,title --limit 10`)
  if (!result) continue

  try {
    const issues = JSON.parse(result)
    for (const issue of issues) {
      if (issue.title.includes(testTitle)) {
        console.log(`  ✅ Closing fixed issue #${issue.number}: ${issue.title}`)
        gh(`issue close ${issue.number} --comment "🎉 This finding has been fixed (test now passes). Auto-closed by game-health pipeline."`)
      }
    }
  } catch {
    // skip
  }
}

console.log('\nDone.')
