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
    stages: [
      {
        dialog: [
          'There\'s a legacy billing service in the corner.',
          'Nobody has touched it in seven years.',
          'It runs on VB6 and pays the company\'s invoices.',
          'What do you want to do with it?',
        ],
      },
    ],
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

  dev_dave_flaky: {
    id: 'dev_dave_flaky',
    npc: 'dev_dave',
    location: 'pipeline_pass',
    act: 1,
    type: 'quiz',
    requiresFlags: ['act_1_started'],
    excludeFlags: ['dave_quest_complete'],
    doorMarkerTile: 'quest_marker',
    reminderDialog: ['Still getting flaky tests?', 'Come talk to me.'],
    stages: [
      {
        dialog: ['My pipeline fails randomly.', 'The test passes locally every time.'],
        choices: [
          {
            text: 'Delete the failing test',
            correct: false,
            penalty: { type: 'budget', value: -20 },
            responseDialog: ["It's still flaky. Cheaper now I guess."],
          },
          {
            text: 'Add retry logic to the test',
            correct: 'standard',
            xp: 75,
            responseDialog: ["It passes more often. Still not fixed."],
          },
          {
            text: 'Find the race condition and fix it',
            correct: 'optimal',
            xp: 120,
            itemReward: { id: 'skip_tests_scroll', qty: 1 },
            flag: 'dave_quest_optimal',
            responseDialog: ['That was the actual problem. Genius.'],
          },
        ],
      },
    ],
    completionFlag: 'dave_quest_complete',
    followUpDialog: ['That fix held up in prod.', "You're the real MVP."],
    rewards: { xp: 0, items: [], reputation: 5 },
  },

  startup_steve_storage: {
    id: 'startup_steve_storage',
    npc: 'startup_steve',
    location: 'staging_valley',
    act: 1,
    type: 'quiz',
    requiresFlags: ['act_1_started'],
    excludeFlags: ['steve_quest_complete'],
    doorMarkerTile: 'quest_marker',
    reminderDialog: ["Disk's still full...", 'Got any ideas?'],
    stages: [
      {
        dialog: ['We ran out of disk space.', 'The app is crashing.'],
        choices: [
          {
            text: 'Delete the logs folder',
            correct: 'shortcut',
            xp: 30,
            repDelta: -5,
            responseDialog: ['Space freed... for now. Feels hacky.'],
          },
          {
            text: 'Mount a bigger volume',
            correct: 'standard',
            xp: 60,
            itemReward: { id: 'ssh_key_staging', qty: 1 },
            responseDialog: ['More room. Nice. But why was it full?'],
          },
          {
            text: 'Identify and clean up old artifacts',
            correct: 'optimal',
            xp: 90,
            itemReward: { id: 'ssh_key_staging', qty: 1 },
            flag: 'steve_quest_optimal',
            responseDialog: ['Clean as a whistle. And you found the problem.'],
          },
        ],
      },
    ],
    completionFlag: 'steve_quest_complete',
    followUpDialog: ["Haven't run out of space since. You rock."],
    rewards: { xp: 0, items: [], reputation: 5 },
  },

  nervous_nancy_breach: {
    id: 'nervous_nancy_breach',
    npc: 'nervous_nancy',
    location: 'production_plains',
    act: 2,
    type: 'branch',
    requiresFlags: ['act_2_started'],
    excludeFlags: ['nancy_quest_complete'],
    doorMarkerTile: 'quest_marker',
    reminderDialog: ["Someone's still in our database!", 'Please help!'],
    stages: [
      {
        dialog: ['Someone is accessing our database.', 'What do I do first?'],
        choices: [
          {
            text: 'Change your passwords',
            correct: 'standard',
            xp: 80,
            repDelta: -5,
            responseDialog: ['That helps... but they might still have the old keys.'],
          },
          {
            text: 'Rotate all credentials and revoke access',
            correct: 'optimal',
            xp: 120,
            flag: 'nancy_quest_optimal',
            responseDialog: ["All access revoked. Credentials rotated. We're safe."],
          },
          {
            text: "Don't worry, it's probably fine",
            correct: 'nuclear',
            xp: 0,
            shameDelta: 2,
            repDelta: -30,
            triggerEncounter: 'leaked_secret',
            responseDialog: ["IT'S NOT FINE!", 'THE SECRETS ARE EVERYWHERE!'],
          },
        ],
      },
    ],
    completionFlag: 'nancy_quest_complete',
    followUpDialog: ['No more unauthorized access.', 'I can sleep again.'],
    rewards: { xp: 0, items: [], reputation: 10 },
  },

  budget_barry_bill: {
    id: 'budget_barry_bill',
    npc: 'budget_barry',
    location: 'azure_town',
    act: 2,
    type: 'quiz',
    requiresFlags: ['act_2_started'],
    excludeFlags: ['barry_quest_complete'],
    doorMarkerTile: 'quest_marker',
    reminderDialog: ['The bill is still climbing!', 'Do something!'],
    stages: [
      {
        dialog: ['Our Azure bill went from €200 to €600 overnight.', 'Help!'],
        choices: [
          {
            text: 'Call Microsoft and yell at them',
            correct: false,
            penalty: { type: 'reputation', value: -15 },
            responseDialog: ['They put us on hold for 3 hours. Barry bought Reserved Instances for 3 years.'],
          },
          {
            text: 'Enable cost alerts and investigate',
            correct: 'optimal',
            xp: 100,
            itemReward: { id: 'azure_credit_voucher', qty: 1 },
            flag: 'barry_quest_optimal',
            responseDialog: ['Found the problem. A dev left autoscale on overnight.'],
          },
          {
            text: 'Delete everything and start over',
            correct: 'cursed',
            xp: 25,
            shameDelta: 1,
            repDelta: -30,
            responseDialog: ["Everything's gone. The bill stopped. So did the company."],
          },
        ],
      },
    ],
    completionFlag: 'barry_quest_complete',
    followUpDialog: ["Bill's under control. Finance team stopped crying."],
    rewards: { xp: 0, items: [], reputation: 5 },
  },

  intern_ivan_roaming: {
    id: 'intern_ivan_roaming',
    npc: 'intern_ivan',
    location: null,
    type: 'multi_stage',
    requiresFlags: ['act_1_started'],
    excludeFlags: ['ivan_quest_complete'],
    doorMarkerTile: null,
    reminderDialog: ['Oh! I had another question...', 'If you have time?'],
    ivanLocations: {
      1: 'pipeline_pass',
      2: 'staging_valley',
      3: 'jira_dungeon',
      4: 'architecture_district',
      5: 'cloud_console',
    },
    stages: [
      {
        dialog: ["Hi! I'm Ivan, the new intern.", 'What is a container?'],
        choices: [
          {
            text: "It's like a lightweight VM",
            correct: 'standard',
            xp: 30,
            responseDialog: ['Oh cool! *writes it down*'],
          },
          {
            text: 'A sandboxed process with its own filesystem',
            correct: 'optimal',
            xp: 30,
            responseDialog: ['Oh cool! *writes it down carefully*'],
          },
          {
            text: "It's where you put the cloud",
            correct: false,
            responseDialog: ['Oh cool! *writes it down*'],
          },
        ],
      },
      {
        dialog: ['Oh hey! I have another question.', 'What is a Kubernetes?'],
        choices: [
          {
            text: 'Container orchestration platform',
            correct: 'optimal',
            xp: 40,
            responseDialog: ['Wow, that sounds important! *writes it down*'],
          },
          {
            text: "It's Greek for helmsman",
            correct: 'standard',
            xp: 40,
            responseDialog: ["That's... actually true. *writes it down*"],
          },
          {
            text: 'Nobody really knows',
            correct: false,
            responseDialog: ['Honestly, same. *writes it down*'],
          },
        ],
      },
      {
        dialog: ['You again! Perfect.', 'What is the cloud?'],
        choices: [
          {
            text: "Someone else's computer",
            correct: 'standard',
            xp: 50,
            responseDialog: ['I KNEW it! *writes it down triumphantly*'],
          },
          {
            text: 'Distributed computing resources on demand',
            correct: 'optimal',
            xp: 50,
            responseDialog: ["That's way better than what my senior said. *writes it down*"],
          },
          {
            text: 'A marketing term',
            correct: false,
            responseDialog: ['That explains a lot. *writes it down*'],
          },
        ],
      },
      {
        dialog: ["I've been thinking a lot.", 'What is a computer?'],
        choices: [
          {
            text: 'A machine that follows instructions',
            correct: 'optimal',
            xp: 60,
            responseDialog: ['*stares into distance* ...whoa.', '*runs off*'],
          },
          {
            text: "It's complicated",
            correct: 'standard',
            xp: 60,
            responseDialog: ['*nods slowly*', '*runs off*'],
          },
          {
            text: 'Are any of us really computers?',
            correct: 'standard',
            xp: 60,
            responseDialog: ['*existential crisis* *runs off*'],
          },
        ],
      },
      {
        dialog: ['I know this is a big question but...', 'What is infrastructure?'],
        choices: [
          {
            text: 'Everything under the application',
            correct: 'optimal',
            xp: 100,
            itemReward: { id: 'dockertle_treat', qty: 1 },
            responseDialog: ['That makes so much sense!', 'Here, I found this. I think you should have it.'],
          },
          {
            text: 'Servers, networks, and storage',
            correct: 'standard',
            xp: 100,
            itemReward: { id: 'dockertle_treat', qty: 1 },
            responseDialog: ['I think I finally get it!', 'Here, take this. I found it in the server room.'],
          },
          {
            text: 'The stuff that breaks at 3am',
            correct: 'standard',
            xp: 100,
            itemReward: { id: 'dockertle_treat', qty: 1 },
            responseDialog: ['*laughs nervously* Yeah...', 'Here, you deserve this.'],
          },
        ],
      },
    ],
    completionFlag: 'ivan_quest_complete',
    followUpDialog: ['I got promoted! To Junior!', 'Thanks for teaching me everything.'],
    rewards: { xp: 0, items: [], reputation: 15 },
  },

  architect_alice_design: {
    id: 'architect_alice_design',
    npc: 'architect_alice',
    location: 'architecture_district',
    type: 'multi_stage',
    requiresFlags: ['act_2_started'],
    excludeFlags: ['alice_quest_complete'],
    doorMarkerTile: 'quest_marker',
    reminderDialog: ["The design isn't done yet.", "Come back when you're ready."],
    stages: [
      {
        requiresFlags: ['architecture_district_entered'],
        dialog: ["I'm designing a high-traffic system.", 'How would you handle the load?'],
        choices: [
          {
            text: 'Auto-scaling + load balancer',
            correct: 'optimal',
            xp: 0,
            itemReward: { id: 'blueprint_v1', qty: 1 },
            flag: 'blueprint_v1_acquired',
            responseDialog: ["Perfect. That's stage one sorted.", 'Take this blueprint.'],
          },
          {
            text: 'Just buy a bigger server',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["That's... not how we do things here.", 'Come back with a better idea.'],
          },
          {
            text: 'Cache everything',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["Caching alone won't handle the traffic spikes.", 'Think bigger.'],
          },
        ],
      },
      {
        requiresFlags: ['security_vault_cleared'],
        dialog: ["Good, you're back.", 'Now how do we secure it?'],
        choices: [
          {
            text: 'Zero-trust + IAM roles',
            correct: 'optimal',
            xp: 0,
            itemReward: { id: 'blueprint_v2', qty: 1 },
            flag: 'blueprint_v2_acquired',
            responseDialog: ['Exactly. Trust nothing, verify everything.', 'Blueprint updated.'],
          },
          {
            text: 'Firewall everything',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["Firewalls aren't enough anymore.", 'Try again.'],
          },
          {
            text: 'Hope nobody attacks us',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["...I'm going to pretend you didn't say that.", 'Come back with a real answer.'],
          },
        ],
      },
      {
        requiresFlags: ['kube_master_defeated'],
        dialog: ['Almost there.', 'How do we containerise it?'],
        choices: [
          {
            text: 'Docker + K8s with resource limits',
            correct: 'optimal',
            xp: 0,
            itemReward: { id: 'blueprint_v3', qty: 1 },
            flag: 'blueprint_v3_acquired',
            responseDialog: ["Resource limits. Good. You've learned.", 'Final blueprint piece.'],
          },
          {
            text: 'Just use Docker Compose',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ['For production? No.', 'Think at scale.'],
          },
          {
            text: 'Run it on bare metal',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["We're past that.", "Come back when you're ready for containers."],
          },
        ],
      },
      {
        requiresFlags: ['blueprint_v1_acquired', 'blueprint_v2_acquired', 'blueprint_v3_acquired', 'gym_7_complete'],
        dialog: ['You have all three blueprints.', 'Present the full design.'],
        choices: [
          {
            text: 'Scaled, secured, containerised with limits',
            correct: 'optimal',
            xp: 0,
            responseDialog: ["That's a Principal-level architecture.", "I'm impressed."],
          },
          {
            text: 'It works on my machine',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ['*stares*', "Come back when you're serious."],
          },
          {
            text: 'I used all the buzzwords',
            correct: false,
            penalty: { type: 'stage_reset' },
            responseDialog: ["Buzzwords don't pass architecture reviews.", 'Try again.'],
          },
        ],
      },
    ],
    completionFlag: 'alice_quest_complete',
    followUpDialog: ['The architecture review passed.', 'First try. That never happens.'],
    rewards: { xp: 200, items: [], reputation: 20 },
  },
}

export const getById = (id)           => QUESTS[id]
export const getAll  = ()             => Object.values(QUESTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
