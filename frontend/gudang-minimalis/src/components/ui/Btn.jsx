/**
 * Btn — primary button component
 * variant: 'primary' | 'secondary' | 'danger' | 'ghost'
 * size:    'sm' | 'md' | 'lg'
 */
export default function Btn({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg'

  const variants = {
    primary:   'bg-[#0037B0] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#0037B0]',
    secondary: 'border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] focus-visible:ring-[#6B7280]',
    danger:    'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 focus-visible:ring-red-500',
    ghost:     'text-[#0037B0] hover:bg-[#EFF6FF] focus-visible:ring-[#0037B0]',
  }

  const sizes = {
    sm: 'h-8 px-3 text-[12.5px]',
    md: 'h-9 px-4 text-[13.5px]',
    lg: 'h-10 px-5 text-[14px]',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {!loading && Icon && <Icon size={14} aria-hidden />}
      {children}
      {!loading && IconRight && <IconRight size={14} aria-hidden />}
    </button>
  )
}

