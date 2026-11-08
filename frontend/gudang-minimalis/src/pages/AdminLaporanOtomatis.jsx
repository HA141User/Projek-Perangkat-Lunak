import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { CalendarClock, Plus, Play, Edit2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'

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

const TIPE_OPTIONS = [
  'Mutasi Barang Masuk & Keluar',
  'Daftar Barang Stok < Ambang Batas',
  'Rekonsiliasi Opname & Audit Trail',
]

const FREKUENSI_OPTIONS = ['Harian', 'Mingguan (Senin)', 'Bulanan (Tgl 1)']
const FORMAT_OPTIONS = ['PDF & XLSX', 'PDF', 'XLSX']

const EMPTY_FORM = {
  nama: '',
  tipe: TIPE_OPTIONS[0],
  frekuensi: FREKUENSI_OPTIONS[0],
  jam: '08:00',
  format: FORMAT_OPTIONS[0],
  penerima: '',
}

const NAMA_MIN = 3
const NAMA_MAX = 80
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/

const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase()

/** Ekstrak HH:mm dari format "17:30 WIB" atau "17:30" */
function extractTime(jamStr) {
  const m = /(\d{2}:\d{2})/.exec(String(jamStr ?? ''))
  return m ? m[1] : '08:00'
}

function mapApiSchedule(s, idx = 0) {
  const rawJam = s.jam ?? s.waktu ?? s.time ?? '08:00'
  const jam = String(rawJam).includes('WIB') ? rawJam : `${extractTime(rawJam)} WIB`
  const penerima = Array.isArray(s.penerima) ? s.penerima.join(', ') : (s.penerima ?? s.emails ?? s.recipients ?? '')
  const isAktif = typeof s.aktif === 'boolean' ? s.aktif : (s.is_active !== false && s.status !== 'Dijeda' && s.status !== 'PAUSED')
  return {
    id: s.id_jadwal ?? s.id ?? idx + 1,
    nama: s.nama ?? s.nama_jadwal ?? s.name ?? `Jadwal Laporan #${idx + 1}`,
    tipe: s.tipe ?? s.jenis_laporan ?? TIPE_OPTIONS[0],
    frekuensi: s.frekuensi ?? s.periode ?? 'Harian',
    jam,
    format: s.format ?? 'PDF & XLSX',
    penerima,
    status: isAktif ? 'Aktif' : 'Dijeda',
    terakhirJalan: s.terakhirJalan ?? s.last_run ?? 'Terjadwal di sistem',
  }
}

function parseEmails(raw) {
  return String(raw ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

function validateSchedule(form, schedules, editingId) {
  const errors = {}
  const others = schedules.filter((s) => s.id !== editingId)
  const nama = form.nama.trim().replace(/\s+/g, ' ')

  if (!nama) errors.nama = 'Nama jadwal wajib diisi.'
  else if (nama.length < NAMA_MIN) errors.nama = `Nama jadwal minimal ${NAMA_MIN} karakter.`
  else if (nama.length > NAMA_MAX) errors.nama = `Nama jadwal maksimal ${NAMA_MAX} karakter.`
  else if (others.some((s) => norm(s.nama) === norm(nama))) {
    errors.nama = 'Nama jadwal sudah terdaftar. Gunakan nama lain.'
  }

  if (!TIPE_OPTIONS.includes(form.tipe)) errors.tipe = 'Pilih tipe laporan yang valid.'
  if (!FREKUENSI_OPTIONS.includes(form.frekuensi)) errors.frekuensi = 'Pilih frekuensi yang valid.'
  if (!FORMAT_OPTIONS.includes(form.format)) errors.format = 'Pilih format dokumen yang valid.'

  if (!form.jam) errors.jam = 'Jam trigger wajib diisi.'
  else if (!TIME_REGEX.test(form.jam)) errors.jam = 'Format jam harus HH:MM (00:00–23:59).'

  const emails = parseEmails(form.penerima)
  if (emails.length === 0) {
    errors.penerima = 'Minimal 1 email penerima wajib diisi.'
  } else {
    const invalid = emails.find((e) => !EMAIL_REGEX.test(e))
    if (invalid) {
      errors.penerima = `Format email tidak valid: "${invalid}".`
    } else if (new Set(emails).size !== emails.length) {
      errors.penerima = 'Terdapat alamat email yang duplikat di daftar penerima.'
    }
  }

  return errors
}

const errCls = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export default function AdminLaporanOtomatis() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  // Ambil daftar jadwal murni dari GET /api/schedules/
  useEffect(() => {
    let active = true
    async function loadSchedules() {
      setLoading(true)
      try {
        const res = await apiFetch('/api/schedules/')
        if (!res.ok) return
        const list = unwrapList(await res.json().catch(() => null))
        if (active && Array.isArray(list)) {
          setSchedules(list.map(mapApiSchedule))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadSchedules()
    return () => { active = false }
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  const errors = useMemo(
    () => validateSchedule(formData, schedules, editingItem?.id),
    [formData, schedules, editingItem]
  )
  const isValid = Object.keys(errors).length === 0
  const showErr = (key) => (submitted || touched[key]) && errors[key]

  function handleOpenCreate() {
    setEditingItem(null)
    setFormData(EMPTY_FORM)
    setTouched({})
    setSubmitted(false)
    setIsModalOpen(true)
  }

  function handleOpenEdit(item) {
    setEditingItem(item)
    setFormData({
      nama: item.nama,
      tipe: item.tipe,
      frekuensi: item.frekuensi,
      jam: extractTime(item.jam),
      format: item.format,
      penerima: item.penerima,
    })
    setTouched({})
    setSubmitted(false)
    setIsModalOpen(true)
  }

  function updateField(key, value) {
    setFormData((f) => ({ ...f, [key]: value }))
    setTouched((t) => ({ ...t, [key]: true }))
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    const res = await apiFetch(`/api/schedules/${target.id}`, { method: 'DELETE' })
    if (res.ok) {
      setSchedules((prev) => prev.filter((s) => s.id !== target.id))
      showToast(`Jadwal "${target.nama}" berhasil dihapus.`)
    }
    setDeleteTarget(null)
  }

  async function handleToggleStatus(item) {
    const nextStatus = item.status === 'Aktif' ? 'Dijeda' : 'Aktif'
    const res = await apiFetch(`/api/schedules/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: nextStatus, aktif: nextStatus === 'Aktif', is_active: nextStatus === 'Aktif' }),
    })
    if (res.ok) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, status: nextStatus } : s))
      )
    }
  }

  async function handleTriggerNow(item) {
    const res = await apiFetch('/api/cronjob')
    if (res.ok) {
      const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')
      setSchedules((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, terakhirJalan: `Baru saja, ${now} WIB (Sukses)` } : s))
      )
      showToast(`Trigger manual berhasil dikirim! Menjalankan: "${item.nama}"...`)
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    setSubmitted(true)
    if (!isValid) return

    const emailList = parseEmails(formData.penerima)
    const clean = {
      nama: formData.nama.trim().replace(/\s+/g, ' '),
      tipe: formData.tipe,
      frekuensi: formData.frekuensi,
      jam: `${formData.jam} WIB`,
      format: formData.format,
      penerima: emailList.join(', '),
    }

    const apiBody = {
      ...clean,
      nama_jadwal: clean.nama,
      jenis_laporan: clean.tipe,
      waktu: formData.jam,
      emails: emailList,
    }

    setSaving(true)
    try {
      if (editingItem) {
        const res = await apiFetch(`/api/schedules/${editingItem.id}`, {
          method: 'PATCH',
          body: JSON.stringify(apiBody),
        })
        if (res.ok) {
          setSchedules((prev) => prev.map((s) => (s.id === editingItem.id ? { ...s, ...clean } : s)))
          showToast(`Jadwal "${clean.nama}" berhasil diperbarui.`)
          setIsModalOpen(false)
        }
      } else {
        const res = await apiFetch('/api/schedules/', {
          method: 'POST',
          body: JSON.stringify(apiBody),
        })
        if (res.ok) {
          const created = await res.json().catch(() => null)
          const newId = created?.data?.id_jadwal ?? created?.data?.id ?? created?.id ?? Date.now()
          setSchedules((prev) => [
            { id: newId, ...clean, status: 'Aktif', terakhirJalan: 'Belum pernah dijalankan' },
            ...prev,
          ])
          showToast(`Jadwal baru "${clean.nama}" berhasil dibuat.`)
          setIsModalOpen(false)
        }
      }
    } finally {
      setSaving(false)
    }
  }

  const recipientCount = parseEmails(formData.penerima).length

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Laporan Otomatis"
      actions={
        <Btn variant="primary" size="lg" icon={Plus} onClick={handleOpenCreate}>
          Buat Jadwal
        </Btn>
      }
    >
      {toast && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {loading && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[13.5px] text-[#6B7280]">
            Memuat daftar jadwal laporan dari server...
          </div>
        )}
        {!loading && schedules.length === 0 && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[13.5px] text-[#6B7280]">
            Belum ada jadwal laporan otomatis dari API.
          </div>
        )}
        {!loading && schedules.map((s) => (
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
                <Btn size="sm" variant="secondary" onClick={() => handleToggleStatus(s)}>
                  {s.status === 'Aktif' ? 'Jeda' : 'Aktifkan'}
                </Btn>
                <Btn size="sm" variant="ghost" icon={Edit2} onClick={() => handleOpenEdit(s)} />
                <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setDeleteTarget(s)} />
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

      {/* Modal Buat / Edit Jadwal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Jadwal Otomatis' : 'Buat Jadwal Laporan Otomatis'}
        subtitle="Atur pengiriman rekap inventaris berkala ke email penerima"
        icon={CalendarClock}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Btn>
            <Btn variant="primary" loading={saving} onClick={handleSubmit} disabled={submitted && !isValid}>
              {editingItem ? 'Simpan Perubahan' : 'Jadwalkan'}
            </Btn>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {submitted && !isValid && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              Masih ada {Object.keys(errors).length} isian yang belum sesuai. Periksa kolom bertanda merah.
            </div>
          )}

          <Field
            label="Nama Jadwal Laporan"
            required
            error={showErr('nama')}
            hint={`${formData.nama.trim().length}/${NAMA_MAX} karakter · harus unik`}
          >
            <Input
              maxLength={NAMA_MAX}
              placeholder="Contoh: Rekap Harian Barang Keluar"
              value={formData.nama}
              aria-invalid={!!showErr('nama')}
              className={showErr('nama') ? errCls : ''}
              onChange={(e) => updateField('nama', e.target.value)}
            />
          </Field>

          <Field label="Tipe Konten Laporan" required error={showErr('tipe')}>
            <Select value={formData.tipe} onChange={(e) => updateField('tipe', e.target.value)}>
              <option value="Mutasi Barang Masuk & Keluar">Mutasi Barang Masuk &amp; Keluar</option>
              <option value="Daftar Barang Stok < Ambang Batas">Daftar Barang Stok Kritis</option>
              <option value="Rekonsiliasi Opname & Audit Trail">Rekonsiliasi Opname &amp; Audit Trail</option>
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Frekuensi" required error={showErr('frekuensi')}>
              <Select value={formData.frekuensi} onChange={(e) => updateField('frekuensi', e.target.value)}>
                {FREKUENSI_OPTIONS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </Select>
            </Field>
            <Field label="Jam Trigger (WIB)" required error={showErr('jam')}>
              <Input
                type="time"
                value={formData.jam}
                aria-invalid={!!showErr('jam')}
                className={showErr('jam') ? errCls : ''}
                onChange={(e) => updateField('jam', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Format Dokumen" required error={showErr('format')}>
            <Select value={formData.format} onChange={(e) => updateField('format', e.target.value)}>
              <option value="PDF & XLSX">PDF &amp; XLSX</option>
              <option value="PDF">Hanya PDF</option>
              <option value="XLSX">Hanya XLSX</option>
            </Select>
          </Field>

          <Field
            label="Daftar Email Penerima"
            required
            error={showErr('penerima')}
            hint={`Pisahkan beberapa email dengan tanda koma (,) · ${recipientCount} penerima terdeteksi`}
          >
            <Input
              placeholder="operasional@perusahaan.com, direksi@perusahaan.com"
              value={formData.penerima}
              aria-invalid={!!showErr('penerima')}
              className={showErr('penerima') ? errCls : ''}
              onChange={(e) => updateField('penerima', e.target.value)}
            />
          </Field>

          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Jadwal Otomatis?"
        subtitle={deleteTarget?.nama ?? ''}
        icon={AlertTriangle}
        maxWidth="max-w-md"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Btn>
            <Btn variant="danger" icon={Trash2} onClick={confirmDelete}>Ya, Hapus</Btn>
          </>
        }
      >
        <p className="text-[13.5px] leading-relaxed text-[#374151]">
          Jadwal pengiriman laporan otomatis <strong>{deleteTarget?.nama}</strong> akan dihentikan dan dihapus permanen.
        </p>
      </Modal>
    </AppShell>
  )
}
