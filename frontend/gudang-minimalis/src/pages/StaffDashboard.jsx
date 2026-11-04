import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Download, Upload, ArrowRight } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Sidebar from '../components/Sidebar'

import logoutIcon from '../assets/staff/logout.svg'
import scannerReady from '../assets/staff/scanner-ready.svg'
import bellIcon from '../assets/staff/bell.svg'
import masukBarangIcon from '../assets/staff/masuk-barang.svg'
import keluarBarangIcon from '../assets/staff/keluar-barang.svg'
import scanChipIcon from '../assets/staff/scan-chip.svg'
import arrowMasuk from '../assets/staff/arrow-masuk.svg'
import arrowKeluar from '../assets/staff/arrow-keluar.svg'
import arrowLog from '../assets/staff/arrow-log.svg'
import scheduleIcon from '../assets/staff/schedule.svg'
import rackIcon1 from '../assets/staff/rack-1.svg'
import rackIcon2 from '../assets/staff/rack-2.svg'
import modalQrIcon from '../assets/staff/modal-qr.svg'
import closeIcon from '../assets/staff/close.svg'
import qrInstructionIcon from '../assets/staff/qr-instruction.svg'
import checkCircleIcon from '../assets/staff/check-circle.svg'
import inventoryBoxIcon from '../assets/staff/inventory-box.svg'
import calculateIcon from '../assets/staff/calculate.svg'
import descriptionIcon from '../assets/staff/description.svg'
import checkSmallIcon from '../assets/staff/check-small.svg'

const menu = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const DUMMY_TRANSACTIONS = [
  { id: 1, waktu: '09:14:02', rak: 'A-03', tipe: 'IN', jumlah: 24 },
  { id: 2, waktu: '09:02:47', rak: 'B-11', tipe: 'OUT', jumlah: 6 },
  { id: 3, waktu: '08:55:30', rak: 'C-07', tipe: 'IN', jumlah: 48 },
  { id: 4, waktu: '08:40:12', rak: 'A-01', tipe: 'OUT', jumlah: 12 },
  { id: 5, waktu: '08:22:58', rak: 'D-02', tipe: 'IN', jumlah: 100 },
  { id: 6, waktu: '08:10:35', rak: 'B-05', tipe: 'OUT', jumlah: 3 },
]

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <AppShell
      menuItems={menu}
      userName={user?.name || 'Staf Gudang'}
      onLogout={handleLogout}
      pageTitle="Dashboard Operasional Staf"
    >
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#111827]">Dashboard Operasional Staf</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Rekam transaksi barang masuk dan keluar serta pantau riwayat harian.
        </p>
      </div>

      {/* Action Cards */}
      <div className="mb-6 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
        {/* Barang Masuk */}
        <Link
          to="/staff/masuk"
          className="group flex min-h-[140px] flex-col justify-between rounded-xl bg-[#0037B0] p-6 text-white transition hover:bg-[#1D4ED8]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-white/70">
                Barang Masuk
              </p>
              <h3 className="mt-2 text-[20px] font-semibold">Catat Penerimaan</h3>
              <p className="mt-1 text-[14px] text-white/70">
                Scan QR rak → input jumlah → simpan
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-white">
              <Download size={22} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-white/80 group-hover:text-white">
            Mulai Pencatatan <ArrowRight size={15} />
          </div>
        </Link>

        {/* Barang Keluar */}
        <Link
          to="/staff/keluar"
          className="group flex min-h-[140px] flex-col justify-between rounded-xl bg-[#111827] p-6 text-white transition hover:bg-[#1f2937]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-white/70">
                Barang Keluar
              </p>
              <h3 className="mt-2 text-[20px] font-semibold">Catat Pengeluaran</h3>
              <p className="mt-1 text-[14px] text-white/70">
                Scan QR rak → input jumlah → simpan
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-white">
              <Upload size={22} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-white/80 group-hover:text-white">
            Mulai Pencatatan <ArrowRight size={15} />
const transactions = [
  { time: '10:42 WIB', rack: 'Rak A-04', rackIcon: rackIcon1, type: 'Masuk', amount: '24 Dus' },
  { time: '09:15 WIB', rack: 'Rak B-12', rackIcon: rackIcon2, type: 'Keluar', amount: '10 Dus' },
  { time: '08:30 WIB', rack: 'Rak C-01', rackIcon: rackIcon1, type: 'Masuk', amount: '50 Dus' },
]

const today = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

function ActionCard({ icon, arrowIcon, title, description, footerLabel, footerAccent, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full flex-col overflow-hidden rounded-lg bg-white text-left shadow-[0_2px_12px_rgba(20,27,43,0.04)] outline-none transition hover:shadow-[0_4px_20px_rgba(20,27,43,0.08)] focus-visible:ring-2 focus-visible:ring-brand"
    >
      <div className="flex w-full flex-1 flex-col gap-5 p-8 pb-6">
        <div className="flex w-full items-center justify-between">
          <div className="grid size-16 place-items-center rounded-lg bg-field">
            <img src={icon} alt="" className="size-[26px]" />
          </div>

          <span className="flex items-center gap-1 rounded-sm bg-field px-2 py-1 font-mono text-xs leading-4 text-muted-dark">
            SCAN
            <img src={scanChipIcon} alt="" className="size-3" />
          </span>
        </div>

        <div className="flex w-full flex-col items-start pt-2">
          <div className="flex items-center gap-1">
            <span className="whitespace-nowrap text-2xl font-semibold leading-8 tracking-[-0.36px] text-ink">
              {title}
            </span>
            <img src={arrowIcon} alt="" className="size-[13px]" />
          </div>
          <p className="mt-1 w-full text-sm leading-5 text-muted-dark">
            {description}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center justify-between gap-2 bg-[rgba(241,243,255,0.6)] px-8 py-3">
        <span className="text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
          {footerLabel}
        </span>
        <span className={`font-mono text-xs font-medium leading-4 ${footerAccent}`}>
          Buka Kamera →
        </span>
      </div>
    </button>
  )
}

export default function StaffDashboard() {
  const [scanOpen, setScanOpen] = useState(true)
  const [itemCode, setItemCode] = useState('BRG-88219 - Box Komponen Elektronik')
  const [quantity, setQuantity] = useState('12 Dus')
  const [documentNo, setDocumentNo] = useState('DO-2024-1082')
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!scanOpen) return undefined

    function onKeyDown(event) {
      if (event.key === 'Escape') setScanOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [scanOpen])

  function handleConfirm(event) {
    event.preventDefault()

    if (!itemCode.trim() || !quantity.trim() || !documentNo.trim()) {
      setFormError('Semua kolom wajib diisi sebelum transaksi disimpan.')
      return
    }

    setFormError('')
    setScanOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-white max-md:flex-col">
      <Sidebar items={menu} wide logoutIcon={logoutIcon} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-8 backdrop-blur-md">
          <h1 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
            Halo, Staf Gudang
          </h1>

          <div className="flex items-center gap-5">
            <span className="font-mono text-[13px] leading-[18px] text-muted-dark max-sm:hidden">
              {today}
            </span>

            <button
              type="button"
              aria-label="Notifikasi"
              className="grid size-8 shrink-0 place-items-center rounded-xl bg-brand outline-none transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand"
            >
              <img src={bellIcon} alt="" className="size-3" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1152px] px-8 pb-16 pt-6">
          {/* Top system pulse */}
          <div className="flex items-center justify-between gap-3 border-b-0 pb-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 rounded-xl bg-chip px-3 py-1 font-mono text-xs leading-4 text-muted-dark">
                <span className="size-2 rounded-full bg-[#00685F]" aria-hidden="true" />
                Terminal GD-01 • Online
              </span>
              <span className="font-mono text-xs leading-4 text-muted">
                Shift Pagi (07:00 - 15:00)
              </span>
            </div>

            <span className="flex items-center gap-1 text-[13px] font-medium leading-[18px] text-muted-dark">
              <img src={scannerReady} alt="" className="h-[12px] w-auto" />
              Scanner Siap
            </span>
          </div>

          {/* Center stage: dual action cards */}
          <div className="mt-4 grid grid-cols-2 gap-8 max-lg:gap-4 max-md:grid-cols-1">
            <ActionCard
              icon={masukBarangIcon}
              arrowIcon={arrowMasuk}
              title="Masuk Barang"
              description="Penerimaan barang & penempatan stok rak gudang"
              footerLabel="METODE: BARCODE DUS + LABEL RAK"
              footerAccent="text-brand"
              onOpen={() => setScanOpen(true)}
            />

            <ActionCard
              icon={keluarBarangIcon}
              arrowIcon={arrowKeluar}
              title="Keluar Barang"
              description="Pengambilan barang & pengiriman keluar gudang"
              footerLabel="VALIDASI SURAT JALAN / DO"
              footerAccent="text-[#0051D5]"
              onOpen={() => setScanOpen(true)}
            />
          </div>
        </Link>
      </div>

      {/* Riwayat Transaksi */}
      <Card>
        <CardHeader
          title="Riwayat Transaksi Terakhir"
          description="Hari ini — WH-01"
          actions={
            <Link
              to="/staff/riwayat"
              className="flex items-center gap-1 text-[13px] font-medium text-[#0037B0] hover:underline"
            >
              Semua <ArrowRight size={13} />
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Waktu
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Rak
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Tipe
                  </th>
                  <th className="px-5 py-3 text-right text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_TRANSACTIONS.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-3 font-mono text-[13.5px] text-[#6B7280]">
                      {tx.waktu}
                    </td>
                    <td className="px-5 py-3 font-mono text-[13.5px] font-medium text-[#111827]">
                      {tx.rak}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={tx.tipe === 'IN' ? 'success' : 'danger'}>
                        {tx.tipe === 'IN' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[13.5px] font-semibold text-[#111827]">
                      {tx.jumlah.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AppShell>
          {/* Riwayat transaksi hari ini */}
          <section className="mt-8 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold leading-7 tracking-[-0.5px] text-ink">
                  Riwayat Transaksi Hari Ini
                </h2>
                <span className="rounded-xl bg-chip px-2 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-ink">
                  {transactions.length} aktivitas tercatat
                </span>
              </div>

              <Link
                to="/staff/log"
                className="flex shrink-0 items-center gap-1 text-[13px] font-medium leading-[18px] text-brand hover:underline"
              >
                Lihat Semua Log
                <img src={arrowLog} alt="" className="size-2.5" />
              </Link>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_8px_rgba(20,27,43,0.03)]">
              <div className="overflow-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                      <th className="px-5 py-2 font-semibold">WAKTU</th>
                      <th className="px-5 py-2 font-semibold">LOKASI RAK</th>
                      <th className="px-5 py-2 font-semibold">JENIS</th>
                      <th className="px-5 py-2 text-right font-semibold">JUMLAH DUS / ITEM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((item) => (
                      <tr
                        key={item.time}
                        className="border-t border-field transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1 font-mono text-[13px] leading-[18px] tracking-[-0.13px] text-ink">
                            <img src={scheduleIcon} alt="" className="size-[13px]" />
                            {item.time}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1 rounded-sm bg-field px-2 py-0.5 font-mono text-xs font-medium leading-4 text-ink">
                            <img src={item.rackIcon} alt="" className="h-[11px] w-auto" />
                            {item.rack}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-sm px-2.5 py-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] ${
                              item.type === 'Masuk'
                                ? 'bg-[#DCE1FF] text-[#001551]'
                                : 'bg-chip text-muted-dark'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                item.type === 'Masuk' ? 'bg-brand' : 'bg-muted'
                              }`}
                              aria-hidden="true"
                            />
                            {item.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-[13px] font-medium leading-[18px] tracking-[-0.13px] text-ink">
                          {item.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Modal: Scan QR Lokasi Rak */}
      {scanOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(20,27,43,0.6)] p-5 backdrop-blur-[2px]"
          onClick={() => setScanOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="scan-modal-title"
            className="max-h-[95vh] w-full max-w-[768px] overflow-auto rounded-lg border border-chip bg-white shadow-[0_8px_32px_rgba(20,27,43,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between gap-4 border-b border-field px-8 py-5">
              <div className="flex items-center gap-2">
                <div className="grid size-8 shrink-0 place-items-center rounded bg-field">
                  <img src={modalQrIcon} alt="" className="size-[17px]" />
                </div>
                <div>
                  <h2
                    id="scan-modal-title"
                    className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink"
                  >
                    Scan QR Lokasi Rak
                  </h2>
                  <p className="text-xs leading-4 text-muted-dark">
                    Pemindaian fisik rak dan konfirmasi data muatan
                  </p>
                </div>
              </div>

              <button
                type="button"
                autoFocus
                onClick={() => setScanOpen(false)}
                aria-label="Tutup modal"
                className="grid size-8 shrink-0 place-items-center rounded outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={closeIcon} alt="" className="size-3" />
              </button>
            </div>

            {/* Isi modal: split scanner & form */}
            <form onSubmit={handleConfirm}>
              <div className="grid gap-8 p-8 md:grid-cols-2">
                {/* Sisi kiri: viewfinder kamera */}
                <div className="flex flex-col gap-2">
                  <div className="relative flex items-center justify-center overflow-hidden rounded-lg border border-[#DCE2F7] bg-[#1A2234] py-[72px]">
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(137,245,231,0.22),transparent_65%)]"
                    />

                    <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-xl bg-black/60 px-2.5 py-1 backdrop-blur">
                      <span className="size-2 animate-pulse rounded-full bg-[#BA1A1A]" aria-hidden="true" />
                      <span className="font-mono text-[11px] uppercase leading-5 tracking-[0.275px] text-white">
                        Kamera Aktif
                      </span>
                    </div>

                    {/* Viewfinder corners + scan line */}
                    <div className="relative size-48 rounded border-2 border-dashed border-white/20">
                      <div className="h-0.5 w-full self-center bg-gradient-to-r from-transparent via-[#89F5E7] to-transparent" style={{ position: 'absolute', top: '50%' }} />
                      <span className="absolute -left-1 -top-1 size-5 border-l-2 border-t-2 border-[#89F5E7]" />
                      <span className="absolute -right-1 -top-1 size-5 border-r-2 border-t-2 border-[#89F5E7]" />
                      <span className="absolute -bottom-1 -left-1 size-5 border-b-2 border-l-2 border-[#89F5E7]" />
                      <span className="absolute -bottom-1 -right-1 size-5 border-b-2 border-r-2 border-[#89F5E7]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1">
                    <img src={qrInstructionIcon} alt="" className="size-3" />
                    <p className="text-center text-xs leading-4 text-muted-dark">
                      Arahkan kamera ke QR Code pada Rak.
                    </p>
                  </div>
                </div>

                {/* Sisi kanan: status rak & form */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 rounded border border-[rgba(107,216,203,0.4)] bg-[rgba(137,245,231,0.2)] px-3 py-2">
                    <span className="flex items-center gap-1">
                      <img src={checkCircleIcon} alt="" className="size-[15px]" />
                      <span className="text-[13px] font-semibold leading-[18px] text-green">
                        Lokasi Terdeteksi: Rak A-04
                      </span>
                    </span>
                    <span className="rounded-sm bg-[rgba(137,245,231,0.3)] px-2 py-0.5 font-mono text-[11px] font-medium leading-[14px] text-green">
                      Zona Masuk
                    </span>
                  </div>

                  {/* Field: Kode / Nama Barang */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="item-code"
                      className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.55px] text-muted-dark"
                    >
                      Kode / Nama Barang
                    </label>
                    <div className="relative">
                      <input
                        id="item-code"
                        type="text"
                        value={itemCode}
                        onChange={(event) => setItemCode(event.target.value)}
                        className="w-full rounded border border-[rgba(196,197,215,0.6)] bg-field py-2 pl-3 pr-9 text-sm leading-5 text-ink outline-none focus:ring-2 focus:ring-brand"
                      />
                      <img
                        src={inventoryBoxIcon}
                        alt=""
                        className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-auto -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* Field: Jumlah Dus / Item */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="quantity"
                      className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.55px] text-muted-dark"
                    >
                      Jumlah Dus / Item
                    </label>
                    <div className="relative">
                      <input
                        id="quantity"
                        type="text"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        className="w-full rounded border border-[rgba(196,197,215,0.6)] bg-field py-2 pl-3 pr-9 font-mono text-sm leading-5 text-ink outline-none focus:ring-2 focus:ring-brand"
                      />
                      <img
                        src={calculateIcon}
                        alt=""
                        className="pointer-events-none absolute right-3 top-1/2 h-3 w-auto -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {/* Field: No. Dokumen */}
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="document-no"
                      className="text-[11px] font-medium uppercase leading-[14px] tracking-[0.55px] text-muted-dark"
                    >
                      No. Dokumen / Surat Jalan
                    </label>
                    <div className="relative">
                      <input
                        id="document-no"
                        type="text"
                        value={documentNo}
                        onChange={(event) => setDocumentNo(event.target.value)}
                        className="w-full rounded border border-[rgba(196,197,215,0.6)] bg-field py-2 pl-3 pr-9 font-mono text-sm leading-5 text-ink outline-none focus:ring-2 focus:ring-brand"
                      />
                      <img
                        src={descriptionIcon}
                        alt=""
                        className="pointer-events-none absolute right-3 top-1/2 h-[15px] w-auto -translate-y-1/2"
                      />
                    </div>
                  </div>

                  {formError && (
                    <p role="alert" className="rounded bg-red-50 px-3 py-2 text-[11px] leading-4 text-red-700">
                      {formError}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer aksi */}
              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-field bg-[rgba(241,243,255,0.6)] px-8 py-3">
                <button
                  type="button"
                  onClick={() => setScanOpen(false)}
                  className="rounded px-5 py-2 text-[13px] font-medium leading-[18px] text-muted-dark outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded bg-brand px-5 py-2 text-[13px] font-medium leading-[18px] text-white shadow-sm outline-none transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <img src={checkSmallIcon} alt="" className="h-[9px] w-auto" />
                  Konfirmasi &amp; Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
