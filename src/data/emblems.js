// Emblem metadata — certification badges earned by completing regions.
const EMBLEMS = {}

export const getById = (id)           => EMBLEMS[id]
export const getAll  = ()             => Object.values(EMBLEMS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
