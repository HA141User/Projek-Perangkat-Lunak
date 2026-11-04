/**
 * Card — standard panel wrapper
 */
export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-[#E5E7EB] bg-white ${className}`}>
      {children}
    </div>
  )
}

/**
 * CardHeader — card top section with title, description, and optional actions
 */
export function CardHeader({ title, description, actions, className = '' }) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4 ${className}`}>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-semibold text-[#111827]">{title}</h3>
        {description && (
          <p className="mt-0.5 text-[13px] text-[#6B7280]">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

/**
 * CardBody — card content area
 */
export function CardBody({ className = '', children }) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}

/**
 * KpiCard — metric display card
 */
export function KpiCard({ label, value, unit, delta, deltaGood, className = '' }) {
  return (
    <div className={`rounded-xl border border-[#E5E7EB] bg-white px-5 py-4 ${className}`}>
      <p className="text-[13px] text-[#6B7280]">{label}</p>
      <p className="mt-1 text-[28px] font-semibold leading-none text-[#111827]">
        {value}
        {unit && <span className="ml-1.5 text-[14px] font-normal text-[#6B7280]">{unit}</span>}
      </p>
      {delta && (
        <p className={`mt-2 text-[12px] font-medium ${deltaGood ? 'text-emerald-600' : 'text-red-600'}`}>
          {delta}
        </p>
      )}
    </div>
  )
}

