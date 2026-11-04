/**
 * Badge — status chip
 * variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
 */
export default function Badge({ variant = 'neutral', children, dot = false }) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger:  'bg-red-50 text-red-700 ring-red-200',
    info:    'bg-blue-50 text-blue-700 ring-blue-200',
    neutral: 'bg-[#F3F4F6] text-[#374151] ring-[#E5E7EB]',
  }

  const dots = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-blue-500',
    neutral: 'bg-gray-400',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset ${variants[variant]}`}>
      {dot && <span className={`size-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  )
}

