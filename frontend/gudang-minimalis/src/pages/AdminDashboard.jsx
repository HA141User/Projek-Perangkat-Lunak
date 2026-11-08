import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  UserPlus,
  PackagePlus,
  Grid2X2,
  CalendarClock,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock3,
  Info,
  Download,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { downloadCSV, fileStamp } from '../lib/csv'

const menu = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log Aktivitas', to: '/admin/log' },
]

const shortcuts = [
  {
    title: 'Tambah Pengguna Baru',
    description: 'Daftarkan akun staf atau pengawas baru ke sistem.',
    icon: UserPlus,
    to: '/admin/pengguna',
  },
  {
    title: 'Tambah Barang / SKU',
    description: 'Input item baru, stok awal, dan ambang batas.',
    icon: PackagePlus,
    to: '/admin/barang',
  },
  {
    title: 'Tambah Rak & Cetak QR',
    description: 'Registrasi kode rak baru & generate stiker QR.',
    icon: Grid2X2,
    to: '/admin/rak',
  },
  {
    title: 'Atur Jadwal Laporan',
    description: 'Konfigurasi berkala mutasi inventaris via Email.',
    icon: CalendarClock,
    to: '/admin/laporan-otomatis',
  },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [activities, setActivities] = useState([])
  const [totalLogCount, setTotalLogCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Ambil ringkasan dashboard & log audit terbaru murni dari API
  useEffect(() => {
    let active = true
    async function loadDashboard() {
      setLoading(true)
      try {
        const [, logsRes] = await Promise.all([
          apiFetch('/api/dashboard/'),
          apiFetch('/api/audit-logs'),
        ])
        if (active && logsRes.ok) {
          const payload = await logsRes.json().catch(() => null)
          const list = unwrapList(payload)
          setTotalLogCount(payload?.total ?? payload?.count ?? list.length)
          setActivities(
            list.slice(0, 6).map((l) => ({
              code: l.kode ?? l.aksi ?? l.action ?? 'SYSTEM_AUTO',
              title: l.judul ?? l.title ?? l.keterangan ?? 'Aktivitas Sistem WH-01',
              time: l.waktu ?? l.created_at ?? 'Baru saja',
              description: l.keterangan ?? l.deskripsi ?? l.description ?? '',
              actor: l.aktor ?? l.user_nama ?? l.user?.nama ?? 'Sistem WH-01',
              meta: `IP: ${l.ip ?? l.ip_address ?? '-'} · ${l.entitas ?? l.target ?? 'WH-01'}`,
            }))
          )
        }
      } catch {
        /* biarkan kosong jika gagal */
      } finally {
        if (active) setLoading(false)
      }
    }
    loadDashboard()
    return () => { active = false }
  }, [])

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  function handleDownloadAudit() {
    downloadCSV(
      `arsip-audit-wh01-${fileStamp()}.csv`,
      ['KODE', 'JUDUL', 'WAKTU', 'AKTOR', 'DETAIL', 'KETERANGAN'],
      activities.map((a) => [a.code, a.title, a.time, a.actor, a.meta, a.description]),
    )
  }

  function handleDownloadTemplate() {
    downloadCSV(
      `template-impor-inventaris-wh01-${fileStamp()}.csv`,
      ['SKU', 'NAMA_BARANG', 'KATEGORI', 'KODE_RAK', 'SATUAN', 'STOK_AWAL', 'MIN_STOK'],
      []
    )
  }

  return (
    <AppShell
      menuItems={menu}
      userName={user?.name || 'Admin'}
      onLogout={handleLogout}
      pageTitle="Ringkasan Sistem & Administrasi"
    >
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#111827]">Dashboard Admin</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Selamat datang, {user?.name || 'Admin'}. Berikut ringkasan status operasional real-time
          dan aktivitas pengguna terkini dari server backend.
        </p>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-[1fr_1.4fr] items-start gap-5 max-lg:grid-cols-1">

        {/* Card — Akses Cepat */}
        <Card>
          <CardHeader
            title="Akses Cepat Administrasi"
            description="Pintasan untuk operasional harian dan konfigurasi master data."
          />
          <CardBody className="flex flex-col gap-3">
            {shortcuts.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 transition hover:border-[#0037B0]/30 hover:bg-[#EFF6FF]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white border border-[#E5E7EB] text-[#0037B0]">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <strong className="block text-[14px] font-semibold text-[#111827]">
                      {item.title}
                    </strong>
                    <span className="mt-0.5 block text-[13px] text-[#6B7280]">
                      {item.description}
                    </span>
                  </span>
                  <ArrowRight size={16} className="shrink-0 text-[#6B7280]" />
                </Link>
              )
            })}

            {/* Info import massal */}
            <div className="mt-1 rounded-lg border border-blue-100 bg-[#EFF6FF] px-4 py-3">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0037B0]">
                <Info size={15} />
                Butuh Impor Data Massal?
              </div>
              <p className="mt-1 text-[13px] text-[#6B7280]">
                Unduh formulir template spreadsheet untuk mengunggah ratusan SKU atau mapping
                lokasi rak secara instan.
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-[#0037B0] hover:underline"
              >
                <Download size={13} />
                Unduh Template XLSX
              </button>
            </div>
          </CardBody>
        </Card>

        {/* Card — Log Aktivitas */}
        <Card>
          <CardHeader
            title="Log Aktivitas Terakhir"
            description="Catatan audit riwayat operasional dan aksi pengguna terkini."
            actions={
              <Link
                to="/admin/log"
                className="flex items-center gap-1 text-[13px] font-medium text-[#0037B0] hover:underline"
              >
                Lihat Semua <ArrowUpRight size={13} />
              </Link>
            }
          />
          <CardBody className="flex flex-col gap-3">
            {loading ? (
              <p className="py-8 text-center text-[13.5px] text-[#6B7280]">
                Memuat log aktivitas dari server...
              </p>
            ) : activities.length === 0 ? (
              <p className="py-8 text-center text-[13.5px] text-[#6B7280]">
                Belum ada catatan log aktivitas di database.
              </p>
            ) : (
              activities.map((item, idx) => (
                <article
                  key={`${item.code}-${idx}`}
                  className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                >
                  <div className="flex flex-wrap items-start gap-2">
                    <Badge variant="info">{item.code}</Badge>
                    <h4 className="min-w-0 flex-1 text-[14px] font-semibold text-[#111827] leading-snug">
                      {item.title}
                    </h4>
                    <time className="shrink-0 text-[12px] text-[#6B7280]">{item.time}</time>
                  </div>

                  <p className="mt-2 text-[13px] text-[#6B7280] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#6B7280]">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck size={12} />
                      {item.actor}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={12} />
                      {item.meta}
                    </span>
                  </div>
                </article>
              ))
            )}

            <div className="flex items-center justify-between pt-1 text-[12px] text-[#6B7280]">
              <span>Menampilkan {activities.length} dari {totalLogCount.toLocaleString('id-ID')} baris log</span>
              <button
                type="button"
                onClick={handleDownloadAudit}
                className="inline-flex cursor-pointer items-center gap-1.5 font-medium text-[#0037B0] hover:underline"
              >
                <Download size={13} />
                Unduh Arsip Audit .CSV
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
