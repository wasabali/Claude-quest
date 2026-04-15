// Emblem metadata — certification badges earned by completing regions.
const EMBLEMS = {
  tux: {
    id: 'tux',
    name: 'Tux Emblem',
    domain: 'linux',
    grimeDescription: 'Terminal scrollback residue',
    passiveBonus: 'Linux skills +5% effectiveness',
  },
  pipeline: {
    id: 'pipeline',
    name: 'Pipeline Emblem',
    domain: 'iac',
    grimeDescription: 'Failed build red ink splatter',
    passiveBonus: 'IaC skill fail chance -5%',
  },
  container: {
    id: 'container',
    name: 'Container Emblem',
    domain: 'containers',
    grimeDescription: 'node_modules dust',
    passiveBonus: 'Container skills +5% effectiveness',
  },
  cloud: {
    id: 'cloud',
    name: 'Cloud Emblem',
    domain: 'cloud',
    grimeDescription: 'Azure portal spinner smudges',
    passiveBonus: 'Budget drain -10%',
  },
  vault: {
    id: 'vault',
    name: 'Vault Emblem',
    domain: 'security',
    grimeDescription: 'Leaked secret stains',
    passiveBonus: 'Shame Point gain -1 (minimum 0)',
  },
  helm: {
    id: 'helm',
    name: 'Helm Emblem',
    domain: 'kubernetes',
    grimeDescription: 'CrashLoopBackOff soot',
    passiveBonus: 'Kubernetes skills +5% effectiveness',
  },
  finops: {
    id: 'finops',
    name: 'FinOps Emblem',
    domain: 'cloud',
    grimeDescription: 'Billing alert residue',
    passiveBonus: 'Budget restored +10% after each battle',
  },
  sre: {
    id: 'sre',
    name: 'SRE Emblem',
    domain: 'observability',
    grimeDescription: '3am coffee ring stains',
    passiveBonus: 'Max HP +10',
  },
}

export const getById = (id)           => EMBLEMS[id]
export const getAll  = ()             => Object.values(EMBLEMS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
