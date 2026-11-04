import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ScanLine, CheckCircle, X, AlertTriangle, ArrowRight, QrCode } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import { getAuth, clearAuth, apiFetch } from '../lib/auth'

const MENU_STAF = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const RAK_OPTIONS = [
  { kode: 'A-01', nama: 'Kabel UTP Cat6 100m', stok: 18, min: 5 },
  { kode: 'A-02', nama: 'Switch Hub 16-Port Gigabit', stok: 3, min: 5 },
  { kode: 'B-01', nama: 'Kardus Double Wall A3', stok: 120, min: 50 },
  { kode: 'B-02', nama: 'Lakban Bening Heavy Duty', stok: 4, min: 10 },
  { kode: 'C-01', nama: 'Kertas Thermal Stiker 100x150', stok: 45, min: 15 },
  { kode: 'C-02', nama: 'Barcode Scanner Handheld 2D', stok: 0, min: 2 },
  { kode: 'D-01', nama: 'Rompi Keselamatan High-Vis', stok: 22, min: 10 },
  { kode: 'D-02', nama: 'Sarung Tangan Karet Grip', stok: 2, min: 12 },
]

export default function TransaksiKeluar() {
  const navigate = useNavigate()
  const { user } = getAuth()

  const [showScanner, setShowScanner] = useState(false)
  const [kodeManual, setKodeManual] = useState('')
  const [selectedRak, setSelectedRak] = useState(null)
  const [jumlah, setJumlah] = useState(1)
  const [catatan, setCatatan] = useState('Pengeluaran Divisi Logistik')
  const [loading, setLoading] = useState(false)
  const [errorBanner, setErrorBanner] = useState('')
  const [modal, setModal] = useState(null)

  function handleLogout() { clearAuth(); navigate('/login') }

  function handleSelectRak(opt) {
    setSelectedRak(opt)
    setKodeManual(opt.kode)
    setJumlah(1)
    setShowScanner(false)
    setErrorBanner('')
  }

  function handleGunakanKode() {
    const q = kodeManual.trim().toUpperCase()
    if (!q) return
    const match = RAK_OPTIONS.find((r) => r.kode === q || r.kode.includes(q))
    if (match) handleSelectRak(match)
    else setErrorBanner(`Kode rak "${q}" tidak ditemukan di database WH-01.`)
  }

  const stokSekarang = selectedRak ? selectedRak.stok : 0
  const jumlahNum = Number(jumlah || 0)
  const stokSetelah = stokSekarang - jumlahNum
  const stokTidakCukup = jumlahNum > stokSekarang
  const isKritis = selectedRak && stokSetelah <= selectedRak.min && stokSetelah > 0
  const isHabis = selectedRak && stokSetelah === 0

  async function handleSubmit() {
    if (!selectedRak || stokTidakCukup || jumlahNum < 1) return
    setErrorBanner('')
    setLoading(true)
    try {
      await apiFetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify({ rak: selectedRak.kode, jumlah: jumlahNum, catatan, type: 'OUT' }),
      })
      setModal({ rak: selectedRak.kode, nama: selectedRak.nama, jumlah: jumlahNum, waktu: new Date().toLocaleTimeString('id-ID'), stokSebelum: stokSekarang, stokSetelah, isKritis, isHabis })
    } catch (err) {
      setErrorBanner(err.message || 'Gagal menyimpan transaksi.')
    } finally {
      setLoading(false)
    }
  }

  function handleTransaksiBaru() {
    setModal(null); setSelectedRak(null); setKodeManual(''); setCatatan('Pengeluaran Divisi Logistik')
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

          <Btn
            variant={showScanner ? 'secondary' : 'primary'}
            size="md"
            className="mb-4 w-full"
            icon={showScanner ? X : ScanLine}
            onClick={() => setShowScanner((v) => !v)}
          >
            {showScanner ? 'Tutup Scanner QR' : 'Buka Scanner Kamera QR Rak'}
          </Btn>

          {showScanner && (
            <div className="mb-4 rounded-xl border-2 border-dashed border-[#9CA3AF] bg-[#F9FAFB] p-5 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-white text-[#374151] border border-[#E5E7EB]">
                <QrCode size={24} />
              </div>
              <p className="text-[14px] font-medium text-[#111827]">Simulasi Pindai Kamera</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">Klik rak di bawah untuk mensimulasikan pemindaian:</p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {RAK_OPTIONS.filter((r) => r.stok > 0).slice(0, 4).map((r) => (
                  <Btn key={r.kode} variant="secondary" size="sm" onClick={() => handleSelectRak(r)}>
                    {r.kode} ({r.stok} unit)
                  </Btn>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-[13px] font-medium text-[#374151]">Atau pilih / ketik kode rak:</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ketik kode rak (misal: A-01)"
                value={kodeManual}
                onChange={(e) => setKodeManual(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGunakanKode()}
                className="h-9 flex-1 rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
              />
              <Btn variant="secondary" size="md" onClick={handleGunakanKode}>Pilih</Btn>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-[#6B7280]">Stok ready:</span>
              {RAK_OPTIONS.map((r) => (
                <button
                  key={r.kode}
                  type="button"
                  onClick={() => handleSelectRak(r)}
                  disabled={r.stok === 0}
                  className={`rounded-lg border px-3 py-1 text-[12.5px] font-medium transition-colors disabled:opacity-40 ${
                    selectedRak?.kode === r.kode
                      ? 'border-[#111827] bg-[#111827] text-white'
                      : 'border-[#E5E7EB] bg-white text-[#374151] hover:border-[#111827] hover:text-[#111827]'
                  }`}
                >
                  {r.kode} <span className="text-[11px] opacity-70">({r.stok})</span>
                </button>
              ))}
            </div>
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
                  max={stokSekarang}
                  value={jumlah}
                  onChange={(e) => setJumlah(Number(e.target.value))}
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
    </AppShell>
  )
}
