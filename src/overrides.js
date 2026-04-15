/**
 * Development overrides — for testing without grinding.
 *
 * Values here override their GameState equivalents at startup (dev only).
 * GameState.js imports this file and applies overrides during initialisation.
 * Engines never read this file — overrides are applied once at startup only.
 *
 * NEVER commit uncommented overrides to main. This file is version-controlled
 * so it documents every testable override — comments are the contract.
 */

export const Overrides = {

  // --- Character state -------------------------------------------------

  // Start with a specific shame count (unlock cursed trainers without grinding)
  // SHAME_OVERRIDE: 7,

  // Override reputation (0–100)
  // REPUTATION_OVERRIDE: 50,

  // Override technical debt stacks (0–10)
  // TECHNICAL_DEBT_OVERRIDE: 0,

  // Override HP and max HP
  // HP_OVERRIDE: 100,

  // Override level and XP
  // LEVEL_OVERRIDE: null,

  // --- World state -----------------------------------------------------

  // Start at a specific location instead of Localhost Town
  // LOCATION_OVERRIDE: 'three_am_tavern',

  // Override act (story progression)
  // ACT_OVERRIDE: null,

  // Set story flags directly (merged onto story.flags at startup)
  // FLAGS_OVERRIDE: {},

  // --- Battle state ----------------------------------------------------

  // Skip the SLA countdown in incident battles (never breaches)
  // INFINITE_SLA: false,

  // Force the enemy domain to be pre-revealed in incident mode
  // DOMAIN_REVEALED_OVERRIDE: false,

  // Force a specific opponent domain for testing matchups
  // OPPONENT_DOMAIN_OVERRIDE: null,   // e.g. 'kubernetes'

  // --- Inventory / skills ----------------------------------------------

  // Start with this deck instead of the default starter deck
  // STARTER_DECK: null,    // e.g. ['kubectl_apply', 'az_webapp_deploy', 'rm_rf']

  // Start with these items in the bag
  // STARTER_ITEMS: null,   // e.g. [{ id: 'red_bull', qty: 5 }]

}
