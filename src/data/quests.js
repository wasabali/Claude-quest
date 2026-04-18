// Quest definitions — stages, rewards, story flags.
const QUESTS = {
  margaret_website: {
    id: 'margaret_website',
    npc: 'old_margaret',
    location: 'localhost_town',
    stages: [
      {
        dialog: ['My bakery website keeps going down!', 'Can you help?'],
        choices: [
          { text: 'Have you tried restarting it?', correct: false, hpLoss: 10 },
          { text: 'You need Azure App Service.', correct: true },
          { text: 'Buy more RAM.', correct: false, hpLoss: 10 },
        ],
        correctDialog: ["You're a lifesaver! Here, take this."],
        wrongDialog: ["That didn't help..."],
      },
    ],
    // solutions[] defines quality-graded outcomes for NPC gating.
    // Each solution maps a tier to the downstream consequences.
    solutions: [
      {
        tier: 'optimal',
        skillIds: ['az_monitor_logs', 'az_webapp_deploy'],
        outcome: {
          xpMultiplier:    2,
          repDelta:        10,
          shameDelta:      0,
          itemDrop:        'incident_postmortem',
          questFlagEffect: 'margaret_will_send_gift',
        },
      },
      {
        tier: 'standard',
        skillIds: ['az_webapp_restart'],
        outcome: {
          xpMultiplier:    1,
          repDelta:        3,
          shameDelta:      0,
          itemDrop:        'cold_coffee',
          questFlagEffect: null,
        },
      },
      {
        tier: 'shortcut',
        skillIds: ['az_webapp_stop'],
        outcome: {
          xpMultiplier:    0.5,
          repDelta:        -5,
          shameDelta:      0,
          itemDrop:        null,
          questFlagEffect: 'margaret_quest_line_closed',
        },
      },
      {
        tier: 'nuclear',
        skillIds: ['rm_rf'],
        outcome: {
          xpMultiplier:    0,
          repDelta:        -30,
          shameDelta:      2,
          itemDrop:        'scorched_server',
          questFlagEffect: 'margaret_fled',
        },
      },
    ],
    rewards: { xp: 50, items: [{ id: 'azure_credit_voucher', qty: 1 }] },
    completedDialog: ["The website's been running for 3 days! Best week ever."],
    followUp: null,
  },
  do_not_touch: {
    id: 'do_not_touch',
    npc: 'dagny_dba',
    location: 'oldcorp_basement',
    act: 3,
    type: 'branch',
    requiresFlags: ['act_3_started', 'oldcorp_entered'],
    excludeFlags: ['do_not_touch_resolved'],
    reminderDialog: ['There\'s one service I should warn you about…'],
    branches: {
      open: {
        label: 'Open it anyway',
        triggerEncounter: 'vb6_billing_horror',
        onWin: { shameDelta: 1, learnSkill: 'exec_xp_cmdshell', setFlag: 'do_not_touch_opened' },
        onLoss: { hpDelta: -20, repDelta: -10, dialog: ['The invoices will be wrong for months.'] },
      },
      migrate: {
        label: 'Migrate it properly',
        quiz: [
          { text: 'Rewrite it in Python and YOLO deploy',          result: 'wrong',    budgetLoss: 50 },
          { text: 'Lift and shift to Azure App Service',            result: 'standard', xp: 80 },
          { text: 'Strangler fig pattern — migrate incrementally',  result: 'optimal',  xp: 150, itemDrop: 'legacy_migration_badge' },
        ],
        onOptimal: {
          setFlag: 'do_not_touch_migrated_optimal',
          dialog: ['That\'s exactly right.', 'Take this — you\'ve earned it.', 'The migration badge. Wear it with pride.'],
        },
        followUpLine: 'Can you also fix my home Wi-Fi?',
      },
    },
    completionFlag: 'do_not_touch_resolved',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TECH DEBT AUDITOR — Cleanup quest chain (10 quests, Act 2+)
  // Each quest clears 1 stack of technical_debt. Completing all 10 earns
  // the "Clean Slate" emblem variant.
  // ═══════════════════════════════════════════════════════════════════════════

  tech_debt_cleanup_01: {
    id: 'tech_debt_cleanup_01',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['Your codebase has... issues.', 'Let us start with the dead imports.'],
        choices: [
          { text: 'Remove unused imports', correct: true },
          { text: 'Add more imports to balance it out', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Clean. One stack down.'],
        wrongDialog: ['That is not how technical debt works.'],
      },
    ],
    solutions: [],
    rewards: { xp: 30, technicalDebtClear: 1 },
    completedDialog: ['One stack cleared. Nine to go.'],
    followUp: 'tech_debt_cleanup_02',
    availableInAct: 2,
  },

  tech_debt_cleanup_02: {
    id: 'tech_debt_cleanup_02',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['Next: orphaned feature flags.', 'They have been dead for 6 sprints.'],
        choices: [
          { text: 'Audit and remove stale flags', correct: true },
          { text: 'Rename them and hope no one notices', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Feature flags pruned. Stack cleared.'],
        wrongDialog: ['You are the reason we have an auditor.'],
      },
    ],
    solutions: [],
    rewards: { xp: 35, technicalDebtClear: 1 },
    completedDialog: ['Two down. Keep going.'],
    followUp: 'tech_debt_cleanup_03',
    availableInAct: 2,
  },

  tech_debt_cleanup_03: {
    id: 'tech_debt_cleanup_03',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['This dependency has not been updated in 3 years.', 'It has 47 known CVEs.'],
        choices: [
          { text: 'Upgrade with tested migration path', correct: true },
          { text: 'Pin the version and suppress the warnings', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Dependency upgraded. Another stack gone.'],
        wrongDialog: ['Suppressing warnings is how we got here.'],
      },
    ],
    solutions: [],
    rewards: { xp: 40, technicalDebtClear: 1 },
    completedDialog: ['Three cleared. You are improving.'],
    followUp: 'tech_debt_cleanup_04',
    availableInAct: 2,
  },

  tech_debt_cleanup_04: {
    id: 'tech_debt_cleanup_04',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['Someone hardcoded credentials in the config.', 'In plain text. In the repo.'],
        choices: [
          { text: 'Rotate credentials, move to key vault', correct: true },
          { text: 'Add a comment saying DO NOT COMMIT', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Credentials secured. One more stack cleared.'],
        wrongDialog: ['A comment is not a security boundary.'],
      },
    ],
    solutions: [],
    rewards: { xp: 45, technicalDebtClear: 1 },
    completedDialog: ['Four down. The auditor nods approvingly.'],
    followUp: 'tech_debt_cleanup_05',
    availableInAct: 2,
  },

  tech_debt_cleanup_05: {
    id: 'tech_debt_cleanup_05',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['This function is 800 lines long.', 'It does authentication, logging, and pizza ordering.'],
        choices: [
          { text: 'Extract into focused modules', correct: true },
          { text: 'Add region comments to organize it', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Refactored. Responsibility separated. Stack cleared.'],
        wrongDialog: ['Region comments are a cry for help, not a solution.'],
      },
    ],
    solutions: [],
    rewards: { xp: 50, technicalDebtClear: 1 },
    completedDialog: ['Halfway there. The codebase breathes easier.'],
    followUp: 'tech_debt_cleanup_06',
    availableInAct: 2,
  },

  tech_debt_cleanup_06: {
    id: 'tech_debt_cleanup_06',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['The test suite takes 45 minutes.', 'Half the tests are flaky.'],
        choices: [
          { text: 'Quarantine flaky tests, parallelize the rest', correct: true },
          { text: 'Skip CI on this branch', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['CI pipeline stabilized. Stack cleared.'],
        wrongDialog: ['Skipping CI is how fires start.'],
      },
    ],
    solutions: [],
    rewards: { xp: 55, technicalDebtClear: 1 },
    completedDialog: ['Six cleared. The auditor almost smiles.'],
    followUp: 'tech_debt_cleanup_07',
    availableInAct: 2,
  },

  tech_debt_cleanup_07: {
    id: 'tech_debt_cleanup_07',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['Three microservices share one database.', 'They write to the same tables. At the same time.'],
        choices: [
          { text: 'Define service boundaries, add API contracts', correct: true },
          { text: 'Add retry logic and hope for the best', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Service boundaries established. Stack cleared.'],
        wrongDialog: ['Retry logic on shared state is just optimistic locking with extra steps.'],
      },
    ],
    solutions: [],
    rewards: { xp: 60, technicalDebtClear: 1 },
    completedDialog: ['Seven. The end is in sight.'],
    followUp: 'tech_debt_cleanup_08',
    availableInAct: 2,
  },

  tech_debt_cleanup_08: {
    id: 'tech_debt_cleanup_08',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['The error handling strategy is: catch all, log nothing.', 'Every exception vanishes into the void.'],
        choices: [
          { text: 'Implement structured error handling and alerting', correct: true },
          { text: 'Add console.log("error happened")', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Errors visible and actionable now. Stack cleared.'],
        wrongDialog: ['That is not observability. That is denial.'],
      },
    ],
    solutions: [],
    rewards: { xp: 65, technicalDebtClear: 1 },
    completedDialog: ['Eight. Almost there.'],
    followUp: 'tech_debt_cleanup_09',
    availableInAct: 2,
  },

  tech_debt_cleanup_09: {
    id: 'tech_debt_cleanup_09',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['The deployment process involves 14 manual steps.', 'And a prayer to the demo gods.'],
        choices: [
          { text: 'Automate the pipeline end-to-end', correct: true },
          { text: 'Document the manual steps in a wiki', correct: false, hpLoss: 5 },
        ],
        correctDialog: ['Fully automated. One button deploy. Stack cleared.'],
        wrongDialog: ['A wiki nobody reads is not automation.'],
      },
    ],
    solutions: [],
    rewards: { xp: 70, technicalDebtClear: 1 },
    completedDialog: ['Nine. One more to go.'],
    followUp: 'tech_debt_cleanup_10',
    availableInAct: 2,
  },

  tech_debt_cleanup_10: {
    id: 'tech_debt_cleanup_10',
    npc: 'tech_debt_auditor',
    location: 'runbook_library',
    stages: [
      {
        dialog: ['The final boss: a 6-year-old monolith.', 'Nobody knows what half of it does. Including the original author.'],
        choices: [
          { text: 'Strangler fig pattern — extract and replace incrementally', correct: true },
          { text: 'Rewrite from scratch in a weekend', correct: false, hpLoss: 10 },
        ],
        correctDialog: ['The monolith falls. Clean Slate achieved.'],
        wrongDialog: ['Nobody has ever successfully rewritten from scratch in a weekend. Nobody.'],
      },
    ],
    solutions: [],
    rewards: { xp: 100, technicalDebtClear: 1 },
    completedDialog: ['All ten stacks cleared. The Tech Debt Auditor bows.', 'The Clean Slate is yours.'],
    followUp: null,
    availableInAct: 2,
  },
}

export const getById = (id)           => QUESTS[id]
export const getAll  = ()             => Object.values(QUESTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
