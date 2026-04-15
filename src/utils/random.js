// Mulberry32 seeded PRNG — deterministic and reproducible from a seed.
// Used for encounter rolls so the same seed always produces the same sequence.

// Returns a stateful random function seeded from `seed`.
// Call the returned function repeatedly to get values in [0, 1).
export function seedRandom(seed) {
  let s = seed >>> 0
  return function random() {
    s |= 0
    s  = s + 0x6D2B79F5 | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Returns an integer in [min, max) using a pre-created random function.
export function randInt(randomFn, min, max) {
  return Math.floor(randomFn() * (max - min)) + min
}

// Returns a random element from an array using a pre-created random function.
export function randChoice(randomFn, arr) {
  return arr[randInt(randomFn, 0, arr.length)]
}
