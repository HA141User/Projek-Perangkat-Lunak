
import { Link } from 'react-router'
import {
  Download,
  Upload,
  ArrowRight,
  Clock3,
  MapPin,
  ScanLine,
} from 'lucide-react'
import Sidebar from '../components/Sidebar'

const menu = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Data Barang', to: '/staff/barang' },
  { label: 'Audit Opname', to: '/staff/opname' },
]

const transactions = [
  { time: '10:42 WIB', rack: 'Rak A-04', type: 'Masuk', amount: '24 Dus' },
  { time: '09:15 WIB', rack: 'Rak B-12', type: 'Keluar', amount: '10 Dus' },
  { time: '08:30 WIB', rack: 'Rak C-01', type: 'Masuk', amount: '50 Dus' },
]

function TransactionCard({ incoming, title, description, href }) {
  const Icon = incoming ? Download : Upload

  return (
    <article className="overflow-hidden rounded-lg border border-slate-100 bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-5 flex items-start justify-between">
          <div className="grid size-12 place-items-center rounded-md bg-field text-brand">
            <Icon size={24} />
          </div>
          <span className="flex items-center gap-1 bg-field px-2 py-1 font-mono text-[8px]">
            SCAN <ScanLine size={12} />
          </span>
        </div>

        <Link
          to={href}
          className="flex items-center gap-1 text-[17px] font-semibold tracking-tight hover:text-brand"
        >
          {title}
          <ArrowRight size={16} className="text-brand" />
        </Link>

        <p className="mt-1 text-[10px] text-muted-dark">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F7F8FF] px-5 py-3">
        <span className="text-[8px] font-medium tracking-wide">
          {incoming ? 'METODE: BARCODE DUS + LABEL RAK' : 'VALIDASI SURAT JALAN / DO'}
        </span>
        <Link to={href} className="text-[9px] font-medium text-brand">
          Buka Kamera →
        </Link>
      </div>
    </article>
  )
}

export default function StaffDashboard() {
  return (
    <div className="flex min-h-screen bg-white max-md:flex-col">
      <Sidebar items={menu} />

      <main className="min-w-0 flex-1 px-5 pb-8">
        <header className="mb-8 pt-4">
          <h1 className="text-xs font-semibold">Halo, Staf Gudang</h1>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#E9EDFF] px-3 py-1 font-mono text-[8px]">
                <span className="mr-1 text-green">●</span>
                Terminal GD-01 · Online
              </span>
              <span className="font-mono text-[8px] text-muted">
                Shift Pagi (07:00 - 15:00)
              </span>
            </div>

            <span className="flex items-center gap-1 text-[9px]">
              <ScanLine size={13} className="text-brand" />
              Scanner Siap
            </span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-5 max-lg:gap-3 max-md:grid-cols-1">
          <TransactionCard
            incoming
            title="Masuk Barang"
            description="Penerimaan barang & penempatan stok rak gudang"
            href="/staff/barang-masuk"
          />

          <TransactionCard
            title="Keluar Barang"
            description="Pengambilan barang & pengiriman keluar gudang"
            href="/staff/barang-keluar"
          />
        </section>

        <section className="mt-9">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                Riwayat Transaksi Hari Ini
              </h2>
              <span className="rounded-full bg-[#E9EDFF] px-2 py-1 text-[8px]">
                3 aktivitas tercatat
              </span>
            </div>

            <Link to="/staff/log" className="text-[9px] text-brand">
              Lihat Semua Log ↗
            </Link>
          </div>

          <div className="overflow-x-auto rounded-md border border-slate-100">
            <table className="w-full min-w-[570px] border-collapse text-left">
              <thead className="bg-field text-[8px]">
                <tr>
                  <th className="px-4 py-2 font-medium">WAKTU</th>
                  <th className="px-4 py-2 font-medium">LOKASI RAK</th>
                  <th className="px-4 py-2 font-medium">JENIS</th>
                  <th className="px-4 py-2 text-right font-medium">JUMLAH DUS / ITEM</th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((item) => (
                  <tr key={item.time} className="border-t border-slate-100 text-[9px] hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={11} /> {item.time}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 bg-field px-2 py-1 font-mono text-[8px]">
                        <MapPin size={10} className="text-brand" />
                        {item.rack}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-sm px-2 py-1 text-[8px] ${
                        item.type === 'Masuk'
                          ? 'bg-[#DCE4FF] text-[#062D91]'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        ● {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {item.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
