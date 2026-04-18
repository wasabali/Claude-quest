import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

describe('localhost_town map tileset metadata', () => {
  it('declares stub_tiles as an image-based tileset', () => {
    const mapPath = path.join(process.cwd(), 'assets', 'maps', 'localhost_town.tmj')
    const map = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
    const tileset = map.tilesets.find(set => set.name === 'stub_tiles')
    const tileEntries = tileset?.tiles ?? []

    expect(tileset).toBeDefined()
    expect(tileset.columns).toBe(5)
    expect(tileset.image).toBe('stub_tiles.png')
    expect(tileset.imagewidth).toBe(240)
    expect(tileset.imageheight).toBe(48)
    expect(Array.isArray(tileEntries)).toBe(true)
    expect(tileEntries.every(tile => tile.image === undefined)).toBe(true)
  })
})
