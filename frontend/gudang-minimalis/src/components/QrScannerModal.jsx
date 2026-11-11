import { useCallback, useState, useEffect, useRef } from 'react'
import {
  QrCode,
  X,
  CheckCircle,
  Package,
  FileText,
  Hash,
  AlertCircle,
  RefreshCw,
  Loader2,
  Lock,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import Btn from './ui/Btn'
import { apiFetch, unwrapList } from '../lib/auth'
import { extractApiError } from '../lib/format'

function createDocNumber() {
  return `DO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
}

/**
 * Audio beep ringkas saat QR sukses terdeteksi
 */
function playSuccessBeep() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.12)
  } catch {
    /* browser autoplay policy fallback */
  }
}

function QrScannerDialog({ onClose, type, onConfirm }) {
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [isLocked, setIsLocked] = useState(false)
  const isLockedRef = useRef(false)

  const [scannedItem, setScannedItem] = useState(null)
  const [jumlah, setJumlah] = useState(type === 'KELUAR' ? '1' : '10')
  const [noDokumen, setNoDokumen] = useState(() => createDocNumber())
  const [loadingLookup, setLoadingLookup] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const allItemsRef = useRef([])
  const [demoItems, setDemoItems] = useState([])

  const html5QrCodeRef = useRef(null)

  const handleCodeScanned = useCallback(async (rawCode) => {
    if (!rawCode || isLockedRef.current) return

    isLockedRef.current = true
    setIsLocked(true)

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.getState?.() === 2) {
        html5QrCodeRef.current.pause(true)
      }
    } catch {
      /* ignore */
    }

    playSuccessBeep()
    setLoadingLookup(true)
    setSubmitError('')

    let clean = String(rawCode).trim()

    if (
      (clean.startsWith('{') && clean.endsWith('}')) ||
      (clean.startsWith('[') && clean.endsWith(']'))
    ) {
      try {
        const parsed = JSON.parse(clean)
        clean = parsed.kode_barang || parsed.sku || parsed.kode || clean
      } catch {
        /* ignore */
      }
    }

    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      try {
        const url = new URL(clean)
        const parts = url.pathname.split('/').filter(Boolean)
        if (parts.length > 0) {
          clean = decodeURIComponent(parts[parts.length - 1])
        }
      } catch {
        /* ignore */
      }
    }

    const normalizedSku = clean.replace(/^SKU-/i, '').trim().toUpperCase()

    try {
      const res = await apiFetch(`/api/items/by-code/${encodeURIComponent(normalizedSku)}`)
      if (res.ok) {
        const payload = await res.json().catch(() => null)
        const it = payload?.data || payload
        if (it && (it.id_barang || it.id)) {
          setScannedItem({
            id: it.id_barang ?? it.id,
            sku: it.kode_barang ?? it.sku ?? normalizedSku,
            nama: it.nama_barang ?? it.nama ?? 'Barang Gudang',
            rak: String(
              it.lokasi?.nama_rak ?? it.rak ?? it.kode_lokasi ?? 'Rak A1'
            ).replace(/^RAK\s+/i, ''),
            stok: Number(it.stok_saat_ini ?? it.stok ?? 0),
            min: Number(it.batas_stok_minimum ?? it.minStok ?? 5),
            satuan: it.satuan ?? 'Unit',
          })
          setLoadingLookup(false)
          return
        }
      }
    } catch {
      /* lanjut ke pencarian daftar barang */
    }

    const foundInList = allItemsRef.current.find((it) => {
      const itSku = (it.kode_barang ?? it.sku ?? '').toUpperCase()
      const itRak = String(it.lokasi?.nama_rak ?? it.rak ?? '').toUpperCase()
      const cleanUpper = clean.toUpperCase()
      const normUpper = normalizedSku.toUpperCase()

      return (
        itSku === normUpper ||
        itSku === cleanUpper ||
        itRak === cleanUpper ||
        itRak === `RAK ${cleanUpper}` ||
        `RAK ${itRak}` === cleanUpper
      )
    })

    if (foundInList) {
      setScannedItem({
        id: foundInList.id_barang ?? foundInList.id,
        sku: foundInList.kode_barang ?? foundInList.sku,
        nama: foundInList.nama_barang ?? foundInList.nama ?? 'Barang Gudang',
        rak: String(foundInList.lokasi?.nama_rak ?? foundInList.rak ?? 'Rak A1').replace(
          /^RAK\s+/i,
          ''
        ),
        stok: Number(foundInList.stok_saat_ini ?? foundInList.stok ?? 0),
        min: Number(foundInList.batas_stok_minimum ?? foundInList.minStok ?? 5),
        satuan: foundInList.satuan ?? 'Unit',
      })
      setLoadingLookup(false)
      return
    }

    // Tetap kunci scanner agar tidak loop 10x/detik pada QR invalid; user klik "Pindai Ulang"
    setLoadingLookup(false)
    setScannedItem(null)
    setSubmitError(
      `QR "${clean}" tidak terdaftar di database server. Arahkan ke QR lain lalu tekan "Pindai Ulang".`
    )
  }, [])

  useEffect(() => {
    let isMounted = true
    apiFetch('/api/items/')
      .then(async (res) => {
        if (res.ok) {
          const list = unwrapList(await res.json().catch(() => []))
          if (isMounted) {
            allItemsRef.current = list
            setDemoItems(list.slice(0, 6))
          }
        }
      })
      .catch(() => {})

    return () => {
      isMounted = false
    }
  }, [])

  // Inisialisasi & Pengaturan Kamera html5-qrcode
  useEffect(() => {
    let isCancelled = false
    let qrScanner = null
    const containerId = 'qr-camera-viewport'

    async function startCamera() {
      try {
        setCameraError('')
        qrScanner = new Html5Qrcode(containerId)
        html5QrCodeRef.current = qrScanner

        await qrScanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            if (!isLockedRef.current) {
              handleCodeScanned(decodedText)
            }
          },
          () => {
            /* abaikan error per frame */
          }
        )

        if (isCancelled) {
          qrScanner
            .stop()
            .then(() => qrScanner.clear())
            .catch(() => {})
          return
        }

        setCameraActive(true)
      } catch (err) {
        if (!isCancelled) {
          console.warn('Camera start error:', err)
          setCameraError(
            'Kamera tidak dapat diakses atau izin ditolak browser. Anda tetap dapat menggunakan tombol Uji Cepat di bawah.'
          )
          setCameraActive(false)
        }
      }
    }

    const timer = setTimeout(() => {
      startCamera()
    }, 250)

    return () => {
      isCancelled = true
      clearTimeout(timer)
      if (html5QrCodeRef.current) {
        try {
          const scanner = html5QrCodeRef.current
          const state = scanner.getState?.()
          if (state === 2 || state === 3) {
            scanner
              .stop()
              .then(() => {
                scanner.clear()
              })
              .catch(() => {})
          } else {
            scanner.clear()
          }
        } catch {
          /* ignore */
        }
        html5QrCodeRef.current = null
      }
      setCameraActive(false)
    }
  }, [handleCodeScanned])

  function handleUnlockRescan() {
    isLockedRef.current = false
    setIsLocked(false)
    setSubmitError('')

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.getState?.() === 3) {
        html5QrCodeRef.current.resume()
      }
    } catch (err) {
      console.warn('Resume error:', err)
    }
  }

  async function handleConfirmSubmit() {
    if (!scannedItem) {
      setSubmitError('Pindai QR Code atau pilih barang terlebih dahulu.')
      return
    }
    const qty = Number(jumlah)
    if (!Number.isFinite(qty) || !Number.isInteger(qty) || qty <= 0) {
      setSubmitError('Masukkan jumlah bilangan bulat yang valid (minimal 1).')
      return
    }
    if (type === 'KELUAR' && qty > scannedItem.stok) {
      setSubmitError(`Stok tidak mencukupi. Stok saat ini hanya ${scannedItem.stok} unit.`)
      return
    }

    setSubmitting(true)
    setSubmitError('')

    try {
      const endpoint =
        type === 'MASUK' ? '/api/transactions/masuk' : '/api/transactions/keluar'
      const keteranganText = noDokumen.trim()
        ? `Dokumen: ${noDokumen.trim()}`
        : `Transaksi ${type === 'MASUK' ? 'Barang Masuk' : 'Barang Keluar'} via QR Scanner`

      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          items: [
            {
              barang_id: Number(scannedItem.id),
              kode_barang: scannedItem.sku,
              jumlah: qty,
            },
          ],
          keterangan: keteranganText,
        }),
      })

      if (!res.ok) {
        const errPayload = await res.json().catch(() => ({}))
        throw new Error(extractApiError(errPayload, `Gagal memproses transaksi (${res.status})`))
      }

      const resData = await res.json().catch(() => null)

      if (onConfirm) {
        onConfirm({
          item: scannedItem,
          jumlah: qty,
          noDokumen,
          type,
          tx: resData,
        })
      }
      onClose()
    } catch (err) {
      setSubmitError(err.message || 'Terjadi kesalahan saat menyimpan transaksi ke server.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[760px] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-start gap-3 border-b border-[#E5E7EB] px-6 py-4 bg-white">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EFF6FF] text-[#0037B0]">
            <QrCode size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[#111827]">
              Scan QR Lokasi Rak &amp; Barang
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              Pemindaian fisik rak dan konfirmasi data muatan (
              {type === 'MASUK' ? 'Barang Masuk' : 'Barang Keluar'}).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Tutup"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Kolom Kiri: Kamera Viewfinder */}
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square max-w-[320px] rounded-2xl bg-[#181D27] overflow-hidden border border-[#2B3240] shadow-inner flex flex-col justify-between p-3.5">
                {/* Badge Status Kamera & Lock */}
                <div className="flex items-center justify-between z-10">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide backdrop-blur-sm ${
                      isLocked
                        ? scannedItem
                          ? 'bg-emerald-600/90 text-white shadow-sm'
                          : 'bg-amber-600/90 text-white shadow-sm'
                        : 'bg-black/60 text-white'
                    }`}
                  >
                    <span
                      className={`size-2 rounded-full ${
                        isLocked
                          ? 'bg-white'
                          : cameraActive
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-amber-400'
                      }`}
                    />
                    {isLocked
                      ? scannedItem
                        ? 'QR TERKUNCI'
                        : 'SCAN DIJEDA'
                      : cameraActive
                        ? 'KAMERA AKTIF'
                        : 'SCANNER STANDBY'}
                  </span>

                  {isLocked && (
                    <button
                      type="button"
                      onClick={handleUnlockRescan}
                      className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10.5px] font-medium text-white hover:bg-white/30 backdrop-blur-sm transition-all"
                      title="Buka kunci untuk memindai ulang"
                    >
                      <RefreshCw size={11} />
                      Pindai Ulang
                    </button>
                  )}
                </div>

                {/* Viewport kamera html5-qrcode */}
                <div
                  id="qr-camera-viewport"
                  className="absolute inset-0 size-full overflow-hidden [&_video]:size-full [&_video]:object-cover"
                />

                {/* Reticle Brackets & Laser Line */}
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-8">
                  <div
                    className={`relative size-44 rounded-lg border-2 transition-all duration-300 ${
                      isLocked
                        ? scannedItem
                          ? 'border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(52,211,153,0.35)]'
                          : 'border-amber-400 bg-amber-500/10'
                        : 'border-dashed border-teal-400/40'
                    }`}
                  >
                    <div
                      className={`absolute -top-1 -left-1 size-4 border-t-2 border-l-2 ${
                        isLocked ? (scannedItem ? 'border-emerald-300' : 'border-amber-300') : 'border-teal-400'
                      }`}
                    />
                    <div
                      className={`absolute -top-1 -right-1 size-4 border-t-2 border-r-2 ${
                        isLocked ? (scannedItem ? 'border-emerald-300' : 'border-amber-300') : 'border-teal-400'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -left-1 size-4 border-b-2 border-l-2 ${
                        isLocked ? (scannedItem ? 'border-emerald-300' : 'border-amber-300') : 'border-teal-400'
                      }`}
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 size-4 border-b-2 border-r-2 ${
                        isLocked ? (scannedItem ? 'border-emerald-300' : 'border-amber-300') : 'border-teal-400'
                      }`}
                    />

                    {isLocked ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                        <span
                          className={`grid size-10 place-items-center rounded-full text-white shadow-lg animate-in zoom-in-75 duration-200 ${
                            scannedItem ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        >
                          {scannedItem ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
                        </span>
                        <p
                          className={`mt-2 text-[11px] font-bold tracking-wide uppercase ${
                            scannedItem ? 'text-emerald-300' : 'text-amber-300'
                          }`}
                        >
                          {scannedItem ? 'QR Terdeteksi' : 'Kode Tak Dikenal'}
                        </p>
                      </div>
                    ) : (
                      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-teal-300 to-transparent shadow-[0_0_8px_#2dd4bf] animate-[bounce_2.5s_infinite]" />
                    )}
                  </div>
                </div>

                {/* Text Bawah Status */}
                <div className="z-10 text-center">
                  {isLocked ? (
                    <button
                      type="button"
                      onClick={handleUnlockRescan}
                      className="pointer-events-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-emerald-200 bg-black/70 px-3 py-1 rounded-full border border-emerald-400/40 hover:bg-black/90 transition-all cursor-pointer"
                    >
                      <Lock size={12} className="text-emerald-400" />
                      {scannedItem ? 'Hasil scan terkunci · Klik untuk scan ulang' : 'Scanner dijeda · Klik untuk scan ulang'}
                    </button>
                  ) : (
                    <p className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 bg-black/60 px-2.5 py-1 rounded-full">
                      <QrCode size={13} className="text-teal-400" />
                      Arahkan kamera ke QR Code pada Rak / Barang
                    </p>
                  )}
                </div>
              </div>

              {/* Uji Cepat */}
              <div className="mt-3.5 w-full max-w-[320px]">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-medium text-[#6B7280]">
                    Uji Cepat (Simulasi Kode Server):
                  </p>
                  {isLocked && (
                    <button
                      type="button"
                      onClick={handleUnlockRescan}
                      className="text-[10.5px] text-[#0037B0] hover:underline"
                    >
                      Buka Kunci
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {demoItems.map((d) => (
                    <button
                      key={d.id_barang ?? d.id}
                      type="button"
                      onClick={() => {
                        isLockedRef.current = false
                        handleCodeScanned(d.kode_barang ?? d.sku ?? `ELK-00${d.id}`)
                      }}
                      className={`rounded px-2 py-1 text-[11px] font-mono transition-colors ${
                        scannedItem?.sku === (d.kode_barang ?? d.sku)
                          ? 'bg-[#0037B0] text-white font-bold'
                          : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'
                      }`}
                    >
                      {d.kode_barang ?? d.sku ?? `BRG-${d.id}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Kolom Kanan: Form Data Hasil Scan */}
            <div className="space-y-4">
              <div
                className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors ${
                  scannedItem
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-[#E5E7EB] bg-[#F9FAFB]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle
                    size={16}
                    className={scannedItem ? 'text-emerald-600' : 'text-[#9CA3AF]'}
                  />
                  <span
                    className={`text-[13px] font-semibold ${
                      scannedItem ? 'text-emerald-900' : 'text-[#6B7280]'
                    }`}
                  >
                    Lokasi: {scannedItem ? `Rak ${scannedItem.rak}` : 'Menunggu Scan QR...'}
                  </span>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    scannedItem
                      ? 'bg-emerald-200/60 text-emerald-800'
                      : 'bg-[#E5E7EB] text-[#6B7280]'
                  }`}
                >
                  {type === 'MASUK' ? 'Zona Masuk' : 'Zona Keluar'}
                </span>
              </div>

              <div>
                <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider text-[#4B5563]">
                  Kode / Nama Barang
                </label>
                <div
                  className={`flex h-10 items-center gap-2 rounded-lg border px-3 transition-colors ${
                    scannedItem
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-[#E5E7EB] bg-[#F9FAFB]'
                  }`}
                >
                  <Package
                    size={16}
                    className={scannedItem ? 'text-emerald-600 shrink-0' : 'text-[#6B7280] shrink-0'}
                  />
                  <input
                    type="text"
                    readOnly
                    placeholder="Pindai QR untuk memuat barang..."
                    value={
                      loadingLookup
                        ? 'Memuat data barang dari server...'
                        : scannedItem
                          ? `${scannedItem.sku} — ${scannedItem.nama}`
                          : ''
                    }
                    className="w-full bg-transparent text-[13px] font-medium text-[#111827] outline-none"
                  />
                  {loadingLookup && (
                    <Loader2 size={15} className="animate-spin text-[#0037B0] shrink-0" />
                  )}
                  {scannedItem && !loadingLookup && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                      TERVERIFIKASI
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11.5px] font-bold uppercase tracking-wider text-[#4B5563]">
                    Jumlah Dus / Item
                  </label>
                  {scannedItem && (
                    <span className="text-[11.5px] text-[#6B7280]">
                      Stok gudang: <strong>{scannedItem.stok}</strong> {scannedItem.satuan}
                    </span>
                  )}
                </div>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#0037B0] focus-within:ring-1 focus-within:ring-[#0037B0]">
                  <Hash size={16} className="text-[#6B7280] shrink-0" />
                  <input
                    type="number"
                    min={1}
                    step={1}
                    max={type === 'KELUAR' && scannedItem ? scannedItem.stok : undefined}
                    value={jumlah}
                    onChange={(e) => setJumlah(e.target.value)}
                    className="w-full bg-transparent text-[14px] font-semibold text-[#111827] outline-none"
                    placeholder="0"
                  />
                  <span className="text-[12px] font-medium text-[#6B7280]">
                    {scannedItem?.satuan || 'Unit'}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-wider text-[#4B5563]">
                  No. Dokumen / Surat Jalan
                </label>
                <div className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#0037B0] focus-within:ring-1 focus-within:ring-[#0037B0]">
                  <FileText size={16} className="text-[#6B7280] shrink-0" />
                  <input
                    type="text"
                    value={noDokumen}
                    onChange={(e) => setNoDokumen(e.target.value)}
                    className="w-full bg-transparent text-[13px] text-[#111827] outline-none"
                    placeholder="Contoh: DO-2026-1082"
                  />
                </div>
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 p-2.5 text-[12.5px] text-red-700 border border-red-200">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span className="flex-1">{submitError}</span>
                </div>
              )}

              {cameraError && !submitError && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[12px] text-amber-800 border border-amber-200">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                  <span className="flex-1">{cameraError}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-white px-6 py-4">
          <div className="text-[12px] text-[#6B7280]">
            {isLocked && scannedItem ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle size={13} />
                Data terkunci aman dari pergerakan kamera
              </span>
            ) : (
              'Siap memindai kode QR...'
            )}
          </div>

          <div className="flex items-center gap-3">
            <Btn variant="secondary" onClick={onClose} disabled={submitting}>
              Batal
            </Btn>

            <Btn
              variant="primary"
              loading={submitting}
              onClick={handleConfirmSubmit}
              disabled={!scannedItem}
              icon={CheckCircle}
            >
              Konfirmasi &amp; Simpan Transaksi
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * QrScannerModal — Wrapper yang memastikan state scanner & kamera bersih tiap kali modal dibuka/tutup.
 */
export default function QrScannerModal({ open, onClose, type = 'MASUK', onConfirm }) {
  if (!open) return null
  return <QrScannerDialog onClose={onClose} type={type} onConfirm={onConfirm} />
}
