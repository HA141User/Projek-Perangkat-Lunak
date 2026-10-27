
import { Link } from 'react-router'
import {
  Bell,
  ClipboardList,
  AlertTriangle,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const menu = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Referensi Notifikasi', to: '/kepala-gudang/notifikasi' },
]

const criticalItems = [
  { rack: 'RAK A-12', name: 'Kabel LAN Cat6 50m', code: 'BRG-001', stock: '3 Dus', min: 'Min. 5 Dus' },
  { rack: 'RAK B-04', name: 'Switch Hub 8-Port Gigabit', code: 'BRG-004', stock: '2 Unit', min: 'Min. 8 Unit' },
]

export default function WarehouseDashboard() {
  return (
    <div className="flex min-h-screen bg-page max-md:flex-col">
      <Sidebar items={menu} />

      <main className="min-w-0 flex-1">
        <header className="flex h-11 items-center justify-between border-b border-slate-100 bg-white px-6">
          <h1 className="text-xs font-semibold">Halo, Kepala Gudang</h1>
          <button type="button" aria-label="Notifikasi" className="relative rounded bg-brand p-1.5 text-white">
            <Bell size={15} />
            <span className="absolute -right-1 -top-1 size-2 rounded-full bg-red-500" />
          </button>
        </header>

        <div className="p-6 max-sm:p-3">
          <div className="font-mono text-[8px] tracking-wider text-muted">
            <span className="text-brand">GUDANG WH-01 / DASHBOARD PENGAWAS</span>
          </div>

          <h2 className="mb-6 mt-1 text-[20px] font-semibold tracking-tight max-sm:text-base">
            Ringkasan Operasional &amp; Pengawasan Inventaris
          </h2>

          <section className="mb-6 grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <article className="rounded-lg border border-slate-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[8px] font-medium tracking-wider">
                  BARANG STOK KRITIS
                </span>
                <span className="bg-[#FFDCD8] px-2 py-1 text-[8px] text-red-700">
                  ! Perlu Restock Segera
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <strong className="text-2xl text-critical">3</strong>
                <span className="text-[9px] text-critical">Item Menipis</span>
              </div>
              <p className="mt-1 text-[9px] text-muted-dark">
                Di bawah ambang batas minimum (≤ 5 unit)
              </p>
              <div className="mt-3 h-1 overflow-hidden rounded bg-field">
                <div className="h-full w-1/4 bg-critical" />
              </div>
              <p className="mt-2 font-mono text-[8px] text-muted">
                Rasio Kritis: 0.24% Inventaris
              </p>
            </article>

            <article className="rounded-lg border border-slate-100 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[8px] font-medium tracking-wider">
                  PERSETUJUAN OPNAME
                </span>
                <span className="flex items-center gap-1 bg-[#DFE5FF] px-2 py-1 text-[8px] text-brand">
                  <ClipboardList size={10} /> Perlu Review
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <strong className="text-2xl text-brand">2</strong>
                <span className="text-[9px]">Laporan Masuk</span>
              </div>
              <p className="mt-1 text-[9px] text-muted-dark">
                Hasil audit fisik siklus Oktober 2024
              </p>
            </article>
          </section>

          <section className="mb-6 overflow-hidden rounded-lg border border-slate-100 bg-white">
            <div className="p-4">
              <h3 className="text-[11px] font-semibold">
                Daftar Barang Stok Kritis (≤ 5 Unit)
                <span className="ml-2 rounded-full bg-[#FFDCD8] px-2 py-1 text-[8px] text-red-700">
                  2 Prioritas
                </span>
              </h3>
              <p className="mt-1 text-[8px] text-muted-dark">
                Item dengan kuantitas di bawah ambang batas operasional gudang saat ini.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[610px] text-left">
                <thead className="bg-field text-[8px]">
                  <tr>
                    <th className="px-3 py-3 font-medium">LOKASI RAK</th>
                    <th className="px-3 py-3 font-medium">KODE SKU &amp; NAMA BARANG</th>
                    <th className="px-3 py-3 font-medium">SISA STOK</th>
                    <th className="px-3 py-3 font-medium">STATUS STOK</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalItems.map((item) => (
                    <tr key={item.code} className="border-t border-slate-100 text-[9px]">
                      <td className="px-3 py-3">
                        <span className="bg-[#E4E9FF] px-2 py-1 font-mono text-[8px]">
                          {item.rack}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <strong className="block text-[10px]">{item.name}</strong>
                        <span className="font-mono text-[8px] text-muted">{item.code}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-critical">{item.stock}</td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 bg-[#FFE5E2] px-2 py-1 text-[8px] text-red-700">
                          <AlertTriangle size={10} /> Kritis ({item.min})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 p-3 text-[8px]">
              <span className="text-muted">Menampilkan 2 dari 3 barang berstatus kritis</span>
              <Link to="/kepala-gudang/laporan" className="text-brand">
                Lihat Semua Peringatan Stok →
              </Link>
            </div>
          </section>

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="border-l-4 border-brand pl-2 text-[11px] font-semibold">
                Laporan Opname Menunggu Persetujuan
              </h3>
              <span className="font-mono text-[8px] text-muted">
                Siklus Audit Harian: 2 Laporan Tertunda
              </span>
            </div>

            <article className="rounded-lg border border-slate-100 bg-white p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-[8px] text-muted">
                <span className="bg-[#E4E9FF] px-2 py-1 text-ink">RAK A-12</span>
                <span>BRG-004</span>
                <span>• 24 Okt 2024, 10:45 WIB</span>
                <span>• Budi Santoso (Staf Gudang)</span>
              </div>

              <div className="flex items-start justify-between gap-4 max-lg:flex-col">
                <div>
                  <h4 className="text-[10px] font-semibold">
                    Switch Hub 8-Port Gigabit
                    <span className="ml-2 inline-block bg-[#FFE5E2] px-2 py-1 font-mono text-[8px] text-red-700">
                      -2 Unit (Fisik: 8 | Sistem: 10)
                    </span>
                  </h4>
                  <p className="mt-2 text-[9px] text-muted-dark">
                    Catatan Auditor: Kemasan luar rusak saat pengecekan fisik,
                    2 unit dialihkan ke karantina.
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link to="/kepala-gudang/persetujuan" className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1.5 text-[8px]">
                    <Eye size={11} /> Detail Selisih
                  </Link>
                  <Link to="/kepala-gudang/persetujuan" className="flex items-center gap-1 rounded bg-brand-hover px-2 py-1.5 text-[8px] text-white">
                    <CheckCircle2 size={11} /> Tinjau &amp; Setujui
                  </Link>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
    </div>
  )
}
