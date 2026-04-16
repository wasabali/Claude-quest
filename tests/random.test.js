import { describe, it, expect } from 'vitest'
import { seedRandom, randInt, randChoice } from '../src/utils/random.js'

describe('seedRandom', () => {
  it('returns a function', () => {
    expect(typeof seedRandom(42)).toBe('function')
  })

  it('produces deterministic values — same seed always returns same sequence', () => {
    const rand1 = seedRandom(42)
    const rand2 = seedRandom(42)
    const seq1 = [rand1(), rand1(), rand1(), rand1(), rand1()]
    const seq2 = [rand2(), rand2(), rand2(), rand2(), rand2()]
    expect(seq1).toEqual(seq2)
  })

  it('produces different values for different seeds', () => {
    const rand1 = seedRandom(1)
    const rand2 = seedRandom(2)
    expect(rand1()).not.toBe(rand2())
  })

  it('returns floats in [0, 1) range', () => {
    const rand = seedRandom(999)
    for (let i = 0; i < 100; i++) {
      const val = rand()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('produces reasonably uniform distribution — mean near 0.5 over many samples', () => {
    const rand = seedRandom(12345)
    let sum = 0
    const N = 10000
    for (let i = 0; i < N; i++) sum += rand()
    const mean = sum / N
    // Mean of uniform [0,1) is 0.5 — allow 2% tolerance
    expect(mean).toBeGreaterThan(0.48)
    expect(mean).toBeLessThan(0.52)
  })

  it('seed 0 is valid and deterministic', () => {
    const rand1 = seedRandom(0)
    const rand2 = seedRandom(0)
    expect(rand1()).toBe(rand2())
  })
})

describe('randInt', () => {
  it('returns integers in [min, max)', () => {
    const rand = seedRandom(7)
    for (let i = 0; i < 200; i++) {
      const val = randInt(rand, 0, 10)
      expect(Number.isInteger(val)).toBe(true)
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(10)
    }
  })

  it('is deterministic — same sequence for same initial seed', () => {
    const rand1 = seedRandom(55)
    const rand2 = seedRandom(55)
    const vals1 = Array.from({ length: 5 }, () => randInt(rand1, 0, 100))
    const vals2 = Array.from({ length: 5 }, () => randInt(rand2, 0, 100))
    expect(vals1).toEqual(vals2)
  })

  it('handles single-item range (min === max-1)', () => {
    const rand = seedRandom(1)
    expect(randInt(rand, 5, 6)).toBe(5)
  })
})

describe('randChoice', () => {
  it('returns an element that exists in the array', () => {
    const arr = ['a', 'b', 'c', 'd']
    const rand = seedRandom(88)
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(randChoice(rand, arr))
    }
  })

  it('is deterministic — same seed picks same element', () => {
    const arr = ['linux', 'cloud', 'security', 'kubernetes']
    const rand1 = seedRandom(100)
    const rand2 = seedRandom(100)
    expect(randChoice(rand1, arr)).toBe(randChoice(rand2, arr))
  })

  it('returns the only element when array has length 1', () => {
    const rand = seedRandom(1)
    expect(randChoice(rand, ['only'])).toBe('only')
  })

  it('covers all elements over enough samples', () => {
    const arr = ['a', 'b', 'c']
    const rand = seedRandom(321)
    const seen = new Set()
    for (let i = 0; i < 300; i++) seen.add(randChoice(rand, arr))
    expect(seen).toEqual(new Set(['a', 'b', 'c']))
  })
})
