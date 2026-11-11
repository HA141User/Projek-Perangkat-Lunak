/**
 * Format tanggal ISO server menjadi tampilan lokal Indonesia yang ringkas.
 */
export function formatDateTime(isoString, withYear = true) {
  if (!isoString || isoString === '-') return '-'
  try {
    const d = new Date(isoString)
    if (Number.isNaN(d.getTime())) return String(isoString)
    return (
      d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        ...(withYear ? { year: 'numeric' } : {}),
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    )
  } catch {
    return String(isoString)
  }
}

/**
 * Ekstrak pesan error yang informatif dari respons JSON TypeBox/API backend.
 */
export function extractApiError(payload, fallback = 'Terjadi kesalahan pada server.') {
  if (!payload || typeof payload !== 'object') return fallback
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const detail = payload.errors[0]?.summary || payload.errors[0]?.message
    if (detail) {
      return payload.message ? `${payload.message}: ${detail}` : detail
    }
  }
  return payload.message || payload.error || fallback
}

