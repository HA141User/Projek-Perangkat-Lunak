import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { getAuth, clearAuth } from '../lib/auth'

const MENU_STAF = [
  { label: 'Beranda', to: '/staff' },
  { label: 'Barang Masuk', to: '/staff/masuk' },
  { label: 'Barang Keluar', to: '/staff/keluar' },
  { label: 'Audit Opname', to: '/staff/opname' },
  { label: 'Katalog Barang', to: '/staff/barang' },
  { label: 'Riwayat Transaksi', to: '/staff/riwayat' },
]

const DUMMY_BARANG = [
  { sku: 'ATK-001', nama: 'Kertas HVS A4 80gsm', kategori: 'Alat Tulis', rak: 'A-01', stok: 120, status: 'aman' },
  { sku: 'ATK-002', nama: 'Toner Printer Laser', kategori: 'Perangkat Printer', rak: 'A-02', stok: 34, status: 'aman' },
  { sku: 'ATK-003', nama: 'Ballpoint Biru (Lusin)', kategori: 'Alat Tulis', rak: 'A-03', stok: 8, status: 'aman' },
  { sku: 'ATK-004', nama: 'Amplop Coklat Besar', kategori: 'Kemasan', rak: 'B-01', stok: 200, status: 'aman' },
  { sku: 'ATK-005', nama: 'Stappler No.10', kategori: 'Alat Tulis', rak: 'B-05', stok: 3, status: 'kritis' },
  { sku: 'ATK-006', nama: 'Binder Clip 25mm', kategori: 'Alat Tulis', rak: 'B-11', stok: 15, status: 'aman' },
  { sku: 'ATK-007', nama: 'Spidol Whiteboard Hitam', kategori: 'Alat Tulis', rak: 'C-07', stok: 22, status: 'aman' },
  { sku: 'ATK-008', nama: 'Map Plastik Transparan', kategori: 'Perlengkapan', rak: 'D-02', stok: 5, status: 'kritis' },
  { sku: 'ATK-009', nama: 'Lem Kertas UHU 21g', kategori: 'Alat Tulis', rak: 'C-01', stok: 0, status: 'habis' },
  { sku: 'ATK-010', nama: 'Penggaris Besi 30cm', kategori: 'Alat Ukur', rak: 'D-05', stok: 11, status: 'aman' },
]

const statusVariant = { aman: 'success', kritis: 'warning', habis: 'danger' }
const statusLabel = { aman: 'Aman', kritis: 'Kritis', habis: 'Habis' }

export default function StaffBarang() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [search, setSearch] = useState('')

  function handleLogout() { clearAuth(); navigate('/login') }

  const filtered = DUMMY_BARANG.filter((b) => {
    const q = search.toLowerCase()
    return b.nama.toLowerCase().includes(q) || b.sku.toLowerCase().includes(q)
  })

  return (
    <AppShell menuItems={MENU_STAF} userName={user?.name || 'Staf Gudang'} onLogout={handleLogout} pageTitle="Katalog Barang">
      {/* Search */}
      <div className="mb-5 relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          placeholder="Cari nama barang atau SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full max-w-sm rounded-lg border border-[#E5E7EB] bg-white pl-10 pr-4 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#1D4ED8] focus:ring-2 focus:ring-[#1D4ED8]/15"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Daftar Inventaris Barang</h3>
            <p className="mt-0.5 text-[13px] text-[#6B7280]">Gudang WH-01 · Hanya tampilan</p>
          </div>
          <span className="text-[13px] text-[#6B7280]">{filtered.length} dari {DUMMY_BARANG.length} item</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                {['SKU', 'Nama Barang', 'Kategori', 'Lokasi Rak', 'Stok', 'Status'].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6B7280] ${i >= 4 ? 'text-right' : 'text-left'} ${i === 2 ? 'max-sm:hidden' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[14px] text-[#6B7280]">
                    Tidak ada barang yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.sku} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3 font-mono text-[12.5px] text-[#6B7280]">{b.sku}</td>
                    <td className="px-4 py-3 text-[13.5px] font-medium text-[#111827]">{b.nama}</td>
                    <td className="px-4 py-3 text-[13px] text-[#374151] max-sm:hidden">{b.kategori}</td>
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-[#111827]">{b.rak}</td>
                    <td className="px-4 py-3 text-right font-mono text-[13.5px] font-semibold text-[#111827]">{b.stok}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={statusVariant[b.status]}>{statusLabel[b.status]}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
