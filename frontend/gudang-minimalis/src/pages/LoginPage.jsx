import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Archive,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  User,
  Lock,
} from 'lucide-react'

const ROLE_ROUTES = {
  ADMIN: '/admin',
  KEPALA_GUDANG: '/kepala-gudang',
  STAF_GUDANG: '/staff',
}

const MOCK_USERS = {
  'admin@gudangwh01.com': { name: 'Ahmad Fauzi', role: 'ADMIN' },
  'ahmad.fauzi@wh01.id': { name: 'Ahmad Fauzi', role: 'ADMIN' },
  'kepala@gudangwh01.com': { name: 'Budi Santoso', role: 'KEPALA_GUDANG' },
  'budi.santoso@wh01.id': { name: 'Budi Santoso', role: 'KEPALA_GUDANG' },
  'staf@gudangwh01.com': { name: 'Siti Rahayu', role: 'STAF_GUDANG' },
  'siti.rahayu@wh01.id': { name: 'Siti Rahayu', role: 'STAF_GUDANG' },
}

const PRESETS = [
  { key: 'ADMIN', label: 'Administrator', email: 'admin@gudangwh01.com', pass: 'admin123' },
  { key: 'KEPALA_GUDANG', label: 'Kepala Gudang', email: 'kepala@gudangwh01.com', pass: 'kepala123' },
  { key: 'STAF_GUDANG', label: 'Staf Gudang', email: 'staf@gudangwh01.com', pass: 'staf123' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('admin@gudangwh01.com')
  const [password, setPassword] = useState('admin123')
  const [selectedRole, setSelectedRole] = useState('ADMIN')
  const [rememberMe, setRememberMe] = useState(true)

  useEffect(() => {
    const token =
      localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    const userStr =
      localStorage.getItem('auth_user') || sessionStorage.getItem('auth_user')
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user?.role && ROLE_ROUTES[user.role]) {
          navigate(ROLE_ROUTES[user.role], { replace: true })
        }
      } catch { /* ignore */ }
    }
  }, [navigate])

  function fillPreset(p) {
    setEmail(p.email)
    setPassword(p.pass)
    setSelectedRole(p.key)
  }

  function handleLoginSuccess(userObj, token = 'jwt-session-token-wh01') {
    const storage = rememberMe ? localStorage : sessionStorage
    storage.setItem('auth_token', token)
    storage.setItem('auth_user', JSON.stringify(userObj))
    navigate(ROLE_ROUTES[userObj.role] || '/staff', { replace: true })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    const normalizedEmail = email.trim().toLowerCase()
    const matchedMock = MOCK_USERS[normalizedEmail]
    setTimeout(() => {
      setLoading(false)
      handleLoginSuccess({
        name: matchedMock?.name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        role: selectedRole !== 'AUTO' ? selectedRole : (matchedMock?.role || 'STAF_GUDANG'),
      })
    }, 400)
  }

  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      {/* Left panel */}
      <div className="hidden w-[420px] shrink-0 flex-col justify-between bg-[#0037B0] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-white/15 text-white">
            <Archive size={18} />
          </div>
          <span className="text-[15px] font-semibold text-white">Gudang Minimalis</span>
        </div>

        <div>
          <h1 className="text-[32px] font-semibold leading-tight text-white">
            Sistem Manajemen<br />Inventaris Gudang
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-blue-200">
            Platform terintegrasi untuk pengelolaan stok, audit opname, 
            dan pelaporan inventaris gudang secara real-time.
          </p>
        </div>

        <p className="text-[12px] text-blue-300">
          © 2025 Gudang Minimalis · Ver 2.4.0
        </p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-9 place-items-center rounded-lg bg-[#0037B0] text-white">
              <Archive size={18} />
            </div>
            <span className="text-[15px] font-semibold text-[#111827]">Gudang Minimalis</span>
          </div>

          <h2 className="text-[24px] font-semibold text-[#111827]">Masuk ke Akun</h2>
          <p className="mt-1.5 text-[14px] text-[#6B7280]">
            Pilih preset atau masukkan email dan kata sandi.
          </p>

          {/* Preset chips */}
          <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="mb-3 text-[13px] font-medium text-[#6B7280]">Akun demo cepat:</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => fillPreset(p)}
                  className={`rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-colors ${
                    selectedRole === p.key
                      ? 'border-[#0037B0] bg-[#EFF6FF] text-[#0037B0]'
                      : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#0037B0] hover:text-[#0037B0]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-[13.5px] font-medium text-[#111827]">
                Email / Username
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/15">
                <User size={15} className="shrink-0 text-[#9CA3AF]" />
                <input
                  id="login-email"
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="nama@gudangwh01.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-[13.5px] font-medium text-[#111827]">
                Kata Sandi
              </label>
              <div className="flex h-10 items-center gap-2.5 rounded-lg border border-[#E5E7EB] bg-white px-3.5 transition-colors focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/15">
                <Lock size={15} className="shrink-0 text-[#9CA3AF]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[14px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="shrink-0 text-[#9CA3AF] hover:text-[#6B7280]"
                  aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Role select */}
            <div>
              <label htmlFor="login-role" className="mb-1.5 block text-[13.5px] font-medium text-[#111827]">
                Masuk sebagai
              </label>
              <select
                id="login-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3.5 text-[14px] text-[#111827] transition-colors focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/15"
              >
                <option value="AUTO">Otomatis (deteksi dari akun)</option>
                <option value="ADMIN">Administrator Sistem</option>
                <option value="KEPALA_GUDANG">Kepala Gudang</option>
                <option value="STAF_GUDANG">Staf Gudang</option>
              </select>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2.5 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded accent-[#0037B0]"
                />
                <span className="text-[13.5px] text-[#374151]">Ingat saya</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Hubungi Administrator IT: admin@gudangwh01.com')}
                className="text-[13.5px] font-medium text-[#0037B0] hover:underline"
              >
                Lupa kata sandi?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0037B0] text-[14px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memverifikasi…
                </>
              ) : (
                <>
                  Masuk ke Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-[#6B7280]">
            Sistem Logistik Sentral WH-01 · Seluruh hak cipta dilindungi
          </p>
        </div>
      </div>
    </div>
  )
}
