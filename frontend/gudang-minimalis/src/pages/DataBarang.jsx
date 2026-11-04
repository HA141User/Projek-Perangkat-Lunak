
import { useEffect, useMemo, useRef, useState } from 'react'
import Sidebar from '../components/Sidebar'

import logoutIcon from '../assets/staff/logout.svg'
import searchIcon from '../assets/staff/search.svg'
import searchButtonIcon from '../assets/staff/search-btn.svg'
import infoIcon from '../assets/staff/info.svg'
import arrowWhiteIcon from '../assets/staff/arrow-white.svg'
import chevronRowIcon from '../assets/staff/chevron-row.svg'
import chevronLeftIcon from '../assets/staff/chevron-left.svg'
import chevronRightIcon from '../assets/staff/chevron-right.svg'

const menu = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Data Barang', to: '/staff/barang' },
  { label: 'Audit Opname', to: '/staff/opname' },
]

const racks = [
  {
    id: 'A-12',
    rack: 'RAK A-12',
    zone: 'ZONA A',
    aisle: 'AISLE-01 · TINGKAT 2',
    sku: 'BRG-001 - Kabel LAN Cat6',
    detail: 'Roll 305 Meter UTP High Speed',
    stock: 8,
    unit: 'Dus',
    status: 'Siap Alokasi',
  },
  {
    id: 'B-04',
    rack: 'RAK B-04',
    zone: 'ZONA B',
    aisle: 'AISLE-02 · TINGKAT 1',
    sku: 'BRG-014 - Switch Gigabit 16-Port',
    detail: 'Rackmount Network Switch Unmanaged',
    stock: 24,
    unit: 'Dus',
    status: 'Siap Alokasi',
  },
  {
    id: 'C-07',
    rack: 'RAK C-07',
    zone: 'ZONA C',
    aisle: 'AISLE-04 · TINGKAT 3',
    sku: 'BRG-089 - Patch Panel RJ45',
    detail: '24-Port Cat6 1U Standard Keystone Type',
    stock: 15,
    unit: 'Dus',
    status: 'Siap Alokasi',
  },
]

export default function DataBarang() {
  const [query, setQuery] = useState('RAK A-12')
  const [appliedQuery, setAppliedQuery] = useState(null)
  const [selectedId, setSelectedId] = useState('A-12')
  const searchInputRef = useRef(null)

  // Pintasan ⌘K / Ctrl+K untuk fokus ke kotak pencarian
  useEffect(() => {
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const results = useMemo(() => {
    const q = appliedQuery?.trim().toLowerCase()
    if (!q) return racks

    return racks.filter((item) =>
      [item.rack, item.zone, item.aisle, item.sku, item.detail]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [appliedQuery])

  function handleSearch(event) {
    event?.preventDefault()
    setAppliedQuery(query)
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

        <main className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-8 pb-16 pt-6">
          {/* Header halaman */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 pb-1">
              <span className="flex items-center gap-1.5 rounded-sm bg-[#E1E8FD] px-2 py-0.5 text-[11px] font-medium leading-[14px] tracking-[0.44px] text-muted-dark">
                <span className="size-1.5 rounded-full bg-[#0051D5]" aria-hidden="true" />
                Mode Alternatif Manual
              </span>
              <span className="text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-muted">
                TERMINAL-M04
              </span>
            </div>

            <h2 className="text-2xl font-semibold leading-8 tracking-[-0.6px] text-ink">
              Pencarian &amp; Input Manual
            </h2>
            <p className="text-sm leading-5 text-muted-dark">
              Gunakan fitur ini jika label QR pada rak rusak atau kamera tidak berfungsi.
            </p>
          </div>

          {/* Bilah pencarian */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-[0_1px_1px_rgba(0,0,0,0.05)] max-sm:flex-col max-sm:items-stretch"
          >
            <div className="relative min-w-0 flex-1">
              <label htmlFor="rack-search" className="sr-only">
                Cari rak atau barang
              </label>
              <input
                ref={searchInputRef}
                id="rack-search"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
                className="w-full rounded bg-field py-3 pl-11 pr-16 text-sm leading-5 text-ink outline-none focus:ring-1 focus:ring-brand"
              />
              <img
                src={searchIcon}
                alt=""
                className="pointer-events-none absolute left-[14.5px] top-[14.5px] size-[15px]"
              />
              <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-sm bg-white px-1.5 py-0.5 font-mono text-[11px] leading-[14px] text-muted">
                ⌘K
              </kbd>
            </div>

            <button
              type="submit"
              className="flex shrink-0 items-center justify-center gap-1 rounded bg-brand-hover px-8 py-3 text-[13px] font-medium leading-[18px] tracking-[0.325px] text-white outline-none transition hover:bg-brand focus-visible:ring-2 focus-visible:ring-brand"
            >
              <img src={searchButtonIcon} alt="" className="h-[9.75px] w-auto" />
              Cari Data
            </button>
          </form>

          {/* Banner info */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded bg-field px-3 py-2">
            <div className="flex items-center gap-2">
              <img src={infoIcon} alt="" className="size-[16.667px] shrink-0" />
              <p className="text-xs leading-4 text-ink">
                {appliedQuery?.trim()
                  ? `Menampilkan ${results.length} hasil pencarian untuk kueri "${appliedQuery.trim()}".`
                  : 'Menampilkan 3 hasil pencarian yang cocok untuk kueri rak zona primer.'}
              </p>
            </div>
            <span className="font-mono text-xs leading-4 text-muted max-sm:hidden">
              Filter: Semua Status
            </span>
          </div>

          {/* Tabel data lokasi & barang */}
          <div className="overflow-hidden rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="overflow-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="bg-field text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted">
                    <th className="px-5 py-3 font-semibold">LOKASI RAK</th>
                    <th className="px-5 py-3 font-semibold">SKU &amp; NAMA BARANG</th>
                    <th className="px-5 py-3 text-right font-semibold">STOK SISTEM</th>
                    <th className="px-5 py-3 text-center font-semibold">AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => {
                    const isSelected = item.id === selectedId

                    return (
                      <tr
                        key={item.id}
                        aria-selected={isSelected}
                        className={`border-t border-field transition ${
                          isSelected ? 'bg-[rgba(241,243,255,0.5)]' : ''
                        }`}
                      >
                        <td className="px-5 py-6 align-middle">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-semibold leading-6 tracking-[-0.4px] text-ink">
                              {item.rack}
                            </span>
                            <span className="rounded-sm bg-[#DCE2F7] px-1 py-0.5 text-[11px] font-semibold uppercase leading-[14px] tracking-[0.44px] text-muted-dark">
                              {item.zone}
                            </span>
                          </div>
                          <p className="mt-0.5 font-mono text-xs leading-4 tracking-[0.12px] text-muted">
                            {item.aisle}
                          </p>
                        </td>
                        <td className="px-5 py-6 align-middle">
                          <p className="text-[13px] font-semibold leading-[18px] tracking-[0.13px] text-ink">
                            {item.sku}
                          </p>
                          <p className="text-xs leading-4 tracking-[0.12px] text-muted-dark">
                            {item.detail}
                          </p>
                        </td>
                        <td className="px-5 py-6 align-middle">
                          <div className="flex items-baseline justify-end gap-1.5">
                            <span className="font-mono text-base font-medium leading-6 tracking-[-0.08px] text-ink">
                              {item.stock}
                            </span>
                            <span className="text-xs leading-4 tracking-[0.12px] text-muted">
                              {item.unit}
                            </span>
                          </div>
                          <p className="mt-0.5 text-right text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-green">
                            {item.status}
                          </p>
                        </td>
                        <td className="px-5 py-6 align-middle">
                          <button
                            type="button"
                            onClick={() => setSelectedId(item.id)}
                            aria-pressed={isSelected}
                            className={`flex w-full items-center justify-center gap-1 rounded-sm px-3 py-2 text-center text-[13px] font-medium leading-[18px] outline-none transition focus-visible:ring-2 focus-visible:ring-brand ${
                              isSelected
                                ? 'bg-brand-hover text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                                : 'bg-[#E1E8FD] text-ink hover:bg-chip'
                            }`}
                          >
                            <span>
                              Pilih untuk
                              <br />
                              Transaksi
                            </span>
                            {isSelected ? (
                              <img
                                src={arrowWhiteIcon}
                                alt=""
                                className="size-[10.667px] shrink-0"
                              />
                            ) : (
                              <img
                                src={chevronRowIcon}
                                alt=""
                                className="h-2 w-auto shrink-0"
                              />
                            )}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {results.length === 0 && (
                    <tr className="border-t border-field">
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-sm leading-5 text-muted"
                      >
                        Tidak ada rak atau barang yang cocok dengan kueri
                        {appliedQuery?.trim() ? ` "${appliedQuery.trim()}"` : ''}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            <div className="flex items-center justify-between gap-3 px-5 py-3">
              <p className="text-xs leading-4 tracking-[0.12px] text-muted">
                Menampilkan {results.length} entri terpilih
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled
                  aria-label="Halaman sebelumnya"
                  className="grid cursor-not-allowed place-items-center rounded-sm px-1 pb-2 pt-1 opacity-40"
                >
                  <img src={chevronLeftIcon} alt="" className="h-[9px] w-auto" />
                </button>
                <span className="px-2 font-mono text-xs leading-4 tracking-[0.12px] text-ink">
                  1 / 1
                </span>
                <button
                  type="button"
                  disabled
                  aria-label="Halaman berikutnya"
                  className="grid cursor-not-allowed place-items-center rounded-sm px-1 pb-2 pt-1 opacity-40"
                >
                  <img src={chevronRightIcon} alt="" className="h-[9px] w-auto" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
