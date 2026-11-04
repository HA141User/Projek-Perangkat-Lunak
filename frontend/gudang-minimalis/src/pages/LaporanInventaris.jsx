import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Download, Calendar, Filter, FileText, FileSpreadsheet, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import { KpiCard } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

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

const DUMMY_MUTASI = [
  { id: 1, waktu: '29 Okt 2026, 09:12', barang: 'Kabel UTP Cat6 100m', sku: 'CBL-CAT6-100M', rak: 'A-01', tipe: 'MASUK', jumlah: 24, staf: 'Budi Santoso', sebelum: 18, sesudah: 42 },
  { id: 2, waktu: '29 Okt 2026, 09:02', barang: 'Lakban Bening Heavy Duty', sku: 'LKB-HD-050', rak: 'B-02', tipe: 'KELUAR', jumlah: 6, staf: 'Siti Rahayu', sebelum: 10, sesudah: 4 },
  { id: 3, waktu: '28 Okt 2026, 16:30', barang: 'Switch Hub 16-Port Gigabit', sku: 'SWT-GB-016', rak: 'A-02', tipe: 'KELUAR', jumlah: 2, staf: 'Ahmad Fauzi', sebelum: 5, sesudah: 3 },
  { id: 4, waktu: '28 Okt 2026, 14:15', barang: 'Kertas Thermal Stiker 100x150', sku: 'KRT-TH-150', rak: 'C-01', tipe: 'MASUK', jumlah: 50, staf: 'Dewi Lestari', sebelum: 45, sesudah: 95 },
  { id: 5, waktu: '28 Okt 2026, 11:30', barang: 'Kardus Double Wall A3', sku: 'KRD-DW-A03', rak: 'B-01', tipe: 'OPNAME', jumlah: 5, staf: 'Budi Santoso', sebelum: 115, sesudah: 120 },
  { id: 6, waktu: '28 Okt 2026, 10:20', barang: 'Rompi Keselamatan High-Vis', sku: 'RMP-SF-HIV', rak: 'D-01', tipe: 'MASUK', jumlah: 10, staf: 'Ahmad Fauzi', sebelum: 12, sesudah: 22 },
  { id: 7, waktu: '28 Okt 2026, 08:45', barang: 'Sarung Tangan Karet Grip', sku: 'GLV-SF-GRP', rak: 'D-02', tipe: 'KELUAR', jumlah: 8, staf: 'Siti Rahayu', sebelum: 10, sesudah: 2 },
]

const TIPE_BADGE = {
  MASUK: 'success',
  KELUAR: 'danger',
  OPNAME: 'info',
}

export default function LaporanInventaris() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const role = user?.role || 'KEPALA_GUDANG'
  const menuItems = role === 'ADMIN' ? MENU_ADMIN : role === 'STAF_GUDANG' ? MENU_STAF : MENU_KEPALA

  const [dari, setDari] = useState('2026-10-01')
  const [sampai, setSampai] = useState('2026-10-29')
  const [tipeFilter, setTipeFilter] = useState('semua')
  const [rows] = useState(DUMMY_MUTASI)
  const [snackbar, setSnackbar] = useState('')

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function showSnack(msg) {
    setSnackbar(msg)
    setTimeout(() => setSnackbar(''), 3500)
  }

  function handleExport(format) {
    showSnack(`Mengunduh Laporan Mutasi (${format.toUpperCase()})...`)
    const header = 'WAKTU,BARANG,SKU,RAK,TIPE,JUMLAH,STAF,SEBELUM,SESUDAH\n'
    const csvContent = rows
      .map((r) => `"${r.waktu}","${r.barang}","${r.sku}","${r.rak}","${r.tipe}",${r.jumlah},"${r.staf}",${r.sebelum},${r.sesudah}`)
      .join('\n')
    const blob = new Blob([header + csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-inventaris-wh01.${format === 'pdf' ? 'pdf' : 'csv'}`
    a.click()
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
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#6B7280]">{r.waktu}</td>
                  <td className="px-4 py-3">
                    <span className="block text-[13.5px] font-medium text-[#111827]">{r.barang}</span>
                    <span className="text-[12px] text-[#0037B0]">{r.sku}</span>
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
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada data mutasi untuk filter yang dipilih.
                  </td>
                </tr>
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
