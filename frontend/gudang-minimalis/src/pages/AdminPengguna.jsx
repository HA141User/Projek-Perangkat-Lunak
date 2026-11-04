import { useState } from 'react'
import { useNavigate } from 'react-router'
import { UserPlus, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
import { apiFetch, getAuth, clearAuth } from '../lib/auth'
import { Store } from '../lib/store'

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

function initials(name) {
  return name ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() : 'U'
}

const EMPTY_FORM = { nama: '', email: '', password: '', peran: 'Staf Gudang' }

export default function AdminPengguna() {
  const navigate = useNavigate()
  const { user } = getAuth()

  const [users, setUsers] = useState(() => Store.getUsers())
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function openModal() {
    setForm(EMPTY_FORM)
    setError('')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setError('')
  }

  function toggleAktif(id) {
    const updated = Store.toggleUser(id)
    setUsers(updated)
  }

  async function handleSimpan(e) {
    e.preventDefault()
    if (!form.nama || !form.email || !form.password) {
      setError('Nama lengkap, email resmi, dan kata sandi wajib diisi.')
      return
    }
    setSaving(true)
    setError('')

    try {
      await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify({ nama: form.nama, email: form.email, password: form.password, peran: form.peran }),
      })

      const updated = Store.addUser({
        nama: form.nama,
        email: form.email,
        peran: form.peran,
        aktif: true,
        login: 'Baru saja didaftarkan',
      })
      setUsers(updated)
      setToast(`Pengguna ${form.nama} berhasil didaftarkan!`)
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
              {users.map((u) => (
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
                      onClick={() => toggleAktif(u.id)}
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
        <form onSubmit={handleSimpan}>
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4">
            <Field label="Nama Lengkap" required>
              <Input
                type="text"
                required
                placeholder="Contoh: Siti Aminah"
                value={form.nama}
                onChange={(e) => setForm({ ...form, nama: e.target.value })}
              />
            </Field>

            <Field label="Email Resmi" required>
              <Input
                type="email"
                required
                placeholder="siti.aminah@wh01.id"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="Kata Sandi Awal" required>
              <Input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>

            <Field label="Peran & Hak Akses">
              <Select
                value={form.peran}
                onChange={(e) => setForm({ ...form, peran: e.target.value })}
              >
                <option value="Staf Gudang">Staf Gudang (Pencatatan Masuk/Keluar, Opname)</option>
                <option value="Kepala Gudang">Kepala Gudang (Persetujuan Opname, Monitoring, Laporan)</option>
                <option value="Admin">Admin (Master Control, Pengguna, Zonasi Rak)</option>
              </Select>
            </Field>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
