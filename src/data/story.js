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
    pages: [
      "Oh! A new engineer! Welcome to Localhost Town.",
      "The Azure Terminal is just east of here.\nUse it to manage your skill deck.",
      "Be careful in the tall grass — incidents love\nto ambush young engineers.",
    ],
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
    variants: [
      {
        condition: { storyFlag: 'act3_started' },
        pages: [
          "Wait. What is a Kubernetes?",
          "I've been here 3 months.",
        ],
      },
      {
        condition: { storyFlag: 'act2_started' },
        pages: [
          "What is the cloud?",
          "Like. Metaphysically.",
        ],
      },
      {
        condition: { storyFlag: 'act4_started' },
        pages: [
          "What is infrastructure?",
          "I'm asking for a friend.\nThe friend is me.",
        ],
      },
      {
        condition: { storyFlag: 'finale_started' },
        pages: [
          "What is a computer?",
          "I've been promoted to Senior Developer.",
        ],
      },
    ],
  },
  npc_dagny_dba: {
    id: 'npc_dagny_dba',
    pages: [
      "I'm Dagny. I manage the OldCorp databases.\nDon't touch DO_NOT_TOUCH.exe.",
      "I'm serious. I've seen what happens.\nPlease.",
    ],
    variants: [
      {
        condition: { storyFlag: 'do_not_touch_opened' },
        pages: [
          "You opened it.",
          "...You actually opened it.",
          "I'll get the backup tapes.",
        ],
      },
      {
        condition: { storyFlag: 'do_not_touch_migrated' },
        pages: [
          "You migrated it properly.\nI've never seen anyone do that.",
          "Here. This is a rare item.\nYou've earned it.",
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
        condition: { storyFlag: 'azure_bill_spike_resolved' },
        pages: [
          "Someone wasted 200 VMs over a bank holiday.\nI almost fainted.",
          "Thank you for resolving it.\nThe CFO has stopped emailing me.",
        ],
      },
      {
        condition: { budgetMax: 20 },
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
    variants: [
      {
        condition: { storyFlag: 'act3_started' },
        pages: [
          "I've been reviewing the audit logs.\nThere's a pattern I can't explain.",
          "Someone with deep Azure access\nhas been making changes.",
          "Stay close. And don't mention this\nto anyone at OmniCloud.",
        ],
      },
      {
        condition: { storyFlag: 'throttlemaster_revealed' },
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
}

export const getById = (id)           => STORY[id]
export const getAll  = ()             => Object.values(STORY)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
