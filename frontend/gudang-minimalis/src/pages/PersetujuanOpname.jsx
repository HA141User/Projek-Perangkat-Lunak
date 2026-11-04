import { useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, Eye, Check, ShieldCheck } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Field, Textarea } from '../components/ui/Form'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { apiFetch, getAuth, clearAuth } from '../lib/auth'
import { Store } from '../lib/store'

const MENU_KEPALA = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Notifikasi', to: '/kepala-gudang/notifikasi' },
]

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

function statusVariant(status) {
  if (status === 'MENUNGGU') return 'warning'
  if (status === 'DISETUJUI') return 'success'
  if (status === 'DITOLAK') return 'danger'
  return 'neutral'
}

export default function PersetujuanOpname() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [sessions, setSessions] = useState(() => Store.getOpnames())
  const [selectedRow, setSelectedRow] = useState(null)
  const [catatan, setCatatan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successBanner, setSuccessBanner] = useState('')

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function openModal(row) {
    setSelectedRow(row)
    setCatatan(row.notes || '')
    setError('')
  }

  function closeModal() {
    setSelectedRow(null)
    setCatatan('')
    setError('')
  }

  async function handleAction(action) {
    if (!selectedRow) return
    setLoading(true)
    setError('')

    const newStatus = action === 'approve' ? 'DISETUJUI' : 'DITOLAK'

    try {
      await apiFetch(`/api/opname/${selectedRow.id}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ catatan }),
      })

      Store.setOpnameStatus(selectedRow.id, newStatus, catatan)
      setSessions((prev) =>
        prev.map((s) => (s.id === selectedRow.id ? { ...s, status: newStatus, notes: catatan } : s))
      )
      setSuccessBanner(`Sesi ${selectedRow.noSesi} berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}.`)
      closeModal()
      setTimeout(() => setSuccessBanner(''), 4000)
    } catch (e) {
      setError(e.message || 'Terjadi kesalahan saat memproses keputusan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell
      menuItems={isAdmin ? MENU_ADMIN : MENU_KEPALA}
      userName={user?.name ?? (isAdmin ? 'Administrator' : 'Kepala Gudang')}
      onLogout={handleLogout}
      pageTitle="Persetujuan Opname"
    >
      {successBanner && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800">
          <CheckCircle2 size={16} />
          {successBanner}
        </div>
      )}

      <Card>
        <CardHeader
          title="Verifikasi & Pengesahan Opname"
          description="Periksa temuan selisih fisik yang diajukan oleh staf gudang sebelum stok resmi disesuaikan."
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">No</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Tanggal</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Staf</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Rak</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Jumlah Item</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Selisih</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Status</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {sessions.map((row, idx) => {
                  const selisih = row.selisihTotal ?? row.selisih
                  return (
                    <tr key={row.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3 text-[13.5px] text-[#111827]">{idx + 1}</td>
                      <td className="px-4 py-3 text-[13.5px] text-[#111827]">{row.tanggal}</td>
                      <td className="px-4 py-3 text-[13.5px] text-[#111827]">{row.staf}</td>
                      <td className="px-4 py-3 text-[13.5px] font-semibold text-[#0037B0]">{row.rak || row.lokasi}</td>
                      <td className="px-4 py-3 text-center text-[13.5px] text-[#111827]">
                        {row.itemCount || row.jumlahItem || 0} SKU
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[13.5px] font-semibold ${selisih < 0 ? 'text-red-600' : selisih > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                          {selisih > 0 ? `+${selisih}` : selisih} Unit
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusVariant(row.status)}>{row.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Btn size="sm" variant="secondary" icon={Eye} onClick={() => openModal(row)}>
                          Lihat Rincian
                        </Btn>
                      </td>
                    </tr>
                  )
                })}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                      Belum ada sesi opname yang diajukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Modal Detail & Persetujuan */}
      <Modal
        open={!!selectedRow}
        onClose={closeModal}
        title={selectedRow ? `Detail Audit Opname — ${selectedRow.rak || selectedRow.lokasi}` : ''}
        subtitle={selectedRow ? `${selectedRow.noSesi} · Diajukan oleh ${selectedRow.staf} · ${selectedRow.tanggal}` : ''}
        icon={ShieldCheck}
        maxWidth="max-w-2xl"
        footer={
          selectedRow && (
            <>
              <span className="mr-auto flex items-center gap-2 text-[13px] text-[#6B7280]">
                Status: <Badge variant={statusVariant(selectedRow.status)}>{selectedRow.status}</Badge>
              </span>
              <Btn variant="danger" onClick={() => handleAction('reject')} disabled={loading}>
                Tolak / Audit Ulang
              </Btn>
              <Btn variant="primary" icon={Check} onClick={() => handleAction('approve')} loading={loading}>
                Setujui & Sesuaikan Stok
              </Btn>
            </>
          )
        }
      >
        {selectedRow && (
          <>
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            {/* Items Table */}
            <div className="mb-4 overflow-hidden rounded-lg border border-[#E5E7EB]">
              <div className="max-h-60 overflow-y-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0">
                    <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Barang / SKU</th>
                      <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Sistem</th>
                      <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Fisik Riil</th>
                      <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Selisih</th>
                      <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Temuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB]">
                    {(selectedRow.items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAFB]">
                        <td className="px-4 py-3">
                          <span className="block text-[13.5px] font-medium text-[#111827]">{item.nama}</span>
                          <span className="text-[12px] text-[#6B7280]">{item.sku}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-[13.5px] text-[#111827]">{item.stokSistem ?? item.sistem}</td>
                        <td className="px-4 py-3 text-right text-[13.5px] font-semibold text-[#111827]">{item.stokFisik ?? item.fisik}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-[13.5px] font-semibold ${item.selisih < 0 ? 'text-red-600' : item.selisih > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13.5px] text-[#6B7280]">{item.keterangan || item.ket || '—'}</td>
                      </tr>
                    ))}
                    {(!selectedRow.items || selectedRow.items.length === 0) && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-[13.5px] text-[#6B7280]">
                          Item fisik telah diverifikasi tanpa catatan khusus.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Catatan */}
            <Field label="Catatan Pengesahan / Arahan Penyesuaian">
              <Textarea
                rows={2}
                placeholder="Tuliskan catatan tindak lanjut untuk staf logistik (opsional)..."
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />
            </Field>
          </>
        )}
      </Modal>
    </AppShell>
  )
}
