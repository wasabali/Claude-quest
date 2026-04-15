import { describe, it, expect } from 'vitest'
import { GameState } from '../src/state/GameState.js'

describe('GameState shape', () => {
  it('includes player technicalDebt', () => {
    expect(GameState.player).toHaveProperty('technicalDebt')
    expect(typeof GameState.player.technicalDebt).toBe('number')
  })

  it('does not include skills.tiers', () => {
    expect(GameState.skills).not.toHaveProperty('tiers')
  })
})
