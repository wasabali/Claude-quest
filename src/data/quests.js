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
}

export const getById = (id)           => QUESTS[id]
export const getAll  = ()             => Object.values(QUESTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
