import { describe, it, expect } from 'vitest'
import {
  GATE_TYPES,
  isGateResolved,
  getGatesForRegion,
  getGateBetween,
  canAttemptGate,
  getAvailableSolutions,
  evaluateSolution,
  evaluateMultiStepGate,
  checkReputationGate,
  checkShameGate,
  isPathBlocked,
} from '../src/engine/GateEngine.js'
import { getById as getGateById } from '../src/data/gates.js'

// ---------------------------------------------------------------------------
// Gate type constants
// ---------------------------------------------------------------------------
describe('GATE_TYPES', () => {
  it('defines all 5 gate types', () => {
    expect(GATE_TYPES.HARD).toBe('hard')
    expect(GATE_TYPES.SOFT).toBe('soft')
    expect(GATE_TYPES.KNOWLEDGE).toBe('knowledge')
    expect(GATE_TYPES.REPUTATION).toBe('reputation')
    expect(GATE_TYPES.SHAME).toBe('shame')
  })
})

// ---------------------------------------------------------------------------
// isGateResolved
// ---------------------------------------------------------------------------
describe('isGateResolved', () => {
  it('returns false when flag is not set', () => {
    expect(isGateResolved('margaret_website_gate', {})).toBe(false)
  })

  it('returns true when flag is set to true', () => {
    expect(isGateResolved('margaret_website_gate', { margaret_gate_resolved: true })).toBe(true)
  })

  it('returns false for unknown gate', () => {
    expect(isGateResolved('nonexistent_gate', {})).toBe(false)
  })

  it('returns false when flag exists but is not true', () => {
    expect(isGateResolved('margaret_website_gate', { margaret_gate_resolved: false })).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getGatesForRegion
// ---------------------------------------------------------------------------
describe('getGatesForRegion', () => {
  it('returns gates that block travel from localhost_town', () => {
    const gates = getGatesForRegion('localhost_town')
    expect(gates.length).toBeGreaterThanOrEqual(1)
    expect(gates.every(g => g.fromRegion === 'localhost_town')).toBe(true)
  })

  it('returns empty array for a region with no gates', () => {
    const gates = getGatesForRegion('nonexistent_region')
    expect(gates).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// getGateBetween
// ---------------------------------------------------------------------------
describe('getGateBetween', () => {
  it('finds the gate between localhost_town and pipeline_pass', () => {
    const gate = getGateBetween('localhost_town', 'pipeline_pass')
    expect(gate).toBeDefined()
    expect(gate.id).toBe('margaret_website_gate')
  })

  it('returns undefined when no gate exists', () => {
    const gate = getGateBetween('localhost_town', 'the_cloud_console')
    expect(gate).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// canAttemptGate — hard gates
// ---------------------------------------------------------------------------
describe('canAttemptGate — hard gates', () => {
  it('allows attempt when player has a solution command', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: ['az_webapp_deploy'] }
    const result = canAttemptGate('margaret_website_gate', player)
    expect(result.canAttempt).toBe(true)
    expect(result.reason).toBeNull()
  })

  it('denies attempt when player lacks all solution commands', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: ['grep_logs'] }
    const result = canAttemptGate('margaret_website_gate', player)
    expect(result.canAttempt).toBe(false)
    expect(result.reason).toContain('Azure App Service')
  })

  it('denies attempt with empty learned skills', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('margaret_website_gate', player)
    expect(result.canAttempt).toBe(false)
  })

  it('returns hint text as reason when cannot attempt', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('margaret_website_gate', player)
    const gate = getGateById('margaret_website_gate')
    expect(result.reason).toBe(gate.hintText)
  })
})

// ---------------------------------------------------------------------------
// canAttemptGate — reputation gates
// ---------------------------------------------------------------------------
describe('canAttemptGate — reputation gates', () => {
  it('allows attempt when reputation meets threshold', () => {
    const player = { reputation: 40, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('helm_hansen_gate', player)
    expect(result.canAttempt).toBe(true)
  })

  it('denies attempt when reputation is below threshold', () => {
    const player = { reputation: 39, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('helm_hansen_gate', player)
    expect(result.canAttempt).toBe(false)
    expect(result.reason).toContain('Reputation too low')
  })

  it('allows attempt when reputation exceeds threshold', () => {
    const player = { reputation: 100, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('helm_hansen_gate', player)
    expect(result.canAttempt).toBe(true)
  })
  it('defaults missing reputation to 0 and denies attempt', () => {
    const player = { learnedSkills: [] }
    const result = canAttemptGate('helm_hansen_gate', player)
    expect(result.canAttempt).toBe(false)
    expect(result.reason).toContain('have 0')
  })
})

// ---------------------------------------------------------------------------
// canAttemptGate — shame gates
// ---------------------------------------------------------------------------
describe('canAttemptGate — shame gates', () => {
  it('allows attempt when shame meets threshold', () => {
    const player = { reputation: 50, shamePoints: 3, learnedSkills: [] }
    const result = canAttemptGate('three_am_tavern_gate', player)
    expect(result.canAttempt).toBe(true)
  })

  it('denies attempt when shame is below threshold', () => {
    const player = { reputation: 50, shamePoints: 2, learnedSkills: [] }
    const result = canAttemptGate('three_am_tavern_gate', player)
    expect(result.canAttempt).toBe(false)
    expect(result.reason).toContain('Shame too low')
  })

  it('defaults missing shamePoints to 0 and denies attempt', () => {
    const player = { reputation: 50, learnedSkills: [] }
    const result = canAttemptGate('three_am_tavern_gate', player)
    expect(result.canAttempt).toBe(false)
    expect(result.reason).toContain('have 0')
  })
})

// ---------------------------------------------------------------------------
// canAttemptGate — soft gates
// ---------------------------------------------------------------------------
describe('canAttemptGate — soft gates', () => {
  it('always allows attempt for soft gates', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('security_vault_soft', player)
    expect(result.canAttempt).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// canAttemptGate — edge cases
// ---------------------------------------------------------------------------
describe('canAttemptGate — edge cases', () => {
  it('returns false for unknown gate', () => {
    const player = { reputation: 50, shamePoints: 0, learnedSkills: [] }
    const result = canAttemptGate('nonexistent_gate', player)
    expect(result.canAttempt).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// getAvailableSolutions
// ---------------------------------------------------------------------------
describe('getAvailableSolutions', () => {
  it('returns solutions matching learned skills', () => {
    const solutions = getAvailableSolutions('margaret_website_gate', ['az_webapp_deploy', 'rm_rf'])
    expect(solutions).toHaveLength(2)
    const ids = solutions.map(s => s.commandId)
    expect(ids).toContain('az_webapp_deploy')
    expect(ids).toContain('rm_rf')
  })

  it('returns empty array when no learned skills match', () => {
    const solutions = getAvailableSolutions('margaret_website_gate', ['grep_logs'])
    expect(solutions).toEqual([])
  })

  it('returns empty array for unknown gate', () => {
    const solutions = getAvailableSolutions('nonexistent', ['az_webapp_deploy'])
    expect(solutions).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// evaluateSolution
// ---------------------------------------------------------------------------
describe('evaluateSolution', () => {
  it('resolves optimal solution correctly', () => {
    const result = evaluateSolution('margaret_website_gate', 'az_webapp_deploy')
    expect(result.resolved).toBe(true)
    expect(result.tier).toBe('optimal')
    expect(result.repDelta).toBe(10)
    expect(result.shameDelta).toBe(0)
    expect(result.pathEffect).toBe('open')
    expect(result.questFlagEffect).toBe('margaret_thankyou')
    expect(result.flag).toBe('margaret_gate_resolved')
  })

  it('resolves standard solution correctly', () => {
    const result = evaluateSolution('margaret_website_gate', 'az_webapp_restart')
    expect(result.resolved).toBe(true)
    expect(result.tier).toBe('standard')
    expect(result.repDelta).toBe(3)
  })

  it('resolves nuclear solution with shame', () => {
    const result = evaluateSolution('margaret_website_gate', 'rm_rf')
    expect(result.resolved).toBe(true)
    expect(result.tier).toBe('nuclear')
    expect(result.shameDelta).toBe(2)
  })

  it('returns no_match for unrecognised command', () => {
    const result = evaluateSolution('margaret_website_gate', 'grep_logs')
    expect(result.resolved).toBe(false)
    expect(result.tier).toBeNull()
    expect(result.flag).toBe('margaret_gate_resolved')
  })

  it('handles unknown gate gracefully', () => {
    const result = evaluateSolution('nonexistent_gate', 'az_webapp_deploy')
    expect(result.resolved).toBe(false)
    expect(result.flag).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// evaluateMultiStepGate
// ---------------------------------------------------------------------------
describe('evaluateMultiStepGate', () => {
  it('completes multi-step gate with full sequence', () => {
    const result = evaluateMultiStepGate('security_vault_gate', [
      'az_monitor_alert',
      'vault_rotate',
      'chmod_fix',
    ])
    expect(result.completed).toBe(true)
    expect(result.matchedSteps).toBe(3)
    expect(result.tier).toBe('optimal')
  })

  it('falls back to single solution when sequence is incomplete', () => {
    const result = evaluateMultiStepGate('security_vault_gate', ['vault_rotate'])
    expect(result.completed).toBe(true)
    expect(result.matchedSteps).toBe(0)
    expect(result.tier).toBe('optimal')
  })

  it('returns not completed when no commands match', () => {
    const result = evaluateMultiStepGate('security_vault_gate', ['grep_logs'])
    expect(result.completed).toBe(false)
    expect(result.matchedSteps).toBe(0)
  })

  it('handles gate without steps as single-solution', () => {
    const result = evaluateMultiStepGate('margaret_website_gate', ['az_webapp_deploy'])
    expect(result.completed).toBe(true)
    expect(result.tier).toBe('optimal')
  })

  it('handles unknown gate gracefully', () => {
    const result = evaluateMultiStepGate('nonexistent_gate', ['az_webapp_deploy'])
    expect(result.completed).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// checkReputationGate / checkShameGate
// ---------------------------------------------------------------------------
describe('checkReputationGate', () => {
  it('returns true when reputation meets threshold', () => {
    expect(checkReputationGate('helm_hansen_gate', 40)).toBe(true)
  })

  it('returns false when reputation is below threshold', () => {
    expect(checkReputationGate('helm_hansen_gate', 39)).toBe(false)
  })

  it('returns false for non-reputation gate', () => {
    expect(checkReputationGate('margaret_website_gate', 100)).toBe(false)
  })
})

describe('checkShameGate', () => {
  it('returns true when shame meets threshold', () => {
    expect(checkShameGate('three_am_tavern_gate', 3)).toBe(true)
  })

  it('returns false when shame is below threshold', () => {
    expect(checkShameGate('three_am_tavern_gate', 2)).toBe(false)
  })

  it('returns false for non-shame gate', () => {
    expect(checkShameGate('margaret_website_gate', 100)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isPathBlocked
// ---------------------------------------------------------------------------
describe('isPathBlocked', () => {
  it('returns true when hard gate is unresolved', () => {
    expect(isPathBlocked('localhost_town', 'pipeline_pass', {})).toBe(true)
  })

  it('returns false when hard gate is resolved', () => {
    expect(isPathBlocked('localhost_town', 'pipeline_pass', { margaret_gate_resolved: true })).toBe(false)
  })

  it('returns false when no gate exists', () => {
    expect(isPathBlocked('localhost_town', 'the_cloud_console', {})).toBe(false)
  })

  it('returns false for soft gates (not hard-blocking)', () => {
    expect(isPathBlocked('production_plains', 'security_vault', {})).toBe(false)
  })
})
