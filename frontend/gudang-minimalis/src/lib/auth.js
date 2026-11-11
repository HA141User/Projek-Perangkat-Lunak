export const AUTH_CHANGED_EVENT = 'gm-auth-changed'

export function getAuth() {
  const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  let user = null
  try {
    const raw = localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    if (raw) user = JSON.parse(raw)
  } catch {
    clearAuth()
    return { token: null, user: null }
  }
  return { token, user }
}

export function setAuth(userObj, token, rememberMe = true) {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_user')
  const storage = rememberMe ? localStorage : sessionStorage
  storage.setItem('auth_token', token)
  storage.setItem('auth_user', JSON.stringify(userObj))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
}

export function clearAuth() {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('auth_user')
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
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
 * Memanggil API backend dengan otorisasi Bearer dan penanganan sesi kedaluwarsa (401).
 */
export async function apiFetch(path, options = {}) {
  const { token } = getAuth()
  const method = (options.method || 'GET').toUpperCase()
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  const res = await fetch(`${API}${path}`, {
    ...options,
    method,
    headers: {
      ...(!isFormData && options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (
    res.status === 401 &&
    typeof window !== 'undefined' &&
    window.location.pathname !== '/login'
  ) {
    clearAuth()
    window.location.replace('/login')
  }

  return res
}
