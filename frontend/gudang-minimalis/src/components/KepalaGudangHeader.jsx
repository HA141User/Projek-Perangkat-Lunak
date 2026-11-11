
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useWarehouse } from '../context/WarehouseContext'
import { clearAuth } from '../lib/auth'
import NotificationPopover from './NotificationPopover'
import bellIcon from '../assets/kepala-gudang/bell-white.svg'

export default function KepalaGudangHeader() {
  const navigate = useNavigate()
  const { unreadCount } = useWarehouse()
  const [notifOpen, setNotifOpen] = useState(false)

  // Escape menutup panel; bila tertutup, berfungsi sebagai pintasan Keluar (Esc)
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key !== 'Escape') return
      if (notifOpen) {
        setNotifOpen(false)
        return
      }
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      clearAuth()
      navigate('/login', { replace: true })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [notifOpen, navigate])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 bg-white/90 px-8 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <h1 className="text-base font-semibold leading-6 tracking-[-0.08px] text-ink">
        Halo, Kepala Gudang
      </h1>

      <button
        type="button"
        onClick={() => setNotifOpen((open) => !open)}
        aria-label={notifOpen ? 'Tutup notifikasi' : 'Buka notifikasi'}
        aria-expanded={notifOpen}
        className="relative grid size-8 shrink-0 place-items-center rounded bg-brand outline-none transition hover:bg-brand-hover focus-visible:ring-2 focus-visible:ring-brand"
      >
        <img src={bellIcon} alt="" className="h-[15px] w-auto" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 size-3 rounded-full border-2 border-white bg-[#BA1A1A]"
          />
        )}
      </button>

      {notifOpen && <NotificationPopover onClose={() => setNotifOpen(false)} />}
    </header>
  )
}
