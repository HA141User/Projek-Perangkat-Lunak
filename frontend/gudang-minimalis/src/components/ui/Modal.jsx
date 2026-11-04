import { X } from 'lucide-react'

/**
 * Modal — accessible dialog overlay
 * Props: open, onClose, title, subtitle, icon, iconBg, maxWidth, children, footer
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon: Icon,
  iconBg = 'bg-[#EFF6FF]',
  maxWidth = 'max-w-lg',
  children,
  footer,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className={`relative w-full ${maxWidth} rounded-xl border border-[#E5E7EB] bg-white shadow-xl`}>
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-[#E5E7EB] px-6 py-5">
          {Icon && (
            <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${iconBg} text-[#0037B0]`}>
              <Icon size={18} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-semibold text-[#111827]">{title}</h2>
            {subtitle && <p className="mt-0.5 text-[13px] text-[#6B7280]">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#111827]"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t border-[#E5E7EB] px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

