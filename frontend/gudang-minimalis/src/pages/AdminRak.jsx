import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, QrCode, Trash2, Grid2X2, Printer, CheckCircle2, RefreshCw, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import QrLabelModal from '../components/QrLabelModal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
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

// ─── Master zona: huruf zona = huruf pada kode rak ─────────────────────────
const ZONA = [
  { huruf: 'A', value: 'Zona A - Elektronik', label: 'Zona A - Elektronik & High-Value' },
  { huruf: 'B', value: 'Zona B - Packaging & Logistik', label: 'Zona B - Packaging & Dus Logistik' },
  { huruf: 'C', value: 'Zona C - ATK & Stiker Thermal', label: 'Zona C - ATK & Stiker Thermal' },
  { huruf: 'D', value: 'Zona D - Peralatan K3 & Safety', label: 'Zona D - Peralatan K3 & Safety' },
]

// ─── Aturan validasi ───────────────────────────────────────────────────────
const KODE_REGEX = /^RAK ([A-Z])-(\d{2})$/ // contoh: RAK B-03
const KAPASITAS_MIN = 1
const KAPASITAS_MAX = 10_000
const CATATAN_MAX = 150
const BLOCKED_KEYS = ['e', 'E', '+', '-', '.', ',']

/** Rapikan input kode: huruf besar, spasi tunggal, "RAKA-01" → "RAK A-01" */
function normalizeKode(raw) {
  let s = String(raw ?? '').toUpperCase().replace(/\s+/g, ' ').trimStart()
  s = s.replace(/^RAK(?=[A-Z])/, 'RAK ')
  return s
}

const zonaByValue = (value) => ZONA.find((z) => z.value === value)

function mapApiLocation(loc, idx = 0) {
  const rawKode = loc.nama_rak ?? loc.kode_lokasi ?? loc.kode ?? loc.nama_lokasi ?? loc.name ?? `RAK A-0${idx + 1}`
  const kode = normalizeKode(String(rawKode).toUpperCase().startsWith('RAK') ? rawKode : `RAK ${rawKode}`)
  const huruf = KODE_REGEX.exec(kode)?.[1] ?? 'A'
  const matchedZona = ZONA.find((z) => z.huruf === huruf)?.value ?? ZONA[0].value
  return {
    id: loc.id_lokasi ?? loc.id ?? idx + 1,
    kode,
    zona: loc.zona ?? loc.deskripsi ?? matchedZona,
    kapasitas: Number(loc.kapasitas ?? loc.capacity ?? 50),
    terisi: Number(loc.terisi ?? loc.occupied ?? 0),
    keterangan: loc.keterangan ?? loc.catatan ?? '',
  }
}

/** Status dihitung dari tingkat keterisian, bukan diketik manual */
function hitungStatus(terisi, kapasitas) {
  const pct = kapasitas > 0 ? (terisi / kapasitas) * 100 : 0
  if (pct >= 100) return 'Penuh'
  if (pct >= 90) return 'Hampir Penuh'
  return 'Tersedia'
}

/** Kode berikutnya yang belum terpakai di zona tersebut: RAK {huruf}-{NN} */
function generateKode(zonaValue, raks) {
  const huruf = zonaByValue(zonaValue)?.huruf ?? 'A'
  const used = new Set(raks.map((r) => r.kode.toUpperCase()))
  for (let n = 1; n <= 99; n++) {
    const kode = `RAK ${huruf}-${String(n).padStart(2, '0')}`
    if (!used.has(kode)) return kode
  }
  return `RAK ${huruf}-`
}

function validateRak(form, raks) {
  const errors = {}
  const kode = form.kode.trim()
  const zona = zonaByValue(form.zona)

  if (!zona) errors.zona = 'Pilih zona gudang yang valid.'

  if (!kode) errors.kode = 'Kode rak wajib diisi.'
  else {
    const m = KODE_REGEX.exec(kode)
    if (!m) errors.kode = 'Format harus "RAK X-NN", contoh: RAK B-03.'
    else if (m[2] === '00') errors.kode = 'Nomor rak dimulai dari 01.'
    else if (zona && m[1] !== zona.huruf)
      errors.kode = `Huruf rak harus "${zona.huruf}" karena berada di ${zona.value.split(' - ')[0]}.`
    else if (raks.some((r) => r.kode.toUpperCase() === kode))
      errors.kode = `Kode ${kode} sudah terdaftar. Gunakan nomor lain.`
  }

  const kap = form.kapasitas
  if (kap === '' || kap === null) errors.kapasitas = 'Kapasitas wajib diisi.'
  else {
    const n = Number(kap)
    if (!Number.isFinite(n)) errors.kapasitas = 'Kapasitas harus berupa angka.'
    else if (!Number.isInteger(n)) errors.kapasitas = 'Kapasitas harus bilangan bulat.'
    else if (n < KAPASITAS_MIN) errors.kapasitas = `Kapasitas minimal ${KAPASITAS_MIN} box.`
    else if (n > KAPASITAS_MAX) errors.kapasitas = `Kapasitas maksimal ${KAPASITAS_MAX.toLocaleString('id-ID')} box.`
  }

  if (form.keterangan.trim().length > CATATAN_MAX) errors.keterangan = `Catatan maksimal ${CATATAN_MAX} karakter.`

  return errors
}

function statusVariant(status) {
  if (status === 'Tersedia') return 'success'
  if (status === 'Hampir Penuh') return 'warning'
  return 'danger'
}

function barColor(pct) {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-[#0037B0]'
}

const errCls = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export default function AdminRak() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [raks, setRaks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [qrModalRak, setQrModalRak] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState({ kode: '', zona: ZONA[0].value, kapasitas: '50', keterangan: '' })
  const [kodeAuto, setKodeAuto] = useState(true)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  // Ambil daftar lokasi rak murni dari GET /api/locations/
  useEffect(() => {
    let active = true
    async function loadLocations() {
      setLoading(true)
      try {
        const res = await apiFetch('/api/locations/')
        if (!res.ok) return
        const list = unwrapList(await res.json().catch(() => null))
        if (active && Array.isArray(list)) {
          setRaks(list.map(mapApiLocation))
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadLocations()
    return () => { active = false }
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const filteredRaks = raks.filter(
    (r) =>
      r.kode.toLowerCase().includes(search.toLowerCase()) ||
      r.zona.toLowerCase().includes(search.toLowerCase())
  )

  const errors = useMemo(() => validateRak(formData, raks), [formData, raks])
  const isValid = Object.keys(errors).length === 0
  const showErr = (key) => (submitted || touched[key]) && errors[key]

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  function handleOpenCreate() {
    const zona = ZONA[0].value
    setFormData({ kode: generateKode(zona, raks), zona, kapasitas: '50', keterangan: '' })
    setKodeAuto(true)
    setTouched({})
    setSubmitted(false)
    setIsModalOpen(true)
  }

  function updateField(key, value) {
    setFormData((f) => {
      const next = { ...f, [key]: value }
      // Kode otomatis mengikuti zona selama belum diubah manual
      if (key === 'zona' && kodeAuto) next.kode = generateKode(value, raks)
      return next
    })
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function handleKodeChange(value) {
    setKodeAuto(false)
    updateField('kode', normalizeKode(value))
  }

  function regenerateKode() {
    setKodeAuto(true)
    setFormData((f) => ({ ...f, kode: generateKode(f.zona, raks) }))
  }

  function handleDelete(rak) {
    setDeleteTarget(rak)
  }

  async function confirmDelete() {
    if (!deleteTarget || deleteTarget.terisi > 0) return
    const target = deleteTarget
    const res = await apiFetch(`/api/locations/${target.id}`, { method: 'DELETE' })
    if (res.ok) {
      setRaks((prev) => prev.filter((r) => r.id !== target.id))
      showToast(`Rak ${target.kode} berhasil dihapus.`)
    }
    setDeleteTarget(null)
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    setSubmitted(true)
    if (!isValid) return

    const kode = formData.kode.trim()
    const kapasitas = Number(formData.kapasitas)
    const keterangan = formData.keterangan.trim()

    setSaving(true)
    try {
      const res = await apiFetch('/api/locations/', {
        method: 'POST',
        body: JSON.stringify({
          kode,
          kode_lokasi: kode.replace(/^RAK\s+/i, ''),
          nama_lokasi: kode,
          zona: formData.zona,
          deskripsi: keterangan || formData.zona,
          kapasitas,
          keterangan,
        }),
      })
      const created = await res.json().catch(() => null)
      const newId = created?.data?.id_lokasi ?? created?.data?.id ?? created?.id ?? Date.now()
      const newRak = {
        id: newId,
        kode,
        zona: formData.zona,
        kapasitas,
        keterangan,
        terisi: 0,
      }
      setRaks((prev) => [newRak, ...prev])
      setIsModalOpen(false)
      showToast(`Rak ${newRak.kode} berhasil didaftarkan di ${newRak.zona}.`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Data Rak"
      actions={
        <Btn variant="primary" size="lg" icon={Plus} onClick={handleOpenCreate}>
          Tambah Rak
        </Btn>
      }
    >
      {toast && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          <CheckCircle2 size={16} />
          {toast}
        </div>
      )}

      {/* Search row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex h-9 flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 transition-colors">
          <Search size={15} className="shrink-0 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Cari kode rak atau zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader
          title={`${filteredRaks.length} rak ditemukan`}
          description="Atur zonasi tata letak penyimpanan fisik, batas tampung, dan cetak QR identifikasi rak."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kode Rak</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Zonasi</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kapasitas</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Terisi</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">QR</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Memuat data rak dari server...
                  </td>
                </tr>
              )}
              {!loading && filteredRaks.map((rak) => {
                const pct = rak.kapasitas > 0 ? Math.min(100, Math.round((rak.terisi / rak.kapasitas) * 100)) : 0
                const status = hitungStatus(rak.terisi, rak.kapasitas)
                return (
                  <tr key={rak.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#0037B0]">{rak.kode}</td>
                    <td className="px-4 py-3 text-[13.5px] text-[#111827]">
                      {rak.zona}
                      {rak.keterangan && <span className="block text-[12px] text-[#6B7280]">{rak.keterangan}</span>}
                    </td>
                    <td className="px-4 py-3 text-[13.5px] text-[#111827]">{rak.kapasitas} box</td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px] text-[#6B7280]">
                          <span>{rak.terisi}/{rak.kapasitas} box</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E5E7EB]">
                          <div
                            className={`h-2 rounded-full ${barColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariant(status)} dot>
                        {status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Btn variant="secondary" size="sm" icon={QrCode} onClick={() => setQrModalRak(rak)}>
                        Lihat QR
                      </Btn>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Btn variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(rak)} />
                    </td>
                  </tr>
                )
              })}
              {!loading && filteredRaks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada data rak dari API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Rak */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Lokasi Rak Baru"
        subtitle="Tambahkan kode rak dan alokasikan ke zona gudang"
        icon={Grid2X2}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Btn>
            <Btn variant="primary" loading={saving} onClick={handleSubmit} disabled={submitted && !isValid}>Daftarkan Rak</Btn>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          {submitted && !isValid && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              Masih ada {Object.keys(errors).length} isian yang belum sesuai. Periksa kolom bertanda merah.
            </div>
          )}
          <div className="grid gap-4">
            <Field label="Zonasi Area Gudang" required error={showErr('zona')}>
              <Select value={formData.zona} onChange={(e) => updateField('zona', e.target.value)}>
                {ZONA.map((z) => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </Select>
            </Field>

            <Field
              label="Kode Rak Unik"
              required
              error={showErr('kode')}
              hint={
                kodeAuto
                  ? 'Dibuat otomatis: nomor berikutnya yang kosong di zona terpilih.'
                  : `Format "RAK ${zonaByValue(formData.zona)?.huruf ?? 'X'}-NN", huruf mengikuti zona.`
              }
            >
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Contoh: RAK B-03"
                  maxLength={8}
                  value={formData.kode}
                  aria-invalid={!!showErr('kode')}
                  className={`pr-10 font-mono ${showErr('kode') ? errCls : ''}`}
                  onChange={(e) => handleKodeChange(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, kode: true }))}
                />
                <button
                  type="button"
                  title="Buat ulang kode otomatis"
                  onClick={regenerateKode}
                  className="absolute inset-y-0 right-1 my-auto grid size-7 place-items-center rounded text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#0037B0]"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </Field>

            <Field
              label="Kapasitas Maksimal (Box / Dus)"
              required
              error={showErr('kapasitas')}
              hint={`Bilangan bulat ${KAPASITAS_MIN}–${KAPASITAS_MAX.toLocaleString('id-ID')}`}
            >
              <Input
                type="number"
                inputMode="numeric"
                min={KAPASITAS_MIN}
                max={KAPASITAS_MAX}
                step="1"
                value={formData.kapasitas}
                aria-invalid={!!showErr('kapasitas')}
                className={showErr('kapasitas') ? errCls : ''}
                onKeyDown={(e) => BLOCKED_KEYS.includes(e.key) && e.preventDefault()}
                onChange={(e) => updateField('kapasitas', e.target.value)}
              />
            </Field>

            <Field
              label="Catatan / Dimensi Fisik"
              error={showErr('keterangan')}
              hint={`Opsional · ${formData.keterangan.trim().length}/${CATATAN_MAX} karakter`}
            >
              <Input
                type="text"
                maxLength={CATATAN_MAX}
                placeholder="Misal: 200cm x 100cm x 50cm"
                value={formData.keterangan}
                className={showErr('keterangan') ? errCls : ''}
                onChange={(e) => updateField('keterangan', e.target.value)}
              />
            </Field>
          </div>
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.terisi > 0 ? 'Rak Tidak Dapat Dihapus' : 'Hapus Lokasi Rak?'}
        subtitle={deleteTarget ? `${deleteTarget.kode} · ${deleteTarget.zona}` : ''}
        icon={AlertTriangle}
        maxWidth="max-w-md"
        footer={
          deleteTarget?.terisi > 0 ? (
            <Btn variant="secondary" onClick={() => setDeleteTarget(null)}>Mengerti</Btn>
          ) : (
            <>
              <Btn variant="secondary" onClick={() => setDeleteTarget(null)}>Batal</Btn>
              <Btn variant="danger" icon={Trash2} onClick={confirmDelete}>Ya, Hapus</Btn>
            </>
          )
        }
      >
        <p className="text-[13.5px] leading-relaxed text-[#374151]">
          {deleteTarget?.terisi > 0
            ? `Rak ini masih menyimpan ${deleteTarget.terisi} box barang. Pindahkan seluruh barang ke rak lain terlebih dahulu sebelum menghapus lokasi rak.`
            : 'Rak kosong ini akan dihapus permanen beserta stiker QR-nya. Tindakan ini tidak dapat dibatalkan.'}
        </p>
      </Modal>

      {/* Modal Cetak Label QR Rak */}
      <QrLabelModal
        open={!!qrModalRak}
        onClose={() => setQrModalRak(null)}
        title={qrModalRak?.kode ?? 'Label Rak'}
        code={qrModalRak?.kode ?? 'RAK A-12'}
        zone={`KORIDOR ${qrModalRak?.kode?.slice(-2) || '01'} • ${qrModalRak?.zona?.toUpperCase() || 'ZONA A'}`}
        uid={`WH-01 • UID: BIN-${qrModalRak?.kode?.replace(/\s+/g, '') || 'A12'}-2024`}
        extraInfo={`Kapasitas Maks: ${qrModalRak?.kapasitas || 50} Dus`}
      />
    </AppShell>
  )
}
