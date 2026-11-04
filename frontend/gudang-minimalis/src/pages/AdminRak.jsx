import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Plus, Search, QrCode, Trash2, Grid2X2, Printer } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Input, Select } from '../components/ui/Form'
import { Card, CardHeader } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

const MENU_ADMIN = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log Aktivitas', to: '/admin/log' },
]

const INITIAL_RAK = [
  { id: 1, kode: 'RAK A-01', zona: 'Zona A - Elektronik', kapasitas: 50, terisi: 32, status: 'Tersedia' },
  { id: 2, kode: 'RAK A-02', zona: 'Zona A - Elektronik', kapasitas: 40, terisi: 39, status: 'Hampir Penuh' },
  { id: 3, kode: 'RAK B-01', zona: 'Zona B - Packaging & Logistik', kapasitas: 100, terisi: 65, status: 'Tersedia' },
  { id: 4, kode: 'RAK B-02', zona: 'Zona B - Packaging & Logistik', kapasitas: 80, terisi: 80, status: 'Penuh' },
  { id: 5, kode: 'RAK C-01', zona: 'Zona C - ATK & Stiker Thermal', kapasitas: 60, terisi: 28, status: 'Tersedia' },
  { id: 6, kode: 'RAK C-02', zona: 'Zona C - ATK & Perangkat Kasir', kapasitas: 30, terisi: 14, status: 'Tersedia' },
  { id: 7, kode: 'RAK D-01', zona: 'Zona D - Peralatan K3 & Safety', kapasitas: 45, terisi: 42, status: 'Hampir Penuh' },
  { id: 8, kode: 'RAK D-02', zona: 'Zona D - Peralatan K3 & Safety', kapasitas: 40, terisi: 15, status: 'Tersedia' },
]

export default function AdminRak() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [raks, setRaks] = useState(INITIAL_RAK)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [qrModalRak, setQrModalRak] = useState(null)
  const [formData, setFormData] = useState({
    kode: '',
    zona: 'Zona A - Elektronik',
    kapasitas: 50,
    keterangan: '',
  })

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const filteredRaks = raks.filter(
    (r) =>
      r.kode.toLowerCase().includes(search.toLowerCase()) ||
      r.zona.toLowerCase().includes(search.toLowerCase())
  )

  function handleOpenCreate() {
    setFormData({
      kode: `RAK ${String.fromCharCode(65 + Math.floor(Math.random() * 4))}-0${Math.floor(Math.random() * 9) + 1}`,
      zona: 'Zona A - Elektronik',
      kapasitas: 50,
      keterangan: '',
    })
    setIsModalOpen(true)
  }

  function handleDelete(id) {
    if (confirm('Yakin ingin menghapus lokasi rak ini?')) {
      setRaks((prev) => prev.filter((r) => r.id !== id))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newRak = {
      id: Date.now(),
      kode: formData.kode,
      zona: formData.zona,
      kapasitas: Number(formData.kapasitas),
      terisi: 0,
      status: 'Tersedia',
    }
    setRaks((prev) => [newRak, ...prev])
    setIsModalOpen(false)
  }

  function statusVariant(status) {
    if (status === 'Tersedia') return 'success'
    if (status === 'Hampir Penuh') return 'warning'
    return 'danger'
  }

  function barColor(pct) {
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-[#0037B0]'
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Data Rak"
      actions={
        <Btn variant="primary" size="lg" icon={Plus} onClick={handleOpenCreate}>
          Tambah Rak
        </Btn>
      }
    >
      {/* Search row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex h-9 flex-1 min-w-[200px] items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3 focus-within:border-[#1D4ED8] focus-within:ring-2 focus-within:ring-[#1D4ED8]/20 transition-colors">
          <Search size={15} className="shrink-0 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Cari kode rak atau zona..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none"
          />
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader
          title={`${filteredRaks.length} rak ditemukan`}
          description="Atur zonasi tata letak penyimpanan fisik, batas tampung, dan cetak QR identifikasi rak."
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kode Rak</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Zonasi</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kapasitas</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Terisi</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">QR</th>
                <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredRaks.map((rak) => {
                const pct = Math.round((rak.terisi / rak.kapasitas) * 100)
                return (
                  <tr key={rak.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-mono text-[13px] font-bold text-[#0037B0]">{rak.kode}</td>
                    <td className="px-4 py-3 text-[13.5px] text-[#111827]">{rak.zona}</td>
                    <td className="px-4 py-3 text-[13.5px] text-[#111827]">{rak.kapasitas} box</td>
                    <td className="px-4 py-3 min-w-[140px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-[12px] text-[#6B7280]">
                          <span>{rak.terisi}/{rak.kapasitas} box</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#E5E7EB]">
                          <div
                            className={`h-2 rounded-full ${barColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={statusVariant(rak.status)} dot>
                        {rak.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Btn variant="secondary" size="sm" icon={QrCode} onClick={() => setQrModalRak(rak)}>
                        Lihat QR
                      </Btn>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Btn variant="danger" size="sm" icon={Trash2} onClick={() => handleDelete(rak.id)} />
                    </td>
                  </tr>
                )
              })}
              {filteredRaks.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada rak yang cocok dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Rak */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Registrasi Lokasi Rak Baru"
        subtitle="Tambahkan kode rak dan alokasikan ke zona gudang"
        icon={Grid2X2}
        footer={
          <>
            <Btn variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Btn>
            <Btn variant="primary" onClick={handleSubmit}>Daftarkan Rak</Btn>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <Field label="Kode Rak Unik" required>
              <Input
                type="text"
                required
                placeholder="Contoh: RAK B-03"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
              />
            </Field>

            <Field label="Zonasi Area Gudang">
              <Select
                value={formData.zona}
                onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
              >
                <option value="Zona A - Elektronik">Zona A - Elektronik &amp; High-Value</option>
                <option value="Zona B - Packaging & Logistik">Zona B - Packaging &amp; Dus Logistik</option>
                <option value="Zona C - ATK & Stiker Thermal">Zona C - ATK &amp; Stiker Thermal</option>
                <option value="Zona D - Peralatan K3 & Safety">Zona D - Peralatan K3 &amp; Safety</option>
              </Select>
            </Field>

            <Field label="Kapasitas Maksimal (Box / Dus)" required>
              <Input
                type="number"
                min="1"
                required
                value={formData.kapasitas}
                onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })}
              />
            </Field>

            <Field label="Catatan / Dimensi Fisik">
              <Input
                type="text"
                placeholder="Opsional: misal 200cm x 100cm x 50cm"
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Modal QR Code */}
      <Modal
        open={!!qrModalRak}
        onClose={() => setQrModalRak(null)}
        title={qrModalRak?.kode ?? ''}
        subtitle={qrModalRak?.zona ?? ''}
        icon={QrCode}
        maxWidth="max-w-sm"
        footer={
          <>
            <Btn variant="secondary" onClick={() => setQrModalRak(null)}>Tutup</Btn>
            <Btn
              variant="primary"
              icon={Printer}
              onClick={() => {
                alert(`Mengirim dokumen stiker barcode ${qrModalRak.kode} ke printer thermal...`)
                setQrModalRak(null)
              }}
            >
              Cetak Stiker Rak
            </Btn>
          </>
        }
      >
        <div className="flex flex-col items-center">
          <div className="inline-block rounded-lg border-2 border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="grid size-36 place-items-center rounded bg-white p-2 shadow-sm border border-[#E5E7EB]">
              <div className="flex flex-col items-center">
                <div className="flex gap-1">
                  <div className="size-8 border-4 border-black" />
                  <div className="size-8 bg-black" />
                  <div className="size-8 border-4 border-black" />
                </div>
                <span className="mt-2 font-mono text-[9px] font-bold tracking-widest text-black">
                  {qrModalRak?.kode.replace(/\s+/g, '-')}
                </span>
              </div>
            </div>
            <span className="mt-2 block text-center font-mono text-[12px] text-[#6B7280]">
              ID: WH01-{qrModalRak?.kode.replace(/\s+/g, '')}
            </span>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}
