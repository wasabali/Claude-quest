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
//
// dialogByAct: optional per-act dialog overrides. When the player's current
// act matches a key, those pages replace the default `pages` (before variants
// are evaluated). Keys are act numbers (1–5) or 'finale'/'postgame'.

// ---------------------------------------------------------------------------
// ACT_TRANSITIONS — flag-triggered act advancement definitions
// ---------------------------------------------------------------------------
const ACT_TRANSITIONS = {
  prologue_to_1: {
    id:           'prologue_to_1',
    triggerFlags: ['starter_deck_chosen', 'first_battle_won'],
    fromAct:      0,
    newAct:       1,
    titleCard:    'ACT 1',
    titleSub:     '"Push to Production"',
    narration: [
      'Professor Pedersen waves you off.',
      "The world's problems await.",
      'Your first commit awaits.',
    ],
  },
  act1_to_2: {
    id:           'act1_to_2',
    triggerFlags: ['margaret_quest_complete', 'gym_1_beaten'],
    fromAct:      1,
    newAct:       2,
    titleCard:    'ACT 2',
    titleSub:     '"It Works on My Machine"',
    narration: [
      "Margaret's bakery went live.",
      "Four hours later:",
      "It was on the front page of HN.",
    ],
  },
  act2_to_3: {
    id:           'act2_to_3',
    triggerFlags: ['gym_2_beaten', 'gym_3_beaten', 'staging_deployed'],
    fromAct:      2,
    newAct:       3,
    titleCard:    'ACT 3',
    titleSub:     '"Legacy Migration"',
    narration: [
      "NorCloud AS has a new client.",
      "OldCorp. Legacy systems since 1987.",
      "They said: 'Don't touch anything.'",
    ],
  },
  act3_to_4: {
    id:           'act3_to_4',
    triggerFlags: ['gym_4_beaten', 'gym_5_beaten', 'do_not_touch_resolved'],
    fromAct:      3,
    newAct:       4,
    titleCard:    'ACT 4',
    titleSub:     '"The Throttling"',
    narration: [
      "The migration is done.",
      "But something doesn't add up.",
      "Kristoffer knows more than he's said.",
    ],
  },
  act4_to_finale: {
    id:           'act4_to_finale',
    triggerFlags: ['gym_6_beaten', 'gym_7_beaten', 'throttlemaster_unmasked'],
    fromAct:      4,
    newAct:       5,
    titleCard:    'FINALE',
    titleSub:     '"The Post-Mortem"',
    narration: [
      "THROTTLEMASTER is Karsten Ottesen.",
      "Kristoffer's ex-colleague from OmniCloud.",
      "Now: the CTO is waiting.",
    ],
  },
}

// ---------------------------------------------------------------------------
// VIRAL_WAVE — scripted 3-encounter sequence on first Production Plains
//              entry after Act 2 begins
// ---------------------------------------------------------------------------
const VIRAL_WAVE = {
  id:           'viral_wave',
  triggerAct:   2,
  triggerFlag:  'viral_wave_complete',
  location:     'production_plains',
  encounters: [
    { id: 'high_cpu_incident',        description: 'High CPU incident' },
    { id: 'disk_full_incident',       description: 'Disk Full incident' },
    { id: 'cascading_failure_incident', description: 'Cascading failure incident' },
  ],
  rewardFlag:   'viral_wave_complete',
  rewardNpc:    'sla_signe',
  rewardItem:   'on_call_phone',
}

// ---------------------------------------------------------------------------
// THREE_AM_SCENE — forced scripted sequence after viral wave
// ---------------------------------------------------------------------------
const THREE_AM_SCENE = {
  id:          'three_am_scene',
  triggerFlag: 'viral_wave_complete',
  guardFlag:   'three_am_scene_complete',
  clockText:   '03:17',
  narration: [
    "Your phone buzzes. Then again.",
    "The on-call rotation doesn't care\nthat you just went to bed.",
    "You stare at the ceiling.",
    "The alerts keep coming.",
    "...you get up.",
  ],
  returnLocation: 'localhost_town',
}

// ---------------------------------------------------------------------------
// KRISTOFFER — per-act locations and shame reactions
// ---------------------------------------------------------------------------
const KRISTOFFER_LOCATIONS = {
  1:        'localhost_town',
  2:        'production_plains',
  3:        'oldcorp_basement',
  4:        'architecture_district',
  5:        null,
  postgame: 'localhost_town',
}

const KRISTOFFER_SHAME_REACTIONS = [
  { shameMin: 15, pages: ["You're going to join him, aren't you."] },
  { shameMin: 10, pages: ["You're going down the same path\nKarsten did. Please stop."] },
  { shameMin:  7, pages: ["THROTTLEMASTER contacted you,\ndidn't he. I can tell."] },
  { shameMin:  3, pages: ["I've heard some… concerning things\nabout your methods."] },
]

// ---------------------------------------------------------------------------
// NPC_APPEARANCES — new NPCs that appear in specific acts
// ---------------------------------------------------------------------------
const NPC_APPEARANCES = {
  sla_signe:         { appearsInAct: 2, location: 'production_plains' },
  dagny_the_dba:     { appearsInAct: 3, location: 'oldcorp_basement' },
  compliance_carina: { appearsInAct: 4, location: 'azure_town' },
  pedersen_finale:   { appearsInAct: 5, location: 'cloud_console' },
}

// ---------------------------------------------------------------------------
// STORY — NPC dialog registry (existing + per-act overrides)
// ---------------------------------------------------------------------------
const STORY = {
  npc_margaret: {
    id:    'npc_margaret',
    pages: [
      "Oh! A new engineer! Welcome to Localhost Town.",
      "The Azure Terminal is just east of here.\nUse it to manage your skill deck.",
      "Be careful in the tall grass — incidents love\nto ambush young engineers.",
    ],
    dialogByAct: {
      1: ["My website keeps going down!", "Can you help?"],
      2: ["Did you see that traffic spike?", "I've been baking non-stop."],
      3: ["Things are calmer now.", "Still making bread. Still online."],
      4: ["I heard about the THROTTLEMASTER thing.", "Scary stuff."],
      5: ["Go get 'em. The cloud needs you."],
    },
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
      1: ["Remember: always read the docs first.", "The cloud is vast, but well-documented."],
      2: ["That viral moment has me worried.", "Scale-out is one thing. Scale-out at 3am\nis another."],
      3: ["I visited NorCloud last week.\nBe very careful with DO_NOT_TOUCH.", "Legacy systems bite back."],
      4: ["The THROTTLEMASTER reveal…\nI feared something like this.", "Trust your training."],
      5: ["This is it. The Cloud Console awaits.", "Everything I taught you leads here."],
    },
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
  terminal_hosting: {
    id:    'terminal_hosting',
    pages: [
      '> az staticwebapp show --name cloud-quest',
      '{\n  "name": "cloud-quest",\n  "location": "West Europe",\n  "sku": "Free",\n  "repositoryUrl": "https://github.com/wasabali/claudeomon",\n  "branch": "main",\n  "defaultHostname": "cloud-quest.azurestaticapps.net"\n}',
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
  },
  npc_west_eu_2_wilhelm_post_terminal: {
    id:    'npc_west_eu_2_wilhelm_post_terminal',
    pages: [
      "West-EU-2 Wilhelm: West Europe. Of course they picked West Europe.",
      "I put in a request to host it in West-EU-2.\nStill waiting on the ticket.",
    ],
  },
  npc_kristoffer: {
    id:    'npc_kristoffer',
    pages: [
      "Welcome to NorCloud! I'm Kristoffer,\nyour team lead.",
      "Let me know if you need anything.",
    ],
    dialogByAct: {
      1: ["Good to have you on the team.", "Head out and handle some incidents.\nI'll be here if you need me."],
      2: ["Did you see the traffic numbers?", "This is getting out of hand.\nI'm… I'm sure it'll be fine."],
      3: ["OldCorp is… complicated.", "Just don't touch anything they told\nus not to touch. Please."],
      4: ["We need to talk.", "I should have told you sooner.\nAbout Karsten. About everything."],
      5: ["..."],
      postgame: ["I'm sorry. That's all I can say."],
    },
    locationByAct: KRISTOFFER_LOCATIONS,
    shameReactions: KRISTOFFER_SHAME_REACTIONS,
    variants: [
      {
        condition: { shameMin: 15 },
        pages: [
          "You're going to join him, aren't you.",
        ],
      },
      {
        condition: { shameMin: 10 },
        pages: [
          "You're going down the same path\nKarsten did. Please stop.",
        ],
      },
      {
        condition: { shameMin: 7 },
        pages: [
          "THROTTLEMASTER contacted you,\ndidn't he. I can tell.",
        ],
      },
      {
        condition: { shameMin: 3 },
        pages: [
          "I've heard some… concerning things\nabout your methods.",
        ],
      },
    ],
  },
  npc_sla_signe: {
    id:    'npc_sla_signe',
    pages: [
      "SLA Signe: You survived the wave?",
      "Here — take this On-Call Phone.\nYou're going to need it.",
    ],
    appearsInAct: 2,
    location: 'production_plains',
  },
  npc_dagny_the_dba: {
    id:    'npc_dagny_the_dba',
    pages: [
      "Dagny the DBA: These tables haven't\nbeen normalised since 1987.",
      "Don't even look at the stored procedures.",
    ],
    appearsInAct: 3,
    location: 'oldcorp_basement',
  },
  npc_compliance_carina: {
    id:    'npc_compliance_carina',
    pages: [
      "Compliance Carina: Every deployment\nneeds an audit trail.",
      "No exceptions. Yes, even hotfixes.",
    ],
    appearsInAct: 4,
    location: 'azure_town',
  },
  npc_pedersen_finale: {
    id:    'npc_pedersen_finale',
    pages: [
      "Professor Pedersen: You made it.",
      "The Cloud Console is through that door.",
      "Everything I taught you leads to this.",
    ],
    appearsInAct: 5,
    location: 'cloud_console',
  },
}

// ---------------------------------------------------------------------------
// STORY registry exports (NPC dialog)
// ---------------------------------------------------------------------------
export const getById = (id)           => STORY[id]
export const getAll  = ()             => Object.values(STORY)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)

// ---------------------------------------------------------------------------
// ACT_TRANSITIONS registry exports
// ---------------------------------------------------------------------------
export const getTransitionById  = (id) => ACT_TRANSITIONS[id]
export const getAllTransitions   = ()   => Object.values(ACT_TRANSITIONS)

// ---------------------------------------------------------------------------
// Scripted sequence exports
// ---------------------------------------------------------------------------
export const getViralWave    = () => VIRAL_WAVE
export const getThreeAmScene = () => THREE_AM_SCENE

// ---------------------------------------------------------------------------
// NPC appearance exports
// ---------------------------------------------------------------------------
export const getNpcAppearances    = ()   => NPC_APPEARANCES
export const getNpcAppearance     = (id) => NPC_APPEARANCES[id]

// ---------------------------------------------------------------------------
// Kristoffer location/shame exports
// ---------------------------------------------------------------------------
export const getKristofferLocations     = () => KRISTOFFER_LOCATIONS
export const getKristofferShameReactions = () => KRISTOFFER_SHAME_REACTIONS
