// Story act definitions, dialog trees, and narrative flags.
// Registry pattern: getById('npc_margaret') → { id, pages, variants? }
//
// Dialogue variants are checked before the default `pages`.
// Each variant has a `condition` object with optional fields:
//   reputationMin, reputationMax, shameMin, shameMax
// The first matching variant wins (evaluated top-to-bottom).
//
// Variants may also have a `pool` field (array of pages arrays) instead of
// `pages`. When matched, a random entry from the pool is selected. This is
// used for shame-3 one-liners so players see different reactions each time.
const STORY = {
  npc_margaret: {
    id:    'npc_margaret',
    questId: 'margaret_website',
    pages: [
      "Oh! A new engineer! Welcome to Localhost Town.",
      "The Azure Terminal is just east of here.\nUse it to manage your skill deck.",
      "Be careful in the tall grass — incidents love\nto ambush young engineers.",
    ],
    dialogByAct: {
      1: ["My website keeps going down!", "Can you help?"],
      2: ["Did you see that traffic spike?", "Unbelievable."],
      3: ["Things are calmer now.", "Still making bread. Still online."],
      4: ["I heard about the THROTTLEMASTER thing.", "Scary stuff."],
      finale: ["Go get 'em!", "The cloud needs you."],
    },
    followUpDialog: ["The website's been running for 3 days!", "You're a lifesaver!"],
    shameDialog: { 3: null, 7: null, 10: null },
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "...",
          "I've heard what you've been doing.\nI think you should leave.",
        ],
      },
      {
        condition: { shameMin: 5 },
        pages: [
          "You again. People are talking, you know.\nNot in a good way.",
          "Please be careful what you do out there.",
        ],
      },
      {
        // shame 3–4: random one-liner from pool about what you did to the repo
        condition: { shameMin: 3, shameMax: 4 },
        pool: [
          ["I heard about what you did to the repo.\nYou know that `git reflog` exists, right?"],
          ["Someone told me what happened in prod last week.\n...We don't need to talk about it."],
          ["I can't believe you committed directly to main.\nProfessor Pedersen is inconsolable."],
          ["So I heard about the force push.\nThe whole team had to re-clone. You know that?"],
          ["The intern cried. Just so you know.\nAfter your last deployment."],
          ["Three people filed Jira tickets about you.\nPersonally. About you."],
        ],
      },
      {
        condition: { reputationMin: 80 },
        pages: [
          "Welcome back! The whole town is talking\nabout your last deployment.",
          "You're becoming a legend around here.",
        ],
      },
      {
        condition: { reputationMax: -25 },
        pages: [
          "Oh. It's you.",
          "No, everything's fine. I was just leaving.",
        ],
      },
    ],
  },
  npc_azure_terminal: {
    id:    'npc_azure_terminal',
    pages: [
      '> AZURE TERMINAL v2.0\n> Connecting to skill management...',
    ],
  },
  npc_professor_pedersen: {
    id:    'npc_professor_pedersen',
    pages: [
      "Ah, a new student! Study hard and use\nonly the approved techniques.",
      "There are no shortcuts worth taking\nin this profession.",
    ],
    dialogByAct: {
      1: ["Welcome to the programme.\nStudy hard and follow best practices.", "There are no shortcuts worth taking."],
      2: ["The incidents are getting more complex.\nStay disciplined.", "I trust your training."],
      3: ["Something is wrong with the infrastructure.\nI can feel it.", "Be very careful who you trust."],
      4: ["So it was Karsten all along.\nI should have seen it.", "Finish this. The right way."],
      finale: ["You've graduated. Top of your class.", "I'm proud of what you've become."],
    },
    followUpDialog: null,
    shameDialog: {
      3: ["I heard about what you did to the repo\u2026\nI'm disappointed."],
      7: ["He's contacted you, hasn't he.\nBe careful."],
      10: ["I can't watch you go down this path."],
    },
    // Variants are evaluated top-to-bottom; first match wins.
    // Most-specific conditions (multiple fields) come before less-specific ones.
    variants: [
      {
        // Shadow Engineer — genuine awe mixed with deep despair
        condition: { shameMin: 10 },
        pages: [
          "I wrote the textbook on responsible engineering.\nYou apparently used it as a doorstop.",
          "And yet... you're still here. Still winning.\n*stares into the middle distance*",
          "I need a moment.",
        ],
      },
      {
        // High shame + still competent → "brilliant but dangerous"
        condition: { shameMin: 5, reputationMin: 60 },
        pages: [
          "Your work is impressive. I wish I could\nsay the same about your methods.",
          "*sighs* I hope you know what you're doing.",
        ],
      },
      {
        // High shame + low reputation → full disappointment
        condition: { shameMin: 5 },
        pages: [
          "*sighs*",
          "I've seen what's in your commit history.\nI'm deeply disappointed.",
        ],
      },
      {
        // shame 3–4 one-liner pool
        condition: { shameMin: 3, shameMax: 4 },
        pool: [
          ["I heard about what you did to the repo.\nI'm choosing to believe it was an accident."],
          ["You skipped the tests again, didn't you.\nThe CI log doesn't lie."],
          ["Three of my students saw what you did.\nThey're considering other careers now."],
          ["I've started locking the lab when you're around.\nNothing personal."],
        ],
      },
      {
        condition: { shameMin: 1 },
        pages: [
          "Hm. I've heard some things.\nJust... be careful with those techniques.",
        ],
      },
      {
        condition: { reputationMin: 80 },
        pages: [
          "Excellent work on that last incident.\nYou're exactly the kind of engineer\nwe need more of.",
        ],
      },
      {
        condition: { reputationMax: -50 },
        pages: [
          "Ah. You.",
          "You know we have a runbook now.\nSection 4 is just your name.",
        ],
      },
      {
        condition: { reputationMax: -25 },
        pages: [
          "I see you again.",
          "I've updated the curriculum.\nThere's now a case study titled 'What Not To Do.'\nI think you'll recognise the scenarios.",
        ],
      },
    ],
  },
  npc_random_intern: {
    id:    'npc_random_intern',
    pages: [
      "H-hi! I'm still learning...\nDo you have any tips?",
    ],
    dialogByAct: {
      1: ["H-hi! I'm still learning...\nDo you have any tips?"],
      2: ["I deployed my first app yesterday!\nIt only crashed twice."],
      3: ["Have you been to the Kubernetes Colosseum?\nI heard it's intense."],
      4: ["Everyone's talking about THROTTLEMASTER.\nIs it true?"],
      finale: ["I got promoted! I'm a junior now!\nThanks for the inspiration."],
    },
    followUpDialog: null,
    shameDialog: { 3: null, 7: null, 10: null },
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "Oh no.",
          "My senior said if I see you,\nI should run a `git stash` and leave immediately.",
          "Goodbye.",
        ],
      },
      {
        condition: { shameMin: 5 },
        pages: [
          "Oh. Um. I heard about you.\nMy senior told me to avoid you.",
          "No offence.",
        ],
      },
      {
        // shame 3–4 one-liner pool
        condition: { shameMin: 3, shameMax: 4 },
        pool: [
          ["I heard you push directly to main sometimes.\nIs... is that allowed?"],
          ["Someone said you deployed on a Friday?\nAnd lived?"],
          ["They're talking about you in the Slack channel.\nThe one I'm not supposed to know about."],
          ["I looked at your commit history once.\nI closed the tab pretty fast."],
        ],
      },
      {
        // shameMax: 0 — only greet clean-record players (exactly 0 shame accumulated)
        condition: { reputationMin: 80, shameMax: 0 },
        pages: [
          "I heard you fixed the payments API\nin two turns. Can you show me how?",
          "You're kind of my hero right now.",
        ],
      },
      {
        condition: { reputationMax: -25 },
        pages: [
          "Oh! Sorry, I didn't see— I mean I did see you, I just—",
          "I'll just go check on... something. Elsewhere.",
        ],
      },
    ],
  },
  npc_kristoffer: {
    id:    'npc_kristoffer',
    pages: [
      "Welcome to NorCloud AS.\nI'm Kristoffer, your manager.",
      "Check in with Professor Pedersen first.\nHe'll get you started.",
    ],
    dialogByAct: {
      1: ["Welcome aboard.\nI'm Kristoffer, your manager at NorCloud.", "Talk to Professor Pedersen to get started."],
      2: ["These incidents are escalating.\nSomeone is sabotaging our pipelines.", "Find out who's behind this."],
      3: ["I need you to go to OldCorp.\nHere's a keycard for the basement.", "Be careful in there."],
      4: ["I owe you an explanation.\nKarsten and I worked together at OmniCloud.", "I should have told you sooner."],
      finale: ["NorCloud is thriving.\nAnd it's because of you.", "You've earned your title, Principal Engineer."],
    },
    followUpDialog: null,
    shameDialog: {
      3: ["Some\u2026 concerning reports about your methods."],
      7: ["THROTTLEMASTER reached out to you?\nI can tell."],
      10: ["You're going down Karsten's path.\nPlease stop."],
    },
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "I don't know what to say to you anymore.",
          "You're going down Karsten's path.\nPlease stop.",
        ],
      },
      {
        condition: { shameMin: 5 },
        pages: [
          "People are talking about your methods.",
          "I'm worried about you.",
        ],
      },
      {
        condition: { reputationMin: 80 },
        pages: [
          "Outstanding work lately.\nKeep it up.",
        ],
      },
    ],
  },
  npc_ola_ops: {
    id:    'npc_ola_ops',
    pages: [
      "Hey. I'm Ola. I keep the servers running.",
      "Been doing ops since before Docker existed.",
    ],
    dialogByAct: {
      1: ["Hey. I'm Ola. I keep the servers running.", "Need help with Linux? Challenge me."],
      2: ["The monitoring dashboards are going crazy.\nSomething's not right.", "Stay sharp out there."],
      3: ["I've been seeing weird traffic patterns.\nSomeone's messing with the infrastructure.", "Watch your back."],
      4: ["So it was an inside job.\nI had a feeling.", "Let's fix this. Together."],
      finale: ["Uptime: 365 days and counting.\nNot bad for a team of two.", "You've earned your rest."],
    },
    followUpDialog: null,
    shameDialog: {
      3: ["Some people are talking about your techniques."],
      7: ["I won't comment. But I heard things."],
      10: ["You're not who I thought you were."],
    },
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "You're not who I thought you were.",
          "I've seen what happens when ops people\ngo down that road.",
        ],
      },
      {
        condition: { shameMin: 5 },
        pages: [
          "I won't comment. But I heard things.",
        ],
      },
      {
        condition: { reputationMin: 80 },
        pages: [
          "Solid work. You understand ops.",
          "That's rare these days.",
        ],
      },
    ],
  },
  terminal_hosting: {
    id:    'terminal_hosting',
    pages: [
      '> az staticwebapp show --name cloud-quest',
      '{\n  "name": "cloud-quest",\n  "location": "West Europe",\n  "sku": "Free",\n  "repositoryUrl": "https://github.com/wasabali/Claude-quest",\n  "branch": "main",\n  "defaultHostname": "cloud-quest.azurestaticapps.net"\n}',
      '> cat staticwebapp.config.json',
      '{\n  "globalHeaders": {\n    "Cross-Origin-Opener-Policy": "same-origin",\n    "Cross-Origin-Embedder-Policy": "require-corp"\n  }\n}',
      'These two headers are the reason you can play this game.\nYou are inside the infrastructure you are learning to manage.',
    ],
  },
  terminal_hosting_pipeline: {
    id:    'terminal_hosting_pipeline',
    pages: [
      'name: Deploy Cloud Quest\n\non:\n  push:\n    branches: [main]\n\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n      - name: Build\n        run: npm run build\n      - name: Deploy to Azure Static Web Apps\n        uses: Azure/static-web-apps-deploy@v1',
    ],
  },
  npc_west_eu_2_wilhelm: {
    id:    'npc_west_eu_2_wilhelm',
    pages: [
      "West-EU-2 Wilhelm: I used to run a whole region.\nNow I'm just deprecated.",
      "They shut it down without even a blog post.",
    ],
    dialogByAct: {
      1: ["I used to run a whole region.\nNow I'm just deprecated.", "They shut it down without even a blog post."],
      2: ["Still deprecated. Still here.", "Someone has to guard the old endpoints."],
      3: ["OldCorp used to host in my region.\nBefore the migration.", "Good times. Mostly."],
      4: ["I heard Karsten tried to bring me back online.\nAs a distraction.", "Rude."],
      finale: ["They're talking about reopening West-EU-2.\nProbably not, but a region can dream."],
    },
    followUpDialog: null,
    shameDialog: { 3: null, 7: null, 10: null },
  },
  npc_west_eu_2_wilhelm_post_terminal: {
    id:    'npc_west_eu_2_wilhelm_post_terminal',
    pages: [
      "West-EU-2 Wilhelm: West Europe. Of course they picked West Europe.",
      "I put in a request to host it in West-EU-2.\nStill waiting on the ticket.",
    ],
  },
}

export const getById = (id)           => STORY[id]
export const getAll  = ()             => Object.values(STORY)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
