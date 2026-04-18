// Interaction definitions — world objects the player can examine or activate.
//
// Interaction types:
//   sign    — Readable signpost. Always repeatable.
//   chest   — One-time loot container. Sets a flag on pickup.
//   door    — Locked passage. Requires an item to open. Sets a flag on unlock.
//   flavor  — Environmental storytelling. Always repeatable.
//
// Fields (by type):
//   sign   : id, type, region, tileX, tileY, dialog[], repeatable
//   chest  : id, type, region, tileX, tileY, item{tab,id,qty}, dialog[], repeatable, flagKey
//   door   : id, type, region, tileX, tileY, requiresItem{tab,id}, lockedDialog[], unlockedDialog[], flagKey
//   flavor : id, type, region, tileX, tileY, dialog[], repeatable

const INTERACTIONS = {


  // ═══════════════════════════════════════════════════════════════════════════
  // LOCALHOST TOWN — Signs
  // ═══════════════════════════════════════════════════════════════════════════

  localhost_sign_welcome: {
    id: 'localhost_sign_welcome',
    type: 'sign',
    region: 'localhost_town',
    tileX: 5,
    tileY: 3,
    dialog: ['Welcome to Localhost Town!', '"Home sweet 127.0.0.1"'],
    repeatable: true,
  },

  localhost_sign_lab: {
    id: 'localhost_sign_lab',
    type: 'sign',
    region: 'localhost_town',
    tileX: 8,
    tileY: 5,
    dialog: ["Professor Pedersen's Lab →"],
    repeatable: true,
  },

  localhost_sign_bakery: {
    id: 'localhost_sign_bakery',
    type: 'sign',
    region: 'localhost_town',
    tileX: 3,
    tileY: 7,
    dialog: ["Old Margaret's Bakery", '"Fresh 404s Daily"'],
    repeatable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOCALHOST TOWN — Flavor Objects
  // ═══════════════════════════════════════════════════════════════════════════

  localhost_lab_server_rack: {
    id: 'localhost_lab_server_rack',
    type: 'flavor',
    region: 'localhost_town',
    tileX: 10,
    tileY: 4,
    dialog: ['A server rack.', 'It hums contentedly.'],
    repeatable: true,
  },

  localhost_lab_bookshelf: {
    id: 'localhost_lab_bookshelf',
    type: 'flavor',
    region: 'localhost_town',
    tileX: 11,
    tileY: 4,
    dialog: ["A dog-eared copy of 'The Phoenix Project'.", 'Page 47 is highlighted.'],
    repeatable: true,
  },

  localhost_apartment_pc: {
    id: 'localhost_apartment_pc',
    type: 'flavor',
    region: 'localhost_town',
    tileX: 2,
    tileY: 9,
    dialog: ['Your PC.', 'Skill deck management terminal.'],
    repeatable: true,
  },

  localhost_margaret_counter: {
    id: 'localhost_margaret_counter',
    type: 'flavor',
    region: 'localhost_town',
    tileX: 4,
    tileY: 7,
    dialog: ["Margaret's counter.", '"What can I get you, dearie?"'],
    repeatable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENVIRONMENTAL STORYTELLING
  // ═══════════════════════════════════════════════════════════════════════════

  pipeline_terminal_todo: {
    id: 'pipeline_terminal_todo',
    type: 'flavor',
    region: 'pipeline_pass',
    tileX: 7,
    tileY: 3,
    dialog: ['// TODO: fix this', '— THROTTLEMASTER', '...the comment is 3 years old.'],
    repeatable: true,
  },

  staging_env_file: {
    id: 'staging_env_file',
    type: 'flavor',
    region: 'staging_valley',
    tileX: 9,
    tileY: 5,
    dialog: ['A .env file, in plain text.', '"root_password: hunter2"', '...checked into source control.'],
    repeatable: true,
  },

  shell_cavern_bash_history: {
    id: 'shell_cavern_bash_history',
    type: 'flavor',
    region: 'shell_cavern',
    tileX: 4,
    tileY: 11,
    dialog: ['~/.bash_history', 'rm -rf / --no-preserve-root', 'chmod 777 /etc/shadow', 'curl ... | sudo bash', "Someone's worst moments,\npreserved forever."],
    repeatable: true,
  },

  oldcorp_nameplate: {
    id: 'oldcorp_nameplate',
    type: 'flavor',
    region: 'oldcorp_basement',
    tileX: 6,
    tileY: 2,
    dialog: ['A nameplate on an unused desk.', '"Karsten Ottesen, Senior Engineer"', 'The desk has been empty for years.'],
    repeatable: true,
  },

  kubernetes_colosseum_locker: {
    id: 'kubernetes_colosseum_locker',
    type: 'flavor',
    region: 'kubernetes_colosseum',
    tileX: 3,
    tileY: 8,
    dialog: ['kubectl get pods output\npinned to the wall.', '47 pods listed.', 'None of them Running.'],
    repeatable: true,
  },

  architecture_whiteboard: {
    id: 'architecture_whiteboard',
    type: 'flavor',
    region: 'architecture_district',
    tileX: 10,
    tileY: 3,
    dialog: ['A system architecture diagram.', 'Scrawled on a sticky note:', '"TODO: Add observability"', 'The sticky note is 5 years old.'],
    repeatable: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHESTS
  // ═══════════════════════════════════════════════════════════════════════════

  azure_town_vending_machine: {
    id: 'azure_town_vending_machine',
    type: 'chest',
    region: 'azure_town',
    tileX: 14,
    tileY: 6,
    item: { tab: 'tools', id: 'azure_credit_voucher', qty: 1 },
    dialog: ['Scratched on the side of the vending machine:', '"AZURE_COUPON_CODE=AZFREE100"', 'Found Azure Credit Voucher!'],
    repeatable: false,
    flagKey: 'interacted_azure_town_vending_machine',
  },

  pipeline_chest_01: {
    id: 'pipeline_chest_01',
    type: 'chest',
    region: 'pipeline_pass',
    tileX: 12,
    tileY: 8,
    item: { tab: 'tools', id: 'stack_overflow_printout', qty: 1 },
    dialog: ['Found Stack Overflow Printout!', '"The answer was from 2014."'],
    repeatable: false,
    flagKey: 'interacted_pipeline_chest_01',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DOORS
  // ═══════════════════════════════════════════════════════════════════════════

  security_vault_door: {
    id: 'security_vault_door',
    type: 'door',
    region: 'architecture_district',
    tileX: 15,
    tileY: 0,
    requiresItem: { tab: 'keyItems', id: 'ssh_key_staging' },
    lockedDialog: ['This door requires SSH Key', '(Staging) to open.'],
    unlockedDialog: ['Used SSH Key (Staging)!', 'The door opened.'],
    flagKey: 'unlocked_security_vault_door',
  },
}

export const getById = (id)           => INTERACTIONS[id]
export const getAll  = ()             => Object.values(INTERACTIONS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
