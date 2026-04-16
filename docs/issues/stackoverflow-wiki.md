# [Design] StackOverflow — In-Game Command Wiki & Knowledge Base

**Labels:** `design`, `world`, `ui`

---

## Overview

The in-game reference for looking up what commands do should be themed as **StackOverflow** — the real-world place every engineer actually goes to learn what commands do. Instead of a clean, authoritative wiki, the player gets crowd-sourced Q&A threads full of contradicting advice, outdated accepted answers, flame wars in the comments, and that one guy who marks the question as duplicate.

This is both educational (the player learns the commands) and satirical (they experience the chaos of trusting StackOverflow blindly). The game teaches you to read critically — the same way real engineering does.

---

## What This Replaces

The **Service Catalog** (#19) SKILLS tab currently serves as a clean Pokédex-style reference — every command listed with domain, tier, description, use count. This issue proposes **replacing the SKILLS tab description layer with a StackOverflow-themed interface**, or adding StackOverflow as a **separate in-world feature** that provides richer (and less reliable) command knowledge.

---

## How It Works

### Access Point

An interactable terminal or building in each town labelled **"StackOverflow"** (or accessible from Azure Terminal as a new menu option alongside Service Catalog). The player opens it and sees a Q&A thread for each command they have discovered.

### Thread Structure

Each command/skill has a thread styled as a StackOverflow question:

```
╔═══════════════════════════════════════════════╗
║  Q: How do I deploy to Azure App Service?     ║
║     Asked by: confused_intern_2019            ║
║     🏷️ azure · cloud · deployment             ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ✓ ACCEPTED ANSWER  (Score: 47)               ║
║  Just use `az webapp deploy`. Simple.         ║
║  — senior_dev_42                              ║
║                                               ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║  ANSWER (Score: 89)  ← higher score,          ║
║                        NOT accepted            ║
║  You should use `az webapp create` first,     ║
║  THEN deploy. The accepted answer skips       ║
║  the creation step entirely. I have no idea   ║
║  how this got 47 upvotes.                     ║
║  — actually_helpful_person                    ║
║                                               ║
║  ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  ║
║  ANSWER (Score: -3)                           ║
║  Just `rm -rf /var/www` and start fresh.      ║
║  — chaos_engineer_69                          ║
║  💀 [CURSED TECHNIQUE HINT]                   ║
║                                               ║
╠═══════════════════════════════════════════════╣
║  COMMENTS (3)                                 ║
║  ─ "This is a duplicate of #4821" — mod_bot  ║
║  ─ "No it isn't, #4821 is about AWS"         ║
║    — confused_intern_2019                     ║
║  ─ "Same thing" — mod_bot                    ║
╚═══════════════════════════════════════════════╝
```

### The Comment Section — People Arguing

Every thread has a comments section where users argue. This is where the StackOverflow flavour lives:

| Argument Type | Example | Game Function |
|---|---|---|
| **Duplicate police** | "This is a duplicate of [link]" / "No it isn't" | Flavour — comic relief |
| **Pedantic correction** | "Technically `deploy` is deprecated, use `up`" | Red herring — tests if player follows bad advice |
| **Framework war** | "Why are you using Azure? Just use AWS" / "Here we go again..." | World-building — other cloud providers exist in-universe |
| **The helpful buried comment** | "Actually the real issue is your RBAC permissions" | **Gameplay hint** — domain matchup clue hidden in noise |
| **Outdated info** | "This worked in 2019" / "It's 2026" / "Still works for me" | Teaches: check dates on SO answers |
| **Self-answer rage** | OP answers own question, someone downvotes it | Flavour |
| **"Did you try restarting?"** | Always appears. Always at -2 score. | Running gag |

### Information Reliability

Not all StackOverflow content is correct. The player must learn to evaluate:

| Content Type | Reliability | Player Signal |
|---|---|---|
| Accepted answer | ~70% correct | Green checkmark — but don't trust blindly |
| Highest-scored answer | ~90% correct | Often better than accepted (real SO pattern) |
| Low-score answer | May be cursed technique hint | 💀 icon if it's a cursed approach |
| Comments | Mixed — some are the real answer | No reliability signal — read carefully |
| Downvoted answer | Sometimes correct but unpopular | Contrarian plays sometimes work |

---

## Progression Integration

### Undiscovered Commands

Commands the player hasn't learned yet show as `[LOCKED]` threads — the question title is visible but answers are blurred:

```
Q: How do I force push to main?
🔒 You haven't learned this command yet.
   Defeat the trainer who knows it, or find it in the world.
```

### Discovered Commands

Full thread visible. Reading a thread for the first time grants a small XP bonus (+5 XP, same as `outdated_runbook` energy).

### Cursed Technique Threads

Cursed commands have extra-chaotic threads:

```
Q: Is it safe to chmod 777 everything?

✓ ACCEPTED (Score: 2, posted 7 years ago)
  "Yes"

ANSWER (Score: 156)
  "ABSOLUTELY NOT. This answer has been accepted for
   7 years and is responsible for 3 security breaches
   I personally investigated."
  — ingrid_iam_inspector

COMMENTS:
  ─ "Works on my machine" — root_whisperer
  ─ "Your machine IS the problem" — ingrid_iam_inspector
  ─ "Locking this thread." — mod_bot
  ─ [Thread locked. 47 comments deleted.]
```

---

## Domain Matchup Hints

StackOverflow threads subtly teach domain matchups through the arguments:

```
Q: My Kubernetes pods keep crashing. What domain fixes this?

ANSWER (Score: 34)
  "Kubernetes problems need Linux-level debugging.
   Get shell access with nsenter."
  → [Hint: Linux beats Kubernetes]

COMMENT:
  "That's terrible advice. Use kubectl describe pod first."
  → [Hint: Observability reveals true cause]

COMMENT:
  "Just delete all the pods and let them restart"
  → [Hint: This is the cursed approach — kubectl delete --all]
```

This addresses the open question in #41: *"Should players see the matchup chart in-game?"* — yes, but unreliably, through StackOverflow arguments. The player pieces it together from contradicting advice.

---

## Potential Thread Examples

| Command | Question Title | Drama |
|---|---|---|
| `az webapp deploy` | "How do I deploy to Azure?" | Accepted answer is 4 years old and uses deprecated CLI |
| `kubectl apply -f` | "Apply vs Create — which one?" | 200-comment war. Thread locked twice. |
| `terraform destroy` | "How to tear down infrastructure" | Every answer says "DON'T" except one at -12 score |
| `docker run --privileged` | "Container won't start, permission denied" | Accepted: "Just add --privileged". Comments: screaming. |
| `git push --force` | "How to fix a bad commit on main" | Top answer: `--force-with-lease`. Accepted answer: `--force`. War. |
| `rm -rf /` | Thread is `[DELETED BY MODERATOR]` | Only visible at Shame 5+ |
| `helm install` | "Helm vs raw manifests" | Religious war. No accepted answer. 3 years open. |
| `blame DNS` | "My app is down, what's wrong?" | Every single answer says "It's always DNS". Score: 4,891. |

---

## Implementation Notes

- StackOverflow thread data in `src/data/stackoverflow.js` following the registry pattern
- Each thread: `{ id, commandId, questionTitle, askedBy, tags[], answers[], comments[], locked: bool }`
- Answers: `{ text, author, score, isAccepted, isCursedHint, isCorrect }`
- Comments: `{ text, author, score }`
- Scene: `StackOverflowScene.js` extends `BaseScene` — scrollable thread view
- Accessible from Azure Terminal menu (new option) or in-world terminal objects
- Thread unlock tied to `GameState.skills.learned` — only discovered commands show full threads
- First-read XP bonus tracked in `GameState.story.flags` per thread

---

## Acceptance Criteria

- [ ] StackOverflow accessible from Azure Terminal or in-world terminal
- [ ] Each discovered command has a browsable Q&A thread
- [ ] Threads have question, multiple answers (with scores), and comments section
- [ ] Accepted answers are not always the best answer (realistic SO behaviour)
- [ ] Comments contain arguments, duplicate accusations, and buried hints
- [ ] Undiscovered commands show locked threads (title visible, answers hidden)
- [ ] Cursed command threads are extra chaotic — locked threads, deleted comments
- [ ] Domain matchup hints are embedded in answer arguments
- [ ] First-read XP bonus per thread
- [ ] `rm -rf /` thread only visible at Shame 5+
- [ ] All thread data in `src/data/stackoverflow.js` — no logic in data file
- [ ] Scene is read-only — no state mutations beyond marking threads as read

---

## Contradictions & Open Questions

> The following contradictions with existing issues were found during research. These need answers before implementation.

### 1. Service Catalog SKILLS tab overlap (#19)

The Service Catalog already shows every command with domain, tier, description, and use count. StackOverflow would provide richer but less reliable descriptions of the same commands.

**Question:** Does StackOverflow **replace** the Service Catalog SKILLS tab entirely, or do they coexist? If both exist, the Service Catalog is the "official docs" (clean, authoritative) and StackOverflow is the "community knowledge" (chaotic, sometimes wrong). Or is the SKILLS tab too redundant with StackOverflow and should be removed?

### 2. `read_the_docs` skill makes StackOverflow partially redundant in battle (#5)

The skill `read_the_docs` (observability, standard tier) already reveals opponent weaknesses mid-battle. If StackOverflow gives domain matchup hints pre-battle, `read_the_docs` becomes less valuable since the player already knows what to expect.

**Question:** Should StackOverflow intentionally give **wrong or incomplete** matchup info often enough that `read_the_docs` is still the reliable in-battle option? Or should StackOverflow only reveal matchup hints after the player has already discovered them through battle?

### 3. Domain matchup chart visibility (#41 open question)

Issue #41 asks: *"Should players see the matchup chart in-game (like a Pokédex type page), or discover it through play?"* StackOverflow proposes showing matchup info through unreliable community arguments — the player pieces it together but can never fully trust it.

**Question:** Does StackOverflow fully resolve this open question (matchups shown but unreliably), or should there also be an authoritative matchup chart unlocked later in the game?

### 4. `outdated_runbook` item uses the same "unreliable docs" joke (#5, #7)

The `outdated_runbook` item already has the flavour text "half the steps are wrong" and grants +5 XP on read. StackOverflow threads would also have wrong info and grant +5 XP on first read.

**Question:** Is the `outdated_runbook` now a printed StackOverflow thread? Or does it remain a separate item? If both exist, the "+5 XP for reading bad docs" reward is duplicated across two features.

### 5. NPC teaching value (#44)

Engineers teach commands after optimal/standard wins. StackOverflow could provide the same command knowledge for free (just walk to a terminal). This could undercut the reward loop of beating engineers.

**Question:** Should StackOverflow threads for a command only unlock **after** the player has learned the command (from a trainer or the world), keeping it as a review tool rather than a preview tool? Or should some threads be visible before learning — giving hints about commands that exist but not teaching them directly?
