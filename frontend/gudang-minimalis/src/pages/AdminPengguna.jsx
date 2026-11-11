import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
import { apiFetch, getAuth, clearAuth, unwrapList } from '../lib/auth'
import { extractApiError, formatDateTime } from '../lib/format'

const MENU_ADMIN = [
  { to: '/admin', label: 'Beranda' },
  { to: '/admin/pengguna', label: 'Manajemen Pengguna' },
  { to: '/admin/barang', label: 'Data Barang' },
  { to: '/admin/rak', label: 'Data Rak' },
  { to: '/admin/persetujuan', label: 'Persetujuan Opname' },
  { to: '/admin/laporan', label: 'Laporan Inventaris' },
  { to: '/admin/laporan-otomatis', label: 'Laporan Otomatis' },
  { to: '/admin/log', label: 'Log Aktivitas' },
]

const PERAN_META = {
  Admin: { class: 'bg-red-50 text-red-700 border border-red-200', label: 'Admin' },
  'Kepala Gudang': { class: 'bg-blue-50 text-blue-700 border border-blue-200', label: 'Kepala Gudang' },
  'Staf Gudang': { class: 'bg-slate-100 text-slate-700 border border-slate-200', label: 'Staf Gudang' },
}

const ROLE_TO_API = {
  Admin: 'ADMIN',
  'Kepala Gudang': 'KEPALA_GUDANG',
  'Staf Gudang': 'STAF_GUDANG',
}

function roleFromApi(raw) {
  const r = String(raw || '').toUpperCase()
  if (r.includes('ADMIN')) return 'Admin'
  if (r.includes('KEPALA')) return 'Kepala Gudang'
  return 'Staf Gudang'
}

function mapApiUser(u, idx = 0) {
  const rawAktif = u.status_aktif ?? u.aktif ?? u.is_active
  const aktif = typeof rawAktif === 'boolean' ? rawAktif : u.status !== 'NONAKTIF'
  return {
    id: u.id_user ?? u.id ?? idx + 1,
    nama: u.nama_lengkap ?? u.nama ?? u.name ?? 'Pengguna',
    email: u.email ?? '',
    peran: PERAN_META[u.peran] ? u.peran : roleFromApi(u.role ?? u.peran),
    aktif,
    login: u.last_login ? formatDateTime(u.last_login) : u.created_at ? formatDateTime(u.created_at) : 'Terdaftar di sistem',
  }
}

function initials(name) {
  return name ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() : 'U'
}

const EMPTY_FORM = { nama: '', email: '', password: '', peran: 'Staf Gudang' }

// Format email: teks@domain.tld (tld minimal 2 huruf)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
const MIN_PASSWORD = 6

function validateForm(form, users) {
  const errors = {}
  const nama = form.nama.trim()
  const email = form.email.trim().toLowerCase()

  if (!nama) errors.nama = 'Nama lengkap wajib diisi.'
  else if (nama.length < 3) errors.nama = 'Nama lengkap minimal 3 karakter.'

  if (!email) errors.email = 'Email resmi wajib diisi.'
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Format email tidak valid. Contoh: nama@domain.id'
  else if (users.some((u) => (u.email || '').toLowerCase() === email)) errors.email = 'Email sudah terdaftar.'

  if (!form.password) errors.password = 'Kata sandi wajib diisi.'
  else if (form.password.length < MIN_PASSWORD) errors.password = `Kata sandi minimal ${MIN_PASSWORD} karakter.`

  return errors
}

const errorInputClass = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export default function AdminPengguna() {
  const navigate = useNavigate()
  const { user } = getAuth()

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState('')
  const [pageError, setPageError] = useState('')

  // Ambil daftar pengguna murni dari GET /api/users/
  useEffect(() => {
    let active = true
    async function loadUsers() {
      setLoading(true)
      try {
        const res = await apiFetch('/api/users/')
        if (!res.ok) return
        const payload = await res.json().catch(() => null)
        const list = unwrapList(payload)
        if (active && Array.isArray(list)) {
          setUsers(list.map(mapApiUser))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadUsers()
    return () => { active = false }
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((fe) => ({ ...fe, [key]: undefined }))
  }

  function openModal() {
    setForm(EMPTY_FORM)
    setError('')
    setFieldErrors({})
    setShowPassword(false)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setError('')
    setFieldErrors({})
  }

  async function toggleAktif(targetUser) {
    const nextAktif = !targetUser.aktif
    setUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, aktif: nextAktif } : u))
    )

    try {
      const res = await apiFetch(`/api/users/${targetUser.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status_aktif: nextAktif }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extractApiError(err, `Gagal mengubah status pengguna (${res.status})`))
      }
      setToast(`Status ${targetUser.nama} berhasil diubah menjadi ${nextAktif ? 'AKTIF' : 'NONAKTIF'}.`)
      setTimeout(() => setToast(''), 4000)
    } catch (err) {
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, aktif: targetUser.aktif } : u))
      )
      setPageError(err.message || 'Gagal memperbarui status pengguna di server.')
    }
  }

  async function handleSimpan(e) {
    e?.preventDefault?.()

    const errors = validateForm(form, users)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setError('Periksa kembali data yang belum sesuai.')
      return
    }

    const payload = {
      nama_lengkap: form.nama.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      role: ROLE_TO_API[form.peran] || 'STAF_GUDANG',
    }

    setSaving(true)
    setError('')
    setFieldErrors({})

    try {
      const res = await apiFetch('/api/users/', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const created = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(extractApiError(created, 'Gagal menyimpan data pengguna.'))
      }

      const createdObj = created?.id_user ? created : (created?.data || created?.user || null)
      if (!createdObj) {
        throw new Error('Server tidak mengembalikan data pengguna yang terdaftar.')
      }

      const newUser = mapApiUser(createdObj)
      setUsers((prev) => [newUser, ...prev.filter((u) => u.email !== newUser.email)])
      setToast(`Pengguna ${payload.nama_lengkap} berhasil didaftarkan!`)
      setTimeout(() => setToast(''), 4000)
      closeModal()
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data pengguna.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name ?? 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Manajemen Pengguna"
      actions={
        <Btn variant="primary" size="lg" icon={UserPlus} onClick={openModal}>
          Tambah Pengguna
        </Btn>
      }
    >
      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {pageError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          {pageError}
        </div>
      )}

      <Card>
        <CardHeader
          title={`${users.length} pengguna terdaftar`}
          description="Atur otorisasi akses sistem, penetapan peran (Role-Based Access), dan status aktifasi pengguna."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Pengguna</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Email</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Peran</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Terakhir Login</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Memuat data pengguna dari server...
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Belum ada data pengguna dari API.
                  </td>
                </tr>
              )}
              {!loading && users.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#EFF6FF] text-[12px] font-semibold text-[#0037B0]">
                        {initials(u.nama)}
                      </span>
                      <span className="text-[13.5px] font-semibold text-[#111827]">{u.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-[#6B7280]">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[12px] font-semibold ${
                        PERAN_META[u.peran]?.class ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.peran}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={u.aktif ? 'success' : 'neutral'} dot>
                      {u.aktif ? 'AKTIF' : 'NONAKTIF'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-[13px] text-[#6B7280]">{u.login}</td>
                  <td className="px-4 py-3 text-center">
                    <Btn
                      variant={u.aktif ? 'danger' : 'secondary'}
                      size="sm"
                      onClick={() => toggleAktif(u)}
                    >
                      {u.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                    </Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah User */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title="Tambah Pengguna Baru"
        subtitle="Daftarkan akun dan tentukan peran sistem"
        icon={UserPlus}
        footer={
          <>
            <Btn variant="secondary" onClick={closeModal}>Batal</Btn>
            <Btn variant="primary" loading={saving} onClick={handleSimpan}>
              {saving ? 'Mendaftarkan...' : 'Simpan Akun'}
            </Btn>
          </>
        }
      >
        <form onSubmit={handleSimpan} noValidate>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4">
            <Field label="Nama Lengkap" required error={fieldErrors.nama}>
              <Input
                type="text"
                placeholder="Contoh: Siti Aminah"
                value={form.nama}
                aria-invalid={!!fieldErrors.nama}
                className={fieldErrors.nama ? errorInputClass : ''}
                onChange={(e) => updateField('nama', e.target.value)}
              />
            </Field>

            <Field label="Email Resmi" required error={fieldErrors.email}>
              <Input
                type="email"
                autoComplete="off"
                placeholder="siti.aminah@wh01.id"
                value={form.email}
                aria-invalid={!!fieldErrors.email}
                className={fieldErrors.email ? errorInputClass : ''}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </Field>

            <Field
              label="Kata Sandi Awal"
              required
              hint={`Minimal ${MIN_PASSWORD} karakter (${form.password.length}/${MIN_PASSWORD})`}
              error={fieldErrors.password}
            >
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={`Minimal ${MIN_PASSWORD} karakter`}
                  value={form.password}
                  aria-invalid={!!fieldErrors.password}
                  className={`pr-10 ${fieldErrors.password ? errorInputClass : ''}`}
                  onChange={(e) => updateField('password', e.target.value)}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 grid w-9 place-items-center text-[#9CA3AF] hover:text-[#4B5563]"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Peran & Hak Akses">
              <Select
                value={form.peran}
                onChange={(e) => updateField('peran', e.target.value)}
              >
                <option value="Staf Gudang">Staf Gudang (Pencatatan Masuk/Keluar, Opname)</option>
                <option value="Kepala Gudang">Kepala Gudang (Persetujuan Opname, Monitoring, Laporan)</option>
                <option value="Admin">Admin (Master Control, Pengguna, Zonasi Rak)</option>
              </Select>
            </Field>
          </div>
          {/* Submit tersembunyi agar tombol Enter tetap memicu validasi */}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>
    </AppShell>
  )
}
