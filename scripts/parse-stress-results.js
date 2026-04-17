#!/usr/bin/env node
// scripts/parse-stress-results.js
//
// Parses vitest JSON output from the stress/balance audit into structured findings.
// Reads from --input (or stdin) and writes to --output (or stdout).
//
// Usage:
//   node scripts/parse-stress-results.js --input /tmp/stress-results.json --output game-health/latest.json
//   node scripts/parse-stress-results.js < /tmp/stress-results.json > game-health/latest.json

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT      = resolve(__dirname, '..')

// ─── Parse CLI args ──────────────────────────────────────────────────────────
const args = process.argv.slice(2)
function getArg(name) {
  const idx = args.indexOf(name)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
}

const inputFile    = getArg('--input')
const outputFile   = getArg('--output')
const baselineFile = getArg('--baseline') || resolve(ROOT, 'game-health/latest.json')

// ─── Read vitest JSON ────────────────────────────────────────────────────────
let rawJson
if (inputFile) {
  rawJson = readFileSync(resolve(inputFile), 'utf-8')
} else {
  rawJson = readFileSync(0, 'utf-8')
}

// Vitest JSON reporter may output multi-line JSON or extra text around it.
// Try full parse first; fall back to extracting the first complete JSON object.
function extractFirstJsonObject(text) {
  let start = -1
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]

    if (start === -1) {
      if (ch === '{') { start = i; depth = 1 }
      continue
    }

    if (inString) {
      if (escaped) { escaped = false }
      else if (ch === '\\') { escaped = true }
      else if (ch === '"') { inString = false }
      continue
    }

    if (ch === '"') { inString = true; continue }
    if (ch === '{') { depth += 1 }
    else if (ch === '}') {
      depth -= 1
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

let vitestData
try {
  vitestData = JSON.parse(rawJson.trim())
} catch {
  const extracted = extractFirstJsonObject(rawJson)
  if (!extracted) {
    console.error('❌ No JSON object found in input. Is the vitest JSON reporter output valid?')
    process.exit(1)
  }
  vitestData = JSON.parse(extracted)
}

// ─── Load previous baseline (if it exists) ───────────────────────────────────
let baseline = null
if (existsSync(baselineFile)) {
  try {
    baseline = JSON.parse(readFileSync(baselineFile, 'utf-8'))
  } catch {
    baseline = null
  }
}

// ─── Map describe group names to dashboard categories ────────────────────────
const CATEGORY_MAP = {
  'Data Integrity':              'data-integrity',
  'Skill Balance':               'skill-balance',
  'Battle Simulations':          'battle-simulations',
  'Progression & Economy':       'progression-economy',
  'Encounter Distribution':      'encounter-distribution',
  'Exploit Detection':           'exploit-detection',
  'Gate & Quest Integrity':      'gate-quest-integrity',
  'Story & NPC Consistency':     'story-npc-consistency',
  'Emblem Balance':              'emblem-balance',
  'Full Playthrough Simulation': 'full-playthrough',
}

// ─── Extract structured findings ─────────────────────────────────────────────
const categories = {}
const findings   = []
const warnings   = []

for (const suite of vitestData.testResults || []) {
  for (const test of suite.assertionResults || []) {
    const topGroup = test.ancestorTitles?.[0] || 'Unknown'
    const category = CATEGORY_MAP[topGroup] || topGroup.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    if (!categories[category]) {
      categories[category] = { name: topGroup, passed: 0, failed: 0, total: 0 }
    }
    categories[category].total++

    if (test.status === 'passed') {
      categories[category].passed++
    } else if (test.status === 'failed') {
      categories[category].failed++
      findings.push({
        id:       `${category}::${test.title}`,
        category,
        group:    topGroup,
        subGroup: test.ancestorTitles?.slice(1).join(' > ') || '',
        title:    test.title,
        fullName: test.fullName,
        status:   'failed',
        message:  (test.failureMessages || []).join('\n').slice(0, 500),
      })
    }
  }
}

// ─── Compare against baseline to find new/fixed findings ─────────────────────
const previousIds = new Set((baseline?.findings || []).map(f => f.id))
const currentIds  = new Set(findings.map(f => f.id))

const newFindings   = findings.filter(f => !previousIds.has(f.id))
const fixedFindings = (baseline?.findings || []).filter(f => !currentIds.has(f.id))

// ─── Build the report ────────────────────────────────────────────────────────
const report = {
  timestamp:  new Date().toISOString(),
  success:    vitestData.success,
  summary: {
    totalTests:  vitestData.numTotalTests,
    passed:      vitestData.numPassedTests,
    failed:      vitestData.numFailedTests,
    pending:     vitestData.numPendingTests,
  },
  categories,
  findings,
  newFindings:   newFindings.map(f => f.id),
  fixedFindings: fixedFindings.map(f => f.id),
}

// ─── Write output ────────────────────────────────────────────────────────────
const output = JSON.stringify(report, null, 2)

if (outputFile) {
  writeFileSync(resolve(outputFile), output)
  console.log(`✅ Wrote report to ${outputFile}`)
} else {
  process.stdout.write(output + '\n')
}

// ─── Summary to stderr ──────────────────────────────────────────────────────
console.error(`\n📊 Stress Test Results:`)
console.error(`   Total: ${report.summary.totalTests} | Passed: ${report.summary.passed} | Failed: ${report.summary.failed}`)
console.error(`   New findings: ${newFindings.length} | Fixed: ${fixedFindings.length}`)

for (const [cat, data] of Object.entries(categories)) {
  const icon = data.failed === 0 ? '✅' : '❌'
  console.error(`   ${icon} ${data.name}: ${data.passed}/${data.total}`)
}

if (newFindings.length > 0) {
  console.error(`\n⚠️  New failures:`)
  for (const f of newFindings) {
    console.error(`   - [${f.category}] ${f.title}`)
  }
}

if (fixedFindings.length > 0) {
  console.error(`\n🎉 Fixed:`)
  for (const f of fixedFindings) {
    console.error(`   - ${f.id}`)
  }
}
