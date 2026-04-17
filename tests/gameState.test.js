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

  it('includes player tileX and tileY for logical tile position', () => {
    expect(GameState.player).toHaveProperty('tileX')
    expect(GameState.player).toHaveProperty('tileY')
    expect(typeof GameState.player.tileX).toBe('number')
    expect(typeof GameState.player.tileY).toBe('number')
  })
})
