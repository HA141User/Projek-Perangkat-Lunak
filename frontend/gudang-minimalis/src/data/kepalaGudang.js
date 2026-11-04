
import notifWarningIcon from '../assets/kepala-gudang/notif-warning.svg'
import notifAssignmentIcon from '../assets/kepala-gudang/notif-assignment.svg'
import notifReportIcon from '../assets/kepala-gudang/notif-report.svg'

export const KEPALA_MENU = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Referensi Notifikasi', to: '/kepala-gudang/notifikasi' },
]

export const APPROVAL_REPORTS = [
  {
    id: 'a1',
    rack: 'RAK A-12',
    sku: 'BRG-004',
    dateTime: '24 Okt 2024, 10:45 WIB',
    auditor: 'Budi Santoso (Staf Gudang)',
    title: 'Switch Hub 8-Port Gigabit',
    diff: '-2 Unit (Fisik: 8 | Sistem: 10)',
    note: 'Catatan Auditor: Kemasan luar rusak saat pengecekan fisik, 2 unit dialihkan ke karantina.',
    detail: { system: '10 Unit', physical: '8 Unit', diff: '-2 Unit' },
  },
  {
    id: 'a2',
    rack: 'RAK A-22',
    sku: 'BRG-025',
    dateTime: '24 Okt 2024, 09:30 WIB',
    auditor: 'Ahmad Fauzi (Staf Gudang)',
    title: 'Patch Cord Fiber Optic 3m',
    diff: '-1 Dus (Fisik: 14 | Sistem: 15)',
    note: 'Catatan Auditor: Salah hitung pada kartu stok rak A-22 baris bawah, bukti mutasi fisik terlampir.',
    detail: { system: '15 Dus', physical: '14 Dus', diff: '-1 Dus' },
  },
]

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    type: 'critical',
    title: 'Stok Kritis: LAN Cat6 (BRG-001)',
    body: 'Sisa stok tinggal 3 Dus di RAK A-12 setelah transaksi keluar oleh Staf Budi.',
    time: '5 menit yang lalu',
    unread: true,
    action: 'Lihat Detail Stok',
  },
  {
    id: 'n2',
    type: 'approval',
    title: 'Laporan Opname Baru - RAK A-12',
    body: 'Staf Budi mengajukan laporan opname dengan selisih -2 Dus.',
    time: '1 jam yang lalu',
    unread: true,
    action: 'Tinjau & Setujui',
  },
  {
    id: 'n3',
    type: 'report',
    title: 'Laporan Mutasi Mingguan Ready',
    body: 'Laporan periode 01-07 Oktober 2026 telah dibuat otomatis.',
    time: 'Kemarin, 18:00',
    unread: false,
    action: null,
  },
]

export const NOTIF_ICONS = {
  critical: { src: notifWarningIcon, tile: 'bg-[#FFDAD6]' },
  approval: { src: notifAssignmentIcon, tile: 'bg-[#E1E8FD]' },
  report: { src: notifReportIcon, tile: 'bg-field' },
}
