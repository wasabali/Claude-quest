// Region definitions — world map areas, gyms, dungeons, and hidden zones.
//
// Fields:
//   id            — snake_case, matches object key
//   name          — display name shown on map / UI
//   domain        — primary domain (null for tutorial / mixed / cursed / hidden)
//   act           — game act this region unlocks in (1–4)
//   type          — main | gym | dungeon | hidden
//   parentRegion  — ID of containing region (null for main / hidden)
//   hasFastTravel — true if region has an Azure Terminal
//   mvp           — true if in MVP scope (Act 1 core path)
//   accessTrigger — (hidden only) string describing unlock condition

const REGIONS = {

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN REGIONS — the overworld towns and landmarks
  // ═══════════════════════════════════════════════════════════════════════════

  localhost_town: {
    id:            'localhost_town',
    name:          'Localhost Town',
    domain:        null,
    act:           1,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: true,
    mvp:           true,
  },
  pipeline_pass: {
    id:            'pipeline_pass',
    name:          'Pipeline Pass',
    domain:        'iac',
    act:           1,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: true,
    mvp:           true,
  },
  azure_town: {
    id:            'azure_town',
    name:          'Azure Town',
    domain:        'cloud',
    act:           1,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: true,
    mvp:           false,
  },
  production_plains: {
    id:            'production_plains',
    name:          'Production Plains',
    domain:        'cloud',
    act:           2,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: true,
    mvp:           false,
  },
  kubernetes_colosseum: {
    id:            'kubernetes_colosseum',
    name:          'Kubernetes Colosseum',
    domain:        'kubernetes',
    act:           2,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: true,
    mvp:           false,
  },
  three_am_tavern: {
    id:            'three_am_tavern',
    name:          '3am Tavern',
    domain:        null,
    act:           2,
    type:          'main',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GYMS — sub-rooms inside main regions, one domain each
  // ═══════════════════════════════════════════════════════════════════════════

  terminal_gym: {
    id:            'terminal_gym',
    name:          'Terminal Gym',
    domain:        'linux',
    act:           1,
    type:          'gym',
    parentRegion:  'localhost_town',
    hasFastTravel: false,
    mvp:           true,
  },
  pipeline_gym: {
    id:            'pipeline_gym',
    name:          'Pipeline Gym',
    domain:        'iac',
    act:           1,
    type:          'gym',
    parentRegion:  'pipeline_pass',
    hasFastTravel: false,
    mvp:           false,
  },
  security_vault_gym: {
    id:            'security_vault_gym',
    name:          'Security Vault',
    domain:        'security',
    act:           1,
    type:          'gym',
    parentRegion:  'azure_town',
    hasFastTravel: false,
    mvp:           false,
  },
  cloud_console_gym: {
    id:            'cloud_console_gym',
    name:          'Cloud Console',
    domain:        'cloud',
    act:           1,
    type:          'gym',
    parentRegion:  'azure_town',
    hasFastTravel: false,
    mvp:           false,
  },
  container_harbor: {
    id:            'container_harbor',
    name:          'Container Harbor',
    domain:        'containers',
    act:           2,
    type:          'gym',
    parentRegion:  'kubernetes_colosseum',
    hasFastTravel: false,
    mvp:           false,
  },
  kube_arena: {
    id:            'kube_arena',
    name:          'Kube Arena',
    domain:        'kubernetes',
    act:           2,
    type:          'gym',
    parentRegion:  'kubernetes_colosseum',
    hasFastTravel: false,
    mvp:           false,
  },
  serverless_shrine: {
    id:            'serverless_shrine',
    name:          'Serverless Shrine',
    domain:        'serverless',
    act:           2,
    type:          'gym',
    parentRegion:  'production_plains',
    hasFastTravel: false,
    mvp:           false,
  },
  sre_command_center: {
    id:            'sre_command_center',
    name:          'SRE Command Center',
    domain:        'observability',
    act:           2,
    type:          'gym',
    parentRegion:  'production_plains',
    hasFastTravel: false,
    mvp:           false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DUNGEON ROOMS — multi-room sequences inside main regions
  // ═══════════════════════════════════════════════════════════════════════════

  jira_dungeon_1: {
    id:            'jira_dungeon_1',
    name:          'Backlog Cavern',
    domain:        'observability',
    act:           1,
    type:          'dungeon',
    parentRegion:  'pipeline_pass',
    hasFastTravel: false,
    mvp:           true,
  },
  jira_dungeon_2: {
    id:            'jira_dungeon_2',
    name:          'Sprint Corridor',
    domain:        'iac',
    act:           1,
    type:          'dungeon',
    parentRegion:  'pipeline_pass',
    hasFastTravel: false,
    mvp:           false,
  },
  jira_dungeon_3: {
    id:            'jira_dungeon_3',
    name:          'The Board Room',
    domain:        'iac',
    act:           1,
    type:          'dungeon',
    parentRegion:  'pipeline_pass',
    hasFastTravel: false,
    mvp:           false,
  },
  cloud_console_1: {
    id:            'cloud_console_1',
    name:          'Portal Lobby',
    domain:        'cloud',
    act:           2,
    type:          'dungeon',
    parentRegion:  'azure_town',
    hasFastTravel: false,
    mvp:           false,
  },
  cloud_console_2: {
    id:            'cloud_console_2',
    name:          'Resource Group Chamber',
    domain:        'cloud',
    act:           2,
    type:          'dungeon',
    parentRegion:  'azure_town',
    hasFastTravel: false,
    mvp:           false,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HIDDEN REGIONS — unlocked by secret triggers, domain-neutral
  // ═══════════════════════════════════════════════════════════════════════════

  server_graveyard: {
    id:            'server_graveyard',
    name:          'Server Graveyard',
    domain:        null,
    act:           1,
    type:          'hidden',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
    accessTrigger: 'SSH to decommissioned terminal',
  },
  node_modules_maze: {
    id:            'node_modules_maze',
    name:          'node_modules Maze',
    domain:        null,
    act:           1,
    type:          'hidden',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
    accessTrigger: 'Use mystery_node_modules junk item',
  },
  dev_null_void: {
    id:            'dev_null_void',
    name:          '/dev/null Void',
    domain:        null,
    act:           1,
    type:          'hidden',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
    accessTrigger: 'Pipe output 3 times in battle',
  },
  deprecated_azure_region: {
    id:            'deprecated_azure_region',
    name:          'Deprecated Azure Region',
    domain:        null,
    act:           1,
    type:          'hidden',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
    accessTrigger: 'Select greyed-out region at Azure Terminal',
  },
  oldcorp_basement: {
    id:            'oldcorp_basement',
    name:          'OldCorp Basement',
    domain:        null,
    act:           1,
    type:          'hidden',
    parentRegion:  null,
    hasFastTravel: false,
    mvp:           false,
    accessTrigger: 'Open despite 3 warnings in Jira Dungeon',
  },
}

// ═════════════════════════════════════════════════════════════════════════════
// REGION CONNECTIONS — directed world graph
// Each key is a region ID; each value maps a cardinal direction to a target
// region, the entry direction at that target, and optional gate requirements.
//
// Gate requirement fields (optional `requires` object):
//   act           — minimum game act the player must have reached
//   dungeonPoints — score threshold earned inside the dungeon
//   resourceLocks — number of resource locks the player must hold
// ═════════════════════════════════════════════════════════════════════════════

export const REGION_CONNECTIONS = {
  localhost_town: {
    east:  { target: 'pipeline_pass',        entry: 'west'  },
    south: { target: 'azure_town',           entry: 'north' },
  },
  pipeline_pass: {
    west:  { target: 'localhost_town',       entry: 'east'  },
    east:  { target: 'production_plains',    entry: 'west', requires: { act: 2 } },
    north: { target: 'jira_dungeon_1',       entry: 'south' },
  },
  azure_town: {
    north: { target: 'localhost_town',       entry: 'south' },
    east:  { target: 'kubernetes_colosseum', entry: 'west', requires: { act: 2 } },
  },
  production_plains: {
    west:  { target: 'pipeline_pass',        entry: 'east'  },
    south: { target: 'kubernetes_colosseum', entry: 'north' },
  },
  kubernetes_colosseum: {
    west:  { target: 'azure_town',           entry: 'east'  },
    north: { target: 'production_plains',    entry: 'south' },
  },
  jira_dungeon_1: {
    south: { target: 'pipeline_pass',        entry: 'north' },
    north: { target: 'jira_dungeon_2',       entry: 'south', requires: { dungeonPoints: 13 } },
  },
  jira_dungeon_2: {
    south: { target: 'jira_dungeon_1',       entry: 'north' },
    north: { target: 'jira_dungeon_3',       entry: 'south' },
  },
  jira_dungeon_3: {
    south: { target: 'jira_dungeon_2',       entry: 'north' },
  },
  cloud_console_1: {
    south: { target: 'azure_town',           entry: 'north' },
    north: { target: 'cloud_console_2',      entry: 'south', requires: { resourceLocks: 3 } },
  },
  cloud_console_2: {
    south: { target: 'cloud_console_1',      entry: 'north' },
  },
}

// ═════════════════════════════════════════════════════════════════════════════
// Registry accessors — standard pattern shared by all data modules
// ═════════════════════════════════════════════════════════════════════════════

export const getById = (id)           => REGIONS[id]
export const getAll  = ()             => Object.values(REGIONS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
