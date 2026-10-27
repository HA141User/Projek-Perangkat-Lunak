
import { Link } from 'react-router'
import {
  UserPlus,
  PackagePlus,
  Grid2X2,
  CalendarClock,
  Info,
  Download,
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock3,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const menu = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log', to: '/admin/log' },
]

const shortcuts = [
  {
    title: 'Tambah Pengguna Baru',
    description: 'Daftarkan akun staf atau pengawas baru',
    icon: UserPlus,
    to: '/admin/pengguna',
  },
  {
    title: 'Tambah Barang / SKU',
    description: 'Input item baru, stok awal, dan ambang batas',
    icon: PackagePlus,
    to: '/admin/barang',
  },
  {
    title: 'Tambah Rak & Cetak QR',
    description: 'Registrasi kode rak baru & generate stiker QR',
    icon: Grid2X2,
    to: '/admin/rak',
  },
  {
    title: 'Atur Jadwal Laporan',
    description: 'Konfigurasi berkala mutasi inventaris via Email',
    icon: CalendarClock,
    to: '/admin/laporan-otomatis',
  },
]

const activities = [
  {
    code: 'USER_CREATE',
    title: 'Admin mendaftarkan pengguna baru: Siti Aminah (Staf)',
    time: '10 mnt lalu',
    description: 'Menetapkan peran Staf Gudang Lapangan dengan akses scanning Opname khusus Zona A.',
    actor: 'Hendrawan Putra (Kepala Gudang)',
    meta: 'IP: 192.168.1.104 · 14:22:10 WIB',
  },
  {
    code: 'SYSTEM_AUTO',
    title: 'Sistem mengirimkan Laporan Otomatis Mingguan',
    time: '2 jam lalu',
    description: 'Rekap inventaris dan mutasi stok mingguan berhasil didistribusikan ke 3 penerima operasional (Format PDF & XLSX).',
    actor: 'Daemon Scheduler WH-01',
    meta: 'Trigger: Cronjob Weekly · 12:00:00 WIB',
  },
  {
    code: 'UPDATE_MASTER',
    title: 'Pembaruan batas minimum stok: Kabel UTP Cat6',
    time: 'Kemarin',
    description: 'Ambang batas peringatan stok kritis disesuaikan dari 5 unit menjadi 8 unit sesuai rekomendasi buffer logistik Q4.',
    actor: 'Hendrawan Putra (Kepala Gudang)',
    meta: 'SKU: CBL-CAT6-100M · 16:45:18 WIB',
  },
  {
    code: 'AUDIT_SUBMIT',
    title: 'Staf Budi Santoso menyelesaikan input Opname RAK A-12',
    time: 'Kemarin',
    description: 'Total 14 item fisik diverifikasi melalui handheld scanner. Berkas saat ini menunggu verifikasi persetujuan Kepala Gudang.',
    actor: 'Budi Santoso (Staf Gudang)',
    meta: '[ZONE A] 01-12-RACK-C · 11:39:42 WIB',
  },
]

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-page max-md:flex-col">
      <Sidebar items={menu} admin />

      <main className="min-w-0 flex-1">
        <header className="flex h-11 items-center border-b border-slate-100 bg-white px-5">
          <h1 className="text-xs font-semibold">Halo, Admin</h1>
        </header>

        <div className="px-5 pb-8 max-sm:px-3">
          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[8px] tracking-wide">
            <span className="text-brand">WH-01 // PUSAT LOGISTIK</span>
            <span className="text-slate-400">•</span>
            <span>SISTEM INVENTARIS V2.4</span>
          </div>

          <section className="mb-6 mt-1">
            <h2 className="text-[21px] font-semibold tracking-tight max-sm:text-lg">
              Ringkasan Sistem &amp; Administrasi
            </h2>
            <p className="mt-1 max-w-2xl text-[10px] leading-relaxed text-muted-dark">
              Selamat datang, Admin. Berikut adalah ringkasan status operasional
              real-time, aktivitas pengguna aktif, serta metrik ketersediaan
              master data gudang.
            </p>
          </section>

          <div className="grid grid-cols-[0.78fr_1.12fr] items-start gap-4 max-lg:grid-cols-1">
            {/* AKSES ADMINISTRASI */}
            <section className="rounded-lg border border-slate-100 bg-white p-3.5">
              <h3 className="text-[10px] font-semibold">
                Akses Cepat Administrasi
              </h3>
              <p className="mt-1 text-[8px] leading-relaxed text-muted-dark">
                Pintasan cepat untuk operasional harian dan konfigurasi master data.
              </p>

              <div className="mt-4 flex flex-col gap-2">
                {shortcuts.map((item) => {
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="flex min-h-[45px] items-center gap-2 rounded border border-transparent bg-[#F7F8FF] p-2 transition hover:border-[#DFE5FF] hover:bg-[#EEF1FF]"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-white text-brand">
                        <Icon size={15} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <strong className="block text-[9px] font-semibold">
                          + {item.title}
                        </strong>
                        <span className="mt-1 block text-[7.5px] leading-relaxed text-muted-dark">
                          {item.description}
                        </span>
                      </span>

                      <ArrowRight size={16} className="shrink-0 text-slate-400" />
                    </Link>
                  )
                })}
              </div>

              <aside className="mt-3 rounded-sm bg-[#E9EDFF] p-3">
                <div className="flex items-center gap-2 text-[9px] font-semibold">
                  <Info size={13} className="text-brand" />
                  Kebutuhan Impor Data Massal?
                </div>
                <p className="ml-5 mt-1 text-[8px] leading-relaxed text-muted-dark">
                  Anda dapat mengunduh formulir template spreadsheet untuk
                  mengunggah ratusan SKU atau mapping lokasi rak secara instan.
                </p>
                <a href="#template-impor" className="ml-5 mt-2 inline-flex items-center gap-1 text-[8px] font-medium text-brand">
                  Unduh Template XLSX <Download size={11} />
                </a>
              </aside>
            </section>

            {/* LOG AKTIVITAS */}
            <section className="min-w-0 rounded-lg border border-slate-100 bg-white p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[10px] font-semibold">
                    Aktivitas &amp; Log Sistem Terakhir
                  </h3>
                  <p className="mt-1 text-[8px] leading-relaxed text-muted-dark">
                    Catatan audit riwayat operasional dan aksi pengguna terkini
                  </p>
                </div>
                <Link to="/admin/log" className="flex shrink-0 items-center gap-1 pt-1 text-[8px] text-brand">
                  Lihat Semua Log <ArrowUpRight size={12} />
                </Link>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                {activities.map((item) => (
                  <article key={item.code} className="rounded-sm border border-[#E9EDFF] bg-[#F0F3FF] p-2.5">
                    <div className="flex flex-wrap items-start gap-1.5">
                      <span className="bg-[#DFE7FF] px-1 py-1 font-mono text-[7px] text-brand">
                        {item.code}
                      </span>
                      <h4 className="min-w-0 flex-1 text-[8.5px] font-semibold leading-relaxed">
                        {item.title}
                      </h4>
                      <time className="ml-auto shrink-0 font-mono text-[7px] text-muted">
                        {item.time}
                      </time>
                    </div>

                    <p className="mt-1.5 text-[7.5px] leading-relaxed text-muted-dark">
                      {item.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[6.8px] leading-relaxed text-muted">
                      <span className="inline-flex items-center gap-1 font-sans">
                        <ShieldCheck size={9} />
                        {item.actor}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={9} />
                        {item.meta}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[7px] text-muted">
                <span>Menampilkan 4 aktivitas terakhir dari 1.289 baris log</span>
                <a href="#arsip-audit" className="text-brand">
                  Unduh Arsip Audit .CSV
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
