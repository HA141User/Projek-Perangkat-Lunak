import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Search, Download, Filter } from 'lucide-react'
import AppShell from '../components/AppShell'
import Btn from '../components/ui/Btn'
import Badge from '../components/ui/Badge'
import { getAuth, clearAuth, apiFetch, unwrapList } from '../lib/auth'
import { downloadCSV, fileStamp } from '../lib/csv'

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

const CODE_BADGE = {
  USER_CREATE: 'info',
  SYSTEM_AUTO: 'neutral',
  UPDATE_MASTER: 'warning',
  STOCK_IN: 'success',
  STOCK_OUT: 'danger',
  AUDIT_SUBMIT: 'info',
  OPNAME_APPROVE: 'success',
}

function mapApiLog(l, idx = 0) {
  return {
    id: l.id_log ?? l.id ?? idx + 1,
    waktu: l.waktu ?? l.created_at ?? l.timestamp ?? '-',
    kode: l.kode ?? l.aksi ?? l.action ?? l.event ?? 'SYSTEM_AUTO',
    aktor: l.aktor ?? l.user_nama ?? l.user?.nama ?? l.actor ?? 'Sistem WH-01',
    entitas: l.entitas ?? l.target ?? l.entity ?? 'WH-01',
    ip: l.ip ?? l.ip_address ?? '-',
    keterangan: l.keterangan ?? l.deskripsi ?? l.description ?? l.message ?? '',
  }
}

export default function AdminLog() {
  const navigate = useNavigate()
  const { user } = getAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCode, setFilterCode] = useState('Semua')

  // Ambil daftar log audit murni dari GET /api/audit-logs
  useEffect(() => {
    let active = true
    async function loadLogs() {
      setLoading(true)
      try {
        const res = await apiFetch('/api/audit-logs')
        if (active && res.ok) {
          const list = unwrapList(await res.json().catch(() => null))
          setLogs(list.map(mapApiLog))
        }
      } catch {
        /* biarkan kosong jika gagal */
      } finally {
        if (active) setLoading(false)
      }
    }
    loadLogs()
    return () => { active = false }
  }, [])

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
    downloadCSV(
      `audit-log-wh01-${fileStamp()}.csv`,
      ['ID', 'WAKTU', 'KODE', 'AKTOR', 'ENTITAS', 'IP', 'KETERANGAN'],
      filteredLogs.map((l) => [l.id, l.waktu, l.kode, l.aktor, l.entitas, l.ip, l.keterangan]),
    )
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Memuat data log aktivitas dari server...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[13.5px] text-[#6B7280]">
                    Tidak ada catatan log yang ditemukan di server.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
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
                ))
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
