export function getAuth() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  const user = JSON.parse(localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user') || 'null')
  return { token, user }
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_user')
}

export const API =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://inventaris-gudang.onrender.com')

/**
 * Mengambil array data dari berbagai format respons JSON backend:
 * mis. { data: [...] } | { items: [...] } | [...]
 */
export function unwrapList(
  payload,
  keys = ['data', 'items', 'users', 'locations', 'categories', 'schedules', 'logs', 'notifications', 'opnames', 'transactions']
) {
  if (Array.isArray(payload)) return payload
  if (payload && typeof payload === 'object') {
    for (const k of keys) {
      if (Array.isArray(payload[k])) return payload[k]
    }
    if (payload.data && typeof payload.data === 'object') {
      for (const k of keys) {
        if (Array.isArray(payload.data[k])) return payload.data[k]
      }
    }
  }
  return []
}

/**
 * Memanggil API backend secara langsung (tanpa data dummy / emulasi lokal).
 */
export async function apiFetch(path, options = {}) {
  const { token } = getAuth()
  const method = (options.method || 'GET').toUpperCase()

  return fetch(`${API}${path}`, {
    ...options,
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}
