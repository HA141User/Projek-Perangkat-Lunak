
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
