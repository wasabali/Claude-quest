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
// dialogByAct: optional per-act dialog override data keyed by act number
// (1–5) or 'finale'/'postgame'. This file defines the schema only; current
// dialogue resolution uses `variants` and default `pages`.

// ---------------------------------------------------------------------------
// ACT_TRANSITIONS — flag-triggered act advancement definitions
// ---------------------------------------------------------------------------
const ACT_TRANSITIONS = {
  prologue_to_1: {
    id:           'prologue_to_1',
    triggerFlags: ['starter_deck_chosen', 'first_battle_won'],
    fromAct:      1,
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
    { id: 'high_cpu',    description: 'High CPU incident' },
    { id: 'disk_full',   description: 'Disk Full incident' },
    { id: '503_error',   description: 'Cascading failure incident' },
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

// ---------------------------------------------------------------------------
// NPC_APPEARANCES — new NPCs that appear in specific acts
// ---------------------------------------------------------------------------
const NPC_APPEARANCES = {
  sla_signe:         { appearsInAct: 2, location: 'production_plains' },
  dagny_the_dba:     { appearsInAct: 3, location: 'oldcorp_basement' },
  compliance_carina: { appearsInAct: 4, location: 'azure_town' },
  pedersen_finale:   { appearsInAct: 5, location: 'the_cloud_console' },
}

// ---------------------------------------------------------------------------
// STORY — NPC dialog registry (existing + per-act overrides)
// ---------------------------------------------------------------------------
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
      3: ["Some… concerning reports about your methods."],
      7: ["THROTTLEMASTER reached out to you?\nI can tell."],
      10: ["You're going down Karsten's path.\nPlease stop."],
    },
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

  // =========================================================================
  // CTO BOSS — dialog by phase
  // =========================================================================

  cto_phase_1_intro: {
    id: 'cto_phase_1_intro',
    pages: [
      "Why is the site down?",
      "I have a board meeting in 20 minutes\nand the dashboard is showing red.",
      "Fix it. Now.",
    ],
  },
  cto_phase_2_transition: {
    id: 'cto_phase_2_transition',
    pages: [
      "Fine, the site is up. But LOOK at this bill.",
      "LOOK AT IT.",
      "This is more than my house.",
    ],
  },
  cto_phase_3_transition: {
    id: 'cto_phase_3_transition',
    pages: [
      "I need you to explain something.",
      "Why. Can't. We. Use. Excel?",
      "I built the original system in Excel.\nIt worked fine for 15 years.",
    ],
  },
  cto_executive_mode: {
    id: 'cto_executive_mode',
    pages: [
      "That's it. I'm taking over.",
      "Executive Mode: ACTIVATED.",
    ],
  },
  cto_defeat: {
    id: 'cto_defeat',
    pages: [
      "...",
      "You know what? You're promoted.",
      "Principal Engineer, effective immediately.",
    ],
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "You won. I don't know how you operate,\nand I don't want to know.",
          "You're promoted.",
        ],
      },
    ],
  },

  // =========================================================================
  // ENDINGS
  // =========================================================================

  ending_post_mortem: {
    id: 'ending_post_mortem',
    title: 'The Post-Mortem',
    titleCard: '"The Post-Mortem"',
    promotionLine: "I'm promoting you to Principal Engineer.",
    confluenceLine: 'Page views: 0.',
    creditsMusic: 'bgm_azure_theme_chiptune',
    postCreditsText: 'ALERT: Production Plains — High CPU (98%).',
    postCreditsFollowUp: '47 more alerts pending.',
    pages: ['"The Post-Mortem"'],
  },
  ending_shadow_post_mortem: {
    id: 'ending_shadow_post_mortem',
    title: 'The Shadow Post-Mortem',
    titleCard: '"The Shadow Post-Mortem"',
    promotionLine: "Promoted. There are also some audit findings.\nWe'll discuss those.",
    confluenceLine: 'Page views: 0.',
    creditsMusic: 'bgm_azure_theme_minor',
    postCreditsText: 'AUDIT: 47 compliance findings pending.',
    postCreditsFollowUp: 'Have a good weekend.',
    pages: ['"The Shadow Post-Mortem"'],
  },
  ending_fork_the_company: {
    id: 'ending_fork_the_company',
    title: 'Fork the Company',
    titleCard: '"Fork the Company"',
    promotionLine: 'Welcome to TechThrottle Consulting AS.',
    creditsMusic: 'bgm_cursed_theme',
    postCreditsText: 'Monthly Azure bill: €47,000.',
    postCreditsFollowUp: 'Promotion: Principal Villain.',
    pages: ['"Fork the Company"'],
  },

  // =========================================================================
  // CREDITS NPC LIST
  // =========================================================================

  credits_npc_list: {
    id: 'credits_npc_list',
    pages: [],
    entries: [
      { name: 'Margaret',                role: 'Town Guide' },
      { name: 'Professor Pedersen',      role: 'Ethics & Education' },
      { name: 'Ola the Ops Guy',         role: 'Linux Fundamentals' },
      { name: 'Tux the Terminal Wizard',  role: 'Terminal Arts' },
      { name: 'Fatima the Function Witch', role: 'Serverless Engineering' },
      { name: 'Bjorn the Breaker',       role: 'Security Operations' },
      { name: 'The CTO',                 role: 'Executive Oversight' },
      { name: 'The Random Intern',       role: 'Moral Support' },
    ],
  },

  // =========================================================================
  // CONFLUENCE PAGE
  // =========================================================================

  confluence_page: {
    id: 'confluence_page',
    pages: [
      "Confluence — New Page Created:",
      "Page views: 0.",
    ],
  },

  // =========================================================================
  // POST-CREDITS PAGER
  // =========================================================================

  pager_alert: {
    id: 'pager_alert',
    pages: [
      'ALERT: Production Plains — High CPU (98%).\nClick to acknowledge.',
    ],
  },
  pager_acknowledged: {
    id: 'pager_acknowledged',
    pages: [
      'Thank you for acknowledging this alert.\n47 more alerts pending.',
    ],
  },

  // ── Act title cards ───────────────────────────────────────────────────────
  act_title_prologue: {
    id: 'act_title_prologue',
    pages: [
      'PROLOGUE\n\n"Hello World"',
      "Professor Pedersen's lab. A new engineer\nstarts their first day.",
      'Pick a name. Pick a starter deck.\nThe cloud awaits.',
    ],
  },
  act_title_act1: {
    id: 'act_title_act1',
    pages: [
      'ACT 1\n\n"Push to Production"',
      "Localhost Town. Old Margaret's bakery\nwebsite keeps going down.",
      'Your first real deploy. What could go wrong.',
    ],
  },
  act_title_act2: {
    id: 'act_title_act2',
    pages: [
      'ACT 2\n\n"It Works on My Machine"',
      'The app went viral. Production is on fire.\nStaging Valley is a lie.',
      'THROTTLEMASTER interferes.\nThe pager goes off at 3:17am.',
    ],
  },
  act_title_act3: {
    id: 'act_title_act3',
    pages: [
      'ACT 3\n\n"Legacy Migration"',
      "OldCorp contracted NorCloud.\nSomebody needs to touch DO_NOT_TOUCH.exe.",
      'Kristoffer is acting suspicious.\nThe Jira dungeon never ends.',
    ],
  },
  act_title_act4: {
    id: 'act_title_act4',
    pages: [
      'ACT 4\n\n"Root Cause Analysis"',
      'THROTTLEMASTER unmasked.\nThe reputation gates are tightening.',
      'Architecture District. Security Vault.\nThe truth is in the commit history.',
    ],
  },
  act_title_finale: {
    id: 'act_title_finale',
    pages: [
      'FINALE\n\n"The Post-Mortem"',
      'The Cloud Console. The CTO.\nThree phases. One chance.',
      'Reputation check. Shame check.\nPrincipal Engineer. Or Principal Villain.',
    ],
  },

  // ── Story NPCs ────────────────────────────────────────────────────────────
  npc_compliance_carina: {
    id: 'npc_compliance_carina',
    pages: [
      "I'm Carina from the Compliance team.\nHave you filed your audit logs?",
      "No? I'll be watching your deployments.\nI always am.",
    ],
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "I know what you've been doing.\nI've had a report on my desk for three weeks.",
          "I'm not authorised to discuss it.\nYet.",
        ],
      },
      {
        condition: { reputationMin: 75 },
        pages: [
          "Carina, Azure Compliance.\nYour audit logs are actually clean.",
          "I don't say that often.\nWell done.",
        ],
      },
    ],
  },
  npc_intern_ivan: {
    id: 'npc_intern_ivan',
    pages: [
      "Hi! I'm Ivan. I just started.\nWhat is a container?",
    ],
    dialogByAct: {
      2: [
        "What is the cloud?",
        "Like. Metaphysically.",
      ],
      3: [
        "Wait. What is a Kubernetes?",
        "I've been here 3 months.",
      ],
      4: [
        "What is infrastructure?",
        "I'm asking for a friend.\nThe friend is me.",
      ],
      finale: [
        "What is a computer?",
        "I've been promoted to Senior Developer.",
      ],
    },
  },
  npc_dagny_dba: {
    id: 'npc_dagny_dba',
    questId: 'do_not_touch',
    pages: [
      "I'm Dagny. I manage the OldCorp databases.\nDon't touch DO_NOT_TOUCH.exe.",
      "I'm serious. I've seen what happens.\nPlease.",
    ],
    followUpDialog: [
      "Well. That's done.\nCan you also fix my home Wi-Fi?",
    ],
    variants: [
      {
        condition: { reputationMin: 60 },
        pages: [
          "Your reputation precedes you.\nI'll trust you with the sensitive tables.",
          "Don't make me regret it.",
        ],
      },
      {
        condition: { shameMin: 3 },
        pages: [
          "I've heard about your methods.\nPlease. Stay away from my databases.",
        ],
      },
    ],
  },
  npc_sla_signe: {
    id: 'npc_sla_signe',
    pages: [
      "Signe. SRE. On-call. Always.\nHere — take the pager.",
      "You're on rotation now. Good luck.\nThe prod alerts go to your phone.",
    ],
    variants: [
      {
        condition: { shameMin: 5 },
        pages: [
          "I heard about your last deployment.\nThe SLA breach report had your name on it.",
          "Still. Here's the pager.\nWe're short-staffed.",
        ],
      },
      {
        condition: { reputationMin: 80 },
        pages: [
          "Your uptime record is better than mine.\nI don't say that to anyone.",
          "Take the pager. You've earned it.\nCall me if it's a SEV1.",
        ],
      },
    ],
  },
  npc_budget_bjorn: {
    id: 'npc_budget_bjorn',
    pages: [
      "Björn. FinOps.\nHave you checked your Azure spend this month?",
      "No? Come back when you have.\nThe dashboard is free. The bill is not.",
    ],
    variants: [
      {
        condition: { reputationMin: 70 },
        pages: [
          "Someone wasted 200 VMs over a bank holiday.\nI almost fainted.",
          "Thank you for resolving it.\nThe CFO has stopped emailing me.",
        ],
      },
      {
        condition: { shameMin: 5 },
        pages: [
          "*gasp*",
          "Your budget. It's... it's almost gone.",
          "I need to sit down.",
        ],
      },
    ],
  },
  npc_vendor_viggo: {
    id: 'npc_vendor_viggo',
    pages: [
      "Viggo's Azure Emporium! Step right in!\nBest prices in the cloud.",
      "What are you looking for?\nI have tools, docs, rare consumables.",
      "Premium tier? Only 10× the price.\nAbsolutely worth it. Probably.",
    ],
    variants: [
      {
        condition: { reputationMin: 80 },
        pages: [
          "Hey! I've heard of you.\nDistinguished Engineer, right?",
          "Fifteen percent discount.\nReputation has its perks.",
        ],
      },
      {
        condition: { reputationMax: 20 },
        pages: [
          "...",
          "I'm going to need to see some ID.\nAnd a reputation check.",
        ],
      },
    ],
  },
  npc_rubber_duck: {
    id: 'npc_rubber_duck',
    pages: [
      '*QUACK*',
      '...',
      '*QUACK*',
      "The duck stares back at you.\nOddly, you do feel a bit clearer.",
      "You've explained the problem out loud.\nThat's usually half the fix.",
    ],
  },

  // ── Key character dialogs ─────────────────────────────────────────────────
  npc_kristoffer_suspicious: {
    id: 'npc_kristoffer_suspicious',
    pages: [
      "Good work on the last incident.\nNorCloud is impressed.",
      "Keep an eye on the pipeline logs.\nSome runs are taking longer than they should.",
      "Let me know if you see anything... unusual.",
    ],
    dialogByAct: {
      1: [
        "Good work on the last incident.\nNorCloud is impressed.",
        "Keep an eye on the pipeline logs.\nSome runs are taking longer than they should.",
      ],
      2: [
        "Something's off with the billing data.\nI can't pin it down.",
        "Stay sharp. And document everything.",
      ],
      3: [
        "I've been reviewing the audit logs.\nThere's a pattern I can't explain.",
        "Someone with deep Azure access\nhas been making changes.",
        "Stay close. And don't mention this\nto anyone at OmniCloud.",
      ],
      4: [
        "You know the truth now.\nSo do I.",
        "We have to finish this.",
      ],
      finale: [
        "This ends here.",
        "Whatever you decide — I understand.",
      ],
    },
    variants: [
      {
        condition: { shameMin: 10 },
        pages: [
          "You know.",
          "I knew you'd find out eventually.\nKarsten and I — it's complicated.",
          "I didn't think he'd go this far.\nI'm sorry I didn't tell you sooner.",
        ],
      },
    ],
  },
  npc_throttlemaster_contact: {
    id: 'npc_throttlemaster_contact',
    pages: [
      '> INCOMING MESSAGE\n> Source: UNKNOWN\n> ---',
      "I've been watching your work.\nYou're not afraid to get your hands dirty.",
      "The cloud has rules for people\nwho don't know what they're doing.",
      "You do. Think about that.\n— T",
    ],
    variants: [
      {
        condition: { shameMin: 15 },
        pages: [
          '> INCOMING MESSAGE\n> Source: THROTTLEMASTER\n> ENCRYPTED',
          "It's time.\nYou've proven you understand the real path.",
          "Join me.\nI can give you access to everything.",
          "Final offer. Choose carefully.\n— Karsten",
        ],
      },
    ],
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
    location: 'the_cloud_console',
  },

  // ---------------------------------------------------------------------------
  // THROTTLEMASTER — main antagonist NPC
  // ---------------------------------------------------------------------------
  throttlemaster: {
    id: 'throttlemaster',
    realName: 'Karsten Ottesen',
    displayName: 'THROTTLEMASTER',
    postRevealName: 'Karsten',
    domain: null,
    sprite: 'throttlemaster_hooded',
    postRevealSprite: 'throttlemaster_unhooded',
    actFirstAppearance: 2,
    shameContact: 7,
    shameRecruitment: 15,
    // Dialog pools keyed by act/shame context.
    // [name] placeholders are replaced by the scene layer with the player's name.
    dialogPools: {
      act2_taunt: [
        "Your pipeline is now running in degraded mode.",
        "I see you're on-call tonight. Good luck with that.",
        "/* THROTTLEMASTER WAS HERE */",
      ],
      act3_taunt: [
        "Still haven't figured it out?",
        "You're better than this team deserves, [name].",
      ],
      act4_reveal_low_shame: [
        "You want to know why I do this?",
        "I was the best engineer at OmniCloud.",
        "They promoted Kristoffer instead.",
        "So I decided: if the cloud can't be fair...",
        "...I'll throttle everyone to my level.",
      ],
      act4_reveal_high_shame: [
        "I've been watching you, [name].",
        "You understand, don't you? Sometimes the wrong tool",
        "...is the only one that works.",
      ],
      recruitment: [
        "Join me. We'll fork NorCloud.",
        "You've already crossed every line I have.",
        "I just crossed them first.",
      ],
      post_defeat: [
        "...I just wanted to be recognised.",
        "Was that so hard?",
      ],
      evil_ending: [
        "Welcome to the team, [name].",
        "Your first task: throttle Production Plains.",
        "I'll handle the invoicing.",
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Terminal calling cards — THROTTLEMASTER lore breadcrumbs
  // ---------------------------------------------------------------------------
  terminal_throttlemaster_act1: {
    id:    'terminal_throttlemaster_act1',
    pages: [
      '// TODO: fix this — THROTTLEMASTER',
    ],
  },
  terminal_throttlemaster_act3: {
    id:    'terminal_throttlemaster_act3',
    pages: [
      '/* THROTTLEMASTER WAS HERE. OmniCloud Corp — never forget. */',
    ],
  },
  terminal_oldcorp_nameplate: {
    id:    'terminal_oldcorp_nameplate',
    pages: [
      'A dusty nameplate on the desk reads:\n"Karsten Ottesen, Senior Engineer"',
    ],
  },

  // ---------------------------------------------------------------------------
  // Compliance Carina — arrest sequence (standard path, shame < 10)
  // ---------------------------------------------------------------------------
  npc_compliance_carina_arrest: {
    id:    'npc_compliance_carina_arrest',
    pages: [
      "Compliance Carina: Hold it right there.",
      "I've been monitoring this individual\nfor three fiscal quarters.",
      "Karsten Ottesen, you are in violation of\nSLA Policy 7.3, Budget Directive 12,\nand the OmniCloud Corp Acceptable Use Agreement.",
      "You have the right to file a Jira ticket.\nAnything you deploy can and will be\nused against you in a post-mortem.",
      "...Please come with me.",
    ],
  },
  npc_compliance_carina_post_arrest: {
    id:    'npc_compliance_carina_post_arrest',
    pages: [
      "Compliance Carina: The paperwork alone\nwill take longer than the incident.",
      "I love my job.",
    ],
  },

  npc_intern_ivan: {
    id:    'npc_intern_ivan',
    pages: [
      "Hi! I'm Ivan. I'm the new intern.",
      'I have SO many questions.',
    ],
  },
  npc_intern_ivan_act2: {
    id:    'npc_intern_ivan_act2',
    pages: [
      "Oh hey, it's you again!",
      "I've been reading about Kubernetes.",
      'I have more questions.',
    ],
  },
  npc_intern_ivan_act3: {
    id:    'npc_intern_ivan_act3',
    pages: [
      "I think I'm starting to get it.",
      "The cloud is just... other people's computers?",
      'Anyway, I had another question.',
    ],
  },
  npc_intern_ivan_act4: {
    id:    'npc_intern_ivan_act4',
    pages: [
      "I've been thinking about this a lot.",
      "Like... a LOT a lot.",
      'What even IS a computer?',
    ],
  },
  npc_intern_ivan_finale: {
    id:    'npc_intern_ivan_finale',
    pages: [
      'I got promoted! To Junior!',
      'One last question before I go...',
      'What is infrastructure?',
    ],
  },
  // ─── Dungeon NPCs ──────────────────────────────────────────────────────────

  npc_jira_dungeon_guard: {
    id:    'npc_jira_dungeon_guard',
    pages: [
      "Turn back. There are story points ahead.",
      "You need 13 story points to open the door\nto the Sprint Corridor.",
    ],
  },
  npc_jira_dungeon_scope_creep: {
    id:    'npc_jira_dungeon_scope_creep',
    pages: [
      "Welcome to the Sprint Corridor.\nThe scope here only grows.",
      "Beat the encounters to earn story points.\nYou'll need them all.",
    ],
  },
  npc_jira_dungeon_board_room: {
    id:    'npc_jira_dungeon_board_room',
    pages: [
      "This is The Board Room.",
      "The Gantt Chart has been waiting for you.\nIt has been waiting for everyone.",
    ],
  },
  npc_cloud_console_lobby: {
    id:    'npc_cloud_console_lobby',
    pages: [
      "Welcome to the Cloud Console.",
      "Unlock 3 resource terminals to access\nthe Resource Group Chamber.",
      "Each terminal requires a different\ndomain skill: cloud, iac, security.",
    ],
  },
  npc_cloud_console_boss: {
    id:    'npc_cloud_console_boss',
    pages: [
      "The Resource Group Chamber.",
      "The Azure Bill Spike lives here.\nIt feeds on unattended auto-scale.",
    ],
  },

  // ─── Region transition messages ─────────────────────────────────────────────

  region_under_construction: {
    id:    'region_under_construction',
    pages: [
      'That route unlocks in a later act. Complete current objectives to progress.',
    ],
  },
  dungeon_points_required: {
    id:    'dungeon_points_required',
    pages: [
      "You need 13 story points to open this door.",
    ],
  },
  resource_locks_required: {
    id:    'resource_locks_required',
    pages: [
      "Unlock all 3 resource terminals to proceed.",
    ],
  },
  fast_travel_prompt: {
    id:    'fast_travel_prompt',
    pages: [
      '> AZURE TERMINAL — FAST TRAVEL\n> Select a destination...',
    ],
  },
}

// ---------------------------------------------------------------------------
// Shame one-liner pools for NPC reactions.
// Intended for per-interaction selection by consuming game logic.
// ---------------------------------------------------------------------------
export const SHAME_ONE_LINERS = {
  shame_3: [
    { id: 'shame3_01', text: 'I heard what you did to that repo. We all heard.', tone: 'disgust' },
    { id: 'shame3_02', text: 'The postmortem channel has your name in bold.', tone: 'disgust' },
    { id: 'shame3_03', text: 'Someone left a screenshot of your git log in the break room.', tone: 'disgust' },
    { id: 'shame3_04', text: 'HR says you are not technically a war criminal.', tone: 'disgust' },
    { id: 'shame3_05', text: 'The CEO mentioned you by name in the all-hands. Not in a good way.', tone: 'disgust' },
    { id: 'shame3_06', text: 'Did you... did you really chmod 777 production?', tone: 'horror' },
    { id: 'shame3_07', text: 'The firewall team printed your commit and hung it in their office. As a warning.', tone: 'horror' },
    { id: 'shame3_08', text: 'Three services went down. They are calling it your name now.', tone: 'horror' },
    { id: 'shame3_09', text: 'The SRE team made a drinking game out of your incidents.', tone: 'horror' },
    { id: 'shame3_10', text: 'Legend says if you type your name in the terminal three times, an alert fires.', tone: 'horror' },
    { id: 'shame3_11', text: 'I hate that what you did actually worked.', tone: 'respect' },
    { id: 'shame3_12', text: 'The interns think you are cool. The seniors are concerned.', tone: 'respect' },
    { id: 'shame3_13', text: 'That was the worst best fix I have ever seen.', tone: 'respect' },
    { id: 'shame3_14', text: 'Your PR got more comments than the company blog post.', tone: 'disgust' },
    { id: 'shame3_15', text: 'The on-call rotation now has a you-specific runbook.', tone: 'horror' },
  ],
  shame_5: [
    { id: 'shame5_01', text: 'The Throttlemaster sends their regards. Here is my card.', tone: 'ominous' },
    { id: 'shame5_02', text: 'You have been flagged in the vendor risk assessment.', tone: 'ominous' },
    { id: 'shame5_03', text: 'Welcome to the watchlist. Snacks are in the back.', tone: 'ominous' },
    { id: 'shame5_04', text: 'Even the load balancer knows your name now.', tone: 'ominous' },
    { id: 'shame5_05', text: 'The firewall has a rule specifically for you. Rule #1: Deny.', tone: 'ominous' },
    { id: 'shame5_06', text: 'Your access logs are being studied by three teams.', tone: 'ominous' },
    { id: 'shame5_07', text: 'Someone in security wrote a blog post about you. Anonymous. Barely.', tone: 'ominous' },
    { id: 'shame5_08', text: 'The incident channel auto-pings you now. You are not on-call.', tone: 'ominous' },
    { id: 'shame5_09', text: 'Your badge still works but the doors hesitate.', tone: 'ominous' },
    { id: 'shame5_10', text: 'The monitoring dashboard has a panel named after you.', tone: 'ominous' },
    { id: 'shame5_11', text: 'There is a canary deployment just for your commits.', tone: 'ominous' },
    { id: 'shame5_12', text: 'The SOC team has your photo on the wall. Not in a good way.', tone: 'ominous' },
    { id: 'shame5_13', text: 'Compliance sent you a holiday card. It was a cease and desist.', tone: 'ominous' },
    { id: 'shame5_14', text: 'Your merge requests now require 5 approvals. Standard is 2.', tone: 'ominous' },
    { id: 'shame5_15', text: 'The CISO mentioned you in their board presentation. Slide 7.', tone: 'ominous' },
  ],
  shame_10: [
    { id: 'shame10_01', text: "You don't look like an engineer anymore. You look like a consequence.", tone: 'dark' },
    { id: 'shame10_02', text: 'The coffee machine fears you. It brews when you walk by. Unprompted.', tone: 'dark' },
    { id: 'shame10_03', text: 'Your LinkedIn changed to Shadow Engineer and somehow got more recruiter messages.', tone: 'dark' },
    { id: 'shame10_04', text: 'You have mass. Gravitational. Services orbit around you now.', tone: 'dark' },
    { id: 'shame10_05', text: 'Legend. Shadow. Liability. HR uses all three.', tone: 'dark' },
    { id: 'shame10_06', text: 'The CI pipeline pauses when you push. Out of respect. Or fear.', tone: 'dark' },
    { id: 'shame10_07', text: 'Your terminal prompt changed to a skull emoji. You did not configure this.', tone: 'dark' },
    { id: 'shame10_08', text: 'Juniors whisper your name like a campfire story.', tone: 'dark' },
    { id: 'shame10_09', text: 'The SLA has a clause about you specifically.', tone: 'dark' },
    { id: 'shame10_10', text: 'You walk into the standup and everyone stands a little further away.', tone: 'dark' },
    { id: 'shame10_11', text: 'Kubernetes clusters self-heal faster when you are nearby. Survival instinct.', tone: 'dark' },
    { id: 'shame10_12', text: 'Your git blame is a true crime documentary.', tone: 'dark' },
    { id: 'shame10_13', text: 'The chaos engineering team says you make their job redundant.', tone: 'dark' },
    { id: 'shame10_14', text: 'Cloud providers sent you a personal thank-you. Your incidents fund three regions.', tone: 'dark' },
    { id: 'shame10_15', text: 'You have achieved a state beyond on-call. You are the incident.', tone: 'dark' },
  ],
}

// ---------------------------------------------------------------------------
// Reputation-variant NPC dialog snippets for shops and key NPCs.
// Used by scenes to pick context-appropriate dialog.
// ---------------------------------------------------------------------------
export const REPUTATION_DIALOG = {
  pedersen: {
    walking_incident: 'Ah. You. The one my insurance company called about.',
    liability:        'I see you have chosen... a path.',
    distinguished:    'I mentioned you in my keynote.',
  },
  shop: {
    walking_incident: 'Cash only. And I am counting it twice.',
    liability:        'Surge pricing is active. Just for you.',
    distinguished:    'For you? Discount. Always.',

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
export const getKristofferLocations      = () => KRISTOFFER_LOCATIONS
export const getKristofferShameReactions = () =>
  (STORY.npc_kristoffer.variants ?? [])
    .filter(v => v.condition.shameMin !== undefined)
    .map(v => ({ shameMin: v.condition.shameMin, pages: v.pages }))
