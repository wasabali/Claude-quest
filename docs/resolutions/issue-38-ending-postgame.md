# Resolution: Issue #38 — Ending and Post-Game

> Cross-reference: `docs/issues/content-bible.md §1`, `docs/sessions/2026-04-15-game-design.md §8`

---

## Context Gathered

- Design session: "Final boss (The CTO) adapts dialogue and phases based on Shame level." Three phases: Cloud, FinOps, Legacy. At Shame 15, alternate ending with THROTTLEMASTER.
- Content bible §1: "The Post-Mortem" — promote to Principal Engineer, Confluence page, credits, post-credits pager buzz.
- Shame threshold at 10 = Shadow Engineer title. Content bible hints this leads to "different ending" — needs defining.
- Issue #33 resolution established: evil path (Shame ≥ 15) = join THROTTLEMASTER, fork NorCloud.

---

## Ideas Generated

**Q1/Q2 — Who is The CTO and does the player meet them before?**

1. **The CTO appears once — at the final fight. Never before.** The mystery builds. NPCs mention "The CTO" throughout. Meeting them at the end is the payoff. Played entirely for comedy — out of touch, obsessed with Excel, delighted by metrics.
2. **Cameo in Act 3 from a distance** — you see them in a meeting through a window. Don't interact. Sets up the visual before the fight.
3. **Appears in Act 4 via phone call dialog** — "We need to talk. My office."

**Winner: Option 2 + 3 combined.** Cameo silhouette in Act 3 (through a boardroom window, unreachable). Phone call in Act 4 summoning you. This creates presence without requiring early boss interaction.

**Personality: comedy first, pathos last.**
- Phase 1 ("Why is the site down?"): demanding, impatient, uses buzzwords incorrectly ("Can we just synergise the downtime?")
- Phase 2 ("Why does this cost so much?"): becomes increasingly panicked about the Azure bill. "This is more than my house."
- Phase 3 ("Why didn't we just use Excel?"): genuine confusion. Not malicious — just genuinely doesn't understand why you can't run a fintech startup on Excel. It's kind of sad. And very funny.
- Post-defeat: drops the CEO voice entirely. "…You're actually good at this. I'm promoting you."

**Q3 — Phase transition lines**

| Transition | Line |
|------------|------|
| Phase 1 → 2 | "Fine, the site is up. But LOOK at this bill. LOOK AT IT." |
| Phase 2 → 3 | "I need you to explain something to me. Why. Can't. We. Use. Excel?" |
| Post-defeat (all phases) | "…You know what? You're promoted. Principal Engineer, effective immediately." |
| Post-defeat (high shame) | "You won. I don't know how you operate, and I don't want to know. You're promoted." |

**Q4 — The Confluence page**

1. **Dialog box** — the game shows a GBC-style "browser window" dialog box (faux browser chrome in pixel art): "Confluence — New Page Created: '[Name]'s Promotion to Principal Engineer'. Page views: 0." Then: "Page views: 0." Cut to credits.
2. **Full-screen static image** — Confluence UI screenshot, pixel-art version. Funny but heavy asset.
3. **Just a line of dialog** — "A Confluence page has been generated. Nobody will read it."

**Winner: Option 1** — the faux browser box is cheap (DialogBox reuse), visually funny, and perfectly captures the joke. The "0 page views" sits on screen for 3 seconds before moving on.

**Q5 — Do credits name all NPCs?**

1. **Yes — scrolling credits, NPC cameos** — like the Pokémon Hall of Fame credits walk. Each NPC's name and their role ("Old Margaret — Quest Giver", "Ola the Ops Guy — First Trainer"). The player's name appears at the end: "[Name] — Principal Engineer."
2. **Simple text scroll only** — traditional credits. Fine but less personal.
3. **No credits** — not appropriate for a game this narrative.

**Winner: Option 1.** The credits are short (the NPC cast is small) and this is one of the most rewarding moments in any RPG. Add: the BGM is a chiptune arrangement of the Azure theme but it breaks down into silence — then a single piano note. The pager buzzes. Roll to title.

**Q6 — Post-credits Azure Monitor alert**

1. **Interactive** — the pager/phone is an item in your inventory. After credits, you're returned to the world with a ❗ notification. Opening it says: "ALERT: Production Plains — High CPU (98%). Click to acknowledge." You press A. It says: "Thank you for acknowledging this alert. 47 more alerts pending." And then you're free to play.
2. **Static image/text** — non-interactive. Less satisfying.
3. **Triggers a battle immediately** — funny but aggressive.

**Winner: Option 1.** The joke lands perfectly when the player has to interact with it. "47 more alerts pending" is the punchline of the whole game.

**Q7 — Post-game content**

1. **Full post-game** — save is preserved, all areas remain open, gym rematches unlocked, missed side quests available, harder encounter pools activate.
2. **New game + only** — no post-game, start over.
3. **Limited post-game** — side quests only, no gym rematches.

**Winner: Option 1** — full post-game. This is the content hook for a second session of play. After credits:
- Save preserved at full state
- All gyms offer harder rematches (leaders have +10 level equivalents)
- "Principal Engineer Mode" encounter pools activate — every region gets +1 difficulty tier
- Missed side quests still completable
- THROTTLEMASTER's workstation accessible (if not found yet)
- New Easter egg terminal in Localhost Town: `git log --all --oneline` shows the full commit history of your save file as a joke read-out

**Q8 — Shadow Engineer (Shame 10) ending**

Three endings, not two:

| Path | Condition | Ending |
|------|-----------|--------|
| **"The Post-Mortem"** | Shame < 10 | Beat The CTO, promoted, standard ending |
| **"The Shadow Post-Mortem"** | 10 ≤ Shame < 15 | Beat The CTO, promoted, but The CTO adds: "There are also some… audit findings. We'll discuss those in a separate meeting." Principal Engineer title but asterisk. Different credits music (minor key). The "47 alerts" pager message says: "AUDIT: 47 compliance findings pending." |
| **"Fork the Company"** | Shame ≥ 15 | THROTTLEMASTER recruitment scene at Act 4. Player chooses to join. Skip The CTO fight entirely. Finale shows: "6 months later." You and Karsten run TechThrottle Consulting AS. Post-credits: an enormous Azure bill. And a promotion to "Principal Villain." |

This means Shame 10 is NOT a full alternate ending — it's a modified version of the standard ending with darker undertones and an audit subplot. Only Shame 15 triggers the full fork.

---

## Data Shape

```js
// src/data/story.js — ending definitions
const ENDINGS = {
  post_mortem: {
    id: 'post_mortem',
    title: 'The Post-Mortem',
    condition: (gameState) => gameState.player.shamePoints < 10 && gameState.story.flags.cto_defeated,
    titleCard: '"The Post-Mortem"',
    promotionLine: "I'm promoting you to Principal Engineer.",
    confluenceLine: 'Page views: 0.',
    creditsMusic: 'bgm_azure_theme_chiptune',
    postCreditsText: 'ALERT: Production Plains — High CPU (98%).',
    postCreditsFollowUp: '47 more alerts pending.',
  },
  shadow_post_mortem: {
    id: 'shadow_post_mortem',
    title: 'The Shadow Post-Mortem',
    condition: (gameState) => gameState.player.shamePoints >= 10 && gameState.player.shamePoints < 15 && gameState.story.flags.cto_defeated,
    titleCard: '"The Shadow Post-Mortem"',
    promotionLine: "Promoted. There are also some audit findings. We'll discuss those.",
    confluenceLine: 'Page views: 0.',
    creditsMusic: 'bgm_azure_theme_minor',
    postCreditsText: 'AUDIT: 47 compliance findings pending.',
    postCreditsFollowUp: 'Have a good weekend.',
  },
  fork_the_company: {
    id: 'fork_the_company',
    title: 'Fork the Company',
    condition: (gameState) => gameState.player.shamePoints >= 15 && gameState.story.flags.throttlemaster_recruitment_accepted,
    titleCard: '"Fork the Company"',
    promotionLine: "Welcome to TechThrottle Consulting AS.",
    creditsMusic: 'bgm_cursed_theme',
    postCreditsText: 'Monthly Azure bill: €47,000.',
    postCreditsFollowUp: 'Promotion: Principal Villain.',
  },
}
```

## Files Affected

- `src/data/story.js` — ending definitions, CTO NPC entry with phase dialog, credits NPC list
- `src/scenes/BattleScene.js` — 3-phase CTO fight with phase transition dialog
- `src/scenes/` — new `CreditsScene.js` (scrolling NPC credits + player name at end)
- `src/scenes/WorldScene.js` — post-credits pager interaction, post-game mode activation
- `src/engine/BattleEngine.js` — multi-phase boss support (3 sequential HP bars, different domain per phase)
- `src/config.js` — add `ENDING_CONDITIONS` reference to shame thresholds

## Follow-ups

- Design CreditsScene layout (scrolling NPC list, background, music fade)
- Define CTO's full phase skill sets (Cloud phase: `az webapp restart`, FinOps phase: cost-based attacks, Legacy phase: Excel-themed attacks)
- Design "Principal Engineer Mode" post-game encounter pool adjustments
- The `git log` easter egg terminal in post-game Localhost Town

## Content Bible Update

> ✅ **Ending and post-game (#38):**
> - **The CTO:** Comedy character, out of touch, uses buzzwords wrong. Three phases: Cloud → FinOps → Excel. Cameo silhouette in Act 3, phone call in Act 4. Post-defeat drops the act: "You're actually good at this."
> - **Phase transitions:** "Fine, the site is up. But LOOK AT THIS BILL." → "Why. Can't. We. Use. Excel?"
> - **Confluence moment:** Faux browser dialog box: "Page views: 0." Sits for 3 seconds.
> - **Credits:** Scrolling NPC cameos with roles. Player name last. Chiptune Azure theme fades to silence → pager buzz.
> - **Post-credits:** Interactive pager. "47 more alerts pending." Player presses A to start post-game.
> - **Three endings:**
>   1. *The Post-Mortem* (Shame < 10): Standard. Promoted. 47 alerts.
>   2. *The Shadow Post-Mortem* (Shame 10–14): Promoted, but audit findings. Minor-key credits. "47 compliance findings."
>   3. *Fork the Company* (Shame ≥ 15): Skip CTO, join THROTTLEMASTER. TechThrottle Consulting. €47,000 Azure bill. "Principal Villain."
> - **Post-game:** Full save preserved. Gym rematches (+10 levels). Principal Engineer Mode encounter pools. All missed side quests available. THROTTLEMASTER's workstation still accessible. Easter egg `git log` terminal in Localhost Town.
