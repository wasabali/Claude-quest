// StoryEngine.js — pure story progression logic, zero Phaser imports.
// Evaluates act transitions, Kristoffer's location/dialog, viral wave
// and 3:17am scene triggers, and NPC visibility by act.
//
// All functions are pure: they take state, return results, never mutate.

import {
  getAllTransitions,
  getKristofferLocations,
  getKristofferShameReactions,
  getViralWave,
  getThreeAmScene,
  getNpcAppearances,
} from '#data/story.js'

// ---------------------------------------------------------------------------
// checkActTransition
// Returns the transition object if ALL trigger flags are true AND fromAct
// matches currentAct. Returns null if no transition should fire.
// Checks ALL transitions, not just the "next" one.
// ---------------------------------------------------------------------------
export function checkActTransition(currentAct, flags) {
  const transitions = getAllTransitions()
  for (const transition of transitions) {
    if (transition.fromAct !== currentAct) continue
    const allFlagsMet = transition.triggerFlags.every(f => flags[f] === true)
    if (allFlagsMet) return transition
  }
  return null
}

// ---------------------------------------------------------------------------
// getKristofferLocation
// Returns the location string for the given act (1-5 or 'postgame').
// Returns null for act 5 (he's absent in the finale).
// ---------------------------------------------------------------------------
export function getKristofferLocation(act) {
  const locations = getKristofferLocations()
  if (!(act in locations)) return undefined
  return locations[act]
}

// ---------------------------------------------------------------------------
// getKristofferShameDialog
// Returns the pages array for the highest matching shameMin threshold.
// Returns null if no threshold is matched (shame < 3).
// Thresholds are sorted descending: 15, 10, 7, 3.
// ---------------------------------------------------------------------------
export function getKristofferShameDialog(shamePoints) {
  const reactions = getKristofferShameReactions()
  for (const reaction of reactions) {
    if (shamePoints >= reaction.shameMin) return reaction.pages
  }
  return null
}

// ---------------------------------------------------------------------------
// shouldTriggerViralWave
// Returns true if act === 2 AND location === 'production_plains'
// AND flags.viral_wave_complete is NOT true.
// ---------------------------------------------------------------------------
export function shouldTriggerViralWave(currentAct, location, flags) {
  const wave = getViralWave()
  return currentAct === wave.triggerAct
    && location === wave.location
    && flags[wave.triggerFlag] !== true
}

// ---------------------------------------------------------------------------
// shouldTriggerThreeAmScene
// Returns true if flags.viral_wave_complete === true AND
// flags.three_am_scene_complete is NOT true.
// ---------------------------------------------------------------------------
export function shouldTriggerThreeAmScene(flags) {
  const scene = getThreeAmScene()
  return flags[scene.triggerFlag] === true
    && flags[scene.guardFlag] !== true
}

// ---------------------------------------------------------------------------
// getVisibleNpcs
// Returns an array of NPC IDs whose appearsInAct is <= currentAct.
// ---------------------------------------------------------------------------
export function getVisibleNpcs(currentAct) {
  const appearances = getNpcAppearances()
  return Object.entries(appearances)
    .filter(([, npc]) => npc.appearsInAct <= currentAct)
    .map(([id]) => id)
}
