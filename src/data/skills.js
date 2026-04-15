// Skill definitions — added by the game-data-author agent or via /add-skill.
// See CLAUDE.md and .claude/skills/game-data-registry for the full field spec.
const SKILLS = {}

export const getById = (id)           => SKILLS[id]
export const getAll  = ()             => Object.values(SKILLS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
