/**
 * Utilitas ekspor CSV.
 * - Meng-escape tanda kutip, koma, dan baris baru sesuai RFC 4180.
 * - Menambahkan BOM UTF-8 agar karakter (mis. "·", "&") terbaca benar di Excel.
 */

function escapeCell(value) {
  const str = value === null || value === undefined ? '' : String(value)
  return `"${str.replace(/"/g, '""')}"`
}

/**
 * @param {string[]} headers  Judul kolom
 * @param {Array<Array<unknown>>} rows  Isi baris (urutan sama dengan headers)
 */
export function toCSV(headers, rows) {
  return [headers, ...rows].map((r) => r.map(escapeCell).join(',')).join('\r\n')
}

/**
 * Membuat dan mengunduh file CSV di browser.
 */
export function downloadCSV(filename, headers, rows) {
  const blob = new Blob(['\uFEFF' + toCSV(headers, rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

/** Stempel waktu untuk nama file, mis. 20261105-0409 */
export function fileStamp(date = new Date()) {
  const p = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`
}

