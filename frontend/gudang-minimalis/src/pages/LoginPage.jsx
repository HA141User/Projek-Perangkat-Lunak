
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Archive,
  UserRound,
  LockKeyhole,
  Eye,
  ArrowRightToLine,
  ShieldCheck,
} from 'lucide-react'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? '' : 'https://inventaris-gudang.onrender.com')

const ROLE_ROUTES = {
  ADMIN: '/admin',
  KEPALA_GUDANG: '/kepala-gudang',
  STAF_GUDANG: '/staff',
}

function getToken(data) {
  return (
    data.token ||
    data.access_token ||
    data.accessToken ||
    data.data?.token ||
    data.data?.access_token ||
    data.data?.accessToken
  )
}

function getUser(data) {
  return data.user || data.data?.user || data.profile || data.data
}

function getErrorMessage(data, fallback) {
  if (typeof data?.message === 'string') return data.message
  if (Array.isArray(data?.message)) return data.message.join(', ')
  if (typeof data?.error === 'string') return data.error
  return fallback
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('username') || '').trim()
    const password = String(formData.get('password') || '')
    const remember = formData.get('remember') === 'on'

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          getErrorMessage(responseData, 'Email atau kata sandi tidak valid.'),
        )
      }

      const token = getToken(responseData)
      if (!token) {
        throw new Error('Respons login tidak berisi token autentikasi.')
      }

      let user = getUser(responseData)
      if (!user?.role) {
        const profileResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const profileData = await profileResponse.json().catch(() => ({}))

        if (!profileResponse.ok) {
          throw new Error(
            getErrorMessage(
              profileData,
              'Profil pengguna tidak dapat diambil setelah login.',
            ),
          )
        }

        user = getUser(profileData)
      }

      const route = ROLE_ROUTES[user?.role]
      if (!route) {
        throw new Error('Role pengguna tidak dikenali oleh aplikasi.')
      }

      const storage = remember ? localStorage : sessionStorage
      storage.setItem('auth_token', token)
      storage.setItem('auth_user', JSON.stringify(user))
      navigate(route, { replace: true })
    } catch (error) {
      setErrorMessage(
        error instanceof TypeError
          ? 'Request API diblokir atau server tidak dapat dijangkau. Periksa CORS dan koneksi API.'
          : error.message,
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#F8F9FF] px-4 py-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(29,78,216,0.06),transparent_55%),radial-gradient(ellipse_at_50%_90%,rgba(137,245,231,0.2),transparent_45%)]" />

      {/* Header */}
      <header className="absolute left-6 right-6 top-5 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="mt-1 rounded bg-brand p-2 text-white">
            <Archive size={18} />
          </div>

          <div>
            <strong className="block text-xs font-semibold">
              Gudang Minimalis
            </strong>

            <span className="mt-1 block text-[8px] leading-tight tracking-[1px]">
              SISTEM
              <br />
              MANAJEMEN
              <br />
              INVENTARIS
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-[#E4E7F6] bg-field px-3 py-1.5 font-mono text-[9px]">
          <span className="mr-1 text-green">●</span>
          SYS-NODE // JKT-01
        </div>
      </header>

      {/* Login Card */}
      <section className="relative z-10 w-full max-w-[368px] overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
        <div className="px-8 pb-6 pt-8">
          {/* Logo */}
          <div className="mx-auto mb-3 grid size-10 place-items-center rounded bg-field text-brand">
            <Archive size={23} />
          </div>

          <h1 className="text-center text-lg font-semibold tracking-tight">
            Gudang Minimalis
          </h1>

          <p className="mb-7 mt-1 text-center text-[10px] text-muted">
            Masuk ke Sistem Manajemen Inventaris Gudang
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <label
              htmlFor="username"
              className="mb-1 flex justify-between text-[10px] font-medium"
            >
              Email

              <span className="font-mono text-[8px] text-muted">
                ID RESMI
              </span>
            </label>

            <div className="mb-4 flex h-8 items-center gap-2 rounded-sm bg-field px-3 focus-within:ring-1 focus-within:ring-brand">
              <UserRound size={14} className="shrink-0" />

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                inputMode="email"
                placeholder="Masukkan email..."
                className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
                required
              />
            </div>

            {/* Password */}
            <label
              htmlFor="password"
              className="mb-1 flex justify-between text-[10px] font-medium"
            >
              Kata Sandi

              <span className="font-mono text-[8px] text-muted">
                TERENKRIPSI
              </span>
            </label>

            <div className="mb-5 flex h-8 items-center gap-2 rounded-sm bg-field px-3 focus-within:ring-1 focus-within:ring-brand">
              <LockKeyhole size={14} className="shrink-0" />

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-slate-400"
                required
              />

              <button
                type="button"
                aria-label="Tampilkan atau sembunyikan kata sandi"
                className="shrink-0 text-ink"
                onClick={(event) => {
                  const input = document.getElementById('password')
                  const visible = input.type === 'password'

                  input.type = visible ? 'text' : 'password'
                  event.currentTarget.setAttribute(
                    'aria-pressed',
                    String(visible),
                  )
                }}
              >
                <Eye size={15} />
              </button>
            </div>

            {/* Remember Me */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2 text-[9px] text-muted-dark">
                <input
                  type="checkbox"
                  name="remember"
                  className="size-3 accent-brand"
                />

                Ingat saya di perangkat ini
              </label>

              <a
                href="#bantuan"
                className="text-[9px] text-brand hover:underline"
              >
                Bantuan Cepat
              </a>
            </div>

            {errorMessage && (
              <p
                role="alert"
                className="mb-4 rounded-sm bg-red-50 px-3 py-2 text-[9px] text-red-700"
              >
                {errorMessage}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-9 w-full items-center justify-center gap-2 rounded bg-brand-hover text-[10px] font-medium text-white transition hover:bg-brand"
            >
              {isLoading ? 'Memeriksa akun...' : 'Masuk ke Dashboard'}
              <ArrowRightToLine size={14} />
            </button>
          </form>
        </div>

        {/* Footer Card */}
        <div className="bg-[#F8F9FF] px-4 py-4 text-center">
          <p className="text-[9px] text-muted-dark">
            Lupa kata sandi?{' '}
            <a
              href="#administrator"
              className="text-brand hover:underline"
            >
              Hubungi Administrator
            </a>
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-[8px] text-muted">
            <ShieldCheck size={12} className="text-green" />
            Keamanan Terenkripsi SSL 256-Bit
            <span>• NODE-01 AKTIF</span>
          </div>
        </div>
      </section>

      {/* Footer Page */}
      <footer className="absolute bottom-4 left-6 right-6 flex flex-wrap justify-between gap-3 text-[8px]">
        <span className="text-muted">
          VER 2.4.0-PROD · Hak Cipta © 2025 Gudang Minimalis
        </span>

        <Link to="/login" className="text-ink">
          Dukungan IT
        </Link>
      </footer>
    </main>
  )
}
