import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Download, Filter } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import { getAuth, clearAuth } from '../lib/auth'

const MENU_ADMIN = [
  { label: 'Beranda', to: '/admin' },
  { label: 'Manajemen Pengguna', to: '/admin/pengguna' },
  { label: 'Data Barang', to: '/admin/barang' },
  { label: 'Data Rak', to: '/admin/rak' },
  { label: 'Persetujuan Opname', to: '/admin/persetujuan' },
  { label: 'Laporan Inventaris', to: '/admin/laporan' },
  { label: 'Laporan Otomatis', to: '/admin/laporan-otomatis' },
  { label: 'Log Aktivitas', to: '/admin/log' },
]

const INITIAL_LOGS = [
  { id: 1, waktu: '29 Okt 2026, 01:42:10', kode: 'USER_CREATE', aktor: 'Hendrawan Putra (Admin)', entitas: 'User ID: 104', ip: '192.168.1.104', keterangan: 'Mendaftarkan akun staf baru: Siti Aminah (Staf Gudang) dengan otorisasi Zona A & B.' },
  { id: 2, waktu: '29 Okt 2026, 00:30:00', kode: 'SYSTEM_AUTO', aktor: 'Daemon Scheduler', entitas: 'Cronjob WH-01', ip: '127.0.0.1', keterangan: 'Mengirimkan Laporan Otomatis Mingguan mutasi inventaris ke 3 email penerima (PDF & XLSX).' },
  { id: 3, waktu: '28 Okt 2026, 16:45:18', kode: 'UPDATE_MASTER', aktor: 'Hendrawan Putra (Kepala Gudang)', entitas: 'SKU: CBL-CAT6-100M', ip: '192.168.1.88', keterangan: 'Pembaruan ambang batas minimum stok Kabel UTP dari 5 unit menjadi 8 unit.' },
  { id: 4, waktu: '28 Okt 2026, 14:15:22', kode: 'STOCK_IN', aktor: 'Budi Santoso (Staf)', entitas: 'RAK A-03 // IN-902', ip: '192.168.1.120', keterangan: 'Penerimaan barang masuk: 24 Dus Kabel UTP Cat6 via scan QR stiker rak.' },
  { id: 5, waktu: '28 Okt 2026, 11:39:42', kode: 'AUDIT_SUBMIT', aktor: 'Budi Santoso (Staf)', entitas: 'Opname Sesi #044', ip: '192.168.1.120', keterangan: 'Menyelesaikan input fisik stok opname RAK A-12 (14 item). Berkas menunggu review Kepala Gudang.' },
  { id: 6, waktu: '28 Okt 2026, 09:20:11', kode: 'OPNAME_APPROVE', aktor: 'Hendrawan Putra (Kepala Gudang)', entitas: 'Opname Sesi #043', ip: '192.168.1.88', keterangan: 'Menyetujui rekonsiliasi stok opname Zona B: Selisih penyesuaian +2 dus disahkan.' },
  { id: 7, waktu: '28 Okt 2026, 08:40:05', kode: 'STOCK_OUT', aktor: 'Ahmad Fauzi (Staf)', entitas: 'RAK B-02 // OUT-411', ip: '192.168.1.115', keterangan: 'Pengeluaran logistik: 6 Dus Lakban Bening Heavy Duty untuk divisi packing ekspedisi.' },
]

const CODE_BADGE = {
  USER_CREATE: 'info',
  SYSTEM_AUTO: 'neutral',
  UPDATE_MASTER: 'warning',
  STOCK_IN: 'success',
  STOCK_OUT: 'danger',
  AUDIT_SUBMIT: 'info',
  OPNAME_APPROVE: 'success',
}

export default function AdminLog() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [logs] = useState(INITIAL_LOGS)
  const [search, setSearch] = useState('')
  const [filterCode, setFilterCode] = useState('Semua')

  function handleLogout() {
    clearAuth()
    navigate('/login')
  }

  const filteredLogs = logs.filter((log) => {
    const q = search.toLowerCase()
    const matchSearch =
      log.aktor.toLowerCase().includes(q) ||
      log.keterangan.toLowerCase().includes(q) ||
      log.entitas.toLowerCase().includes(q) ||
      log.kode.toLowerCase().includes(q)
    const matchCode = filterCode === 'Semua' || log.kode === filterCode
    return matchSearch && matchCode
  })

  function handleDownloadCSV() {
    const header = 'ID,WAKTU,KODE,AKTOR,ENTITAS,IP,KETERANGAN\n'
    const rows = filteredLogs
      .map((l) => `"${l.id}","${l.waktu}","${l.kode}","${l.aktor}","${l.entitas}","${l.ip}","${l.keterangan}"`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-log-wh01-${Date.now()}.csv`
    a.click()
  }

  return (
    <AppShell
      menuItems={MENU_ADMIN}
      userName={user?.name || 'Administrator'}
      onLogout={handleLogout}
      pageTitle="Log Aktivitas"
      actions={
        <Btn variant="secondary" icon={Download} onClick={handleDownloadCSV}>
          Unduh CSV
        </Btn>
      }
    >
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-72 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5 transition-colors focus-within:border-[#1D4ED8]">
          <Search size={15} className="shrink-0 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Cari aktor, kode, atau keterangan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-0 flex-1 bg-transparent text-[13.5px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
          />
        </div>

        <div className="flex h-10 items-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-3.5">
          <Filter size={14} className="text-[#9CA3AF]" />
          <select
            value={filterCode}
            onChange={(e) => setFilterCode(e.target.value)}
            className="bg-transparent text-[13.5px] text-[#111827] outline-none"
          >
            <option value="Semua">Semua Kode</option>
            <option value="USER_CREATE">USER_CREATE</option>
            <option value="SYSTEM_AUTO">SYSTEM_AUTO</option>
            <option value="UPDATE_MASTER">UPDATE_MASTER</option>
            <option value="STOCK_IN">STOCK_IN</option>
            <option value="STOCK_OUT">STOCK_OUT</option>
            <option value="AUDIT_SUBMIT">AUDIT_SUBMIT</option>
            <option value="OPNAME_APPROVE">OPNAME_APPROVE</option>
          </select>
        </div>

        <span className="text-[13px] text-[#6B7280]">{filteredLogs.length} catatan</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Waktu</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Kode Event</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Aktor</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Entitas / Target</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">IP</th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-[#6B7280]">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#6B7280]">{log.waktu}</td>
                  <td className="px-4 py-3">
                    <Badge variant={CODE_BADGE[log.kode] || 'neutral'}>{log.kode}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-[13.5px] font-medium text-[#111827]">{log.aktor}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#374151]">{log.entitas}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-[12.5px] text-[#6B7280]">{log.ip}</td>
                  <td className="px-4 py-3 text-[13px] leading-relaxed text-[#374151]">{log.keterangan}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada catatan log yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-[12.5px] text-[#6B7280]">
          <span>Menampilkan {filteredLogs.length} dari {logs.length} catatan</span>
          <span className="font-medium text-[#374151]">Audit Log · WH-01</span>
        </div>
      </div>
    </AppShell>
  )
}
