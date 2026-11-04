
import { createContext, useContext, useMemo, useState } from 'react'
import {
  APPROVAL_REPORTS,
  INITIAL_NOTIFICATIONS,
} from '../data/kepalaGudang'

const WarehouseContext = createContext(null)

export function WarehouseProvider({ children }) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [approvedIds, setApprovedIds] = useState(() => new Set())

  const unreadCount = notifications.filter((item) => item.unread).length
  const pendingApprovalCount = APPROVAL_REPORTS.length - approvedIds.size

  const value = useMemo(() => {
    function markAllNotificationsRead() {
      setNotifications((current) =>
        current.map((item) => ({ ...item, unread: false })),
      )
    }

    function markNotificationRead(id) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, unread: false } : item,
        ),
      )
    }

    function approveReport(id) {
      setApprovedIds((current) => new Set(current).add(id))
      // Laporan yang disetujui otomatis menandai notifikasi persetujuan terkait sebagai dibaca
      if (id === 'a1') {
        setNotifications((current) =>
          current.map((item) =>
            item.id === 'n2' ? { ...item, unread: false } : item,
          ),
        )
      }
    }

    return {
      notifications,
      unreadCount,
      markAllNotificationsRead,
      markNotificationRead,
      approvalReports: APPROVAL_REPORTS,
      approvedIds,
      approveReport,
      pendingApprovalCount,
    }
  }, [notifications, unreadCount, approvedIds, pendingApprovalCount])

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWarehouse() {
  const context = useContext(WarehouseContext)
  if (!context) {
    throw new Error('useWarehouse harus dipakai di dalam WarehouseProvider')
  }
  return context
}
