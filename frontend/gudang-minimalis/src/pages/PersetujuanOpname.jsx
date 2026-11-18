import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, XCircle, ClipboardCheck, AlertTriangle, Plus } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { Select } from '../components/ui/Form'
import { KpiCard, Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { extractApiError, formatDateTime } from '../lib/format'

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

const FINAL_STATUSES = new Set(['DISETUJUI', 'DITOLAK', 'FINAL', 'APPROVED', 'REJECTED', 'SELESAI'])

export default function PersetujuanOpname() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const role = user?.role || 'KEPALA_GUDANG'
  const menuItems = role === 'ADMIN' ? MENU_ADMIN : MENU_KEPALA

  const [sessions, setSessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [note, setNote] = useState('')
  const [outcome, setOutcome] = useState(null)
  const [errorBanner, setErrorBanner] = useState('')

  // State untuk Modal Buat Sesi & Input Stok Opname
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [rakItemsMap, setRakItemsMap] = useState({})
  const [loadingItems, setLoadingItems] = useState(false)
  const [selectedRak, setSelectedRak] = useState('')
  const [opnameKeterangan, setOpnameKeterangan] = useState('')
  const [opnameInputs, setOpnameInputs] = useState({})
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  async function reloadOpnames(selectId = null) {
    setLoading(true)
    setErrorBanner('')
    try {
      const res = await apiFetch('/api/opnames/')
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setErrorBanner(extractApiError(err, `Gagal memuat daftar opname (${res.status})`))
        return
      }
      const list = unwrapList(await res.json().catch(() => null))
      setSessions(list)
      if (selectId) {
        setSelectedSessionId(selectId)
      } else if (list.length > 0) {
        const first = list[0]
        setSelectedSessionId(first.id_opname ?? first.id)
      }
    } catch {
      setErrorBanner('Gagal terhubung ke server untuk memuat sesi opname.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadOpnames()
  }, [])

  useEffect(() => {
    if (!selectedSessionId) return
    let active = true
    async function loadDetail() {
      setLoadingDetails(true)
      try {
        const res = await apiFetch(`/api/opnames/${selectedSessionId}`)
        if (active && res.ok) {
          const payload = await res.json().catch(() => null)
          const data = payload?.data ?? payload ?? {}
          const rawDetails = data.details ?? data.items ?? data.rincian ?? (Array.isArray(data) ? data : [])
          setDetails(
            rawDetails.map((d, idx) => {
              const sistem = Number(d.stok_sistem ?? d.stokSistem ?? 0)
              const fisik = Number(d.stok_fisik ?? d.stokFisik ?? sistem)
              return {
                id: d.id_detail ?? d.id ?? idx + 1,
                sku: d.sku ?? d.kode_barang ?? d.item?.kode_barang ?? '-',
                nama: d.nama ?? d.nama_barang ?? d.item?.nama_barang ?? '-',
                stokSistem: sistem,
                stokFisik: fisik,
                selisih: Number(d.selisih ?? fisik - sistem),
                keterangan: d.keterangan ?? d.catatan ?? '-',
              }
            })
          )
        }
      } catch {
        /* ignore */
      } finally {
        if (active) setLoadingDetails(false)
      }
    }
    loadDetail()
    return () => { active = false }
  }, [selectedSessionId])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  async function handleFinalize(approved) {
    if (!selectedSessionId || submitting) return
    setSubmitting(true)
    setErrorBanner('')
    setOutcome(null)
    try {
      const res = await apiFetch(`/api/opnames/${selectedSessionId}/finalize`, {
        method: 'POST',
        body: JSON.stringify({
          sinkronkan: Boolean(approved),
          ...(note.trim() ? { keterangan: note.trim() } : {}),
        }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(extractApiError(payload, `Gagal memfinalisasi opname (${res.status})`))
      }
      const nextStatus = payload.status || (approved ? 'disetujui' : 'ditolak')
      setOutcome(approved ? 'approved' : 'rejected')
      setSessions((prev) =>
        prev.map((s) =>
          (s.id_opname ?? s.id) === selectedSessionId ? { ...s, status: nextStatus } : s
        )
      )
    } catch (err) {
      setErrorBanner(err.message || 'Gagal memproses persetujuan opname.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleOpenCreate() {
    setCreateError('')
    setOpnameInputs({})
    setOpnameKeterangan('')
    setSelectedRak('')
    setShowCreateModal(true)
    if (Object.keys(rakItemsMap).length === 0) {
      setLoadingItems(true)
      try {
        const res = await apiFetch('/api/items/')
        if (res.ok) {
          const list = unwrapList(await res.json().catch(() => null))
          const grouped = {}
          list.forEach((it, idx) => {
            if (!it || typeof it !== 'object') return
            const rak = String(
              it.rak ?? it.kode_lokasi ?? it.lokasi?.nama_rak ?? it.lokasi?.kode_lokasi ?? 'UMUM'
            ).replace(/^RAK\s+/i, '')
            if (!grouped[rak]) grouped[rak] = []
            grouped[rak].push({
              id: it.id_barang ?? it.id ?? idx + 1,
              sku: it.sku ?? it.kode_barang ?? `BRG-00${idx + 1}`,
              nama: it.nama ?? it.nama_barang ?? '-',
              stokSistem: Number(it.stok ?? it.stok_saat_ini ?? 0),
            })
          })
          setRakItemsMap(grouped)
          const firstRak = Object.keys(grouped)[0] ?? ''
          setSelectedRak(firstRak)
        }
      } catch {
        setCreateError('Gagal memuat daftar barang dari server.')
      } finally {
        setLoadingItems(false)
      }
    } else {
      const firstRak = Object.keys(rakItemsMap)[0] ?? ''
      setSelectedRak(firstRak)
    }
  }

  const modalRakList = Object.keys(rakItemsMap)
  const modalItems = selectedRak ? (rakItemsMap[selectedRak] ?? []) : []

  async function handleCreateSubmit(e) {
    e?.preventDefault?.()
    if (!selectedRak || modalItems.length === 0) {
      setCreateError('Pilih rak yang memiliki barang terlebih dahulu.')
      return
    }
    setCreating(true)
    setCreateError('')
    try {
      const ket = opnameKeterangan.trim() || `Audit Rak ${selectedRak}`
      const res = await apiFetch('/api/opnames/', {
        method: 'POST',
        body: JSON.stringify({ keterangan: ket }),
      })
      const created = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(extractApiError(created, `Gagal membuat sesi opname (${res.status})`))
      }
      const opnameId = created?.id_opname ?? created?.data?.id_opname ?? created?.data?.id ?? created?.id
      if (!opnameId) throw new Error('ID sesi opname tidak ditemukan pada respons server.')

      for (const item of modalItems) {
        const raw = opnameInputs[item.sku]?.stokFisik
        const stokFisik =
          raw === '' || raw === undefined ? item.stokSistem : Math.max(0, Math.trunc(Number(raw)))
        const catatan = (opnameInputs[item.sku]?.keterangan ?? '').trim()
        const detRes = await apiFetch(`/api/opnames/${opnameId}/details`, {
          method: 'POST',
          body: JSON.stringify({
            barang_id: Number(item.id),
            stok_fisik: Number(stokFisik),
            ...(catatan ? { keterangan: catatan } : {}),
          }),
        })
        if (!detRes.ok) {
          const detErr = await detRes.json().catch(() => ({}))
          throw new Error(extractApiError(detErr, `Gagal menyimpan rincian ${item.sku} (${detRes.status})`))
        }
      }

      setShowCreateModal(false)
      await reloadOpnames(opnameId)
    } catch (err) {
      setCreateError(err.message || 'Gagal menyimpan sesi opname.')
    } finally {
      setCreating(false)
    }
  }

  const currentSession = sessions.find((s) => (s.id_opname ?? s.id) === selectedSessionId)
  const isFinalized = FINAL_STATUSES.has(String(currentSession?.status ?? '').toUpperCase())
  const totalDiperiksa = details.length
  const totalSesuai = details.filter((d) => d.selisih === 0).length
  const totalSelisih = details.filter((d) => d.selisih !== 0).length

  return (
    <AppShell
      menuItems={menuItems}
      userName={user?.name || 'Kepala Gudang'}
      onLogout={handleLogout}
      pageTitle="Persetujuan Stok Opname"
      actions={
        <Btn variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Buat Sesi Opname
        </Btn>
      }
    >
      {errorBanner && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Session Selector */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-center gap-2 text-[13.5px] font-medium text-[#111827]">
          <ClipboardCheck size={16} className="text-[#0037B0]" />
          <span>Pilih Sesi Opname:</span>
        </div>
        <select
          value={selectedSessionId ?? ''}
          onChange={(e) => {
            const val = e.target.value ? Number(e.target.value) || e.target.value : null
            setSelectedSessionId(val)
            if (!val) setDetails([])
            setOutcome(null)
            setErrorBanner('')
          }}
          className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8]"
        >
          {sessions.length === 0 && <option value="">Belum ada sesi opname di server</option>}
          {sessions.map((s, idx) => {
            const id = s.id_opname ?? s.id ?? idx + 1
            const tgl = s.tanggal_opname ? formatDateTime(s.tanggal_opname, false) : ''
            const label = s.rak ?? s.kode_lokasi ?? (tgl || 'Gudang WH-01')
            const status = s.status ?? 'draft'
            return (
              <option key={id} value={id}>
                Sesi #{id} · {label} ({status})
              </option>
            )
          })}
        </select>
      </div>

      {/* KPI Summary */}
      <div className="mb-5 grid grid-cols-3 gap-4 max-sm:grid-cols-1">
        <KpiCard
          label="Total Item Diperiksa"
          value={String(totalDiperiksa)}
          unit="SKU"
          delta={currentSession ? `Sesi #${selectedSessionId} (${currentSession.status ?? 'draft'})` : 'Tidak ada sesi'}
          deltaGood
        />
        <KpiCard
          label="Stok Sesuai"
          value={String(totalSesuai)}
          unit="Item"
          delta="Sinkron fisik & sistem"
          deltaGood
        />
        <KpiCard
          label="Stok Berselisih"
          value={String(totalSelisih)}
          unit="Item"
          delta={totalSelisih > 0 ? 'Perlu penyesuaian' : 'Tidak ada selisih'}
          deltaGood={totalSelisih === 0}
        />
      </div>

      {/* Comparison Table */}
      <Card className="mb-5">
        <CardHeader
          title="Rincian Komparasi Stok Fisik"
          description="Daftar rekonsiliasi antara stok sistem dan temuan fisik petugas di lapangan."
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">SKU &amp; Nama Barang</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Stok Sistem</th>
                  <th className="px-4 py-3 text-right text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Hitung Fisik</th>
                  <th className="px-4 py-3 text-center text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Selisih</th>
                  <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Catatan Staf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {loading || loadingDetails ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                      Memuat data opname dari server...
                    </td>
                  </tr>
                ) : details.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                      Belum ada rincian item opname pada sesi ini di server.
                    </td>
                  </tr>
                ) : (
                  details.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3">
                        <span className="block text-[13.5px] font-semibold text-[#111827]">{d.nama}</span>
                        <span className="font-mono text-[12px] text-[#0037B0]">{d.sku}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[13.5px] text-[#374151]">{d.stokSistem}</td>
                      <td className="px-4 py-3 text-right font-mono text-[13.5px] font-semibold text-[#111827]">{d.stokFisik}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={d.selisih === 0 ? 'success' : 'danger'}>
                          {d.selisih > 0 ? `+${d.selisih}` : d.selisih}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-[#6B7280]">{d.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Verification Note & Action Buttons */}
      {selectedSessionId && (
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
          <label className="mb-1.5 block text-[13.5px] font-semibold text-[#111827]">
            Catatan Verifikasi &amp; Instruksi Kepala Gudang
          </label>
          <textarea
            rows={3}
            value={note}
            disabled={isFinalized || submitting}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Tuliskan instruksi penyesuaian atau pertimbangan persetujuan..."
            className="mb-4 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8] disabled:opacity-60"
          />

          {outcome && (
            <div className={`mb-4 rounded-lg border px-4 py-3 text-[13.5px] ${
              outcome === 'approved'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {outcome === 'approved'
                ? 'Laporan opname berhasil disetujui dan stok sistem telah disesuaikan.'
                : 'Laporan opname ditolak. Staf akan diminta melakukan hitung ulang.'}
            </div>
          )}

          {isFinalized && !outcome && (
            <div className="mb-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-2.5 text-[13px] text-[#6B7280]">
              Sesi opname ini berstatus <strong>{currentSession?.status}</strong> dan sudah difinalisasi.
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3">
            <Btn
              variant="danger"
              icon={XCircle}
              loading={submitting}
              disabled={isFinalized || submitting}
              onClick={() => handleFinalize(false)}
            >
              Tolak &amp; Minta Hitung Ulang
            </Btn>
            <Btn
              variant="primary"
              icon={CheckCircle2}
              loading={submitting}
              disabled={isFinalized || submitting}
              onClick={() => handleFinalize(true)}
            >
              Setujui &amp; Sesuaikan Stok Sistem
            </Btn>
          </div>
        </div>
      )}

      {/* Modal Buat Sesi & Input Stok Opname */}
      <Modal
        open={showCreateModal}
        onClose={() => !creating && setShowCreateModal(false)}
        title="Buat Sesi & Input Stok Opname Fisik"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Pilih Rak</label>
              <Select
                value={selectedRak}
                onChange={(e) => {
                  setSelectedRak(e.target.value)
                  setOpnameInputs({})
                }}
                disabled={loadingItems}
              >
                {modalRakList.length === 0 ? (
                  <option value="">{loadingItems ? 'Memuat rak...' : 'Tidak ada rak'}</option>
                ) : (
                  modalRakList.map((rak) => (
                    <option key={rak} value={rak}>
                      Rak {rak} ({rakItemsMap[rak].length} barang)
                    </option>
                  ))
                )}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">Keterangan Sesi (Opsional)</label>
              <input
                type="text"
                value={opnameKeterangan}
                onChange={(e) => setOpnameKeterangan(e.target.value)}
                placeholder={selectedRak ? `Audit Rak ${selectedRak}` : 'Keterangan sesi opname'}
                className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[13.5px] text-[#111827] outline-none focus:border-[#1D4ED8]"
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border border-[#E5E7EB]">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-[#F9FAFB]">
                <tr className="border-b border-[#E5E7EB]">
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase text-[#6B7280]">Barang / SKU</th>
                  <th className="px-3 py-2.5 text-right text-[11.5px] font-semibold uppercase text-[#6B7280]">Sistem</th>
                  <th className="px-3 py-2.5 text-right text-[11.5px] font-semibold uppercase text-[#6B7280]">Stok Fisik</th>
                  <th className="px-3 py-2.5 text-center text-[11.5px] font-semibold uppercase text-[#6B7280]">Selisih</th>
                  <th className="px-3 py-2.5 text-left text-[11.5px] font-semibold uppercase text-[#6B7280]">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {modalItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[13px] text-[#6B7280]">
                      {loadingItems ? 'Memuat daftar barang...' : 'Tidak ada barang di rak ini.'}
                    </td>
                  </tr>
                ) : (
                  modalItems.map((item) => {
                    const raw = opnameInputs[item.sku]?.stokFisik
                    const fisik = raw === '' || raw === undefined ? item.stokSistem : Math.max(0, Math.trunc(Number(raw)))
                    const selisih = fisik - item.stokSistem
                    return (
                      <tr key={item.id}>
                        <td className="px-3 py-2">
                          <span className="block text-[13px] font-medium text-[#111827]">{item.nama}</span>
                          <span className="font-mono text-[11.5px] text-[#0037B0]">{item.sku}</span>
                        </td>
                        <td className="px-3 py-2 text-right text-[13px] text-[#374151]">{item.stokSistem}</td>
                        <td className="px-3 py-2 text-right">
                          <input
                            type="number"
                            min={0}
                            placeholder={String(item.stokSistem)}
                            value={opnameInputs[item.sku]?.stokFisik ?? ''}
                            onChange={(e) =>
                              setOpnameInputs((p) => ({
                                ...p,
                                [item.sku]: { ...p[item.sku], stokFisik: e.target.value },
                              }))
                            }
                            className="w-20 rounded-md border border-[#E5E7EB] px-2 py-1 text-right text-[13px] outline-none focus:border-[#1D4ED8]"
                          />
                        </td>
                        <td className={`px-3 py-2 text-center text-[13px] font-semibold ${selisih === 0 ? 'text-emerald-600' : selisih < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                          {selisih > 0 ? `+${selisih}` : selisih}
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Opsional..."
                            value={opnameInputs[item.sku]?.keterangan ?? ''}
                            onChange={(e) =>
                              setOpnameInputs((p) => ({
                                ...p,
                                [item.sku]: { ...p[item.sku], keterangan: e.target.value },
                              }))
                            }
                            className="w-full rounded-md border border-[#E5E7EB] px-2 py-1 text-[12.5px] outline-none focus:border-[#1D4ED8]"
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Btn variant="secondary" type="button" disabled={creating} onClick={() => setShowCreateModal(false)}>
              Batal
            </Btn>
            <Btn variant="primary" type="submit" loading={creating} disabled={creating || modalItems.length === 0}>
              Simpan Sesi Opname
            </Btn>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
