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
    rewards: { xp: 50, items: [{ id: 'azure_credit_voucher', qty: 1 }] },
    completedDialog: ["The website's been running for 3 days! Best week ever."],
    followUp: null,
  },
}

export const getById = (id)           => QUESTS[id]
export const getAll  = ()             => Object.values(QUESTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
