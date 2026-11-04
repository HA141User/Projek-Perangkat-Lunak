import { useState } from 'react'
import { useNavigate } from 'react-router'
import { BellRing, FileText, CheckCircle2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import Btn from '../components/ui/Btn'
import { getAuth, clearAuth } from '../lib/auth'

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

const DUMMY_NOTIF = [
  { id: 1, tipe: 'stok_kritis', judul: 'Stok Kritis: Tinta Printer Canon', deskripsi: 'Stok di Rak B-01 tersisa 3 unit, di bawah batas minimum (10 unit).', waktu: '04 Nov, 16:45', dibaca: false },
  { id: 2, tipe: 'laporan', judul: 'Laporan Bulanan Oktober Dikirim', deskripsi: 'Laporan inventaris Oktober 2024 berhasil digenerate dan dikirim ke email Kepala Gudang.', waktu: '04 Nov, 14:00', dibaca: false },
  { id: 3, tipe: 'stok_kritis', judul: 'Stok Kritis: Cutter Besar', deskripsi: 'Stok di Rak D-02 tersisa 2 unit, di bawah batas minimum (5 unit).', waktu: '04 Nov, 11:30', dibaca: false },
  { id: 4, tipe: 'opname', judul: 'Opname OPN-2024-002 Disetujui', deskripsi: 'Sesi opname Rak B-03 oleh Siti Rahayu telah disetujui. Stok diperbarui.', waktu: '04 Nov, 10:15', dibaca: true },
  { id: 5, tipe: 'laporan', judul: 'Laporan Mingguan Siap Diunduh', deskripsi: 'Laporan periode 28 Okt – 3 Nov 2024 tersedia untuk diunduh.', waktu: '03 Nov, 18:00', dibaca: true },
  { id: 6, tipe: 'stok_kritis', judul: 'Stok Kritis: Kertas F4 70gr', deskripsi: 'Stok di Rak A-03 tersisa 8 unit, di bawah batas minimum (20 unit).', waktu: '03 Nov, 09:20', dibaca: true },
]

export default function NotifikasiKepala() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [notifs, setNotifs] = useState(DUMMY_NOTIF)

  function handleLogout() { clearAuth(); navigate('/login') }
  function tandaiSemuaDibaca() { setNotifs((prev) => prev.map((n) => ({ ...n, dibaca: true }))) }

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
        <div className="flex flex-col gap-3">
          {notifs.map((n) => {
            const meta = TIPE[n.tipe]
            const Icon = meta.icon
            return (
              <div
                key={n.id}
                className={`relative rounded-xl border bg-white p-5 transition-colors ${
                  n.dibaca ? 'border-[#E5E7EB] opacity-70' : 'border-[#0037B0]/20 ring-1 ring-[#0037B0]/10'
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
      </div>
    </AppShell>
  )
}
