import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Calendar, Filter, FileText, FileSpreadsheet, CheckCircle2, AlertTriangle, Download } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import { KpiCard } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { downloadCSV, fileStamp } from '../lib/csv'
import { formatDateTime } from '../lib/format'

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

function mapTransactionsToRows(list, itemMap = {}) {
  const rows = []

  list.forEach((tx, idx) => {
    const rawTipe = String(tx.tipe ?? tx.jenis_transaksi ?? tx.type ?? 'MASUK').toUpperCase()
    const tipe =
      rawTipe === 'IN' || rawTipe === 'MASUK'
        ? 'MASUK'
        : rawTipe === 'OUT' || rawTipe === 'KELUAR'
          ? 'KELUAR'
          : rawTipe
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

      const rawSebelum = it.stok_sebelum ?? tx.stok_sebelum
      const rawSesudah = it.stok_sesudah ?? tx.stok_sesudah

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
        sebelum: rawSebelum !== undefined && rawSebelum !== null ? Number(rawSebelum) : null,
        sesudah: rawSesudah !== undefined && rawSesudah !== null ? Number(rawSesudah) : null,
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
  const canUseServerExport = role === 'ADMIN' || role === 'KEPALA_GUDANG'

  const [reportJenis, setReportJenis] = useState('transaksi')
  const [dari, setDari] = useState('')
  const [sampai, setSampai] = useState('')
  const [tipeFilter, setTipeFilter] = useState('semua')
  const [rows, setRows] = useState([])
  const [stokRows, setStokRows] = useState([])
  const [stokSummary, setStokSummary] = useState({ total_item: 0, total_stok: 0, jumlah_kritis: 0 })
  const [opnameRows, setOpnameRows] = useState([])
  const [totalServer, setTotalServer] = useState(0)
  const [loading, setLoading] = useState(true)
  const [snackbar, setSnackbar] = useState('')
  const [dateError, setDateError] = useState('')
  const snackTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (snackTimerRef.current) clearTimeout(snackTimerRef.current)
    }
  }, [])

  // Ambil laporan berdasarkan jenis tab (transaksi / stok / opname)
  useEffect(() => {
    if (dari && sampai && dari > sampai) {
      return
    }

    let active = true
    async function loadReports() {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (dari) qs.set('dari', dari)
        if (sampai) qs.set('sampai', sampai)

        if (reportJenis === 'stok' && canUseServerExport) {
          const res = await apiFetch('/api/reports/stok')
          if (!active) return
          if (res.ok) {
            const payload = await res.json().catch(() => null)
            const data = Array.isArray(payload?.data) ? payload.data : unwrapList(payload)
            setStokRows(data)
            if (payload?.ringkasan) {
              setStokSummary(payload.ringkasan)
            } else {
              setStokSummary({
                total_item: data.length,
                total_stok: data.reduce((s, r) => s + Number(r.stok_saat_ini ?? 0), 0),
                jumlah_kritis: data.filter((r) => r.status === 'kritis').length,
              })
            }
          }
          return
        }

        if (reportJenis === 'opname' && canUseServerExport) {
          const query = qs.toString()
          const res = await apiFetch(`/api/reports/opname${query ? `?${query}` : ''}`)
          if (!active) return
          if (res.ok) {
            const payload = await res.json().catch(() => null)
            const sessions = Array.isArray(payload?.data) ? payload.data : unwrapList(payload)
            const flattened = []
            sessions.forEach((op) => {
              const tgl = formatDateTime(op.tanggal_opname)
              const items = Array.isArray(op.items) && op.items.length > 0 ? op.items : []
              if (items.length === 0) {
                flattened.push({
                  id: `op-${op.id_opname}-empty`,
                  id_opname: op.id_opname,
                  tanggal: tgl,
                  nama_user: op.nama_user ?? '-',
                  status: op.status ?? 'draft',
                  keterangan: op.keterangan ?? '-',
                  kode_barang: '-',
                  nama_barang: '(Belum ada detail barang)',
                  stok_sistem: 0,
                  stok_fisik: 0,
                  selisih: 0,
                })
              } else {
                items.forEach((it, idx) => {
                  flattened.push({
                    id: `op-${op.id_opname}-${it.barang_id ?? idx}`,
                    id_opname: op.id_opname,
                    tanggal: tgl,
                    nama_user: op.nama_user ?? '-',
                    status: op.status ?? 'draft',
                    keterangan: op.keterangan ?? '-',
                    kode_barang: it.kode_barang ?? '-',
                    nama_barang: it.nama_barang ?? '-',
                    stok_sistem: Number(it.stok_sistem ?? 0),
                    stok_fisik: Number(it.stok_fisik ?? 0),
                    selisih: Number(it.selisih ?? 0),
                  })
                })
              }
            })
            setOpnameRows(flattened)
          }
          return
        }

        const txQs = new URLSearchParams({ limit: '100' })
        if (dari) txQs.set('dari', dari)
        if (sampai) txQs.set('sampai', sampai)

        const [itemsRes, txRes] = await Promise.all([
          apiFetch('/api/items/'),
          apiFetch(`/api/transactions/?${txQs.toString()}`),
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
          const payload = await txRes.json().catch(() => null)
          const list = unwrapList(payload)
          setTotalServer(payload?.meta?.total ?? list.length)
          setRows(mapTransactionsToRows(list, itemMap))
        }
      } catch (err) {
        console.warn('Gagal memuat laporan:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadReports()
    return () => { active = false }
  }, [reportJenis, dari, sampai, canUseServerExport])

  function handleDateChange(which, value) {
    const nextDari = which === 'dari' ? value : dari
    const nextSampai = which === 'sampai' ? value : sampai
    if (which === 'dari') setDari(value)
    else setSampai(value)
    if (nextDari && nextSampai && nextDari > nextSampai) {
      setDateError('Tanggal awal tidak boleh lebih besar daripada tanggal akhir.')
    } else {
      setDateError('')
    }
  }

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function showSnack(msg) {
    setSnackbar(msg)
    if (snackTimerRef.current) clearTimeout(snackTimerRef.current)
    snackTimerRef.current = setTimeout(() => setSnackbar(''), 3500)
  }

  async function handleExport(format) {
    if (format === 'csv' || !canUseServerExport) {
      if (reportJenis === 'stok') {
        showSnack('Mengunduh Laporan Stok (.CSV)...')
        downloadCSV(
          `laporan-stok-wh01-${fileStamp()}.csv`,
          ['SKU', 'NAMA BARANG', 'KATEGORI', 'LOKASI', 'STOK', 'MIN STOK', 'STATUS'],
          stokRows.map((r) => [r.kode_barang, r.nama_barang, r.kategori, r.lokasi ?? '-', r.stok_saat_ini, r.batas_stok_minimum, r.status])
        )
        return
      }
      if (reportJenis === 'opname') {
        showSnack('Mengunduh Laporan Opname (.CSV)...')
        downloadCSV(
          `laporan-opname-wh01-${fileStamp()}.csv`,
          ['TANGGAL', 'ID SESI', 'PELAKSANA', 'SKU', 'BARANG', 'STOK SISTEM', 'STOK FISIK', 'SELISIH', 'STATUS'],
          opnameRows.map((r) => [r.tanggal, r.id_opname, r.nama_user, r.kode_barang, r.nama_barang, r.stok_sistem, r.stok_fisik, r.selisih, r.status])
        )
        return
      }
      showSnack('Mengunduh Riwayat Transaksi (.CSV)...')
      downloadCSV(
        `riwayat-transaksi-wh01-${fileStamp()}.csv`,
        ['WAKTU', 'BARANG', 'SKU', 'RAK', 'TIPE', 'JUMLAH', 'OPERATOR', 'CATATAN'],
        filtered.map((r) => [r.waktu, r.barang, r.sku, r.rak, r.tipe, r.jumlah, r.staf, r.catatan])
      )
      return
    }

    const fmt = format === 'pdf' ? 'pdf' : 'xlsx'
    const labelMap = { transaksi: 'Transaksi', stok: 'Stok Barang', opname: 'Stok Opname' }
    showSnack(`Mengunduh Laporan ${labelMap[reportJenis]} (${fmt.toUpperCase()})...`)
    try {
      const qs = new URLSearchParams({ format: fmt })
      if (reportJenis !== 'stok') {
        if (dari) qs.set('dari', dari)
        if (sampai) qs.set('sampai', sampai)
      }
      const res = await apiFetch(`/api/reports/${reportJenis}/export?${qs.toString()}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `laporan-${reportJenis}-wh01-${fileStamp()}.${fmt}`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(url), 1000)
        return
      }
      showSnack(`Server ekspor mengembalikan status ${res.status}. Mengunduh format CSV...`)
    } catch {
      showSnack('Gagal mengunduh dari server, beralih ke unduhan CSV...')
    }

    downloadCSV(
      `laporan-${reportJenis}-wh01-${fileStamp()}.csv`,
      ['WAKTU', 'BARANG', 'SKU', 'RAK', 'TIPE', 'JUMLAH', 'OPERATOR', 'CATATAN'],
      filtered.map((r) => [r.waktu, r.barang, r.sku, r.rak, r.tipe, r.jumlah, r.staf, r.catatan])
    )
  }

  const filtered = rows.filter((r) => tipeFilter === 'semua' || r.tipe === tipeFilter)
  const totalMasuk = filtered.filter((r) => r.tipe === 'MASUK').reduce((s, r) => s + r.jumlah, 0)
  const totalKeluar = filtered.filter((r) => r.tipe === 'KELUAR').reduce((s, r) => s + r.jumlah, 0)
  const netto = totalMasuk - totalKeluar
  const opnameSelisihCount = opnameRows.filter((r) => r.selisih !== 0).length
  const opnameSessionCount = new Set(opnameRows.map((r) => r.id_opname)).size

  return (
    <AppShell
      menuItems={menuItems}
      userName={user?.name ?? 'Pengguna Gudang'}
      onLogout={handleLogout}
      pageTitle={role === 'STAF_GUDANG' ? 'Riwayat Transaksi' : 'Laporan Inventaris'}
      actions={
        canUseServerExport ? (
          <div className="flex gap-2">
            <Btn variant="secondary" icon={FileText} onClick={() => handleExport('pdf')}>PDF</Btn>
            <Btn variant="primary" icon={FileSpreadsheet} onClick={() => handleExport('xlsx')}>Excel</Btn>
          </div>
        ) : (
          <Btn variant="secondary" icon={Download} onClick={() => handleExport('csv')}>Ekspor CSV</Btn>
        )
      }
    >
      {snackbar && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[13.5px] text-green-800">
          <CheckCircle2 size={16} />
          {snackbar}
        </div>
      )}

      {dateError && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          <AlertTriangle size={16} />
          {dateError}
        </div>
      )}

      {canUseServerExport && (
        <div className="mb-5 flex flex-wrap gap-2">
          {[
            { id: 'transaksi', label: 'Mutasi Transaksi' },
            { id: 'stok', label: 'Laporan Stok' },
            { id: 'opname', label: 'Laporan Opname' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setReportJenis(tab.id)}
              className={`rounded-lg px-4 py-2 text-[13.5px] font-medium transition-colors ${
                reportJenis === tab.id
                  ? 'bg-[#0037B0] text-white'
                  : 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      {reportJenis !== 'stok' && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
          <div className="flex items-center gap-2 text-[13.5px] text-[#374151]">
            <Calendar size={15} className="text-[#6B7280]" />
            <span>Rentang:</span>
            <input
              type="date"
              value={dari}
              onChange={(e) => handleDateChange('dari', e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8]"
            />
            <span className="text-[#6B7280]">s/d</span>
            <input
              type="date"
              value={sampai}
              onChange={(e) => handleDateChange('sampai', e.target.value)}
              className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5 text-[13px] text-[#111827] outline-none focus:border-[#1D4ED8]"
            />
          </div>

          {reportJenis === 'transaksi' && (
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
              </select>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {reportJenis === 'stok' ? (
        <div className="mb-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <KpiCard label="Total Jenis Barang" value={stokSummary.total_item} unit="SKU" delta="Katalog aktif" deltaGood />
          <KpiCard label="Total Stok Tersedia" value={stokSummary.total_stok} unit="Unit" delta="Akumulasi seluruh rak" deltaGood />
          <KpiCard
            label="Stok Kritis"
            value={stokSummary.jumlah_kritis}
            unit="Item"
            delta="Di bawah ambang batas"
            deltaGood={stokSummary.jumlah_kritis === 0}
          />
        </div>
      ) : reportJenis === 'opname' ? (
        <div className="mb-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <KpiCard label="Total Sesi Opname" value={opnameSessionCount} unit="Sesi" delta="Periode terpilih" deltaGood />
          <KpiCard label="Item Diperiksa" value={opnameRows.length} unit="Baris" delta="Total rekonsiliasi" deltaGood />
          <KpiCard
            label="Item Berselisih"
            value={opnameSelisihCount}
            unit="Item"
            delta="Stok sistem ≠ fisik"
            deltaGood={opnameSelisihCount === 0}
          />
        </div>
      ) : (
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
      )}

      {/* Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          {reportJenis === 'stok' ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Nama Barang / SKU</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kategori</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Stok Saat Ini</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Batas Minimum</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">Memuat laporan stok...</td></tr>
                ) : stokRows.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">Tidak ada data stok barang.</td></tr>
                ) : (
                  stokRows.map((r) => (
                    <tr key={r.id_barang} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3">
                        <span className="block text-[13.5px] font-medium text-[#111827]">{r.nama_barang}</span>
                        <span className="text-[12px] font-mono text-[#0037B0]">{r.kode_barang}</span>
                      </td>
                      <td className="px-4 py-3 text-[13.5px] text-[#374151]">{r.kategori}</td>
                      <td className="px-4 py-3 text-[13.5px] text-[#374151]">{r.lokasi || '-'}</td>
                      <td className="px-4 py-3 text-right text-[13.5px] font-semibold text-[#111827]">{r.stok_saat_ini}</td>
                      <td className="px-4 py-3 text-right text-[13.5px] text-[#6B7280]">{r.batas_stok_minimum}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={r.status === 'kritis' ? 'danger' : 'success'}>
                          {r.status === 'kritis' ? 'KRITIS' : 'AMAN'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : reportJenis === 'opname' ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Tanggal</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Sesi & Pelaksana</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Barang / SKU</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Sistem</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Fisik</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Selisih</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading ? (
                  <tr><td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">Memuat laporan opname...</td></tr>
                ) : opnameRows.length === 0 ? (
                  <tr><td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">Tidak ada data laporan opname.</td></tr>
                ) : (
                  opnameRows.map((r) => (
                    <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#6B7280]">{r.tanggal}</td>
                      <td className="px-4 py-3">
                        <span className="block text-[13.5px] font-medium text-[#111827]">Sesi #{r.id_opname}</span>
                        <span className="text-[12px] text-[#6B7280]">{r.nama_user}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="block text-[13.5px] font-medium text-[#111827]">{r.nama_barang}</span>
                        <span className="text-[12px] font-mono text-[#0037B0]">{r.kode_barang}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[13.5px] text-[#374151]">{r.stok_sistem}</td>
                      <td className="px-4 py-3 text-right text-[13.5px] font-medium text-[#111827]">{r.stok_fisik}</td>
                      <td className={`px-4 py-3 text-right text-[13.5px] font-semibold ${r.selisih === 0 ? 'text-[#6B7280]' : r.selisih > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {r.selisih > 0 ? `+${r.selisih}` : r.selisih}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={r.status === 'selesai' ? 'success' : 'warning'}>
                          {r.status.toUpperCase()}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Waktu</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Nama Barang / SKU</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Tipe</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kuantitas</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Operator</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Mutasi / Catatan</th>
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
                        {r.sebelum !== null && r.sesudah !== null ? (
                          <>
                            {r.sebelum} → <span className="font-semibold text-[#111827]">{r.sesudah}</span>
                          </>
                        ) : (
                          <span>{r.catatan || 'Tercatat'}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-[12.5px] text-[#6B7280]">
          <span>
            {reportJenis === 'stok'
              ? `Menampilkan ${stokRows.length} jenis barang`
              : reportJenis === 'opname'
                ? `Menampilkan ${opnameRows.length} detail opname`
                : `Menampilkan ${filtered.length} baris dari ${totalServer} transaksi`}
          </span>
          <span className="font-medium text-[#374151]">
            Gudang WH-01 · {reportJenis === 'stok' ? 'Laporan Stok' : reportJenis === 'opname' ? 'Laporan Opname' : 'Rekapitulasi Mutasi'}
          </span>
        </div>
      </div>
    </AppShell>
  )
}
