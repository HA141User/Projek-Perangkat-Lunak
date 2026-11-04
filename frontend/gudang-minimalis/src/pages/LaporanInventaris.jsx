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

import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'
import KepalaGudangHeader from '../components/KepalaGudangHeader'
import { KEPALA_MENU } from '../data/kepalaGudang'

import logoutIcon from '../assets/kepala-gudang/logout.svg'
import breadcrumbChevronIcon from '../assets/kepala-gudang/breadcrumb-chevron.svg'
import filePdfIcon from '../assets/kepala-gudang/file-pdf.svg'
import fileExcelIcon from '../assets/kepala-gudang/file-excel.svg'
import calendarIcon from '../assets/kepala-gudang/calendar.svg'
import filterChevronIcon from '../assets/kepala-gudang/filter-chevron.svg'
import shelvesIcon from '../assets/kepala-gudang/shelves.svg'
import categoryIcon from '../assets/kepala-gudang/category.svg'
import searchIcon from '../assets/kepala-gudang/search.svg'
import resetIcon from '../assets/kepala-gudang/reset.svg'
import arrowDownIcon from '../assets/kepala-gudang/arrow-down.svg'
import arrowUpIcon from '../assets/kepala-gudang/arrow-up.svg'
import swapHorizIcon from '../assets/kepala-gudang/swap-horiz.svg'
import chevronLeftIcon from '../assets/kepala-gudang/chevron-left-sm.svg'
import chevronRightIcon from '../assets/staff/chevron-row.svg'

const DATE_RANGES = [
  { value: 'week', label: '01 Okt 2026 - 07 Okt 2026' },
  { value: 'september', label: '01 Sep 2026 - 30 Sep 2026' },
  { value: 'quarter', label: '01 Jul 2026 - 30 Sep 2026' },
]

const RACK_OPTIONS = ['Semua Rak', 'RAK A-12', 'RAK B-04', 'RAK A-18', 'RAK A-22']
const CATEGORY_OPTIONS = ['Semua Kategori', 'Jaringan', 'Perangkat Aktif', 'Aksesoris Listrik', 'Kabel Fiber']

const LEDGER_ROWS = [
  { sku: 'BRG-001', name: 'Kabel LAN Cat6 50m', category: 'Jaringan', rack: 'RAK A-12', stockStart: '10 Dus', inQty: '+5 Dus', outQty: '-12 Dus', stockEnd: '3 Dus', status: 'Kritis' },
  { sku: 'BRG-004', name: 'Switch Hub 8-Port Gigabit', category: 'Perangkat Aktif', rack: 'RAK B-04', stockStart: '15 Unit', inQty: '+2 Unit', outQty: '-15 Unit', stockEnd: '2 Unit', status: 'Kritis' },
  { sku: 'BRG-012', name: 'Adaptor Power 12V 2A', category: 'Aksesoris Listrik', rack: 'RAK A-18', stockStart: '30 Pcs', inQty: '+50 Pcs', outQty: '-38 Pcs', stockEnd: '42 Pcs', status: 'Aman' },
  { sku: 'BRG-025', name: 'Patch Cord Fiber Optic 3m', category: 'Kabel Fiber', rack: 'RAK A-22', stockStart: '25 Dus', inQty: '+20 Dus', outQty: '-18 Dus', stockEnd: '27 Dus', status: 'Aman' },
]

const TOTAL_LEDGER_ENTRIES = 48
const TOTAL_PAGES = 12

export default function LaporanInventaris() {
  const [dateRange, setDateRange] = useState('week')
  const [rack, setRack] = useState('Semua Rak')
  const [category, setCategory] = useState('Semua Kategori')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const searchRef = useRef(null)

  // Pintasan ⌘K / Ctrl+K untuk fokus ke pencarian
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()

    // Data mock hanya tersedia di halaman 1 (desain memuat 4 dari 48 entri)
    if (page !== 1) return []

    return LEDGER_ROWS.filter((row) => {
      if (rack !== 'Semua Rak' && row.rack !== rack) return false
      if (category !== 'Semua Kategori' && row.category !== category) return false
      if (!q) return true
      return [row.sku, row.name, row.category, row.rack].join(' ').toLowerCase().includes(q)
    })
  }, [rack, category, search, page])

  const visibleCount = page === 1 ? filteredRows.length : 0

  function resetFilters() {
    setDateRange('week')
    setRack('Semua Rak')
    setCategory('Semua Kategori')
    setSearch('')
    setPage(1)
  }

  function exportExcel() {
    const header = ['SKU', 'Nama Barang', 'Kategori', 'Lokasi Rak', 'Stok Awal', 'Masuk (+)', 'Keluar (-)', 'Stok Akhir', 'Status']
    const rows = filteredRows.map((row) => [
      row.sku,
      row.name,
      row.category,
      row.rack,
      row.stockStart,
      row.inQty,
      row.outQty,
      row.stockEnd,
      row.status === 'Kritis' ? 'Stok Kritis' : 'Aman',
    ])

    const escapeHtml = (value) =>
      String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

    const html = `<table border="1"><thead><tr>${header
      .map((cell) => `<th>${escapeHtml(cell)}</th>`)
      .join('')}</tr></thead><tbody>${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`,
      )
      .join('')}</tbody></table>`

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'rekap-mutasi-stok.xls'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen bg-[#F9F9FF] max-md:flex-col">
      <Sidebar
        items={KEPALA_MENU}
        wide
        activeStyle="solid"
        logoutIcon={logoutIcon}
        logoutLabel="Keluar"
        logoutShortcut="Esc"
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <KepalaGudangHeader />

        <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-8 pb-16 pt-6">
          {/* Breadcrumb & status */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-1 font-mono text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
              LAPORAN INVENTARIS
              <img src={breadcrumbChevronIcon} alt="" className="h-[7px] w-auto" />
              <span className="text-brand">REKAPITULASI MUTASI STOK</span>
            </p>
            <span className="flex items-center gap-1 text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
              <span className="size-2 rounded-full bg-[#316BF3]" aria-hidden="true" />
              <span className="font-mono">Sinkronisasi Otomatis • WH-01</span>
            </span>
          </div>

          {/* Judul & aksi ekspor */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.8px] text-ink">
                Laporan &amp; Rekapitulasi Inventaris
              </h2>
              <p className="mt-1 text-sm leading-5 text-muted-dark">
                Ringkasan pergerakan stok barang masuk, keluar, dan penyesuaian saldo akhir periode.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1 rounded bg-white px-3 py-2 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={filePdfIcon} alt="" className="size-[15px]" />
                Ekspor PDF
              </button>
              <button
                type="button"
                onClick={exportExcel}
                className="flex items-center gap-1 rounded bg-brand-hover px-3 py-2 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={fileExcelIcon} alt="" className="size-[15px]" />
                Ekspor Excel
              </button>
            </div>
          </div>

          {/* Filter deck */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter rentang tanggal */}
              <div className="relative">
                <label htmlFor="date-range" className="sr-only">
                  Rentang periode
                </label>
                <select
                  id="date-range"
                  value={dateRange}
                  onChange={(event) => setDateRange(event.target.value)}
                  className="appearance-none rounded bg-field py-2 pl-10 pr-8 font-mono text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none focus:ring-1 focus:ring-brand"
                >
                  {DATE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <img
                  src={calendarIcon}
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-auto -translate-y-1/2"
                />
                <img
                  src={filterChevronIcon}
                  alt=""
                  className="pointer-events-none absolute right-3 top-1/2 h-[4.933px] w-auto -translate-y-1/2"
                />
              </div>

              {/* Filter rak */}
              <div className="relative">
                <label htmlFor="rack-filter" className="sr-only">
                  Lokasi rak
                </label>
                <select
                  id="rack-filter"
                  value={rack}
                  onChange={(event) => {
                    setRack(event.target.value)
                    setPage(1)
                  }}
                  className="appearance-none rounded bg-field py-2 pl-10 pr-8 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none focus:ring-1 focus:ring-brand"
                >
                  {RACK_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <img
                  src={shelvesIcon}
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-[16.5px] w-auto -translate-y-1/2"
                />
                <img
                  src={filterChevronIcon}
                  alt=""
                  className="pointer-events-none absolute right-3 top-1/2 h-[4.933px] w-auto -translate-y-1/2"
                />
              </div>

              {/* Filter kategori */}
              <div className="relative">
                <label htmlFor="category-filter" className="sr-only">
                  Kategori barang
                </label>
                <select
                  id="category-filter"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value)
                    setPage(1)
                  }}
                  className="appearance-none rounded bg-field py-2 pl-10 pr-8 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none focus:ring-1 focus:ring-brand"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <img
                  src={categoryIcon}
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-auto -translate-y-1/2"
                />
                <img
                  src={filterChevronIcon}
                  alt=""
                  className="pointer-events-none absolute right-3 top-1/2 h-[4.933px] w-auto -translate-y-1/2"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Pencarian cepat */}
              <div className="flex items-center rounded bg-field px-3 py-1.5">
                <img src={searchIcon} alt="" className="h-[13.5px] w-auto shrink-0" />
                <label htmlFor="ledger-search" className="sr-only">
                  Cari SKU / Nama
                </label>
                <input
                  ref={searchRef}
                  id="ledger-search"
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(1)
                  }}
                  placeholder="Cari SKU / Nama..."
                  autoComplete="off"
                  className="w-40 min-w-0 bg-transparent px-2 text-xs leading-5 text-ink outline-none placeholder:text-muted sm:w-48"
                />
                <kbd className="shrink-0 rounded-sm bg-white px-1 font-mono text-[10px] leading-[16px] text-muted-dark">
                  ⌘K
                </kbd>
              </div>

              {/* Reset filter */}
              <button
                type="button"
                onClick={resetFilters}
                aria-label="Atur ulang filter"
                title="Atur ulang filter"
                className="grid place-items-center rounded p-1 outline-none transition hover:bg-field focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={resetIcon} alt="" className="size-[13.333px]" />
              </button>
            </div>
          </div>

          {/* Kartu metrik ringkasan */}
          <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div>
                <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                  TOTAL BARANG MASUK
                </p>
                <p className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[32px] font-semibold leading-10 tracking-[-0.64px] text-ink">120</span>
                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">Dus</span>
                </p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded bg-field">
                <img src={arrowDownIcon} alt="" className="size-[13.75px]" />
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div>
                <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                  TOTAL BARANG KELUAR
                </p>
                <p className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[32px] font-semibold leading-10 tracking-[-0.64px] text-ink">85</span>
                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">Dus</span>
                </p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded bg-field">
                <img src={arrowUpIcon} alt="" className="size-[13.75px]" />
              </div>
            </div>

            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div>
                <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                  TOTAL TRANSAKSI
                </p>
                <p className="mt-1 flex items-baseline gap-2 whitespace-nowrap">
                  <span className="text-[32px] font-semibold leading-10 tracking-[-0.64px] text-ink">45</span>
                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">Transaksi</span>
                </p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded bg-field">
                <img src={swapHorizIcon} alt="" className="h-[16.5px] w-auto" />
              </div>
            </div>
          </div>

          {/* Tabel mutasi stok detail */}
          <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[rgba(241,243,255,0.4)] px-5 py-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                  Mutasi Stok Detail
                </h3>
                <span className="rounded bg-[#E1E8FD] px-1.5 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                  {visibleCount} ITEM TERFILTER
                </span>
              </div>
              <p className="flex items-center gap-1 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark">
                <span className="size-2 rounded-full bg-[#0051D5]" aria-hidden="true" />
                Ambang Batas Kritis: ≤ 5 Unit
              </p>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                    <th className="px-5 py-3 font-semibold">SKU &amp; NAMA BARANG</th>
                    <th className="px-3 py-3 font-semibold">LOKASI RAK</th>
                    <th className="px-3 py-3 text-right font-semibold">STOK AWAL</th>
                    <th className="px-3 py-3 text-right font-semibold">MASUK (+)</th>
                    <th className="px-3 py-3 text-right font-semibold">KELUAR (-)</th>
                    <th className="px-3 py-3 text-right font-semibold">STOK AKHIR</th>
                    <th className="px-3 py-3 text-center font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => {
                    const isCritical = row.status === 'Kritis'

                    return (
                      <tr key={row.sku} className="border-t border-chip">
                        <td className="px-5 py-4 align-middle">
                          <p className="flex flex-wrap items-baseline gap-1">
                            <span className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-brand">
                              {row.sku}
                            </span>
                            <span className="text-sm font-semibold leading-5 text-ink">
                              {row.name}
                            </span>
                          </p>
                          <p className="mt-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark">
                            Kategori: {row.category}
                          </p>
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <span className="inline-flex rounded bg-[#E1E8FD] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-ink">
                            {row.rack}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-right align-middle font-mono text-sm leading-5 text-muted-dark">
                          {row.stockStart}
                        </td>
                        <td className="px-3 py-4 text-right align-middle font-mono text-sm font-medium leading-5 text-green">
                          {row.inQty}
                        </td>
                        <td className="px-3 py-4 text-right align-middle font-mono text-sm font-medium leading-5 text-[#BA1A1A]">
                          {row.outQty}
                        </td>
                        <td className="px-3 py-4 text-right align-middle font-mono text-base font-medium leading-6 tracking-[-0.08px] text-ink">
                          {row.stockEnd}
                        </td>
                        <td className="px-3 py-4 text-center align-middle">
                          {isCritical ? (
                            <span className="inline-flex items-center gap-1 rounded bg-[#FFDAD6] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#93000A]">
                              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#BA1A1A]" />
                              Stok Kritis
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-[#E1E8FD] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-green">
                              <span aria-hidden="true" className="size-1.5 rounded-full bg-green" />
                              Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {visibleCount === 0 && (
                    <tr className="border-t border-chip">
                      <td colSpan={7} className="px-5 py-10 text-center text-sm leading-5 text-muted">
                        {page !== 1
                          ? `Halaman ${page} belum memiliki entri pada data mock ini — desain hanya memuat 4 dari 48 entri (halaman 1).`
                          : 'Tidak ada entri yang cocok dengan filter yang dipilih.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer tabel & paginasi */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-field bg-white px-5 py-3">
              <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                Menampilkan{' '}
                <strong className="font-semibold text-ink">{visibleCount}</strong> dari{' '}
                <strong className="font-semibold text-ink">{TOTAL_LEDGER_ENTRIES}</strong> entri barang dalam periode terpilih
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  className="flex items-center gap-1 rounded bg-field px-2 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark outline-none transition enabled:hover:bg-chip disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <img src={chevronLeftIcon} alt="" className="h-2 w-auto" />
                  Sebelumnya
                </button>

                {[1, 2, 3, 'ellipsis', 12].map((entry) =>
                  entry === 'ellipsis' ? (
                    <span
                      key="ellipsis"
                      aria-hidden="true"
                      className="px-1 font-mono text-[13px] font-medium leading-[18px] text-muted-dark"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={entry}
                      type="button"
                      onClick={() => setPage(entry)}
                      aria-current={page === entry ? 'page' : undefined}
                      className={`grid size-8 place-items-center rounded text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-brand ${
                        page === entry
                          ? 'bg-brand font-semibold text-white'
                          : 'bg-field font-medium text-ink hover:bg-chip'
                      }`}
                    >
                      {entry}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  disabled={page === TOTAL_PAGES}
                  onClick={() => setPage((current) => Math.min(TOTAL_PAGES, current + 1))}
                  className="flex items-center gap-1 rounded bg-field px-2 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none transition enabled:hover:bg-chip disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Selanjutnya
                  <img src={chevronRightIcon} alt="" className="h-2 w-auto" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
