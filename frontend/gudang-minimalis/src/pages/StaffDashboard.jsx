import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Download, Upload, ArrowRight } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

const menu = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const DUMMY_TRANSACTIONS = [
  { id: 1, waktu: '09:14:02', rak: 'A-03', tipe: 'IN', jumlah: 24 },
  { id: 2, waktu: '09:02:47', rak: 'B-11', tipe: 'OUT', jumlah: 6 },
  { id: 3, waktu: '08:55:30', rak: 'C-07', tipe: 'IN', jumlah: 48 },
  { id: 4, waktu: '08:40:12', rak: 'A-01', tipe: 'OUT', jumlah: 12 },
  { id: 5, waktu: '08:22:58', rak: 'D-02', tipe: 'IN', jumlah: 100 },
  { id: 6, waktu: '08:10:35', rak: 'B-05', tipe: 'OUT', jumlah: 3 },
]

export default function StaffDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <AppShell
      menuItems={menu}
      userName={user?.name || 'Staf Gudang'}
      onLogout={handleLogout}
      pageTitle="Dashboard Operasional Staf"
    >
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#111827]">Dashboard Operasional Staf</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Rekam transaksi barang masuk dan keluar serta pantau riwayat harian.
        </p>
      </div>

      {/* Action Cards */}
      <div className="mb-6 grid grid-cols-2 gap-5 max-sm:grid-cols-1">
        {/* Barang Masuk */}
        <Link
          to="/staff/masuk"
          className="group flex min-h-[140px] flex-col justify-between rounded-xl bg-[#0037B0] p-6 text-white transition hover:bg-[#1D4ED8]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-white/70">
                Barang Masuk
              </p>
              <h3 className="mt-2 text-[20px] font-semibold">Catat Penerimaan</h3>
              <p className="mt-1 text-[14px] text-white/70">
                Scan QR rak → input jumlah → simpan
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-white">
              <Download size={22} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-white/80 group-hover:text-white">
            Mulai Pencatatan <ArrowRight size={15} />
          </div>
        </Link>

        {/* Barang Keluar */}
        <Link
          to="/staff/keluar"
          className="group flex min-h-[140px] flex-col justify-between rounded-xl bg-[#111827] p-6 text-white transition hover:bg-[#1f2937]"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-widest text-white/70">
                Barang Keluar
              </p>
              <h3 className="mt-2 text-[20px] font-semibold">Catat Pengeluaran</h3>
              <p className="mt-1 text-[14px] text-white/70">
                Scan QR rak → input jumlah → simpan
              </p>
            </div>
            <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-white">
              <Upload size={22} />
            </span>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-[14px] font-medium text-white/80 group-hover:text-white">
            Mulai Pencatatan <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      {/* Riwayat Transaksi */}
      <Card>
        <CardHeader
          title="Riwayat Transaksi Terakhir"
          description="Hari ini — WH-01"
          actions={
            <Link
              to="/staff/riwayat"
              className="flex items-center gap-1 text-[13px] font-medium text-[#0037B0] hover:underline"
            >
              Semua <ArrowRight size={13} />
            </Link>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Waktu
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Rak
                  </th>
                  <th className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Tipe
                  </th>
                  <th className="px-5 py-3 text-right text-[12px] font-medium uppercase tracking-wide text-[#6B7280]">
                    Jumlah
                  </th>
                </tr>
              </thead>
              <tbody>
                {DUMMY_TRANSACTIONS.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]"
                  >
                    <td className="px-5 py-3 font-mono text-[13.5px] text-[#6B7280]">
                      {tx.waktu}
                    </td>
                    <td className="px-5 py-3 font-mono text-[13.5px] font-medium text-[#111827]">
                      {tx.rak}
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={tx.tipe === 'IN' ? 'success' : 'danger'}>
                        {tx.tipe === 'IN' ? 'Masuk' : 'Keluar'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-[13.5px] font-semibold text-[#111827]">
                      {tx.jumlah.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  )
}
