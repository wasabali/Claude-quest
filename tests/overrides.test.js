import { describe, it, expect } from 'vitest'
import { Overrides } from '../src/overrides.js'

describe('Overrides', () => {
  it('defaults every override value to null', () => {
    Object.values(Overrides).forEach((value) => {
      expect(value).toBeNull()
    })
  })
})
