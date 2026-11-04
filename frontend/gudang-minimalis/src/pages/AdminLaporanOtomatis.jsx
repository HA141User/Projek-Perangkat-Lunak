import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarClock, Plus, Play, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { getAuth, clearAuth } from '../lib/auth'

const MENU_ADMIN = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log Aktivitas', to: '/admin/log' },
]

const INITIAL_SCHEDULES = [
  {
    id: 1,
    nama: 'Rekap Mutasi Harian Staf',
    tipe: 'Mutasi Barang Masuk & Keluar',
    frekuensi: 'Harian',
    jam: '17:30 WIB',
    format: 'PDF & XLSX',
    penerima: 'operasional@gudangwh01.com, kepala@gudangwh01.com',
    status: 'Aktif',
    terakhirJalan: 'Kemarin 17:30 WIB (Sukses)',
  },
  {
    id: 2,
    nama: 'Laporan Mingguan Stok Kritis',
    tipe: 'Daftar Barang Stok < Ambang Batas',
    frekuensi: 'Mingguan (Senin)',
    jam: '08:00 WIB',
    format: 'PDF',
    penerima: 'purchasing@perusahaan.com, kepala@gudangwh01.com',
    status: 'Aktif',
    terakhirJalan: '26 Okt 2026, 08:00 WIB (Sukses)',
  },
  {
    id: 3,
    nama: 'Audit Bulanan & Log Aktivitas',
    tipe: 'Rekonsiliasi Opname & Audit Trail',
    frekuensi: 'Bulanan (Tgl 1)',
    jam: '00:00 WIB',
    format: 'XLSX',
    penerima: 'direksi@perusahaan.com, audit@internal.com',
    status: 'Dijeda',
    terakhirJalan: '01 Okt 2026, 00:00 WIB (Sukses)',
  },
]

const EMPTY_FORM = {
  nama: '',
  tipe: 'Mutasi Barang Masuk & Keluar',
  frekuensi: 'Harian',
  jam: '08:00 WIB',
  format: 'PDF & XLSX',
  penerima: 'kepala@gudangwh01.com',
}

export default function AdminLaporanOtomatis() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [schedules, setSchedules] = useState(INITIAL_SCHEDULES)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [toast, setToast] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  function handleOpenCreate() {
    setEditingItem(null)
    setFormData(EMPTY_FORM)
    setIsModalOpen(true)
  }

  function handleOpenEdit(item) {
    setEditingItem(item)
    setFormData({ ...item })
    setIsModalOpen(true)
  }

  function handleDelete(id) {
    if (confirm('Hapus jadwal otomatis ini?')) {
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    }
  }

  function handleToggleStatus(id) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Dijeda' : 'Aktif' } : s))
    )
  }

  function handleTriggerNow(item) {
    showToast(`Trigger manual berhasil dikirim! Menjalankan: "${item.nama}"...`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (editingItem) {
      setSchedules((prev) => prev.map((s) => (s.id === editingItem.id ? { ...s, ...formData } : s)))
    } else {
      setSchedules((prev) => [
        { id: Date.now(), ...formData, status: 'Aktif', terakhirJalan: 'Belum pernah dijalankan' },
        ...prev,
      ])
    }
    setIsModalOpen(false)
  }

  function set(key) {
    return (e) => setFormData((f) => ({ ...f, [key]: e.target.value }))
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Laporan Otomatis"
      actions={
        <Btn variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Buat Jadwal
        </Btn>
      }
    >
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13.5px] text-green-800">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {schedules.map((s) => (
          <div
            key={s.id}
            className="rounded-xl border border-[#E5E7EB] bg-white p-5"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#EFF6FF] text-[#0037B0]">
                  <CalendarClock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-semibold text-[#111827]">{s.nama}</span>
                    <Badge variant={s.status === 'Aktif' ? 'success' : 'warning'}>{s.status}</Badge>
                  </div>
                  <p className="mt-0.5 text-[13px] text-[#6B7280]">{s.tipe}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Btn size="sm" variant="secondary" icon={Play} onClick={() => handleTriggerNow(s)}>
                  Jalankan
                </Btn>
                <Btn size="sm" variant="secondary" onClick={() => handleToggleStatus(s.id)}>
                  {s.status === 'Aktif' ? 'Jeda' : 'Aktifkan'}
                </Btn>
                <Btn size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenEdit(s)} />
                <Btn size="sm" variant="danger" icon={Trash2} onClick={() => handleDelete(s.id)} />
              </div>
            </div>

            {/* Detail grid */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[#E5E7EB] pt-4 md:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Frekuensi</p>
                <p className="mt-1 text-[13.5px] font-medium text-[#111827]">{s.frekuensi}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Jam Trigger</p>
                <p className="mt-1 text-[13.5px] font-medium text-[#0037B0]">{s.jam}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Format</p>
                <p className="mt-1 text-[13.5px] font-medium text-[#111827]">{s.format}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Terakhir Jalan</p>
                <p className="mt-1 text-[13px] text-[#6B7280]">{s.terakhirJalan}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">Penerima Email</p>
              <p className="mt-1 text-[13px] text-[#374151] break-all">{s.penerima}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Jadwal Otomatis' : 'Buat Jadwal Laporan Otomatis'}
        footer={
          <div className="flex justify-end gap-2">
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Btn>
            <Btn variant="primary" onClick={handleSubmit}>
              {editingItem ? 'Simpan Perubahan' : 'Jadwalkan'}
            </Btn>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nama Jadwal Laporan">
            <Input
              required
              placeholder="Contoh: Rekap Harian Barang Keluar"
              value={formData.nama}
              onChange={set('nama')}
            />
          </Field>

          <Field label="Tipe Konten Laporan">
            <Select value={formData.tipe} onChange={set('tipe')}>
              <option value="Mutasi Barang Masuk & Keluar">Mutasi Barang Masuk &amp; Keluar</option>
              <option value="Daftar Barang Stok < Ambang Batas">Daftar Barang Stok Kritis</option>
              <option value="Rekonsiliasi Opname & Audit Trail">Rekonsiliasi Opname &amp; Audit Trail</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Frekuensi">
              <Select value={formData.frekuensi} onChange={set('frekuensi')}>
                <option value="Harian">Harian</option>
                <option value="Mingguan (Senin)">Mingguan (Senin)</option>
                <option value="Bulanan (Tgl 1)">Bulanan (Tgl 1)</option>
              </Select>
            </Field>
            <Field label="Jam Trigger">
              <Input placeholder="08:00 WIB" value={formData.jam} onChange={set('jam')} required />
            </Field>
          </div>

          <Field label="Format Dokumen">
            <Select value={formData.format} onChange={set('format')}>
              <option value="PDF & XLSX">PDF &amp; XLSX</option>
              <option value="PDF">Hanya PDF</option>
              <option value="XLSX">Hanya XLSX</option>
            </Select>
          </Field>

          <Field label="Daftar Email Penerima (pisahkan koma)">
            <Input
              required
              placeholder="operasional@perusahaan.com, direksi@perusahaan.com"
              value={formData.penerima}
              onChange={set('penerima')}
            />
          </Field>
        </form>
      </Modal>
    </AppShell>
  )
}
