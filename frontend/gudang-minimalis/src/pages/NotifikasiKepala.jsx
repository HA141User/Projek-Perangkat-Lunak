import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BellRing, FileText, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import Btn from '../components/ui/Btn'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { formatDateTime } from '../lib/format'

const MENU_KEPALA = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Notifikasi', to: '/kepala-gudang/notifikasi' },
]

const TIPE = {
  stok_kritis: { icon: BellRing, variant: 'danger', label: 'Stok Kritis' },
  laporan:     { icon: FileText, variant: 'info', label: 'Laporan' },
  opname:      { icon: CheckCircle2, variant: 'success', label: 'Opname' },
}

function mapApiNotif(n, idx = 0) {
  const rawTipe = String(n.tipe ?? n.jenis ?? n.type ?? 'stok_kritis').toLowerCase()
  const tipe = rawTipe.includes('laporan') ? 'laporan' : rawTipe.includes('opname') ? 'opname' : 'stok_kritis'
  return {
    id: n.id_notif ?? n.id_notifikasi ?? n.id ?? idx + 1,
    tipe,
    judul: n.judul ?? n.title ?? (n.nama_barang ? `Stok Menipis: ${n.nama_barang} (${n.kode_barang ?? ''})` : 'Pemberitahuan Sistem WH-01'),
    deskripsi: n.pesan ?? n.deskripsi ?? n.message ?? '',
    waktu: formatDateTime(n.created_at ?? n.waktu),
    dibaca: Boolean(n.sudah_dibaca ?? n.dibaca ?? n.is_read ?? false),
  }
}

export default function NotifikasiKepala() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  // Ambil daftar notifikasi murni dari GET /api/notifications/
  useEffect(() => {
    let active = true
    async function loadNotifs() {
      setLoading(true)
      try {
        const res = await apiFetch('/api/notifications/')
        if (active && res.ok) {
          const list = unwrapList(await res.json().catch(() => null))
          setNotifs(list.map(mapApiNotif))
        }
      } catch {
        /* biarkan kosong jika gagal */
      } finally {
        if (active) setLoading(false)
      }
    }
    loadNotifs()
    return () => { active = false }
  }, [])

  function handleLogout() { clearAuth(); navigate('/login') }

  async function tandaiSemuaDibaca() {
    setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true })))
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch {
      /* ignore */
    }
  }

  async function tandaiDibaca(notif) {
    if (notif.dibaca) return
    setNotifs((prev) => prev.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n)))
    try {
      await apiFetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
    } catch {
      /* ignore */
    }
  }

  const belumDibaca = notifs.filter((n) => !n.dibaca).length

  return (
    <AppShell
      menuItems={MENU_KEPALA}
      userName={user?.name ?? 'Kepala Gudang'}
      onLogout={handleLogout}
      pageTitle="Notifikasi"
      actions={
        belumDibaca > 0 && (
          <Btn variant="secondary" size="sm" onClick={tandaiSemuaDibaca}>
            Tandai Semua Dibaca
          </Btn>
        )
      }
    >
      <div className="mx-auto max-w-2xl">
        {/* Count */}
        {belumDibaca > 0 && (
          <p className="mb-4 text-[14px] text-[#6B7280]">
            <span className="font-semibold text-[#0037B0]">{belumDibaca}</span> notifikasi belum dibaca
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[14px] text-[#6B7280]">
            Memuat notifikasi dari server...
          </div>
        ) : notifs.length === 0 ? (
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-10 text-center text-[14px] text-[#6B7280]">
            Belum ada notifikasi di server.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifs.map((n) => {
              const meta = TIPE[n.tipe] || TIPE.stok_kritis
              const Icon = meta.icon
              return (
                <div
                  key={n.id}
                  onClick={() => tandaiDibaca(n)}
                  className={`relative cursor-pointer rounded-xl border bg-white p-5 transition-colors ${
                    n.dibaca ? 'border-[#E5E7EB] opacity-70' : 'border-[#0037B0]/20 ring-1 ring-[#0037B0]/10 hover:border-[#0037B0]/40'
                  }`}
                >
                  {!n.dibaca && (
                    <span className="absolute right-5 top-5 size-2 rounded-full bg-[#0037B0]" />
                  )}
                  <div className="flex items-start gap-4">
                    <div className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl ${
                      meta.variant === 'danger' ? 'bg-red-50 text-red-600' :
                      meta.variant === 'info' ? 'bg-blue-50 text-blue-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge variant={meta.variant}>{meta.label}</Badge>
                        <span className="text-[12px] text-[#6B7280]">{n.waktu}</span>
                      </div>
                      <p className="text-[14px] font-semibold text-[#111827]">{n.judul}</p>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-[#374151]">{n.deskripsi}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
