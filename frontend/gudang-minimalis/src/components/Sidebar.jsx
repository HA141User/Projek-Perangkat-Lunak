
import { Link, NavLink } from 'react-router'

export default function Sidebar({
  items,
  admin = false,
  wide = false,
  logoutIcon,
  activeStyle = 'chip',
  logoutLabel = 'Keluar / Log Out',
  logoutShortcut,
}) {
  if (wide) {
    const solid = activeStyle === 'solid'

    return (
      <aside className="flex min-h-screen w-[240px] shrink-0 flex-col justify-between bg-white px-5 py-8 shadow-[0_1px_4px_rgba(0,0,0,0.04)] max-md:min-h-0 max-md:w-full max-md:flex-row max-md:items-center max-md:justify-start max-md:gap-4 max-md:px-4 max-md:py-3">
        <div className="flex w-full flex-col gap-8 max-md:gap-3">
          <Link
            to="/"
            className="px-2 max-md:shrink-0"
          >
            <strong className="block text-base font-semibold leading-6 tracking-[-0.4px] text-ink">
              Gudang Minimalis
            </strong>
            <span className="mt-0.5 block text-[11px] font-semibold uppercase leading-[14px] tracking-[0.55px] text-muted-dark">
              Sistem Inventaris
            </span>
          </Link>

          <nav className="flex w-full flex-col gap-1 max-md:flex-row max-md:overflow-x-auto">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded px-3 py-2 text-[13px] transition ${
                    isActive
                      ? solid
                        ? 'bg-brand-hover font-medium text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)]'
                        : 'bg-chip font-normal text-brand'
                      : 'font-medium text-muted-dark hover:bg-field'
                  }`
                }
              >
                {item.icon && (
                  <img
                    src={item.icon}
                    alt=""
                    className="h-[14px] w-auto shrink-0"
                  />
                )}
                <span className="whitespace-nowrap">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <Link
          to="/login"
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-[13px] font-medium text-muted-dark transition hover:bg-field max-md:hidden"
        >
          {logoutIcon ? (
            <img
              src={logoutIcon}
              alt=""
              className="h-[13px] w-auto shrink-0"
            />
          ) : (
            <span aria-hidden="true">↪</span>
          )}
          {logoutLabel}
          {logoutShortcut && (
            <kbd className="ml-auto font-mono text-xs font-normal text-[#C4C5D7]">
              {logoutShortcut}
            </kbd>
          )}
        </Link>
      </aside>
    )
  }

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
