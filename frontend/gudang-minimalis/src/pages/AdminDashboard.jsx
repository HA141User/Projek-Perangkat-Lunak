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
import { getAuth, clearAuth } from '../lib/auth'

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

const activities = [
  {
    code: 'USER_CREATE',
    title: 'Admin mendaftarkan pengguna baru: Siti Aminah (Staf)',
    time: '10 mnt lalu',
    description:
      'Menetapkan peran Staf Gudang Lapangan dengan akses scanning Opname khusus Zona A.',
    actor: 'Hendrawan Putra (Kepala Gudang)',
    meta: 'IP: 192.168.1.104 · 14:22:10 WIB',
  },
  {
    code: 'SYSTEM_AUTO',
    title: 'Sistem mengirimkan Laporan Otomatis Mingguan',
    time: '2 jam lalu',
    description:
      'Rekap inventaris dan mutasi stok mingguan berhasil didistribusikan ke 3 penerima operasional (Format PDF & XLSX).',
    actor: 'Daemon Scheduler WH-01',
    meta: 'Trigger: Cronjob Weekly · 12:00:00 WIB',
  },
  {
    code: 'UPDATE_MASTER',
    title: 'Pembaruan batas minimum stok: Kabel UTP Cat6',
    time: 'Kemarin',
    description:
      'Ambang batas peringatan stok kritis disesuaikan dari 5 unit menjadi 8 unit sesuai rekomendasi buffer logistik Q4.',
    actor: 'Hendrawan Putra (Kepala Gudang)',
    meta: 'SKU: CBL-CAT6-100M · 16:45:18 WIB',
  },
  {
    code: 'AUDIT_SUBMIT',
    title: 'Staf Budi Santoso menyelesaikan input Opname RAK A-12',
    time: 'Kemarin',
    description:
      'Total 14 item fisik diverifikasi melalui handheld scanner. Berkas saat ini menunggu verifikasi persetujuan Kepala Gudang.',
    actor: 'Budi Santoso (Staf Gudang)',
    meta: '[ZONE A] 01-12-RACK-C · 11:39:42 WIB',
  },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()

  function handleLogout() {
    clearAuth()
    navigate('/login')
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
          dan aktivitas pengguna terkini.
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
              <a
                href="#template-impor"
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0037B0] hover:underline"
              >
                <Download size={13} />
                Unduh Template XLSX
              </a>
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
            {activities.map((item) => (
              <article
                key={item.code}
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
            ))}

            <div className="flex items-center justify-between pt-1 text-[12px] text-[#6B7280]">
              <span>Menampilkan 4 dari 1.289 baris log</span>
              <a href="#arsip-audit" className="font-medium text-[#0037B0] hover:underline">
                Unduh Arsip Audit .CSV
              </a>
            </div>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  )
}
