import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, AUTH_CHANGED_EVENT, getAuth, unwrapList } from '../lib/auth'
import { formatDateTime } from '../lib/format'

const WarehouseContext = createContext(null)

const FINAL_OPNAME_STATUSES = new Set(['DISETUJUI', 'DITOLAK', 'FINAL', 'APPROVED', 'REJECTED'])

export function WarehouseProvider({ children }) {
  const [auth, setAuthState] = useState(() => getAuth())
  const [notifications, setNotifications] = useState([])
  const [approvalReports, setApprovalReports] = useState([])
  const [approvedIds, setApprovedIds] = useState(() => new Set())

  useEffect(() => {
    function syncAuth() {
      setAuthState(getAuth())
    }
    window.addEventListener(AUTH_CHANGED_EVENT, syncAuth)
    window.addEventListener('storage', syncAuth)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncAuth)
      window.removeEventListener('storage', syncAuth)
    }
  }, [])

  const role = auth?.user?.role || ''
  const token = auth?.token || ''

  useEffect(() => {
    if (!token || !role) return

    let active = true
    const canFetchNotif = role === 'ADMIN' || role === 'KEPALA_GUDANG'
    const canFetchOpname = role === 'KEPALA_GUDANG' || role === 'STAF_GUDANG'

    async function loadData() {
      try {
        const [notifRes, opnRes] = await Promise.all([
          canFetchNotif ? apiFetch('/api/notifications/') : Promise.resolve(null),
          canFetchOpname ? apiFetch('/api/opnames/') : Promise.resolve(null),
        ])
        if (!active) return

        if (notifRes?.ok) {
          const list = unwrapList(await notifRes.json().catch(() => null))
          setNotifications(
            list.map((n, idx) => {
              const rawType = String(n.tipe ?? n.jenis ?? n.type ?? 'critical').toLowerCase()
              const type = rawType.includes('opname')
                ? 'approval'
                : rawType.includes('laporan')
                  ? 'report'
                  : 'critical'
              const isRead = Boolean(n.sudah_dibaca ?? n.dibaca ?? n.is_read ?? false)
              return {
                id: n.id_notif ?? n.id_notifikasi ?? n.id ?? `n-${idx}`,
                type,
                title: n.judul ?? n.title ?? (n.nama_barang ? `Peringatan Stok: ${n.nama_barang}` : 'Notifikasi Sistem'),
                body: n.pesan ?? n.deskripsi ?? n.message ?? '',
                time: formatDateTime(n.created_at ?? n.waktu, false),
                unread: !isRead,
                action: type === 'approval' ? 'Tinjau Opname' : 'Lihat Stok Kritis',
              }
            })
          )
        } else if (!canFetchNotif) {
          setNotifications([])
        }

        if (opnRes?.ok) {
          const opnList = unwrapList(await opnRes.json().catch(() => null))
          setApprovalReports(opnList)
        } else if (!canFetchOpname) {
          setApprovalReports([])
        }
      } catch {
        /* biarkan state tetap aman */
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [token, role])

  const effectiveNotifications = useMemo(
    () => (token ? notifications : []),
    [token, notifications]
  )
  const effectiveReports = useMemo(
    () => (token ? approvalReports : []),
    [token, approvalReports]
  )

  const unreadCount = effectiveNotifications.filter((item) => item.unread).length
  const pendingApprovalCount = effectiveReports.filter((o) => {
    const id = o.id_opname ?? o.id
    const status = String(o.status ?? '').toUpperCase()
    return !approvedIds.has(id) && !FINAL_OPNAME_STATUSES.has(status)
  }).length

  const value = useMemo(() => {
    function markAllNotificationsRead() {
      setNotifications((current) => current.map((item) => ({ ...item, unread: false })))
      apiFetch('/api/notifications/read-all', { method: 'PATCH' }).catch(() => {})
    }

    function markNotificationRead(id) {
      setNotifications((current) =>
        current.map((item) => (item.id === id ? { ...item, unread: false } : item))
      )
      apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {})
    }

    function approveReport(id) {
      setApprovedIds((current) => new Set(current).add(id))
    }

    return {
      notifications: effectiveNotifications,
      unreadCount,
      markAllNotificationsRead,
      markNotificationRead,
      approvalReports: effectiveReports,
      approvedIds,
      approveReport,
      pendingApprovalCount,
    }
  }, [effectiveNotifications, unreadCount, effectiveReports, approvedIds, pendingApprovalCount])

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWarehouse() {
  const context = useContext(WarehouseContext)
  if (!context) {
    throw new Error('useWarehouse harus dipakai di dalam WarehouseProvider')
  }
  return context
}
