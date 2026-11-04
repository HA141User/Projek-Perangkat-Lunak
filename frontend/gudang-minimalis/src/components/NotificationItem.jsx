
import { NOTIF_ICONS } from '../data/kepalaGudang'
import notifArrowIcon from '../assets/kepala-gudang/notif-arrow.svg'

export default function NotificationItem({ item, onAction }) {
  const icon = NOTIF_ICONS[item.type]

  return (
    <div
      className={`flex items-start gap-3 p-3 ${
        item.unread
          ? 'bg-[rgba(241,243,255,0.6)]'
          : 'border-t border-field bg-white'
      }`}
    >
      <div className="flex h-[38px] w-9 shrink-0 items-start pt-0.5">
        <div className={`grid size-9 place-items-center rounded-xl ${icon.tile}`}>
          <img src={icon.src} alt="" className="h-[15px] w-auto" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-[13px] leading-[19.5px] text-ink ${
              item.unread ? 'font-semibold' : 'font-medium'
            }`}
          >
            {item.title}
          </p>
          {item.unread && (
            <span
              aria-hidden="true"
              className="mt-1.5 size-2 shrink-0 rounded-full bg-[#0051D5]"
            />
          )}
        </div>

        <p className="mt-1 text-xs leading-[16.5px] tracking-[0.12px] text-muted-dark">
          {item.body}
        </p>

        <div className="mt-1.5 flex items-center justify-between gap-3">
          <span className="font-mono text-[11px] leading-[16.5px] text-muted">
            {item.time}
          </span>
          {item.action && (
            <button
              type="button"
              onClick={() => onAction(item)}
              className="flex shrink-0 items-center gap-0.5 text-[11px] font-semibold leading-[14px] tracking-[0.44px] text-brand outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand"
            >
              {item.action}
              <img src={notifArrowIcon} alt="" className="size-[8.667px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
