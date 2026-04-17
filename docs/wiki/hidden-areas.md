# Hidden Areas

Cloud Quest has secret locations scattered across the world. They're found by doing things NPCs tell you not to do, interacting with things that seem broken, and generally being the kind of engineer who pushes buttons labelled "DO NOT PUSH."

Finding all of them unlocks something special.

---

## The Outcast Network

Six hidden areas form the **Outcast Network** — a secret society of engineers who chose the dark path. Each area is home to a cursed trainer who teaches forbidden techniques.

<details>
<summary>⚠️ SPOILERS — Click to reveal hidden area locations and how to find them</summary>

### Hidden Area 1: The Server Graveyard

| Detail | Info |
|---|---|
| **How to find** | SSH into a terminal that looks "dead" or decommissioned |
| **Outcast trainer** | Deprecated Dagfinn |
| **Teaches** | `terraform destroy` |
| **Vibe** | Rows of powered-down servers. Blinking lights in the dark. The ghosts of infrastructure past. |

---

### Hidden Area 2: The node_modules Maze

| Detail | Info |
|---|---|
| **How to find** | Use the "Mystery node_modules" junk item instead of discarding it |
| **Outcast trainer** | Privileged Petra |
| **Teaches** | `docker run --privileged` |
| **Vibe** | An endless maze of nested dependencies. Every path leads to another dependency. |

**Hint:** Don't throw away junk items until you've tried using them.

---

### Hidden Area 3: The /dev/null Void

| Detail | Info |
|---|---|
| **How to find** | Pipe output to `/dev/null` three times in a single battle |
| **Outcast trainer** | The Null Pointer |
| **Teaches** | `history -c` |
| **Vibe** | Absolute emptiness. Sound disappears. Your actions have no visible effect. |

---

### Hidden Area 4: The 3am Tavern

| Detail | Info |
|---|---|
| **How to find** | Play the game when your **real clock** reads between 02:57 and 03:05 |
| **Outcast trainer** | Rotating — different cursed trainers appear based on your Shame level |
| **Teaches** | Multiple cursed and nuclear techniques |
| **Vibe** | Dim lighting. Terrible coffee. Engineers who've seen things. The on-call support group. |

**Note:** This is a real-clock mechanic. The game checks your actual system time. Yes, you have to actually be playing at 3am. (Or change your system clock. We won't judge.)

---

### Hidden Area 5: Deprecated Azure Region (West-EU-2)

| Detail | Info |
|---|---|
| **How to find** | Select the greyed-out `West-EU-2` region from an Azure Terminal |
| **Outcast trainer** | West-EU-2 Wilhelm |
| **Teaches** | `az feature register --namespace Microsoft.Legacy` |
| **Vibe** | A forgotten data centre that shouldn't exist anymore. Cobwebs on the racks. Still running 2018 workloads. |

---

### Hidden Area 6: DO_NOT_TOUCH.exe

| Detail | Info |
|---|---|
| **How to find** | Open the file in the OldCorp Basement despite every NPC warning you not to |
| **Outcast trainer** | *(none — contains notes and lore only)* |
| **Teaches** | `EXEC xp_cmdshell` — 999 damage. The game asks three times if you're sure. |
| **Vibe** | OldCorp basement. Legacy VB6 systems. Flickering fluorescent lights. The smell of 2003. |

**How it works:**
- You'll encounter a door in the OldCorp Basement labelled `DO_NOT_TOUCH.exe`
- **Every NPC in Act 3 will warn you** — Dagny the DBA, Hotfix Håkon, the OldCorp CTO
- If you open it anyway, you'll fight **The VB6 Billing Horror** (immune to Cloud/IaC/K8s/Containers — Linux and Security only)
- Win the battle: learn `EXEC xp_cmdshell` (+1 Shame)
- Alternatively, **migrate it properly** instead of opening it — a 3-choice quiz, correct answer earns the `legacy_migration_badge` from Dagny. No Shame, different reward.

*"The invoices will be wrong for months." — if you lose the battle*

**Note:** After defeating The VB6 Billing Horror, the OldCorp CTO's final line is: *"Can you also fix my home Wi-Fi?"* This is not a quest.

</details>

---

## The Seventh Location

<details>
<summary>⚠️ MAJOR SPOILER — Only read this if you've found all six hidden areas</summary>

Finding all six Outcast Network locations unlocks a seventh hidden area: **THROTTLEMASTER's Old Workstation**.

This is where Karsten Ottesen worked before he went rogue. It contains:
- His full backstory
- Notes explaining why he was passed over for promotion at OmniCloud Corp
- Evidence that connects to the main storyline (Kristoffer's role)
- The explanation for everything THROTTLEMASTER did across Acts 2–4

**Critical decision:** If you show THROTTLEMASTER's notes to **Professor Pedersen** before Act 4, it changes the ending. This is one way to unlock a modified ending.

The workstation also reveals: THROTTLEMASTER's real name is **Karsten Ottesen**. He was the best engineer at OmniCloud. They promoted Kristoffer instead.

</details>

---

## General Discovery Hints

If you're looking for hidden areas but don't want full spoilers:

1. **Interact with broken things.** If something looks dead, disconnected, or decommissioned — try using it anyway.
2. **Don't discard junk items.** Some of them are keys to hidden areas.
3. **Do what NPCs tell you NOT to do.** This is a game that rewards disobedience.
4. **Check your real-world clock.** One hidden area is time-gated.
5. **Look for greyed-out options.** Disabled menu items might not actually be disabled.
6. **Repeat unusual actions.** Doing the same unexpected thing multiple times in one battle can trigger secrets.

---

## Shame Requirements

Some hidden areas and cursed trainers require minimum Shame to access:

| Shame Level | What Unlocks |
|---|---|
| 0 | Nothing hidden. You're pure. |
| 2+ | Some cursed trainers become accessible |
| 3–4 | Most Outcast Network areas discoverable |
| 5+ | Certain StackOverflow threads become visible |
| 7 | THROTTLEMASTER contacts you |
| 15 | Alternate ending available |

---

*"Six hidden areas. Each one found by doing something you shouldn't. Find all six, and you'll find something worth finding." — A graffiti message on a wall in Pipeline Pass*
