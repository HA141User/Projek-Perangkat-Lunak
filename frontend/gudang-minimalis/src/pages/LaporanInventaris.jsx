import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, Filter, FileText, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import { KpiCard } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { downloadCSV, fileStamp } from '../lib/csv'

const MENU_KEPALA = [
  { to: '/kepala-gudang', label: 'Beranda' },
  { to: '/kepala-gudang/persetujuan', label: 'Persetujuan Opname' },
  { to: '/kepala-gudang/laporan', label: 'Laporan Inventaris' },
  { to: '/kepala-gudang/notifikasi', label: 'Notifikasi' },
]

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

const MENU_STAF = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const TIPE_BADGE = {
  MASUK: 'success',
  KELUAR: 'danger',
  OPNAME: 'info',
}

function formatDateTime(isoString) {
  if (!isoString || isoString === '-') return '-'
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return (
      d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' WIB'
    )
  } catch {
    return isoString
  }
}

function mapTransactionsToRows(list, itemMap = {}) {
  const rows = []

  list.forEach((tx, idx) => {
    const rawTipe = String(tx.tipe ?? tx.jenis_transaksi ?? tx.type ?? 'MASUK').toUpperCase()
    const tipe = rawTipe === 'IN' || rawTipe === 'MASUK' ? 'MASUK' : rawTipe === 'OUT' || rawTipe === 'KELUAR' ? 'KELUAR' : rawTipe
    const staf = tx.nama_user ?? tx.staf ?? tx.user_nama ?? tx.user?.nama ?? tx.operator ?? 'Staf Gudang'
    const waktu = formatDateTime(tx.tanggal_transaksi ?? tx.waktu ?? tx.created_at ?? tx.tanggal)
    const catatan = tx.keterangan ?? tx.catatan ?? ''

    const items = Array.isArray(tx.items) && tx.items.length > 0 ? tx.items : [tx]

    items.forEach((it, j) => {
      const itemId = it.barang_id ?? it.id_barang ?? it.id ?? tx.id_barang
      const itemInfo = (itemId && itemMap[itemId]) || {}

      const barang =
        it.nama_barang ?? it.nama ?? tx.barang ?? tx.nama_barang ?? itemInfo.nama_barang ?? itemInfo.nama ?? '-'
      const sku =
        it.kode_barang ?? it.sku ?? tx.sku ?? tx.kode_barang ?? itemInfo.kode_barang ?? itemInfo.sku ?? '-'
      const rak = String(
        it.rak ?? tx.rak ?? tx.kode_lokasi ?? itemInfo.lokasi?.nama_rak ?? itemInfo.rak ?? 'Rak A1'
      ).replace(/^RAK\s+/i, '')
      const jumlah = Number(it.jumlah ?? it.kuantitas ?? it.quantity ?? tx.jumlah ?? 0)

      const stokSekarang = Number(itemInfo.stok_saat_ini ?? itemInfo.stok ?? 10)
      const sebelum = Number(
        it.stok_sebelum ??
          tx.stok_sebelum ??
          (tipe === 'MASUK' ? Math.max(0, stokSekarang - jumlah) : stokSekarang + jumlah)
      )
      const sesudah = Number(
        it.stok_sesudah ?? tx.stok_sesudah ?? (tipe === 'MASUK' ? sebelum + jumlah : Math.max(0, sebelum - jumlah))
      )

      rows.push({
        id: `${tx.id_transaksi ?? idx + 1}-${j}`,
        txId: tx.id_transaksi ?? idx + 1,
        waktu,
        barang,
        sku,
        rak,
        tipe,
        jumlah,
        staf,
        catatan,
        sebelum,
        sesudah,
      })
    })
  })

  return rows
}

export default function LaporanInventaris() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const role = user?.role || 'KEPALA_GUDANG'
  const menuItems = role === 'ADMIN' ? MENU_ADMIN : role === 'STAF_GUDANG' ? MENU_STAF : MENU_KEPALA

  const [dari, setDari] = useState('')
  const [sampai, setSampai] = useState('')
  const [tipeFilter, setTipeFilter] = useState('semua')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState('')

  // Ambil riwayat mutasi/laporan murni dari GET /api/transactions/ dan data items server
  useEffect(() => {
    let active = true
    async function loadReports() {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (dari) qs.set('dari', dari)
        if (sampai) qs.set('sampai', sampai)
        const queryStr = qs.toString() ? `?${qs.toString()}` : ''

        const [itemsRes, txRes] = await Promise.all([
          apiFetch('/api/items/'),
          apiFetch(`/api/transactions/${queryStr}`),
        ])

        if (!active) return

        const itemMap = {}
        if (itemsRes.ok) {
          const itemsList = unwrapList(await itemsRes.json().catch(() => null))
          itemsList.forEach((it) => {
            const id = it.id_barang ?? it.id
            if (id) itemMap[id] = it
          })
        }

        if (txRes.ok) {
          const list = unwrapList(await txRes.json().catch(() => null))
          setRows(mapTransactionsToRows(list, itemMap))
        }
      } catch (err) {
        console.warn('Gagal memuat laporan mutasi:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadReports()
    return () => { active = false }
  }, [dari, sampai])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function showSnack(msg) {
    setSnackbar(msg)
    setTimeout(() => setSnackbar(''), 3500)
  }

  async function handleExport(format) {
    showSnack(`Mengunduh Laporan Mutasi (${format.toUpperCase()})...`)
    try {
      const qs = new URLSearchParams({ format })
      if (dari) qs.set('dari', dari)
      if (sampai) qs.set('sampai', sampai)
      await apiFetch(`/api/reports/mutasi/export?${qs.toString()}`)
    } catch {
      /* ignore */
    }
    downloadCSV(
      `laporan-inventaris-wh01-${fileStamp()}.${format === 'pdf' ? 'pdf' : 'csv'}`,
      ['WAKTU', 'BARANG', 'SKU', 'RAK', 'TIPE', 'JUMLAH', 'STAF', 'SEBELUM', 'SESUDAH'],
      filtered.map((r) => [r.waktu, r.barang, r.sku, r.rak, r.tipe, r.jumlah, r.staf, r.sebelum, r.sesudah]),
    )
  }

  const filtered = rows.filter((r) => tipeFilter === 'semua' || r.tipe === tipeFilter)
  const totalMasuk = filtered.filter((r) => r.tipe === 'MASUK').reduce((s, r) => s + r.jumlah, 0)
  const totalKeluar = filtered.filter((r) => r.tipe === 'KELUAR').reduce((s, r) => s + r.jumlah, 0)
  const netto = totalMasuk - totalKeluar

  return (
    <AppShell
      menuItems={menuItems}
      userName={user?.name ?? 'Pengguna Gudang'}
      onLogout={handleLogout}
      pageTitle="Laporan Inventaris"
      actions={
        <div className="flex gap-2">
          <Btn variant="secondary" icon={FileText} onClick={() => handleExport('pdf')}>PDF</Btn>
          <Btn variant="primary" icon={FileSpreadsheet} onClick={() => handleExport('xlsx')}>Excel</Btn>
        </div>
      }
    >
      {snackbar && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13.5px] text-green-800">
          <CheckCircle2 size={16} />
          {snackbar}
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-2 text-[13.5px] text-[#374151]">
          <Calendar size={15} className="text-[#6B7280]" />
          <span>Rentang:</span>
          <input
            type="date"
            value={dari}
            onChange={(e) => setDari(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8]"
          />
          <span className="text-[#6B7280]">s/d</span>
          <input
            type="date"
            value={sampai}
            onChange={(e) => setSampai(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8]"
          />
        </div>

        <div className="flex items-center gap-2 text-[13.5px] text-[#374151]">
          <Filter size={14} className="text-[#6B7280]" />
          <span>Tipe:</span>
          <select
            value={tipeFilter}
            onChange={(e) => setTipeFilter(e.target.value)}
            className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8]"
          >
            <option value="semua">Semua Mutasi</option>
            <option value="MASUK">Barang Masuk</option>
            <option value="KELUAR">Barang Keluar</option>
            <option value="OPNAME">Penyesuaian Opname</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        <KpiCard
          label="Total Barang Masuk"
          value={`+${totalMasuk}`}
          unit="Unit"
          delta="Periode terpilih"
          deltaGood
        />
        <KpiCard
          label="Total Barang Keluar"
          value={`−${totalKeluar}`}
          unit="Unit"
          delta="Distribusi logistik"
          deltaGood={false}
        />
        <KpiCard
          label="Netto Perubahan Stok"
          value={`${netto >= 0 ? '+' : ''}${netto}`}
          unit="Unit"
          delta="Keseimbangan inventaris"
          deltaGood={netto >= 0}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Waktu</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Nama Barang / SKU</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Tipe</th>
                <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kuantitas</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Operator</th>
                <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Mutasi Stok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Memuat data laporan mutasi dari server...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada data mutasi yang ditemukan di server.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#6B7280]">{r.waktu}</td>
                    <td className="px-4 py-3">
                      <span className="block text-[13.5px] font-medium text-[#111827]">{r.barang}</span>
                      <span className="text-[12px] font-mono text-[#0037B0]">{r.sku}</span>
                      {r.catatan && (
                        <span className="block text-[11px] text-[#6B7280] mt-0.5">{r.catatan}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13.5px] font-medium text-[#374151]">{r.rak}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={TIPE_BADGE[r.tipe] || 'neutral'}>{r.tipe}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-[13.5px] font-semibold text-[#111827]">
                      {r.tipe === 'MASUK' ? `+${r.jumlah}` : r.tipe === 'KELUAR' ? `−${r.jumlah}` : r.jumlah} unit
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[13.5px] text-[#374151]">{r.staf}</td>
                    <td className="px-4 py-3 text-right text-[13px] text-[#6B7280]">
                      {r.sebelum} → <span className="font-semibold text-[#111827]">{r.sesudah}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-[12.5px] text-[#6B7280]">
          <span>Menampilkan {filtered.length} dari {rows.length} transaksi</span>
          <span className="font-medium text-[#374151]">Gudang WH-01 · Rekapitulasi Mutasi</span>
        </div>
      </div>
    </AppShell>
  )
}
