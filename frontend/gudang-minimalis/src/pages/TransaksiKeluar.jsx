import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ScanLine, CheckCircle, X, AlertTriangle, ArrowRight } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import QrScannerModal from '../components/QrScannerModal'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { extractApiError } from '../lib/format'

const MENU_STAF = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

export default function TransaksiKeluar() {
  const navigate = useNavigate()
  const { user } = getAuth()

  const [rakOptions, setRakOptions] = useState([])
  const [showScanner, setShowScanner] = useState(false)
  const [kodeManual, setKodeManual] = useState('')
  const [selectedRak, setSelectedRak] = useState(null)
  const [jumlah, setJumlah] = useState(1)
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [modal, setModal] = useState(null)

  // Ambil daftar barang & lokasi murni dari GET /api/items/
  useEffect(() => {
    let active = true
    async function loadItems() {
      try {
        const res = await apiFetch('/api/items/')
        if (active && res.ok) {
          const list = unwrapList(await res.json().catch(() => null))
          setRakOptions(
            list.map((it, idx) => ({
              id: it.id_barang ?? it.id ?? idx + 1,
              kode: String(it.rak ?? it.kode_lokasi ?? it.lokasi?.nama_rak ?? it.lokasi?.kode_lokasi ?? `A-0${idx + 1}`).replace(/^RAK\s+/i, ''),
              sku: it.sku ?? it.kode_barang ?? `BRG-00${idx + 1}`,
              nama: it.nama ?? it.nama_barang ?? '-',
              stok: Number(it.stok ?? it.stok_saat_ini ?? 0),
              min: Number(it.minStok ?? it.batas_stok_minimum ?? 5),
            }))
          )
        }
      } catch {
        /* biarkan kosong jika gagal */
      }
    }
    loadItems()
    return () => { active = false }
  }, [])

  function handleLogout() { clearAuth(); navigate('/login') }

  function handleSelectRak(opt) {
    setSelectedRak(opt)
    setKodeManual(opt.kode)
    setJumlah(1)
    setShowScanner(false)
    setErrorBanner('')
  }

  async function handleGunakanKode() {
    const q = kodeManual.trim().toUpperCase().replace(/^RAK\s+/i, '')
    if (!q) return
    const match = rakOptions.find((r) => r.kode.toUpperCase() === q || r.sku?.toUpperCase() === q || r.kode.toUpperCase().includes(q))
    if (match) {
      handleSelectRak(match)
      return
    }
    try {
      const res = await apiFetch(`/api/items/by-code/${encodeURIComponent(q)}`)
      if (res.ok) {
        const data = await res.json().catch(() => null)
        const it = data?.data || data
        if (it && (it.nama || it.nama_barang)) {
          handleSelectRak({
            id: it.id_barang ?? it.id ?? 1,
            kode: String(it.lokasi?.nama_rak ?? it.rak ?? it.kode_lokasi ?? q).replace(/^RAK\s+/i, ''),
            sku: it.sku ?? it.kode_barang ?? q,
            nama: it.nama ?? it.nama_barang,
            stok: Number(it.stok ?? it.stok_saat_ini ?? 0),
            min: Number(it.minStok ?? it.batas_stok_minimum ?? 5),
          })
          return
        }
      }
    } catch {
      /* ignore */
    }
    setErrorBanner(`Kode rak / SKU "${q}" tidak ditemukan di database server.`)
  }

  const stokSekarang = selectedRak ? selectedRak.stok : 0
  const jumlahNum = Number(jumlah || 0)
  const stokSetelah = stokSekarang - jumlahNum
  const stokTidakCukup = jumlahNum > stokSekarang
  const isKritis = selectedRak && stokSetelah <= selectedRak.min && stokSetelah > 0
  const isHabis = selectedRak && stokSetelah === 0

  async function handleSubmit() {
    if (!selectedRak || stokTidakCukup || !Number.isInteger(jumlahNum) || jumlahNum < 1) {
      setErrorBanner('Masukkan jumlah barang keluar bilangan bulat minimal 1 dan tidak melebihi stok.')
      return
    }
    setErrorBanner('')
    setLoading(true)
    try {
      const keteranganText = catatan.trim() ? `Dokumen: ${catatan.trim()}` : `Barang Keluar dari Rak ${selectedRak.kode}`
      const res = await apiFetch('/api/transactions/keluar', {
        method: 'POST',
        body: JSON.stringify({
          items: [
            {
              barang_id: Number(selectedRak.id),
              kode_barang: selectedRak.sku,
              jumlah: jumlahNum,
            },
          ],
          keterangan: keteranganText,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(extractApiError(err, `Gagal menyimpan transaksi (${res.status})`))
      }
      setRakOptions((prev) =>
        prev.map((r) => (r.id === selectedRak.id ? { ...r, stok: stokSetelah } : r))
      )
      setModal({ rak: selectedRak.kode, nama: selectedRak.nama, jumlah: jumlahNum, waktu: new Date().toLocaleTimeString('id-ID'), stokSebelum: stokSekarang, stokSetelah, isKritis, isHabis })
    } catch (err) {
      setErrorBanner(err.message || 'Gagal menyimpan transaksi.')
    } finally {
      setLoading(false)
    }
  }

  function handleTransaksiBaru() {
    setModal(null); setSelectedRak(null); setKodeManual(''); setCatatan('')
  }

  function handleScannerSuccess({ item, jumlah: qty }) {
    const nextStok = Math.max(0, item.stok - qty)
    const min = Number(item.min ?? 5)
    setRakOptions((prev) =>
      prev.map((r) => (r.sku === item.sku ? { ...r, stok: nextStok } : r))
    )
    setModal({
      rak: item.rak,
      nama: item.nama,
      jumlah: qty,
      waktu: new Date().toLocaleTimeString('id-ID'),
      stokSebelum: item.stok,
      stokSetelah: nextStok,
      isKritis: nextStok > 0 && nextStok <= min,
      isHabis: nextStok === 0,
    })
  }

  return (
    <AppShell menuItems={MENU_STAF} userName={user?.name || 'Staf Gudang'} onLogout={handleLogout} pageTitle="Barang Keluar">
      <div className="mx-auto max-w-2xl space-y-5">
        {/* Error banner */}
        {errorBanner && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertTriangle size={16} className="shrink-0 text-red-600" />
            <p className="flex-1 text-[13.5px] text-red-700">{errorBanner}</p>
            <button onClick={() => setErrorBanner('')} className="text-red-500"><X size={15} /></button>
          </div>
        )}

        {/* Step 1 — Identifikasi Rak */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-full bg-[#111827] text-[11px] font-bold text-white">1</span>
            <h2 className="text-[14px] font-semibold text-[#111827]">Identifikasi Rak Sumber</h2>
            {selectedRak && (
              <span className="ml-auto rounded-full bg-[#F3F4F6] px-3 py-0.5 text-[12px] font-semibold text-[#374151] ring-1 ring-[#E5E7EB]">
                Terpilih: {selectedRak.kode}
              </span>
            )}
          </div>
          <p className="mb-5 pl-8 text-[13px] text-[#6B7280]">Scan QR atau pilih kode rak secara manual.</p>

          {/* Scan button */}
          <Btn
            variant="primary"
            size="md"
            className="mb-4 w-full"
            icon={ScanLine}
            onClick={() => setShowScanner(true)}
          >
            Buka Scanner Kamera QR Rak & Barang
          </Btn>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#374151]">Atau pilih / ketik kode rak atau SKU:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik kode rak atau SKU..."
                value={kodeManual}
                onChange={(e) => setKodeManual(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGunakanKode()}
                className="h-9 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
              />
              <Btn variant="secondary" size="md" onClick={handleGunakanKode}>Pilih</Btn>
            </div>
            {rakOptions.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[12.5px] text-[#6B7280]">Dari Server:</span>
                {rakOptions.map((r) => (
                  <button
                    key={`${r.id}-${r.kode}`}
                    type="button"
                    onClick={() => handleSelectRak(r)}
                    disabled={r.stok === 0}
                    className={`rounded-lg border px-3 py-1 text-[12.5px] font-medium transition-colors disabled:opacity-40 ${selectedRak?.id === r.id
                        ? 'border-[#111827] bg-[#111827] text-white'
                        : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#111827] hover:text-[#111827]'
                      }`}
                  >
                    {r.kode} · {r.sku} <span className="text-[11px] opacity-70">({r.stok})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Step 2 — Rincian Pengeluaran */}
        {selectedRak && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="grid size-6 place-items-center rounded-full bg-[#111827] text-[11px] font-bold text-white">2</span>
              <h2 className="text-[14px] font-semibold text-[#111827]">Rincian Pengeluaran</h2>
            </div>
            <p className="mb-5 pl-8 text-[13px] text-[#6B7280]">Masukkan jumlah barang yang dikeluarkan.</p>

            {/* Info rak */}
            <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
              <div>
                <p className="text-[12px] text-[#6B7280]">Lokasi: {selectedRak.kode} · Min: {selectedRak.min} unit</p>
                <p className="text-[14px] font-semibold text-[#111827]">{selectedRak.nama}</p>
              </div>
              <div className="text-right">
                <p className="text-[12px] text-[#6B7280]">Stok saat ini</p>
                <p className="text-[22px] font-semibold text-[#111827]">{stokSekarang} <span className="text-[14px] font-normal">Unit</span></p>
              </div>
            </div>

            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Jumlah Barang Dikeluarkan (Unit)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  max={stokSekarang}
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[16px] font-semibold text-[#111827] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Tujuan Pengeluaran / Catatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pengiriman Cabang Makassar / DO-9921"
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
                />
              </div>
            </div>

            {/* Status validasi */}
            {stokTidakCukup ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle size={16} className="shrink-0 text-red-600" />
                <p className="text-[13.5px] font-medium text-red-700">Stok tidak mencukupi. Maksimal {stokSekarang} unit.</p>
              </div>
            ) : isHabis ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertTriangle size={16} className="shrink-0 text-red-600" />
                <p className="text-[13.5px] font-medium text-red-700">Peringatan: stok akan menjadi HABIS (0 Unit).</p>
              </div>
            ) : isKritis ? (
              <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                <p className="text-[13.5px] font-medium text-amber-800">Sisa {stokSetelah} unit di bawah batas minimum ({selectedRak.min} unit).</p>
              </div>
            ) : (
              <div className="mb-5 flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3">
                <span className="text-[13.5px] text-[#374151]">Sisa stok setelah transaksi:</span>
                <span className="text-[15px] font-semibold text-[#111827]">
                  {stokSekarang} − {jumlahNum} = <strong>{stokSetelah}</strong> Unit
                </span>
              </div>
            )}

            <Btn
              variant="primary"
              size="lg"
              className="w-full bg-[#111827] hover:bg-[#1f2937]"
              loading={loading}
              disabled={stokTidakCukup || jumlahNum < 1 || stokSekarang === 0}
              icon={ArrowRight}
              onClick={handleSubmit}
            >
              Simpan Transaksi Keluar
            </Btn>
          </div>
        )}
      </div>

      {/* Modal Sukses */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xl">
            <div className="mb-4 flex flex-col items-center text-center">
              <div className="mb-3 grid size-12 place-items-center rounded-full bg-slate-100 text-[#111827]">
                <CheckCircle size={28} />
              </div>
              <h3 className="text-[16px] font-semibold text-[#111827]">Barang Keluar Berhasil Dicatat!</h3>
              <p className="mt-1 text-[13px] text-[#6B7280]">Stok inventaris telah dikurangi.</p>
            </div>

            {modal.isHabis && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-[13px] font-semibold text-red-700">
                Stok rak ini sekarang HABIS (0 Unit)
              </div>
            )}

            <div className="mb-5 divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-[#F9FAFB]">
              {[
                ['Kode Rak', modal.rak],
                ['Nama Barang', modal.nama],
                ['Kuantitas Keluar', `−${modal.jumlah} Unit`],
                ['Sisa Stok', `${modal.stokSetelah} Unit`],
                ['Waktu', `${modal.waktu} WIB`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5">
                  <span className="text-[13px] text-[#6B7280]">{k}</span>
                  <span className="text-[13px] font-semibold text-[#111827]">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Btn variant="primary" size="lg" className="w-full bg-[#111827] hover:bg-[#1f2937]" onClick={handleTransaksiBaru}>
                + Catat Pengeluaran Lain
              </Btn>
              <Btn variant="secondary" size="lg" className="w-full" onClick={() => navigate('/staff')}>
                Kembali ke Beranda
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal Scanner QR Kamera & Input Transaksi */}
      <QrScannerModal
        open={showScanner}
        onClose={() => setShowScanner(false)}
        type="KELUAR"
        onConfirm={handleScannerSuccess}
      />
    </AppShell>
  )
}
