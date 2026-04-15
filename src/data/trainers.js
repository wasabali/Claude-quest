// Trainer definitions — good trainers and cursed trainers.
// See .claude/skills/add-trainer for the full field spec.
const TRAINERS = {}

export const getById = (id)           => TRAINERS[id]
export const getAll  = ()             => Object.values(TRAINERS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
