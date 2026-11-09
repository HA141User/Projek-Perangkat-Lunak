import { useState, useRef } from 'react'
import { QrCode, Download, Printer, X, Check, Loader2, Tag, Smartphone } from 'lucide-react'
import Btn from './ui/Btn'

/**
 * QrLabelModal — Modal Cetak & Pratinjau QR Code
 * Mendukung 2 mode:
 * 1. "qr-only" -> Hanya Kode QR murni (untuk discan atau ditempel simpel)
 * 2. "sticker" -> Stiker Label Gudang Lengkap (sesuai desain mockup Figma)
 */
export default function QrLabelModal({
  open,
  onClose,
  title = 'Kode QR',
  code = 'ELK-001',
  zone = 'Elektronik • Rak A1',
  uid = 'SKU-ELK-001 • ID: 1',
  extraInfo = 'Stok Tersedia: 10 Unit',
  qrDataUrl,
  loading = false,
}) {
  const [viewMode, setViewMode] = useState('qr-only') // 'qr-only' | 'sticker'
  const [labelSize, setLabelSize] = useState('100x75')
  const [printCopies, setPrintCopies] = useState('1')
  const [isPrinting, setIsPrinting] = useState(false)
  const printAreaRef = useRef(null)

  if (!open) return null

  // Gunakan data_url dari backend, atau fallback QR generator
  const displayQr =
    qrDataUrl ||
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}&margin=10`

  async function handlePrint() {
    const printContent = printAreaRef.current
    if (!printContent) return
    setIsPrinting(true)

    // Pre-decode gambar agar tidak blank saat dialog print browser muncul
    if (displayQr) {
      const img = new Image()
      img.src = displayQr
      try {
        await img.decode()
      } catch {
        /* ignore */
      }
    }

    const printWindow = window.open('', '_blank', 'width=650,height=650')
    if (!printWindow) {
      window.print()
      setIsPrinting(false)
      return
    }

    const isQrOnly = viewMode === 'qr-only'

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak ${isQrOnly ? 'Kode QR' : 'Stiker Label'} - ${code}</title>
          <style>
            @page {
              size: ${isQrOnly ? 'auto' : labelSize === '100x75' ? '100mm 75mm' : labelSize === '75x50' ? '75mm 50mm' : '150mm 100mm'};
              margin: 4mm;
            }
            body {
              margin: 0;
              padding: 10px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 80vh;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .print-card {
              width: ${isQrOnly ? '240px' : '290px'};
              border: 1.5px solid #111827;
              border-radius: 8px;
              padding: 14px 16px;
              text-align: center;
              background: #fff;
              box-sizing: border-box;
              margin: 0 auto;
            }
            .header {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              font-weight: 700;
              letter-spacing: 0.5px;
              margin-bottom: 8px;
            }
            .header-left { color: #111827; }
            .header-right { color: #0037B0; }
            .qr-img {
              width: ${isQrOnly ? '180px' : '140px'};
              height: ${isQrOnly ? '180px' : '140px'};
              object-fit: contain;
              display: block;
              margin: 6px auto;
            }
            .title-code {
              font-size: 18px;
              font-weight: 800;
              color: #111827;
              letter-spacing: 0.5px;
              margin: 4px 0 2px 0;
            }
            .uid {
              font-size: 10px;
              font-family: monospace;
              color: #4B5563;
              margin-bottom: 4px;
            }
            .extra-info {
              font-size: 11px;
              font-weight: 600;
              color: #0037B0;
            }
          </style>
        </head>
        <body>
          ${Array(Number(printCopies || 1))
            .fill(printContent.innerHTML)
            .join('<div style="page-break-after: always; height: 1px;"></div>')}
          <script>
            var images = document.getElementsByTagName('img');
            var loadedCount = 0;
            var total = images.length;
            function triggerPrint() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 250);
            }
            if (total === 0) {
              triggerPrint();
            } else {
              for (var i = 0; i < total; i++) {
                if (images[i].complete) {
                  loadedCount++;
                  if (loadedCount === total) triggerPrint();
                } else {
                  images[i].onload = images[i].onerror = function() {
                    loadedCount++;
                    if (loadedCount === total) triggerPrint();
                  };
                }
              }
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
    setIsPrinting(false)
  }

  function handleDownload() {
    const link = document.createElement('a')
    link.href = displayQr
    link.download = `QR-${code.replace(/\s+/g, '-')}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px] transition-all"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] rounded-2xl border border-[#E5E7EB] bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Modal */}
        <div className="flex items-start gap-3 border-b border-[#E5E7EB] px-6 py-4 bg-white">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#EFF6FF] text-[#0037B0]">
            <QrCode size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[#111827]">
              {viewMode === 'qr-only' ? 'Kode QR Barang' : 'Cetak Label Stiker'} - {code}
            </h2>
            <p className="mt-0.5 text-[12px] text-[#6B7280]">
              {title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1.5 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Tutup"
          >
            <X size={17} />
          </button>
        </div>

        {/* Tab Switcher: "Hanya Kode QR" vs "Stiker Label Lengkap" */}
        <div className="border-b border-[#E5E7EB] bg-[#F9FAFB] px-6 pt-3 pb-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setViewMode('qr-only')}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                viewMode === 'qr-only'
                  ? 'border-[#0037B0] text-[#0037B0]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <QrCode size={15} />
              Hanya Kode QR
            </button>
            <button
              type="button"
              onClick={() => setViewMode('sticker')}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition-colors ${
                viewMode === 'sticker'
                  ? 'border-[#0037B0] text-[#0037B0]'
                  : 'border-transparent text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              <Tag size={15} />
              Format Stiker Rak / Dus
            </button>
          </div>
        </div>

        {/* Body Modal */}
        <div className="space-y-4 px-6 py-5 bg-[#F9FAFB]">
          {/* Card Pratinjau (sesuai mode yang dipilih) */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
            <div ref={printAreaRef}>
              {viewMode === 'qr-only' ? (
                /* Mode 1: Hanya Kode QR (Murni, Bersih, Fokus ke QR) */
                <div className="print-card mx-auto max-w-[260px] rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
                  <div className="my-1 flex items-center justify-center">
                    {loading ? (
                      <div className="grid size-44 place-items-center rounded-lg bg-[#F3F4F6]">
                        <Loader2 className="size-6 animate-spin text-[#0037B0]" />
                      </div>
                    ) : (
                      <img
                        src={displayQr}
                        alt={`QR Code ${code}`}
                        className="qr-img size-44 object-contain rounded"
                      />
                    )}
                  </div>
                  <h3 className="title-code mt-2 font-mono text-[18px] font-bold text-[#111827]">
                    {code}
                  </h3>
                  <p className="text-[12px] font-medium text-[#4B5563] truncate">
                    {title}
                  </p>
                </div>
              ) : (
                /* Mode 2: Stiker Label Lengkap (Template Gudang Minimalis) */
                <div className="print-card sticker-card mx-auto max-w-[280px] rounded-xl border border-[#E5E7EB] bg-white p-4 text-center">
                  {/* Header Stiker */}
                  <div className="header mb-2 flex items-center justify-between text-[10px] font-bold tracking-wider">
                    <span className="header-left text-[#111827]">GUDANG MINIMALIS</span>
                    <span className="header-right text-[#0037B0]">{zone}</span>
                  </div>

                  {/* QR Code Gambar */}
                  <div className="relative my-2 flex items-center justify-center">
                    {loading ? (
                      <div className="grid size-36 place-items-center rounded-lg bg-[#F3F4F6]">
                        <Loader2 className="size-6 animate-spin text-[#0037B0]" />
                      </div>
                    ) : (
                      <img
                        src={displayQr}
                        alt={`QR Code ${code}`}
                        className="qr-img size-36 object-contain rounded"
                      />
                    )}
                  </div>

                  {/* Info Text */}
                  <div className="mt-1">
                    <h3 className="title-code text-[17px] font-bold text-[#111827] tracking-tight">
                      {code}
                    </h3>
                    <p className="uid font-mono text-[10px] text-[#6B7280]">
                      {uid}
                    </p>
                    <p className="extra-info mt-1 text-[11.5px] font-semibold text-[#0037B0]">
                      {extraInfo}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opsi Cetak jika mode Stiker aktif */}
          {viewMode === 'sticker' && (
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-[#374151]">
                  Ukuran Label Fisik
                </label>
                <select
                  value={labelSize}
                  onChange={(e) => setLabelSize(e.target.value)}
                  className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827] outline-none"
                >
                  <option value="100x75">100 × 75 mm (Standar Rak)</option>
                  <option value="75x50">75 × 50 mm (Kecil)</option>
                  <option value="150x100">150 × 100 mm (Besar)</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-[#374151]">
                  Jumlah Rangkap Cetak
                </label>
                <select
                  value={printCopies}
                  onChange={(e) => setPrintCopies(e.target.value)}
                  className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-white px-2 text-[12px] text-[#111827] outline-none"
                >
                  <option value="1">1 Salinan (Primer)</option>
                  <option value="2">2 Salinan (Depan & Belakang)</option>
                  <option value="3">3 Salinan</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] bg-white px-6 py-4">
          <Btn variant="secondary" onClick={onClose}>
            Tutup
          </Btn>

          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              icon={Download}
              onClick={handleDownload}
              title="Unduh file gambar QR PNG"
            >
              Unduh PNG
            </Btn>

            <Btn
              variant="primary"
              icon={Printer}
              loading={isPrinting}
              onClick={handlePrint}
            >
              {viewMode === 'qr-only' ? 'Cetak QR' : 'Cetak Stiker'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}
