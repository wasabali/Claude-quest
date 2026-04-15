// Pool-based encounter tables per region.
// EncounterEngine rolls: common 70% · rare 25% · cursed 5% (when non-empty).
// Add encounter IDs to pools as incident content is created.
const ENCOUNTERS = {
  localhost_town: {
    common: [],
    rare:   [],
    cursed: [],
  },
  pipeline_pass: {
    common: [],
    rare:   [],
    cursed: [],
  },
  container_port: {
    common: [],
    rare:   [],
    cursed: [],
  },
  cloud_citadel: {
    common: [],
    rare:   [],
    cursed: [],
  },
  kernel_caves: {
    common: [],
    rare:   [],
    cursed: [],
  },
  serverless_steppes: {
    common: [],
    rare:   [],
    cursed: [],
  },
  three_am_tavern: {
    common: [],
    rare:   [],
    cursed: [],
  },
}

export const getById = (id)           => ENCOUNTERS[id]
export const getAll  = ()             => Object.values(ENCOUNTERS)
export const getBy   = (field, value) => getAll().filter(x => x[field] === value)
