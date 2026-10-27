
import { Link, NavLink } from 'react-router'

export default function Sidebar({ items, admin = false }) {
  return (
    <aside className="flex min-h-screen w-[170px] shrink-0 flex-col justify-between border-r border-slate-100 bg-white px-2 py-6 max-md:min-h-0 max-md:w-full max-md:border-r-0 max-md:border-b max-md:py-3">
      <div>
        <Link
          to="/"
          className="mb-6 ml-3 flex flex-col gap-1"
        >
          <strong className="text-[11px] font-bold tracking-tight">
            Gudang Minimalis
          </strong>
          <span className="text-[8px] font-medium tracking-wider">
            SISTEM INVENTARIS
          </span>
        </Link>

        <nav className="flex flex-col gap-1 max-md:flex-row max-md:overflow-x-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                `shrink-0 rounded px-2 py-2 text-[10px] transition ${
                  isActive
                    ? 'bg-brand-hover text-white'
                    : 'text-ink hover:bg-field hover:text-brand'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Link
        to="/login"
        className="flex items-center gap-2 px-2 py-1 text-[9px] text-ink hover:text-red-600 max-md:hidden"
      >
        <span aria-hidden="true">↪</span>
        Keluar{admin ? '' : ' / Log Out'}
        {admin && (
          <span className="ml-auto text-slate-400">Esc</span>
        )}
      </Link>
    </aside>
  )
}
