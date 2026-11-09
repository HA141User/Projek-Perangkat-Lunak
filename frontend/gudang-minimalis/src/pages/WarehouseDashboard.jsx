import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import Badge from '../components/ui/Badge'
import { KpiCard, Card, CardHeader, CardBody } from '../components/ui/Card'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'

const menu = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Notifikasi', to: '/kepala-gudang/notifikasi' },
]

const TABLE_COLS = ['KODE RAK', 'NAMA BARANG', 'SKU', 'STOK', 'MIN', 'SELISIH', 'STATUS']

export default function WarehouseDashboard() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [metrics, setMetrics] = useState([
    { id: 'masuk', label: 'Barang Masuk Hari Ini', value: '0', unit: 'unit', delta: 'Data dari API', deltaGood: true },
    { id: 'keluar', label: 'Barang Keluar Hari Ini', value: '0', unit: 'unit', delta: 'Data dari API', deltaGood: false },
    { id: 'opname', label: 'Opname Menunggu Persetujuan', value: '0', unit: 'sesi', delta: 'Perlu tindak lanjut', deltaGood: false },
    { id: 'sku', label: 'Total SKU Aktif', value: '0', unit: 'SKU', delta: 'Data inventaris aktif', deltaGood: true },
  ])
  const [criticalStock, setCriticalStock] = useState([])
  const [loading, setLoading] = useState(true)

  // Ambil data dashboard & item kritis murni dari API
  useEffect(() => {
    let active = true
    async function loadDashboard() {
      setLoading(true)
      try {
        const [dashRes, itemsRes, txRes, opnRes] = await Promise.all([
          apiFetch('/api/dashboard/'),
          apiFetch('/api/items/'),
          apiFetch('/api/transactions/'),
          apiFetch('/api/opnames/'),
        ])
        if (!active) return

        const dashPayload = dashRes.ok ? await dashRes.json().catch(() => null) : null
        const dashData = dashPayload?.data ?? dashPayload ?? {}
        const itemsList = itemsRes.ok ? unwrapList(await itemsRes.json().catch(() => null)) : []
        const txList = txRes.ok ? unwrapList(await txRes.json().catch(() => null)) : []
        const opnList = opnRes.ok ? unwrapList(await opnRes.json().catch(() => null)) : []

        const masukCount = dashData.barang_masuk_hari_ini ?? dashData.total_masuk ?? txList
          .filter((t) => ['MASUK', 'IN'].includes(String(t.tipe ?? t.jenis_transaksi ?? t.type ?? '').toUpperCase()))
          .reduce((sum, t) => {
            const qty = Array.isArray(t.items) && t.items.length > 0
              ? t.items.reduce((s, it) => s + Number(it.jumlah ?? 0), 0)
              : Number(t.jumlah ?? t.kuantitas ?? t.quantity ?? 0)
            return sum + qty
          }, 0)

        const keluarCount = dashData.barang_keluar_hari_ini ?? dashData.total_keluar ?? txList
          .filter((t) => ['KELUAR', 'OUT'].includes(String(t.tipe ?? t.jenis_transaksi ?? t.type ?? '').toUpperCase()))
          .reduce((sum, t) => {
            const qty = Array.isArray(t.items) && t.items.length > 0
              ? t.items.reduce((s, it) => s + Number(it.jumlah ?? 0), 0)
              : Number(t.jumlah ?? t.kuantitas ?? t.quantity ?? 0)
            return sum + qty
          }, 0)

        const pendingOpn = dashData.opname_menunggu ?? dashData.pending_opnames ?? opnList
          .filter((o) => !['DISETUJUI', 'DITOLAK', 'FINAL', 'APPROVED', 'REJECTED'].includes(String(o.status ?? '').toUpperCase()))
          .length

        const totalSku = dashData.total_sku ?? dashData.total_barang ?? itemsList.length

        setMetrics([
          { id: 'masuk', label: 'Barang Masuk Hari Ini', value: String(masukCount), unit: 'unit', delta: 'Tercatat di server', deltaGood: true },
          { id: 'keluar', label: 'Barang Keluar Hari Ini', value: String(keluarCount), unit: 'unit', delta: 'Tercatat di server', deltaGood: false },
          { id: 'opname', label: 'Opname Menunggu Persetujuan', value: String(pendingOpn), unit: 'sesi', delta: pendingOpn > 0 ? 'Perlu tindak lanjut' : 'Semua terverifikasi', deltaGood: pendingOpn === 0 },
          { id: 'sku', label: 'Total SKU Aktif', value: totalSku.toLocaleString('id-ID'), unit: 'SKU', delta: 'Terdaftar di database', deltaGood: true },
        ])

        const kritis = itemsList
          .map((it) => ({
            kodeRak: it.rak ?? it.kode_lokasi ?? it.lokasi?.kode_lokasi ?? '-',
            namaBarang: it.nama ?? it.nama_barang ?? '-',
            sku: it.sku ?? it.kode_barang ?? '-',
            stok: Number(it.stok ?? it.stok_saat_ini ?? 0),
            min: Number(it.minStok ?? it.batas_stok_minimum ?? 5),
          }))
          .filter((it) => it.stok <= it.min)
        setCriticalStock(kritis)
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
        {metrics.map((m) => (
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
            <Badge variant="danger">{criticalStock.length} item</Badge>
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
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                      Memuat data stok kritis dari server...
                    </td>
                  </tr>
                ) : criticalStock.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                      Tidak ada barang dengan stok kritis saat ini.
                    </td>
                  </tr>
                ) : (
                  criticalStock.map((item) => {
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  )
}
