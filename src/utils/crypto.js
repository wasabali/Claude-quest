// SHA-256 hash via the Web Crypto API (available in browsers and Node 18+).
// Used by SaveManager to generate and verify save file checksums.
export async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
