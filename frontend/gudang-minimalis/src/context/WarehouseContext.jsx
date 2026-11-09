import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, unwrapList } from '../lib/auth'

const WarehouseContext = createContext(null)

export function WarehouseProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [approvalReports, setApprovalReports] = useState([])
  const [approvedIds, setApprovedIds] = useState(() => new Set())

  useEffect(() => {
    let active = true
    async function loadData() {
      try {
        const [notifRes, opnRes] = await Promise.all([
          apiFetch('/api/notifications/'),
          apiFetch('/api/opnames/'),
        ])
        if (active && notifRes.ok) {
          const list = unwrapList(await notifRes.json().catch(() => null))
          setNotifications(
            list.map((n, idx) => ({
              id: n.id_notifikasi ?? n.id ?? `n-${idx}`,
              type: String(n.tipe ?? n.jenis ?? 'critical').includes('opname')
                ? 'approval'
                : String(n.tipe ?? n.jenis ?? '').includes('laporan')
                  ? 'report'
                  : 'critical',
              title: n.judul ?? n.title ?? 'Notifikasi Sistem',
              body: n.deskripsi ?? n.pesan ?? n.message ?? '',
              time: n.waktu ?? n.created_at ?? '-',
              unread: !(n.dibaca ?? n.is_read ?? false),
              action: null,
            }))
          )
        }
        if (active && opnRes.ok) {
          const opnList = unwrapList(await opnRes.json().catch(() => null))
          setApprovalReports(opnList)
        }
      } catch {
        /* ignore */
      }
    }
    loadData()
    return () => { active = false }
  }, [])

  const unreadCount = notifications.filter((item) => item.unread).length
  const pendingApprovalCount = Math.max(0, approvalReports.length - approvedIds.size)

  const value = useMemo(() => {
    function markAllNotificationsRead() {
      setNotifications((current) =>
        current.map((item) => ({ ...item, unread: false })),
      )
      apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
    }

    function markNotificationRead(id) {
      setNotifications((current) =>
        current.map((item) =>
          item.id === id ? { ...item, unread: false } : item,
        ),
      )
      apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
    }

    function approveReport(id) {
      setApprovedIds((current) => new Set(current).add(id))
    }

    return {
      notifications,
      unreadCount,
      markAllNotificationsRead,
      markNotificationRead,
      approvalReports,
      approvedIds,
      approveReport,
      pendingApprovalCount,
    }
  }, [notifications, unreadCount, approvalReports, approvedIds, pendingApprovalCount])

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
