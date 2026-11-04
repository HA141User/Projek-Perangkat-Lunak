/**
 * AppShell — reusable page shell (sidebar + topbar + canvas)
 * Props:
 *   menuItems   — array of { label, to }
 *   userName    — string
 *   onLogout    — function
 *   pageTitle   — string (shown in topbar)
 *   actions     — ReactNode (right side of topbar)
 *   children    — page body
 */
import Sidebar from './Sidebar'

export default function AppShell({
  menuItems,
  userName,
  onLogout,
  pageTitle,
  actions,
  children,
}) {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA] max-md:flex-col">
      <Sidebar
        items={menuItems}
        onLogout={onLogout}
        userName={userName}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#E5E7EB] bg-white px-6">
          <h1 className="text-[15px] font-semibold text-[#111827]">{pageTitle}</h1>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </header>

        {/* Canvas */}
        <main className="flex-1 px-6 py-6 max-sm:px-4">
          {children}
        </main>
      </div>
    </div>
  )
}

