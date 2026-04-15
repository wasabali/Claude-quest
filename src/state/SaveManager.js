import { sha256 } from '#utils/crypto.js'
import { download, openFilePicker } from '#utils/fileIO.js'
import { GameState } from './GameState.js'

const SAVE_EXTENSION = '.cloudquest'
const SAVE_VERSION   = 1

// UTF-8 safe base64 — handles non-ASCII characters (player names, dialog text, etc.)
function encode(str) {
  const bytes = new TextEncoder().encode(str)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function decode(b64) {
  const binary = atob(b64)
  const bytes  = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

// Export the current game state to a .cloudquest file.
// The file is UTF-8-safe base64-encoded JSON with a SHA-256 checksum.
export async function exportSave(filename = `save${SAVE_EXTENSION}`) {
  const saveData = _buildSaveData()
  const json     = JSON.stringify(saveData)
  const checksum = await sha256(json)
  const payload  = JSON.stringify({ v: SAVE_VERSION, checksum, data: saveData })
  download(filename, encode(payload))
  GameState._session.isDirty     = false
  GameState._session.lastSavedAt = new Date().toISOString()
}

// Open a file picker, read a .cloudquest file, validate version + checksum, return save data.
// Throws on unsupported version, malformed payload, or checksum mismatch.
export async function importSave() {
  const file = await openFilePicker(SAVE_EXTENSION)
  if (!file) return null

  const payload = JSON.parse(decode(await file.text()))

  if (typeof payload.v !== 'number')   throw new Error('Malformed save file: missing version.')
  if (payload.v > SAVE_VERSION)        throw new Error(`Save version ${payload.v} is not supported. Please update the game.`)
  if (!payload.checksum || !payload.data) throw new Error('Malformed save file: missing checksum or data.')

  const json     = JSON.stringify(payload.data)
  const checksum = await sha256(json)
  if (checksum !== payload.checksum) {
    throw new Error('Save file is corrupted or has been tampered with.')
  }
  return payload.data
}

// Build the save payload — everything except _session, which is never persisted.
function _buildSaveData() {
  const { _session, ...persisted } = GameState
  return persisted
}
