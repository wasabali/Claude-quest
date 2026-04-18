// StoryEngine — pure NPC dialog resolution helpers.
// No Phaser imports. No side effects. All state mutation is the caller's responsibility.

// ---------------------------------------------------------------------------
// resolveNpcDialog
// Walks the 5-level dialog priority chain and returns the pages array to show
// plus an optional story flag key that the caller must set on story.flags.
//
// Priority:
//   1. techniqueUsedFlag  — cursed trainer first-use reaction (once, flag-gated)
//   2. followUpDialog     — post-quest completion
//   3. shameDialog        — shame threshold reaction (per-threshold fallback: entry → trainer)
//   4. dialogByAct        — act-based dialog
//   5. variants / pages   — reputation/shame variants then default pages
//
// Returns { pages: string[], setFlag: string|null }
// ---------------------------------------------------------------------------
export function resolveNpcDialog(entry, trainer, { player, story, stats } = {}) {
  // 1. Cursed trainer technique acknowledgment — fires once per trainer.
  if (trainer?.techniqueUsedFlag && !story.flags[trainer.techniqueUsedFlag]) {
    const techniqueId = trainer.teachSkillId ?? trainer.cursedSkill
    if (techniqueId && (stats.skillUseCounts?.[techniqueId] ?? 0) > 0) {
      if (Array.isArray(trainer.techniqueUsedDialog)) {
        return { pages: trainer.techniqueUsedDialog, setFlag: trainer.techniqueUsedFlag }
      }
    }
  }

  // 2. Follow-up dialog for completed side-quest NPCs.
  if (Array.isArray(entry?.followUpDialog) && entry.questId) {
    if (story.completedQuests.includes(entry.questId)) {
      return { pages: entry.followUpDialog, setFlag: null }
    }
  }

  // 3. Shame dialog — check thresholds in descending order, falling back
  //    per-threshold from entry to trainer so trainer-specific lines are
  //    always reachable even when the entry has a partial shameDialog.
  const shame = player.shamePoints
  const entryShameDialog   = entry?.shameDialog
  const trainerShameDialog = trainer?.shameDialog
  if (entryShameDialog || trainerShameDialog) {
    for (const threshold of [10, 7, 3]) {
      const thresholdPages = Array.isArray(entryShameDialog?.[threshold])
        ? entryShameDialog[threshold]
        : trainerShameDialog?.[threshold]
      if (shame >= threshold && Array.isArray(thresholdPages)) {
        return { pages: thresholdPages, setFlag: null }
      }
    }
  }

  // 4. Act-based dialog.
  const actKey   = story.flags.game_complete ? 'finale' : story.act
  const actDialog = entry?.dialogByAct?.[actKey]
  if (Array.isArray(actDialog)) return { pages: actDialog, setFlag: null }

  // 5. Variants (reputation/shame conditions) → default pages.
  return { pages: resolveNpcPages(entry, player), setFlag: null }
}

// ---------------------------------------------------------------------------
// resolveNpcPages
// Evaluates NPC dialogue variants top-to-bottom against the player's current
// reputation and shamePoints. Returns the first matching variant's pages, or
// falls back to entry.pages when no variant matches.
// ---------------------------------------------------------------------------
export function resolveNpcPages(entry, player) {
  const { reputation, shamePoints } = player
  if (Array.isArray(entry?.variants)) {
    for (const variant of entry.variants) {
      const c = variant.condition ?? {}
      if (c.reputationMin !== undefined && reputation < c.reputationMin) continue
      if (c.reputationMax !== undefined && reputation > c.reputationMax) continue
      if (c.shameMin      !== undefined && shamePoints < c.shameMin)     continue
      if (c.shameMax      !== undefined && shamePoints > c.shameMax)     continue
      if (Array.isArray(variant.pool)) {
        // NPC one-liner pools are intentionally non-deterministic — different
        // line each visit. No seeded RNG needed; this is presentation-layer only.
        if (variant.pool.length > 0) {
          const idx = Math.floor(Math.random() * variant.pool.length)
          return variant.pool[idx]
        }
        return variant.pages ?? entry?.pages ?? ['???']
      }
      return variant.pages
    }
  }
  return entry?.pages ?? ['???']
}
