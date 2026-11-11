import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { CheckCircle2, XCircle, ClipboardCheck, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
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

  useEffect(() => {
    let active = true
    async function loadOpnames() {
      setLoading(true)
      setErrorBanner('')
      try {
        const res = await apiFetch('/api/opnames/')
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          if (active) setErrorBanner(extractApiError(err, `Gagal memuat daftar opname (${res.status})`))
          return
        }
        const list = unwrapList(await res.json().catch(() => null))
        if (active) {
          setSessions(list)
          if (list.length > 0) {
            const first = list[0]
            setSelectedSessionId(first.id_opname ?? first.id)
          }
        }
      } catch {
        if (active) setErrorBanner('Gagal terhubung ke server untuk memuat sesi opname.')
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOpnames()
    return () => { active = false }
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
    </AppShell>
  )
}
