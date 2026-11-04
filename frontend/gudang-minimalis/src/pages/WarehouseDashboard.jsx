
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import Sidebar from '../components/Sidebar'
import KepalaGudangHeader from '../components/KepalaGudangHeader'
import { useWarehouse } from '../context/WarehouseContext'
import { KEPALA_MENU } from '../data/kepalaGudang'

import logoutIcon from '../assets/kepala-gudang/logout.svg'
import kritisExclamationIcon from '../assets/kepala-gudang/kritis-exclamation.svg'
import reviewIcon from '../assets/kepala-gudang/review-icon.svg'
import filterIcon from '../assets/kepala-gudang/filter.svg'
import downloadIcon from '../assets/kepala-gudang/download.svg'
import warningIcon from '../assets/kepala-gudang/warning.svg'
import restockIcon from '../assets/kepala-gudang/restock.svg'
import arrowForwardIcon from '../assets/kepala-gudang/arrow-forward.svg'
import personIcon from '../assets/kepala-gudang/person.svg'
import trendingDownIcon from '../assets/kepala-gudang/trending-down.svg'
import visibilityIcon from '../assets/kepala-gudang/visibility.svg'
import checkCircleIcon from '../assets/kepala-gudang/check-circle-white.svg'
import checkBadgeIcon from '../assets/staff/check-badge.svg'

const criticalItems = [
  {
    id: 'BRG-001',
    rack: 'RAK A-12',
    name: 'Kabel LAN Cat6 50m',
    sku: 'BRG-001',
    stock: 3,
    remaining: '3 Dus',
    min: 'Kritis (Min. 5 Dus)',
  },
  {
    id: 'BRG-004',
    rack: 'RAK B-04',
    name: 'Switch Hub 8-Port Gigabit',
    sku: 'BRG-004',
    stock: 2,
    remaining: '2 Unit',
    min: 'Kritis (Min. 8 Unit)',
  },
]

export default function WarehouseDashboard() {
  const {
    approvalReports,
    approvedIds,
    approveReport,
    pendingApprovalCount,
  } = useWarehouse()
  const [restocked, setRestocked] = useState(() => new Set())
  const [sort, setSort] = useState('default')
  const [saringOpen, setSaringOpen] = useState(false)

  const sortedItems = useMemo(() => {
    const list = [...criticalItems]
    if (sort === 'stock') return list.sort((a, b) => a.stock - b.stock)
    if (sort === 'rack') return list.sort((a, b) => a.rack.localeCompare(b.rack))
    return list
  }, [sort])

  function requestRestock(id) {
    setRestocked((current) => new Set(current).add(id))
  }

  function exportCsv() {
    const header = ['Lokasi Rak', 'SKU', 'Nama Barang', 'Sisa Stok', 'Status']
    const rows = sortedItems.map((item) => [item.rack, item.sku, item.name, item.remaining, item.min])
    const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`
    const csv = [header, ...rows]
      .map((row) => row.map(escapeCell).join(','))
      .join('\r\n')

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'stok-kritis.csv'
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

        <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-8 px-8 pb-16 pt-6">
          {/* Sub-header & status deck */}
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-transparent pb-1">
            <div>
              <p className="font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                GUDANG WH-01 <span className="text-muted">/</span>{' '}
                <span className="text-brand">DASHBOARD PENGAWAS</span>
              </p>
              <h2 className="mt-1 text-2xl font-semibold leading-8 tracking-[-0.6px] text-ink">
                Ringkasan Operasional &amp; Pengawasan Inventaris
              </h2>
            </div>

            <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-1 shadow-sm">
              <span className="size-2 rounded-full bg-green" aria-hidden="true" />
              <span className="text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-ink">
                Semua Node Sinkron
              </span>
              <span aria-hidden="true" className="font-mono text-[11px] text-[#C4C5D7]">•</span>
              <span className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                Terakhir Diperbarui: 2 Menit Lalu
              </span>
            </div>
          </div>

          {/* Kartu metrik utama */}
          <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
            {/* Card: Barang stok kritis */}
            <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                  Barang Stok<br />Kritis
                </p>
                <span className="flex shrink-0 items-center gap-1 rounded-sm bg-[#FFDAD6] py-0.5 pl-2 pr-3 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#93000A]">
                  <img src={kritisExclamationIcon} alt="" className="h-[9px] w-auto" />
                  Perlu Restock<br />Segera
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1 whitespace-nowrap text-[#BA1A1A]">
                  <span className="text-[32px] font-semibold leading-10 tracking-[-0.8px]">3</span>
                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px]">Item Menipis</span>
                </div>
                <p className="mt-1 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Di bawah ambang batas minimum (≤ 5 unit)
                </p>
              </div>

              <div className="mt-3">
                <div
                  role="progressbar"
                  aria-label="Rasio stok kritis"
                  aria-valuenow={25}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-field"
                >
                  <div className="h-full w-1/4 rounded-full bg-[#BA1A1A]" />
                </div>
                <p className="mt-1 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted">
                  Rasio Kritis: 0.24% inventaris
                </p>
              </div>
            </div>

            {/* Card: Persetujuan opname */}
            <div className="flex flex-col justify-between overflow-hidden rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                  Persetujuan Opname
                </p>
                <span className="flex shrink-0 items-center gap-1 rounded-sm bg-[#DCE1FF] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#001551]">
                  <img src={reviewIcon} alt="" className="h-[10px] w-auto" />
                  Perlu Review
                </span>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1 whitespace-nowrap text-brand">
                  <span className="text-[32px] font-semibold leading-10 tracking-[-0.8px]">{pendingApprovalCount}</span>
                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px]">Laporan Masuk</span>
                </div>
                <p className="mt-1 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Hasil audit fisik siklus Oktober 2024
                </p>
              </div>

              <div className="mt-3 flex items-end justify-between gap-4 border-t border-transparent pt-1">
                <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                  Menunggu Verifikasi<br />Manajer
                </p>
                <p className="text-right font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-brand">
                  2 Menit<br />Lalu
                </p>
              </div>
            </div>
          </div>

          {/* Tabel peringatan stok kritis */}
          <div id="stok-kritis" className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                    Daftar Barang Stok Kritis (≤ 5 Unit)
                  </h3>
                  <span className="rounded-xl bg-[#FFDAD6] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-[#93000A]">
                    2 Prioritas
                  </span>
                </div>
                <p className="mt-1 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Item dengan kuantitas di bawah ambang batas aman operasional gudang saat ini.
                </p>
              </div>

              <div className="relative flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSaringOpen((open) => !open)}
                  aria-expanded={saringOpen}
                  aria-haspopup="menu"
                  className="flex items-center gap-1 rounded-sm bg-field px-3 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none transition hover:bg-chip focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <img src={filterIcon} alt="" className="h-2 w-auto" />
                  Saring
                </button>

                {saringOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Tutup menu saring"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setSaringOpen(false)}
                    />
                    <div
                      role="menu"
                      className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded border border-field bg-white py-1 shadow-lg"
                    >
                      {[
                        { value: 'default', label: 'Urutan bawaan' },
                        { value: 'stock', label: 'Sisa stok terendah' },
                        { value: 'rack', label: 'Nama rak A–Z' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          role="menuitemradio"
                          aria-checked={sort === option.value}
                          onClick={() => {
                            setSort(option.value)
                            setSaringOpen(false)
                          }}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs leading-4 transition hover:bg-field ${
                            sort === option.value ? 'font-semibold text-brand' : 'text-ink'
                          }`}
                        >
                          {option.label}
                          {sort === option.value && <span aria-hidden="true">✓</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={exportCsv}
                  className="flex items-center gap-1 rounded-sm bg-field px-3 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink outline-none transition hover:bg-chip focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <img src={downloadIcon} alt="" className="size-[10.667px]" />
                  Ekspor CSV
                </button>
              </div>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                    <th className="px-5 py-3 font-semibold">LOKASI RAK</th>
                    <th className="px-5 py-3 font-semibold">KODE SKU &amp; NAMA BARANG</th>
                    <th className="px-5 py-3 text-right font-semibold">SISA STOK</th>
                    <th className="px-5 py-3 font-semibold">STATUS STOK</th>
                    <th className="px-5 py-3 text-right font-semibold">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((item) => {
                    const isRestocked = restocked.has(item.id)

                    return (
                      <tr key={item.id} className="border-t border-field">
                        <td className="px-5 py-4 align-middle">
                          <span className="rounded-sm bg-[#E1E8FD] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.275px] text-ink">
                            {item.rack}
                          </span>
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <p className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                            {item.name}
                          </p>
                          <p className="font-mono text-xs leading-4 tracking-[0.12px] text-muted-dark">
                            {item.sku}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-right align-middle font-mono text-base font-medium leading-6 tracking-[-0.08px] text-[#BA1A1A]">
                          {item.remaining}
                        </td>
                        <td className="px-5 py-4 align-middle">
                          <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFDAD6] px-2 py-0.5 text-[11px] font-medium leading-[14px] tracking-[0.44px] text-[#93000A]">
                            <img src={warningIcon} alt="" className="h-[10px] w-auto" />
                            {item.min}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-middle">
                          <button
                            type="button"
                            disabled={isRestocked}
                            onClick={() => requestRestock(item.id)}
                            className={`inline-flex items-center gap-1 rounded-sm px-3 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] outline-none transition focus-visible:ring-2 focus-visible:ring-brand ${
                              isRestocked
                                ? 'cursor-default bg-[#89F5E7] text-[#00201D]'
                                : 'bg-brand-hover text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] hover:bg-brand'
                            }`}
                          >
                            {isRestocked ? (
                              <>
                                <img src={checkBadgeIcon} alt="" className="h-[7px] w-auto" />
                                Restock Diminta
                              </>
                            ) : (
                              <>
                                <img src={restockIcon} alt="" className="h-[13.333px] w-auto" />
                                Buat Pesanan / Restock
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3">
              <p className="font-mono text-xs leading-4 tracking-[0.12px] text-muted-dark">
                Menampilkan {sortedItems.length} dari 3 barang berstatus kritis
              </p>
              <Link
                to="/kepala-gudang/peringatan"
                className="flex items-center gap-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-brand hover:underline"
              >
                Lihat Semua Peringatan Stok
                <img src={arrowForwardIcon} alt="" className="size-[9.333px]" />
              </Link>
            </div>
          </div>

          {/* Panel persetujuan cepat opname */}
          <section className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="h-4 w-1.5 rounded-full bg-brand" />
                <h3 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                  Laporan Opname Menunggu Persetujuan
                </h3>
              </div>
              <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                Siklus Audit Harian: {pendingApprovalCount} Laporan Tertunda
              </p>
            </div>

            {pendingApprovalCount === 0 ? (
              <div className="rounded-lg border border-dashed border-[#DCE2F7] bg-white/60 p-8 text-center text-sm leading-5 text-muted">
                Semua laporan opname sudah Anda setujui. Tidak ada yang menunggu verifikasi.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {approvalReports
                  .filter((report) => !approvedIds.has(report.id))
                  .map((report) => (
                    <div
                      key={report.id}
                      className="flex items-center justify-between gap-5 rounded-lg bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-lg:flex-col max-lg:items-start"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-muted-dark">
                          <span className="rounded-sm bg-[#E1E8FD] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-ink">
                            {report.rack}
                          </span>
                          <span className="font-mono text-xs leading-4 tracking-[0.12px]">
                            {report.sku}
                          </span>
                          <span aria-hidden="true" className="text-base text-[#C4C5D7]">•</span>
                          <span className="font-mono text-xs leading-4 tracking-[0.12px]">
                            {report.dateTime}
                          </span>
                          <span aria-hidden="true" className="text-base text-[#C4C5D7]">•</span>
                          <span className="flex items-center gap-1 text-xs leading-4 tracking-[0.12px]">
                            <img src={personIcon} alt="" className="size-[9.333px]" />
                            {report.auditor}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                            {report.title}
                          </p>
                          <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFDAD6] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-[#93000A]">
                            <img src={trendingDownIcon} alt="" className="h-[6px] w-auto" />
                            {report.diff}
                          </span>
                        </div>

                        <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                          {report.note}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
                        <Link
                          to="/kepala-gudang/persetujuan"
                          className="flex items-center justify-center gap-1 rounded-sm bg-white px-3 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <img src={visibilityIcon} alt="" className="h-[10px] w-auto" />
                          Detail Selisih
                        </Link>
                        <button
                          type="button"
                          onClick={() => approveReport(report.id)}
                          className="flex items-center justify-center gap-1 rounded-sm bg-brand-hover px-3 py-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          <img src={checkCircleIcon} alt="" className="size-[13.333px]" />
                          Tinjau &amp; Setujui
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
