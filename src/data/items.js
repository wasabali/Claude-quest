// Item definitions — tools, keyItems, credentials, docs, junk.
const ITEMS = {}

export const getById = (id)           => ITEMS[id]
export const getAll  = ()             => Object.values(ITEMS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
