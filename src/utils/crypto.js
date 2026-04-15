// SHA-256 hash via the Web Crypto API (available in browsers and Node 18+).
// Used by SaveManager to generate and verify save file checksums.
export async function sha256(str) {
  const subtle = globalThis.window?.crypto?.subtle ?? globalThis.crypto?.subtle
  if (!subtle) {
    throw new Error('Web Crypto API is not available in this environment.')
  }
  const buf = await subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
