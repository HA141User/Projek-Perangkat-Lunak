
import { useState } from 'react'
import { Link } from 'react-router'
import Sidebar from '../components/Sidebar'
import KepalaGudangHeader from '../components/KepalaGudangHeader'
import { useWarehouse } from '../context/WarehouseContext'
import { KEPALA_MENU } from '../data/kepalaGudang'

import logoutIcon from '../assets/kepala-gudang/logout.svg'
import breadcrumbIcon from '../assets/kepala-gudang/breadcrumb-icon.svg'
import chevronRightIcon from '../assets/kepala-gudang/chevron-right.svg'
import personReportIcon from '../assets/kepala-gudang/person-report.svg'
import scheduleIcon from '../assets/staff/schedule.svg'
import locationPinIcon from '../assets/kepala-gudang/location-pin.svg'
import inventoryTileIcon from '../assets/kepala-gudang/inventory-tile.svg'
import ringChartIcon from '../assets/kepala-gudang/ring-chart.svg'
import checkVerifiedIcon from '../assets/kepala-gudang/check-verified.svg'
import alertBellIcon from '../assets/kepala-gudang/alert-bell.svg'
import clipboardCheckIcon from '../assets/kepala-gudang/clipboard-check.svg'
import trendDownIcon from '../assets/kepala-gudang/trend-down-small.svg'
import warningTriangleIcon from '../assets/kepala-gudang/warning-triangle.svg'
import checkSmallGreenIcon from '../assets/kepala-gudang/check-small-green.svg'
import sealCheckIcon from '../assets/kepala-gudang/seal-check.svg'
import infoFooterIcon from '../assets/kepala-gudang/info-footer.svg'
import chevronDownIcon from '../assets/kepala-gudang/chevron-down-sm.svg'
import editNoteIcon from '../assets/kepala-gudang/edit-note.svg'
import rejectIcon from '../assets/kepala-gudang/reject.svg'
import checkCircleApproveIcon from '../assets/kepala-gudang/check-circle-approve.svg'

export default function PersetujuanOpname() {
  const { approveReport } = useWarehouse()
  const [note, setNote] = useState('')
  const [showAllItems, setShowAllItems] = useState(false)
  const [outcome, setOutcome] = useState(null) // 'approved' | 'rejected' | null

  function handleReject() {
    setOutcome('rejected')
  }

  function handleApprove() {
    approveReport('a1')
    setOutcome('approved')
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

        <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-6 px-8 pb-24 pt-6">
          {/* Breadcrumb & dokumen */}
          <div className="flex flex-col gap-2">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1">
              <Link
                to="/kepala-gudang"
                className="flex items-center gap-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark hover:text-ink"
              >
                <img src={breadcrumbIcon} alt="" className="h-3 w-auto" />
                Persetujuan Opname
              </Link>
              <img src={chevronRightIcon} alt="" className="h-[7px] w-auto" />
              <span className="rounded-sm bg-chip px-1 py-0.5 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-ink">
                AUDIT-RAK-A12
              </span>
            </nav>

            <p className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-mono text-[11px] font-medium uppercase leading-[14px] tracking-[1.1px] text-brand">
                DOKUMEN VERIFIKASI OPNAME
              </span>
              <span aria-hidden="true" className="size-1.5 rounded-full bg-[#C4C5D7]" />
              <span className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                BATCH #OPN-2026-X12
              </span>
            </p>

            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.6px] text-ink">
              Detail Laporan Opname - RAK A-12
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs leading-4 tracking-[0.12px] text-muted-dark">
              <span className="flex items-center gap-1.5">
                <img src={personReportIcon} alt="" className="size-[13.333px]" />
                Dilaporkan oleh:{' '}
                <strong className="font-medium text-ink">Budi Santoso (Staf Gudang Zona A)</strong>
              </span>
              <span aria-hidden="true" className="text-[#C4C5D7]">•</span>
              <span className="flex items-center gap-1.5 font-mono">
                <img src={scheduleIcon} alt="" className="size-[13.333px]" />
                07 Oktober 2026, 10:45 WIB
              </span>
              <span aria-hidden="true" className="text-[#C4C5D7]">•</span>
              <span className="flex items-center gap-1.5 font-mono">
                <img src={locationPinIcon} alt="" className="h-[13.333px] w-auto" />
                KORIDOR 02 • SEKTOR LOGISTIK-B
              </span>
            </div>
          </div>

          {/* Kartu ringkasan */}
          <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
            {/* Total item diperiksa */}
            <div className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                    TOTAL ITEM DIPERIKSA
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
                    <span className="text-[32px] font-semibold leading-10 tracking-[-0.8px] text-ink">10</span>
                    <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">
                      Item SKU
                    </span>
                  </p>
                </div>
                <div className="grid size-10 shrink-0 place-items-center rounded bg-field">
                  <img src={inventoryTileIcon} alt="" className="size-[18.333px]" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-3">
                <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  1 klaster rak dievaluasi
                </p>
                <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted">
                  100% Selesai Cek
                </p>
              </div>
              <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-1 bg-chip" />
            </div>

            {/* Stok sesuai */}
            <div className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-[#047857]">
                    STOK SESUAI
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
                    <span className="text-[32px] font-semibold leading-10 tracking-[-0.8px] text-[#047857]">9</span>
                    <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">
                      Item Valid
                    </span>
                  </p>
                </div>
                <div
                  role="img"
                  aria-label="Akurasi 90 persen"
                  className="relative grid size-11 shrink-0 place-items-center"
                >
                  <img src={ringChartIcon} alt="" className="absolute inset-0 size-full -rotate-90" />
                  <span className="font-mono text-[10px] font-medium leading-[15px] text-[#065F46]">
                    90%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 pt-3">
                <img src={checkVerifiedIcon} alt="" className="h-[14px] w-auto" />
                <p className="text-xs leading-4 tracking-[0.12px] text-[#047857]">
                  Kesesuaian fisik dan digital sinkron
                </p>
              </div>
              <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-1 bg-[#10B981]" />
            </div>

            {/* Stok berselisih */}
            <div className="relative flex flex-col justify-between gap-3 overflow-hidden rounded-lg bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-[#BA1A1A]">
                    STOK BERSELISIH
                  </p>
                  <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap">
                    <span className="text-[32px] font-semibold leading-10 tracking-[-0.8px] text-[#BA1A1A]">1</span>
                    <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-muted-dark">
                      Item Selisih
                    </span>
                  </p>
                </div>
                <div className="grid size-10 shrink-0 place-items-center rounded bg-[#FFDAD6]">
                  <img src={alertBellIcon} alt="" className="h-[18.333px] w-auto" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-3">
                <span className="flex items-center gap-1 rounded-sm bg-[#FFDAD6] px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#93000A]">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-[#BA1A1A]" />
                  Perlu Penyesuaian
                </span>
                <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.12px] text-[#BA1A1A]">
                  -2 Dus (Defisit)
                </p>
              </div>
              <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-1 bg-[#BA1A1A]" />
            </div>
          </div>

          {/* Tabel komparasi stok fisik */}
          <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h3 className="text-xl font-semibold leading-7 tracking-[-0.5px] text-ink">
                  Rincian Komparasi Stok Fisik
                </h3>
                <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Daftar rekonsiliasi manual antara data sistem gudang dan temuan hitung aktual petugas.
                </p>
              </div>
              <span className="shrink-0 rounded-sm bg-field px-3 py-1 font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-ink">
                BIN LOC: [RAK-A12-LV3]
              </span>
            </div>

            <div className="overflow-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                    <th className="px-5 py-4 font-semibold">SKU &amp; NAMA BARANG</th>
                    <th className="px-3 py-4 text-right font-semibold">STOK SISTEM</th>
                    <th className="px-3 py-4 text-right font-semibold">HITUNG FISIK</th>
                    <th className="px-3 py-4 text-center font-semibold">SELISIH</th>
                    <th className="px-5 py-4 font-semibold">KONDISI &amp; CATATAN STAF</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 1: Bermasalah — disorot mint */}
                  <tr className="bg-[rgba(255,241,242,0.4)]">
                    <td className="px-5 py-5 align-top">
                      <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-brand">
                        BRG-001
                      </p>
                      <p className="mt-0.5 text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                        Kabel LAN Cat6 50m
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark">
                        Kategori: Jaringan &amp; Perkabelan
                      </p>
                    </td>
                    <td className="px-3 py-5 text-right align-top">
                      <p className="font-mono text-sm font-medium leading-5 text-muted-dark">5 Dus</p>
                      <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted">Buku Utama</p>
                    </td>
                    <td className="px-3 py-5 text-right align-top">
                      <p className="flex items-center justify-end gap-1 font-mono text-base font-medium leading-6 text-ink">
                        <img src={clipboardCheckIcon} alt="" className="h-[10.667px] w-auto" />
                        3 Dus
                      </p>
                      <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                        Pencacahan Manual
                      </p>
                    </td>
                    <td className="px-3 py-5 text-center align-top">
                      <span className="inline-flex items-center gap-1 rounded-sm bg-[#FFDAD6] px-3 py-1 font-mono text-[13px] font-medium leading-[18px] tracking-[0.13px] text-[#93000A] shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                        <img src={trendDownIcon} alt="" className="size-[9.333px]" />
                        -2 Dus
                      </span>
                      <p className="mt-1 text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] text-[#BA1A1A]">
                        DEFISIT
                      </p>
                    </td>
                    <td className="px-5 py-5 align-top">
                      <div className="max-w-[280px] rounded bg-white p-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
                        <p className="flex items-center gap-1 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#BA1A1A]">
                          <img src={warningTriangleIcon} alt="" className="h-[11px] w-auto" />
                          Anomali Kerusakan
                        </p>
                        <p className="mt-1 text-xs leading-[19.5px] tracking-[0.12px] text-ink">
                          2 dus kemasan basah/rusak di rak (dialihkan sementara ke area karantina).
                        </p>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2: Valid */}
                  <tr className="border-t border-field bg-white">
                    <td className="px-5 py-5 align-top">
                      <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted">
                        BRG-004
                      </p>
                      <p className="mt-0.5 text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                        Switch Hub 8-Port Gigabit
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark">
                        Kategori: Perangkat Aktif
                      </p>
                    </td>
                    <td className="px-3 py-5 text-right align-top">
                      <p className="font-mono text-sm font-medium leading-5 text-muted-dark">8 Unit</p>
                      <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted">Buku Utama</p>
                    </td>
                    <td className="px-3 py-5 text-right align-top">
                      <p className="flex items-center justify-end gap-1 font-mono text-base font-medium leading-6 text-ink">
                        <img src={checkSmallGreenIcon} alt="" className="h-[8px] w-auto" />
                        8 Unit
                      </p>
                      <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                        Pencacahan Manual
                      </p>
                    </td>
                    <td className="px-3 py-5 text-center align-top">
                      <span className="inline-flex items-center justify-center rounded-sm bg-[#ECFDF5] px-3 py-1 font-mono text-[13px] font-medium leading-[18px] tracking-[0.13px] text-[#047857]">
                        0 (Sesuai)
                      </span>
                      <p className="mt-1 text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] text-[#059669]">
                        VALID
                      </p>
                    </td>
                    <td className="px-5 py-5 align-top">
                      <div className="max-w-[280px] rounded bg-field p-2">
                        <p className="flex items-center gap-1 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-[#047857]">
                          <img src={sealCheckIcon} alt="" className="size-[11.667px]" />
                          Lolos Inspeksi
                        </p>
                        <p className="mt-1 text-xs leading-[19.5px] tracking-[0.12px] text-ink">
                          Kondisi fisik prima, segel pabrik utuh tanpa cacat.
                        </p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Catatan mock untuk 8 item lainnya */}
            {showAllItems && (
              <div className="flex items-center justify-between gap-3 border-t border-field bg-white px-5 py-2">
                <p className="text-xs leading-4 tracking-[0.12px] text-muted">
                  8 item lainnya berstatus Sesuai dan tidak ditampilkan — data tidak tersedia di mock desain.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAllItems(false)}
                  className="shrink-0 text-xs font-medium text-brand hover:underline"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Footer tabel */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-field px-3 py-3">
              <p className="flex items-center gap-1.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                <img src={infoFooterIcon} alt="" className="h-[13.5px] w-auto" />
                Menampilkan 2 dari total 10 item dalam berkas RAK A-12 (8 item lain berstatus Sesuai).
              </p>
              <button
                type="button"
                onClick={() => setShowAllItems((open) => !open)}
                aria-expanded={showAllItems}
                className="flex shrink-0 items-center gap-1 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
              >
                Tampilkan Seluruh 10 Item
                <img src={chevronDownIcon} alt="" className="h-[4.933px] w-auto" />
              </button>
            </div>
          </div>

          {/* Catatan verifikasi kepala gudang */}
          <div className="rounded-lg bg-white p-6 shadow-[0_1px_1px_rgba(0,0,0,0.05)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="grid size-8 shrink-0 place-items-center rounded bg-[#E1E8FD]">
                  <img src={editNoteIcon} alt="" className="h-3 w-auto" />
                </div>
                <div>
                  <h3 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
                    Catatan Verifikasi &amp; Instruksi Kepala Gudang
                  </h3>
                  <p className="mt-0.5 text-xs leading-4 tracking-[0.12px] text-muted-dark">
                    Opsional: Instruksi pemindahan barang, nomor memo karantina, atau pertimbangan persetujuan.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-sm bg-chip px-2 py-0.5 font-mono text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark max-sm:hidden">
                LOG AUDIT OTOMATIS
              </span>
            </div>

            <label htmlFor="catatan-kepala" className="sr-only">
              Instruksi penyesuaian
            </label>
            <textarea
              id="catatan-kepala"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tuliskan instruksi penyesuaian (misal: '2 dus Kabel LAN dipindahkan ke karantina retur vendor, sesuaikan stok buku menjadi 3 dus')..."
              className="mt-4 min-h-[84px] w-full resize-y rounded bg-field p-3 text-sm leading-5 text-ink outline-none placeholder:text-muted focus:ring-1 focus:ring-brand"
            />
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted-dark">
                Catatan ini akan ditempelkan permanen pada log riwayat SKU BRG-001.
              </p>
              <p className="font-mono text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                {note.length} / 500
              </p>
            </div>
          </div>

          {outcome === 'approved' && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded border border-[rgba(107,216,203,0.4)] bg-[rgba(137,245,231,0.2)] px-4 py-2"
            >
              <p className="text-xs leading-4 text-green">
                Laporan disetujui &amp; stok sistem disesuaikan (simulasi — belum terhubung ke backend).
              </p>
              <button
                type="button"
                onClick={() => setOutcome(null)}
                className="shrink-0 text-xs font-medium text-green underline"
              >
                Tutup
              </button>
            </div>
          )}

          {outcome === 'rejected' && (
            <div
              role="status"
              className="flex items-center justify-between gap-3 rounded border border-[rgba(186,26,26,0.25)] bg-[#FFF1F2] px-4 py-2"
            >
              <p className="text-xs leading-4 text-[#BA1A1A]">
                Laporan ditolak. Staf akan diberitahu untuk melakukan hitung ulang (simulasi — belum terhubung ke backend).
              </p>
              <button
                type="button"
                onClick={() => setOutcome(null)}
                className="shrink-0 text-xs font-medium text-[#BA1A1A] underline"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Deck aksi bawah */}
          <div className="flex flex-wrap items-center justify-end gap-3 rounded-lg border border-field bg-white/95 p-4 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] max-sm:justify-stretch">
            <button
              type="button"
              onClick={handleReject}
              className="flex items-center justify-center gap-2 rounded bg-[rgba(255,218,214,0.6)] px-5 py-2.5 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-[#BA1A1A] outline-none transition hover:bg-[#FFDAD6] focus-visible:ring-2 focus-visible:ring-brand max-sm:flex-1"
            >
              <img src={rejectIcon} alt="" className="h-[15px] w-auto" />
              Tolak &amp; Minta Hitung Ulang
            </button>
            <button
              type="button"
              onClick={handleApprove}
              className="flex items-center justify-center gap-2 rounded bg-brand-hover px-8 py-2.5 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] outline-none transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand max-sm:flex-1"
            >
              <img src={checkCircleApproveIcon} alt="" className="h-[15.75px] w-auto" />
              Setujui &amp; Sesuaikan Stok Sistem
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
