import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, CheckCircle, X, Info, ClipboardList } from 'lucide-react'
import AppShell from '../components/AppShell'
import Modal from '../components/ui/Modal'
import Btn from '../components/ui/Btn'
import { Select } from '../components/ui/Form'
import { getAuth, clearAuth, apiFetch } from '../lib/auth'

const MENU_STAF = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const RAK_LIST = ['A-01', 'A-02', 'A-03', 'B-01', 'B-05', 'B-11', 'C-07', 'D-02']

const RAK_ITEMS = {
  'A-01': [{ sku: 'ATK-001', nama: 'Kertas HVS A4 80gsm', stokSistem: 120 }],
  'A-02': [{ sku: 'ATK-002', nama: 'Toner Printer Laser', stokSistem: 34 }],
  'A-03': [{ sku: 'ATK-003', nama: 'Ballpoint Biru (Lusin)', stokSistem: 8 }],
  'B-01': [{ sku: 'ATK-004', nama: 'Amplop Coklat Besar', stokSistem: 200 }],
  'B-05': [{ sku: 'ATK-005', nama: 'Stappler No.10', stokSistem: 3 }],
  'B-11': [{ sku: 'ATK-006', nama: 'Binder Clip 25mm', stokSistem: 15 }],
  'C-07': [{ sku: 'ATK-007', nama: 'Spidol Whiteboard Hitam', stokSistem: 22 }],
  'D-02': [{ sku: 'ATK-008', nama: 'Map Plastik Transparan', stokSistem: 5 }],
}

function selisihColor(s) {
  if (s === 0) return 'text-emerald-600 font-semibold'
  if (s < 0) return 'text-red-600 font-semibold'
  return 'text-amber-600 font-semibold'
}

export default function AuditOpname() {
  const navigate = useNavigate()
  const { user } = getAuth()

  const [selectedRak, setSelectedRak] = useState('')
  const [inputs, setInputs] = useState({})
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function handleLogout() { clearAuth(); navigate('/login') }

  function handleRakChange(e) {
    setSelectedRak(e.target.value)
    setInputs({})
    setErrorBanner('')
    setSubmitted(false)
  }

  function handleInputChange(sku, field, value) {
    setInputs((prev) => ({ ...prev, [sku]: { ...prev[sku], [field]: value } }))
  }

  const items = selectedRak ? (RAK_ITEMS[selectedRak] ?? []) : []

  function buildPayload() {
    return items.map((item) => {
      const stokFisik = Number(inputs[item.sku]?.stokFisik ?? item.stokSistem)
      return {
        sku: item.sku,
        nama: item.nama,
        stokSistem: item.stokSistem,
        stokFisik,
        selisih: stokFisik - item.stokSistem,
        keterangan: inputs[item.sku]?.keterangan ?? '',
      }
    })
  }

  async function handleKirim() {
    setErrorBanner('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/opname', {
        method: 'POST',
        body: JSON.stringify({ rak: selectedRak, items: buildPayload(), submittedAt: new Date().toISOString() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `Error ${res.status}`)
      }
      setShowConfirm(false)
      setSubmitted(true)
    } catch (err) {
      setShowConfirm(false)
      setErrorBanner(err.message || 'Gagal mengirim hasil audit.')
    } finally {
      setLoading(false)
    }
  }

  const payload = buildPayload()

  return (
    <AppShell
      menuItems={MENU_STAF}
      userName={user?.name || 'Staf Gudang'}
      onLogout={handleLogout}
      pageTitle="Audit Stok Opname"
    >
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
          <p className="text-[13.5px] text-amber-800">
            <strong>Catatan:</strong> Hasil audit harus disetujui Kepala Gudang sebelum stok diperbarui.
          </p>
        </div>

        {/* Error */}
        {errorBanner && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <p className="flex-1 text-[13.5px] text-red-700">{errorBanner}</p>
            <button onClick={() => setErrorBanner('')} className="text-red-500 hover:text-red-700"><X size={15} /></button>
          </div>
        )}

        {/* Sukses */}
        {submitted && (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle size={16} className="shrink-0 text-emerald-600" />
            <p className="text-[13.5px] text-emerald-700">
              Hasil audit berhasil dikirim dan menunggu persetujuan Kepala Gudang.
            </p>
          </div>
        )}

        {/* Step 1 — Pilih Rak */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[#0037B0] text-[11px] font-bold text-white">1</span>
            <h2 className="text-[14px] font-semibold text-[#111827]">Pilih Lokasi Rak</h2>
          </div>
          <p className="mb-4 pl-8 text-[13px] text-[#6B7280]">Pilih rak yang akan diaudit stoknya.</p>

          <Select value={selectedRak} onChange={handleRakChange}>
            <option value="">— Pilih Rak —</option>
            {RAK_LIST.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>

        {/* Step 2 — Input Stok Fisik */}
        {selectedRak && items.length > 0 && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#0037B0] text-[11px] font-bold text-white">2</span>
              <h2 className="text-[14px] font-semibold text-[#111827]">Input Stok Fisik — Rak {selectedRak}</h2>
            </div>
            <p className="mb-5 pl-8 text-[13px] text-[#6B7280]">Masukkan jumlah fisik yang dihitung di lapangan.</p>

            <div className="space-y-4">
              {items.map((item) => {
                const stokFisikVal = inputs[item.sku]?.stokFisik ?? ''
                const stokFisikNum = stokFisikVal !== '' ? Number(stokFisikVal) : item.stokSistem
                const selisih = stokFisikVal !== '' ? stokFisikNum - item.stokSistem : null
                const keterangan = inputs[item.sku]?.keterangan ?? ''

                return (
                  <div key={item.sku} className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                    <div className="mb-4 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-semibold text-[#111827]">{item.nama}</p>
                        <p className="mt-0.5 text-[12px] text-[#6B7280]">{item.sku}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] text-[#6B7280]">Stok Sistem</p>
                        <p className="text-[22px] font-semibold text-[#111827]">{item.stokSistem}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Stok Fisik (hitung manual)</label>
                        <input
                          type="number"
                          min={0}
                          placeholder={String(item.stokSistem)}
                          value={stokFisikVal}
                          onChange={(e) => handleInputChange(item.sku, 'stokFisik', e.target.value)}
                          className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px] font-semibold text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Selisih</label>
                        <div className="flex h-10 items-center rounded-lg border border-[#E5E7EB] bg-white px-3 text-[14px]">
                          {selisih === null
                            ? <span className="text-[#9CA3AF]">—</span>
                            : <span className={selisihColor(selisih)}>{selisih > 0 ? '+' : ''}{selisih}</span>
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                        Keterangan <span className="font-normal text-[#9CA3AF]">(opsional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Misal: barang rusak, hilang, dll."
                        value={keterangan}
                        onChange={(e) => handleInputChange(item.sku, 'keterangan', e.target.value)}
                        className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-5">
              <Btn
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setShowConfirm(true)}
                disabled={submitted}
                icon={ClipboardList}
              >
                {submitted ? 'Audit Telah Dikirim' : 'Kirim Hasil Audit ke Kepala Gudang'}
              </Btn>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi */}
      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Konfirmasi Kirim Audit"
        subtitle={`Rak ${selectedRak} akan dikirim ke Kepala Gudang untuk disetujui.`}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setShowConfirm(false)}>Batal</Btn>
            <Btn variant="primary" loading={loading} onClick={handleKirim}>Ya, Kirim Audit</Btn>
          </>
        }
      >
        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
          {payload.map((p, i) => (
            <div key={p.sku} className={`flex items-center justify-between px-4 py-3 ${i < payload.length - 1 ? 'border-b border-[#E5E7EB]' : ''}`}>
              <div>
                <p className="text-[13.5px] font-medium text-[#111827]">{p.nama}</p>
                <p className="text-[12px] text-[#6B7280]">Sistem: {p.stokSistem} → Fisik: {p.stokFisik}</p>
              </div>
              <span className={selisihColor(p.selisih)}>
                {p.selisih > 0 ? '+' : ''}{p.selisih}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </AppShell>

import { useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar'

import logoutIcon from '../assets/staff/logout.svg'
import selectIcon from '../assets/staff/audit-select-icon.svg'
import chevronDownIcon from '../assets/staff/chevron-down.svg'
import checkBadgeIcon from '../assets/staff/check-badge.svg'
import verifiedIcon from '../assets/staff/verified.svg'
import exclamationIcon from '../assets/staff/exclamation.svg'
import reportProblemIcon from '../assets/staff/report-problem.svg'
import sendIcon from '../assets/staff/send.svg'

const menu = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Data Barang', to: '/staff/barang' },
  { label: 'Audit Opname', to: '/staff/opname' },
]

const CLUSTERS = [
  { value: 'A', label: 'Klaster RAK A (Utara)' },
  { value: 'B', label: 'Klaster RAK B (Selatan)' },
  { value: 'C', label: 'Klaster RAK C (Timur)' },
]

const initialRows = [
  { id: 'A-12', cluster: 'A', rack: 'RAK A-12', sku: 'BRG-001', name: 'Kabel LAN Cat6 50m', system: 25, unit: 'Dus', physical: '25' },
  { id: 'A-14', cluster: 'A', rack: 'RAK A-14', sku: 'BRG-004', name: 'Switch Hub 8-Port Gigabit', system: 10, unit: 'Unit', physical: '8' },
  { id: 'A-18', cluster: 'A', rack: 'RAK A-18', sku: 'BRG-012', name: 'Adaptor Power 12V 2A', system: 40, unit: 'Pcs', physical: '40' },
  { id: 'A-22', cluster: 'A', rack: 'RAK A-22', sku: 'BRG-025', name: 'Patch Cord Fiber Optic 3m', system: 15, unit: 'Dus', physical: '14' },
]

export default function AuditOpname() {
  const [cluster, setCluster] = useState('A')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState(initialRows)
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState('')

  const parsedRows = useMemo(
    () =>
      rows.map((row) => {
        const physical = row.physical.trim() === '' ? null : Number(row.physical)
        const diff = physical === null || Number.isNaN(physical) ? null : physical - row.system
        return { ...row, physicalValue: physical, diff }
      }),
    [rows],
  )

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return parsedRows.filter((row) => {
      if (row.cluster !== cluster) return false
      if (!q) return true
      return [row.rack, row.sku, row.name].join(' ').toLowerCase().includes(q)
    })
  }, [parsedRows, cluster, search])

  const clusterRows = useMemo(
    () => parsedRows.filter((row) => row.cluster === cluster),
    [parsedRows, cluster],
  )
  const matchCount = clusterRows.filter((row) => row.diff === 0).length
  const mismatchCount = clusterRows.length - matchCount

  function updatePhysical(id, value) {
    if (!/^\d*$/.test(value)) return
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, physical: value } : row)),
    )
    setSent(false)
    setFormError('')
  }

  function handleSubmitReport(event) {
    event.preventDefault()

    const hasInvalid = clusterRows.some(
      (row) => row.physicalValue === null || Number.isNaN(row.physicalValue),
    )
    if (hasInvalid) {
      setFormError('Isi seluruh kolom stok fisik dengan angka sebelum mengirim laporan.')
      return
    }

    setFormError('')
    setSent(true)
  }

  return (
    <div className="flex min-h-screen bg-white max-md:flex-col">
      <Sidebar items={menu} wide logoutIcon={logoutIcon} />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-100 bg-white/90 px-8 backdrop-blur-md">
          <h1 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
            Halo, Staf Gudang
          </h1>
        </header>

        <form onSubmit={handleSubmitReport}>
          <main className="mx-auto flex w-full max-w-[1152px] flex-col gap-8 px-8 pb-16 pt-6">
            {/* Header halaman */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded bg-chip px-2 py-0.5 font-mono text-xs leading-4 text-brand">
                  CYCLE-2026-Q4
                </span>
                <span className="text-[13px] font-medium leading-[18px] text-muted-dark">
                  Jadwal Audit: Oktober 2026
                </span>
              </div>

              <h2 className="text-[32px] font-semibold leading-10 tracking-[-0.8px] text-ink">
                Audit Stok Opname
              </h2>
              <p className="text-sm leading-5 text-muted-dark">
                Pencocokan kuantitas fisik gudang terhadap saldo ledger komputasi secara real-time.
              </p>
            </div>

            {/* Toolbar: pilihan klaster + legend + pencarian */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
              <div className="relative min-w-[260px] max-sm:min-w-0 max-sm:flex-1">
                <label htmlFor="cluster" className="sr-only">
                  Pilih klaster rak
                </label>
                <select
                  id="cluster"
                  value={cluster}
                  onChange={(event) => setCluster(event.target.value)}
                  className="w-full appearance-none rounded bg-field py-2 pl-10 pr-9 text-sm leading-5 text-ink outline-none focus:ring-1 focus:ring-brand"
                >
                  {CLUSTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <img
                  src={selectIcon}
                  alt=""
                  className="pointer-events-none absolute left-3 top-1/2 h-[16px] w-auto -translate-y-1/2"
                />
                <img
                  src={chevronDownIcon}
                  alt=""
                  className="pointer-events-none absolute right-3 top-1/2 h-[5.55px] w-auto -translate-y-1/2"
                />
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <span className="flex items-center gap-1 text-xs leading-4 text-muted-dark">
                  <span className="size-2 rounded-full bg-green" aria-hidden="true" />
                  Sesuai: {matchCount}
                </span>
                <span className="flex items-center gap-1 text-xs leading-4 text-muted-dark">
                  <span className="size-2 rounded-full bg-[#BA1A1A]" aria-hidden="true" />
                  Selisih: {mismatchCount}
                </span>

                <div className="relative">
                  <label htmlFor="sku-search" className="sr-only">
                    Cari SKU atau Item
                  </label>
                  <input
                    id="sku-search"
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari SKU atau Item..."
                    autoComplete="off"
                    className="w-48 rounded-sm bg-field px-3 py-1.5 text-xs leading-4 text-ink outline-none placeholder:text-muted focus:ring-1 focus:ring-brand max-sm:w-full"
                  />
                </div>
              </div>
            </div>

            {/* Tabel audit */}
            <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              <div className="overflow-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
                      <th className="px-5 py-3 font-semibold">LOKASI RAK</th>
                      <th className="px-5 py-3 font-semibold">SKU &amp; NAMA BARANG</th>
                      <th className="px-5 py-3 text-right font-semibold">STOK SISTEM</th>
                      <th className="px-5 py-3 text-center font-semibold">INPUT STOK FISIK</th>
                      <th className="px-5 py-3 text-center font-semibold">SELISIH</th>
                      <th className="px-5 py-3 font-semibold">STATUS &amp; VERIFIKASI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => {
                      const isMatch = row.diff === 0

                      return (
                        <tr key={row.id} className="border-t border-field">
                          <td className="px-5 py-4 align-middle">
                            <span className="rounded bg-chip px-2 py-0.5 font-mono text-[13px] font-medium leading-[18px] tracking-[-0.13px] text-ink">
                              {row.rack}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <p className="font-mono text-xs font-medium leading-4 tracking-[0.12px] text-brand">
                              {row.sku}
                            </p>
                            <p className="text-sm font-medium leading-5 text-ink">
                              {row.name}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-right align-middle font-mono text-sm leading-5 text-muted-dark">
                            {row.system} {row.unit}
                          </td>
                          <td className="px-5 py-4 text-center align-middle">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={row.physical}
                              onChange={(event) => updatePhysical(row.id, event.target.value)}
                              aria-label={`Stok fisik ${row.sku}`}
                              className="w-24 rounded bg-field px-2 py-1.5 text-center font-mono text-base font-medium leading-6 tracking-[-0.08px] text-ink outline-none focus:ring-1 focus:ring-brand"
                            />
                          </td>
                          <td className="px-5 py-4 text-center align-middle">
                            {row.diff === null ? (
                              <span className="text-xs text-muted">—</span>
                            ) : isMatch ? (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-[#89F5E7] px-3 py-0.5 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-[#00201D]">
                                <img src={checkBadgeIcon} alt="" className="h-[7px] w-auto" />
                                0 / Sesuai
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-[#FFDAD6] px-3 py-0.5 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-[#93000A]">
                                <img src={exclamationIcon} alt="" className="h-[10.5px] w-auto" />
                                {row.diff} / Kurang
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              {isMatch && row.diff !== null ? (
                                <>
                                  <img src={verifiedIcon} alt="" className="h-[14px] w-auto shrink-0" />
                                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink">
                                    Terverifikasi Sesuai
                                  </span>
                                </>
                              ) : (
                                <>
                                  <img src={reportProblemIcon} alt="" className="size-[13.333px] shrink-0" />
                                  <span className="text-[13px] font-medium leading-[18px] tracking-[0.13px] text-ink">
                                    Perlu Cek Ulang
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredRows.length === 0 && (
                      <tr className="border-t border-field">
                        <td colSpan={6} className="px-5 py-10 text-center text-sm leading-5 text-muted">
                          Tidak ada entri yang cocok pada klaster atau kueri ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer tabel */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-field px-5 py-2">
                <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Menampilkan {filteredRows.length} dari {clusterRows.length} entri pada batch saat ini
                </p>
                <p className="font-mono text-xs leading-4 tracking-[0.12px] text-muted-dark">
                  Penyelarasan Terakhir: 10 Menit Lalu
                </p>
              </div>
            </div>

            {formError && (
              <p role="alert" className="rounded bg-red-50 px-4 py-2 text-xs leading-4 text-red-700">
                {formError}
              </p>
            )}

            {sent && (
              <div
                role="status"
                className="flex items-center justify-between gap-3 rounded border border-[rgba(107,216,203,0.4)] bg-[rgba(137,245,231,0.2)] px-4 py-2"
              >
                <p className="text-xs leading-4 text-green">
                  Laporan opname terkirim (simulasi — belum terhubung ke backend).
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="shrink-0 text-xs font-medium text-green underline"
                >
                  Tutup
                </button>
              </div>
            )}

            {/* Aksi bawah */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-brand px-5 py-2 text-[13px] font-medium leading-[18px] tracking-[0.13px] text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] outline-none transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand"
              >
                <img src={sendIcon} alt="" className="h-3 w-auto" />
                Kirim Laporan Opname
              </button>
            </div>
          </main>
        </form>
      </div>
    </div>
  )
}
