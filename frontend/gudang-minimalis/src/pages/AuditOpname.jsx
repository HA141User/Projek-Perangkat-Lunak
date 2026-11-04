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
  )
}
