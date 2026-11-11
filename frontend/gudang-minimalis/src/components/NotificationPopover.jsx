
import { Link } from 'react-router'
import { useWarehouse } from '../context/WarehouseContext'
import useNotificationActions from '../hooks/useNotificationActions'
import NotificationItem from './NotificationItem'

export default function NotificationPopover({ onClose }) {
  const { notifications, unreadCount, markAllNotificationsRead } = useWarehouse()
  const handleAction = useNotificationActions()

  return (
    <>
      {/* Backdrop popover */}
      <button
        type="button"
        aria-label="Tutup notifikasi"
        onClick={onClose}
        className="fixed inset-0 z-30 cursor-default bg-transparent"
      />

      {/* Panel notifikasi */}
      <div
        role="dialog"
        aria-label="Notifikasi real-time"
        className="absolute right-6 top-full z-40 flex max-h-[80vh] w-[420px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-lg border border-[#E1E8FD] bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] max-md:right-3"
      >
        {/* Header panel */}
        <div className="flex items-center justify-between gap-3 border-b border-field px-5 py-3">
          <div className="flex items-center gap-2">
            <h3 className="whitespace-nowrap text-base font-semibold leading-6 tracking-[-0.4px] text-ink">
              Notifikasi Real-time
            </h3>
            {unreadCount > 0 ? (
              <span className="shrink-0 whitespace-nowrap rounded-xl bg-[#DCE1FF] px-2 py-0.5 font-mono text-[11px] font-medium leading-[16.5px] tracking-[0.275px] text-[#001551]">
                {unreadCount} Baru
              </span>
            ) : (
              <span className="shrink-0 rounded-xl bg-[#89F5E7] px-2 py-0.5 text-[11px] font-semibold leading-[16.5px] tracking-[0.275px] text-[#00201D]">
                Semua Dibaca
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="shrink-0 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
          >
            Tandai Semua Dibaca
          </button>
        </div>

        {/* Daftar notifikasi */}
        <div className="max-h-[460px] overflow-auto">
          {notifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-muted-dark">
              Belum ada notifikasi saat ini.
            </p>
          ) : (
            notifications.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onAction={(actionItem) => {
                  handleAction(actionItem)
                  onClose()
                }}
              />
            ))
          )}
        </div>

        {/* Footer panel */}
        <div className="border-t border-field p-2">
          <Link
            to="/kepala-gudang/notifikasi"
            onClick={onClose}
            className="block rounded py-1 text-center text-[13px] font-medium leading-[18px] tracking-[0.13px] text-brand outline-none transition hover:bg-field focus-visible:ring-2 focus-visible:ring-brand"
          >
            Lihat Seluruh Riwayat Log Notifikasi
          </Link>
        </div>
      </div>
    </>
  )
}
