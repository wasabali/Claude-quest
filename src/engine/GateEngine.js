// GateEngine.js — pure gate evaluation logic, zero Phaser imports.
// Evaluates whether a player can attempt a gate, resolves the chosen
// solution, and handles reputation/shame threshold checks.
//
// Gate types:
//   hard       — blocked until solved
//   soft       — accessible but triggers extra encounters without the right skill
//   knowledge  — NPC quiz (resolved by scene, engine just checks answer)
//   reputation — requires minimum reputation
//   shame      — requires minimum shame points

import { getById as getGateById, getAll as getAllGates } from '#data/gates.js'

// ---------------------------------------------------------------------------
// Gate type constants
// ---------------------------------------------------------------------------
export const GATE_TYPES = {
  HARD:       'hard',
  SOFT:       'soft',
  KNOWLEDGE:  'knowledge',
  REPUTATION: 'reputation',
  SHAME:      'shame',
}

// ---------------------------------------------------------------------------
// isGateResolved
// Returns true if the gate's flag has already been set in story.flags.
// ---------------------------------------------------------------------------
export function isGateResolved(gateId, storyFlags) {
  const gate = getGateById(gateId)
  if (!gate) return false
  return storyFlags[gate.flag] === true
}

// ---------------------------------------------------------------------------
// getGatesForRegion
// Returns all gates that block travel FROM the given region.
// ---------------------------------------------------------------------------
export function getGatesForRegion(fromRegion) {
  return getAllGates().filter(g => g.fromRegion === fromRegion)
}

// ---------------------------------------------------------------------------
// getGateBetween
// Returns the gate (if any) between fromRegion and toRegion.
// Returns undefined if no gate exists for that path.
// ---------------------------------------------------------------------------
export function getGateBetween(fromRegion, toRegion) {
  return getAllGates().find(
    g => g.fromRegion === fromRegion && g.toRegion === toRegion,
  )
}

// ---------------------------------------------------------------------------
// canAttemptGate
// Returns { canAttempt, reason } describing whether the player can try
// to solve the gate right now.
//
// For hard gates:         checks if the player has at least one solution
//                         command in their learned skills
// For soft gates:         always attemptable; consequences for lacking the
//                         right skill are handled elsewhere
// For reputation gates:   checks reputation >= threshold
// For shame gates:        checks shamePoints >= threshold
// For knowledge gates:    always attemptable (resolved by NPC quiz)
// ---------------------------------------------------------------------------
export function canAttemptGate(gateId, playerState) {
  const gate = getGateById(gateId)
  if (!gate) return { canAttempt: false, reason: 'Gate not found.' }

  // Reputation gate — check threshold
  if (gate.type === GATE_TYPES.REPUTATION) {
    const threshold = gate.reputationThreshold ?? 0
    const reputation = playerState.reputation ?? 0
    if (reputation < threshold) {
      return {
        canAttempt: false,
        reason: `Reputation too low. Need ${threshold}, have ${reputation}.`,
      }
    }
    return { canAttempt: true, reason: null }
  }

  // Shame gate — check threshold
  if (gate.type === GATE_TYPES.SHAME) {
    const threshold = gate.shameThreshold ?? 0
    const shamePoints = playerState.shamePoints ?? 0
    if (shamePoints < threshold) {
      return {
        canAttempt: false,
        reason: `Shame too low. Need ${threshold}, have ${shamePoints}.`,
      }
    }
    return { canAttempt: true, reason: null }
  }

  // Knowledge gate — always attemptable
  if (gate.type === GATE_TYPES.KNOWLEDGE) {
    return { canAttempt: true, reason: null }
  }

  // Soft gate — always attemptable (but has consequences)
  if (gate.type === GATE_TYPES.SOFT) {
    return { canAttempt: true, reason: null }
  }

  // Hard gate — check if player has at least one solution command
  const solutions = Array.isArray(gate.solutions) ? gate.solutions : []
  if (solutions.length === 0) {
    return {
      canAttempt: false,
      reason: 'Gate is misconfigured: no solutions are defined.',
    }
  }

  const learnedSkills = playerState.learnedSkills ?? []
  const hasSolution = solutions.some(
    sol => learnedSkills.includes(sol.commandId),
  )

  if (!hasSolution) {
    return {
      canAttempt: false,
      reason: gate.hintText,
    }
  }

  return { canAttempt: true, reason: null }
}

// ---------------------------------------------------------------------------
// getAvailableSolutions
// Returns the subset of gate solutions whose commandId the player has
// in their learned skills.
// ---------------------------------------------------------------------------
export function getAvailableSolutions(gateId, learnedSkills = []) {
  const gate = getGateById(gateId)
  if (!gate) return []

  return gate.solutions.filter(
    sol => learnedSkills.includes(sol.commandId),
  )
}

// ---------------------------------------------------------------------------
// evaluateSolution
// Resolves a player's chosen command against the gate's solutions.
//
// Returns a GateEvent:
//   { resolved, tier, repDelta, shameDelta, pathEffect, questFlagEffect, flag }
//
// If the command is not in the gate's solutions, returns a 'no_match' event.
// ---------------------------------------------------------------------------
export function evaluateSolution(gateId, commandId) {
  const gate = getGateById(gateId)
  if (!gate) {
    return { resolved: false, tier: null, repDelta: 0, shameDelta: 0, pathEffect: null, questFlagEffect: null, flag: null }
  }

  const solution = gate.solutions.find(s => s.commandId === commandId)
  if (!solution) {
    return { resolved: false, tier: null, repDelta: 0, shameDelta: 0, pathEffect: null, questFlagEffect: null, flag: gate.flag }
  }

  return {
    resolved:        solution.pathEffect === 'open',
    tier:            solution.tier,
    repDelta:        solution.repDelta,
    shameDelta:      solution.shameDelta,
    pathEffect:      solution.pathEffect,
    questFlagEffect: solution.questFlagEffect,
    flag:            gate.flag,
  }
}

// ---------------------------------------------------------------------------
// evaluateMultiStepGate
// For gates with steps[], checks if the player provides the full sequence.
// commandIds is an array of skill IDs in the order the player used them.
//
// Returns:
//   { completed, matchedSteps, tier }
//
// If all steps are matched in order → completed with 'optimal' tier.
// If any single solution command was used → falls back to that solution's tier.
// If nothing matches → not completed.
// ---------------------------------------------------------------------------
export function evaluateMultiStepGate(gateId, commandIds) {
  const gate = getGateById(gateId)
  if (!gate) return { completed: false, matchedSteps: 0, tier: null }

  // If gate has steps, check for full multi-step completion
  if (gate.steps && gate.steps.length > 0) {
    let matchedSteps = 0
    for (let i = 0; i < gate.steps.length; i++) {
      if (i < commandIds.length && commandIds[i] === gate.steps[i].commandId) {
        matchedSteps++
      } else {
        break
      }
    }

    if (matchedSteps === gate.steps.length) {
      return { completed: true, matchedSteps, tier: 'optimal' }
    }

    // Partial match — check if any individual command actually resolves the gate
    for (const cmdId of commandIds) {
      const result = evaluateSolution(gateId, cmdId)
      if (result.resolved) {
        return { completed: true, matchedSteps, tier: result.tier }
      }
    }

    return { completed: false, matchedSteps, tier: null }
  }

  // No steps defined — fall back to single solution evaluation
  for (const cmdId of commandIds) {
    const result = evaluateSolution(gateId, cmdId)
    if (result.resolved) {
      return { completed: true, matchedSteps: 1, tier: result.tier }
    }
  }

  return { completed: false, matchedSteps: 0, tier: null }
}

// ---------------------------------------------------------------------------
// checkReputationGate
// Returns true if the player meets the reputation threshold for the gate.
// ---------------------------------------------------------------------------
export function checkReputationGate(gateId, reputation) {
  const gate = getGateById(gateId)
  if (!gate || gate.type !== GATE_TYPES.REPUTATION) return false
  return reputation >= (gate.reputationThreshold ?? 0)
}

// ---------------------------------------------------------------------------
// checkShameGate
// Returns true if the player meets the shame threshold for the gate.
// ---------------------------------------------------------------------------
export function checkShameGate(gateId, shamePoints) {
  const gate = getGateById(gateId)
  if (!gate || gate.type !== GATE_TYPES.SHAME) return false
  return shamePoints >= (gate.shameThreshold ?? 0)
}

// ---------------------------------------------------------------------------
// isPathBlocked
// Returns true if the gate between two regions is unresolved and hard-blocks.
// ---------------------------------------------------------------------------
export function isPathBlocked(fromRegion, toRegion, storyFlags) {
  const gate = getGateBetween(fromRegion, toRegion)
  if (!gate) return false
  if (!gate.hardBlocks) return false
  return !isGateResolved(gate.id, storyFlags)
}
