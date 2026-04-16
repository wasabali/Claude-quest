// Gate definitions — NPC command gating for world progression.
//
// Gate types:
//   hard       — Path physically blocked. NPC won't move until solved.
//   soft       — Path accessible but dangerous without the right command.
//   knowledge  — NPC asks a question — pick the right answer.
//   reputation — NPC only helps if Reputation is above a threshold.
//   shame      — NPC only appears/talks if Shame is above a threshold.
//
// Each gate has solutions[] mapping commands to outcomes:
//   { commandId, tier, repDelta, shameDelta, questFlagEffect, pathEffect }
//
// Multi-command gates use steps[] — an ordered sequence of { commandId, tier }
// that must all be satisfied for the optimal outcome.

const GATES = {
  margaret_website_gate: {
    id: 'margaret_website_gate',
    type: 'hard',
    fromRegion: 'localhost_town',
    toRegion: 'pipeline_pass',
    npcId: 'old_margaret',
    requiredDomain: 'cloud',
    hardBlocks: true,
    hintText: "I need someone who knows Azure App Service. I heard there's an engineer over in Pipeline Pass who teaches that sort of thing...",
    description: "Margaret's bakery website has been down for 3 hours. Azure Support put her on hold.",
    flag: 'margaret_gate_resolved',
    solutions: [
      { commandId: 'az_webapp_deploy',  tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'margaret_thankyou' },
      { commandId: 'az_webapp_restart', tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'margaret_recurs' },
      { commandId: 'rm_rf',            tier: 'nuclear',  repDelta: 0,  shameDelta: 2, pathEffect: 'open', questFlagEffect: 'margaret_fled' },
    ],
    steps: null,
  },

  bjorn_pipeline_gate: {
    id: 'bjorn_pipeline_gate',
    type: 'hard',
    fromRegion: 'pipeline_pass',
    toRegion: 'jira_dungeon',
    npcId: 'bjorn_breaker',
    requiredDomain: 'iac',
    hardBlocks: true,
    hintText: "The build pipeline is broken and nothing ships until someone who knows CI/CD fixes it.",
    description: "Bjørn's build pipeline has been failing for hours. No deploys until it's fixed.",
    flag: 'bjorn_gate_resolved',
    solutions: [
      { commandId: 'az_pipelines_run',  tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'bjorn_pipeline_fixed' },
      { commandId: 'force_push',        tier: 'cursed',   repDelta: -5, shameDelta: 1, pathEffect: 'open', questFlagEffect: 'bjorn_pipeline_hacked' },
    ],
    steps: null,
  },

  config_drift_gate: {
    id: 'config_drift_gate',
    type: 'hard',
    fromRegion: 'jira_dungeon',
    toRegion: 'staging_valley',
    npcId: null,
    requiredDomain: 'iac',
    hardBlocks: true,
    hintText: "The corridor is blocked by configuration drift. Someone with IaC knowledge could clean this up.",
    description: "Infrastructure config has drifted so badly the path forward is unrecognisable.",
    flag: 'config_drift_resolved',
    solutions: [
      { commandId: 'terraform_plan',  tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'drift_detected' },
      { commandId: 'terraform_apply', tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'drift_fixed_blind' },
    ],
    steps: null,
  },

  rbac_gate: {
    id: 'rbac_gate',
    type: 'hard',
    fromRegion: 'staging_valley',
    toRegion: 'production_plains',
    npcId: 'ingrid_iam',
    requiredDomain: 'security',
    hardBlocks: true,
    hintText: "This gate is RBAC-locked. You need someone with security skills to assign the right role.",
    description: "The gate to Production Plains requires a proper role assignment. No shortcuts.",
    flag: 'rbac_gate_resolved',
    solutions: [
      { commandId: 'vault_rotate',  tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'rbac_proper' },
      { commandId: 'chmod_fix',     tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'rbac_fixed' },
      { commandId: 'chmod_777',     tier: 'nuclear',  repDelta: -10, shameDelta: 2, pathEffect: 'open', questFlagEffect: 'rbac_nuked' },
    ],
    steps: null,
  },

  container_gate: {
    id: 'container_gate',
    type: 'hard',
    fromRegion: 'production_plains',
    toRegion: 'kubernetes_colosseum',
    npcId: null,
    requiredDomain: 'containers',
    hardBlocks: true,
    hintText: "You must containerise before you orchestrate. Learn to build containers first.",
    description: "The Kubernetes Colosseum requires proof you can build a container.",
    flag: 'container_gate_resolved',
    solutions: [
      { commandId: 'docker_build',       tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'containerised' },
      { commandId: 'docker_compose_up',  tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'composed' },
    ],
    steps: null,
  },

  kube_mastery_gate: {
    id: 'kube_mastery_gate',
    type: 'hard',
    fromRegion: 'kubernetes_colosseum',
    toRegion: 'security_vault',
    npcId: 'kube_master',
    requiredDomain: 'kubernetes',
    hardBlocks: true,
    hintText: "You must have tamed Kubernetes before entering the Security Vault.",
    description: "The Kube-rnetes Master guards the path. Only those who have mastered kubectl may pass.",
    flag: 'kube_mastery_resolved',
    solutions: [
      { commandId: 'kubectl_apply', tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'kube_tamed' },
      { commandId: 'helm_install',  tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'kube_helmed' },
    ],
    steps: null,
  },

  security_vault_gate: {
    id: 'security_vault_gate',
    type: 'hard',
    fromRegion: 'security_vault',
    toRegion: 'architecture_district',
    npcId: 'ingrid_iam',
    requiredDomain: 'security',
    hardBlocks: true,
    hintText: "This is a dual-command gate. You need both vault and identity skills to pass.",
    description: "The Architecture District requires mastery of both secrets management and identity.",
    flag: 'security_vault_resolved',
    solutions: [
      { commandId: 'vault_rotate', tier: 'optimal',  repDelta: 10, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'vault_secured' },
      { commandId: 'ssh_keygen',   tier: 'standard', repDelta: 3,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'vault_keyed' },
    ],
    steps: [
      { commandId: 'az_monitor_alert', tier: 'optimal' },
      { commandId: 'vault_rotate',     tier: 'optimal' },
      { commandId: 'chmod_fix',        tier: 'optimal' },
    ],
  },

  final_gate: {
    id: 'final_gate',
    type: 'hard',
    fromRegion: 'architecture_district',
    toRegion: 'the_cloud_console',
    npcId: null,
    requiredDomain: 'cloud',
    hardBlocks: true,
    hintText: "The final gate before endgame. Only a full-stack deployment will open this path.",
    description: "The Cloud Console awaits. Prove you can deploy infrastructure at scale.",
    flag: 'final_gate_resolved',
    solutions: [
      { commandId: 'bicep_deploy',      tier: 'optimal',  repDelta: 15, shameDelta: 0, pathEffect: 'open', questFlagEffect: 'final_deployed' },
      { commandId: 'terraform_apply',   tier: 'standard', repDelta: 5,  shameDelta: 0, pathEffect: 'open', questFlagEffect: 'final_terraformed' },
    ],
    steps: null,
  },

  // --- Soft Gates ---

  security_vault_soft: {
    id: 'security_vault_soft',
    type: 'soft',
    fromRegion: 'production_plains',
    toRegion: 'security_vault',
    npcId: null,
    requiredDomain: 'security',
    hardBlocks: false,
    hintText: "Entering the Security Vault without identity skills is dangerous. Extra incidents await.",
    description: "The Security Vault is accessible but hostile without security knowledge.",
    flag: 'security_vault_warned',
    solutions: [],
    steps: null,
  },

  // --- Reputation Gates ---

  helm_hansen_gate: {
    id: 'helm_hansen_gate',
    type: 'reputation',
    fromRegion: 'kubernetes_colosseum',
    toRegion: 'helm_repository',
    npcId: 'helm_hansen',
    requiredDomain: null,
    hardBlocks: true,
    hintText: "Helm Hansen won't teach you if your Reputation is below 40. Prove yourself first.",
    description: "Helm Hansen only trains engineers with a solid reputation.",
    flag: 'helm_hansen_access',
    reputationThreshold: 40,
    solutions: [],
    steps: null,
  },

  // --- Shame Gates ---

  three_am_tavern_gate: {
    id: 'three_am_tavern_gate',
    type: 'shame',
    fromRegion: 'production_plains',
    toRegion: 'three_am_tavern',
    npcId: null,
    requiredDomain: null,
    hardBlocks: true,
    hintText: "This place doesn't open its doors to clean engineers. Come back when you've earned some Shame.",
    description: "The 3am Tavern only admits those who have walked the cursed path.",
    flag: 'three_am_tavern_access',
    shameThreshold: 3,
    solutions: [],
    steps: null,
  },
}

export const getById = (id)           => GATES[id]
export const getAll  = ()             => Object.values(GATES)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
