import notifWarningIcon from '../assets/kepala-gudang/notif-warning.svg'
import notifAssignmentIcon from '../assets/kepala-gudang/notif-assignment.svg'
import notifReportIcon from '../assets/kepala-gudang/notif-report.svg'

export const KEPALA_MENU = [
  { label: 'Beranda', to: '/kepala-gudang' },
  { label: 'Persetujuan Opname', to: '/kepala-gudang/persetujuan' },
  { label: 'Laporan Inventaris', to: '/kepala-gudang/laporan' },
  { label: 'Referensi Notifikasi', to: '/kepala-gudang/notifikasi' },
]

export const APPROVAL_REPORTS = []

export const INITIAL_NOTIFICATIONS = []

export const NOTIF_ICONS = {
  critical: { src: notifWarningIcon, tile: 'bg-[#FFDAD6]' },
  approval: { src: notifAssignmentIcon, tile: 'bg-[#E1E8FD]' },
  report: { src: notifReportIcon, tile: 'bg-field' },
}
