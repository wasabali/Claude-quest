// Environmental storytelling — examinable objects that reveal world lore.
// No logic, no imports from engine or scenes. Pure data definitions.
const INTERACTIONS = {
  pipeline_pass_todo: {
    id: 'pipeline_pass_todo',
    location: 'pipeline_pass',
    object: 'Terminal 3',
    text: ['// TODO: fix this — THROTTLEMASTER'],
    act: 1,
    type: 'foreshadowing',
  },
  staging_env_file: {
    id: 'staging_env_file',
    location: 'staging_valley',
    object: '.env file',
    text: ['root_password: hunter2'],
    act: 2,
    type: 'humor',
  },
  shell_cavern_bash_history: {
    id: 'shell_cavern_bash_history',
    location: 'shell_cavern',
    object: '~/.bash_history terminal',
    text: ["Someone's worst commands are still here."],
    act: 2,
    type: 'lore',
  },
  oldcorp_nameplate: {
    id: 'oldcorp_nameplate',
    location: 'oldcorp_basement',
    object: 'Nameplate on unused desk',
    text: ['Karsten Ottesen, Senior Engineer'],
    act: 3,
    type: 'foreshadowing',
  },
  azure_town_coupon: {
    id: 'azure_town_coupon',
    location: 'azure_town',
    object: 'Vending machine (scratched coupon)',
    text: ['AZURE_COUPON_CODE=AZFREE100'],
    act: 2,
    type: 'secret',
    effect: { type: 'restore_budget', value: 50 },
    onceFlag: 'azure_coupon_redeemed',
  },
  k8s_colosseum_locker: {
    id: 'k8s_colosseum_locker',
    location: 'kubernetes_colosseum',
    object: 'Locker room terminal',
    text: ['kubectl get pods output:', '47 pods. None Running.'],
    act: 2,
    type: 'humor',
  },
  architecture_whiteboard: {
    id: 'architecture_whiteboard',
    location: 'architecture_district',
    object: 'Whiteboard (dusty)',
    text: ['A system diagram with "TODO: Add observability" scrawled in the corner.', 'The date reads 5 years ago.'],
    act: 3,
    type: 'lore',
  },
}

export const getById = (id)           => INTERACTIONS[id]
export const getAll  = ()             => Object.values(INTERACTIONS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
