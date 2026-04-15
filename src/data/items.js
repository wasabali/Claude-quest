// Item definitions — tools, keyItems, credentials, docs, junk.
const ITEMS = {
  red_bull: {
    id: 'red_bull',
    name: 'Red Bull',
    tab: 'tools',
    effect: 'Restore 30 HP',
  },
  rollback_potion: {
    id: 'rollback_potion',
    name: 'Rollback Potion',
    tab: 'tools',
    effect: 'Undo last failed skill',
  },
  azure_credit_voucher: {
    id: 'azure_credit_voucher',
    name: 'Azure Credit Voucher',
    tab: 'tools',
    effect: 'Restore 50 Budget',
  },
  skip_tests_scroll: {
    id: 'skip_tests_scroll',
    name: 'Skip Tests Scroll',
    tab: 'tools',
    effect: 'Bypass one skill check',
  },
  ssh_key_staging: {
    id: 'ssh_key_staging',
    name: 'SSH Key (Staging)',
    tab: 'keyItems',
    effect: 'Unlock staging server doors',
  },
  staging_env_token: {
    id: 'staging_env_token',
    name: 'Staging Env Token',
    tab: 'keyItems',
    effect: 'Required to enter Staging Valley',
  },
  on_call_phone: {
    id: 'on_call_phone',
    name: 'On-Call Phone',
    tab: 'keyItems',
    effect: 'Activates On-Call status',
  },
  az_sp_cert: {
    id: 'az_sp_cert',
    name: 'Azure Service Principal Cert',
    tab: 'credentials',
    effect: 'Auth token for Azure battles',
  },
  outdated_runbook: {
    id: 'outdated_runbook',
    name: 'Outdated Runbook',
    tab: 'docs',
    effect: 'Read for +5 XP (half the steps are wrong)',
  },
  incident_postmortem: {
    id: 'incident_postmortem',
    name: 'Incident Postmortem',
    tab: 'docs',
    effect: 'Study after loss for +20 XP bonus',
  },
  terraform_state: {
    id: 'terraform_state',
    name: 'Terraform State File',
    tab: 'docs',
    effect: "Don't touch it. Don't move it.",
  },
  root_password_note: {
    id: 'root_password_note',
    name: 'Root Password (sticky note)',
    tab: 'junk',
    effect: "Found in Margaret's house. Useless. Horrifying.",
  },
  mystery_node_modules: {
    id: 'mystery_node_modules',
    name: 'Mystery node_modules',
    tab: 'junk',
    effect: '47,000 files. Does nothing.',
    canDrop: false,
  },
  stale_pr: {
    id: 'stale_pr',
    name: 'Stale PR',
    tab: 'junk',
    effect: 'Open since 2019. Nobody will merge it.',
  },
}

export const getById = (id)           => ITEMS[id]
export const getAll  = ()             => Object.values(ITEMS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
