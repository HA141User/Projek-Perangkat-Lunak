import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { PackagePlus, Search, Filter, Edit2, Trash2, Package, CheckCircle2, Lock, RefreshCw, QrCode, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import QrLabelModal from '../components/QrLabelModal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { extractApiError } from '../lib/format'

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

// ─── Master referensi opsi form ────────────────────────────────────────────
const DEFAULT_KATEGORI = [
  { id: 1, value: 'Elektronik', prefix: 'ELK' },
  { id: 2, value: 'Alat Tulis', prefix: 'ATK' },
  { id: 3, value: 'Kebersihan', prefix: 'KBR' },
]
const SATUAN = ['Pcs', 'Unit', 'Roll', 'Dus', 'Box', 'Pack', 'Pasang', 'Set', 'Lembar', 'Kg', 'Meter', 'Liter']
const DEFAULT_RAK = [
  { id: 1, label: 'Rak A1' },
  { id: 2, label: 'Rak B1' },
  { id: 3, label: 'Rak C1' },
]

// ─── Aturan validasi ───────────────────────────────────────────────────────
const SKU_REGEX = /^[A-Z0-9]+(-[A-Z0-9]+)*$/
const SKU_MIN = 3
const SKU_MAX = 30
const NAMA_MIN = 3
const NAMA_MAX = 100
const QTY_MAX = 1_000_000

const norm = (s) => String(s ?? '').trim().replace(/\s+/g, ' ').toLowerCase()

function hitungStatus(stok, minStok) {
  if (stok === 0) return 'Habis'
  if (stok <= minStok) return 'Kritis'
  return 'Aman'
}

function statusVariant(status) {
  if (status === 'Aman') return 'success'
  if (status === 'Kritis') return 'warning'
  return 'danger'
}

function derivePrefix(name) {
  const lower = String(name || '').toLowerCase()
  if (lower.includes('elektronik')) return 'ELK'
  if (lower.includes('tulis') || lower.includes('atk')) return 'ATK'
  if (lower.includes('bersih')) return 'KBR'
  if (lower.includes('logistik')) return 'LOG'
  if (lower.includes('safety')) return 'SAF'
  return String(name || 'BRG').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'BRG'
}

function mapApiItem(it, idx = 0) {
  const stok = Number(it.stok ?? it.stok_saat_ini ?? it.stock ?? 0)
  const minStok = Number(it.minStok ?? it.batas_stok_minimum ?? it.min_stock ?? 5)
  const rawRak =
    it.lokasi?.nama_rak ??
    it.lokasi?.kode_lokasi ??
    (typeof it.rak === 'string' ? it.rak : null) ??
    it.kode_lokasi ??
    it.lokasi_nama ??
    'Rak A1'
  const rak = String(rawRak).trim()
  const rawKat =
    it.kategori?.nama_kategori ??
    (typeof it.kategori === 'string' ? it.kategori : null) ??
    it.kategori_nama ??
    'Elektronik'
  const kategori = typeof rawKat === 'string' ? rawKat : 'Elektronik'
  return {
    id: it.id_barang ?? it.id ?? idx + 1,
    sku: it.sku ?? it.kode_barang ?? it.kode ?? `BRG-00${idx + 1}`,
    nama: it.nama ?? it.nama_barang ?? it.name ?? 'Barang Gudang',
    kategori,
    rak,
    lokasiId: it.lokasi_id ?? it.lokasi?.id_lokasi ?? null,
    satuan: it.satuan ?? it.unit ?? 'Unit',
    stok,
    minStok,
    status: hitungStatus(stok, minStok),
  }
}

function generateSku(kategori, items, kategoriList = DEFAULT_KATEGORI) {
  const prefix =
    kategoriList.find((k) => k.value === kategori)?.prefix ?? derivePrefix(kategori)
  const maxNo = items.reduce((max, i) => {
    const m = /-(\d+)$/.exec(i.sku)
    return m ? Math.max(max, Number(m[1])) : max
  }, 0)
  let no = maxNo + 1
  let sku
  do {
    sku = `${prefix}-${String(no).padStart(3, '0')}`
    no += 1
  } while (items.some((i) => norm(i.sku) === norm(sku)))
  return sku
}

function validateQty(raw, label, { min = 0 } = {}) {
  if (raw === '' || raw === null || raw === undefined) return `${label} wajib diisi.`
  const n = Number(raw)
  if (!Number.isFinite(n)) return `${label} harus berupa angka.`
  if (!Number.isInteger(n)) return `${label} harus bilangan bulat (tanpa desimal).`
  if (n < min) return `${label} minimal ${min}.`
  if (n > QTY_MAX) return `${label} maksimal ${QTY_MAX.toLocaleString('id-ID')}.`
  return null
}

function validateBarang(form, items, editingId, kategoriList, rakList) {
  const errors = {}
  const others = items.filter((i) => i.id !== editingId)
  const sku = form.sku.trim().toUpperCase()
  const nama = form.nama.trim().replace(/\s+/g, ' ')

  if (!sku) errors.sku = 'Kode SKU wajib diisi.'
  else if (sku.length < SKU_MIN || sku.length > SKU_MAX) errors.sku = `Kode SKU harus ${SKU_MIN}–${SKU_MAX} karakter.`
  else if (!SKU_REGEX.test(sku)) errors.sku = 'Hanya huruf, angka, dan tanda "-" (contoh: ELK-009).'
  else {
    const dup = others.find((i) => norm(i.sku) === norm(sku))
    if (dup) errors.sku = `Kode SKU sudah dipakai oleh "${dup.nama}".`
  }

  if (!nama) errors.nama = 'Nama barang wajib diisi.'
  else if (nama.length < NAMA_MIN) errors.nama = `Nama barang minimal ${NAMA_MIN} karakter.`
  else if (nama.length > NAMA_MAX) errors.nama = `Nama barang maksimal ${NAMA_MAX} karakter.`
  else {
    const dup = others.find((i) => norm(i.nama) === norm(nama))
    if (dup) errors.nama = `Nama barang sudah terdaftar dengan SKU ${dup.sku}.`
  }

  if (kategoriList.length > 0 && !kategoriList.some((k) => k.value === form.kategori)) {
    errors.kategori = 'Pilih kategori yang valid.'
  }
  if (!SATUAN.includes(form.satuan)) errors.satuan = 'Pilih satuan yang valid.'
  if (rakList.length > 0 && !rakList.some((r) => norm(r.label) === norm(form.rak))) {
    errors.rak = 'Pilih rak yang valid.'
  }

  const minErr = validateQty(form.minStok, 'Batas minimum stok', { min: 1 })
  if (minErr) errors.minStok = minErr
  if (!editingId) {
    const stokErr = validateQty(form.stok, 'Stok awal')
    if (stokErr) errors.stok = stokErr
  }

  return errors
}

const EMPTY_FORM = {
  sku: '',
  nama: '',
  kategori: 'Elektronik',
  rak: DEFAULT_RAK[0].label,
  satuan: 'Unit',
  stok: '0',
  minStok: '5',
}
const errCls = 'border-red-400 focus:border-red-500 focus:ring-red-500/20'

export default function AdminBarang() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [kategoriList, setKategoriList] = useState(DEFAULT_KATEGORI)
  const [rakList, setRakList] = useState(DEFAULT_RAK)
  const [search, setSearch] = useState('')
  const [selectedKategori, setSelectedKategori] = useState('Semua')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [skuAuto, setSkuAuto] = useState(true)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [pageError, setPageError] = useState('')
  const [toast, setToast] = useState('')
  const [qrModalItem, setQrModalItem] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loadingQr, setLoadingQr] = useState(false)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    }
  }, [])

  useEffect(() => {
    let active = true
    async function loadMasterData() {
      setLoading(true)
      try {
        const [itemsRes, catRes, locRes] = await Promise.all([
          apiFetch('/api/items/'),
          apiFetch('/api/categories/'),
          apiFetch('/api/locations/'),
        ])

        if (active && itemsRes.ok) {
          const list = unwrapList(await itemsRes.json().catch(() => null))
          if (Array.isArray(list)) {
            setItems(list.map(mapApiItem))
          }
        }

        if (active && catRes.ok) {
          const cats = unwrapList(await catRes.json().catch(() => null))
          if (Array.isArray(cats) && cats.length > 0) {
            const mappedCats = cats
              .map((c, idx) => {
                const name = c.nama_kategori ?? c.nama ?? c.name ?? c.value
                if (!name) return null
                return {
                  id: c.id_kategori ?? c.id ?? idx + 1,
                  value: name,
                  prefix: c.kode ? String(c.kode).toUpperCase() : derivePrefix(name),
                }
              })
              .filter(Boolean)
            if (mappedCats.length > 0) setKategoriList(mappedCats)
          }
        }

        if (active && locRes.ok) {
          const locs = unwrapList(await locRes.json().catch(() => null))
          if (Array.isArray(locs) && locs.length > 0) {
            const seen = new Set()
            const mappedRaks = locs
              .map((l, idx) => {
                const label = String(
                  l.nama_rak ?? l.kode_lokasi ?? l.kode ?? l.nama_lokasi ?? l.name ?? ''
                ).trim()
                if (!label || seen.has(norm(label))) return null
                seen.add(norm(label))
                return {
                  id: l.id_lokasi ?? l.id ?? idx + 1,
                  label,
                }
              })
              .filter(Boolean)
            if (mappedRaks.length > 0) setRakList(mappedRaks)
          }
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    loadMasterData()
    return () => { active = false }
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      item.nama.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.rak.toLowerCase().includes(q)
    const matchKategori = selectedKategori === 'Semua' || item.kategori === selectedKategori
    return matchSearch && matchKategori
  })

  const errors = useMemo(
    () => validateBarang(formData, items, editingItem?.id, kategoriList, rakList),
    [formData, items, editingItem, kategoriList, rakList]
  )
  const isValid = Object.keys(errors).length === 0
  const showErr = (key) => (submitted || touched[key]) && errors[key]

  const previewStok = editingItem ? editingItem.stok : Number(formData.stok)
  const previewMin = Number(formData.minStok)
  const previewStatus =
    !errors.stok && !errors.minStok ? hitungStatus(previewStok, previewMin) : null

  function showToast(msg) {
    setToast(msg)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 4000)
  }

  function resetFormState() {
    setTouched({})
    setSubmitted(false)
    setSubmitError('')
  }

  function handleOpenCreate() {
    const defaultKat = kategoriList[0]?.value || 'Elektronik'
    setEditingItem(null)
    setSkuAuto(true)
    setFormData({
      ...EMPTY_FORM,
      kategori: defaultKat,
      rak: rakList[0]?.label || DEFAULT_RAK[0].label,
      sku: generateSku(defaultKat, items, kategoriList),
    })
    resetFormState()
    setIsModalOpen(true)
  }

  function handleOpenEdit(item) {
    const matchedRak =
      rakList.find((r) => norm(r.label) === norm(item.rak))?.label ??
      rakList[0]?.label ??
      item.rak
    setEditingItem(item)
    setSkuAuto(false)
    setFormData({
      ...item,
      rak: matchedRak,
      stok: String(item.stok),
      minStok: String(item.minStok),
    })
    resetFormState()
    setIsModalOpen(true)
  }

  function handleClose() {
    setIsModalOpen(false)
    setSubmitError('')
  }

  async function handleOpenQr(item) {
    setQrModalItem(item)
    setQrDataUrl('')
    setLoadingQr(true)
    try {
      const res = await apiFetch(`/api/items/${item.id}/qr`)
      if (res.ok) {
        const payload = await res.json().catch(() => null)
        if (payload?.data_url) {
          setQrDataUrl(payload.data_url)
        }
      }
    } catch (err) {
      console.warn('Gagal memuat QR dari backend:', err)
    } finally {
      setLoadingQr(false)
    }
  }

  function updateField(key, value) {
    setSubmitError('')
    setFormData((f) => {
      const next = { ...f, [key]: value }
      if (key === 'kategori' && skuAuto && !editingItem) {
        next.sku = generateSku(value, items, kategoriList)
      }
      return next
    })
    setTouched((t) => ({ ...t, [key]: true }))
  }

  function handleSkuChange(value) {
    setSkuAuto(false)
    updateField('sku', value.toUpperCase().replace(/\s+/g, ''))
  }

  function regenerateSku() {
    setSkuAuto(true)
    setFormData((f) => ({ ...f, sku: generateSku(f.kategori, items, kategoriList) }))
  }

  async function handleDelete(item) {
    if (!confirm(`Yakin ingin menghapus "${item.nama}" (${item.sku})?\nTindakan ini tidak dapat dibatalkan.`)) return
    setPageError('')
    try {
      const res = await apiFetch(`/api/items/${item.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setPageError(extractApiError(err, `Gagal menghapus ${item.sku} (${res.status})`))
        return
      }
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      showToast(`Barang ${item.sku} berhasil dihapus.`)
    } catch {
      setPageError(`Gagal terhubung ke server saat menghapus ${item.sku}.`)
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault?.()
    setSubmitted(true)
    setSubmitError('')
    if (!isValid) return

    const clean = {
      sku: formData.sku.trim().toUpperCase(),
      nama: formData.nama.trim().replace(/\s+/g, ' '),
      kategori: formData.kategori,
      rak: formData.rak,
      satuan: formData.satuan,
      minStok: Number(formData.minStok),
    }

    const kategoriId = kategoriList.find((k) => k.value === clean.kategori)?.id ?? 1
    const lokasiObj = rakList.find((r) => norm(r.label) === norm(clean.rak))
    const lokasiId = lokasiObj?.id ?? null

    setSaving(true)
    try {
      if (editingItem) {
        const metaChanged =
          clean.nama !== editingItem.nama ||
          clean.kategori !== editingItem.kategori ||
          norm(clean.rak) !== norm(editingItem.rak)
        const minChanged = clean.minStok !== editingItem.minStok

        if (metaChanged) {
          const patchRes = await apiFetch(`/api/items/${editingItem.id}`, {
            method: 'PATCH',
            body: JSON.stringify({
              nama_barang: clean.nama,
              kategori_id: kategoriId,
              ...(lokasiId ? { lokasi_id: lokasiId } : {}),
            }),
          })
          if (!patchRes.ok) {
            const err = await patchRes.json().catch(() => ({}))
            throw new Error(extractApiError(err, `Gagal memperbarui barang (${patchRes.status})`))
          }
        }

        if (minChanged) {
          const minRes = await apiFetch(`/api/items/${editingItem.id}/min-stock`, {
            method: 'PATCH',
            body: JSON.stringify({ batas_stok_minimum: clean.minStok }),
          })
          if (!minRes.ok) {
            const err = await minRes.json().catch(() => ({}))
            throw new Error(extractApiError(err, `Gagal memperbarui batas minimum stok (${minRes.status})`))
          }
        }

        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id
              ? { ...i, ...clean, lokasiId: lokasiId ?? i.lokasiId, status: hitungStatus(i.stok, clean.minStok) }
              : i
          )
        )
        showToast(`Perubahan ${clean.sku} berhasil disimpan.`)
      } else {
        const stok = Number(formData.stok)
        const res = await apiFetch('/api/items/', {
          method: 'POST',
          body: JSON.stringify({
            kode_barang: clean.sku,
            nama_barang: clean.nama,
            kategori_id: kategoriId,
            ...(lokasiId ? { lokasi_id: lokasiId } : {}),
            stok_saat_ini: stok,
            batas_stok_minimum: clean.minStok,
          }),
        })
        const created = await res.json().catch(() => null)
        if (!res.ok) {
          throw new Error(extractApiError(created, `Gagal mendaftarkan barang (${res.status})`))
        }
        const newId = created?.id_barang ?? created?.data?.id_barang ?? created?.data?.id ?? created?.id
        if (!newId) {
          throw new Error('Server tidak mengembalikan ID barang.')
        }
        setItems((prev) => [
          { id: newId, ...clean, lokasiId, stok, status: hitungStatus(stok, clean.minStok) },
          ...prev,
        ])
        showToast(`Barang ${clean.sku} – ${clean.nama} berhasil didaftarkan.`)
      }
      setIsModalOpen(false)
    } catch (err) {
      setSubmitError(err.message || 'Gagal menyimpan data barang.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Data Barang"
      actions={
        <Btn variant="primary" size="lg" icon={PackagePlus} onClick={handleOpenCreate}>
          Tambah Barang
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
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          <AlertTriangle size={16} />
          {pageError}
        </div>
      )}

      {/* Search + Filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex h-9 flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 transition-colors">
          <Search size={15} className="shrink-0 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Cari SKU, nama barang, rak..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>

        <div className="flex h-9 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] focus-within:border-[#1D4ED8] transition-colors">
          <Filter size={14} className="shrink-0 text-[#6B7280]" />
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="bg-transparent text-[13.5px] text-[#111827] outline-none"
          >
            <option value="Semua">Semua Kategori</option>
            {kategoriList.map((k) => (
              <option key={k.value} value={k.value}>{k.value}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader title={`${filteredItems.length} item ditemukan`} description="Kelola daftar seluruh barang gudang, ambang batas minimum, dan alokasi rak." />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">SKU</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Nama Barang</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kategori</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Stok</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Memuat data barang dari server...
                  </td>
                </tr>
              )}
              {!loading && filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3 font-mono text-[13px] font-semibold text-[#0037B0]">{item.sku}</td>
                  <td className="px-4 py-3 text-[13.5px] font-medium text-[#111827]">{item.nama}</td>
                  <td className="px-4 py-3 text-[13.5px] text-[#6B7280]">{item.kategori}</td>
                  <td className="px-4 py-3 font-mono text-[13px] text-[#374151]">{item.rak}</td>
                  <td className={`px-4 py-3 text-right font-mono text-[13.5px] font-semibold ${item.status !== 'Aman' ? 'text-red-600' : 'text-[#111827]'}`}>
                    {item.stok} <span className="text-[12px] font-normal text-[#6B7280]">{item.satuan}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={statusVariant(item.status)} dot>
                      {item.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="inline-flex items-center gap-1">
                      <Btn variant="ghost" size="sm" icon={QrCode} title="Lihat & Cetak Label QR" onClick={() => handleOpenQr(item)} />
                      <Btn variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEdit(item)} />
                      <Btn variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(item)} />
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada data barang dari API.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah / Edit Barang */}
      <Modal
        open={isModalOpen}
        onClose={handleClose}
        title={editingItem ? 'Edit Master Barang' : 'Tambah Barang / SKU Baru'}
        subtitle="Lengkapi data informasi inventaris"
        icon={Package}
        footer={
          <>
            <Btn variant="secondary" onClick={handleClose}>Batal</Btn>
            <Btn variant="primary" loading={saving} onClick={handleSubmit} disabled={submitted && !isValid}>
              {editingItem ? 'Simpan Perubahan' : 'Daftarkan Barang'}
            </Btn>
          </>
        }
      >
        <form onSubmit={handleSubmit} noValidate>
          {submitted && !isValid && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              Masih ada {Object.keys(errors).length} isian yang belum sesuai. Periksa kolom bertanda merah.
            </div>
          )}

          {submitError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {submitError}
            </div>
          )}

          <div className="grid gap-4">
            <Field
              label="Kode SKU / Barcode"
              required
              error={showErr('sku')}
              hint={
                editingItem
                  ? 'SKU tidak dapat diubah karena sudah menjadi referensi transaksi & stiker barcode.'
                  : skuAuto
                    ? 'Dibuat otomatis berdasarkan kategori. Boleh diganti manual.'
                    : 'Huruf besar, angka, dan tanda "-". Harus unik.'
              }
            >
              <div className="relative">
                <Input
                  type="text"
                  value={formData.sku}
                  maxLength={SKU_MAX}
                  readOnly={!!editingItem}
                  aria-invalid={!!showErr('sku')}
                  className={`pr-10 font-mono uppercase ${editingItem ? 'bg-[#F3F4F6] text-[#6B7280]' : ''} ${showErr('sku') ? errCls : ''}`}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, sku: true }))}
                />
                <span className="absolute inset-y-0 right-0 grid w-9 place-items-center text-[#9CA3AF]">
                  {editingItem ? (
                    <Lock size={14} />
                  ) : (
                    <button
                      type="button"
                      title="Buat ulang SKU otomatis"
                      onClick={regenerateSku}
                      className="grid size-7 place-items-center rounded hover:bg-[#F3F4F6] hover:text-[#0037B0]"
                    >
                      <RefreshCw size={14} />
                    </button>
                  )}
                </span>
              </div>
            </Field>

            <Field
              label="Nama Barang"
              required
              error={showErr('nama')}
              hint={`${formData.nama.trim().length}/${NAMA_MAX} karakter · harus unik`}
            >
              <Input
                type="text"
                maxLength={NAMA_MAX}
                placeholder="Contoh: Kabel UTP Cat6 305m"
                value={formData.nama}
                aria-invalid={!!showErr('nama')}
                className={showErr('nama') ? errCls : ''}
                onChange={(e) => updateField('nama', e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Kategori" required error={showErr('kategori')}>
                <Select value={formData.kategori} onChange={(e) => updateField('kategori', e.target.value)}>
                  {kategoriList.map((k) => (
                    <option key={k.value} value={k.value}>{k.value}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Satuan" required error={showErr('satuan')}>
                <Select value={formData.satuan} onChange={(e) => updateField('satuan', e.target.value)}>
                  {SATUAN.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Alokasi Rak" required error={showErr('rak')}>
                <Select value={formData.rak} onChange={(e) => updateField('rak', e.target.value)}>
                  {rakList.map((r) => (
                    <option key={r.id ?? r.label} value={r.label}>{r.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Batas Minimum Stok" required error={showErr('minStok')} hint="Peringatan 'Kritis' saat stok ≤ nilai ini">
                <Input
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={formData.minStok}
                  aria-invalid={!!showErr('minStok')}
                  className={showErr('minStok') ? errCls : ''}
                  onKeyDown={(e) => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()}
                  onChange={(e) => updateField('minStok', e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 items-start gap-4">
              <Field
                label={editingItem ? 'Stok Saat Ini' : 'Stok Awal'}
                required={!editingItem}
                error={showErr('stok')}
                hint={editingItem ? 'Ubah stok lewat Transaksi Masuk/Keluar atau Stok Opname.' : 'Jumlah fisik saat barang didaftarkan'}
              >
                <Input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  value={formData.stok}
                  readOnly={!!editingItem}
                  aria-invalid={!!showErr('stok')}
                  className={`${editingItem ? 'bg-[#F3F4F6] text-[#6B7280]' : ''} ${showErr('stok') ? errCls : ''}`}
                  onKeyDown={(e) => ['e', 'E', '+', '-', '.', ','].includes(e.key) && e.preventDefault()}
                  onChange={(e) => updateField('stok', e.target.value)}
                />
              </Field>
              <Field label="Status Stok (otomatis)">
                <div className="flex h-9 items-center rounded-lg border border-dashed border-[#E5E7EB] px-3">
                  {previewStatus ? (
                    <Badge variant={statusVariant(previewStatus)} dot>{previewStatus}</Badge>
                  ) : (
                    <span className="text-[12.5px] text-[#9CA3AF]">Lengkapi stok &amp; batas minimum</span>
                  )}
                </div>
              </Field>
            </div>
          </div>
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </Modal>

      {/* Modal Cetak Label QR Barang */}
      <QrLabelModal
        open={!!qrModalItem}
        onClose={() => setQrModalItem(null)}
        title={qrModalItem?.nama ?? 'Label Barang'}
        code={qrModalItem?.sku ?? 'BRG-001'}
        zone={`${(qrModalItem?.kategori || 'Elektronik').toUpperCase()} • ${qrModalItem?.rak || 'LOKASI'}`}
        uid={`SKU-${qrModalItem?.sku || 'BRG'} • ID: ${qrModalItem?.id || 1}`}
        extraInfo={`Stok: ${qrModalItem?.stok ?? 0} ${qrModalItem?.satuan || 'Unit'}`}
        qrDataUrl={qrDataUrl}
        loading={loadingQr}
      />
    </AppShell>
  )
}
