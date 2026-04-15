// Trigger a file download in the browser.
export function download(filename, content) {
  const blob = new Blob([content], { type: 'application/octet-stream' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

// Open a native file picker and return the selected File, or null if cancelled.
export function openFilePicker(accept = '*') {
  return new Promise(resolve => {
    const input    = document.createElement('input')
    input.type     = 'file'
    input.accept   = accept
    input.onchange = e => resolve(e.target.files[0] ?? null)
    input.click()
  })
}
