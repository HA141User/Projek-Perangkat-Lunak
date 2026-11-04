import { NavLink } from 'react-router'
import { LogOut, Archive } from 'lucide-react'

export default function Sidebar({ items, admin = false, onLogout, userName }) {
  return (
    <aside className="sticky top-0 flex h-screen w-[240px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white max-md:static max-md:h-auto max-md:w-full max-md:border-r-0 max-md:border-b">
      {/* 1. Header / Logo */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[#E5E7EB] px-5">
        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#0037B0] text-white">
          <Archive size={16} />
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-[13px] font-semibold leading-tight text-[#111827]">
            Gudang Minimalis
          </strong>
          <span className="block text-[11px] text-[#6B7280]">
            Sistem Inventaris
          </span>
        </div>
      </div>

      {/* 2. Navigation (takes remaining height, scrollable only if screen is tiny) */}
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-3 max-md:flex-row max-md:overflow-x-auto max-md:py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex shrink-0 items-center rounded-md px-3 py-2 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#0037B0]'
                  : 'text-[#374151] hover:bg-[#F3F4F6] hover:text-[#111827]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* 3. Bottom User Profile & Logout (always pinned at the bottom, never cut off) */}
      <div className="shrink-0 border-t border-[#E5E7EB] bg-white p-3 max-md:hidden">
        {userName && (
          <div className="mb-2 px-3 py-1">
            <p className="text-[11px] font-medium text-[#6B7280]">Masuk sebagai</p>
            <p className="truncate text-[13px] font-semibold text-[#111827]">{userName}</p>
          </div>
        )}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium text-[#374151] transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={15} aria-hidden="true" />
          Keluar
        </button>
      </div>
    </aside>
  )
}
