/**
 * Field — labeled form input wrapper
 * Props: label, hint, error, required, children
 */
export function Field({ label, hint, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[13px] font-medium text-[#111827]">
          {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[12px] text-[#6B7280]">{hint}</p>}
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </div>
  )
}

/**
 * Input — styled text input
 */
export function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 ${className}`}
      {...props}
    />
  )
}

/**
 * Select — styled select input
 */
export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13.5px] text-[#111827] transition-colors focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

/**
 * Textarea — styled textarea
 */
export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-[13.5px] text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:border-[#1D4ED8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 ${className}`}
      {...props}
    />
  )
}

