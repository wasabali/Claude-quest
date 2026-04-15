// Quest definitions — stages, rewards, story flags.
const QUESTS = {}

export const getById = (id)           => QUESTS[id]
export const getAll  = ()             => Object.values(QUESTS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
