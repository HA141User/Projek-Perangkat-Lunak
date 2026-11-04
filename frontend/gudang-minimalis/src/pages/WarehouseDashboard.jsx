import { useNavigate } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { KpiCard } from '../components/ui/Card'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth } from '../lib/auth'

const menu = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Notifikasi', to: '/kepala-gudang/notifikasi' },
]

const METRICS = [
  {
    id: 'masuk',
    label: 'Barang Masuk Hari Ini',
    value: '312',
    unit: 'unit',
    delta: '+47 dari kemarin',
    deltaGood: true,
  },
  {
    id: 'keluar',
    label: 'Barang Keluar Hari Ini',
    value: '198',
    unit: 'unit',
    delta: '−12 dari kemarin',
    deltaGood: false,
  },
  {
    id: 'opname',
    label: 'Opname Menunggu Persetujuan',
    value: '3',
    unit: 'sesi',
    delta: 'Perlu tindak lanjut',
    deltaGood: false,
  },
  {
    id: 'sku',
    label: 'Total SKU Aktif',
    value: '1.284',
    unit: 'SKU',
    delta: '+6 SKU baru minggu ini',
    deltaGood: true,
  },
]

const CRITICAL_STOCK = [
  { kodeRak: 'A-03', namaBarang: 'Kabel UTP Cat6 (100m)', sku: 'CBL-CAT6-100M', stok: 4, min: 8 },
  { kodeRak: 'B-11', namaBarang: 'Switch 24-Port Manageable', sku: 'NET-SW24-MG', stok: 1, min: 3 },
  { kodeRak: 'C-07', namaBarang: 'Baterai AA Alkaline (Pack)', sku: 'BAT-AA-ALK-12', stok: 6, min: 20 },
  { kodeRak: 'D-02', namaBarang: 'Tinta Printer Epson T664', sku: 'INK-EPS-T664-BK', stok: 2, min: 5 },
  { kodeRak: 'A-09', namaBarang: 'Selotip Bening 48mm', sku: 'PCK-TAPE-48-CLR', stok: 9, min: 24 },
]

const TABLE_COLS = ['KODE RAK', 'NAMA BARANG', 'SKU', 'STOK', 'MIN', 'SELISIH', 'STATUS']

export default function WarehouseDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  return (
    <AppShell
      menuItems={menu}
      userName={user?.name || 'Kepala Gudang'}
      onLogout={handleLogout}
      pageTitle="Dashboard Kepala Gudang"
    >
      {/* Section heading */}
      <div className="mb-6">
        <h2 className="text-[20px] font-semibold text-[#111827]">Dashboard Kepala Gudang</h2>
        <p className="mt-1 text-[14px] text-[#6B7280]">
          Pantau metrik operasional harian, stok kritis, dan sesi opname yang membutuhkan persetujuan.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="mb-6 grid grid-cols-4 gap-5 max-md:grid-cols-2">
        {METRICS.map((m) => (
          <KpiCard
            key={m.id}
            label={m.label}
            value={m.value}
            unit={m.unit}
            delta={m.delta}
            deltaGood={m.deltaGood}
          />
        ))}
      </div>

      {/* Critical Stock Table */}
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600" />
              Stok Kritis
            </span>
          }
          description="Item dengan stok saat ini ≤ batas minimum — perlu restock segera."
          actions={
            <Badge variant="danger">{CRITICAL_STOCK.length} item</Badge>
          }
        />
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                  {TABLE_COLS.map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#6B7280] last:text-center"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CRITICAL_STOCK.map((item) => {
                  const selisih = item.stok - item.min
                  return (
                    <tr
                      key={item.sku}
                      className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F9FAFB]"
                    >
                      <td className="px-5 py-3 font-mono text-[13.5px] font-semibold text-[#111827]">
                        {item.kodeRak}
                      </td>
                      <td className="px-5 py-3 text-[13.5px] font-medium text-[#111827]">
                        {item.namaBarang}
                      </td>
                      <td className="px-5 py-3 font-mono text-[13.5px] text-[#6B7280]">
                        {item.sku}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="danger">{item.stok}</Badge>
                      </td>
                      <td className="px-5 py-3 font-mono text-[13.5px] text-[#6B7280]">
                        {item.min}
                      </td>
                      <td className="px-5 py-3 font-mono text-[13.5px] font-semibold text-red-600">
                        {selisih}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Badge variant="danger">KRITIS</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  )
}
