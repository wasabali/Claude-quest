import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SaveManager } from '../src/state/SaveManager.js'
import { GameState } from '../src/state/GameState.js'
import { download, openFilePicker } from '#utils/fileIO.js'

vi.mock('#utils/fileIO.js', () => ({
  download: vi.fn(),
  openFilePicker: vi.fn(),
}))

const clone = value => JSON.parse(JSON.stringify(value))

describe('SaveManager', () => {
  let initialState

  beforeEach(() => {
    initialState = clone(GameState)
    vi.clearAllMocks()
    globalThis.confirm = vi.fn()
  })

  const restoreState = () => {
    for (const key of Object.keys(GameState)) delete GameState[key]
    Object.assign(GameState, clone(initialState))
  }

  it('stripSession returns a deep copy without mutating source', () => {
    const stripped = SaveManager.stripSession(GameState)
    stripped.player.name = 'Changed'

    expect(stripped).not.toHaveProperty('_session')
    expect(GameState.player.name).not.toBe('Changed')
  })

  it('export downloads a readable .cloudquest JSON file with checksum and no _session', async () => {
    const payload = await SaveManager.export(GameState, 'checkpoint')

    expect(download).toHaveBeenCalledTimes(1)
    const [filename, content] = download.mock.calls[0]
    const parsed = JSON.parse(content)

    expect(filename.endsWith('.cloudquest')).toBe(true)
    expect(parsed.commitMessage).toBe('checkpoint')
    expect(parsed.checksum.startsWith('sha256:')).toBe(true)
    expect(parsed).not.toHaveProperty('_session')
    expect(parsed.player.technicalDebt).toBeDefined()
    expect(payload.checksum).toBe(parsed.checksum)
  })

  it('import restores full state from file', async () => {
    const exported = await SaveManager.export(GameState, 'restore')
    restoreState()
    GameState.player.name = 'Different Name'

    const file = { text: async () => JSON.stringify(exported) }
    const loaded = await SaveManager.import(file)

    expect(loaded.player.name).toBe(initialState.player.name)
    expect(GameState.player.name).toBe(initialState.player.name)
    expect(GameState._session.isDirty).toBe(false)
  })

  it('import accepts legacy numeric save versions', async () => {
    const exported = await SaveManager.export(GameState, 'legacy')
    const { checksum: _checksum, version: _version, ...rest } = exported
    const legacyPayload = { version: 1, ...rest }
    legacyPayload.checksum = await SaveManager.computeChecksum(JSON.stringify(legacyPayload))

    const loaded = await SaveManager.import({ text: async () => JSON.stringify(legacyPayload) })
    expect(loaded).not.toBeNull()
  })

  it('import prompts on checksum mismatch and can load anyway', async () => {
    const exported = await SaveManager.export(GameState, 'tamper')
    const tampered = { ...exported, player: { ...exported.player, budget: 999 } }

    globalThis.confirm = vi.fn(() => true)
    const loaded = await SaveManager.import({ text: async () => JSON.stringify(tampered) })
    expect(globalThis.confirm).toHaveBeenCalled()
    expect(loaded.player.budget).toBe(999)
  })

  it('import returns null when mismatch is declined', async () => {
    const exported = await SaveManager.export(GameState, 'tamper')
    const tampered = { ...exported, player: { ...exported.player, budget: 1 } }

    globalThis.confirm = vi.fn(() => false)
    const loaded = await SaveManager.import({ text: async () => JSON.stringify(tampered) })
    expect(loaded).toBeNull()
  })

  it('import uses file picker when file is omitted', async () => {
    const exported = await SaveManager.export(GameState, 'picker')
    openFilePicker.mockResolvedValue({ text: async () => JSON.stringify(exported) })

    await SaveManager.import()
    expect(openFilePicker).toHaveBeenCalled()
  })
})
